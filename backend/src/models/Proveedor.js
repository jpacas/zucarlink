const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Pais = require('./Pais')

const Proveedor = sequelize.define(
  'Proveedor',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    webpage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meses_pagados: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
)

Proveedor.belongsTo(Pais, { foreignKey: 'paisId' })
Pais.hasMany(Proveedor, { foreignKey: 'paisId' })

module.exports = Proveedor
