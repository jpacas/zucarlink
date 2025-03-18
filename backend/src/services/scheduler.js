const cron = require('node-cron')
const { checkUnreadMessagesAndSendReminders } = require('./emailService')
const Message = require('../models/Message')
const User = require('../models/User')

// Programar la tarea para ejecutarse cada hora
const scheduleReminderChecks = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Ejecutando verificación de mensajes no leídos...')
    try {
      await checkUnreadMessagesAndSendReminders(Message, User)
    } catch (error) {
      console.error('Error al ejecutar verificación de recordatorios:', error)
    }
  })
}

module.exports = {
  scheduleReminderChecks,
}
