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
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        avatar: user.avatarUrl,
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

const logout = (req, res) => {
  // Opcional: limpia la sesión o token si tienes lógica en el servidor
  res.status(200).json({ message: 'Logout exitoso' })
}

module.exports = { loginUser, logout }
