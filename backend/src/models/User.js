const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { v4: uuidv4 } = require('uuid')

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
      allowNull: true,
    },
    proveedorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paisId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    areaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    planType: {
      type: DataTypes.ENUM('free', 'pro'),
      allowNull: false,
      defaultValue: 'free',
    },
    especialidad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    disponibilidadConsultoria: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = User
