const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        token: { type: DataTypes.STRING },
        expires: { type: DataTypes.DATE },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdByIp: { type: DataTypes.STRING },
        revoked: { type: DataTypes.DATE },
        revokedByIp: { type: DataTypes.STRING },
        replacedByToken: { type: DataTypes.STRING },
        isExpired: { type: DataTypes.BOOLEAN, defaultValue: false },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false
    };

    const RefreshToken = sequelize.define('refreshToken', attributes, options);

    // Add instance methods
    RefreshToken.prototype.getIsExpired = function() {
        return Date.now() >= this.expires;
    };

    RefreshToken.prototype.getIsActive = function() {
        return !this.revoked && !this.getIsExpired();
    };

    return RefreshToken;
}