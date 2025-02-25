const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Pais = require('./Pais')
const Ingenio = require('./Ingenio')
const Area = require('./Area')
const Archivo = require('./Archivo')
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
    vigente: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  }
)

Empleo.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
User.hasMany(Empleo, { foreignKey: 'usuarioId', as: 'empleos' })
Empleo.belongsTo(Pais, { foreignKey: 'paisId', as: 'paises' })
Pais.hasMany(Empleo, { foreignKey: 'paisId', as: 'empleos' })
Empleo.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
Ingenio.hasMany(Empleo, { foreignKey: 'ingenioId', as: 'empleos' })
Empleo.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
Area.hasMany(Empleo, { foreignKey: 'areaId', as: 'empleos' })

//Empleo.hasMany(Archivo, { foreignKey: 'empleoId', as: 'archivos' })
//Archivo.belongsTo(Empleo, { foreignKey: 'empleoId', as: 'empleo' })

module.exports = Empleo
