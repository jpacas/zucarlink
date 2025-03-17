'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Proveedors', 'nombrePais', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '', // Proporcionamos un valor por defecto para las filas existentes
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Proveedors', 'nombrePais')
  },
}
