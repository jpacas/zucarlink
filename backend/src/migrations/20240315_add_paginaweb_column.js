'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tables = await queryInterface.showAllTables()
      const tableNames = tables.map((table) => {
        if (typeof table === 'string') {
          return table
        }
        return table.tableName || table.name
      })

      const targetTable =
        tableNames.find((name) => name && name.toLowerCase() === 'proveedors') ||
        tableNames.find((name) => name && name.toLowerCase() === 'proveedores')

      if (!targetTable) {
        return
      }

      await queryInterface.addColumn(targetTable, 'paginaWeb', {
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
      const tables = await queryInterface.showAllTables()
      const tableNames = tables.map((table) => {
        if (typeof table === 'string') {
          return table
        }
        return table.tableName || table.name
      })

      const targetTable =
        tableNames.find((name) => name && name.toLowerCase() === 'proveedors') ||
        tableNames.find((name) => name && name.toLowerCase() === 'proveedores')

      if (!targetTable) {
        return
      }

      await queryInterface.removeColumn(targetTable, 'paginaWeb')
    } catch (error) {
      console.error('Error al revertir la migración:', error)
      throw error
    }
  },
}
