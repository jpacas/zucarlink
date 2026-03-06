const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ZucarIA = sequelize.define(
  'ZucarIA',
  {
    usuarioId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    messages: {
      type: DataTypes.JSON, // Almacena los mensajes en formato JSON
      allowNull: false,
    },
  },
  {
    timestamps: true, // createdAt y updatedAt
  }
)

module.exports = ZucarIA
