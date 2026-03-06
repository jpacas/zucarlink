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

module.exports = router
