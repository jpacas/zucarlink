const Maquinaria = require('../models/Maquinaria')
const User = require('../models/User')
const Pais = require('../models/Pais')
const Archivo = require('../models/Archivo')
const Ingenio = require('../models/Ingenio')
const { uploadToS3, deleteFromS3 } = require('./serverFunctions')

////////////////////////////////////////////////////////////
// Obtener todas las maquinarias
////////////////////////////////////////////////////////////

const getMaquinaria = async (req, res) => {
  try {
    const maquinarias = await Maquinaria.findAll({
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'email', 'avatarUrl'],
        },
        {
          model: Pais,
          as: 'pais',
          attributes: ['id', 'nombre'],
        },
        {
          model: Ingenio,
          as: 'ingenio',
          attributes: ['id', 'nombre', 'logo'],
        },
        {
          model: Archivo,
          as: 'archivos',
          attributes: ['id', 'nombre', 'url', 'tipo'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })
    res.status(200).json(maquinarias)
  } catch (error) {
    console.error('Error al obtener maquinarias:', error)
    res.status(500).json({ error: 'Error al obtener las maquinarias.' })
  }
}

////////////////////////////////////////////////////////////
// Obtener maquinaria por ID
////////////////////////////////////////////////////////////

const getMaquinariaById = async (req, res) => {
  const { id } = req.params

  try {
    const maquinaria = await Maquinaria.findByPk(id, {
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'email', 'avatarUrl'],
        },
        {
          model: Pais,
          as: 'pais',
          attributes: ['id', 'nombre'],
        },
        {
          model: Ingenio,
          as: 'ingenio',
          attributes: ['id', 'nombre', 'logo'],
        },
        {
          model: Archivo,
          as: 'archivos',
          attributes: ['id', 'nombre', 'url', 'tipo'],
        },
      ],
    })

    if (!maquinaria) {
      return res.status(404).json({ error: 'Maquinaria no encontrada.' })
    }

    // Incrementar contador de vistas
    await maquinaria.increment('vistas')

    res.status(200).json(maquinaria)
  } catch (error) {
    console.error('Error al obtener maquinaria:', error)
    res.status(500).json({ error: 'Error al obtener la maquinaria.' })
  }
}

////////////////////////////////////////////////////////////
// Crear maquinaria
////////////////////////////////////////////////////////////

const createMaquinaria = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      contacto,
      marca,
      modelo,
      pais,
      ingenio,
      usuarioId,
    } = req.body

    // Validar campos requeridos
    if (
      !nombre ||
      !descripcion ||
      !precio ||
      !contacto ||
      !marca ||
      !modelo ||
      !pais ||
      !ingenio
    ) {
      return res.status(400).json({
        error: 'Todos los campos requeridos deben ser proporcionados.',
        camposFaltantes: {
          nombre: !nombre,
          descripcion: !descripcion,
          precio: !precio,
          contacto: !contacto,
          marca: !marca,
          modelo: !modelo,
          pais: !pais,
          ingenio: !ingenio,
        },
      })
    }

    const paisData = await Pais.findOne({ where: { nombre: pais } })
    const ingenioData = await Ingenio.findOne({ where: { nombre: ingenio } })

    if (!ingenioData) {
      return res
        .status(400)
        .json({ error: 'El ingenio especificado no existe.' })
    }

    if (!paisData) {
      return res.status(400).json({ error: 'El país especificado no existe.' })
    }
    // Convertir tipos de datos
    const precioNum = parseFloat(precio)

    if (isNaN(precioNum) || !paisData) {
      return res.status(400).json({
        error:
          'Error en el formato de los datos numéricos o país no encontrado.',
      })
    }

    // Manejar la foto principal
    let fotoUrl = null
    if (req.files && req.files.foto) {
      try {
        fotoUrl = await uploadToS3(req.files.foto[0])
      } catch (error) {
        console.error('Error al subir la foto:', error)
        return res.status(500).json({
          error: 'Error al subir la foto.',
          details: error.message,
        })
      }
    }

    // Crear la maquinaria
    const nuevaMaquinaria = await Maquinaria.create({
      nombre,
      descripcion,
      foto: fotoUrl,
      precio: precioNum,
      contacto,
      marca,
      modelo,
      paisId: paisData.id,
      ingenioId: ingenioData.id,
      usuarioId,
    })

    // Manejar archivos adjuntos
    if (req.files && req.files.archivos) {
      const archivosPromises = req.files.archivos.map(async (archivo) => {
        try {
          const url = await uploadToS3(archivo)
          return Archivo.create({
            nombre: archivo.originalname,
            url,
            tipo: archivo.mimetype,
            maquinariaId: nuevaMaquinaria.id,
          })
        } catch (error) {
          console.error('Error al subir archivo adjunto:', error)
          return null
        }
      })

      const resultados = await Promise.all(archivosPromises)
      const archivosExitosos = resultados.filter(Boolean)

      if (archivosExitosos.length < req.files.archivos.length) {
        console.warn('Algunos archivos no se pudieron subir correctamente')
      }
    }

    res.status(201).json({
      message: 'Maquinaria creada exitosamente.',
    })
  } catch (error) {
    console.error('Error al crear maquinaria:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Error de validación.',
        details: error.errors.map((err) => err.message),
      })
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Error de clave foránea.',
        details: 'El país o ingenio especificado no existe.',
      })
    }
    res.status(500).json({
      error: 'Error al crear la maquinaria.',
      details: error.message,
    })
  }
}

