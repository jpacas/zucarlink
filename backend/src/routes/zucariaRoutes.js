const express = require('express')
const {
  chat,
  saveConversation,
  getUserConversations,
} = require('../controllers/zucariaController')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/chat', chat) // Chat con ZucarIA (OpenAI)
router.post('/save', authMiddleware, saveConversation) // Guardar conversación
router.get('/user/:userId', authMiddleware, getUserConversations) // Obtener conversaciones de un usuario
router.post('/index-posts', authMiddleware, async (req, res) => {
  try {
    const { indexAllPosts } = require('../services/embeddingService')
    const count = await indexAllPosts()
    res.json({ message: `${count} posts indexados exitosamente` })
  } catch (error) {
    res.status(500).json({ error: 'Error al indexar posts' })
  }
})

module.exports = router
