const Post = require('../models/Post')
const User = require('../models/User')
const Like = require('../models/Like')
const Area = require('../models/Area')
const Comment = require('../models/Comment')
const Archivo = require('../models/Archivo')
const { uploadToS3 } = require('./serverFunctions')
const { Op } = require('sequelize')
const { safeParseJSON } = require('../utils/helpers')
const { parsePaginationParams, buildPaginationResponse } = require('../utils/pagination')
const sequelize = require('../config/database')

////////////////////////////////////////////////////////////
///// Obtener todos los posts ///////////////////////////////
////////////////////////////////////////////////////////////

const getAllPosts = async (req, res) => {
  try {
    const { tema, area, autor, orden } = req.query

    // Parsear parámetros de paginación
    const { page, limit, offset } = parsePaginationParams(req.query)

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
      whereClause['$autor.nombre$'] = { [Op.like]: `%${autor}%` }
    }

    // Usar findAndCountAll para obtener total y datos paginados
    const { count, rows: posts } = await Post.findAndCountAll({
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
      limit,
      offset,
      distinct: true, // Para contar correctamente con includes
    })

    res.json({
      data: posts,
      pagination: buildPaginationResponse(count, page, limit),
    })
  } catch (error) {
    console.error('Error al obtener los posts:', error)
    res.status(500).json({ message: 'Error al obtener los posts', error })
  }
}

////////////////////////////////////////////////////////////
///// Obtener un post por su ID ///////////////////////////
////////////////////////////////////////////////////////////

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params

    const post = await Post.findByPk(postId, {
      attributes: [
        'id',
        'titulo',
        'contenido',
        'createdAt',
        'updatedAt',
        'views',
        'areaId',
        'usuarioId',
      ],
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
        },

        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'contenido', 'createdAt'],
          include: [
            {
              model: User,
              as: 'usuario',
              attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
            },
          ],
        },

        {
          model: Like,
          as: 'likes',
          attributes: ['activo', 'usuarioId'],
        },
        {
          model: Area,
          as: 'area',
          attributes: ['nombre'],
        },
        {
          model: Archivo,
          as: 'archivos',
          attributes: ['id', 'nombre', 'url', 'tipo'],
        },
      ],
    })

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' })
    }

    incrementViews(postId)

    res.json(post)
  } catch (error) {
    console.error('Error al obtener el post:', error)
    res.status(500).json({ message: 'Error al obtener el post', error })
  }
}

////////////////////////////////////////////////////////////
///// Crear un nuevo post //////////////////////////////////
////////////////////////////////////////////////////////////

const createPost = async (req, res) => {
  const transaction = await sequelize.transaction()
  const uploadedUrls = [] // Para rastrear archivos subidos a S3

  try {
    const { titulo, contenido, area } = req.body
    const usuarioId = req.user?.id
    const files = req.files // Array de archivos

    if (!titulo || !contenido || !area || !usuarioId) {
      await transaction.rollback()
      return res
        .status(400)
        .json({ message: 'Todos los campos son obligatorios.' })
    }

    const areaFound = await Area.findOne({
      where: { nombre: area },
    })

    if (!areaFound) {
      await transaction.rollback()
      return res
        .status(404)
        .json({ message: 'El área especificada no existe.' })
    }

    // Crear el post dentro de la transacción
    const newPost = await Post.create({
      titulo,
      contenido,
      areaId: areaFound.id,
      usuarioId,
    }, { transaction })

    // Subir archivos a S3 si existen
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const url = await uploadToS3(file)
        uploadedUrls.push(url) // Rastrear URL subida
        return Archivo.create({
          nombre: file.originalname,
          url,
          tipo: file.mimetype,
          postId: newPost.id,
        }, { transaction })
      })

      await Promise.all(uploadPromises)
    }

    // Obtener el post con sus archivos
    const postWithFiles = await Post.findByPk(newPost.id, {
      include: [
        { model: Archivo, as: 'archivos' },
        { model: Area, as: 'area' },
      ],
      transaction,
    })

    // Si todo salió bien, hacer commit
    await transaction.commit()
    res.status(201).json(postWithFiles)
  } catch (error) {
    console.error('Error al crear el post:', error)
    // Rollback de la transacción
    await transaction.rollback()

    // TODO: Implementar limpieza de archivos de S3 si es necesario
    // Por ahora, los archivos quedarán huérfanos en S3 en caso de error
    // Se recomienda implementar un job de limpieza periódica

    res.status(500).json({ message: 'Error al crear el post', error })
  }
}

