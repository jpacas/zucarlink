'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WikiArticulos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      titulo: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      contenidoMarkdown: { type: Sequelize.TEXT('long'), allowNull: false },
      resumen: { type: Sequelize.STRING(500), allowNull: true },
      categoria: { type: Sequelize.ENUM('Fabricación', 'Maquinaria', 'Agronomía', 'Laboratorio', 'Electricidad', 'Administración', 'General'), allowNull: false, defaultValue: 'General' },
      autorId: { type: Sequelize.STRING, allowNull: false },
      vistas: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WikiArticulos')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_WikiArticulos_categoria";').catch(() => {})
  },
}
