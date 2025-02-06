'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear tabla Empleos
    await queryInterface.createTable('Empleos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      foto: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contacto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      likes: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      comentarios: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      vistas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      categoria: {
        type: Sequelize.ENUM(
          'Campo',
          'Molinos',
          'Fabrica',
          'Calderas',
          'Energia',
          'Alcohol'
        ),
        allowNull: false,
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

    // Crear tabla Maquinaria
    await queryInterface.createTable('Maquinaria', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      foto: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      precio: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      contacto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      likes: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      comentarios: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      vistas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      categoria: {
        type: Sequelize.ENUM(
          'Campo',
          'Molinos',
          'Fabrica',
          'Calderas',
          'Energia',
          'Alcohol'
        ),
        allowNull: false,
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

    // Crear tabla ZucarIA
    await queryInterface.createTable('ZucarIA', {
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
      messages: {
        type: Sequelize.JSON,
        allowNull: false,
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
    await queryInterface.dropTable('Empleos')
    await queryInterface.dropTable('Maquinaria')
    await queryInterface.dropTable('ZucarIA')
  },
}