////////////////////////////////////////////////////////////
///// Toggle like a un post ///////////////////////////////
////////////////////////////////////////////////////////////

const toggleLike = async (req, res) => {
  const { postId } = req.params
  const userId = req.user?.id

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
    const { contenido } = req.body
    const usuarioId = req.user?.id

    if (!usuarioId) {
      return res.status(400).json({ message: 'Usuario no autenticado.' })
    }

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
  const usuarioId = req.user?.id
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

    // Verificar que el usuario sea el propietario del comentario
    if (String(commentToDelete.usuarioId) !== String(usuarioId)) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario.' })
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

const incrementViews = async (postId) => {
  try {
    const post = await Post.findByPk(postId)
    if (!post) return { message: 'Post no encontrado.' }

    post.views += 1
    await post.save()
  } catch (error) {
    console.error('Error al incrementar vistas:', error)
  }
}

const incrementViewsHandler = async (req, res) => {
  try {
    const { postId } = req.params
    const post = await Post.findByPk(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado.' })
    }

    post.views += 1
    await post.save()

    res.status(200).json({ message: 'Vista registrada.' })
  } catch (error) {
    console.error('Error al incrementar vistas:', error)
    res.status(500).json({ message: 'Error al incrementar vistas.', error })
  }
}

////////////////////////////////////////////////////////////
///// Eliminar un post ////////////////////////////////////
////////////////////////////////////////////////////////////

const deletePost = async (req, res) => {
  try {
    const { id } = req.params
    const usuarioId = req.user?.id

    const post = await Post.findByPk(id)

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' })
    }

    if (post.usuarioId !== usuarioId) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para eliminar este post' })
    }

    await post.destroy()
    res.json({ message: 'Post eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar el post:', error)
    res.status(500).json({ message: 'Error al eliminar el post', error })
  }
}

////////////////////////////////////////////////////////////
///// Actualizar un post ///////////////////////////////////
////////////////////////////////////////////////////////////

const updatePost = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    const { titulo, contenido, area, filesToDelete } = req.body
    const usuarioId = req.user?.id
    const archivos = req.files

    const post = await Post.findByPk(id)
    if (!post) {
      await transaction.rollback()
      return res.status(404).json({ message: 'Post no encontrado' })
    }

    if (post.usuarioId !== usuarioId) {
      await transaction.rollback()
      return res.status(403).json({ message: 'No autorizado' })
    }

    const areaFound = await Area.findOne({
      where: { nombre: area },
    })

    if (!areaFound) {
      await transaction.rollback()
      return res.status(404).json({ message: 'El área especificada no existe' })
    }

    // Actualizar datos básicos
    await post.update({
      titulo,
      contenido,
      areaId: areaFound.id,
    }, { transaction })

    // Eliminar archivos marcados
    if (filesToDelete) {
      const idsToDelete = safeParseJSON(filesToDelete, [])
      await Archivo.destroy({
        where: {
          id: idsToDelete,
          postId: id,
        },
      }, { transaction })
    }

    // Agregar nuevos archivos
    if (archivos && archivos.length > 0) {
      const uploadPromises = archivos.map(async (archivo) => {
        const url = await uploadToS3(archivo)
        return {
          nombre: archivo.originalname,
          url: url,
          tipo: archivo.mimetype,
          postId: id,
        }
      })

      const nuevosArchivos = await Promise.all(uploadPromises)
      await Archivo.bulkCreate(nuevosArchivos, { transaction })
    }

    // Obtener post actualizado con todos sus datos
    const postActualizado = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
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
        {
          model: Like,
          as: 'likes',
          attributes: ['activo', 'usuarioId'],
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['contenido', 'createdAt'],
          include: [
            { model: User, as: 'usuario', attributes: ['nombre', 'apellido'] },
          ],
        },
      ],
      transaction,
    })

    await transaction.commit()
    res.json(postActualizado)
  } catch (error) {
    console.error('Error al actualizar el post:', error)
    await transaction.rollback()
    res
      .status(500)
      .json({ message: 'Error al actualizar el post', error: error.message })
  }
}

module.exports = {
  getAllPosts,
  createPost,
  toggleLike,
  addComment,
  incrementViews,
  incrementViewsHandler,
  deleteComment,
  getPostById,
  deletePost,
  updatePost,
}
