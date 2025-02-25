const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Pais = require('./Pais')

const Maquinaria = sequelize.define(
  'Maquinaria',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
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
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    contacto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    marca: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modelo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vistas: {
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

Maquinaria.belongsTo(User, { foreignKey: 'usuarioid', as: 'usuario' })
User.hasMany(Maquinaria, { foreignKey: 'usuarioid', as: 'maquinaria' })
Maquinaria.belongsTo(Pais, { foreignKey: 'paisid', as: 'pais' })
Pais.hasMany(Maquinaria, { foreignKey: 'paisid', as: 'maquinaria' })

module.exports = Maquinaria
