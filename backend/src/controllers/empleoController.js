const Empleo = require('../models/Empleo')
const User = require('../models/User')
const Archivo = require('../models/Archivo')
const Pais = require('../models/Pais')
const Area = require('../models/Area')
const Ingenio = require('../models/Ingenio')
const s3 = require('../config/s3')
const { deleteFromS3 } = require('./serverFunctions')
const { v4: uuidv4 } = require('uuid')
const { safeParseJSON } = require('../utils/helpers')
const { parsePaginationParams, buildPaginationResponse } = require('../utils/pagination')
const sequelize = require('../config/database')

const getAllEmpleos = async (req, res) => {
  try {
    // Parsear parámetros de paginación
    const { page, limit, offset } = parsePaginationParams(req.query)

    const { count, rows: empleos } = await Empleo.findAndCountAll({
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
        },
        {
          model: Archivo,
          as: 'archivos',
        },
        {
          model: Pais,
          as: 'pais',
          attributes: ['id', 'nombre'],
        },
        {
          model: Area,
          as: 'area',
          attributes: ['id', 'nombre'],
        },
        {
          model: Ingenio,
          as: 'ingenio',
          attributes: ['id', 'nombre'],
        },
      ],
      attributes: { include: ['views'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    })

    res.json({
      data: empleos,
      pagination: buildPaginationResponse(count, page, limit),
    })
  } catch (error) {
    console.error('Error al obtener empleos:', error)
    res.status(500).json({ message: 'Error al obtener empleos', error })
  }
}

const getEmpleoById = async (req, res) => {
  try {
    const { id } = req.params
    const empleo = await Empleo.findByPk(id, {
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
        },
        {
          model: Archivo,
          as: 'archivos',
        },
        {
          model: Pais,
          as: 'pais',
          attributes: ['id', 'nombre'],
        },
        {
          model: Area,
          as: 'area',
          attributes: ['id', 'nombre'],
        },
        {
          model: Ingenio,
          as: 'ingenio',
          attributes: ['id', 'nombre'],
        },
      ],
      attributes: { include: ['views'] },
    })

    if (!empleo) {
      return res.status(404).json({ message: 'Empleo no encontrado' })
    }

    // Incrementar el contador de vistas
    await empleo.increment('views')

    res.json(empleo)
  } catch (error) {
    console.error('Error al obtener empleo:', error)
    res.status(500).json({ message: 'Error al obtener empleo', error })
  }
}

const createEmpleo = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { nombre, descripcion, ingenio, area, pais, contacto } = req.body
    const usuarioId = req.user?.id
    const archivos = req.files || []

    if (
      !nombre ||
      !descripcion ||
      !ingenio ||
      !area ||
      !pais ||
      !contacto ||
      !usuarioId
    ) {
      await transaction.rollback()
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' })
    }

    const [paisData, areaData, ingenioData] = await Promise.all([
      Pais.findOne({ where: { nombre: pais } }),
      Area.findOne({ where: { nombre: area } }),
      Ingenio.findOne({ where: { nombre: ingenio } }),
    ])

    if (!paisData || !areaData || !ingenioData) {
      await transaction.rollback()
      return res
        .status(400)
        .json({ message: 'Pais, area o ingenio no encontrado' })
    }

    const paisId = paisData.id
    const areaId = areaData.id
    const ingenioId = ingenioData.id

    const empleo = await Empleo.create({
      nombre,
      descripcion,
      ingenioId,
      areaId,
      paisId,
      contacto,
      usuarioId,
      vigente: true,
    }, { transaction })

    // Subir archivos a S3 si existen
    if (archivos && archivos.length > 0) {
      const uploadPromises = archivos.map((archivo) => {
        const fileExtension = archivo.originalname.split('.').pop()
        const fileName = `empleos/${empleo.id}/${uuidv4()}.${fileExtension}`

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: archivo.buffer,
          ContentType: archivo.mimetype,
        }

        return s3
          .upload(params)
          .promise()
          .then((data) => {
            return Archivo.create({
              nombre: archivo.originalname,
              url: data.Location,
              tipo: archivo.mimetype,
              empleoId: empleo.id,
            }, { transaction })
          })
      })

      await Promise.all(uploadPromises)
    }

    const empleoCreado = await Empleo.findByPk(empleo.id, {
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
        },
        {
          model: Archivo,
          as: 'archivos',
        },
        {
          model: Pais,
          as: 'pais',
          attributes: ['id', 'nombre'],
        },
        {
          model: Area,
          as: 'area',
          attributes: ['id', 'nombre'],
        },
        {
          model: Ingenio,
          as: 'ingenio',
          attributes: ['id', 'nombre'],
        },
      ],
      transaction,
    })

    await transaction.commit()
    res.status(201).json(empleoCreado)
  } catch (error) {
    console.error('Error al crear empleo:', error)
    await transaction.rollback()
    res.status(500).json({ message: 'Error al crear empleo', error })
  }
}

