const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RequestItem = sequelize.define('RequestItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        requestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Requests',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    RequestItem.associate = function(models) {
        RequestItem.belongsTo(models.Request, {
            foreignKey: 'requestId',
            as: 'request'
        });
    };

    return RequestItem;
}; 