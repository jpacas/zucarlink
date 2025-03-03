const Maquinaria = require('../models/Maquinaria')
const User = require('../models/User')
const Pais = require('../models/Pais')
const Archivo = require('../models/Archivo')
const { uploadToS3 } = require('./serverFunctions')

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
  try {
    const maquinaria = await Maquinaria.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'avatarUrl'],
        },
        {
          model: Pais,
          as: 'pais',
          attributes: ['id', 'nombre'],
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
    const { nombre, descripcion, precio, contacto, marca, modelo, anio, pais } =
      req.body

    // Validar campos requeridos
    if (
      !nombre ||
      !descripcion ||
      !precio ||
      !contacto ||
      !marca ||
      !modelo ||
      !anio ||
      !pais
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
          anio: !anio,
          pais: !pais,
        },
      })
    }

    const paisId = await Pais.findOne({ where: { nombre: pais } })

    // Convertir tipos de datos
    const precioNum = parseFloat(precio)
    const anioNum = parseInt(anio)

    if (isNaN(precioNum) || isNaN(anioNum) || !paisId) {
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
      anio: anioNum,
      paisId: paisId.id,
      usuarioId: req.user.id,
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

    // Obtener la maquinaria con sus relaciones
    const maquinariaConRelaciones = await Maquinaria.findByPk(
      nuevaMaquinaria.id,
      {
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'email', 'avatarUrl'],
          },
          {
            model: Pais,
            as: 'pais',
            attributes: ['id', 'nombre'],
          },
          {
            model: Archivo,
            as: 'archivos',
            attributes: ['id', 'nombre', 'url', 'tipo'],
          },
        ],
      }
    )

    res.status(201).json({
      message: 'Maquinaria creada exitosamente.',
      maquinaria: maquinariaConRelaciones,
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
        details: 'El país o usuario especificado no existe.',
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
  const { nombre, descripcion, precio, contacto, marca, modelo, anio, pais } =
    req.body

  try {
    const maquinaria = await Maquinaria.findByPk(id)

    if (!maquinaria) {
      return res.status(404).json({ error: 'Maquinaria no encontrada.' })
    }

    // Obtener el ID del usuario del token decodificado
    const usuarioId = req.user?.id || req.user?.userId || null

    // Verificar que el usuario es el propietario
    if (maquinaria.usuarioId !== usuarioId) {
      return res
        .status(403)
        .json({ error: 'No autorizado para editar esta maquinaria.' })
    }

    // Manejar la foto principal
    let fotoUrl = maquinaria.foto
    if (req.files && req.files.foto) {
      // Eliminar foto anterior si existe
      if (maquinaria.foto) {
        try {
          const oldKey = maquinaria.foto.split('/').pop()
          if (process.env.AWS_BUCKET_NAME) {
            await s3
              .deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `maquinarias/fotos/${oldKey}`,
              })
              .promise()
          }
        } catch (error) {
          console.error('Error al eliminar foto anterior:', error)
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
      nombre,
      descripcion,
      precio,
      contacto,
      marca,
      modelo,
      anio,
      paisId: pais.id,
      foto: fotoUrl,
    })

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

    // Obtener la maquinaria actualizada con sus relaciones
    const maquinariaActualizada = await Maquinaria.findByPk(maquinaria.id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'avatarUrl'],
        },
        {
          model: Pais,
          as: 'pais',
          attributes: ['id', 'nombre'],
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
      maquinaria: maquinariaActualizada,
    })
  } catch (error) {
    console.error('Error al actualizar maquinaria:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Error de validación.',
        details: error.errors.map((err) => err.message),
      })
    }
    res.status(500).json({ error: 'Error al actualizar la maquinaria.' })
  }
}

////////////////////////////////////////////////////////////
// Eliminar maquinaria
////////////////////////////////////////////////////////////

const deleteMaquinaria = async (req, res) => {
  try {
    const maquinaria = await Maquinaria.findByPk(req.params.id, {
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

    // Verificar que el usuario es el propietario
    if (maquinaria.usuarioId !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'No autorizado para eliminar esta maquinaria.' })
    }

    // Eliminar foto principal si existe
    if (maquinaria.foto) {
      try {
        const oldKey = maquinaria.foto.split('/').pop()
        if (process.env.AWS_BUCKET_NAME) {
          await s3
            .deleteObject({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `maquinarias/fotos/${oldKey}`,
            })
            .promise()
        }
      } catch (error) {
        console.error('Error al eliminar foto:', error)
      }
    }

    // Eliminar archivos adjuntos
    if (maquinaria.archivos && maquinaria.archivos.length > 0) {
      const deletePromises = maquinaria.archivos.map(async (archivo) => {
        try {
          const archivoKey = archivo.url.split('/').pop()
          if (process.env.AWS_BUCKET_NAME) {
            await s3
              .deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `maquinarias/archivos/${archivoKey}`,
              })
              .promise()
          }
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
