const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Experiencia = sequelize.define(
  'Experiencia',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ingenio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    area: {
      type: DataTypes.ENUM(
        'Campo',
        'Molinos',
        'Fabrica',
        'Calderas',
        'Energia',
        'Alcohol',
        'Laboratorio',
        'Instrumentacion',
        'Mantenimiento',
        'Seguridad',
        'Medio Ambiente',
        'Recursos Humanos',
        'Otros'
      ),
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
