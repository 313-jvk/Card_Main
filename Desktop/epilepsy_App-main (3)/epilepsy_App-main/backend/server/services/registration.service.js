import bcrypt from 'bcryptjs';
import { withTransaction, query } from '../config/db.js';
import { signEmailToken } from '../config/jwt.js';
import {
  sendVerificationEmail,
  sendDoctorPendingEmail,
} from '../config/email.js';
import { notifyAssistantAssigned, notifyPatientRegistered } from './notifyDT.service.js'; // ← NOUVEAU

const SALT_ROUNDS = 12;

const trySendEmail = async (fn, label) => {
  try {
    await fn();
  } catch (err) {
    console.warn(`[registration] ${label} email failed (account still created):`, err.message);
  }
};

export const isEmailTaken = async (email) => {
  const { rows } = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows.length > 0;
};

export const patientExists = async (patientId) => {
  const { rows } = await query('SELECT id FROM patients WHERE id = $1', [patientId]);
  return rows.length > 0;
};

// ─── Finalize Patient Registration ───────────────────────────────────────────
export const finalizePatient = async (draft) => {
  const {
    email, password,
    first_name, last_name, phone_number, date_of_birth, address, city, country,
    condition, autonomy_level = 'partial', blood_type, allergies, medical_notes,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    sleep_hours_per_night, has_nap_habit, stress_level, practices_meditation,
    is_physically_active, activity_type, has_daily_walking,
    work_status, education_level, travel_frequency, has_jet_lag_sensitivity,
    eating_habit, meals_per_day, hydration_level, caffeine_consumption,
    alcohol_consumption, smoking_status, prefers_crowded_places,
    noise_sensitivity, screen_time_hours,
  } = draft;

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await withTransaction(async (client) => {
    const userResult = await client.query(
      `INSERT INTO users (role, first_name, last_name, email, password_hash, phone_number, is_active)
       VALUES ('patient', $1, $2, $3, $4, $5, false)
       RETURNING id`,
      [first_name, last_name, email.toLowerCase(), password_hash, phone_number || null]
    );
    const userId = userResult.rows[0].id;

    await client.query(
      `INSERT INTO patients (id, date_of_birth, address, city, country, condition, autonomy_level,
        blood_type, allergies, medical_notes,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        userId, date_of_birth, address || null, city || null, country || null,
        condition, autonomy_level, blood_type || null, allergies || null, medical_notes || null,
        emergency_contact_name || null, emergency_contact_phone || null, emergency_contact_relation || null,
      ]
    );

    await client.query(
      `INSERT INTO patient_lifestyle (
        patient_id, sleep_hours_per_night, has_nap_habit, stress_level, practices_meditation,
        is_physically_active, activity_type, has_daily_walking, work_status, education_level,
        travel_frequency, has_jet_lag_sensitivity, eating_habit, meals_per_day, hydration_level,
        caffeine_consumption, alcohol_consumption, smoking_status, prefers_crowded_places,
        noise_sensitivity, screen_time_hours
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        userId, sleep_hours_per_night ?? null, has_nap_habit ?? null, stress_level ?? null,
        practices_meditation ?? null, is_physically_active ?? null, activity_type ?? null,
        has_daily_walking ?? null, work_status ?? null, education_level ?? null,
        travel_frequency ?? null, has_jet_lag_sensitivity ?? null, eating_habit ?? null,
        meals_per_day ?? null, hydration_level ?? null, caffeine_consumption ?? null,
        alcohol_consumption ?? null, smoking_status ?? null, prefers_crowded_places ?? null,
        noise_sensitivity ?? null, screen_time_hours ?? null,
      ]
    );

    return { userId, role: 'patient' };
  });

  // ── NOUVEAU : sync MongoDB ────────────────────────────────
  await notifyPatientRegistered({
    pgUserId:  result.userId,
    firstName: first_name,
    lastName:  last_name,
    email:     email.toLowerCase(),
    condition,
  }).catch(err => console.warn('[DT] patient not synced:', err.message));

  await trySendEmail(async () => {
    const emailToken = signEmailToken({ userId: result.userId, purpose: 'verify_email' });
    await sendVerificationEmail(email, first_name, emailToken);
  }, 'Patient verification');

  return result;
};

