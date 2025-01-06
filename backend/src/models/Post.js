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
    fechaCreacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: 'Posts',
  }
)

Post.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
module.exports = Post
