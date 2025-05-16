require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'department_management';

    try {
        // Create DB if it doesn't exist
        const connection = await mysql.createConnection({ host, port, user, password });
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
            }
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