// ─── Finalize Doctor Registration ─────────────────────────────────────────────
export const finalizeDoctor = async (draft) => {
  const {
    email, password,
    first_name, last_name, phone_number, biography,
    specialty, license_number, institution,
    document_urls = [],
  } = draft;

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await withTransaction(async (client) => {
    const userResult = await client.query(
      `INSERT INTO users (role, first_name, last_name, email, password_hash, phone_number, biography, is_active)
       VALUES ('doctor', $1, $2, $3, $4, $5, $6, false)
       RETURNING id`,
      [first_name, last_name, email.toLowerCase(), password_hash, phone_number || null, biography || null]
    );
    const userId = userResult.rows[0].id;

    await client.query(
      `INSERT INTO doctors (id, specialty, license_number, institution, status, document_urls)
       VALUES ($1, $2, $3, $4, 'pending', $5)`,
      [userId, specialty || null, license_number, institution || null, document_urls]
    );

    return { userId, role: 'doctor' };
  });

  await trySendEmail(async () => {
    const emailToken = signEmailToken({ userId: result.userId, purpose: 'verify_email' });
    await sendVerificationEmail(email, first_name, emailToken);
  }, 'Doctor verification');

  await trySendEmail(async () => {
    await sendDoctorPendingEmail(email, first_name);
  }, 'Doctor pending');

  return result;
};

