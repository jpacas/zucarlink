const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')

const ZucarIA = sequelize.define(
  'ZucarIA',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    messages: {
      type: DataTypes.JSON, // Almacena los mensajes en formato JSON
      allowNull: false,
    },
  },
  {
    timestamps: true, // createdAt y updatedAt
    tableName: 'ZucarIA',
  }
)

ZucarIA.belongsTo(User, { foreignKey: 'userId', as: 'user' })

module.exports = ZucarIA
