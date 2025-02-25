const Empleo = require('../models/Empleo')
const User = require('../models/User')
const Archivo = require('../models/Archivo')
const Pais = require('../models/Pais')
const Area = require('../models/Area')
const Ingenio = require('../models/Ingenio')

const getAllEmpleos = async (req, res) => {
  try {
    const empleos = await Empleo.findAll({
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
      ],
      order: [['createdAt', 'DESC']],
    })
    res.json(empleos)
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
      ],
    })

    if (!empleo) {
      return res.status(404).json({ message: 'Empleo no encontrado' })
    }

    res.json(empleo)
  } catch (error) {
    console.error('Error al obtener empleo:', error)
    res.status(500).json({ message: 'Error al obtener empleo', error })
  }
}

const createEmpleo = async (req, res) => {
  try {
    const { nombre, descripcion, ingenio, area, pais, contacto, usuarioId } =
      req.body
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
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' })
    }

    const [paisData, areaData, ingenioData] = await Promise.all([
      Pais.findOne({ where: { nombre: pais } }),
      Area.findOne({ where: { nombre: area } }),
      Ingenio.findOne({ where: { nombre: ingenio } }),
    ])

    const paisId = paisData.id
    const areaId = areaData.id
    const ingenioId = ingenioData.id

    if (!paisId || !areaId || !ingenioId) {
      return res
        .status(400)
        .json({ message: 'Pais, area o ingenio no encontrado' })
    }

    const empleo = await Empleo.create({
      nombre,
      descripcion,
      ingenioId,
      areaId,
      paisId,
      contacto,
      usuarioId,
      vigente: true,
    })

    if (archivos && archivos.length > 0) {
      const archivosData = archivos.map((archivo) => ({
        nombre: archivo.originalname,
        url: archivo.path,
        tipo: archivo.mimetype,
        empleoId: empleo.id,
      }))
      await Archivo.bulkCreate(archivosData)
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
      ],
    })

    res.status(201).json(empleoCreado)
  } catch (error) {
    console.error('Error al crear empleo:', error)
    res.status(500).json({ message: 'Error al crear empleo', error })
  }
}

// Implementar también updateEmpleo y deleteEmpleo similares a los de Post

module.exports = {
  getAllEmpleos,
  getEmpleoById,
  createEmpleo,
}
