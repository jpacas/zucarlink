'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables()
    const tableNames = tables.map((table) => {
      if (typeof table === 'string') {
        return table
      }
      return table.tableName || table.name
    })

    const targetTable =
      tableNames.find((name) => name && name.toLowerCase() === 'zucarias') ||
      tableNames.find((name) => name && name.toLowerCase() === 'zucaria')

    if (!targetTable) {
      await queryInterface.createTable('ZucarIAs', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        usuarioId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        messages: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      })
      return
    }

    await queryInterface.addColumn(targetTable, 'usuarioId', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables()
    const tableNames = tables.map((table) => {
      if (typeof table === 'string') {
        return table
      }
      return table.tableName || table.name
    })

    const targetTable =
      tableNames.find((name) => name && name.toLowerCase() === 'zucarias') ||
      tableNames.find((name) => name && name.toLowerCase() === 'zucaria')

    if (!targetTable) {
      throw new Error('No se encontro la tabla ZucarIA/ZucarIAs para revertir.')
    }

    await queryInterface.removeColumn(targetTable, 'usuarioId')
  },
}
