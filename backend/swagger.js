const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drone API',
      version: '1.0.0',
      description: 'API documentation for the Drone Management system (Judgement Project)',
    },
    servers: [
      {
        url: 'https://project-judgement.onrender.com',
        description: 'Render Deployed Server',
      },
      {
        url: 'https://localhost:5000',
        description: 'Local HTTPS Development Server',
      },
    ],
    components: {
      securitySchemes: {
        JWTAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Signup
        SignupRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: { type: 'string', example: 'Jasmin Jamadar' },
            email: { type: 'string', example: 'jasmin@example.com' },
            password: { type: 'string', example: 'mysecurepassword' },
            role: {
              type: 'string',
              enum: ['admin', 'operator'],
              example: 'operator',
            },
          },
        },

        // Login
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'jasmin@example.com' },
            password: { type: 'string', example: 'mysecurepassword' },
          },
        },

        // Refresh
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },

        // Logs
        LogInput: {
          type: 'object',
          required: ['event'],
          properties: {
            droneId: { type: 'string', example: 'DRN-001' },
            event: { type: 'string', example: 'Battery low warning' },
            type: {
              type: 'string',
              enum: ['info', 'warning', 'error'],
              example: 'warning',
            },
            action: { type: 'string', example: 'FAILED_LOGIN' },
            source: { type: 'string', example: 'authController' },
          },
        },

        LogEntry: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 42 },
            droneId: { type: 'string', example: 'DRN-001' },
            event: { type: 'string', example: 'Battery low warning' },
            action: { type: 'string', example: 'FAILED_LOGIN' },
            userId: { type: 'integer', example: 3 },
            type: { type: 'string', example: 'warning' },
            createdBy: { type: 'string', example: 'admin@system.com' },
            source: { type: 'string', example: 'authController' },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-07-24T12:00:00.000Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-07-24T12:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-07-24T12:00:00.000Z',
            },
          },
        },

        //Alerts Input
        AlertInput: {
  type: 'object',
  required: ['message', 'level', 'droneId'],
  properties: {
    message: { type: 'string', example: 'Battery below 20%' },
    level: { type: 'string', example: 'warning' },
    droneId: { type: 'string', example: 'DRN-002' },
    timestamp: {
      type: 'string',
      format: 'date-time',
      example: '2025-07-11T10:30:00Z',
    },
  },
},

        // Command Input
        CommandInput: {
          type: 'object',
          required: ['droneId', 'command'],
          properties: {
            droneId: { type: 'string', example: 'DR-101' },
            command: {
              type: 'string',
              enum: ['abort', 'reroute', 'return', 'move', 'takeoff', 'land'],
              example: 'abort',
            },
          },
        },

        // Telemetry Input
        TelemetryInput: {
          type: 'object',
          required: ['droneId', 'gps', 'altitude', 'speed', 'battery'],
          properties: {
            droneId: { type: 'string', example: 'DRN-003' },
            gps: {
              type: 'object',
              properties: {
                lat: { type: 'number', example: 22.57 },
                lng: { type: 'number', example: 88.36 },
              },
            },
            altitude: { type: 'number', example: 150.5 },
            speed: { type: 'number', example: 35.8 },
            battery: { type: 'number', example: 78 },
          },
        },

        // Drone Input
        DroneInput: {
          type: 'object',
          required: ['droneId', 'status', 'battery'],
          properties: {
            droneId: { type: 'string', example: 'DRN-001' },
            model: { type: 'string', example: 'DJI Mavic 3' },
            status: { type: 'string', example: 'active' },
            battery: { type: 'number', example: 87 },
            gps_location: {
              type: 'object',
              properties: {
                lat: { type: 'number', example: 22.57 },
                lng: { type: 'number', example: 88.36 },
              },
            },
          },
        },
      },
    },
    security: [{ JWTAuth: [] }],
  },

  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = { swaggerUi, specs };
