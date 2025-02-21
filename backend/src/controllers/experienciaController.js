const Experiencia = require('../models/Experiencia') // Asegúrate de que la ruta al modelo es correcta
const Ingenio = require('../models/Ingenio')
const Area = require('../models/Area')
const Pais = require('../models/Pais')

// Obtener todas las experiencias de un usuario
exports.getExperiencias = async (req, res) => {
  try {
    // Validar que el userId es válido
    if (!req.params.userId) {
      return res
        .status(400)
        .json({ message: 'El ID del usuario es requerido.' })
    }

    const response = await Experiencia.findAll({
      where: { UserId: req.params.userId },
      include: [
        {
          model: Ingenio,
          attributes: ['nombre'],
          as: 'ingenio',
        },
        {
          model: Area,
          attributes: ['nombre'],
          as: 'area',
        },
        {
          model: Pais,
          attributes: ['nombre'],
          as: 'pais',
        },
      ],
    })

    if (response.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron experiencias para este usuario.',
      })
    }

    const experiencias = response.map((experiencia) => ({
      id: experiencia.id,
      fechaInicio: experiencia.fechaInicio,
      fechaFin: experiencia.fechaFin,
      cargo: experiencia.cargo,
      area: experiencia.area.nombre,
      ingenio: experiencia.ingenio.nombre,
      pais: experiencia.pais.nombre,
      actualmenteTrabaja: experiencia.actualmenteTrabaja,
      acercaDe: experiencia.acercaDe,
      ingenio: experiencia.ingenio.nombre,
      area: experiencia.area.nombre,
      pais: experiencia.pais.nombre,
    }))

    res.json(experiencias)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las experiencias.',
      error: error.message,
    })
  }
}

// Crear una nueva experiencia
exports.createExperiencia = async (req, res) => {
  try {
    const {
      ingenio,
      fechaInicio,
      fechaFin,
      cargo,
      area,
      acercaDe,
      actualmenteTrabaja,
      pais,
    } = req.body
    const { userId } = req.params

    // Validación de entrada
    if (
      !userId ||
      !ingenio ||
      !fechaInicio ||
      !cargo ||
      !area ||
      !acercaDe ||
      !pais
    ) {
      return res.status(400).json({
        message: 'Todos los campos necesarios deben ser proporcionados.',
      })
    }

    const ingenioObj = await Ingenio.findOne({ where: { nombre: ingenio } })
    const areaObj = await Area.findOne({ where: { nombre: area } })
    const paisObj = await Pais.findOne({ where: { nombre: pais } })

    const ingenioId = ingenioObj ? Number(ingenioObj.id) : null
    const areaId = areaObj ? Number(areaObj.id) : null
    const paisId = paisObj ? Number(paisObj.id) : null

    if (!areaId || !ingenioId || !paisId) {
      return res.status(400).json({
        message: 'Los campos area, ingenio y pais deben ser proporcionados.',
      })
    }

    // Validar que fechaFin solo se almacene si actualmenteTrabaja es false
    const experiencia = await Experiencia.create({
      userId,
      fechaInicio,
      fechaFin: actualmenteTrabaja ? null : fechaFin, // Si trabaja actualmente, fechaFin es null
      actualmenteTrabaja,
      cargo,
      areaId,
      ingenioId,
      paisId,
      acercaDe,
    })

    res.status(201).json(experiencia)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: 'Error al crear la experiencia.', error: error.message })
  }
}

exports.updateExperiencia = async (req, res) => {
  const { expId } = req.params
  const {
    userId,
    ingenio,
    fechaInicio,
    fechaFin,
    cargo,
    area,
    acercaDe,
    actualmenteTrabaja,
    pais,
  } = req.body

  try {
    // Buscar la experiencia por ID
    const experiencia = await Experiencia.findOne({ where: { id: expId } })

    if (!experiencia) {
      return res.status(404).json({ message: 'Experiencia no encontrada' })
    }

    // Verificar que el usuario autenticado sea el dueño de la experiencia
    if (experiencia.userId !== userId) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para editar esta experiencia' })
    }

    const ingenioObj = await Ingenio.findOne({ where: { nombre: ingenio } })
    const areaObj = await Area.findOne({ where: { nombre: area } })
    const paisObj = await Pais.findOne({ where: { nombre: pais } })

    const ingenioId = ingenioObj ? Number(ingenioObj.id) : experiencia.ingenioId
    const areaId = areaObj ? Number(areaObj.id) : experiencia.areaId
    const paisId = paisObj ? Number(paisObj.id) : experiencia.paisId

    console.log('IDs obtenidos antes de guardar:')
    console.log('ingenioId:', ingenioId, typeof ingenioId)
    console.log('areaId:', areaId, typeof areaId)
    console.log('paisId:', paisId, typeof paisId)

    // Validaciones: si nunca tuvo estos valores y no se envían, es un error
    if (!areaObj && !experiencia.areaId) {
      return res.status(400).json({ message: 'El área es requerida.' })
    }
    if (!ingenioObj && !experiencia.ingenioId) {
      return res.status(400).json({ message: 'El ingenio es requerido.' })
    }
    if (!paisObj && !experiencia.paisId) {
      return res.status(400).json({ message: 'El país es requerido.' })
    }

    // Preparar datos a actualizar
    const updatedData = {
      ingenioId,
      fechaInicio: fechaInicio ?? experiencia.fechaInicio,
      fechaFin: actualmenteTrabaja
        ? null
        : fechaFin !== undefined
        ? fechaFin
        : experiencia.fechaFin,
      cargo: cargo ?? experiencia.cargo,
      areaId,
      acercaDe: acercaDe ?? experiencia.acercaDe,
      actualmenteTrabaja: actualmenteTrabaja ?? experiencia.actualmenteTrabaja,
      paisId,
    }

    // Verificar si hay cambios
    const hasChanges = Object.keys(updatedData).some(
      (key) => updatedData[key] !== experiencia[key]
    )

    if (!hasChanges) {
      return res
        .status(400)
        .json({ message: 'No hay cambios en la experiencia.' })
    }

    // Actualizar la experiencia
    await experiencia.update(updatedData)

    res.status(200).json({
      message: 'Experiencia actualizada exitosamente',
      experiencia: updatedData,
    })
  } catch (error) {
    console.error('Error al actualizar la experiencia:', error)
    res
      .status(500)
      .json({ message: 'Error interno del servidor', error: error.message })
  }
}

exports.deleteExperience = async (req, res) => {
  const { expId } = req.params
  const { userId } = req.body

  try {
    const experience = await Experiencia.findOne({
      where: { id: expId },
    })

    if (!experience) {
      return res.status(404).json({ message: 'Experiencia no encontrada' })
    }

    // Verifica que el usuario autenticado sea el dueño de la experiencia
    if (experience.userId !== userId) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para eliminar esta experiencia' })
    }

    await experience.destroy()
    res.status(200).json({ message: 'Experiencia eliminada exitosamente' })
  } catch (error) {
    console.error('Error al eliminar experiencia:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
