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
    pais: {
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
      allowNull: true,
    },
    acercaDe: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipoUsuario: {
      type: DataTypes.ENUM('Ingenio', 'Proveedor'),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'Users',
  }
)

module.exports = User

// ✅ IMPORTA `Experiencia` DESPUÉS DE EXPORTAR `User`
const Experiencia = require('./Experiencia')
User.hasMany(Experiencia, { foreignKey: 'userId', as: 'experiencias' })