// ─── Finalize Assistant Registration (Primary) ────────────────────────────────
export const finalizeAssistantPrimary = async (draft) => {
  const {
    email, password,
    first_name, last_name, phone_number, address, city, country,
    patient_first_name, patient_last_name, patient_date_of_birth,
    patient_address, patient_city, patient_country, patient_phone_number,
    condition, blood_type, allergies, medical_notes,
    takes_medications, emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    sleep_hours_per_night, has_nap_habit, stress_level, practices_meditation,
    is_physically_active, activity_type, has_daily_walking,
    work_status, education_level, travel_frequency, has_jet_lag_sensitivity,
    eating_habit, meals_per_day, hydration_level, caffeine_consumption,
    alcohol_consumption, smoking_status, prefers_crowded_places,
    noise_sensitivity, screen_time_hours,
  } = draft;

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await withTransaction(async (client) => {
    const assistantUserResult = await client.query(
      `INSERT INTO users (role, first_name, last_name, email, password_hash, phone_number, is_active)
       VALUES ('assistant', $1, $2, $3, $4, $5, false)
       RETURNING id`,
      [first_name, last_name, email.toLowerCase(), password_hash, phone_number || null]
    );
    const assistantUserId = assistantUserResult.rows[0].id;

    await client.query(`INSERT INTO assistants (id) VALUES ($1)`, [assistantUserId]);

    const patientPasswordHash = await bcrypt.hash(
      Math.random().toString(36) + Date.now().toString(), SALT_ROUNDS
    );
    const patientUserResult = await client.query(
      `INSERT INTO users (role, first_name, last_name, email, password_hash, phone_number, is_active)
       VALUES ('patient', $1, $2, $3, $4, $5, true)
       RETURNING id`,
      [
        patient_first_name, patient_last_name,
        `patient_${assistantUserId}_${Date.now()}@dhakira.internal`,
        patientPasswordHash,
        patient_phone_number || null,
      ]
    );
    const patientUserId = patientUserResult.rows[0].id;

    await client.query(
      `INSERT INTO patients (id, date_of_birth, address, city, country, condition, autonomy_level,
        blood_type, allergies, medical_notes,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation)
       VALUES ($1, $2, $3, $4, $5, $6, 'full', $7, $8, $9, $10, $11, $12)`,
      [
        patientUserId, patient_date_of_birth,
        patient_address || null, patient_city || null, patient_country || null,
        condition, blood_type || null, allergies || null, medical_notes || null,
        emergency_contact_name || null, emergency_contact_phone || null, emergency_contact_relation || null,
      ]
    );

    await client.query(
      `INSERT INTO patient_lifestyle (
        patient_id, sleep_hours_per_night, has_nap_habit, stress_level, practices_meditation,
        is_physically_active, activity_type, has_daily_walking, work_status, education_level,
        travel_frequency, has_jet_lag_sensitivity, eating_habit, meals_per_day, hydration_level,
        caffeine_consumption, alcohol_consumption, smoking_status, prefers_crowded_places,
        noise_sensitivity, screen_time_hours
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        patientUserId,
        sleep_hours_per_night ?? null, has_nap_habit ?? null, stress_level ?? null,
        practices_meditation ?? null, is_physically_active ?? null, activity_type ?? null,
        has_daily_walking ?? null, work_status ?? null, education_level ?? null,
        travel_frequency ?? null, has_jet_lag_sensitivity ?? null, eating_habit ?? null,
        meals_per_day ?? null, hydration_level ?? null, caffeine_consumption ?? null,
        alcohol_consumption ?? null, smoking_status ?? null, prefers_crowded_places ?? null,
        noise_sensitivity ?? null, screen_time_hours ?? null,
      ]
    );

    await client.query(
      `INSERT INTO patient_assistants (patient_id, assistant_id, assistance_type)
       VALUES ($1, $2, 'primary')`,
      [patientUserId, assistantUserId]
    );

    return { userId: assistantUserId, role: 'assistant', patientUserId, assistantUserId };
  });

  // ── NOUVEAU : sync MongoDB ────────────────────────────────
  await notifyPatientRegistered({
    pgUserId:  result.patientUserId,
    firstName: patient_first_name,
    lastName:  patient_last_name,
    email:     `patient_${result.assistantUserId}@dhakira.internal`,
    condition,
  }).catch(err => console.warn('[DT] patient not synced:', err.message));

  await notifyAssistantAssigned({
    pgUserId:    result.patientUserId,
    assistantId: result.assistantUserId,
  }).catch(err => console.warn('[DT] assign not synced:', err.message));

  await trySendEmail(async () => {
    const emailToken = signEmailToken({ userId: result.userId, purpose: 'verify_email' });
    await sendVerificationEmail(email, first_name, emailToken);
  }, 'Assistant (primary) verification');

  return result;
};

// ─── Finalize Assistant Registration (Secondary) ──────────────────────────────
export const finalizeAssistantSecondary = async (draft) => {
  const {
    email, password,
    first_name, last_name, phone_number,
    patient_id,
  } = draft;

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await withTransaction(async (client) => {
    const { rows: patientRows } = await client.query(
      'SELECT id FROM patients WHERE id = $1', [patient_id]
    );
    if (!patientRows.length) throw new Error('PATIENT_NOT_FOUND');

    const userResult = await client.query(
      `INSERT INTO users (role, first_name, last_name, email, password_hash, phone_number, is_active)
       VALUES ('assistant', $1, $2, $3, $4, $5, false)
       RETURNING id`,
      [first_name, last_name, email.toLowerCase(), password_hash, phone_number || null]
    );
    const assistantUserId = userResult.rows[0].id;

    await client.query(`INSERT INTO assistants (id) VALUES ($1)`, [assistantUserId]);

    await client.query(
      `INSERT INTO patient_assistants (patient_id, assistant_id, assistance_type)
       VALUES ($1, $2, 'secondary')`,
      [patient_id, assistantUserId]
    );

    return { userId: assistantUserId, role: 'assistant', patientUserId: patient_id, assistantUserId };
  });

  // ── NOUVEAU : sync MongoDB ────────────────────────────────
  await notifyAssistantAssigned({
    pgUserId:    result.patientUserId,
    assistantId: result.assistantUserId,
  }).catch(err => console.warn('[DT] assign not synced:', err.message));

  await trySendEmail(async () => {
    const emailToken = signEmailToken({ userId: result.userId, purpose: 'verify_email' });
    await sendVerificationEmail(email, first_name, emailToken);
  }, 'Assistant (secondary) verification');

  return result;
};