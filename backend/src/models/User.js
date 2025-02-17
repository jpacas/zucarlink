const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { v4: uuidv4 } = require('uuid')
const Ingenio = require('./Ingenio')
const Pais = require('./Pais')
const Area = require('./Area')
const Proveedor = require('./Proveedor')

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: uuidv4,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    acercaDe: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ingenioId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ✅ Debe permitir valores nulos
    },
    proveedorId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ✅ Debe permitir valores nulos
    },
  },
  {
    timestamps: true,
  }
)

User.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
Pais.hasMany(User, { foreignKey: 'paisId' })
User.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
Ingenio.hasMany(User, { foreignKey: 'ingenioId' })
User.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
Area.hasMany(User, { foreignKey: 'areaId' })
User.belongsTo(Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' })
Proveedor.hasMany(User, { foreignKey: 'proveedorId' })

module.exports = User
