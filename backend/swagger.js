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
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'jasmin@example.com' },
            password: { type: 'string', example: 'mysecurepassword' },
          },
        },
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
      },
    },
    security: [{ JWTAuth: [] }],
  },
  apis: ['./routes/*.js'], // Scans all routes
};

const specs = swaggerJsdoc(options);
module.exports = { swaggerUi, specs };
