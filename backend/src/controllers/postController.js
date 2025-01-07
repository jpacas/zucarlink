const Post = require('../models/Post')
const User = require('../models/User')
const { Op } = require('sequelize')

// Obtener todos los posts (con filtrado por tema o categoría)
const getAllPosts = async (req, res) => {
  try {
    const { tema, categoria } = req.query

    let whereClause = {}

    if (categoria) {
      whereClause.categoria = categoria
    }

    if (tema) {
      whereClause[Op.or] = [
        { titulo: { [Op.like]: `%${tema}%` } },
        { contenido: { [Op.like]: `%${tema}%` } },
      ]
    }

    const posts = await Post.findAll({
      where: whereClause,
      include: {
        model: User,
        as: 'autor',
        attributes: ['nombre', 'apellido', 'avatarUrl'],
      },
      order: [['createdAt', 'DESC']],
    })
    res.status(200).json(posts)
  } catch (error) {
    console.error('Error al obtener los posts:', error)
    res.status(500).json({ message: 'Error al obtener los posts', error })
  }
}

// Crear un nuevo post
const createPost = async (req, res) => {
  try {
    const { titulo, contenido, categoria, usuarioId } = req.body

    if (!titulo || !contenido || !categoria || !usuarioId) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son obligatorios.' })
    }

    const newPost = await Post.create({
      titulo,
      contenido,
      categoria,
      usuarioId,
    })

    res.status(201).json(newPost)
  } catch (error) {
    console.error('Error al crear el post:', error)
    res.status(500).json({ message: 'Error al crear el post', error })
  }
}

module.exports = { getAllPosts, createPost }
