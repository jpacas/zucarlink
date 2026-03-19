const Proveedor = require('../models/Proveedor')
const Maquinaria = require('../models/Maquinaria')
const Empleo = require('../models/Empleo')
const User = require('../models/User')
const { Op } = require('sequelize')

// POST /analytics/track — track a view
const trackView = async (req, res) => {
  try {
    const { tipo, id } = req.body

    const VALID_TIPOS = ['proveedor', 'maquinaria', 'empleo']
    if (!VALID_TIPOS.includes(tipo)) {
      return res.status(400).json({ error: 'tipo inválido' })
    }

    const parsedId = parseInt(id, 10)
    if (!parsedId || parsedId <= 0) {
      return res.status(400).json({ error: 'id inválido' })
    }

    if (tipo === 'proveedor') {
      await Proveedor.increment('vistas', { where: { id: parsedId } })
    } else if (tipo === 'maquinaria') {
      await Maquinaria.increment('vistas', { where: { id: parsedId } })
    } else if (tipo === 'empleo') {
      await Empleo.increment('views', { where: { id: parsedId } })
    }

    res.json({ tracked: true })
  } catch (error) {
    console.error('Error tracking view:', error)
    res.status(500).json({ error: 'Error al registrar vista' })
  }
}

// GET /analytics/empresa/:proveedorId — get analytics for a company
const getEmpresaAnalytics = async (req, res) => {
  try {
    const { proveedorId } = req.params
    const usuarioId = req.user?.id

    // Security: user must belong to this proveedor
    const user = await User.findByPk(usuarioId)
    if (!user || String(user.proveedorId) !== String(proveedorId)) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const proveedor = await Proveedor.findByPk(proveedorId, {
      attributes: ['id', 'nombre', 'vistas', 'estado', 'planType'],
    })
    if (!proveedor) return res.status(404).json({ error: 'Empresa no encontrada' })

    const maquinarias = await Maquinaria.findAll({
      where: { proveedorId },
      attributes: ['id', 'nombre', 'vistas', 'createdAt'],
      order: [['vistas', 'DESC']],
    })

    const empleos = await Empleo.findAll({
      include: [{
        model: User,
        as: 'autor',
        where: { proveedorId },
        attributes: [],
        required: true,
      }],
      attributes: ['id', 'nombre', 'views', 'createdAt'],
      order: [['views', 'DESC']],
    })

    const totalVistas =
      proveedor.vistas +
      maquinarias.reduce((sum, m) => sum + (m.vistas || 0), 0) +
      empleos.reduce((sum, e) => sum + (e.views || 0), 0)

    res.json({
      proveedor: {
        id: proveedor.id,
        nombre: proveedor.nombre,
        vistas: proveedor.vistas,
        estado: proveedor.estado,
        planType: proveedor.planType,
      },
      maquinarias,
      empleos,
      totalVistas,
      resumen: {
        vistasPerfil: proveedor.vistas,
        vistasMaquinarias: maquinarias.reduce((sum, m) => sum + (m.vistas || 0), 0),
        vistasEmpleos: empleos.reduce((sum, e) => sum + (e.views || 0), 0),
      },
    })
  } catch (error) {
    console.error('Error getting analytics:', error)
    res.status(500).json({ error: 'Error al obtener analytics' })
  }
}

module.exports = { trackView, getEmpresaAnalytics }
