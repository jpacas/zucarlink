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
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

interface Post {
  id: number
  titulo: string
  contenido: string
  categoria: string
  createdAt: string // Usar `createdAt` directamente
  autor: { nombre: string; apellido: string; avatarUrl?: string }
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
  const [modalOpen, setModalOpen] = useState<boolean>(false) // Control del modal

  const categorias = [
    'Campo',
    'Molinos',
    'Fabrica',
    'Calderas',
    'Energia',
    'Alcohol',
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

  const handlePostSubmit = async () => {
    if (!titulo || !contenido || !categoria) {
      setError('Todos los campos son obligatorios.')
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
      setModalOpen(false) // Cierra el modal después de crear el post
      fetchPosts()
      setError(null)
    } catch (err) {
      setError('Error al crear el post.')
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setTitulo('')
    setContenido('')
    setCategoria('')
  }

  return (
    <Box
      sx={{
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        padding: 3,
        marginTop: '64px', // Ajustar el contenido para evitar solapamiento con el Navbar
      }}
    >
      <Typography
        variant='h3'
        textAlign='center'
        marginBottom={4}
        color='primary'
      >
        Foro
      </Typography>
      <Grid container spacing={4} direction={{ xs: 'column', md: 'row' }}>
        {/* Sidebar de Filtros */}
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
              onClick={() => setModalOpen(true)} // Abre el modal
              variant='contained'
              color='primary'
              fullWidth
              sx={{ marginTop: 3 }}
            >
              Crear Nuevo Post
            </Button>
          </Box>
        </Grid>
        {/* Posts */}
        <Grid item sx={{ flex: { xs: '1 1 auto', md: '1' }, maxWidth: '100%' }}>
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
                <Grid item xs={12} md={6} key={post.id}>
                  <Card>
                    <CardContent>
                      <Typography variant='h5'>{post.titulo}</Typography>
                      <Typography variant='body2' color='textSecondary'>
                        {post.categoria} -{' '}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant='body1'>{post.contenido}</Typography>
                      <Typography variant='caption'>
                        Publicado por {post.autor.nombre} {post.autor.apellido}
                      </Typography>
                    </CardContent>
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

      {/* Modal para crear un nuevo post */}
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
