'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. Verificar si la tabla existe
      const tableExists = await queryInterface
        .showAllTables()
        .then((tables) => tables.includes('Proveedors'))

      if (!tableExists) {
        // Si la tabla no existe, la creamos desde cero
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
          nombrePais: {
            type: Sequelize.STRING,
            allowNull: false,
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
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
          paisId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'Pais',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
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
        return
      }

      // 2. Obtener información de las columnas existentes
      const tableInfo = await queryInterface.describeTable('Proveedors')

      // 3. Eliminar columnas que no están en el modelo
      const columnsToRemove = ['fecha_vencimiento', 'meses_pagados', 'webpage']
      for (const column of columnsToRemove) {
        if (tableInfo[column]) {
          await queryInterface.removeColumn('Proveedors', column)
        }
      }

      // 4. Añadir o modificar columnas según el modelo
      if (!tableInfo.fechaRegistro) {
        await queryInterface.addColumn('Proveedors', 'fechaRegistro', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        })
      }

      if (!tableInfo.stripeCustomerId) {
        await queryInterface.addColumn('Proveedors', 'stripeCustomerId', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      }

      if (!tableInfo.stripeSubscriptionId) {
        await queryInterface.addColumn('Proveedors', 'stripeSubscriptionId', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      }

      if (!tableInfo.planType) {
        await queryInterface.addColumn('Proveedors', 'planType', {
          type: Sequelize.ENUM('month', 'year'),
          allowNull: true,
        })
      }

      // 5. Modificar el tipo de datos de estado si es necesario
      if (tableInfo.estado && tableInfo.estado.type !== 'ENUM') {
        // Primero eliminamos la columna existente
        await queryInterface.removeColumn('Proveedors', 'estado')

        // Luego la volvemos a crear con el tipo correcto
        await queryInterface.addColumn('Proveedors', 'estado', {
          type: Sequelize.ENUM('activo', 'inactivo', 'pendiente'),
          defaultValue: 'pendiente',
        })
      }

      // 6. Asegurarse de que las restricciones de nulidad sean correctas
      if (tableInfo.nombre && tableInfo.nombre.allowNull !== false) {
        await queryInterface.changeColumn('Proveedors', 'nombre', {
          type: Sequelize.STRING,
          allowNull: false,
        })
      }

      if (tableInfo.email && tableInfo.email.allowNull !== false) {
        await queryInterface.changeColumn('Proveedors', 'email', {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        })
      }

      if (tableInfo.nombrePais && tableInfo.nombrePais.allowNull !== false) {
        await queryInterface.changeColumn('Proveedors', 'nombrePais', {
          type: Sequelize.STRING,
          allowNull: false,
        })
      }
    } catch (error) {
      console.error('Error en la migración:', error)
      throw error
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Revertir los cambios es complicado, ya que hemos eliminado columnas
      // Aquí podríamos restaurar las columnas eliminadas si fuera necesario
      const tableInfo = await queryInterface.describeTable('Proveedors')

      if (!tableInfo.fecha_vencimiento) {
        await queryInterface.addColumn('Proveedors', 'fecha_vencimiento', {
          type: Sequelize.DATE,
          allowNull: true,
        })
      }

      if (!tableInfo.meses_pagados) {
        await queryInterface.addColumn('Proveedors', 'meses_pagados', {
          type: Sequelize.INTEGER,
          allowNull: true,
        })
      }

      if (!tableInfo.webpage) {
        await queryInterface.addColumn('Proveedors', 'webpage', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      }

      // Eliminar las columnas que añadimos
      if (tableInfo.stripeCustomerId) {
        await queryInterface.removeColumn('Proveedors', 'stripeCustomerId')
      }

      if (tableInfo.stripeSubscriptionId) {
        await queryInterface.removeColumn('Proveedors', 'stripeSubscriptionId')
      }

      if (tableInfo.planType) {
        await queryInterface.removeColumn('Proveedors', 'planType')
      }
    } catch (error) {
      console.error('Error al revertir la migración:', error)
      throw error
    }
  },
}
