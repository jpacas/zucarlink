const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const PostEmbedding = sequelize.define('PostEmbedding', {
  postId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  contenido: { type: DataTypes.TEXT, allowNull: false },
  embeddingVector: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    get() {
      const raw = this.getDataValue('embeddingVector')
      return raw ? JSON.parse(raw) : []
    },
    set(val) {
      this.setDataValue('embeddingVector', JSON.stringify(val))
    },
  },
}, { timestamps: true })

module.exports = PostEmbedding
