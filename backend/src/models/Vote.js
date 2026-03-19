const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Vote = sequelize.define('Vote', {
  postId: { type: DataTypes.INTEGER, allowNull: false },
  usuarioId: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.ENUM('post'), allowNull: false, defaultValue: 'post' },
}, { timestamps: true })

module.exports = Vote
