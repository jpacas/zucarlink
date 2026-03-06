const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Pais = require('../models/Pais')
const Ingenio = require('../models/Ingenio')
const Area = require('../models/Area')
const Proveedor = require('../models/Proveedor')
const { uploadToS3 } = require('./serverFunctions')
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require('../services/emailService')
const {
  generateAccessToken,
  generateRefreshToken,
  refreshTokens,
  revokeRefreshToken,
  revokeAllUserTokens,
} = require('../services/tokenService')
const { mapUserToResponse, mapUsersToResponse } = require('../utils/mappers')

////////////////////////////////////////////////////////////
///// Obtener todos los usuarios //////////////////////////
///////////////////////////////////////////////////////////

const getAllUsers = async (req, res) => {
  try {
    const response = await User.findAll({
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
          required: false,
        },
        {
          model: Area,
          as: 'area',
          attributes: ['nombre'],
          required: false,
        },
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['nombre'],
          required: false,
        },
      ],
    })

    // Usar mapper centralizado
    const usuarios = mapUsersToResponse(response)

    res.status(200).json(usuarios)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al obtener los usuarios',
    })
  }
}

////////////////////////////////////////////////////////////
///// Registrar usuario ////////////////////////////////////
///////////////////////////////////////////////////////////

const registerUser = async (req, res) => {
  const {
    nombre,
    apellido,
    pais,
    email,
    password,
    area,
    ingenio,
    proveedor,
    fecha_nacimiento,
  } = req.body

  try {
    /**
     * 1. Validación de campos requeridos
     */
    const requiredFields = [
      'nombre',
      'apellido',
      'pais',
      'email',
      'password',
      'fecha_nacimiento',
    ]

    // Filtra campos faltantes o vacíos (en el sentido de undefined, null, cadena vacía o 'null')
    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field]
      return (
        value === undefined ||
        value === null ||
        value === '' ||
        value === 'null'
      )
    })

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Los siguientes campos son obligatorios: ${missingFields.join(
          ', '
        )}`,
      })
    }

    /**
     * 2. Validación de ingenio/proveedor
     * - Solo debe existir uno de los dos.
     * - Si existen ambos o si no existe ninguno, se marca error.
     */
    const hasIngenio = Boolean(ingenio)
    const hasProveedor = Boolean(proveedor)

    if ((hasIngenio && hasProveedor) || (!hasIngenio && !hasProveedor)) {
      return res.status(400).json({
        message:
          'Debe proporcionar únicamente ingenio o proveedor (no ambos, ni ninguno).',
      })
    }

    // Asigna valores en base a lo que se recibe
    const ingenioValue = hasIngenio ? ingenio : null
    const proveedorValue = hasProveedor ? proveedor : null

    /**
     * 3. Búsqueda en base de datos
     * - Se hace en paralelo para mejorar la performance.
     * - Busca solo lo que corresponda: si `ingenio` no viene, no hace falta buscarlo.
     */
    const [foundIngenio, foundProveedor, foundArea, foundPais] =
      await Promise.all([
        hasIngenio
          ? Ingenio.findOne({ where: { nombre: ingenioValue } })
          : null,
        hasProveedor
          ? Proveedor.findOne({ where: { nombre: proveedorValue } })
          : null,
        hasIngenio ? Area.findOne({ where: { nombre: area } }) : null,
        Pais.findOne({ where: { nombre: pais } }),
      ])

    // Valida que los registros existan en la BD (solo los que se hayan solicitado)
    if (
      !foundPais ||
      (hasIngenio && !foundIngenio) ||
      (hasProveedor && !foundProveedor) ||
      (hasIngenio && !foundArea)
    ) {
      return res.status(400).json({
        message: 'Los datos de ingenio, proveedor o área no son válidos.',
      })
    }

    /**
     * 4. Encriptar la contraseña
     */
    const hashedPassword = await bcrypt.hash(password, 10)

    /**
     * 5. Manejo del avatar
     */
    let avatarUrl =
      'https://zucarlink-profiles.s3.us-east-2.amazonaws.com/uploads/avatar-generico.jpg'
    if (req.file) {
      avatarUrl = await uploadToS3(req.file)
    }

    /**
     * 6. Crear el usuario
     */
    const user = await User.create({
      nombre,
      apellido,
      paisId: foundPais.id,
      email,
      password: hashedPassword,
      avatarUrl,
      fecha_nacimiento,
      areaId: hasIngenio ? foundArea.id : null,
      ingenioId: foundIngenio ? foundIngenio.id : null,
      proveedorId: foundProveedor ? foundProveedor.id : null,
    })

    // Enviar correo de bienvenida
    try {
      await sendWelcomeEmail(email, `${nombre} ${apellido}`)
    } catch (emailError) {
      console.error('Error al enviar correo de bienvenida:', emailError)
      // No enviamos error al cliente si falla el envío del correo
    }

    // Desestructurar el objeto user excluyendo el password
    const {
      password: _,
      createdAt,
      updatedAt,
      ...userWithoutPassword
    } = user.toJSON()

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Error al registrar el usuario',
    })
  }
}

////////////////////////////////////////////////////////////
///// Obtener usuario por ID //////////////////////////////
///////////////////////////////////////////////////////////

const getUserById = async (req, res) => {
  const { id } = req.params

  try {
    const response = await User.findOne({
      where: { id },
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
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['nombre'],
        },
      ],
    })

    if (!response) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Usar mapper centralizado
    const usuario = mapUserToResponse(response)

    res.status(200).json(usuario)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error })
  }
}

////////////////////////////////////////////////////////////
///// Actualizar perfil del usuario ///////////////////////
///////////////////////////////////////////////////////////

const updateUserProfile = async (req, res) => {
  const { id } = req.params
  const { nombre, apellido, pais, acercaDe, ingenio, area } = req.body
  const usuarioId = req.user?.id

  try {
    const usuario = await User.findByPk(id)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (String(usuarioId) !== String(usuario.id)) {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para actualizar este perfil' })
    }

    // Si el usuario sube una nueva imagen
    let avatarUrl = usuario.avatarUrl
    if (req.file) {
      avatarUrl = await uploadToS3(req.file)
    }

    // Buscar ingenio, proveedor y area en la base de datos
    const ingenioId = await Ingenio.findOne({
      where: { nombre: ingenio },
    })

    const areaId = await Area.findOne({
      where: { nombre: area },
    })

    const paisId = await Pais.findOne({
      where: { nombre: pais },
    })

    // Actualizar datos del usuario
    usuario.nombre = nombre || usuario.nombre
    usuario.apellido = apellido || usuario.apellido
    if (paisId) {
      usuario.paisId = paisId.id
    }
    if (ingenioId) {
      usuario.ingenioId = ingenioId.id
    }
    if (areaId) {
      usuario.areaId = areaId.id
    }
    usuario.acercaDe = acercaDe || usuario.acercaDe
    usuario.avatarUrl = avatarUrl

    await usuario.save()

    // Desestructurar el objeto user excluyendo el password
    const {
      password: _,
      createdAt,
      updatedAt,
      ...userWithoutPassword
    } = usuario.toJSON()

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      usuario: userWithoutPassword,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar el perfil', error })
  }
}

////////////////////////////////////////////////////////////
///// Cambiar contraseña del usuario /////////////////////
///////////////////////////////////////////////////////////

const changeUserPassword = async (req, res) => {
  const { id } = req.params
  const usuarioId = req.user?.id
  const { currentPassword, newPassword, confirmPassword } = req.body

  try {
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'La nueva contraseña y la confirmación no coinciden',
      })
    }

    const usuario = await User.findByPk(id)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    if (String(usuarioId) !== String(usuario.id)) {
      return res.status(403).json({
        message: 'No tienes permisos para cambiar esta contraseña',
      })
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      usuario.password
    )
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'La contraseña actual es incorrecta',
      })
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    usuario.password = hashedPassword
    await usuario.save()

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente',
    })
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error)
    res.status(500).json({
      message: 'Error al cambiar la contraseña',
      error: error.message,
    })
  }
}

////////////////////////////////////////////////////////////
///// Actualizar la foto de perfil ////////////////////////
///////////////////////////////////////////////////////////

const uploadProfilePicture = async (req, res) => {
  const { id } = req.params
  const usuarioId = req.user?.id

  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo.' })
  }

  try {
    const avatarUrl = await uploadToS3(req.file) // Subir a S3
    const usuario = await User.findByPk(id)

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' })
    }
    if (String(usuarioId) !== String(usuario.id)) {
      return res.status(403).json({
        message: 'No tienes permisos para actualizar esta foto.',
      })
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

////////////////////////////////////////////////////////////
///// Login ///////////////////////////////////////////////
///////////////////////////////////////////////////////////

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

    // Generar access token (15 min) y refresh token (7 días)
    const accessToken = generateAccessToken(user)
    const refreshToken = await generateRefreshToken(user.id)

    // Desestructurar el objeto user excluyendo el password
    const {
      password: _,
      createdAt,
      updatedAt,
      ...userWithoutPassword
    } = user.toJSON()

    res.status(200).json({
      message: 'Login exitoso',
      token: accessToken,
      refreshToken,
      user: userWithoutPassword,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error })
  }
}

////////////////////////////////////////////////////////////
///// Logout //////////////////////////////////////////////
///////////////////////////////////////////////////////////

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body

    // Revocar el refresh token si se proporciona
    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }

    res.status(200).json({
      message: 'Logout exitoso',
    })
  } catch (error) {
    console.error('Error en logout:', error)
    res.status(500).json({ message: 'Error al cerrar sesión' })
  }
}

////////////////////////////////////////////////////////////
///// Refrescar token /////////////////////////////////////
///////////////////////////////////////////////////////////

const refreshUserToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token requerido' })
    }

    const tokens = await refreshTokens(refreshToken)

    res.status(200).json({
      message: 'Tokens renovados exitosamente',
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (error) {
    console.error('Error al refrescar token:', error)
    res.status(401).json({ message: error.message || 'Error al refrescar token' })
  }
}

////////////////////////////////////////////////////////////
///// Obtener usuarios por proveedor ///////////////////////
///////////////////////////////////////////////////////////

const getProviderUsers = async (req, res) => {
  const { id } = req.params

  try {
    const response = await User.findAll({
      where: { proveedorId: id },
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
          model: Area,
          as: 'area',
          attributes: ['nombre'],
          required: false,
        },
      ],
    })

    if (!response.length) {
      return res.status(204).send([]) // No hay contenido
    }

    // Usar mapper centralizado (sin ingenio ni proveedor)
    const usuarios = mapUsersToResponse(response, {
      includeIngenio: false,
      includeProveedor: false,
    })

    res.status(200).json(usuarios)
  } catch (error) {
    console.error('Error al obtener usuarios del proveedor:', error)
    res
      .status(500)
      .json({ message: 'Error al obtener los usuarios del proveedor', error })
  }
}

////////////////////////////////////////////////////////////
///// Recuperación de contraseña ///////////////////////////
///////////////////////////////////////////////////////////

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({
        message: 'No existe un usuario con ese correo electrónico.',
      })
    }

    // Generar token de recuperación
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    // Crear URL de recuperación
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    // Enviar el correo usando el servicio centralizado
    await sendPasswordResetEmail(email, resetUrl)

    res.status(200).json({
      message:
        'Se ha enviado un correo con las instrucciones para recuperar tu contraseña.',
    })
  } catch (error) {
    console.error('Error en forgotPassword:', error)
    res.status(500).json({
      message: 'Error al procesar la solicitud de recuperación de contraseña.',
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { newPassword } = req.body

    if (!newPassword) {
      return res.status(400).json({
        message: 'La nueva contraseña es requerida.',
      })
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      })
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente.',
    })
  } catch (error) {
    console.error('Error en resetPassword:', error)
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        message:
          'El enlace de recuperación ha expirado. Por favor, solicita uno nuevo.',
      })
    }
    res.status(500).json({
      message: 'Error al restablecer la contraseña.',
    })
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
  getProviderUsers,
  forgotPassword,
  resetPassword,
  refreshUserToken,
}
