const cron = require('node-cron')
const {
  checkUnreadMessagesAndSendReminders,
  checkNewPostsAndSendNotifications,
} = require('./emailService')
const { indexAllPosts } = require('./embeddingService')
const Message = require('../models/Message')
const User = require('../models/User')
const Post = require('../models/Post')
const Area = require('../models/Area')

// Programar la tarea para ejecutarse cada hora
const scheduleReminderChecks = () => {
  // Verificar mensajes no leídos a las 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Ejecutando verificación de mensajes no leídos...')
    try {
      await checkUnreadMessagesAndSendReminders(Message, User)
    } catch (error) {
      console.error('Error al ejecutar verificación de recordatorios:', error)
    }
  })

  // Verificar nuevos posts a las 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('Ejecutando verificación de nuevos posts...')
    try {
      await checkNewPostsAndSendNotifications(Post, User, Area)
    } catch (error) {
      console.error('Error al ejecutar verificación de nuevos posts:', error)
    }
  })

  // Indexar posts para ZucarIA RAG a las 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Indexando posts para ZucarIA RAG...')
    try {
      const count = await indexAllPosts()
      console.log(`RAG: ${count} posts indexados`)
    } catch (error) {
      console.error('Error al indexar posts:', error)
    }
  })
}

module.exports = {
  scheduleReminderChecks,
}
