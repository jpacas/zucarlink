import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Post } from '../types/interfaces'

const PostDetalle: React.FC = () => {
  const { postId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPost = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/${postId}`
      )
      setPost(response.data)

      // Incrementar el contador de vistas
      await axios.post(`${import.meta.env.VITE_API_URL}/posts/${postId}/view`)
    } catch (error) {
      console.error('Error al cargar el post:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPost()
  }, [postId])

  const handleLikeToggle = async () => {
    if (!user?.id || !post) return
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}/like`,
        { userId: user.id }
      )
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: response.data.likes,
              userHasLiked: response.data.userHasLiked,
            }
          : null
      )
    } catch (error) {
      console.error('Error al actualizar el like:', error)
    }
  }

  const handleCommentSubmit = async () => {
    if (!user?.id || !post || !newComment.trim()) return
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}/comment`,
        {
          contenido: newComment,
          usuarioId: user.id,
        }
      )
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: response.data.comments,
            }
          : null
      )
      setNewComment('')
    } catch (error) {
      console.error('Error al enviar comentario:', error)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!post) return
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}/comment/${commentId}`
      )
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: response.data.comments,
            }
          : null
      )
    } catch (error) {
      console.error('Error al eliminar comentario:', error)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!post) {
    return <Typography>Post no encontrado</Typography>
  }

  return (
    <Box sx={{ p: 3, mt: '64px' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/foro')}
        sx={{ mb: 2 }}
      >
        Volver al Foro
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='h4'>{post.titulo}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>
                {post.autor.nombre} {post.autor.apellido}
              </Typography>
              <Avatar
                src={post.autor.avatarUrl}
                onClick={() => navigate(`/perfil/${post.usuarioId}`)}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Box>

          <Typography variant='body1' sx={{ mb: 2 }}>
            {post.contenido}
          </Typography>

          {/* Sección de archivos multimedia */}
          {post.archivos && post.archivos.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {post.archivos.map((archivo, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  {archivo.tipo.startsWith('image/') ? (
                    <img
                      src={archivo.url}
                      alt={`Imagen ${index + 1}`}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  ) : archivo.tipo.startsWith('video/') ? (
                    <video controls style={{ maxWidth: '100%' }}>
                      <source src={archivo.url} type={archivo.tipo} />
                      Tu navegador no soporta el elemento de video.
                    </video>
                  ) : null}
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant='body2' color='textSecondary'>
              {post.area.nombre} -{' '}
              {formatDistanceToNow(new Date(post.createdAt), {
                locale: es,
                addSuffix: true,
              })}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>{post.views} vistas</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>
                  {post.likes.filter((x) => x.activo).length}
                </Typography>
                <IconButton
                  onClick={handleLikeToggle}
                  color={
                    post.likes.some(
                      (like) => like.usuarioId === user?.id && like.activo
                    )
                      ? 'primary'
                      : 'default'
                  }
                >
                  <ThumbUpIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Sección de comentarios */}
      <Box sx={{ mt: 3 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Comentarios ({post.comments.length})
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={2}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder='Escribe un comentario...'
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleCommentSubmit} color='primary'>
                <SendIcon />
              </IconButton>
            ),
          }}
        />

        {post.comments.map((comment) => (
          <Card key={comment.id} sx={{ mb: 1, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='subtitle2'>
                  {comment.usuario.nombre} {comment.usuario.apellido}
                </Typography>
                <Typography>{comment.contenido}</Typography>
              </Box>
              {user?.id === comment.usuarioId && (
                <IconButton
                  size='small'
                  color='error'
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

export default PostDetalle
