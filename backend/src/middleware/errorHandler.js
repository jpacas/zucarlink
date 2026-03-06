/**
 * Clase para errores operacionales de la API
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Errores comunes predefinidos
 */
const Errors = {
  notFound: (resource = 'Recurso') => new AppError(`${resource} no encontrado`, 404),
  unauthorized: () => new AppError('No autorizado', 401),
  forbidden: () => new AppError('No tienes permiso para realizar esta acción', 403),
  badRequest: (message = 'Solicitud inválida') => new AppError(message, 400),
  conflict: (message = 'Conflicto con el estado actual') => new AppError(message, 409),
  internal: () => new AppError('Error interno del servidor', 500),
}

/**
 * Manejador de errores de Sequelize
 */
const handleSequelizeError = (err) => {
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message)
    return new AppError(`Error de validación: ${messages.join(', ')}`, 400)
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo'
    return new AppError(`El ${field} ya está en uso`, 409)
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return new AppError('Referencia a un registro inexistente', 400)
  }

  if (err.name === 'SequelizeDatabaseError') {
    return new AppError('Error de base de datos', 500)
  }

  return null
}

/**
 * Manejador de errores de JWT
 */
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Token inválido', 401)
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError('Token expirado', 401)
  }

  return null
}

/**
 * Manejador de errores de Stripe
 */
const handleStripeError = (err) => {
  if (err.type && err.type.startsWith('Stripe')) {
    const message = process.env.NODE_ENV === 'production'
      ? 'Error al procesar el pago'
      : err.message
    return new AppError(message, 400)
  }

  return null
}

/**
 * Enviar respuesta de error en desarrollo
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

/**
 * Enviar respuesta de error en producción
 */
const sendErrorProd = (err, res) => {
  // Error operacional (conocido): enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  } else {
    // Error de programación u otro desconocido: no filtrar detalles
    console.error('ERROR:', err)

    res.status(500).json({
      status: 'error',
      message: 'Algo salió mal. Por favor, intenta de nuevo más tarde.',
    })
  }
}

/**
 * Middleware de manejo global de errores
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  // Transformar errores conocidos
  let error = { ...err }
  error.message = err.message

  // Errores de Sequelize
  const sequelizeError = handleSequelizeError(err)
  if (sequelizeError) error = sequelizeError

  // Errores de JWT
  const jwtError = handleJWTError(err)
  if (jwtError) error = jwtError

  // Errores de Stripe
  const stripeError = handleStripeError(err)
  if (stripeError) error = stripeError

  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(error, res)
  } else {
    sendErrorDev(error, res)
  }
}

/**
 * Wrapper para funciones async (elimina necesidad de try-catch en cada controller)
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

module.exports = {
  AppError,
  Errors,
  errorHandler,
  catchAsync,
}
