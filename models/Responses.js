const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const Responses = sequelize.define('Responses', {
  // Model attributes are defined here
  complete_name: { allowNull: false, type: DataTypes.STRING, primaryKey: true },
  confirmed: { allowNull: false, type: DataTypes.STRING },
  remarks: { allowNull: false, type: DataTypes.STRING },
  rsvp_date: { allowNull: false, type: DataTypes.DATE }
}, {
  sequelize,
  modelName: 'Responses',
  tableName: 'responses',
  timestamps: false
});

module.exports = Responses;
