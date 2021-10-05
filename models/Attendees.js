const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const Attendees = sequelize.define('Attendees', {
  // Model attributes are defined here
  lastname: { allowNull: false, type: DataTypes.STRING },
  firstname: { allowNull: false, type: DataTypes.STRING },
  mi: { allowNull: true, type: DataTypes.STRING },
  role: { allowNull: false, type: DataTypes.STRING },
  company: { allowNull: true, type: DataTypes.INTEGER }
}, {
  sequelize,
  modelName: 'Attendees',
  tableName: 'attendees'
});

module.exports = Attendees;
