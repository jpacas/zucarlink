const { DataTypes } = require('sequelize')

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
      tableNames.find(
        (name) => name && name.toLowerCase() === 'maquinaria'
      ) ||
      tableNames.find(
        (name) => name && name.toLowerCase() === 'maquinarias'
      )

    if (!targetTable) {
      return
    }

    await queryInterface.addColumn(targetTable, 'ingenioId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Ingenios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
      tableNames.find(
        (name) => name && name.toLowerCase() === 'maquinaria'
      ) ||
      tableNames.find(
        (name) => name && name.toLowerCase() === 'maquinarias'
      )

    if (!targetTable) {
      return
    }

    await queryInterface.removeColumn(targetTable, 'ingenioId')
  },
}
