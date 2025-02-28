const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Noticia = sequelize.define(
  'Noticia',
  {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    resumen: {
      type: DataTypes.STRING,
    },
    fuente: {
      type: DataTypes.STRING,
    },
    urlFuente: {
      type: DataTypes.STRING,
    },
    destacada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Noticia
