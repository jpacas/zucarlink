'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      'SELECT id, email FROM Users WHERE username IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    )

    for (const user of users) {
      const base = user.email.split('@')[0].replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const suffix = Math.random().toString(36).substring(2, 6)
      const username = `${base}-${suffix}`.substring(0, 50)

      await queryInterface.sequelize.query(
        'UPDATE Users SET username = ? WHERE id = ?',
        { replacements: [username, user.id] }
      )
    }
  },
  async down(queryInterface) {
    // Cannot deterministically reverse username assignment
  },
}
