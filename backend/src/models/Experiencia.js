const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Experiencia = sequelize.define(
  'Experiencia',
  {
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actualmenteTrabaja: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

module.exports = Experiencia
