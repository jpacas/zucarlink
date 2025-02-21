const Post = require('../models/Post')
const User = require('../models/User')
const Like = require('../models/Like')
const Area = require('../models/Area')
const Comment = require('../models/Comment')
const { Op } = require('sequelize')

////////////////////////////////////////////////////////////
///// Obtener todos los posts ///////////////////////////////
////////////////////////////////////////////////////////////

const getAllPosts = async (req, res) => {
  try {
    const { tema, area } = req.query

    let whereClause = {}
    let include = [
      {
        model: User,
        as: 'autor',
        attributes: ['nombre', 'apellido', 'avatarUrl'],
      },
      {
        model: Comment,
        as: 'comments',
        attributes: ['id', 'contenido', 'usuarioId'],
        include: [
          { model: User, as: 'usuario', attributes: ['nombre', 'apellido'] },
        ],
      },
      {
        model: Like,
        as: 'likes',
        attributes: ['activo', 'usuarioId'],
      },
    ]

    if (area) {
      include.push({
        model: Area,
        as: 'area',
        where: { nombre: { [Op.like]: `%${area}%` } },
      })
    } else {
      // Si no hay filtro de área, incluyes el modelo Area normal
      include.push({
        model: Area,
        as: 'area',
        attributes: ['nombre'],
      })
    }

    if (tema) {
      whereClause[Op.or] = [
        { titulo: { [Op.like]: `%${tema}%` } },
        { contenido: { [Op.like]: `%${tema}%` } },
      ]
    }

    const posts = await Post.findAll({
      where: whereClause,
      attributes: {
        exclude: ['areaId'],
      },
      include,
      order: [['createdAt', 'DESC']],
    })
    res.status(200).json(posts)
  } catch (error) {
    console.error('Error al obtener los posts:', error)
    res.status(500).json({ message: 'Error al obtener los posts', error })
  }
}

////////////////////////////////////////////////////////////
///// Crear un nuevo post //////////////////////////////////
////////////////////////////////////////////////////////////

const createPost = async (req, res) => {
  try {
    const { titulo, contenido, area, usuarioId } = req.body

    if (!titulo || !contenido || !area || !usuarioId) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son obligatorios.' })
    }

    const areaFound = await Area.findOne({
      where: { nombre: area },
    })

    if (!areaFound) {
      return res
        .status(404)
        .json({ message: 'El área especificada no existe.' })
    }

    const newPost = await Post.create({
      titulo,
      contenido,
      areaId: areaFound.id,
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
    if (!userId) {
      return res.status(400).json({ message: 'Se requiere un userId válido.' })
    }

    const [userExists, postExists] = await Promise.all([
      User.findByPk(userId),
      Post.findByPk(postId),
    ])

    if (!userExists)
      return res.status(404).json({ message: 'Usuario no encontrado.' })
    if (!postExists)
      return res.status(404).json({ message: 'Post no encontrado.' })

    // Buscar si el usuario ya ha dado like al post
    let existingLike = await Like.findOne({
      where: { postId, usuarioId: userId },
    })

    let userHasLiked = false

    if (existingLike) {
      // Alternar entre 0 y 1
      existingLike.activo = existingLike.activo ? 0 : 1
      await existingLike.save()
      userHasLiked = existingLike.activo === true
    } else {
      // Si no existe, se crea con activo = 1
      existingLike = await Like.create({ postId, usuarioId: userId, activo: 1 })
      userHasLiked = true
    }
    const updatedLikes = await Like.findAll({
      where: { postId },
      attributes: ['activo', 'usuarioId'],
    })

    // Verificas si el user tiene like activo en ese array
    userHasLiked = updatedLikes.some(
      (like) => like.usuarioId === userId && like.activo
    )

    res.status(200).json({
      message: userHasLiked ? 'Like añadido.' : 'Like removido.',
      likes: updatedLikes, // ahora es un array
      userHasLiked,
    })
  } catch (error) {
    console.error('Error al procesar el like:', error)
    res.status(500).json({ message: 'Error al procesar el like.', error })
  }
}

////////////////////////////////////////////////////////////
///// Añadir un comentario a un post //////////////////////
////////////////////////////////////////////////////////////

const addComment = async (req, res) => {
  try {
    const { postId } = req.params
    const { usuarioId, contenido } = req.body

    // Verificar si el usuario existe
    const userExists = await User.findByPk(usuarioId, {
      attributes: ['id', 'nombre', 'apellido'],
    })
    if (!userExists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' })
    }

    // Verificar si el post existe
    const postExists = await Post.findByPk(postId)
    if (!postExists) {
      return res.status(404).json({ message: 'Post no encontrado.' })
    }

    // Crear el comentario en la base de datos
    const newComment = await Comment.create({
      contenido,
      usuarioId,
      postId,
    })

    // Obtener la lista de comentarios actualizada
    const updatedComments = await Comment.findAll({
      where: { postId },
      include: [
        { model: User, as: 'usuario', attributes: ['nombre', 'apellido'] },
      ],
      order: [['createdAt', 'ASC']], // Ordenar por fecha de creación
    })

    res.status(201).json({
      message: 'Comentario añadido correctamente',
      comments: updatedComments,
    })
  } catch (error) {
    console.error('Error al añadir comentario:', error)
    res.status(500).json({ message: 'Error al añadir comentario.', error })
  }
}

////////////////////////////////////////////////////////////
///// Eliminar un comentario de un post ////////////////////
////////////////////////////////////////////////////////////

const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params
  try {
    const post = await Post.findByPk(postId)
    if (!post) return res.status(404).json({ message: 'Post no encontrado.' })

    // Verificar que exista el comentario
    const commentToDelete = await Comment.findOne({
      where: { id: commentId, postId },
    })
    if (!commentToDelete) {
      return res.status(404).json({ message: 'Comentario no encontrado.' })
    }

    await commentToDelete.destroy()

    // Retornar la lista actualizada
    const updatedComments = await Comment.findAll({
      where: { postId },
      include: [
        { model: User, as: 'usuario', attributes: ['nombre', 'apellido'] },
      ],
      order: [['createdAt', 'ASC']],
    })

    res.status(200).json({
      message: 'Comentario eliminado.',
      comments: updatedComments,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar comentario.', error })
  }
}

////////////////////////////////////////////////////////////
///// Incrementar el número de vistas de un post ////////////
////////////////////////////////////////////////////////////

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
  deleteComment,
}
