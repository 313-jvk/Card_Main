import {
  checkSeizureAccess,
  getSeizureOwnership,
  createSeizure,
  getSeizures,
  getSeizureById,
  updateSeizure,
  deleteSeizure,
  getFrequency,
  getTriggers,
  getAverageDuration,
} from '../services/seizure.service.js';
import {
  createSeizureSchema,
  updateSeizureSchema,
  listSeizuresSchema,
} from '../validators/seizure.validators.js';
import { notifySeizure } from '../services/notifyDT.service.js';
import { query } from '../config/db.js'; // ← NOUVEAU

// ─── Helper: resolve patientId from request ───────────────────────────────────
const resolvePatientId = (req) => {
  const { id: userId, role } = req.user;
  if (role === 'patient') return userId;
  return parseInt(req.params.patientId) || null;
};

// ─── POST /api/seizures ───────────────────────────────────────────────────────

export const createSeizureHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const patientId = resolvePatientId(req);

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }

    const { allowed, access_type } = await checkSeizureAccess(userId, role, patientId);
    if (!allowed) {
      return res.status(403).json({ error: 'You do not have access to this patient\'s data.' });
    }

    const parsed = createSeizureSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const seizure = await createSeizure(patientId, userId, parsed.data);

    // ── NOUVEAU : récupérer l'assistant du patient ────────────────────────────
    const { rows: assistantRows } = await query(
      `SELECT assistant_id FROM patient_assistants
       WHERE patient_id = $1 AND unassigned_at IS NULL
       LIMIT 1`,
      [patientId]
    );
    const assistantId = assistantRows[0]?.assistant_id || null;
    // ─────────────────────────────────────────────────────────────────────────

    try {
      await notifySeizure({
        pgUserId:    patientId,
        pgSeizureId: seizure.id,
        severity:    parsed.data.severity,
        seizureType: parsed.data.seizure_type,
        triggers: {
          stress:            parsed.data.trigger_stress,
          sleep_deprivation: parsed.data.trigger_sleep_deprivation,
          missed_medication: parsed.data.trigger_missed_medication,
        },
        assistantId, // ← NOUVEAU
      });
      console.log('[DT] Notification envoyée au Jumeau Numérique');
    } catch (notifyErr) {
      console.warn('[DT] Impossible de notifier le Jumeau Numérique:', notifyErr.message);
    }

    return res.status(201).json({ seizure });
  } catch (err) {
    console.error('[seizure] create error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── GET /api/seizures ────────────────────────────────────────────────────────

export const getSeizuresHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const patientId = resolvePatientId(req);

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }

    const { allowed } = await checkSeizureAccess(userId, role, patientId);
    if (!allowed) {
      return res.status(403).json({ error: 'You do not have access to this patient\'s data.' });
    }

    const parsed = listSeizuresSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(422).json({
        error: 'Invalid query parameters.',
        details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const result = await getSeizures(patientId, parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[seizure] list error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── GET /api/seizures/:id ────────────────────────────────────────────────────

export const getSeizureByIdHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const seizureId = parseInt(req.params.id);
    const patientId = resolvePatientId(req);

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }

    const { allowed } = await checkSeizureAccess(userId, role, patientId);
    if (!allowed) {
      return res.status(403).json({ error: 'You do not have access to this patient\'s data.' });
    }

    const seizure = await getSeizureById(seizureId, patientId);
    if (!seizure) {
      return res.status(404).json({ error: 'Seizure record not found.' });
    }

    return res.status(200).json({ seizure });
  } catch (err) {
    console.error('[seizure] getById error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── PUT /api/seizures/:id ────────────────────────────────────────────────────

export const updateSeizureHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const seizureId = parseInt(req.params.id);
    const patientId = resolvePatientId(req);

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }

    const { allowed, access_type } = await checkSeizureAccess(userId, role, patientId);
    if (!allowed) {
      return res.status(403).json({ error: 'You do not have access to this patient\'s data.' });
    }

    if (role === 'assistant' && access_type === 'secondary') {
      return res.status(403).json({
        error: 'Partial assistants cannot edit seizure records.',
      });
    }

    if (role === 'doctor') {
      return res.status(403).json({
        error: 'Doctors cannot edit seizure records.',
      });
    }

    const parsed = updateSeizureSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const existing = await getSeizureOwnership(seizureId, patientId);
    if (!existing) {
      return res.status(404).json({ error: 'Seizure record not found.' });
    }

    const updated = await updateSeizure(seizureId, patientId, parsed.data);
    return res.status(200).json({ seizure: updated });
  } catch (err) {
    console.error('[seizure] update error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── DELETE /api/seizures/:id ─────────────────────────────────────────────────

export const deleteSeizureHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const seizureId = parseInt(req.params.id);
    const patientId = resolvePatientId(req);

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }

    const { allowed, access_type } = await checkSeizureAccess(userId, role, patientId);
    if (!allowed) {
      return res.status(403).json({ error: 'You do not have access to this patient\'s data.' });
    }

    if (role === 'assistant' && access_type === 'secondary') {
      return res.status(403).json({
        error: 'Partial assistants cannot delete seizure records.',
      });
    }

    if (role === 'doctor') {
      return res.status(403).json({
        error: 'Doctors cannot delete seizure records.',
      });
    }

    const deleted = await deleteSeizure(seizureId, patientId);
    if (!deleted) {
      return res.status(404).json({ error: 'Seizure record not found.' });
    }

    return res.status(200).json({ message: 'Seizure record deleted successfully.' });
  } catch (err) {
    console.error('[seizure] delete error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getFrequencyHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const patientId = resolvePatientId(req);
    if (!patientId) return res.status(400).json({ error: 'Patient ID is required.' });
    const { allowed } = await checkSeizureAccess(userId, role, patientId);
    if (!allowed) return res.status(403).json({ error: 'Access denied.' });
    const period = req.query.period === 'month' ? 'month' : 'week';
    const weeks  = parseInt(req.query.weeks) || 12;
    const data = await getFrequency(patientId, period, weeks);
    return res.status(200).json({ analytics: data });
  } catch (err) {
    console.error('[seizure] frequency error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getTriggersHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const patientId = resolvePatientId(req);
    if (!patientId) return res.status(400).json({ error: 'Patient ID is required.' });
    const { allowed } = await checkSeizureAccess(userId, role, patientId);
    if (!allowed) return res.status(403).json({ error: 'Access denied.' });
    const data = await getTriggers(patientId);
    return res.status(200).json({ analytics: data });
  } catch (err) {
    console.error('[seizure] triggers error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getSummaryHandler = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const patientId = resolvePatientId(req);
    if (!patientId) return res.status(400).json({ error: 'Patient ID is required.' });
    const { allowed } = await checkSeizureAccess(userId, role, patientId);
    if (!allowed) return res.status(403).json({ error: 'Access denied.' });
    const data = await getAverageDuration(patientId);
    return res.status(200).json({ analytics: data });
  } catch (err) {
    console.error('[seizure] summary error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};