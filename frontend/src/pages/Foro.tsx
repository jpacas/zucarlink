import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Modal,
  Avatar,
  IconButton,
  Collapse,
} from '@mui/material'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import CommentIcon from '@mui/icons-material/Comment'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import InputAdornment from '@mui/material/InputAdornment'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Post, Area } from '../types/interfaces'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
import ImageIcon from '@mui/icons-material/Image'
import VideoFileIcon from '@mui/icons-material/VideoFile'

const Foro: React.FC = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [areaFiltro, setAreaFiltro] = useState<string>('')
  const [temaFiltro, setTemaFiltro] = useState<string>('')
  const [area, setArea] = useState<string>('')
  const [areas, setAreas] = useState<Area[]>([])
  const [titulo, setTitulo] = useState<string>('')
  const [contenido, setContenido] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<{
    [postId: number]: boolean
  }>({})
  const [newComment, setNewComment] = useState<{ [postId: number]: string }>({})
  const [autorFiltro, setAutorFiltro] = useState<string>('')
  const navigate = useNavigate()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts`,
        {
          params: {
            tema: temaFiltro,
            area: areaFiltro,
            autor: autorFiltro.trim(),
          },
        }
      )
      if (Array.isArray(response.data)) {
        setPosts(response.data)
      } else {
        throw new Error('Los datos recibidos no son un arreglo.')
      }
      setError(null)
    } catch (err) {
      setError('Error al cargar los posts.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAreas = async () => {
    try {
      const response = await axios.get<{ nombre: string }[]>(
        `${import.meta.env.VITE_API_URL}/helper/areas`
      )
      setAreas(response.data.map((area) => area.nombre))
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al cargar los datos.')
      } else {
        setError('Error desconocido.')
      }
    }
  }

  useEffect(() => {
    fetchAreas()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [areaFiltro, temaFiltro, autorFiltro])

  const handleLikeToggle = async (postId: number) => {
    if (!user?.id) {
      alert('Por favor, inicia sesión para dar like.')
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/like`,
        { userId: user.id }
      )

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: response.data.likes, // array actualizado
                userHasLiked: response.data.userHasLiked,
              }
            : post
        )
      )
    } catch (err) {
      console.error('Error al actualizar el like.', err)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
    }
  }

  const handlePostSubmit = async () => {
    if (!titulo || !contenido || !area) {
      setModalError('Todos los campos son obligatorios.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('titulo', titulo)
      formData.append('contenido', contenido)
      formData.append('area', area)
      formData.append('usuarioId', user?.id || '')

      // Agregar archivos al FormData
      selectedFiles.forEach((file) => {
        formData.append('archivos', file)
      })

      await axios.post(`${import.meta.env.VITE_API_URL}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setTitulo('')
      setContenido('')
      setArea('')
      setSelectedFiles([])
      setModalError(null)
      setModalOpen(false)
      fetchPosts()
    } catch (err) {
      setModalError('Error al crear el post.')
    }
  }

  const toggleComments = (postId: number) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const handleCommentChange = (postId: number, value: string) => {
    setNewComment((prev) => ({ ...prev, [postId]: value }))
  }

  const handleCommentSubmit = async (postId: number) => {
    if (!user?.id) {
      console.error('Error: Usuario no autenticado.')
      return
    }

    if (!newComment[postId]?.trim()) {
      console.error('Error: El comentario está vacío.')
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/comment`,
        {
          contenido: newComment[postId], // Asegúrate de que coincida con el backend
          usuarioId: user.id, // Enviar solo usuarioId, el backend se encargará de obtener nombre y apellido
        }
      )

      // El backend devuelve la lista de comentarios actualizada
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      )

      // Limpiar el input después de agregar el comentario
      setNewComment((prev) => ({ ...prev, [postId]: '' }))
    } catch (err: any) {
      console.error('Error al enviar comentario:', err.response?.data || err)
    }
  }

  const handleDeleteComment = async (postId: number, commentId: number) => {
    if (!postId || !commentId) {
      console.error('Error: postId o commentId no válido.')
      return
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/comment/${commentId}`
      )

      if (!response.data || !response.data.comments) {
        throw new Error('No se recibió la lista de comentarios actualizada.')
      }

      // Actualizar el estado con la lista de comentarios actualizada del backend
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      )
    } catch (err: any) {
      console.error(
        'Error al eliminar comentario:',
        err.response?.data?.message || err.message
      )
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setTitulo('')
    setContenido('')
    setArea('')
    setSelectedFiles([])
    setModalError(null) // Resetea el error cuando el modal se cierra
  }

  const formatRelativeDate = (date: string) => {
    const parsedDate = new Date(date) // Convierte el string a un objeto Date
    return formatDistanceToNow(parsedDate, { addSuffix: true, locale: es })
  }

  return (
    <Box
      sx={{
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        padding: 3,
        marginTop: '64px',
      }}
    >
      <Grid container spacing={4} direction={{ xs: 'column', md: 'row' }}>
        <Grid
          item
          sx={{
            flex: { xs: '1 1 auto', md: '0 0 25%' },
            maxWidth: { xs: '100%', md: '25%' },
          }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              padding: 3,
              borderRadius: 2,
              boxShadow: 3,
              position: 'sticky',
              top: '80px', // Mantiene la caja de filtros fija al hacer scroll
            }}
          >
            <Typography variant='h5' marginBottom={2} color='primary'>
              Filtros
            </Typography>
            <TextField
              fullWidth
              id='autor-filter'
              name='autorFiltro'
              label='Buscar por autor'
              value={autorFiltro}
              onChange={(e) => setAutorFiltro(e.target.value)}
              variant='outlined'
              margin='normal'
              placeholder='Nombre o apellido'
            />
            <TextField
              fullWidth
              id='tema-filter'
              name='temaFiltro'
              label='Buscar por tema'
              value={temaFiltro}
              onChange={(e) => setTemaFiltro(e.target.value)}
              variant='outlined'
              margin='normal'
            />
            <Select
              id='area-filter'
              name='areaFiltro'
              value={areaFiltro}
              onChange={(e) => setAreaFiltro(e.target.value)}
              displayEmpty
              fullWidth
              sx={{ marginTop: 2 }}
            >
              <MenuItem value=''>Todas las areas</MenuItem>
              {areas.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </Select>
            <Button
              onClick={() => setModalOpen(true)}
              variant='contained'
              color='primary'
              fullWidth
              sx={{ marginTop: 3 }}
            >
              Crear Nuevo Post
            </Button>
          </Box>
        </Grid>
        <Grid item sx={{ flex: { xs: '1 1 auto', md: '1' } }}>
          {error && (
            <Alert severity='error' sx={{ marginBottom: 3 }}>
              {error}
            </Alert>
          )}
          {isLoading ? (
            <Box sx={{ textAlign: 'center', marginTop: 4 }}>
              <CircularProgress />
            </Box>
          ) : posts.length > 0 ? (
            <Grid container spacing={3}>
              {posts.map((post) => (
                <Grid item xs={12} key={post.id}>
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: 2,
                      boxShadow: 3,
                    }}
                  >
                    <CardContent
                      onClick={() => navigate(`/foro/post/${post.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant='h5' sx={{ flex: 1 }}>
                          {post.titulo}
                        </Typography>
                        {/* CAMBIO: Agrupamos nombre y avatar en la esquina superior derecha */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant='body1'>
                            {post.autor.nombre} {post.autor.apellido}
                          </Typography>
                          <Avatar
                            src={post.autor.avatarUrl || ''}
                            alt={`${post.autor.nombre} ${post.autor.apellido}`}
                            sx={{ width: 40, height: 40, cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/perfil/${post.usuarioId}`)
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography variant='body1' sx={{ marginTop: 2 }}>
                        {post.contenido}
                      </Typography>
                    </CardContent>

                    {/* Sección de archivos multimedia */}
                    {post.archivos && post.archivos.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>
                          Archivos adjuntos:
                        </Typography>
                        <Grid container spacing={2}>
                          {post.archivos.map((archivo, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              {archivo.tipo.startsWith('image/') ? (
                                // Mostrar imágenes
                                <Box
                                  sx={{
                                    position: 'relative',
                                    '&:hover': {
                                      '& .overlay': {
                                        opacity: 1,
                                      },
                                    },
                                  }}
                                >
                                  <img
                                    src={archivo.url}
                                    alt={archivo.nombre}
                                    style={{
                                      width: '100%',
                                      height: '200px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
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
                                      transition: 'opacity 0.3s',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    <Button
                                      variant='contained'
                                      color='primary'
                                      onClick={() =>
                                        window.open(archivo.url, '_blank')
                                      }
                                    >
                                      Ver completa
                                    </Button>
                                  </Box>
                                </Box>
                              ) : archivo.tipo.startsWith('video/') ? (
                                // Mostrar videos
                                <Box
                                  sx={{
                                    width: '100%',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <video
                                    controls
                                    style={{
                                      width: '100%',
                                      maxHeight: '200px',
                                    }}
                                  >
                                    <source
                                      src={archivo.url}
                                      type={archivo.tipo}
                                    />
                                    Tu navegador no soporta el elemento de
                                    video.
                                  </video>
                                </Box>
                              ) : (
                                // Mostrar documentos (PDF, DOC, etc.)
                                <Card
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      bgcolor: 'action.hover',
                                    },
                                  }}
                                  onClick={() =>
                                    window.open(archivo.url, '_blank')
                                  }
                                >
                                  {archivo.tipo.includes('pdf') ? (
                                    <PictureAsPdfIcon
                                      color='error'
                                      sx={{ fontSize: 40 }}
                                    />
                                  ) : archivo.tipo.includes('word') ? (
                                    <DescriptionIcon
                                      color='primary'
                                      sx={{ fontSize: 40 }}
                                    />
                                  ) : (
                                    <DescriptionIcon
                                      color='action'
                                      sx={{ fontSize: 40 }}
                                    />
                                  )}
                                  <Box sx={{ ml: 2, overflow: 'hidden' }}>
                                    <Typography noWrap>
                                      {archivo.nombre}
                                    </Typography>
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                    >
                                      {(
                                        archivo.tipo.split('/')[1] ||
                                        'documento'
                                      ).toUpperCase()}
                                    </Typography>
                                  </Box>
                                </Card>
                              )}
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 2,
                      }}
                    >
                      <Typography variant='body2' color='textSecondary'>
                        {post.area.nombre} -{' '}
                        {formatRelativeDate(post.createdAt)}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Contador de likes */}
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant='body2'>
                            {post.likes?.filter((x) => x.activo).length}
                          </Typography>
                          <IconButton
                            size='small'
                            color={
                              post.likes?.some(
                                (like) =>
                                  like.usuarioId === user?.id && like.activo
                              )
                                ? 'primary'
                                : 'default'
                            }
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLikeToggle(post.id)
                            }}
                          >
                            <ThumbUpIcon fontSize='small' />
                          </IconButton>
                        </Box>

                        {/* Contador de comentarios */}
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant='body2'>
                            {post.comments.length}
                          </Typography>
                          <IconButton
                            size='small'
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleComments(post.id)
                            }}
                            color={
                              post.comments?.some(
                                (comment) =>
                                  comment.usuarioId === (user?.id ?? '')
                              )
                                ? 'primary'
                                : 'default'
                            }
                          >
                            <CommentIcon fontSize='small' />
                          </IconButton>
                        </Box>

                        {/* Contador de vistas */}
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant='body2'>
                            {post.views || 0}
                          </Typography>
                          <VisibilityIcon fontSize='small' color='action' />
                        </Box>
                      </Box>
                    </Box>
                    <Collapse in={expandedComments[post.id]}>
                      <Box sx={{ padding: 2 }}>
                        {post.comments.map((comment) => (
                          <Box
                            key={comment.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: '#f5f5f5',
                              padding: 1,
                              marginBottom: 1,
                              borderRadius: 1,
                            }}
                          >
                            <Typography sx={{ flexGrow: 1 }}>
                              <strong>
                                {comment.usuario
                                  ? `${comment.usuario.nombre} ${comment.usuario.apellido}: `
                                  : 'Usuario desconocido: '}
                              </strong>
                              {comment.contenido}
                            </Typography>

                            {user?.id === comment.usuarioId && (
                              <IconButton
                                color='error'
                                size='small'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteComment(post.id, comment.id)
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                        <TextField
                          fullWidth
                          multiline
                          minRows={1} // Altura mínima de 1 línea
                          maxRows={8} // Altura máxima de 8 líneas
                          placeholder='Escribe un comentario'
                          value={newComment[post.id] || ''}
                          onChange={(e) =>
                            handleCommentChange(post.id, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleCommentSubmit(post.id)
                            }
                          }}
                          sx={{ marginTop: 2 }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCommentSubmit(post.id)
                                  }}
                                  color='primary'
                                >
                                  <SendIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </Collapse>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant='h6' textAlign='center' marginTop={4}>
              No hay posts disponibles.
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Modal para Crear Post */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby='crear-post-modal'
        aria-describedby='crear-post-descripcion'
      >
        <Box
          sx={{
            backgroundColor: '#fff',
            maxWidth: 600,
            margin: 'auto',
            marginTop: '10%',
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          {modalError && (
            <Alert severity='error' sx={{ marginBottom: 2 }}>
              {modalError}
            </Alert>
          )}
          <Typography id='crear-post-modal' variant='h5' marginBottom={2}>
            Crear Nuevo Post
          </Typography>
          <TextField
            label='Título'
            fullWidth
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            margin='normal'
          />

          <TextField
            label='Contenido'
            fullWidth
            multiline
            rows={4}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            margin='normal'
          />
          <Select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            displayEmpty
            fullWidth
            sx={{ marginTop: 2 }}
          >
            <MenuItem value='' disabled>
              Selecciona una categoría
            </MenuItem>
            {areas.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>

          <Button
            component='label'
            variant='outlined'
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2, mb: 2 }}
            fullWidth
          >
            Subir Archivos
            <input
              type='file'
              hidden
              multiple
              onChange={handleFileChange}
              accept='image/*,video/*,.pdf,.doc,.docx'
            />
          </Button>

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='subtitle2'>
                Archivos seleccionados: {selectedFiles.length}
              </Typography>
              {selectedFiles.map((file, index) => (
                <Typography key={index} variant='body2'>
                  {file.name}
                </Typography>
              ))}
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 3,
            }}
          >
            <Button onClick={handleModalClose} color='secondary'>
              Cancelar
            </Button>
            <Button
              onClick={handlePostSubmit}
              variant='contained'
              color='primary'
            >
              Crear Post
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default Foro
