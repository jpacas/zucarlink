'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'slug')
  },
}
