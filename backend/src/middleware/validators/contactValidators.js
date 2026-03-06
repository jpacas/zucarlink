const { body, validationResult } = require('express-validator')

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

// Sanitizar texto para prevenir inyección
const sanitizeText = (value) => {
  if (!value) return value
  return value
    .replace(/<[^>]*>/g, '') // Eliminar HTML tags
    .replace(/javascript:/gi, '')
    .trim()
}

// Validadores para formulario de contacto
const contactValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage('El nombre solo puede contener letras')
    .customSanitizer(sanitizeText),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('El email es demasiado largo'),

  body('message')
    .trim()
    .notEmpty().withMessage('El mensaje es requerido')
    .isLength({ min: 10, max: 5000 }).withMessage('El mensaje debe tener entre 10 y 5000 caracteres')
    .customSanitizer(sanitizeText),

  handleValidationErrors,
]

module.exports = {
  contactValidators,
  handleValidationErrors,
}
