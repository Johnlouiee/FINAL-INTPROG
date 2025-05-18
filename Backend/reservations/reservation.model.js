const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Reservation = sequelize.define('Reservation', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        employeeId: { type: DataTypes.INTEGER, allowNull: false },
        resource: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false },
        status: { type: DataTypes.STRING, defaultValue: 'Pending' }
    }, {
        timestamps: false,
        tableName: 'Reservations'
    });

    return Reservation;
}; 