const updateEmpleo = async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      descripcion,
      ingenio,
      area,
      pais,
      contacto,
      vigente,
      filesToDelete,
    } = req.body
    const usuarioId = req.user?.id
    const archivos = req.files || []

    // Verificar que el empleo existe
    const empleo = await Empleo.findByPk(id)
    if (!empleo) {
      return res.status(404).json({ message: 'Empleo no encontrado' })
    }

    // Verificar que el usuario que actualiza es el creador
    if (String(empleo.usuarioId) !== String(usuarioId)) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para actualizar esta oferta' })
    }

    // Obtener IDs de pais, area e ingenio
    const [paisData, areaData, ingenioData] = await Promise.all([
      pais ? Pais.findOne({ where: { nombre: pais } }) : Promise.resolve(null),
      area ? Area.findOne({ where: { nombre: area } }) : Promise.resolve(null),
      ingenio
        ? Ingenio.findOne({ where: { nombre: ingenio } })
        : Promise.resolve(null),
    ])

    // Actualizar el empleo
    const datosActualizados = {}
    if (nombre) datosActualizados.nombre = nombre
    if (descripcion) datosActualizados.descripcion = descripcion
    if (paisData) datosActualizados.paisId = paisData.id
    if (areaData) datosActualizados.areaId = areaData.id
    if (ingenioData) datosActualizados.ingenioId = ingenioData.id
    if (contacto) datosActualizados.contacto = contacto
    if (vigente !== undefined) datosActualizados.vigente = vigente

    await empleo.update(datosActualizados)

    // Eliminar archivos marcados para eliminación
    if (filesToDelete) {
      const idsToDelete = safeParseJSON(filesToDelete, [])
      await Archivo.destroy({
        where: {
          id: idsToDelete,
          empleoId: id,
        },
      })
    }

    // Subir nuevos archivos a S3 si existen
    if (archivos && archivos.length > 0) {
      const uploadPromises = archivos.map((archivo) => {
        const fileExtension = archivo.originalname.split('.').pop()
        const fileName = `empleos/${id}/${uuidv4()}.${fileExtension}`

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: archivo.buffer,
          ContentType: archivo.mimetype,
        }

        return s3
          .upload(params)
          .promise()
          .then((data) => {
            return Archivo.create({
              nombre: archivo.originalname,
              url: data.Location,
              tipo: archivo.mimetype,
              empleoId: id,
            })
          })
      })

      await Promise.all(uploadPromises)
    }

    // Obtener el empleo actualizado con todas sus relaciones
    const empleoActualizado = await Empleo.findByPk(id, {
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
        },
        {
          model: Archivo,
          as: 'archivos',
        },
        {
          model: Pais,
          as: 'pais',
          attributes: ['id', 'nombre'],
        },
        {
          model: Area,
          as: 'area',
          attributes: ['id', 'nombre'],
        },
        {
          model: Ingenio,
          as: 'ingenio',
          attributes: ['id', 'nombre'],
        },
      ],
    })

    res.json(empleoActualizado)
  } catch (error) {
    console.error('Error al actualizar empleo:', error)
    res.status(500).json({ message: 'Error al actualizar empleo', error })
  }
}

const deleteEmpleo = async (req, res) => {
  try {
    const { id } = req.params
    const usuarioId = req.user?.id

    // Verificar que el empleo existe
    const empleo = await Empleo.findByPk(id)
    if (!empleo) {
      return res.status(404).json({ message: 'Empleo no encontrado' })
    }

    // Verificar que el usuario que elimina es el creador
    if (String(empleo.usuarioId) !== String(usuarioId)) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para eliminar esta oferta' })
    }

    // Eliminar archivos asociados de S3 antes de borrarlos de la BD
    const archivos = await Archivo.findAll({ where: { empleoId: id } })
    for (const archivo of archivos) {
      try {
        await deleteFromS3(archivo.url)
      } catch (s3Error) {
        console.error('Error al eliminar archivo de S3:', archivo.url, s3Error)
      }
    }

    // Eliminar archivos asociados (Sequelize debería manejar esto con CASCADE, pero lo hacemos explícito)
    await Archivo.destroy({ where: { empleoId: id } })

    // Eliminar el empleo
    await empleo.destroy()

    res.status(200).json({ message: 'Empleo eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar empleo:', error)
    res.status(500).json({ message: 'Error al eliminar empleo', error })
  }
}

module.exports = {
  getAllEmpleos,
  getEmpleoById,
  createEmpleo,
  updateEmpleo,
  deleteEmpleo,
}
