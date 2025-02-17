const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Pais = sequelize.define(
  'Pais',
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

module.exports = Pais
