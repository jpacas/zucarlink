const express = require('express')
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
} = require('../controllers/userController')
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/usuarios', getAllUsers) // Nueva ruta para obtener todos los usuarios
router.get('/usuarios/:id', getUserById)

// Logout del usuario
router.post('/logout', (req, res) => {
  // Opcional: limpia la sesión o token si tienes lógica en el servidor
  res.status(200).json({ message: 'Logout exitoso' })
})

module.exports = router
