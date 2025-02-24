const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Area = require('./Area')
const Archivo = require('./Archivo')
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

Post.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
User.hasMany(Post, { foreignKey: 'usuarioId', as: 'posts' })
Post.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
Area.hasOne(Post, { foreignKey: 'areaId', as: 'posts' })

Archivo.belongsTo(Post, {
  foreignKey: {
    name: 'postId',
    allowNull: false,
  },
})
Post.hasMany(Archivo, {
  foreignKey: 'postId',
  as: 'archivos',
})

//Post.belongsTo(Archivo, { foreignKey: 'archivoId', as: 'archivos' })
//Archivo.hasMany(Post, { foreignKey: 'postId', as: 'post' })

module.exports = Post
