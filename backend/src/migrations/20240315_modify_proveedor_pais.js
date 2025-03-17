'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Primero intentamos eliminar la columna si existe
      try {
        await queryInterface.removeColumn('Proveedors', 'pais')
      } catch (error) {
        console.log('La columna pais no existía')
      }

      try {
        await queryInterface.removeColumn('Proveedors', 'nombrePais')
      } catch (error) {
        console.log('La columna nombrePais no existía')
      }

      // Luego agregamos la nueva columna
      await queryInterface.addColumn('Proveedors', 'nombrePais', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      })
    } catch (error) {
      console.error('Error en la migración:', error)
      throw error
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Proveedors', 'nombrePais')
    } catch (error) {
      console.error('Error al revertir la migración:', error)
      throw error
    }
  },
}
