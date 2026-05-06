// backend/server/services/notifyDT.service.js
// Service pour notifier le Digital Twin (ton backend)

const DT_URL        = process.env.NEURATWIN_DT_URL || 'http://localhost:3000';
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN  || 'neuratwin_secret_2026';

export const notifySeizure = async ({ pgUserId, pgSeizureId, severity, seizureType, triggers, assistantId }) => {
  try {
    await fetch(`${DT_URL}/api/notifications/seizure-detected`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pg_user_id:     pgUserId,
        pg_seizure_id:  pgSeizureId,
        severity,
        seizure_type:   seizureType,
        triggers,
        assistant_id:   assistantId || null, // ← NOUVEAU
        internal_token: INTERNAL_TOKEN,
      }),
    });
  } catch (err) {
    console.warn('[DT] seizure not synced:', err.message);
  }
};

export const notifyMedicationMissed = async ({ pgUserId, medicationName, assistantId }) => {
  try {
    await fetch(`${DT_URL}/api/notifications/medication-missed`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pg_user_id:      pgUserId,
        medication_name: medicationName,
        assistant_id:    assistantId || null, // ← NOUVEAU
        internal_token:  INTERNAL_TOKEN,
      }),
    });
  } catch (err) {
    console.warn('[DT] medication not synced:', err.message);
  }
};  

export const notifyDoctorAssigned = async ({ pgUserId, doctorId }) => {
  try {
    await fetch(`${DT_URL}/api/patients/assign-doctor`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pg_user_id:    pgUserId,
        doctor_pg_id:  doctorId,
        internal_token: INTERNAL_TOKEN,
      }),
    });
    console.log('[DT] Doctor assigned synced');
  } catch (err) {
    console.warn('[DT] doctor assign not synced:', err.message);
  }
};  

export const notifySOS = async ({ pgUserId, latitude, longitude }) => {
  try {
    await fetch(`${DT_URL}/api/notifications/sos`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pg_user_id:     pgUserId,
        latitude,
        longitude,
        internal_token: INTERNAL_TOKEN,
      }),
    });
  } catch (err) {
    console.warn('[DT] SOS not synced:', err.message);
  }
};  

export const notifyAssistantAssigned = async ({ pgUserId, assistantId }) => {
  try {
    await fetch(`${DT_URL}/api/patients/assign-assistant`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pg_user_id:       pgUserId,
        assistant_pg_id:  assistantId,
        internal_token:   INTERNAL_TOKEN,
      }),
    });
    console.log('[DT] Assistant assigné synced');
  } catch (err) {
    console.warn('[DT] assign-assistant not synced:', err.message);
  }
};  