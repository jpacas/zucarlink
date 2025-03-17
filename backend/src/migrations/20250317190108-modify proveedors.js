'use strict'

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Renombrar 'webpage' a 'paginaWeb' (si el nombre cambia en producción)

    // 2. Agregar nuevas columnas requeridas en Versión 2

    // 3. Eliminar columnas obsoletas de Versión 1
    await queryInterface.removeColumn('Proveedors', 'fecha_vencimiento')
    await queryInterface.removeColumn('Proveedors', 'meses_pagados')
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir los cambios en caso de rollback

    // 1. Restaurar columnas eliminadas
    await queryInterface.addColumn('Proveedors', 'fecha_vencimiento', {
      type: Sequelize.DATE,
      allowNull: true,
    })

    await queryInterface.addColumn('Proveedors', 'meses_pagados', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    // 2. Eliminar columnas añadidas
    await queryInterface.removeColumn('Proveedors', 'nombrePais')
    await queryInterface.removeColumn('Proveedors', 'fechaRegistro')
    await queryInterface.removeColumn('Proveedors', 'stripeCustomerId')
    await queryInterface.removeColumn('Proveedors', 'stripeSubscriptionId')
    await queryInterface.removeColumn('Proveedors', 'stripePaymentIntentId')
    await queryInterface.removeColumn('Proveedors', 'planType')
    await queryInterface.removeColumn('Proveedors', 'estado')

    // 3. Revertir el renombramiento de 'paginaWeb' a 'webpage'
    await queryInterface.renameColumn('Proveedors', 'paginaWeb', 'webpage')
  },
}
