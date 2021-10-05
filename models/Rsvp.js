const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const Otp = sequelize.define('Rsvp', {
  // Model attributes are defined here
  mobile_number: { allowNull: false, type: DataTypes.STRING },
  otp: { allowNull: false, type: DataTypes.STRING }
}, {
  sequelize,
  modelName: 'Rsvp',
  tableName: 'Rsvp'
});

module.exports = Rsvp;
