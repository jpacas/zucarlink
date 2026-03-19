const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const WikiArticulo = sequelize.define('WikiArticulo', {
  titulo: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  contenidoMarkdown: { type: DataTypes.TEXT('long'), allowNull: false },
  resumen: { type: DataTypes.STRING(500), allowNull: true },
  categoria: {
    type: DataTypes.ENUM('Fabricación', 'Maquinaria', 'Agronomía', 'Laboratorio', 'Electricidad', 'Administración', 'General'),
    allowNull: false, defaultValue: 'General'
  },
  autorId: { type: DataTypes.STRING, allowNull: false },
  vistas: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true })

module.exports = WikiArticulo
