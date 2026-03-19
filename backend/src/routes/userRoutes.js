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
  refreshUserToken,
  getPublicProfile,
} = require('../controllers/userController')
const upload = require('../middleware/multer')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require('../middleware/rateLimiter')
const {
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  updateProfileValidators,
  changePasswordValidators,
} = require('../middleware/validators/userValidators')

router.get('/public/:username', getPublicProfile)
router.post('/register', registerLimiter, upload.single('avatar'), registerUser)
router.post('/login', loginLimiter, loginValidators, loginUser)
router.post('/logout', logout)
router.post('/refresh-token', refreshUserToken)
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidators, forgotPassword)
router.post('/reset-password/:token', resetPasswordLimiter, resetPasswordValidators, resetPassword)
router.get('/usuarios', authMiddleware, getAllUsers)
router.get('/usuarios/:id', authMiddleware, getUserById)
router.get('/proveedor/:id', authMiddleware, getProviderUsers)
router.post(
  '/usuarios/:id/avatar',
  authMiddleware,
  upload.single('avatar'),
  uploadProfilePicture
)
router.put('/:id', authMiddleware, upload.single('avatar'), updateProfileValidators, updateUserProfile)
router.put('/:id/password', authMiddleware, changePasswordValidators, changeUserPassword)

module.exports = router
