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
  getProviderUsers,
  forgotPassword,
  resetPassword,
} = require('../controllers/userController')
const upload = require('../middleware/multer')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', upload.single('avatar'), registerUser)
router.post('/login', loginUser)
router.post('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.get('/usuarios', authMiddleware, getAllUsers) // Nueva ruta para obtener todos los usuarios
router.get('/usuarios/:id', authMiddleware, getUserById)
router.get('/proveedor/:id', authMiddleware, getProviderUsers)
router.post(
  '/usuarios/:id/avatar',
  authMiddleware,
  upload.single('avatar'),
  uploadProfilePicture
)
router.put('/:id', authMiddleware, upload.single('avatar'), updateUserProfile)
router.put('/:id/password', authMiddleware, changeUserPassword)

module.exports = router
