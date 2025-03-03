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
  FormControl,
  InputLabel,
  InputAdornment,
  Menu,
} from '@mui/material'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import CommentIcon from '@mui/icons-material/Comment'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import SortIcon from '@mui/icons-material/Sort'
import EditIcon from '@mui/icons-material/Edit'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Post, Area } from '../types/interfaces'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { useSnackbar } from 'notistack'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import WarningIcon from '@mui/icons-material/Warning'

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
  const [ordenamiento, setOrdenamiento] = useState<string>('reciente')
  const [anchorEl, setAnchorEl] = useState<{
    [key: number]: HTMLElement | null
  }>({})
  const { enqueueSnackbar } = useSnackbar()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<number | null>(null)

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
            orden: ordenamiento,
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
  }, [areaFiltro, temaFiltro, autorFiltro, ordenamiento])

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

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    postId: number
  ) => {
    event.stopPropagation() // Prevenir navegación al post
    setAnchorEl({ ...anchorEl, [postId]: event.currentTarget })
  }

  const handleMenuClose = (postId: number) => {
    setAnchorEl({ ...anchorEl, [postId]: null })
  }

  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId)
    setDeleteDialogOpen(true)
    handleMenuClose(postId)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/posts/${postToDelete}`,
        {
          data: { usuarioId: user?.id },
        }
      )

      enqueueSnackbar('Post eliminado correctamente', {
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      })

      fetchPosts()
    } catch (error) {
      console.error('Error al eliminar el post:', error)
      enqueueSnackbar('Error al eliminar el post', {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      })
    } finally {
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPostToDelete(null)
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: '80px',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Typography
              variant='h5'
              marginBottom={2}
              sx={{
                color: '#1a1a1a',
                fontWeight: 700,
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: '#ff6347',
                  marginTop: '8px',
                  borderRadius: '2px',
                },
              }}
            >
              Filtros
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value)}
                startAdornment={
                  <InputAdornment position='start'>
                    <SortIcon />
                  </InputAdornment>
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff6347',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6347',
                    },
                  },
                }}
              >
                <MenuItem value='reciente'>Más recientes</MenuItem>
                <MenuItem value='antiguo'>Más antiguos</MenuItem>
                <MenuItem value='vistas'>Más vistos</MenuItem>
                <MenuItem value='menosVistas'>Menos vistos</MenuItem>
              </Select>
            </FormControl>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#ff6347',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff6347',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#ff6347',
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#ff6347',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff6347',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#ff6347',
                },
              }}
            />
            <Select
              id='area-filter'
              name='areaFiltro'
              value={areaFiltro}
              onChange={(e) => setAreaFiltro(e.target.value)}
              displayEmpty
              fullWidth
              sx={{
                marginTop: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#ff6347',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff6347',
                  },
                },
              }}
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
              sx={{
                marginTop: 3,
                width: '100%',
                backgroundColor: '#ff6347',
                '&:hover': {
                  backgroundColor: '#e5533f',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
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
              <CircularProgress sx={{ color: '#ff6347' }} />
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
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                      },
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
                        <Typography
                          variant='h5'
                          sx={{
                            flex: 1,
                            color: '#1a1a1a',
                            fontWeight: 700,
                          }}
                        >
                          {post.titulo}
                          {post.archivos && post.archivos.length > 0 && (
                            <AttachFileIcon
                              sx={{
                                ml: 1,
                                fontSize: 20,
                                verticalAlign: 'middle',
                                color: '#4a4a4a',
                              }}
                            />
                          )}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant='body1' sx={{ color: '#4a4a4a' }}>
                            {post.autor.nombre} {post.autor.apellido}
                          </Typography>
                          <Avatar
                            src={post.autor.avatarUrl || ''}
                            alt={`${post.autor.nombre} ${post.autor.apellido}`}
                            sx={{
                              width: 40,
                              height: 40,
                              cursor: 'pointer',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/perfil/${post.usuarioId}`)
                            }}
                          />
                          {user?.id === post.usuarioId && (
                            <>
                              <IconButton
                                onClick={(e) => handleMenuClick(e, post.id)}
                                size='small'
                                sx={{
                                  color: '#4a4a4a',
                                  '&:hover': {
                                    color: '#ff6347',
                                  },
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              <Menu
                                anchorEl={anchorEl[post.id]}
                                open={Boolean(anchorEl[post.id])}
                                onClose={() => handleMenuClose(post.id)}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMenuClose(post.id)
                                    navigate(`/foro/post/${post.id}?edit=true`)
                                  }}
                                  sx={{
                                    color: '#4a4a4a',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 99, 71, 0.1)',
                                    },
                                  }}
                                >
                                  <EditIcon sx={{ mr: 1 }} fontSize='small' />
                                  Editar
                                </MenuItem>
                                <MenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteClick(post.id)
                                  }}
                                  sx={{
                                    color: '#e5533f',
                                    '&:hover': {
                                      backgroundColor: 'rgba(229, 83, 63, 0.1)',
                                    },
                                  }}
                                >
                                  <DeleteIcon sx={{ mr: 1 }} fontSize='small' />
                                  Eliminar
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </Box>
                      </Box>
                      <Typography
                        variant='body1'
                        sx={{
                          marginTop: 2,
                          color: '#4a4a4a',
                          lineHeight: 1.7,
                        }}
                      >
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
                      <Typography
                        variant='body2'
                        sx={{
                          color: '#4a4a4a',
                          fontStyle: 'italic',
                        }}
                      >
                        {post.area.nombre} -{' '}
                        {formatRelativeDate(post.createdAt)}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant='body2' sx={{ color: '#4a4a4a' }}>
                            {post.likes?.filter((x) => x.activo).length}
                          </Typography>
                          <IconButton
                            size='small'
                            sx={{
                              color: post.likes?.some(
                                (like) =>
                                  like.usuarioId === user?.id && like.activo
                              )
                                ? '#ff6347'
                                : '#4a4a4a',
                              '&:hover': {
                                color: '#ff6347',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLikeToggle(post.id)
                            }}
                          >
                            <ThumbUpIcon fontSize='small' />
                          </IconButton>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant='body2' sx={{ color: '#4a4a4a' }}>
                            {post.comments.length}
                          </Typography>
                          <IconButton
                            size='small'
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleComments(post.id)
                            }}
                            sx={{
                              color: post.comments?.some(
                                (comment) =>
                                  comment.usuarioId === (user?.id ?? '')
                              )
                                ? '#ff6347'
                                : '#4a4a4a',
                              '&:hover': {
                                color: '#ff6347',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <CommentIcon fontSize='small' />
                          </IconButton>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant='body2' sx={{ color: '#4a4a4a' }}>
                            {post.views || 0}
                          </Typography>
                          <VisibilityIcon
                            fontSize='small'
                            sx={{
                              color: '#4a4a4a',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: '#ff6347',
                                transform: 'scale(1.1)',
                              },
                            }}
                          />
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
                              backgroundColor: 'rgba(255, 99, 71, 0.05)',
                              padding: 1.5,
                              marginBottom: 1,
                              borderRadius: 1,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 99, 71, 0.1)',
                                transform: 'translateX(5px)',
                              },
                            }}
                          >
                            <Typography sx={{ flexGrow: 1, color: '#4a4a4a' }}>
                              <strong style={{ color: '#1a1a1a' }}>
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
                                sx={{
                                  color: '#e5533f',
                                  '&:hover': {
                                    backgroundColor: 'rgba(229, 83, 63, 0.1)',
                                  },
                                }}
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
                          minRows={1}
                          maxRows={8}
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
                          sx={{
                            marginTop: 2,
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#ff6347',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#ff6347',
                              },
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCommentSubmit(post.id)
                                  }}
                                  sx={{
                                    color: '#ff6347',
                                    '&:hover': {
                                      color: '#e5533f',
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.3s ease',
                                  }}
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
            <Typography
              variant='h6'
              textAlign='center'
              marginTop={4}
              sx={{ color: '#4a4a4a' }}
            >
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
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {modalError && (
            <Alert severity='error' sx={{ marginBottom: 2 }}>
              {modalError}
            </Alert>
          )}
          <Typography
            id='crear-post-modal'
            variant='h5'
            marginBottom={2}
            sx={{
              color: '#1a1a1a',
              fontWeight: 700,
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                width: '40px',
                height: '3px',
                backgroundColor: '#ff6347',
                marginTop: '8px',
                borderRadius: '2px',
              },
            }}
          >
            Crear Nuevo Post
          </Typography>
          <TextField
            label='Título'
            fullWidth
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            margin='normal'
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#ff6347',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff6347',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#ff6347',
              },
            }}
          />

          <TextField
            label='Contenido'
            fullWidth
            multiline
            rows={4}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            margin='normal'
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#ff6347',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff6347',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#ff6347',
              },
            }}
          />
          <Select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            displayEmpty
            fullWidth
            sx={{
              marginTop: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#ff6347',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff6347',
                },
              },
            }}
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
            sx={{
              mt: 2,
              mb: 2,
              width: '100%',
              borderColor: '#ff6347',
              color: '#ff6347',
              '&:hover': {
                borderColor: '#e5533f',
                backgroundColor: 'rgba(255, 99, 71, 0.1)',
              },
            }}
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
              <Typography variant='subtitle2' sx={{ color: '#4a4a4a' }}>
                Archivos seleccionados: {selectedFiles.length}
              </Typography>
              {selectedFiles.map((file, index) => (
                <Typography
                  key={index}
                  variant='body2'
                  sx={{ color: '#4a4a4a' }}
                >
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
            <Button
              onClick={handleModalClose}
              sx={{
                color: '#4a4a4a',
                '&:hover': {
                  backgroundColor: 'rgba(74, 74, 74, 0.1)',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePostSubmit}
              variant='contained'
              sx={{
                backgroundColor: '#ff6347',
                '&:hover': {
                  backgroundColor: '#e5533f',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Crear Post
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Diálogo de confirmación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '400px',
            p: 1,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#e5533f',
          }}
        >
          <WarningIcon color='error' />
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#4a4a4a' }}>
            ¿Estás seguro de que deseas eliminar este post? Esta acción no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            variant='outlined'
            sx={{
              borderColor: '#4a4a4a',
              color: '#4a4a4a',
              '&:hover': {
                borderColor: '#1a1a1a',
                backgroundColor: 'rgba(74, 74, 74, 0.1)',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant='contained'
            color='error'
            startIcon={<DeleteIcon />}
            sx={{
              backgroundColor: '#e5533f',
              '&:hover': {
                backgroundColor: '#ff6347',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Foro
