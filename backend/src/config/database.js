const { Sequelize } = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

if (!config) {
  throw new Error(`No database config found for NODE_ENV=${env}`)
}

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: config.logging,
  }
)

module.exports = sequelize
