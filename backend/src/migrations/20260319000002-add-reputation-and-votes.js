'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'reputacion', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    })

    await queryInterface.createTable('Votes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      postId: { type: Sequelize.INTEGER, allowNull: false },
      usuarioId: { type: Sequelize.STRING, allowNull: false },
      tipo: { type: Sequelize.ENUM('post'), allowNull: false, defaultValue: 'post' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    })

    await queryInterface.addConstraint('Votes', {
      fields: ['postId', 'usuarioId'],
      type: 'unique',
      name: 'unique_vote_per_user_post',
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Votes')
    await queryInterface.removeColumn('Users', 'reputacion')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Votes_tipo";').catch(() => {})
  },
}
