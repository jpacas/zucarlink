const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Comment = sequelize.define(
  'Comment',
  {
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Comment
