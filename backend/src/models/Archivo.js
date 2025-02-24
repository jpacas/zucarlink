const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Post = require('./Post')

const Archivo = sequelize.define('Archivo', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
})

module.exports = Archivo
