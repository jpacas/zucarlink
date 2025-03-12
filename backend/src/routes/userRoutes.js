const express = require('express')
const {
  registerUser,
  getAllUsers,
  getUserById,
  updateUserProfile,
  changeUserPassword,
  uploadProfilePicture,
  loginUser,
  logout,
} = require('../controllers/userController')
const upload = require('../middleware/multer')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', upload.single('avatar'), registerUser)
router.post('/login', loginUser)
router.post('/logout', logout)
router.get('/usuarios', authMiddleware, getAllUsers) // Nueva ruta para obtener todos los usuarios
router.get('/usuarios/:id', authMiddleware, getUserById)
router.post(
  '/usuarios/:id/avatar',
  authMiddleware,
  upload.single('avatar'),
  uploadProfilePicture
)
router.put('/:id', authMiddleware, upload.single('avatar'), updateUserProfile)
router.put('/:id/password', authMiddleware, changeUserPassword)

module.exports = router
