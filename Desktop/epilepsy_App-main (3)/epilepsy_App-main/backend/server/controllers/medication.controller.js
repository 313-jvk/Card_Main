import {
  resolveAndVerifyPatient,
  verifyMedicationOwnership,
  createMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
  logMedication,
  getMedicationLogs,
  getTodaySchedule,
} from '../services/medication.service.js';
import {
  createMedicationSchema,
  updateMedicationSchema,
  listMedicationsSchema,
  logMedicationSchema,
} from '../validators/medication.validators.js';

// ─── Helper: resolve patientId from request ───────────────────────────────────

const getPatientId = (req) => {
  if (req.user.role === 'patient') return req.user.id;
  return parseInt(req.params.patientId) || null;
};

// ─── POST /api/medications ────────────────────────────────────────────────────

export const createMedicationHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const paramPatientId = getPatientId(req);

    const { patientId, allowed, access_type } = await resolveAndVerifyPatient(userId, role, paramPatientId);
    if (!allowed) {
      return res.status(403).json({ error: 'You do not have access to this patient\'s data.' });
    }

    // Secondary assistants cannot create medications
    if (role === 'assistant' && access_type === 'secondary') {
      return res.status(403).json({ error: 'Partial assistants cannot create medications.' });
    }

    const parsed = createMedicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    // Doctor creating = prescriber, assistant/patient creating = no prescriber
    const prescribedBy = role === 'doctor' ? userId : null;

    const medication = await createMedication(patientId, prescribedBy, parsed.data);
    return res.status(201).json({ medication });
  } catch (err) {
    console.error('[medication] create error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── GET /api/medications ─────────────────────────────────────────────────────

export const getMedicationsHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const paramPatientId = getPatientId(req);

    const { patientId, allowed } = await resolveAndVerifyPatient(userId, role, paramPatientId);
    if (!allowed) {
      return res.status(403).json({ error: 'You do not have access to this patient\'s data.' });
    }

    const parsed = listMedicationsSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(422).json({
        error: 'Invalid query parameters.',
        details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const result = await getMedications(patientId, parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[medication] list error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── GET /api/medications/today ───────────────────────────────────────────────

export const getTodayScheduleHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const paramPatientId = getPatientId(req);

    const { patientId, allowed } = await resolveAndVerifyPatient(userId, role, paramPatientId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const schedule = await getTodaySchedule(patientId);
    return res.status(200).json({ date: new Date().toISOString().substring(0, 10), schedule });
  } catch (err) {
    console.error('[medication] today error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── GET /api/medications/:id ─────────────────────────────────────────────────

export const getMedicationByIdHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const medicationId = parseInt(req.params.id);
    const paramPatientId = getPatientId(req);

    const { patientId, allowed } = await resolveAndVerifyPatient(userId, role, paramPatientId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const medication = await getMedicationById(medicationId, patientId);
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found.' });
    }

    return res.status(200).json({ medication });
  } catch (err) {
    console.error('[medication] getById error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── PUT /api/medications/:id ─────────────────────────────────────────────────

export const updateMedicationHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const medicationId = parseInt(req.params.id);
    const paramPatientId = getPatientId(req);

    const { patientId, allowed, access_type } = await resolveAndVerifyPatient(userId, role, paramPatientId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (role === 'assistant' && access_type === 'secondary') {
      return res.status(403).json({ error: 'Partial assistants cannot edit medications.' });
    }

    const parsed = updateMedicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const updated = await updateMedication(medicationId, patientId, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'Medication not found.' });
    }

    return res.status(200).json({ medication: updated });
  } catch (err) {
    console.error('[medication] update error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── DELETE /api/medications/:id ──────────────────────────────────────────────
// Default: soft delete (is_active = false)
// ?hard=true: permanent delete

export const deleteMedicationHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const medicationId = parseInt(req.params.id);
    const paramPatientId = getPatientId(req);
    const hard = req.query.hard === 'true';

    const { patientId, allowed, access_type } = await resolveAndVerifyPatient(userId, role, paramPatientId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (role === 'assistant' && access_type === 'secondary') {
      return res.status(403).json({ error: 'Partial assistants cannot delete medications.' });
    }

    // Only doctors can hard delete
    if (hard && role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can permanently delete medication records.' });
    }

    const deleted = await deleteMedication(medicationId, patientId, hard);
    if (!deleted) {
      return res.status(404).json({ error: 'Medication not found.' });
    }

    return res.status(200).json({
      message: hard
        ? 'Medication permanently deleted.'
        : 'Medication deactivated. History preserved.',
      medication: deleted,
    });
  } catch (err) {
    console.error('[medication] delete error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── POST /api/medications/:id/log ────────────────────────────────────────────
// Patient marks a dose as taken, missed, or skipped

export const logMedicationHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const medicationId = parseInt(req.params.id);
    const paramPatientId = getPatientId(req);

    const { patientId, allowed } = await resolveAndVerifyPatient(userId, role, paramPatientId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Verify the medication belongs to this patient
    const owns = await verifyMedicationOwnership(medicationId, patientId);
    if (!owns) {
      return res.status(404).json({ error: 'Medication not found.' });
    }

    const parsed = logMedicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const log = await logMedication(patientId, medicationId, parsed.data);
    return res.status(201).json({ log });
  } catch (err) {
    console.error('[medication] log error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── GET /api/medications/:id/logs ────────────────────────────────────────────

export const getMedicationLogsHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const medicationId = parseInt(req.params.id);
    const paramPatientId = getPatientId(req);
    const days = parseInt(req.query.days) || 7;

    const { patientId, allowed } = await resolveAndVerifyPatient(userId, role, paramPatientId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const logs = await getMedicationLogs(patientId, medicationId, days);
    return res.status(200).json({ logs, days });
  } catch (err) {
    console.error('[medication] logs error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};