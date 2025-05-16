module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Active'
    }
  });

  Employee.associate = function(models) {
    Employee.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'Department'
    });
    
    Employee.belongsTo(models.Account, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Employee;
}; 