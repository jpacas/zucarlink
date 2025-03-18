const Pais = require('../models/Pais')
const Area = require('../models/Area')
const Ingenio = require('../models/Ingenio')
const Proveedor = require('../models/Proveedor')
const User = require('../models/User')
const { uploadToS3 } = require('./serverFunctions')
const sequelize = require('sequelize')

////////////////////////////////////////////////////////////
///// Enviar listado de paises disponibles ////////////////
///////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////
///// Enviar listado de areas disponibles ////////////////
///////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////
///// Enviar listado de proveedores disponibles ///////////
///////////////////////////////////////////////////////////

const getProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      where: {
        estado: 'activo',
      },
      attributes: [
        'id',
        'nombre',
        'email',
        'paginaWeb',
        'logo',
        'descripcion',
        'nombrePais',
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM Users WHERE Users.proveedorId = Proveedor.id)'
          ),
          'usuariosCount',
        ],
      ],
      include: [
        {
          model: Pais,
          as: 'pais',
          attributes: ['nombre'],
        },
        {
          model: User,
          as: 'users',
          attributes: [],
        },
      ],
    })

    if (!proveedores.length) {
      return res.status(204).send([]) // No hay contenido
    }

    const proveedoresFormateados = proveedores.map((proveedor) => ({
      id: proveedor.id,
      nombre: proveedor.nombre,
      email: proveedor.email,
      paginaWeb: proveedor.paginaWeb,
      logo: proveedor.logo,
      descripcion: proveedor.descripcion,
      nombrePais: proveedor.nombrePais,
      usuariosCount: proveedor.getDataValue('usuariosCount'),
    }))

    res.status(200).json(proveedoresFormateados)
  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    res.status(500).json({ error: error.message })
  }
}

////////////////////////////////////////////////////////////
///// Enviar listado de ingenios disponibles ///////////////
///////////////////////////////////////////////////////////

const getIngenios = async (req, res) => {
  try {
    const response = await Ingenio.findAll({
      attributes: [
        'nombre',
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM Users WHERE Users.ingenioId = Ingenio.id)'
          ),
          'usuariosCount',
        ],
      ],
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
      usuariosCount: ingenio.getDataValue('usuariosCount'),
    }))

    res.status(200).json(ingenios)
  } catch (error) {
    console.error('Error al obtener areas:', error)
    res.status(500).json({ error: error.message })
  }
}

////////////////////////////////////////////////////////////
///// Registrar nuevo proveedor ///////////////////////////
///////////////////////////////////////////////////////////

const registerProveedor = async (req, res) => {
  const { nombre, pais, email, paginaWeb, descripcion, paymentIntent } =
    req.body

  try {
    const whereClause = { email }
    if (paymentIntent) {
      whereClause[sequelize.Op.or] = [
        { email },
        { stripePaymentIntentId: paymentIntent },
      ]
    }

    const proveedorExistente = await Proveedor.findOne({
      where: whereClause,
    })

    if (proveedorExistente) {
      return res.status(200).json(proveedorExistente)
    }

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
      nombrePais: pais,
      email,
      paginaWeb,
      descripcion,
      fechaRegistro: new Date(),
      logo,
      estado: 'pendiente',
      stripePaymentIntentId: paymentIntent,
    })

    if (!proveedor) {
      return res.status(400).json({ error: 'Error al registrar proveedor' })
    }

    res.status(201).json(proveedor)
  } catch (error) {
    console.error('Error en registerProveedor:', error)
    res.status(500).json({ error: error.message })
  }
}

////////////////////////////////////////////////////////////
///// Obtener proveedor por ID /////////////////////////////
///////////////////////////////////////////////////////////

const getProveedorById = async (req, res) => {
  try {
    const { id } = req.params
    const proveedor = await Proveedor.findByPk(id)

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' })
    }

    res.status(200).json(proveedor)
  } catch (error) {
    console.error('Error al obtener proveedor:', error)
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getPaises,
  getAreas,
  getIngenios,
  getProveedores,
  registerProveedor,
  getProveedorById,
}
