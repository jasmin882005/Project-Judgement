const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Create Sequelize instance using PostgreSQL connection
const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,                // Require SSL for remote DB
      rejectUnauthorized: false    // Allow self-signed certs (for Render)
    }
  }
});

module.exports = sequelize;
