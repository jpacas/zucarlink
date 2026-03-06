const rateLimit = require('express-rate-limit')

// Rate limiter para login: 5 intentos por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No cuenta requests exitosos
})

// Rate limiter para registro: 3 intentos por IP cada hora
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos
  message: {
    error: 'Demasiados intentos de registro. Intenta de nuevo en una hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para forgot password: 3 intentos por IP cada hora
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos
  message: {
    error: 'Demasiadas solicitudes de recuperación de contraseña. Intenta de nuevo en una hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para reset password: 5 intentos por token cada 15 minutos
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    error: 'Demasiados intentos de restablecimiento. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para pagos: 10 intentos por IP cada minuto
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 intentos
  message: {
    error: 'Demasiadas solicitudes de pago. Intenta de nuevo en un minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter general para API: 100 requests por IP cada 15 minutos
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: {
    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  paymentLimiter,
  apiLimiter,
}
