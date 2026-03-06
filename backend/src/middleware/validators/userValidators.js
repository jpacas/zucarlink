const { body, param, validationResult } = require('express-validator')

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Error de validación',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    })
  }
  next()
}

// Validadores para registro
const registerValidators = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage('El nombre solo puede contener letras'),

  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage('El apellido solo puede contener letras'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('El email es demasiado largo'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),

  body('telefono')
    .optional()
    .trim()
    .matches(/^[\d\s\-+()]+$/).withMessage('Teléfono inválido')
    .isLength({ max: 20 }).withMessage('El teléfono es demasiado largo'),

  body('paisId')
    .notEmpty().withMessage('El país es requerido')
    .isInt({ min: 1 }).withMessage('País inválido'),

  body('ingenioId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Ingenio inválido'),

  body('areaId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Área inválida'),

  body('proveedorId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Proveedor inválido'),

  body('acercaDe')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('La descripción es demasiado larga'),

  handleValidationErrors,
]

// Validadores para login
const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),

  handleValidationErrors,
]

// Validadores para forgot password
const forgotPasswordValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  handleValidationErrors,
]

// Validadores para reset password
const resetPasswordValidators = [
  param('token')
    .notEmpty().withMessage('Token requerido')
    .isLength({ min: 20 }).withMessage('Token inválido'),

  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),

  handleValidationErrors,
]

// Validadores para actualizar perfil
const updateProfileValidators = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de usuario inválido'),

  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage('El nombre solo puede contener letras'),

  body('apellido')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage('El apellido solo puede contener letras'),

  body('acercaDe')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('La descripción es demasiado larga'),

  handleValidationErrors,
]

// Validadores para cambiar contraseña
const changePasswordValidators = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de usuario inválido'),

  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es requerida'),

  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),

  handleValidationErrors,
]

module.exports = {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  updateProfileValidators,
  changePasswordValidators,
  handleValidationErrors,
}
