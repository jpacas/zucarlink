const bcrypt = require('bcrypt')
const User = require('../models/User')
const s3 = require('../config/s3')

const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${file.originalname}`, // Ruta dentro del bucket
    Body: file.buffer,
    ContentType: file.mimetype,
  }

  const { Location } = await s3.upload(params).promise()
  return Location // URL pública del archivo
}

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

    let avatarUrl =
      'https://zucarlink-profiles.s3.us-east-2.amazonaws.com/uploads/avatar-generico.jpg' // URL genérica
    if (req.file) {
      avatarUrl = await uploadToS3(req.file) // Subir a S3 y obtener la URL
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
    console.error(error)
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
