const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')

const ZucarIA = sequelize.define(
  'ZucarIA',
  {
    messages: {
      type: DataTypes.JSON, // Almacena los mensajes en formato JSON
      allowNull: false,
    },
  },
  {
    timestamps: true, // createdAt y updatedAt
  }
)

ZucarIA.belongsTo(User, { foreignKey: 'usuarioId', as: 'user' })
User.hasMany(ZucarIA, { foreignKey: 'usuarioId', as: 'zucarIA' })

module.exports = ZucarIA
