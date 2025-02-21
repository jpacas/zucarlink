const Pais = require('../models/Pais')
const Area = require('../models/Area')
const Ingenio = require('../models/Ingenio')
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

module.exports = { getPaises, getAreas, getIngenios }
