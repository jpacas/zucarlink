'use strict'

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Renombrar 'webpage' a 'paginaWeb' (si el nombre cambia en producción)
    await queryInterface.renameColumn('Proveedors', 'webpage', 'paginaWeb')

    // 2. Agregar nuevas columnas requeridas en Versión 2
    await queryInterface.addColumn('Proveedors', 'nombrePais', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'Desconocido', // Valor por defecto si no hay datos previos
    })

    await queryInterface.addColumn('Proveedors', 'fechaRegistro', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW, // Usa la fecha actual como valor por defecto
    })

    await queryInterface.addColumn('Proveedors', 'stripeCustomerId', {
      type: Sequelize.STRING(255),
      allowNull: true,
    })

    await queryInterface.addColumn('Proveedors', 'stripeSubscriptionId', {
      type: Sequelize.STRING(255),
      allowNull: true,
    })

    await queryInterface.addColumn('Proveedors', 'stripePaymentIntentId', {
      type: Sequelize.STRING(255),
      allowNull: true,
    })

    await queryInterface.addColumn('Proveedors', 'planType', {
      type: Sequelize.ENUM('month', 'year'),
      allowNull: true,
    })

    await queryInterface.addColumn('Proveedors', 'estado', {
      type: Sequelize.ENUM('activo', 'inactivo', 'pendiente'),
      allowNull: true,
      defaultValue: 'pendiente', // Valor por defecto para nuevos registros
    })

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
