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
        tableNames.find(
          (name) => name && name.toLowerCase() === 'proveedors'
        ) ||
        tableNames.find(
          (name) => name && name.toLowerCase() === 'proveedores'
        )

      if (!targetTable) {
        return
      }

      // Primero intentamos eliminar la columna si existe
      try {
        await queryInterface.removeColumn(targetTable, 'pais')
      } catch (error) {
        console.log('La columna pais no existía')
      }

      try {
        await queryInterface.removeColumn(targetTable, 'nombrePais')
      } catch (error) {
        console.log('La columna nombrePais no existía')
      }

      // Luego agregamos la nueva columna
      await queryInterface.addColumn(targetTable, 'nombrePais', {
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
      const tables = await queryInterface.showAllTables()
      const tableNames = tables.map((table) => {
        if (typeof table === 'string') {
          return table
        }
        return table.tableName || table.name
      })

      const targetTable =
        tableNames.find(
          (name) => name && name.toLowerCase() === 'proveedors'
        ) ||
        tableNames.find(
          (name) => name && name.toLowerCase() === 'proveedores'
        )

      if (!targetTable) {
        return
      }

      await queryInterface.removeColumn(targetTable, 'nombrePais')
    } catch (error) {
      console.error('Error al revertir la migración:', error)
      throw error
    }
  },
}