////////////////////////////////////////////////////////////
// Actualizar maquinaria
////////////////////////////////////////////////////////////

const updateMaquinaria = async (req, res) => {
  const { id } = req.params
  const {
    nombre,
    descripcion,
    precio,
    contacto,
    marca,
    modelo,
    anio,
    pais,
    ingenio,
    usuarioId,
    archivosToDelete,
  } = req.body

  try {
    const maquinaria = await Maquinaria.findByPk(id)

    if (!maquinaria) {
      return res.status(404).json({ error: 'Maquinaria no encontrada.' })
    }

    // Verificar que el usuario es el propietario (asegúrate de que usuarioId se envíe correctamente desde el frontend)
    // Convertir ambos a string o number para comparación segura si es necesario
    if (String(maquinaria.usuarioId) !== String(usuarioId)) {
      console.warn(
        `Intento de edición no autorizado: Maquinaria ${id}, Usuario ${usuarioId}, Propietario ${maquinaria.usuarioId}`
      )
      return res
        .status(403)
        .json({ error: 'No autorizado para editar esta maquinaria.' })
    }

    const ingenioData = await Ingenio.findOne({ where: { nombre: ingenio } })
    if (!ingenioData) {
      return res
        .status(400)
        .json({ error: 'El ingenio especificado no existe.' })
    }

    const paisData = await Pais.findOne({ where: { nombre: pais } })
    if (!paisData) {
      return res.status(400).json({ error: 'El país especificado no existe.' })
    }

    // Manejar la foto principal
    let fotoUrl = maquinaria.foto
    if (req.files && req.files.foto) {
      // Eliminar foto anterior si existe y es diferente
      if (maquinaria.foto) {
        try {
          await deleteFromS3(maquinaria.foto)
        } catch (error) {
          console.error('Error al eliminar foto anterior de S3:', error)
          // Continuamos con la actualización aunque falle la eliminación
        }
      }

      // Subir nueva foto
      try {
        fotoUrl = await uploadToS3(req.files.foto[0])
      } catch (error) {
        console.error('Error al subir nueva foto:', error)
        return res.status(500).json({ error: 'Error al subir la nueva foto' })
      }
    }

    // Actualizar maquinaria
    await maquinaria.update({
      nombre: nombre || maquinaria.nombre, // Usar valor existente si no se proporciona
      descripcion: descripcion || maquinaria.descripcion,
      precio: precio ? parseFloat(precio) : maquinaria.precio,
      contacto: contacto || maquinaria.contacto,
      marca: marca || maquinaria.marca,
      modelo: modelo || maquinaria.modelo,
      anio: anio ? parseInt(anio) : maquinaria.anio,
      paisId: paisData.id,
      ingenioId: ingenioData.id,
      foto: fotoUrl,
    })

    // ---- INICIO: Lógica para eliminar archivos existentes ----
    if (archivosToDelete && archivosToDelete.length > 0) {
      // Asegurarse de que archivosToDelete sea siempre un array
      const idsToDeleteInput = Array.isArray(archivosToDelete)
        ? archivosToDelete
        : [archivosToDelete]

      // Convertir IDs a números y filtrar inválidos/NaN
      const numericIdsToDelete = idsToDeleteInput
        .map((idStr) => parseInt(idStr, 10))
        .filter((idNum) => !isNaN(idNum) && idNum > 0)

      if (numericIdsToDelete.length > 0) {
        // Obtener los registros de archivos a eliminar que pertenecen a esta maquinaria
        const archivosParaBorrar = await Archivo.findAll({
          where: {
            id: numericIdsToDelete,
            maquinariaId: maquinaria.id, // Asegurar que pertenezcan a esta maquinaria
          },
        })

        // Iterar y eliminar cada archivo encontrado
        for (const archivo of archivosParaBorrar) {
          try {
            // 1. Eliminar de S3
            if (archivo.url) {
              await deleteFromS3(archivo.url)
            }
            // 2. Eliminar de la base de datos
            await archivo.destroy()
          } catch (deleteError) {
            console.error(
              `Error al eliminar el archivo ID ${archivo.id} (URL: ${archivo.url}):`,
              deleteError
            )
            // Considerar si se debe notificar al frontend o parar la ejecución
          }
        }
      } else {
      }
    }
    // ---- FIN: Lógica para eliminar archivos existentes ----

    // Manejar archivos adjuntos nuevos
    if (req.files && req.files.archivos) {
      const archivosPromises = req.files.archivos.map(async (archivo) => {
        try {
          const url = await uploadToS3(archivo)

          return Archivo.create({
            nombre: archivo.originalname,
            url,
            tipo: archivo.mimetype,
            maquinariaId: maquinaria.id,
          })
        } catch (error) {
          console.error(
            `Error al subir archivo adjunto ${archivo.originalname}:`,
            error
          )
          return null
        }
      })

      const resultados = await Promise.all(archivosPromises)
      const archivosExitosos = resultados.filter(Boolean)

      if (archivosExitosos.length < req.files.archivos.length) {
        console.warn(
          'Algunos archivos adjuntos nuevos no se pudieron subir correctamente'
        )
        // Podrías considerar devolver una advertencia parcial en la respuesta
      }
    }

    // Obtener la maquinaria actualizada con sus relaciones (incluyendo archivos restantes)
    const maquinariaActualizada = await Maquinaria.findByPk(maquinaria.id, {
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'email', 'avatarUrl'],
        },
        {
          model: Pais,
          as: 'pais',
          attributes: ['id', 'nombre'],
        },
        {
          model: Ingenio,
          as: 'ingenio',
          attributes: ['id', 'nombre', 'logo'],
        },
        {
          model: Archivo,
          as: 'archivos',
          attributes: ['id', 'nombre', 'url', 'tipo'],
        },
      ],
    })

    res.status(200).json({
      message: 'Maquinaria actualizada exitosamente.',
      maquinaria: maquinariaActualizada, // Enviar la maquinaria actualizada
    })
  } catch (error) {
    console.error('Error al actualizar maquinaria:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Error de validación.',
        details: error.errors.map((err) => err.message),
      })
    }
    res.status(500).json({
      error: 'Error al actualizar la maquinaria.',
      details: error.message,
    })
  }
}

