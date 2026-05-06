// server/services/medicationCron.service.js
import cron from 'node-cron';
import pool from '../config/db.js';
import { notifyMedicationMissed } from './notifyDT.service.js';

const generateDailyLogs = async () => {
  console.log('[CRON] Génération des logs pending du jour...');
  try {
    const today = new Date().toISOString().substring(0, 10);
    const dayOfWeek = new Date().getDay();

    const { rows: schedules } = await pool.query(
      `SELECT
         ms.id        AS schedule_id,
         ms.medication_id,
         ms.scheduled_time,
         m.patient_id,
         m.start_date,
         m.end_date
       FROM medication_schedules ms
       JOIN medications m ON m.id = ms.medication_id
       WHERE m.is_active = true
         AND (m.start_date IS NULL OR m.start_date <= $1)
         AND (m.end_date   IS NULL OR m.end_date   >= $1)
         AND (ms.day_of_week IS NULL OR ms.day_of_week = $2)`,
      [today, dayOfWeek]
    );

    for (const s of schedules) {
      const scheduledFor = `${today} ${s.scheduled_time}`;
      await pool.query(
        `INSERT INTO medication_logs
           (medication_id, patient_id, schedule_id, scheduled_for, status)
         VALUES ($1, $2, $3, $4, 'pending')
         ON CONFLICT DO NOTHING`,
        [s.medication_id, s.patient_id, s.schedule_id, scheduledFor]
      );
    }
    console.log(`[CRON] ${schedules.length} log(s) pending générés pour ${today}`);
  } catch (err) {
    console.error('[CRON] Erreur génération logs:', err.message);
  }
};

const checkMissedMedications = async () => {
  console.log('[CRON] Vérification médicaments manqués...');
  try {
    const { rows: missedLogs } = await pool.query(
      `SELECT
         ml.id,
         ml.patient_id,
         ml.medication_id,
         ml.scheduled_for,
         m.drug_name
       FROM medication_logs ml
       JOIN medications m ON m.id = ml.medication_id
       WHERE ml.status = 'pending'
         AND ml.scheduled_for < NOW()
         AND m.is_active = true`
    );

    if (missedLogs.length === 0) return;

    for (const log of missedLogs) {
      // Marquer missed
      await pool.query(
        `UPDATE medication_logs SET status = 'missed' WHERE id = $1`,
        [log.id]
      );

      // Récupérer l'assistant du patient
      const { rows: assistantRows } = await pool.query(
        `SELECT assistant_id FROM patient_assistants
         WHERE patient_id = $1 AND unassigned_at IS NULL
         LIMIT 1`,
        [log.patient_id]
      );
      const assistantId = assistantRows[0]?.assistant_id || null;

      // Notifier node/ → Socket.io → Patient + Assistant
      await notifyMedicationMissed({
        pgUserId:       log.patient_id,
        medicationName: log.drug_name,
        assistantId,
      });

      console.log(`[CRON] Patient ${log.patient_id} — ${log.drug_name} missed.`);
    }
  } catch (err) {
    console.error('[CRON] Erreur check missed:', err.message);
  }
};

export const startMedicationCron = () => {
  cron.schedule('0 0 * * *', generateDailyLogs);
  cron.schedule('*/15 * * * *', checkMissedMedications);
  generateDailyLogs(); // Générer immédiatement au démarrage
  console.log('✅ Medication cron démarré');
};