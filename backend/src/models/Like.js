const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Like = sequelize.define(
  'Like',
  {
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'Likes',
  }
)

module.exports = Like
