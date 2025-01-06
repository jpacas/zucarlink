const Post = require('../models/Post')
const User = require('../models/User')

// Obtener todos los posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        as: 'autor',
        attributes: ['nombre', 'apellido', 'avatarUrl'],
      },
      order: [['fechaCreacion', 'DESC']],
    })
    res.status(200).json(posts)
  } catch (error) {
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
        .json({ message: 'Todos los campos son obligatorios' })
    }

    const newPost = await Post.create({
      titulo,
      contenido,
      categoria,
      usuarioId,
    })
    res.status(201).json(newPost)
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el post', error })
  }
}

// Obtener posts por categoría
const getPostsByCategory = async (req, res) => {
  const { categoria } = req.query

  try {
    const posts = await Post.findAll({
      where: { categoria },
      include: {
        model: User,
        as: 'autor',
        attributes: ['nombre', 'apellido', 'avatarUrl'],
      },
      order: [['fechaCreacion', 'DESC']],
    })
    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({ message: 'Error al filtrar los posts', error })
  }
}

module.exports = { getAllPosts, createPost, getPostsByCategory }
