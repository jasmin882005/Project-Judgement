const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Create Sequelize instance using PostgreSQL connection
const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,                // Enforce SSL (useful for platforms like Render)
      rejectUnauthorized: false    // Allow self-signed certificates (for development-friendly deployment)
    }
  }
});

module.exports = sequelize;
