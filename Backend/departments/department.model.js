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
  }, {
    timestamps: true, // Enable timestamps
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  Department.associate = function(models) {
    Department.hasMany(models.Employee, {
      foreignKey: 'departmentId',
      as: 'Employees'
    });
  };

  return Department;
}; 