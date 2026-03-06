'use strict'

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Renombrar 'webpage' a 'paginaWeb' (si el nombre cambia en producción)

    // 2. Agregar nuevas columnas requeridas en Versión 2

    // 3. Eliminar columnas obsoletas de Versión 1
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

    try {
      await queryInterface.removeColumn(targetTable, 'fecha_vencimiento')
    } catch (error) {
      console.log('La columna fecha_vencimiento no existía')
    }

    try {
      await queryInterface.removeColumn(targetTable, 'meses_pagados')
    } catch (error) {
      console.log('La columna meses_pagados no existía')
    }
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

    // Revertir los cambios en caso de rollback

    // 1. Restaurar columnas eliminadas
    await queryInterface.addColumn(targetTable, 'fecha_vencimiento', {
      type: Sequelize.DATE,
      allowNull: true,
    })

    await queryInterface.addColumn(targetTable, 'meses_pagados', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    // 2. Eliminar columnas añadidas
    await queryInterface.removeColumn(targetTable, 'nombrePais')
    await queryInterface.removeColumn(targetTable, 'fechaRegistro')
    await queryInterface.removeColumn(targetTable, 'stripeCustomerId')
    await queryInterface.removeColumn(targetTable, 'stripeSubscriptionId')
    await queryInterface.removeColumn(targetTable, 'stripePaymentIntentId')
    await queryInterface.removeColumn(targetTable, 'planType')
    await queryInterface.removeColumn(targetTable, 'estado')

    // 3. Revertir el renombramiento de 'paginaWeb' a 'webpage'
    await queryInterface.renameColumn(targetTable, 'paginaWeb', 'webpage')
  },
}
