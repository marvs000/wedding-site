const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const Rsvp = sequelize.define('Rsvp', {
  // Model attributes are defined here
  complete_name: { allowNull: false, type: DataTypes.STRING },
  confirmed: { allowNull: false, type: DataTypes.STRING },
  suggestions: { allowNull: true, type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'Rsvp',
  tableName: 'rsvp'
});

module.exports = Rsvp;
