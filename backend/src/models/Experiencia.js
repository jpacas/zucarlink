const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Ingenio = require('./Ingenio')
const User = require('./User')
const Area = require('./Area')
const Pais = require('./Pais')
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
    tableName: 'Experiencias',
  }
)

Experiencia.belongsTo(User, { foreignKey: 'userId', as: 'usuarioId' })
User.hasMany(Experiencia, { foreignKey: 'userId', as: 'usuarioId' })
Experiencia.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
Ingenio.hasMany(Experiencia, { foreignKey: 'ingenioId', as: 'ingenio' })
Experiencia.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
Area.hasMany(Experiencia, { foreignKey: 'areaId', as: 'area' })
Experiencia.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
Pais.hasMany(Experiencia, { foreignKey: 'paisId', as: 'pais' })

module.exports = Experiencia
