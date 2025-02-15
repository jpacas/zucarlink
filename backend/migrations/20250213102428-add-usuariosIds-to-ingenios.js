'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Ingenios', 'usuariosIds', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Ingenios', 'usuariosIds')
  },
}
