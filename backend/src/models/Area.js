const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Area = sequelize.define(
  'Area',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
)

module.exports = Area
