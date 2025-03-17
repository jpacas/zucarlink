'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Proveedors', 'estado', {
        type: Sequelize.ENUM('activo', 'inactivo', 'pendiente'),
        defaultValue: 'pendiente',
        allowNull: false,
      })
    } catch (error) {
      console.error('Error en la migración:', error)
      throw error
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Proveedors', 'estado')
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_Proveedors_estado";'
      )
    } catch (error) {
      console.error('Error al revertir la migración:', error)
      throw error
    }
  },
}
