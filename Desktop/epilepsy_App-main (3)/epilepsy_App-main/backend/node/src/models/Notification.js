// backend/node/src/models/Notification.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  patient_id:   { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  pg_user_id:   { type: String, required: true },
  assistant_id: { type: String, default: null }, // ← NOUVEAU
  alert_type:   { type: String, enum: ['detection', 'prediction', 'system', 'model_updated'], required: true },
  message:      { type: String, required: true },
  risk_score:   { type: Number, default: null },
  read:         { type: Boolean, default: false },
  fcm_sent:     { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ pg_user_id: 1, createdAt: -1 });
NotificationSchema.index({ assistant_id: 1, createdAt: -1 }); // ← NOUVEAU : pour récupérer les notifs de l'assistant
module.exports = mongoose.model('Notification', NotificationSchema);