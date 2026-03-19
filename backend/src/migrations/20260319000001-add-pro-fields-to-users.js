'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'planType', {
      type: Sequelize.ENUM('free', 'pro'),
      allowNull: false,
      defaultValue: 'free',
    })
    await queryInterface.addColumn('Users', 'especialidad', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('Users', 'disponibilidadConsultoria', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'disponibilidadConsultoria')
    await queryInterface.removeColumn('Users', 'especialidad')
    await queryInterface.removeColumn('Users', 'planType')
    await queryInterface.sequelize
      .query('DROP TYPE IF EXISTS "enum_Users_planType";')
      .catch(() => {})
  },
}
