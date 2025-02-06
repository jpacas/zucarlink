const express = require('express')
const {
  saveConversation,
  getUserConversations,
} = require('../controllers/zucariaController')
const router = express.Router()

router.post('/save', saveConversation) // Guardar conversación
router.get('/user/:userId', getUserConversations) // Obtener conversaciones de un usuario

module.exports = router
