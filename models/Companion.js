const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const Companion = sequelize.define('Companion', {
  // Model attributes are defined here
  parent_id: { allowNull: false, type: DataTypes.INTEGER },
  complete_name: { allowNull: false, type: DataTypes.STRING }
}, {
  sequelize,
  modelName: 'Companion',
  tableName: 'companion'
});

module.exports = Companion;
