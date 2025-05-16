require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const config = require('../config.json');

module.exports = db = {};

initialize();

async function initialize() {
    const { host, port, user, password, database } = config.database;

    try {
        // Create DB if it doesn't exist
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);

        // Connect to DB
        const sequelize = new Sequelize(database, user, password, {
            host,
            port,
            dialect: 'mysql',
            logging: false
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
        await sequelize.sync({ alter: true });

        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}