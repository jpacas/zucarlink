const { Sequelize } = require('sequelize')
const config = require('../../config/config')['development']

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
