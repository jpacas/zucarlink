const Experiencia = require('../models/Experiencia') // Asegúrate de que la ruta al modelo es correcta

// Obtener todas las experiencias de un usuario
exports.getExperiencias = async (req, res) => {
  try {
    // Validar que el userId es válido
    if (!req.params.userId) {
      return res
        .status(400)
        .json({ message: 'El ID del usuario es requerido.' })
    }

    const experiencias = await Experiencia.findAll({
      where: { UserId: req.params.userId },
    })

    if (experiencias.length === 0) {
      return (
        res
          //.status(404)
          .json({
            message: 'No se encontraron experiencias para este usuario.',
          })
      )
    }

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
    } = req.body
    const { userId } = req.params

    // Validación de entrada
    if (!userId || !ingenio || !fechaInicio || !cargo || !area || !acercaDe) {
      return res.status(400).json({
        message: 'Todos los campos necesarios deben ser proporcionados.',
      })
    }

    // Validar que fechaFin solo se almacene si actualmenteTrabaja es false
    const experiencia = await Experiencia.create({
      userId,
      ingenio,
      fechaInicio,
      fechaFin: actualmenteTrabaja ? null : fechaFin, // Si trabaja actualmente, fechaFin es null
      actualmenteTrabaja,
      cargo,
      area,
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

    // Preparar datos a actualizar, asegurando que no se pierdan valores si no son enviados
    const updatedData = {
      ingenio: ingenio ?? experiencia.ingenio,
      fechaInicio: fechaInicio ?? experiencia.fechaInicio,
      fechaFin: actualmenteTrabaja ? null : fechaFin ?? experiencia.fechaFin,
      cargo: cargo ?? experiencia.cargo,
      area: area ?? experiencia.area,
      acercaDe: acercaDe ?? experiencia.acercaDe,
      actualmenteTrabaja: actualmenteTrabaja ?? experiencia.actualmenteTrabaja,
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
