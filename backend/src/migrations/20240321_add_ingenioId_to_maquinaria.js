const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Maquinaria', 'ingenioId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Ingenios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Maquinaria', 'ingenioId')
  },
}
