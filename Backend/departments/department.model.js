module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Department.associate = function(models) {
    Department.hasMany(models.Employee, {
      foreignKey: 'departmentId',
      as: 'Employees'
    });
  };

  return Department;
}; 