require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const config = require('../config.json');

module.exports = db = {};

initialize();

async function initialize() {
    const host = process.env.DB_HOST || config.database.host;
    const port = process.env.DB_PORT || config.database.port;
    const user = process.env.DB_USER || config.database.user;
    const password = process.env.DB_PASSWORD || config.database.password;
    const database = process.env.DB_NAME || config.database.database;

    try {
        // Create DB if it doesn't exist
        const connection = await mysql.createConnection({
            host,
            port,
            user,
            password,
            ssl: false // Disable SSL for initial connection
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await connection.end();

        // Connect to DB with Sequelize
        const sequelize = new Sequelize(database, user, password, {
            host,
            port,
            dialect: 'mysql',
            logging: false,
            dialectModule: mysql,
            dialectOptions: {
                ssl: false // Disable SSL for Sequelize connection
            },
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        });

        // Test the connection
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Initialize models
        db.Account = require('../accounts/account.model')(sequelize);
        db.RefreshToken = require('../accounts/refresh-token.model.js')(sequelize);
        db.Employee = require('../employees/employee.model')(sequelize, Sequelize);
        db.Department = require('../departments/department.model')(sequelize, Sequelize);

        // Set up associations
        Object.keys(db).forEach(modelName => {
            if (db[modelName].associate) {
                db[modelName].associate(db);
            }
        });

        // Sync models
        await sequelize.sync({ alter: false });

        console.log('Database models synchronized successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1); // Exit if database connection fails
    }
}