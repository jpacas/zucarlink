'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Proveedors', 'logo', {
        type: Sequelize.STRING,
        allowNull: true,
      })
    } catch (error) {
      console.error('Error al añadir la columna logo:', error)
      throw error
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Proveedors', 'logo')
    } catch (error) {
      console.error('Error al eliminar la columna logo:', error)
      throw error
    }
  },
}
