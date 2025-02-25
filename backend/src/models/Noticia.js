const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Pais = require('./Pais')

module.exports = (sequelize, DataTypes) => {
  const Noticia = sequelize.define('Noticia', {
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
  })

  Noticia.associate = (models) => {
    Noticia.belongsTo(models.User, {
      foreignKey: 'usuarioId',
      as: 'autor',
    })
    Noticia.hasMany(models.Archivo, {
      foreignKey: 'noticiaId',
      as: 'archivos',
    })
  }

  return Noticia
}
