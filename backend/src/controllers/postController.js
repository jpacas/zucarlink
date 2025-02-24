const Post = require('../models/Post')
const User = require('../models/User')
const Like = require('../models/Like')
const Area = require('../models/Area')
const Comment = require('../models/Comment')
const Archivo = require('../models/Archivo')
const s3 = require('../config/s3')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')

////////////////////////////////////////////////////////////
///// Obtener todos los posts ///////////////////////////////
////////////////////////////////////////////////////////////

const getAllPosts = async (req, res) => {
  try {
    const { tema, area, autor, orden } = req.query

    let orderConfig = [['createdAt', 'DESC']] // orden por defecto: más recientes

    // Configurar el ordenamiento según el parámetro
    switch (orden) {
      case 'antiguo':
        orderConfig = [['createdAt', 'ASC']]
        break
      case 'vistas':
        orderConfig = [['views', 'DESC']]
        break
      case 'menosVistas':
        orderConfig = [['views', 'ASC']]
        break
      default: // 'reciente' o cualquier otro valor
        orderConfig = [['createdAt', 'DESC']]
    }

    const whereClause = {}
    if (tema) {
      whereClause.titulo = { [Op.like]: `%${tema}%` }
    }
    if (area) {
      whereClause['$area.nombre$'] = area
    }
    if (autor) {
      whereClause['$autor.nombre$'] = { [Op.iLike]: `%${autor}%` }
    }

    const posts = await Post.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'usuario',
              attributes: ['id', 'nombre', 'apellido'],
            },
          ],
        },
        {
          model: Like,
          as: 'likes',
        },
        {
          model: Area,
          as: 'area',
        },
        {
          model: Archivo,
          as: 'archivos',
          attributes: ['id', 'nombre', 'url', 'tipo'],
        },
      ],
      order: orderConfig,
    })

    res.json(posts)
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
    const files = req.files // Array de archivos

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

    // Crear el post
    const newPost = await Post.create({
      titulo,
      contenido,
      areaId: areaFound.id,
      usuarioId,
    })

    // Subir archivos a S3 si existen
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => {
        const fileExtension = file.originalname.split('.').pop()
        const fileName = `posts/${newPost.id}/${uuidv4()}.${fileExtension}`

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }

        return s3
          .upload(params)
          .promise()
          .then((data) => {
            return Archivo.create({
              nombre: file.originalname,
              url: data.Location,
              tipo: file.mimetype,
              postId: newPost.id,
            })
          })
      })

      await Promise.all(uploadPromises)
    }

    // Obtener el post con sus archivos
    const postWithFiles = await Post.findByPk(newPost.id, {
      include: [
        { model: Archivo, as: 'archivos' },
        { model: Area, as: 'area' },
      ],
    })

    res.status(201).json(postWithFiles)
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

////////////////////////////////////////////////////////////
///// Obtener un post por su ID ///////////////////////////
////////////////////////////////////////////////////////////

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params

    // Buscar el post con todas sus relaciones
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'usuario',
              attributes: ['id', 'nombre', 'apellido'],
            },
          ],
        },
        {
          model: Like,
          as: 'likes',
        },
        {
          model: Area,
          as: 'area',
        },
        {
          model: Archivo,
          as: 'archivos',
        },
      ],
    })

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' })
    }

    // Obtener el post actualizado con el nuevo contador de vistas
    const updatedPost = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'usuario',
              attributes: ['id', 'nombre', 'apellido'],
            },
          ],
        },
        {
          model: Like,
          as: 'likes',
        },
        {
          model: Area,
          as: 'area',
        },
        {
          model: Archivo,
          as: 'archivos',
          attributes: ['id', 'nombre', 'url', 'tipo'],
        },
      ],
    })

    res.json(updatedPost)
  } catch (error) {
    console.error('Error al obtener el post:', error)
    res.status(500).json({ message: 'Error al obtener el post', error })
  }
}

module.exports = {
  getAllPosts,
  createPost,
  toggleLike,
  addComment,
  incrementViews,
  deleteComment,
  getPostById,
}
