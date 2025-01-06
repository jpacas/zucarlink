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
} from '@mui/material'

interface Post {
  id: number
  titulo: string
  contenido: string
  categoria: string
  fechaCreacion: string
  autor: { nombre: string; apellido: string; avatarUrl?: string }
}

const Foro: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [categoria, setCategoria] = useState<string>('')
  const [titulo, setTitulo] = useState<string>('')
  const [contenido, setContenido] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true) // Indicador de carga

  const categorias = [
    'Campo',
    'Molinos',
    'Fabrica',
    'Calderas',
    'Energia',
    'Alcohol',
  ]

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts`
        )
        if (Array.isArray(response.data)) {
          setPosts(response.data)
        } else {
          throw new Error('Los datos recibidos no son un arreglo.')
        }
        setError(null) // Limpia errores previos
      } catch (err: any) {
        setError('Error al cargar los posts.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

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
        usuarioId: 1, // usuarioId mock
      })
      setTitulo('')
      setContenido('')
      setCategoria('')
      // Recargar posts
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts`)
      if (Array.isArray(response.data)) {
        setPosts(response.data)
      }
      setError(null) // Limpia errores previos
    } catch (err: any) {
      setError('Error al crear el post.')
    }
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant='h3' textAlign='center' marginBottom={4}>
        Foro
      </Typography>

      {/* Mostrar errores */}
      {error && (
        <Alert severity='error' sx={{ marginBottom: 3 }}>
          {error}
        </Alert>
      )}

      {/* Crear nuevo post */}
      <Box sx={{ marginBottom: 3 }}>
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
        <Button
          onClick={handlePostSubmit}
          variant='contained'
          color='primary'
          sx={{ marginTop: 2 }}
        >
          Crear Post
        </Button>
      </Box>

      {/* Mostrar posts */}
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
                    {new Date(post.fechaCreacion).toLocaleDateString()}
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
    </Box>
  )
}

export default Foro
