// backend/node/src/routes/notifications.js
const router       = require('express').Router();
const DigitalTwin  = require('../models/DigitalTwin');
const Notification = require('../models/Notification');
const Patient      = require('../models/Patient');
const { sendPushToPatientAndAssistant } = require('../services/pushService');

// ─── POST /api/notifications/seizure-detected ─────────────────────────────────
router.post('/seizure-detected', async (req, res) => {
  const { pg_user_id, pg_seizure_id, severity, seizure_type,
          triggers, assistant_id, internal_token } = req.body;

  if (internal_token !== process.env.INTERNAL_TOKEN) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  if (!pg_user_id) {
    return res.status(400).json({ error: 'pg_user_id requis' });
  }

  try {
    const io      = req.app.get('io');
    const patient = await Patient.findOne({ pg_user_id: String(pg_user_id) });
    if (!patient) return res.status(404).json({ error: 'Patient non trouvé dans MongoDB' });

    // Mettre à jour le Digital Twin
    let twin = await DigitalTwin.findOne({ pg_user_id: String(pg_user_id) });
    if (!twin) {
      twin = await DigitalTwin.create({
        pg_user_id: String(pg_user_id),
        patient_id: patient._id,
      });
    }

    const impact = -((severity || 3) * 0.10);
    twin.stability_index    = Math.max(0, Math.min(1, twin.stability_index + impact));
    twin.current_risk_score = Math.min(1, twin.current_risk_score + 0.20);
    twin.seizure_count_7d  += 1;
    twin.last_seizure_at    = new Date();
    twin.model_state        = {
      ...twin.model_state,
      patient_status:    'crisis',
      last_seizure_type: seizure_type || 'unknown',
    };
    await twin.save();

    // Créer la notification dans MongoDB
    const notif = await Notification.create({
      patient_id:   patient._id,
      pg_user_id:   String(pg_user_id),
      assistant_id: assistant_id ? String(assistant_id) : null,
      alert_type:   'detection',
      message:      `Crise enregistrée — sévérité ${severity || '?'}/5 — type: ${seizure_type || 'inconnu'}`,
      risk_score:   twin.current_risk_score,
    });

    const alertPayload = {
      type:           'detection',
      source:         'manual_journal',
      notificationId: notif._id,
      pg_seizure_id,
      severity:       severity || 3,
      seizure_type:   seizure_type || 'inconnu',
      stability:      twin.stability_index,
      risk_score:     twin.current_risk_score,
      message:        `Crise enregistrée manuellement — sévérité ${severity}/5`,
      timestamp:      new Date(),
    };

    // ── Socket.io → Patient ───────────────────────────────
    io.to(String(pg_user_id)).emit('detection_alert', alertPayload);

    // ── Socket.io → Assistant ─────────────────────────────
    if (assistant_id) {
      io.to(String(assistant_id)).emit('detection_alert', {
        ...alertPayload,
        message: `Votre patient a eu une crise — sévérité ${severity}/5`,
      });
    }

    // ── Push (app fermée) → Patient + Assistant ───────────
    await sendPushToPatientAndAssistant(patient, assistant_id, {
      title: '🚨 Crise détectée',
      body:  `Sévérité ${severity}/5 — type: ${seizure_type || 'inconnu'}`,
    });

    console.log(`✅ Alerte seizure envoyée pour patient ${pg_user_id}`);
    res.json({ success: true, notif_id: notif._id });

  } catch (err) {
    console.error('❌ seizure-detected webhook:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/notifications/medication-missed ────────────────────────────────
router.post('/medication-missed', async (req, res) => {
  const { pg_user_id, medication_name, assistant_id, internal_token } = req.body;

  if (internal_token !== process.env.INTERNAL_TOKEN) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  try {
    const io      = req.app.get('io');
    const patient = await Patient.findOne({ pg_user_id: String(pg_user_id) });
    if (!patient) return res.status(404).json({ error: 'Patient non trouvé' });

    let twin = await DigitalTwin.findOne({ pg_user_id: String(pg_user_id) });
    if (twin) {
      twin.current_risk_score = Math.min(1, twin.current_risk_score + 0.10);
      twin.model_state = {
        ...twin.model_state,
        last_missed_medication: medication_name,
        patient_status: twin.current_risk_score > 0.60 ? 'alert' : 'watch',
      };
      await twin.save();
    }

    const notif = await Notification.create({
      patient_id:   patient._id,
      pg_user_id:   String(pg_user_id),
      assistant_id: assistant_id ? String(assistant_id) : null,
      alert_type:   'prediction',
      message:      `Médicament manqué : ${medication_name}`,
      risk_score:   twin?.current_risk_score || 0.5,
    });

    const alertPayload = {
      type:           'prediction',
      source:         'medication_missed',
      notificationId: notif._id,
      risk_score:     twin?.current_risk_score || 0.5,
      stability:      twin?.stability_index || 1,
      message:        `Médicament manqué : ${medication_name} — risque augmenté`,
      severity:       'warning',
      timestamp:      new Date(),
    };

    // ── Socket.io → Patient ───────────────────────────────
    io.to(String(pg_user_id)).emit('prediction_alert', alertPayload);

    // ── Socket.io → Assistant ─────────────────────────────
    if (assistant_id) {
      io.to(String(assistant_id)).emit('prediction_alert', {
        ...alertPayload,
        message: `Patient a manqué : ${medication_name}`,
      });
    }

    // ── Push (app fermée) → Patient + Assistant ───────────
    await sendPushToPatientAndAssistant(patient, assistant_id, {
      title: '💊 Médicament manqué',
      body:  `${medication_name} n'a pas été pris`,
    });

    res.json({ success: true, notif_id: notif._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/notifications/:pg_user_id ──────────────────────────────────────
router.get('/:pg_user_id', async (req, res) => {
  try {
    const notifs = await Notification.find({
      pg_user_id: req.params.pg_user_id,
    }).sort({ createdAt: -1 }).limit(20).lean();
    res.json({ success: true, notifications: notifs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});  

// GET /api/notifications/assistant/:assistant_id
// Récupère toutes les notifications liées à cet assistant
router.get('/assistant/:assistant_id', async (req, res) => {
  try {
    const notifs = await Notification.find({
      assistant_id: req.params.assistant_id,
    }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, notifications: notifs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});  

// GET /api/notifications/doctor/:doctor_pg_id
// Récupère toutes les notifications des patients du médecin
router.get('/doctor/:doctor_pg_id', async (req, res) => {
  try {
    // Trouver tous les patients de ce médecin
    const patients = await Patient.find({
      doctor_pg_id: req.params.doctor_pg_id
    }).lean();

    const pgUserIds = patients.map(p => p.pg_user_id);

    const notifs = await Notification.find({
      pg_user_id: { $in: pgUserIds },
      alert_type: 'detection', // médecin voit seulement les crises
    }).sort({ createdAt: -1 }).limit(100).lean();

    res.json({ success: true, notifications: notifs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});  

// POST /api/notifications/sos
router.post('/sos', async (req, res) => {
  const { pg_user_id, latitude, longitude, internal_token } = req.body;

  if (internal_token !== process.env.INTERNAL_TOKEN) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  try {
    const io      = req.app.get('io');
    const patient = await Patient.findOne({ pg_user_id: String(pg_user_id) });
    if (!patient) return res.status(404).json({ error: 'Patient non trouvé' });

    const notif = await Notification.create({
      patient_id:   patient._id,
      pg_user_id:   String(pg_user_id),
      assistant_id: patient.assistant_pg_id,
      alert_type:   'system',
      message:      `🆘 SOS déclenché par le patient`,
      risk_score:   1.0,
    });

    const alertPayload = {
      type:           'sos',
      notificationId: notif._id,
      pg_user_id,
      latitude,
      longitude,
      message:        '🆘 SOS — Patient en danger !',
      timestamp:      new Date(),
    };

    // Envoyer au patient
    io.to(String(pg_user_id)).emit('sos_alert', alertPayload);

    // Envoyer à l'assistant
    if (patient.assistant_pg_id) {
      io.to(String(patient.assistant_pg_id)).emit('sos_alert', alertPayload);
    }

    // Push notification urgence
    const { sendPushToPatientAndAssistant } = require('../services/pushService');
    await sendPushToPatientAndAssistant(patient, patient.assistant_pg_id, {
      title: '🆘 SOS URGENT',
      body:  'Votre patient a déclenché une alerte SOS !',
    });

    res.json({ success: true, notif_id: notif._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});  


module.exports = router;