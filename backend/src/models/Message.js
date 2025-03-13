const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    senderId: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
    recipientId: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Message
