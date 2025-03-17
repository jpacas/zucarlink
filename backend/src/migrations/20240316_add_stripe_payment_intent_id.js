'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Proveedors', 'stripePaymentIntentId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: 'stripeSubscriptionId', // Esto coloca la columna después de stripeSubscriptionId
    })

    // Crear un índice único para la nueva columna
    await queryInterface.addIndex('Proveedors', ['stripePaymentIntentId'], {
      unique: true,
      name: 'proveedors_stripe_payment_intent_id_unique',
    })
  },

  async down(queryInterface, Sequelize) {
    // Primero eliminar el índice
    await queryInterface.removeIndex(
      'Proveedors',
      'proveedors_stripe_payment_intent_id_unique'
    )

    // Luego eliminar la columna
    await queryInterface.removeColumn('Proveedors', 'stripePaymentIntentId')
  },
}
