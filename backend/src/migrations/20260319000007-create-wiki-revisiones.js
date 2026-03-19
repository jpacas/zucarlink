'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WikiRevisiones', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      articuloId: { type: Sequelize.INTEGER, allowNull: false },
      usuarioId: { type: Sequelize.STRING, allowNull: false },
      contenidoMarkdown: { type: Sequelize.TEXT('long'), allowNull: false },
      resumen: { type: Sequelize.STRING(500), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('WikiRevisiones')
  },
}
