// backend/node/src/routes/patients.js
const router  = require('express').Router();
const Patient = require('../models/Patient');

router.post('/', async (req, res) => {
  try {
    const { pg_user_id, firstName, lastName } = req.body;
    let patient = await Patient.findOne({ pg_user_id });
    if (!patient) {
      patient = await Patient.create({ pg_user_id, firstName, lastName });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:pg_user_id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ pg_user_id: req.params.pg_user_id });
    if (!patient) return res.status(404).json({ error: 'Non trouvé' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});  

// POST /api/patients/push-token
router.post('/push-token', async (req, res) => {
  const { pg_user_id, push_token } = req.body;

  try {
    await Patient.findOneAndUpdate(
      { pg_user_id: String(pg_user_id) },
      { push_token },
      { new: true }
    );
    console.log(`📲 Push token sauvegardé pour patient ${pg_user_id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});  

// POST /api/patients/assign-assistant
router.post('/assign-assistant', async (req, res) => {
  const { pg_user_id, assistant_pg_id, internal_token } = req.body;
  if (internal_token !== process.env.INTERNAL_TOKEN) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  try {
    await Patient.findOneAndUpdate(
      { pg_user_id: String(pg_user_id) },
      { assistant_pg_id: String(assistant_pg_id) },
      { new: true }
    );
    console.log(`👥 Assistant ${assistant_pg_id} assigné au patient ${pg_user_id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});  

// POST /api/patients/assign-doctor
router.post('/assign-doctor', async (req, res) => {
  const { pg_user_id, doctor_pg_id, internal_token } = req.body;
  if (internal_token !== process.env.INTERNAL_TOKEN) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  try {
    await Patient.findOneAndUpdate(
      { pg_user_id: String(pg_user_id) },
      { doctor_pg_id: String(doctor_pg_id) },
      { new: true }
    );
    console.log(`👨‍⚕️ Médecin ${doctor_pg_id} assigné au patient ${pg_user_id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});  



module.exports = router;