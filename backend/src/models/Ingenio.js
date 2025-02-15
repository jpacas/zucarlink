const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Ingenio = sequelize.define(
  'Ingenio',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pais: {
      type: DataTypes.ENUM(
        'El Salvador',
        'Guatemala',
        'Costa Rica',
        'Honduras',
        'Nicaragua',
        'Panama',
        'Belice'
      ),
      allowNull: false,
    },
    usuariosIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    tableName: 'Ingenios',
  }
)

module.exports = Ingenio
