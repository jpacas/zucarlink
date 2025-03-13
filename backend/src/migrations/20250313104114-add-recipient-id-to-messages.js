'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero agregamos la columna sin restricciones
    await queryInterface.addColumn('Messages', 'recipientId', {
      type: Sequelize.STRING(36),
      allowNull: true, // Temporalmente permitimos NULL
    })

    // Actualizamos los registros existentes
    // Asumimos que el recipientId será el mismo que el primer usuario de la conversación
    await queryInterface.sequelize.query(`
      UPDATE Messages m
      JOIN Conversations c ON m.conversationId = c.id
      SET m.recipientId = CASE
        WHEN m.senderId = c.user1Id THEN c.user2Id
        ELSE c.user1Id
      END
    `)

    // Ahora agregamos las restricciones
    await queryInterface.changeColumn('Messages', 'recipientId', {
      type: Sequelize.STRING(36),
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'recipientId')
  },
}
