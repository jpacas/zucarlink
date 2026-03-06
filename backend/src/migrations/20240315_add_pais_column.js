'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
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

    await queryInterface.addColumn(targetTable, 'nombrePais', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '', // Proporcionamos un valor por defecto para las filas existentes
    })
  },

  down: async (queryInterface, Sequelize) => {
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

    await queryInterface.removeColumn(targetTable, 'nombrePais')
  },
}
