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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Poppins', sans-serif;
            background: url('https://images.unsplash.com/photo-1600161287551-0d0635022f06?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') no-repeat center center fixed;
            background-size: cover;
            height: 100vh;
            color: #F8F8F8;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            position: relative;
            z-index: 1;
        }

        body::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: -1;
        }

        h1 {
            font-size: 2.8rem;
            margin-bottom: 10px;
            animation: fadeIn 1s ease-in;
        }

        p {
            font-size: 1.1rem;
            margin-bottom: 30px;
        }

        .button-group {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 30px;
        }

        a.button {
            padding: 12px 25px;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 12px;
            color: #EEEEEE;
            background: transparent;
            box-shadow: 0 5px 15px rgb(216, 217, 218, 0.1);
            border: 1px solid #EEEEEE;
            text-decoration: none;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }

        a.button:hover {
            background-color: #7F8487;
            border-color: #151515;
            color: #151515;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgb(238, 238, 238, 0.3);
        }

        .footer {
            position: absolute;
            bottom: 20px;
            font-size: 0.9rem;
            opacity: 0.8;
        }

        @media (max-width: 600px) {
            h1 {
                font-size: 2rem;
            }

            p {
                font-size: 1rem;
            }

            a.button {
                padding: 10px 20px;
                font-size: 0.9rem;
            }
        }
    </style>
</head>

<body>
    <h1>Project Judgement API is Live</h1>
    <p>Welcome to the backend service. View full documentation below:</p>

    <div class="button-group">
        <a class="button" href="/api-docs" target="_blank">
            <i class="fas fa-file-code fa-xl" style="margin-right: 10px;"></i>View API Docs
        </a>
        <a class="button" href="https://github.com/jasmin882005/Project-Judgement/tree/backend-code-submission-jasmin/backend" target="_blank">
            <i class="fab fa-github fa-xl" style="margin-right: 10px;"></i>GitHub Repo
        </a>
    </div>

    <div class="footer">Version: 1.0.0 | Build: 22 July 2025</div>
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
