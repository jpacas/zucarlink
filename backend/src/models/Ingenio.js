const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Ingenio = sequelize.define(
  'Ingenio',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    webpage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'Ingenios',
  }
)

module.exports = Ingenio
