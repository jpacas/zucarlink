'use strict'

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('Users', 'areaTrabajo', {
      type: DataTypes.ENUM(
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
    })

    await queryInterface.addColumn('Users', 'acercaDe', {
      type: DataTypes.STRING,
      allowNull: true,
    })

    await queryInterface.createTable('Experiencias', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      UserId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      ingenio: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fechaInicio: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fechaFin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cargo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      areaTrabajo: {
        type: DataTypes.ENUM(
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
        type: DataTypes.STRING,
        allowNull: true,
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.removeColumn('Users', 'areaTrabajo')
    await queryInterface.removeColumn('Users', 'acercaDe')
    await queryInterface.dropTable('Experiencias')
  },
}
