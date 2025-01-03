const bcrypt = require('bcrypt')
const User = require('../models/User')

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: ['id', 'nombre', 'apellido', 'pais', 'email', 'avatarUrl'],
    })
    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error })
  }
}

// Registrar usuario
const registerUser = async (req, res) => {
  try {
    const { nombre, apellido, pais, email, password } = req.body

    if (!nombre || !apellido || !pais || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son obligatorios.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let avatarUrl = 'http://localhost:5001/uploads/src/avatar-generico.jpg'
    if (req.file) {
      avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${
        req.file.filename
      }`
    }

    const user = await User.create({
      nombre,
      apellido,
      pais,
      email,
      password: hashedPassword,
      avatarUrl,
    })

    res.status(201).json({ message: 'Usuario registrado exitosamente', user })
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error })
  }
}

// Obtener usuario por ID
const getUserById = async (req, res) => {
  const { id } = req.params

  try {
    const usuario = await User.findOne({
      where: { id },
      attributes: [
        'id',
        'nombre',
        'apellido',
        'pais',
        'email',
        'createdAt',
        'avatarUrl',
      ],
    })

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.status(200).json(usuario)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error })
  }
}

module.exports = {
  getAllUsers,
  registerUser,
  getUserById,
}
