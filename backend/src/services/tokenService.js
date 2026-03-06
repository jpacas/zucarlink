const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const RefreshToken = require('../models/RefreshToken')
const { Op } = require('sequelize')

// Generar access token (15 minutos)
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    }
  )
}

// Generar refresh token (7 días)
const generateRefreshToken = async (userId) => {
  // Generar token aleatorio
  const token = crypto.randomBytes(64).toString('hex')

  // Calcular fecha de expiración (7 días)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Guardar en base de datos
  await RefreshToken.create({
    token,
    userId,
    expiresAt,
  })

  return token
}

// Verificar y renovar tokens
const refreshTokens = async (refreshToken) => {
  // Buscar el refresh token en la BD
  const storedToken = await RefreshToken.findOne({
    where: {
      token: refreshToken,
      isRevoked: false,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
  })

  if (!storedToken) {
    throw new Error('Refresh token inválido o expirado')
  }

  // Obtener el usuario asociado
  const User = require('../models/User')
  const user = await User.findByPk(storedToken.userId)

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Revocar el refresh token usado (rotación de tokens)
  await storedToken.update({ isRevoked: true })

  // Generar nuevos tokens
  const newAccessToken = generateAccessToken(user)
  const newRefreshToken = await generateRefreshToken(user.id)

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

// Revocar todos los refresh tokens de un usuario (logout de todas las sesiones)
const revokeAllUserTokens = async (userId) => {
  await RefreshToken.update(
    { isRevoked: true },
    {
      where: {
        userId,
        isRevoked: false,
      },
    }
  )
}

// Revocar un refresh token específico (logout de una sesión)
const revokeRefreshToken = async (token) => {
  await RefreshToken.update(
    { isRevoked: true },
    {
      where: {
        token,
        isRevoked: false,
      },
    }
  )
}

// Limpiar tokens expirados (para ejecutar periódicamente)
const cleanupExpiredTokens = async () => {
  await RefreshToken.destroy({
    where: {
      [Op.or]: [
        { expiresAt: { [Op.lt]: new Date() } },
        { isRevoked: true },
      ],
    },
  })
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshTokens,
  revokeAllUserTokens,
  revokeRefreshToken,
  cleanupExpiredTokens,
}
