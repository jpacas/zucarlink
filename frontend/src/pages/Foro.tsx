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
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Comment } from '@mui/icons-material'

interface Post {
  id: number
  titulo: string
  contenido: string
  categoria: string
  createdAt: string
  autor: { id: number; nombre: string; apellido: string; avatarUrl?: string }
  comments: Comment[]
  likes: string[]
}

interface Comment {
  user: string
  nombre: string
  apellido: string
  value: string
}

const Foro: React.FC = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')
  const [temaFiltro, setTemaFiltro] = useState<string>('')
  const [categoria, setCategoria] = useState<string>('')
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

  const categorias = [
    'Campo',
    'Molinos',
    'Fabrica',
    'Calderas',
    'Energia',
    'Alcohol',
    'Laboratorio',
    'Instrumentacion',
    'Mantenimiento',
    'Seguridad',
    'Medio Ambiente',
    'Recursos Humanos',
    'Otros',
  ]

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts`,
        {
          params: { tema: temaFiltro, categoria: categoriaFiltro },
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

  useEffect(() => {
    fetchPosts()
  }, [categoriaFiltro, temaFiltro])

  const handleLikeToggle = async (postId: number) => {
    if (!user?.id) {
      alert('Por favor, inicia sesión para dar like.')
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/like`,
        {
          userId: user.id,
        }
      )
      const updatedPosts = posts.map((post) =>
        post.id === postId ? { ...post, likes: response.data.likes } : post
      )
      setPosts(updatedPosts)
    } catch (err) {
      setError('Error al actualizar el like.')
    }
  }

  const handlePostSubmit = async () => {
    if (!titulo || !contenido || !categoria) {
      setModalError('Todos los campos son obligatorios.')
      return
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/posts`, {
        titulo,
        contenido,
        categoria,
        usuarioId: user?.id,
      })
      setTitulo('')
      setContenido('')
      setCategoria('')
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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/comment`,
        {
          comment: newComment[postId],
          userId: user.id,
          nombre: user.nombre, // Agregamos el nombre del usuario
          apellido: user.apellido, // Agregamos el apellido del usuario
        }
      )

      const newCommentData = {
        user: user.id,
        nombre: user.nombre, // Mostramos el nombre en lugar del ID
        apellido: user.apellido,
        value: newComment[postId],
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newCommentData] }
            : post
        )
      )

      setNewComment((prev) => ({ ...prev, [postId]: '' }))
    } catch (err: any) {
      console.error('Error al enviar comentario:', err.response?.data || err)
    }
  }

  const handleDeleteComment = async (postId: number, commentIndex: number) => {
    try {
      const response = await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/posts/${postId}/comment/${commentIndex}`
      )

      console.log(commentIndex)

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      )
    } catch (err) {
      console.error('Error al eliminar comentario:', err)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setTitulo('')
    setContenido('')
    setCategoria('')
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
              label='Buscar por tema'
              value={temaFiltro}
              onChange={(e) => setTemaFiltro(e.target.value)}
              variant='outlined'
              margin='normal'
            />
            <Select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              displayEmpty
              fullWidth
              sx={{ marginTop: 2 }}
            >
              <MenuItem value=''>Todas las categorías</MenuItem>
              {categorias.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
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
                    <CardContent>
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
                            onClick={() =>
                              (window.location.href = `/perfil/${post.autor.id}`)
                            }
                          />
                        </Box>
                      </Box>
                      <Typography variant='body1' sx={{ marginTop: 2 }}>
                        {post.contenido}
                      </Typography>
                    </CardContent>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 2,
                      }}
                    >
                      <Typography variant='body2' color='textSecondary'>
                        {post.categoria} - {formatRelativeDate(post.createdAt)}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography>{post.likes.length}</Typography>
                          <IconButton
                            color={
                              post.likes.includes(user?.id ?? '')
                                ? 'primary'
                                : 'default'
                            }
                            onClick={() => handleLikeToggle(post.id)}
                          >
                            <ThumbUpIcon />
                          </IconButton>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant='body2'>
                            {post.comments.length}
                          </Typography>
                          <IconButton
                            onClick={() => toggleComments(post.id)}
                            color={
                              post.comments?.some(
                                (comment) => comment.user == user?.id
                              )
                                ? 'primary'
                                : 'default'
                            }
                          >
                            <CommentIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <Collapse in={expandedComments[post.id]}>
                      <Box sx={{ padding: 2 }}>
                        {post.comments.map((comment, index) => (
                          <Box
                            key={index}
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
                                {`${comment.nombre} ${comment.apellido}`}:{' '}
                              </strong>{' '}
                              {comment.value}
                            </Typography>
                            {user?.id === comment.user && (
                              <IconButton
                                color='error'
                                size='small'
                                onClick={() =>
                                  handleDeleteComment(post.id, index)
                                }
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
                                  onClick={() => handleCommentSubmit(post.id)}
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
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            displayEmpty
            fullWidth
            sx={{ marginTop: 2 }}
          >
            <MenuItem value='' disabled>
              Selecciona una categoría
            </MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>

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
