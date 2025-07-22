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
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Project Judgement API</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" integrity="sha512-CJ9mVYovZ9TXjPZfGCVyEvh5sKrLoEZV2Jr7w3Y7VvFpg+xke7YF3w0BevWxeFjIvYDAkUEFqRj9HoLz2OkaFg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <style>
            html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                font-family: 'Poppins', sans-serif;
                overflow: hidden;
            }

            #particles-js {
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: -1;
                background: linear-gradient(145deg, #0f2027, #203a43, #2c5364);
            }

            .container {
                position: relative;
                z-index: 10;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
                text-align: center;
                animation: fadeIn 1s ease-in;
            }

            h1 {
                font-size: 2.6rem;
                margin-bottom: 10px;
            }

            h1 i {
                margin-right: 10px;
                color: #00bfff;
                animation: float 2s ease-in-out infinite;
            }

            p {
                font-size: 1.1rem;
                margin-bottom: 30px;
            }

            a.button {
                padding: 12px 25px;
                font-size: 1rem;
                font-weight: 600;
                border-radius: 12px;
                color: #00bfff;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid #00bfff;
                text-decoration: none;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 10px;
            }

            a.button:hover {
                background-color: #00bfff;
                color: #001f3f;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,191,255,0.3);
            }

            .footer {
                position: absolute;
                bottom: 20px;
                font-size: 0.9rem;
                color: #ccc;
            }

            .footer i {
                margin-right: 6px;
                color: #00bfff;
                animation: rotate 3s linear infinite;
            }

            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }

            @keyframes rotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @media (max-width: 600px) {
                h1 { font-size: 2rem; }
                p { font-size: 1rem; }
                a.button { padding: 10px 20px; font-size: 0.9rem; }
            }
        </style>
    </head>
    <body>
        <div id="particles-js"></div>

        <div class="container">
            <h1><i class="fas fa-rocket"></i>Project Judgement API is Live</h1>
            <p>Welcome to the backend service. View full documentation below:</p>
            <a class="button" href="/api-docs" target="_blank">
                <i class="fas fa-file-alt"></i> View API Docs (Swagger UI)
            </a>
            <div class="footer"><i class="fas fa-tools"></i>Version: 1.0.0 | Build: 22 July 2025</div>
        </div>

        <!-- Particle Script -->
        <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
        <script>
          particlesJS("particles-js", {
            particles: {
              number: { value: 60, density: { enable: true, value_area: 800 } },
              color: { value: "#00bfff" },
              shape: { type: "circle" },
              opacity: { value: 0.5 },
              size: { value: 3, random: true },
              line_linked: { enable: true, distance: 150, color: "#00bfff", opacity: 0.4, width: 1 },
              move: { enable: true, speed: 2, direction: "none", out_mode: "out" }
            },
            interactivity: {
              events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" },
                resize: true
              },
              modes: {
                repulse: { distance: 100 },
                push: { particles_nb: 4 }
              }
            },
            retina_detect: true
          });
        </script>
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
