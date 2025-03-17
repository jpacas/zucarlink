'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Proveedors', 'paginaWeb', {
        type: Sequelize.STRING,
        allowNull: true,
      })
    } catch (error) {
      console.error('Error en la migración:', error)
      throw error
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Proveedors', 'paginaWeb')
    } catch (error) {
      console.error('Error al revertir la migración:', error)
      throw error
    }
  },
}
