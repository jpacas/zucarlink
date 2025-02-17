const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son obligatorios' })
    }

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: 'Credenciales inválidas' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: 'Error del servidor: JWT_SECRET no definido' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    )
    res.status(200).json({ message: 'Login exitoso', token })
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error })
  }
}

// Logout
const logout = (req, res) => {
  try {
    res.status(200).json({
      message: 'Logout exitoso, elimina el token en el frontend',
    })
  } catch (error) {
    console.error('Error en logout:', error)
    res.status(500).json({ message: 'Error al cerrar sesión' })
  }
}

module.exports = { loginUser, logout }
