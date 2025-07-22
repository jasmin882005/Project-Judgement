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
        url: 'https://project-judgement.onrender.com',  // Render base URL
        description: 'Render Deployed Server',
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
    },
    security: [{ JWTAuth: [] }], // Applies JWTAuth globally
  },
  apis: ['./routes/*.js'], // Scan all route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
