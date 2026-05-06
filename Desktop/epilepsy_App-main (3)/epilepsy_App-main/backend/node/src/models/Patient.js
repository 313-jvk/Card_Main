// backend/node/src/models/Patient.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PatientSchema = new Schema({
  pg_user_id: { type: String, required: true, unique: true },
  firstName:  { type: String, default: '' },
  lastName:   { type: String, default: '' },
  dateOfBirth: Date,
  assistant_pg_id:  { type: String, default: null }, // ← NOUVEAU  
  doctor_pg_id:    { type: String, default: null }, // ← NOUVEAU  
  push_token:       { type: String, default: null },
  emergencyContacts: [{
    name:     String,
    phone:    String,
    relation: String,
  }],
  epilepsy: {
    type:                    { type: String, enum: ['focal', 'generalized', 'unknown'], default: 'unknown' },
    diagnosisDate:           Date,
    triggers:                [String],
    averageSeizureFrequency: { type: Number, default: 0 },
    lastSeizureDate:         Date,
  },

}, { timestamps: true });

PatientSchema.index({ pg_user_id: 1 });
module.exports = mongoose.model('Patient', PatientSchema);