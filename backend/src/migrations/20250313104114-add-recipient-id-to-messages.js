'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables()
    const tableNames = tables.map((table) => {
      if (typeof table === 'string') {
        return table
      }
      return table.tableName || table.name
    })

    const messagesTable =
      tableNames.find((name) => name && name.toLowerCase() === 'messages') ||
      tableNames.find((name) => name && name.toLowerCase() === 'message')

    const conversationsTable =
      tableNames.find(
        (name) => name && name.toLowerCase() === 'conversations'
      ) ||
      tableNames.find((name) => name && name.toLowerCase() === 'conversation')

    const usersTable =
      tableNames.find((name) => name && name.toLowerCase() === 'users') ||
      tableNames.find((name) => name && name.toLowerCase() === 'user')

    if (!messagesTable || !conversationsTable || !usersTable) {
      return
    }

    // Primero agregamos la columna sin restricciones
    await queryInterface.addColumn(messagesTable, 'recipientId', {
      type: Sequelize.STRING(36),
      allowNull: true, // Temporalmente permitimos NULL
    })

    // Actualizamos los registros existentes
    // Asumimos que el recipientId será el mismo que el primer usuario de la conversación
    await queryInterface.sequelize.query(`
      UPDATE ${messagesTable} m
      JOIN ${conversationsTable} c ON m.conversationId = c.id
      SET m.recipientId = CASE
        WHEN m.senderId = c.user1Id THEN c.user2Id
        ELSE c.user1Id
      END
    `)

    // Ahora agregamos las restricciones
    await queryInterface.changeColumn(messagesTable, 'recipientId', {
      type: Sequelize.STRING(36),
      allowNull: false,
      references: {
        model: usersTable,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables()
    const tableNames = tables.map((table) => {
      if (typeof table === 'string') {
        return table
      }
      return table.tableName || table.name
    })

    const messagesTable =
      tableNames.find((name) => name && name.toLowerCase() === 'messages') ||
      tableNames.find((name) => name && name.toLowerCase() === 'message')

    if (!messagesTable) {
      return
    }

    await queryInterface.removeColumn(messagesTable, 'recipientId')
  },
}
