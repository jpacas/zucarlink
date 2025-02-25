import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Post } from '../types/interfaces'

const PostDetalle: React.FC = () => {
  const { postId } = useParams<{ postId: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filesToDelete, setFilesToDelete] = useState<number[]>([])
  const [editMode, setEditMode] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedArea, setEditedArea] = useState('')
  const [areas, setAreas] = useState<string[]>([])

  // Verificar modo edición y cargar datos iniciales
  useEffect(() => {
    const isEditing = searchParams.get('edit') === 'true'
    setEditMode(isEditing)

    if (isEditing && post) {
      console.log('Inicializando datos de edición:', post) // Debug
      setEditedTitle(post.titulo)
      setEditedContent(post.contenido)
      setEditedArea(post.area.nombre)
    }
  }, [searchParams, post])

  // Cargar áreas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/helper/areas`
        )
        console.log('Áreas cargadas:', response.data) // Debug
        setAreas(response.data.map((a: any) => a.nombre))
      } catch (error) {
        console.error('Error al cargar áreas:', error)
      }
    }
    fetchAreas()
  }, [])

  // Cargar post
  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/${postId}`,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            incrementView: !searchParams.get('edit'), // No incrementar vistas en modo edición
          },
        }
      )

      setPost(response.data)

      // Inicializar datos de edición si estamos en modo edición
      if (searchParams.get('edit') === 'true') {
        setEditedTitle(response.data.titulo)
        setEditedContent(response.data.contenido)
        setEditedArea(response.data.area.nombre)
      }
    } catch (err) {
      console.error('Error completo:', err)
      setLoading(false)

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setError('La petición tardó demasiado tiempo')
        } else if (err.response) {
          // Error de respuesta del servidor
          console.error('Error de respuesta:', err.response.data)
          setError(err.response.data.message || 'Error al cargar el post')
        } else if (err.request) {
          // Error de red
          console.error('Error de red:', err.request)
          setError('Error de conexión con el servidor')
        } else {
          // Otros errores
          console.error('Error de configuración:', err.message)
          setError('Error inesperado')
        }
      } else {
        console.error('Error no Axios:', err)
        setError('Error inesperado al cargar el post')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (postId) {
      fetchPost()
    } else {
      setLoading(false)
    }
    // Cleanup function
    return () => {}
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
    }
  }

  const handleFileDelete = (fileId: number) => {
    setFilesToDelete((prev) => [...prev, fileId])
  }

  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdate = async () => {
    try {
      const formData = new FormData()
      formData.append('titulo', editedTitle)
      formData.append('contenido', editedContent)
      formData.append('area', editedArea)
      formData.append('usuarioId', user?.id || '')
      formData.append('filesToDelete', JSON.stringify(filesToDelete))

      // Agregar nuevos archivos
      selectedFiles.forEach((file) => {
        formData.append('archivos', file)
      })

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/${postId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setPost(response.data)
      setEditMode(false)
      navigate(`/foro/post/${postId}`)
    } catch (error) {
      console.error('Error al actualizar el post:', error)
      setError('Error al actualizar el post')
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 4,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando post...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, p: 2 }}>
        <Typography color='error' variant='h6'>
          {error}
        </Typography>
        <Button
          variant='contained'
          onClick={() => navigate('/foro')}
          sx={{ mt: 2 }}
        >
          Volver al Foro
        </Button>
      </Box>
    )
  }

  if (!post) {
    return (
      <Box sx={{ mt: 4, p: 2 }}>
        <Typography>Post no encontrado</Typography>
        <Button
          variant='contained'
          onClick={() => navigate('/foro')}
          sx={{ mt: 2 }}
        >
          Volver al Foro
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ padding: 3, marginTop: '64px' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/foro')}
        sx={{ mb: 2 }}
      >
        Volver al Foro
      </Button>

      <Card>
        <CardContent>
          {editMode ? (
            <Box
              component='form'
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                fullWidth
                label='Título'
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label='Contenido'
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />

              <FormControl fullWidth>
                <InputLabel>Área</InputLabel>
                <Select
                  value={editedArea}
                  label='Área'
                  onChange={(e) => setEditedArea(e.target.value)}
                >
                  {areas.map((area) => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Archivos existentes */}
              {post?.archivos && post.archivos.length > 0 && (
                <Box>
                  <Typography variant='subtitle1' gutterBottom>
                    Archivos actuales
                  </Typography>
                  <Grid container spacing={1}>
                    {post.archivos.map(
                      (archivo) =>
                        !filesToDelete.includes(archivo.id) && (
                          <Grid item xs={12} sm={6} md={4} key={archivo.id}>
                            <Card variant='outlined'>
                              <CardContent sx={{ p: 1 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <Typography variant='body2' noWrap>
                                    {archivo.nombre}
                                  </Typography>
                                  <IconButton
                                    size='small'
                                    onClick={() => handleFileDelete(archivo.id)}
                                  >
                                    <DeleteIcon fontSize='small' />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        )
                    )}
                  </Grid>
                </Box>
              )}

              {/* Nuevos archivos */}
              <Box>
                <input
                  type='file'
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id='file-input'
                />
                <label htmlFor='file-input'>
                  <Button
                    variant='outlined'
                    component='span'
                    startIcon={<CloudUploadIcon />}
                  >
                    Agregar archivos
                  </Button>
                </label>

                {selectedFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='subtitle1' gutterBottom>
                      Nuevos archivos
                    </Typography>
                    <Grid container spacing={1}>
                      {selectedFiles.map((file, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card variant='outlined'>
                            <CardContent sx={{ p: 1 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography variant='body2' noWrap>
                                  {file.name}
                                </Typography>
                                <IconButton
                                  size='small'
                                  onClick={() => handleRemoveNewFile(index)}
                                >
                                  <DeleteIcon fontSize='small' />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setEditMode(false)
                    navigate(`/foro/post/${postId}`)
                  }}
                >
                  Cancelar
                </Button>
                <Button variant='contained' onClick={handleUpdate}>
                  Guardar cambios
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant='h4'>{post.titulo}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>
                        {post.autor.nombre} {post.autor.apellido}
                      </Typography>
                      <Avatar
                        src={post.autor.avatarUrl || ''}
                        alt={`${post.autor.nombre} ${post.autor.apellido}`}
                        onClick={() => navigate(`/perfil/${post.usuarioId}`)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                  </Box>

                  <Typography variant='body1' sx={{ mb: 3 }}>
                    {post.contenido}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
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
                              (like) =>
                                like.usuarioId === user?.id && like.activo
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

              {/* Card de Archivos Adjuntos - Si existen */}
              {post.archivos && post.archivos.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography
                      variant='subtitle1'
                      sx={{ mb: 2, fontWeight: 500 }}
                    >
                      Archivos adjuntos ({post.archivos.length})
                    </Typography>
                    <Grid container spacing={1}>
                      {post.archivos.map((archivo, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          {archivo.tipo.startsWith('image/') ? (
                            <Box
                              sx={{
                                position: 'relative',
                                height: '150px',
                                '&:hover': { '& .overlay': { opacity: 1 } },
                              }}
                            >
                              <img
                                src={archivo.url}
                                alt={archivo.nombre}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                }}
                              />
                              <Box
                                className='overlay'
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  bgcolor: 'rgba(0,0,0,0.5)',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  borderRadius: '4px',
                                }}
                              >
                                <Button
                                  size='small'
                                  variant='contained'
                                  onClick={() =>
                                    window.open(archivo.url, '_blank')
                                  }
                                >
                                  Ver
                                </Button>
                              </Box>
                            </Box>
                          ) : archivo.tipo.startsWith('video/') ? (
                            <Box
                              sx={{
                                height: '150px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                              }}
                            >
                              <video
                                controls
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              >
                                <source src={archivo.url} type={archivo.tipo} />
                                Tu navegador no soporta el elemento de video.
                              </video>
                            </Box>
                          ) : (
                            <Card
                              variant='outlined'
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                              }}
                              onClick={() => window.open(archivo.url, '_blank')}
                            >
                              {archivo.tipo.includes('pdf') ? (
                                <PictureAsPdfIcon
                                  color='error'
                                  sx={{ fontSize: 24 }}
                                />
                              ) : archivo.tipo.includes('word') ? (
                                <DescriptionIcon
                                  color='primary'
                                  sx={{ fontSize: 24 }}
                                />
                              ) : (
                                <DescriptionIcon
                                  color='action'
                                  sx={{ fontSize: 24 }}
                                />
                              )}
                              <Typography
                                variant='body2'
                                sx={{
                                  ml: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {archivo.nombre}
                              </Typography>
                            </Card>
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Card de Comentarios */}
              <Card>
                <CardContent>
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
                        <IconButton
                          onClick={handleCommentSubmit}
                          color='primary'
                        >
                          <SendIcon />
                        </IconButton>
                      ),
                    }}
                  />

                  {post.comments.map((comment) => (
                    <Card key={comment.id} sx={{ mb: 1, p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
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
                </CardContent>
              </Card>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  mt: 2,
                }}
              >
                <Button variant='contained' onClick={() => setEditMode(true)}>
                  Editar Post
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default PostDetalle
