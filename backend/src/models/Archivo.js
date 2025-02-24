const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Archivo = sequelize.define('Archivo', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

module.exports = Archivo
