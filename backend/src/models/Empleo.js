const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')

const Empleo = sequelize.define(
  'Empleo',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
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
    likes: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    comentarios: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    vistas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    categoria: {
      type: DataTypes.ENUM(
        'Campo',
        'Molinos',
        'Fabrica',
        'Calderas',
        'Energia',
        'Alcohol'
      ),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'Empleos',
  }
)

// Relación con User
Empleo.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' })

module.exports = Empleo
