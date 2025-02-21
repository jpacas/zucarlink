const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Post = require('./Post')

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

Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' })
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' })
Comment.belongsTo(User, { foreignKey: 'usuarioId', as: 'usuario' })
User.hasMany(Comment, { foreignKey: 'usuarioId', as: 'comments' })

module.exports = Comment
