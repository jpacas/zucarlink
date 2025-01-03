const express = require('express')
const {
  registerUser,
  getAllUsers,
  getUserById,
} = require('../controllers/userController')
const { loginUser, logout } = require('../controllers/authController')
const { uploadProfilePicture } = require('../controllers/profileController')
const upload = require('../middleware/multer')
const router = express.Router()

router.post('/register', upload.single('avatar'), registerUser)
router.post('/login', loginUser)
router.post('/logout', logout)
router.get('/usuarios', getAllUsers) // Nueva ruta para obtener todos los usuarios
router.get('/usuarios/:id', getUserById)
router.post(
  '/usuarios/:id/avatar',
  upload.single('avatar'),
  uploadProfilePicture
)

module.exports = router
