const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Ingenio = require('./Ingenio')
const User = require('./User')
const Area = require('./Area')

const Experiencia = sequelize.define(
  'Experiencia',
  {
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: true, // Permitir valores nulos
    },
    actualmenteTrabaja: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Falso por defecto
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    acercaDe: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
)

Experiencia.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Experiencia, { foreignKey: 'userId' })
Experiencia.belongsTo(Ingenio, { foreignKey: 'ingenioId' })
Ingenio.hasMany(Experiencia, { foreignKey: 'ingenioId' })
Experiencia.belongsTo(Area, { foreignKey: 'areaId' })
Area.hasMany(Experiencia, { foreignKey: 'areaId' })

module.exports = Experiencia
