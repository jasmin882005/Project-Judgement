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

//Project Judgement API is Live
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Judgement API</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            body {
                height: 100vh;
                font-family: 'Poppins', sans-serif;
                background: radial-gradient(circle at top, #0f2027, #203a43, #2c5364);
                display: flex;
                justify-content: center;
                align-items: center;
                color: #ffffff;
                overflow: hidden;
            }

            .card {
                background: rgba(255, 255, 255, 0.05);
                padding: 3rem 2.5rem;
                border-radius: 20px;
                box-shadow: 0 0 20px rgba(0, 191, 255, 0.3);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(0, 191, 255, 0.25);
                text-align: center;
                animation: fadeIn 1.2s ease;
                max-width: 90%;
            }

            .card h1 {
                font-size: 2.6rem;
                margin-bottom: 1rem;
                background: linear-gradient(90deg, #00bfff, #1e90ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .card p {
                font-size: 1.15rem;
                margin-bottom: 2rem;
                color: #e0f7fa;
            }

            .button {
                padding: 12px 28px;
                font-size: 1rem;
                font-weight: 600;
                border-radius: 15px;
                color: #00bfff;
                background: transparent;
                border: 2px solid #00bfff;
                text-decoration: none;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .button:hover {
                background-color: #00bfff;
                color: #001f3f;
                box-shadow: 0 8px 24px rgba(0,191,255,0.3);
                transform: translateY(-3px);
            }

            .footer {
                margin-top: 2rem;
                font-size: 0.85rem;
                color: #aaa;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }

            @media (max-width: 600px) {
                .card h1 { font-size: 2rem; }
                .card p { font-size: 1rem; }
                .button { padding: 10px 20px; font-size: 0.9rem; }
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Project Judgement API is Live</h1>
            <p>Welcome to the backend service. View full documentation below:</p>
            <a class="button" href="/api-docs" target="_blank">View API Docs (Swagger UI)</a>
            <div class="footer">Version: 1.0.0 | Build: 22 July 2025</div>
        </div>
    </body>
    </html>
  `);
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
