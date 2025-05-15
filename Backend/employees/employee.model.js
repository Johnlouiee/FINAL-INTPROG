module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
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

  return Employee;
}; 