const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        email: {type: DataTypes.STRING, allowNull: false },
        password: {type: DataTypes.STRING, allowNull: false },
        title: {type: DataTypes.STRING, allowNull: false },
        firstName: {type: DataTypes.STRING, allowNull: false},
        lastName: {type: DataTypes.STRING, allowNull: false},
        acceptTerms: {type: DataTypes.BOOLEAN},
        role: {
            type: DataTypes.ENUM('Admin', 'User'),
            allowNull: false
        },
        verificationToken: { type: DataTypes.STRING},
        verified: {type: DataTypes.DATE},
        resetToken: {type: DataTypes.STRING},
        resetTokenExpires: {type: DataTypes.DATE},
        passwordReset: {type: DataTypes.DATE},
        created: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
        updated: {type: DataTypes.DATE},
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
    };

    const option = {
        timestamps: false,
        defaultScope: {
            attributes: { exclude: ['password']}
        },
        scopes: {
            withPassword: {attributes: {}}
        }
    };

    const Account = sequelize.define('account', attributes, option);

    // Add instance method to check verification status
    Account.prototype.getIsVerified = function() {
        return !!(this.verified || this.passwordReset);
    };

    return Account;
}
