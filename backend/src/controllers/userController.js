const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Pais = require('../models/Pais')
const Ingenio = require('../models/Ingenio')
const Area = require('../models/Area')
const Proveedor = require('../models/Proveedor')
const { uploadToS3 } = require('./serverFunctions')

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

    //Preparar la respuesta para el frontend

    const usuarios = response.map((usuario) => {
      return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        avatarUrl: usuario.avatarUrl,
        pais: usuario.pais.nombre,
        ingenio: usuario.ingenio?.nombre || null,
        area: usuario.area?.nombre || null,
        acercaDe: usuario.acercaDe,
        proveedor: usuario.proveedor?.nombre || null,
      }
    })

    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error })
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
      error,
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

    const usuario = {
      id: response.id,
      nombre: response.nombre,
      apellido: response.apellido,
      email: response.email,
      avatarUrl: response.avatarUrl,
      pais: response.pais.nombre,
      ingenio: response.ingenio?.nombre || null,
      area: response.area?.nombre || null,
      acercaDe: response.acercaDe,
      proveedor: response.proveedor?.nombre || null,
    }

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
    usuario.paisId = paisId.id || usuario.paisId
    usuario.ingenioId = ingenioId.id || usuario.ingenioId
    usuario.areaId = areaId.id || usuario.areaId
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

    // Desestructurar el objeto user excluyendo el password
    const {
      password: _,
      createdAt,
      updatedAt,
      ...userWithoutPassword
    } = user.toJSON()

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error })
  }
}

////////////////////////////////////////////////////////////
///// Logout //////////////////////////////////////////////
///////////////////////////////////////////////////////////

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
