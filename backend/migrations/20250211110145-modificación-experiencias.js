'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Experiencias', 'actualmenteTrabaja', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })

    await queryInterface.changeColumn('Experiencias', 'fechaFin', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Experiencias', 'actualmenteTrabaja')

    await queryInterface.changeColumn('Experiencias', 'fechaFin', {
      type: Sequelize.DATE,
      allowNull: false,
    })
  },
}
