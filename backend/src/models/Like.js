const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Post = require('./Post')
const Maquinaria = require('./Maquinaria')
const Empleo = require('./Empleo')

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

User.hasMany(Like, { foreignKey: 'usuarioId', as: 'likes' })
Like.belongsTo(User, { foreignKey: 'usuarioId', as: 'usuario' })
Maquinaria.hasMany(Like, { foreignKey: 'maquinariaId', as: 'likes' })
Like.belongsTo(Maquinaria, { foreignKey: 'maquinariaId', as: 'maquinaria' })
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' })
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' })
Empleo.hasMany(Like, { foreignKey: 'empleoId', as: 'likes' })
Like.belongsTo(Empleo, { foreignKey: 'empleoId', as: 'empleo' })

module.exports = Like
