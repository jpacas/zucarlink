'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Experiencias', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      ingenio: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fechaInicio: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fechaFin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cargo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      area: {
        type: Sequelize.ENUM(
          'Campo',
          'Molinos',
          'Fabrica',
          'Calderas',
          'Energia',
          'Alcohol',
          'Laboratorio',
          'Instrumentacion',
          'Mantenimiento',
          'Seguridad',
          'Medio Ambiente',
          'Recursos Humanos',
          'Otros'
        ),
        allowNull: false,
      },
      acercaDe: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Experiencias')
  },
}
