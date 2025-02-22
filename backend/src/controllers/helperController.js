const Pais = require('../models/Pais')
const Area = require('../models/Area')
const Ingenio = require('../models/Ingenio')
const Proveedor = require('../models/Proveedor')
const s3 = require('../config/s3')
//Enviar listado de paises disponibles
const getPaises = async (req, res) => {
  try {
    const paises = await Pais.findAll({ attributes: ['nombre'] })

    if (!paises.length) {
      return res.status(204).send() // No hay contenido
    }

    res.status(200).json(paises)
  } catch (error) {
    console.error('Error al obtener países:', error)
    res.status(500).json({ error: error.message })
  }
}

//Enviar listado de areas disponibles
const getAreas = async (req, res) => {
  try {
    const areas = await Area.findAll({ attributes: ['nombre'] })

    if (!areas.length) {
      return res.status(204).send() // No hay contenido
    }

    res.status(200).json(areas)
  } catch (error) {
    console.error('Error al obtener areas:', error)
    res.status(500).json({ error: error.message })
  }
}

//Enviar listado de proveedores disponibles
const getProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({ attributes: ['nombre'] })

    if (!proveedores.length) {
      return res.status(204).send() // No hay contenido
    }

    res.status(200).json(proveedores)
  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    res.status(500).json({ error: error.message })
  }
}

//Enviar listado de ingenios disponibles
const getIngenios = async (req, res) => {
  try {
    const response = await Ingenio.findAll({
      attributes: ['nombre'],
      include: [
        {
          model: Pais,
          as: 'pais',
          attributes: ['nombre'],
        },
      ],
    })

    if (!response.length) {
      return res.status(204).send() // No hay contenido
    }

    const ingenios = response.map((ingenio) => ({
      nombre: ingenio.nombre,
      pais: ingenio.pais.nombre,
    }))

    res.status(200).json(ingenios)
  } catch (error) {
    console.error('Error al obtener areas:', error)
    res.status(500).json({ error: error.message })
  }
}

const registerProveedor = async (req, res) => {
  try {
    const { nombre, pais, email, webpage, descripcion } = req.body

    const paisId = await Pais.findOne({ where: { nombre: pais } })

    if (!paisId) {
      return res.status(400).json({ error: 'Pais no encontrado' })
    }

    let logo =
      'https://zucarlink-profiles.s3.us-east-2.amazonaws.com/uploads/avatar-generico.jpg'
    if (req.file) {
      logo = await uploadToS3(req.file)
    }

    const proveedor = await Proveedor.create({
      nombre,
      paisId: paisId.id,
      email,
      webpage,
      descripcion,
      logo,
    })

    if (!proveedor) {
      return res.status(400).json({ error: 'Error al registrar proveedor' })
    }

    res.status(201).json(proveedor)
  } catch (error) {
    console.error('Error al registrar proveedor:', error)
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getPaises,
  getAreas,
  getIngenios,
  getProveedores,
  registerProveedor,
}
