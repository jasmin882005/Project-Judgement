const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Drone API',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'https://project-judgement.onrender.com',  
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
        security: [{ JWTAuth: [] }],
    },
    apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
