import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Alert,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'

interface WikiArticuloSummary {
  id: number
  titulo: string
  slug: string
  resumen: string | null
  categoria: string
  vistas: number
  createdAt: string
  updatedAt: string
  autor: {
    nombre: string
    apellido: string
    username: string
  }
}

const CATEGORIAS = ['Fabricación', 'Maquinaria', 'Agronomía', 'Laboratorio', 'Electricidad', 'Administración', 'General']

const Wiki: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [articulos, setArticulos] = useState<WikiArticuloSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')

  useEffect(() => {
    const fetchArticulos = async () => {
      try {
        setLoading(true)
        const params = categoriaFiltro ? { categoria: categoriaFiltro } : {}
        const res = await axiosInstance.get('/wiki', { params })
        setArticulos(res.data)
      } catch {
        setError('Error al cargar los artículos de la wiki')
      } finally {
        setLoading(false)
      }
    }
    fetchArticulos()
  }, [categoriaFiltro])

  const articulosPorCategoria = CATEGORIAS.reduce<Record<string, WikiArticuloSummary[]>>((acc, cat) => {
    const lista = articulos.filter(a => a.categoria === cat)
    if (lista.length > 0) acc[cat] = lista
    return acc
  }, {})

  return (
    <Box sx={{ pt: 10, pb: 6, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Wiki Técnica
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enciclopedia técnica de la industria azucarera
            </Typography>
          </Box>
          {isAuthenticated && (
            <Button variant="contained" onClick={() => navigate('/wiki/nuevo/editar')}>
              Nuevo artículo
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          <Chip
            label="Todas"
            onClick={() => setCategoriaFiltro('')}
            color={categoriaFiltro === '' ? 'primary' : 'default'}
            variant={categoriaFiltro === '' ? 'filled' : 'outlined'}
          />
          {CATEGORIAS.map(cat => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setCategoriaFiltro(cat === categoriaFiltro ? '' : cat)}
              color={categoriaFiltro === cat ? 'primary' : 'default'}
              variant={categoriaFiltro === cat ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && articulos.length === 0 && (
          <Alert severity="info">No hay artículos disponibles aún. ¡Sé el primero en contribuir!</Alert>
        )}

        {!loading && !error && (
          categoriaFiltro ? (
            <Grid container spacing={2}>
              {articulos.map(articulo => (
                <Grid item xs={12} sm={6} md={4} key={articulo.id}>
                  <ArticuloCard articulo={articulo} onClick={() => navigate(`/wiki/${articulo.slug}`)} />
                </Grid>
              ))}
            </Grid>
          ) : (
            Object.entries(articulosPorCategoria).map(([categoria, lista]) => (
              <Box key={categoria} sx={{ mb: 5 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                  {categoria}
                </Typography>
                <Grid container spacing={2}>
                  {lista.map(articulo => (
                    <Grid item xs={12} sm={6} md={4} key={articulo.id}>
                      <ArticuloCard articulo={articulo} onClick={() => navigate(`/wiki/${articulo.slug}`)} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )
        )}
      </Container>
    </Box>
  )
}

const ArticuloCard: React.FC<{ articulo: WikiArticuloSummary; onClick: () => void }> = ({ articulo, onClick }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
      <CardContent>
        <Chip label={articulo.categoria} size="small" sx={{ mb: 1 }} />
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {articulo.titulo}
        </Typography>
        {articulo.resumen && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {articulo.resumen}
          </Typography>
        )}
        <Typography variant="caption" color="text.disabled">
          Por {articulo.autor?.nombre} {articulo.autor?.apellido} · {articulo.vistas} vistas
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
)

export default Wiki
