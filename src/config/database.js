const { Sequelize } = require("sequelize");
require("dotenv").config();

// Use DATABASE_URL if available (Railway/cloud providers), otherwise use individual variables
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: false,
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          timestamps: true,
          underscored: false,
        },
      }
    );

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    console.error(
      "Please check your .env file and ensure PostgreSQL is running"
    );
    return false;
  }
};

module.exports = { sequelize, testConnection };
