const WikiArticulo = require('../models/WikiArticulo')
const WikiRevision = require('../models/WikiRevision')
const User = require('../models/User')
const slugify = require('slugify')

// GET /wiki — list all articles
const getArticulos = async (req, res) => {
  try {
    const { categoria } = req.query
    const where = categoria ? { categoria } : {}
    const articulos = await WikiArticulo.findAll({
      where,
      attributes: ['id', 'titulo', 'slug', 'resumen', 'categoria', 'vistas', 'createdAt', 'updatedAt'],
      include: [{ model: User, as: 'autor', attributes: ['nombre', 'apellido', 'username'] }],
      order: [['updatedAt', 'DESC']],
    })
    res.json(articulos)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener artículos', error })
  }
}

// GET /wiki/:slug — get article by slug
const getArticulo = async (req, res) => {
  try {
    const { slug } = req.params
    const articulo = await WikiArticulo.findOne({
      where: { slug },
      include: [
        { model: User, as: 'autor', attributes: ['nombre', 'apellido', 'username'] },
        {
          model: WikiRevision, as: 'revisiones',
          include: [{ model: User, as: 'editor', attributes: ['nombre', 'apellido', 'username'] }],
          order: [['createdAt', 'DESC']],
          limit: 10,
        },
      ],
    })
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' })

    // Increment views
    await articulo.increment('vistas')
    res.json(articulo)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el artículo', error })
  }
}

// POST /wiki — create article (requires auth)
const createArticulo = async (req, res) => {
  try {
    const { titulo, contenidoMarkdown, resumen, categoria } = req.body
    const autorId = req.user?.id

    if (!titulo || !contenidoMarkdown) {
      return res.status(400).json({ message: 'titulo y contenidoMarkdown son requeridos' })
    }

    const slug = slugify(titulo, { lower: true, strict: true, locale: 'es' }) + '-' + Date.now()

    const articulo = await WikiArticulo.create({ titulo, slug, contenidoMarkdown, resumen, categoria: categoria || 'General', autorId })

    res.status(201).json(articulo)
  } catch (error) {
    res.status(500).json({ message: 'Error al crear artículo', error })
  }
}

// PUT /wiki/:slug — edit article (saves revision)
const updateArticulo = async (req, res) => {
  try {
    const { slug } = req.params
    const { contenidoMarkdown, resumen, titulo } = req.body
    const usuarioId = req.user?.id
    const userReputacion = req.user?.reputacion || 0
    const userPlan = req.user?.planType || 'free'

    // Check edit permission: reputacion >= 500 or pro
    if (userReputacion < 500 && userPlan !== 'pro') {
      return res.status(403).json({
        message: 'Necesitas 500 puntos de reputación o plan Pro para editar la wiki',
        code: 'insufficient_reputation'
      })
    }

    const articulo = await WikiArticulo.findOne({ where: { slug } })
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' })

    // Save revision first
    await WikiRevision.create({
      articuloId: articulo.id,
      usuarioId,
      contenidoMarkdown: articulo.contenidoMarkdown, // save old content
      resumen: `Editado por usuario`,
    })

    await articulo.update({ contenidoMarkdown, resumen, titulo: titulo || articulo.titulo })
    res.json(articulo)
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar artículo', error })
  }
}

module.exports = { getArticulos, getArticulo, createArticulo, updateArticulo }
