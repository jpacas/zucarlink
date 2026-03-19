'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'username')
  },
}
