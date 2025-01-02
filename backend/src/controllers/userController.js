const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const upload = require('../middleware/multer') // Importar el middleware

// Controlador para obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: ['id', 'nombre', 'apellido', 'pais', 'email', 'avatarUrl'], // Excluye contraseñas
    })
    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error })
  }
}

const registerUser = async (req, res) => {
  try {
    const { nombre, apellido, pais, email, password } = req.body

    // Validación de campos obligatorios
    if (!nombre || !apellido || !pais || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son obligatorios.' })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Procesar la imagen de perfil si está presente
    let avatarUrl = null
    if (req.file) {
      avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${
        req.file.filename
      }`
    }

    // Crear usuario
    const user = await User.create({
      nombre,
      apellido,
      pais,
      email,
      password: hashedPassword,
      avatarUrl, // Almacenar la URL de la imagen
    })

    res.status(201).json({ message: 'Usuario registrado exitosamente', user })
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error })
  }
}

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar datos
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son obligatorios' })
    }

    // Buscar usuario
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }

    // Generar JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    res.status(200).json({ message: 'Login exitoso', token })
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error })
  }
}

const getUserById = async (req, res) => {
  const { id } = req.params
  try {
    const usuario = await User.findOne({
      where: { id },
      attributes: ['id', 'nombre', 'apellido', 'pais', 'email', 'createdAt'], // Excluir contraseña
    })

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.status(200).json(usuario)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error })
  }
}

// Controlador para actualizar la foto de perfil
const uploadProfilePicture = async (req, res) => {
  const { id } = req.params
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo' })
  }

  const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${
    req.file.filename
  }`

  try {
    const usuario = await User.findByPk(id)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Actualizar el campo avatarUrl
    usuario.avatarUrl = avatarUrl
    await usuario.save()

    res.status(200).json({ message: 'Foto de perfil actualizada', avatarUrl })
  } catch (error) {
    res.status(500).json({ message: 'Error al subir la foto de perfil', error })
  }
}

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  uploadProfilePicture,
}
