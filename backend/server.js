// Importing required modules
const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const responseTime = require('response-time');
const performanceLogger = require('./middlewares/performanceLogger');
require('dotenv').config();

const app = express();

// Load SSL Certificates
let server;

if (process.env.NODE_ENV === 'production') {
  // On Render or other hosting, use default HTTP (Render adds HTTPS)
  server = require('http').createServer(app);
  console.log('Production mode: using HTTP (Render handles HTTPS)');
} else {
  try {
    const sslOptions = {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem')
    };
    server = https.createServer(sslOptions, app);
    console.log('Local HTTPS server running');
  } catch (err) {
    server = http.createServer(app);
    console.warn('Local SSL certs not found. Falling back to HTTP');
  }
}

// WebSocket setup
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('WebSocket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected:', socket.id);
  });
});

// Global Middleware
app.use(cors());
app.use(helmet());
app.use(responseTime());
app.use(express.json());
app.use(performanceLogger);

// Optional: Root GET route to fix "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Project Judgement API is running. Visit /api-docs for Swagger UI.');
});

// Routes
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const privateRoutes = require('./routes/privateRoutes');
const missionRoutes = require('./routes/missionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const commandRoutes = require('./routes/commandRoutes');
const logRoutes = require('./routes/logRoutes');
const droneRoutes = require('./routes/droneRoutes');

const { swaggerUi, specs } = require('./swagger');
const errorHandler = require('./middlewares/errorHandler');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/private', privateRoutes);
app.use('/api/v1/missions', missionRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/commands', commandRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/drones', droneRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Global Error Handler
app.use(errorHandler);

// DB sync & Start server
sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL Connected');
    return sequelize.sync();
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server + WebSocket running on ${server instanceof https.Server ? 'HTTPS' : 'HTTP'} at port ${PORT}`);
    });
  })
  .catch(err => console.error('DB Connection Error:', err));
