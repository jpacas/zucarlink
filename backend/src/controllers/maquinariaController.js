const Maquinaria = require('../models/Maquinaria')
const User = require('../models/User')
const Pais = require('../models/Pais')
const Archivo = require('../models/Archivo')
const s3 = require('../config/s3')

exports.getMaquinaria = async (req, res) => {
  try {
    const maquinarias = await Maquinaria.findAll({
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
      order: [['createdAt', 'DESC']],
    })
    res.status(200).json(maquinarias)
  } catch (error) {
    console.error('Error al obtener maquinarias:', error)
    res.status(500).json({ error: 'Error al obtener las maquinarias.' })
  }
}

exports.getMaquinariaById = async (req, res) => {
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

exports.createMaquinaria = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      contacto,
      marca,
      modelo,
      anio,
      paisid,
    } = req.body

    console.log(req.body)

    // Validar campos requeridos
    if (
      !nombre ||
      !descripcion ||
      !precio ||
      !contacto ||
      !marca ||
      !modelo ||
      !anio ||
      !paisid
    ) {
      return res.status(400).json({
        error: 'Todos los campos requeridos deben ser proporcionados.',
      })
    }

    // Manejar la foto principal
    let fotoUrl = null
    if (req.files && req.files.foto) {
      const fotoFile = req.files.foto[0]
      const fotoParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `maquinarias/fotos/${Date.now()}-${fotoFile.originalname}`,
        Body: fotoFile.buffer,
        ContentType: fotoFile.mimetype,
        ACL: 'public-read',
      }

      const uploadResult = await s3.upload(fotoParams).promise()
      fotoUrl = uploadResult.Location
    }

    // Crear la maquinaria
    const nuevaMaquinaria = await Maquinaria.create({
      nombre,
      descripcion,
      foto: fotoUrl,
      precio,
      contacto,
      marca,
      modelo,
      anio,
      paisid,
      usuarioid: req.user.id,
    })

    // Manejar archivos adjuntos
    if (req.files && req.files.archivos) {
      const archivosPromises = req.files.archivos.map(async (archivo) => {
        const archivoParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `maquinarias/archivos/${Date.now()}-${archivo.originalname}`,
          Body: archivo.buffer,
          ContentType: archivo.mimetype,
          ACL: 'public-read',
        }

        const uploadResult = await s3.upload(archivoParams).promise()

        return Archivo.create({
          nombre: archivo.originalname,
          url: uploadResult.Location,
          tipo: archivo.mimetype,
          maquinariaId: nuevaMaquinaria.id,
        })
      })

      await Promise.all(archivosPromises)
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
    res.status(500).json({ error: 'Error al crear la maquinaria.' })
  }
}

exports.updateMaquinaria = async (req, res) => {
  const { id } = req.params
  const { nombre, descripcion, precio, contacto, marca, modelo, anio, paisid } =
    req.body

  try {
    const maquinaria = await Maquinaria.findByPk(id)

    if (!maquinaria) {
      return res.status(404).json({ error: 'Maquinaria no encontrada.' })
    }

    // Obtener el ID del usuario del token decodificado
    const usuarioId = req.user?.id || req.user?.userId || null

    // Verificar que el usuario es el propietario
    if (maquinaria.usuarioid !== usuarioId) {
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
          if (process.env.AWS_S3_BUCKET) {
            await s3
              .deleteObject({
                Bucket: process.env.AWS_S3_BUCKET,
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
      const fotoFile = req.files.foto[0]
      const fotoParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `maquinarias/fotos/${Date.now()}-${fotoFile.originalname}`,
        Body: fotoFile.buffer,
        ContentType: fotoFile.mimetype,
        ACL: 'public-read',
      }

      try {
        const uploadResult = await s3.upload(fotoParams).promise()
        fotoUrl = uploadResult.Location
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
      paisid,
      foto: fotoUrl,
    })

    // Manejar archivos adjuntos nuevos
    if (req.files && req.files.archivos) {
      const archivosPromises = req.files.archivos.map(async (archivo) => {
        const archivoParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `maquinarias/archivos/${Date.now()}-${archivo.originalname}`,
          Body: archivo.buffer,
          ContentType: archivo.mimetype,
          ACL: 'public-read',
        }

        try {
          const uploadResult = await s3.upload(archivoParams).promise()
          return Archivo.create({
            nombre: archivo.originalname,
            url: uploadResult.Location,
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

exports.deleteMaquinaria = async (req, res) => {
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
    if (maquinaria.usuarioid !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'No autorizado para eliminar esta maquinaria.' })
    }

    // Eliminar foto principal si existe
    if (maquinaria.foto) {
      const fotoKey = maquinaria.foto.split('/').pop()
      await s3
        .deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `maquinarias/fotos/${fotoKey}`,
        })
        .promise()
    }

    // Eliminar archivos adjuntos
    if (maquinaria.archivos && maquinaria.archivos.length > 0) {
      const deletePromises = maquinaria.archivos.map(async (archivo) => {
        const archivoKey = archivo.url.split('/').pop()
        await s3
          .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `maquinarias/archivos/${archivoKey}`,
          })
          .promise()
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
