// backend/node/server.js
require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const connectDB  = require('./src/config/database');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] }
});

// Connexion MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.set('io', io);

// Routes
app.use('/api/patients',       require('./src/routes/patients'));
app.use('/api/muse',           require('./src/routes/muse'));
app.use('/api/eeg',            require('./src/routes/eeg'));
app.use('/api/digital-twin',   require('./src/routes/digitalTwin'));
app.use('/api/daily-log',      require('./src/routes/dailyLog'));
app.use('/api/notifications',  require('./src/routes/notifications')); 

// Socket.io
io.on('connection', (socket) => {
  console.log('📱 Client connecté:', socket.id);

  socket.on('join_patient_room', (pg_user_id) => {
    socket.join(String(pg_user_id));
    console.log(`👤 Patient ${pg_user_id} rejoint sa room`);
  });

  socket.on('disconnect', () => {
    console.log('📴 Déconnecté:', socket.id);
  });
});

// Connecter Node.js → Flask via Socket.io
const AlertService = require('./src/services/alertService');
const alertService = new AlertService(io);
alertService.connect();

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 NeuroCare Node.js — port ${PORT}`);
});

module.exports = { io };