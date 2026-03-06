const { body, param, query, validationResult } = require('express-validator')

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

// Sanitizar HTML peligroso
const sanitizeHtml = (value) => {
  if (!value) return value
  // Eliminar tags de script y eventos on*
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

// Validadores para crear post
const createPostValidators = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ min: 5, max: 200 }).withMessage('El título debe tener entre 5 y 200 caracteres')
    .customSanitizer(sanitizeHtml),

  body('contenido')
    .trim()
    .notEmpty().withMessage('El contenido es requerido')
    .isLength({ min: 10, max: 10000 }).withMessage('El contenido debe tener entre 10 y 10000 caracteres')
    .customSanitizer(sanitizeHtml),

  body('area')
    .notEmpty().withMessage('El área es requerida')
    .isInt({ min: 1 }).withMessage('Área inválida'),

  handleValidationErrors,
]

// Validadores para actualizar post
const updatePostValidators = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de post inválido'),

  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('El título debe tener entre 5 y 200 caracteres')
    .customSanitizer(sanitizeHtml),

  body('contenido')
    .optional()
    .trim()
    .isLength({ min: 10, max: 10000 }).withMessage('El contenido debe tener entre 10 y 10000 caracteres')
    .customSanitizer(sanitizeHtml),

  handleValidationErrors,
]

// Validadores para crear comentario
const createCommentValidators = [
  param('postId')
    .isInt({ min: 1 }).withMessage('ID de post inválido'),

  body('contenido')
    .trim()
    .notEmpty().withMessage('El contenido es requerido')
    .isLength({ min: 1, max: 2000 }).withMessage('El comentario debe tener entre 1 y 2000 caracteres')
    .customSanitizer(sanitizeHtml),

  handleValidationErrors,
]

// Validadores para query params de listado
const listPostsValidators = [
  query('tema')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('El filtro de tema es demasiado largo')
    .customSanitizer(sanitizeHtml),

  query('area')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('El filtro de área es demasiado largo'),

  query('autor')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('El filtro de autor es demasiado largo')
    .customSanitizer(sanitizeHtml),

  query('orden')
    .optional({ checkFalsy: true })
    .isIn(['reciente', 'antiguo', 'vistas', 'menosVistas'])
    .withMessage('Orden inválido'),

  handleValidationErrors,
]

module.exports = {
  createPostValidators,
  updatePostValidators,
  createCommentValidators,
  listPostsValidators,
  handleValidationErrors,
}
