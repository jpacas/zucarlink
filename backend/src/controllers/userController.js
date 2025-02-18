const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Pais = require('../models/Pais')
const Ingenio = require('../models/Ingenio')
const Area = require('../models/Area')
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
      attributes: [
        'id',
        'nombre',
        'apellido',
        'email',
        'avatarUrl',
        'acercaDe',
      ],
      include: [
        {
          model: Pais,
          as: 'pais',
          attributes: ['nombre'],
        },
        {
          model: Ingenio,
          as: 'ingenio',
          attributes: ['nombre'],
        },
        {
          model: Area,
          as: 'area',
          attributes: ['nombre'],
        },
      ],
    })
    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error })
  }
}

// Registrar usuario
const registerUser = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      paisId,
      email,
      password,
      areaId,
      ingenioId,
      proveedorId,
      fecha_nacimiento,
    } = req.body

    const requiredFields = {
      nombre,
      apellido,
      paisId,
      email,
      password,
      areaId,
      ingenioId,
      proveedorId,
      fecha_nacimiento,
    }

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([key, value]) =>
          value === undefined ||
          value === null ||
          value === '' ||
          value === 'null'
      ) // Considera vacío si es undefined, null o ''
      .map(([key]) => key) // Solo nos interesa el nombre del campo

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Los siguientes campos son obligatorios: ${missingFields.join(
          ', '
        )}`,
      })
    }

    // 📌 Validar que solo uno de los dos sea enviado
    if (ingenioId && proveedorId) {
      return res.status(400).json({
        message:
          'Un usuario no puede tener un ingenioId y un proveedorId al mismo tiempo. Debe elegir solo uno.',
      })
    }

    // 📌 Si no se envía ninguno, error
    if (!ingenioId && !proveedorId) {
      return res.status(400).json({
        message: 'Debe proporcionar ingenioId o proveedorId, pero no ambos.',
      })
    }

    // 📌 Si `ingenioId` se envía, `proveedorId` debe ser NULL, y viceversa
    const ingenioValue = ingenioId || null
    const proveedorValue = proveedorId || null

    const hashedPassword = await bcrypt.hash(password, 10)

    let avatarUrl =
      'https://zucarlink-profiles.s3.us-east-2.amazonaws.com/uploads/avatar-generico.jpg' // URL genérica
    if (req.file) {
      avatarUrl = await uploadToS3(req.file) // Subir a S3 y obtener la URL
    }

    const user = await User.create({
      nombre,
      apellido,
      paisId,
      email,
      password: hashedPassword,
      avatarUrl,
      areaId,
      ingenioId: ingenioValue,
      proveedorId: proveedorValue,
      fecha_nacimiento,
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
        'email',
        'createdAt',
        'avatarUrl',
        'acercaDe',
      ],
      include: [
        {
          model: Pais,
          as: 'pais',
          attributes: ['nombre'],
        },
        {
          model: Ingenio,
          as: 'ingenio',
          attributes: ['nombre'],
        },
        {
          model: Area,
          as: 'area',
          attributes: ['nombre'],
        },
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

// 🔹 ACTUALIZAR PERFIL DEL USUARIO
const updateUserProfile = async (req, res) => {
  const { id } = req.params
  const { nombre, apellido, pais, acercaDe, ingenio } = req.body

  try {
    const usuario = await User.findByPk(id)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Si el usuario sube una nueva imagen
    let avatarUrl = usuario.avatarUrl
    if (req.file) {
      avatarUrl = await uploadToS3(req.file)
    }

    // Actualizar datos del usuario
    usuario.nombre = nombre || usuario.nombre
    usuario.apellido = apellido || usuario.apellido
    usuario.pais = pais || usuario.pais
    usuario.ingenio = ingenio || usuario.ingenio
    usuario.acercaDe = acercaDe || usuario.acercaDe
    usuario.avatarUrl = avatarUrl

    await usuario.save()

    res
      .status(200)
      .json({ message: 'Perfil actualizado exitosamente', usuario })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar el perfil', error })
  }
}

// 🔹 CAMBIAR CONTRASEÑA DEL USUARIO
const changeUserPassword = async (req, res) => {
  const { id } = req.params
  const { newPassword } = req.body

  try {
    const usuario = await User.findByPk(id)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    usuario.password = hashedPassword
    await usuario.save()

    res.status(200).json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al cambiar la contraseña', error })
  }
}

// Actualizar la foto de perfil
const uploadProfilePicture = async (req, res) => {
  const { id } = req.params

  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo.' })
  }

  try {
    const avatarUrl = await uploadToS3(req.file) // Subir a S3
    const usuario = await User.findByPk(id)

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' })
    }

    usuario.avatarUrl = avatarUrl
    await usuario.save()

    res.status(200).json({ message: 'Foto de perfil actualizada.', avatarUrl })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: 'Error al subir la foto de perfil.', error })
  }
}

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

module.exports = {
  getAllUsers,
  registerUser,
  getUserById,
  updateUserProfile,
  changeUserPassword,
  uploadProfilePicture,
  loginUser,
  logout,
}
