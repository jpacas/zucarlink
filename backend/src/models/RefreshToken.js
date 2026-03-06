const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'refresh_tokens',
    timestamps: true,
    indexes: [
      {
        fields: ['token'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
)

module.exports = RefreshToken
