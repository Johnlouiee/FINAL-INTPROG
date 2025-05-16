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

    const connectionConfig = {
        host,
        port,
        user,
        password,
        ssl: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        }
    };

    try {
        // Create DB if it doesn't exist
        const connection = await mysql.createConnection(connectionConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);

        // Connect to DB
        const sequelize = new Sequelize(database, user, password, {
            host,
            port,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            dialectOptions: {
                ssl: {
                    rejectUnauthorized: false,
                    minVersion: 'TLSv1.2'
                }
            },
            // Add these options to handle the deprecation warning
            ssl: true,
            dialectModule: mysql
        });

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

        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1); // Exit if database connection fails
    }
}