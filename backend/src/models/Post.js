const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Post = sequelize.define(
  'Post',
  {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER, // Contador de vistas
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Post
