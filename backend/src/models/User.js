const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { v4: uuidv4 } = require('uuid') // Importa la función para generar IDs únicos

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.STRING, // Cambiamos a STRING
      primaryKey: true,
      defaultValue: uuidv4, // Genera un ID único automáticamente
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
      unique: true, // Evita duplicados
      validate: {
        isEmail: true, // Validación para correos electrónicos
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Incluye createdAt y updatedAt
    tableName: 'Users', // Nombre de la tabla en la base de datos
  }
)

module.exports = User
