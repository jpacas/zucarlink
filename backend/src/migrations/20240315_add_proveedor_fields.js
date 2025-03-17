'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Proveedors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      paisNombre: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'pais',
      },
      paginaWeb: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo', 'pendiente'),
        defaultValue: 'pendiente',
      },
      fechaRegistro: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      stripeCustomerId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stripeSubscriptionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      planType: {
        type: Sequelize.ENUM('month', 'year'),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Proveedors')
  },
}
