const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Pais = require('./Pais')

const Ingenio = sequelize.define(
  'Ingenio',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
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

Ingenio.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
Pais.hasMany(Ingenio, { foreignKey: 'paisId', as: 'ingenios' })

module.exports = Ingenio
