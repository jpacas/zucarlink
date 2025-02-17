const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Pais = require('./Pais')
const Ingenio = require('./Ingenio')
const Area = require('./Area')

const Empleo = sequelize.define(
  'Empleo',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    foto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contacto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
)

Empleo.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
User.hasMany(Empleo, { foreignKey: 'usuarioId', as: 'empleos' })
Empleo.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
Pais.hasMany(Empleo, { foreignKey: 'paisId', as: 'empleos' })
Empleo.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
Ingenio.hasMany(Empleo, { foreignKey: 'ingenioId', as: 'empleos' })
Empleo.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
Area.hasMany(Empleo, { foreignKey: 'areaId', as: 'empleos' })

module.exports = Empleo
