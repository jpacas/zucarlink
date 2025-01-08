const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')

const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    categoria: {
      type: DataTypes.ENUM(
        'Campo',
        'Molinos',
        'Fabrica',
        'Calderas',
        'Energia',
        'Alcohol'
      ),
      allowNull: false,
    },
    likes: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Likes must be an array')
          }
        },
      },
    },
    comments: {
      type: DataTypes.JSON, // Lista de comentarios
      defaultValue: [],
    },
    views: {
      type: DataTypes.INTEGER, // Contador de vistas
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: 'Posts',
  }
)

// Relación con User
Post.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
module.exports = Post
