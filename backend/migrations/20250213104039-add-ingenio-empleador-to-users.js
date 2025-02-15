'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'ingenio', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addColumn('Users', 'empleador', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'ingenio')
    await queryInterface.removeColumn('Users', 'empleador')
  },
}
