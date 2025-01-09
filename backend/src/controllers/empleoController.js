const Empleo = require('../models/Empleo')
const User = require('../models/User')

exports.getEmpleos = async (req, res) => {
  try {
    const empleos = await Empleo.findAll()
    res.status(200).json(empleos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los empleos.' })
  }
}

exports.createEmpleo = async (req, res) => {
  const { user_id, nombre, descripcion, contacto, categoria } = req.body
  const foto = req.file ? req.file.location : null // Si usa S3 para imágenes

  // Validación de entrada
  if (!user_id || !nombre || !descripcion || !contacto || !categoria) {
    return res
      .status(400)
      .json({ error: 'Todos los campos requeridos deben ser proporcionados.' })
  }

  if (
    !['Campo', 'Molinos', 'Fabrica', 'Calderas', 'Energia', 'Alcohol'].includes(
      categoria
    )
  ) {
    return res.status(400).json({
      error: `La categoría debe ser una de las siguientes: 'Campo', 'Molinos', 'Fabrica', 'Calderas', 'Energia', 'Alcohol'.`,
    })
  }

  try {
    // Verificar si el usuario existe
    const user = await User.findByPk(user_id)
    if (!user) {
      return res
        .status(404)
        .json({ error: 'El usuario especificado no existe.' })
    }

    // Crear el empleo
    const nuevoEmpleo = await Empleo.create({
      user_id,
      nombre,
      foto,
      descripcion,
      contacto,
      categoria,
    })

    res.status(201).json({
      message: 'Empleo creado exitosamente.',
      empleo: nuevoEmpleo,
    })
  } catch (error) {
    // Manejo específico de errores de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map((err) => err.message)
      return res.status(400).json({
        error: 'Error de validación.',
        details: validationErrors,
      })
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Error de unicidad. Un registro con estos datos ya existe.',
      })
    }

    // Error general
    console.error('Error al crear empleo:', error)
    res.status(500).json({
      error:
        'Error interno del servidor. Por favor, inténtelo de nuevo más tarde.',
    })
  }
}
