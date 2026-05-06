// node/src/services/pushService.js
const { Expo } = require('expo-server-sdk');
const Patient  = require('../models/Patient');

const expo = new Expo();

const sendPush = async (token, title, body) => {
  if (!token || !Expo.isExpoPushToken(token)) return;
  try {
    await expo.sendPushNotificationsAsync([{
      to:    token,
      sound: 'default',
      title,
      body,
      data:  { type: 'alert' },
    }]);
    console.log(`📲 Push envoyé → ${token}`);
  } catch (err) {
    console.warn('Push error:', err.message);
  }
};

exports.sendPushToPatientAndAssistant = async (patient, assistantPgId, { title, body }) => {
  // Push au patient
  if (patient.push_token) {
    await sendPush(patient.push_token, title, body);
  }
  // Push à l'assistant
  if (assistantPgId) {
    const assistant = await Patient.findOne({ pg_user_id: String(assistantPgId) });
    if (assistant?.push_token) {
      await sendPush(
        assistant.push_token,
        `[Assistant] ${title}`,
        body
      );
    }
  }
};