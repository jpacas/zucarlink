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

const toggleLike = async (req, res) => {
  const { postId } = req.params
  const { userId } = req.body

  try {
    const post = await Post.findByPk(postId)
    if (!post) return res.status(404).json({ message: 'Post no encontrado.' })

    if (post.likes.includes(userId)) {
      // Si el usuario ya dio like, lo removemos
      post.likes = post.likes.filter((id) => id !== userId)
      await post.save()
      return res
        .status(200)
        .json({ message: 'Like removido.', likes: post.likes })
    }

    // Si no dio like, lo añadimos
    post.likes = [...post.likes, userId]
    await post.save()
    res.status(200).json({ message: 'Like añadido.', likes: post.likes })
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar el like.', error })
  }
}

const addComment = async (req, res) => {
  const { postId } = req.params
  const { userId, comment } = req.body

  try {
    const post = await Post.findByPk(postId)
    if (!post) return res.status(404).json({ message: 'Post no encontrado.' })

    post.comments.push({ userId, comment, createdAt: new Date() })
    await post.save()

    res
      .status(200)
      .json({ message: 'Comentario añadido.', comments: post.comments })
  } catch (error) {
    res.status(500).json({ message: 'Error al añadir comentario.', error })
  }
}

const incrementViews = async (req, res) => {
  const { postId } = req.params

  try {
    const post = await Post.findByPk(postId)
    if (!post) return res.status(404).json({ message: 'Post no encontrado.' })

    post.views += 1
    await post.save()

    res
      .status(200)
      .json({ message: 'Vistas incrementadas.', views: post.views })
  } catch (error) {
    res.status(500).json({ message: 'Error al incrementar vistas.', error })
  }
}

module.exports = {
  getAllPosts,
  createPost,
  toggleLike,
  addComment,
  incrementViews,
}
