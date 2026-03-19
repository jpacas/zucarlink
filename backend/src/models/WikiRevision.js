const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const WikiRevision = sequelize.define('WikiRevision', {
  articuloId: { type: DataTypes.INTEGER, allowNull: false },
  usuarioId: { type: DataTypes.STRING, allowNull: false },
  contenidoMarkdown: { type: DataTypes.TEXT('long'), allowNull: false },
  resumen: { type: DataTypes.STRING(500), allowNull: true },
}, { timestamps: true })

module.exports = WikiRevision