////////////////////////////////////////////////////////////
// Eliminar maquinaria
////////////////////////////////////////////////////////////

const deleteMaquinaria = async (req, res) => {
  const { id } = req.params
  const { usuarioId } = req.body

  try {
    const maquinaria = await Maquinaria.findByPk(id, {
      include: [
        {
          model: Archivo,
          as: 'archivos',
        },
      ],
    })

    if (!maquinaria) {
      return res.status(404).json({ error: 'Maquinaria no encontrada.' })
    }

    // Eliminar foto principal si existe
    if (maquinaria.foto) {
      try {
        await deleteFromS3(maquinaria.foto)
      } catch (error) {
        console.error('Error al eliminar foto:', error)
      }
    }

    // Eliminar archivos adjuntos
    if (maquinaria.archivos && maquinaria.archivos.length > 0) {
      const deletePromises = maquinaria.archivos.map(async (archivo) => {
        try {
          await deleteFromS3(archivo.url)
        } catch (error) {
          console.error('Error al eliminar archivo:', error)
        }
      })

      await Promise.all(deletePromises)
    }

    await maquinaria.destroy()

    res.status(200).json({ message: 'Maquinaria eliminada exitosamente.' })
  } catch (error) {
    console.error('Error al eliminar maquinaria:', error)
    res.status(500).json({ error: 'Error al eliminar la maquinaria.' })
  }
}

module.exports = {
  getMaquinaria,
  getMaquinariaById,
  createMaquinaria,
  updateMaquinaria,
  deleteMaquinaria,
}
