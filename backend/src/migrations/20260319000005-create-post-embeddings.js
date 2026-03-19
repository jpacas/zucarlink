'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PostEmbeddings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      postId: { type: Sequelize.INTEGER, allowNull: false, unique: true },
      contenido: { type: Sequelize.TEXT, allowNull: false },
      embeddingVector: { type: Sequelize.TEXT('long'), allowNull: false }, // JSON array stored as text
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('PostEmbeddings')
  },
}
