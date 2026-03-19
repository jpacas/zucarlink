import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Container,
  Alert,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'

interface Revision {
  id: number
  usuarioId: string
  contenidoMarkdown: string
  resumen: string | null
  createdAt: string
  editor: {
    nombre: string
    apellido: string
    username: string
  }
}

interface WikiArticuloFull {
  id: number
  titulo: string
  slug: string
  contenidoMarkdown: string
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
  revisiones: Revision[]
}

const WikiArticulo: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [articulo, setArticulo] = useState<WikiArticuloFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticulo = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const res = await axiosInstance.get(`/wiki/${slug}`)
        setArticulo(res.data)
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          setError('Artículo no encontrado')
        } else {
          setError('Error al cargar el artículo')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchArticulo()
  }, [slug])

  if (loading) {
    return (
      <Box sx={{ pt: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !articulo) {
    return (
      <Box sx={{ pt: 10, pb: 6 }}>
        <Container maxWidth="md">
          <Alert severity="error">{error || 'No se pudo cargar el artículo'}</Alert>
          <Button sx={{ mt: 2 }} onClick={() => navigate('/wiki')}>
            Volver a la Wiki
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ pt: 10, pb: 6, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Button size="small" onClick={() => navigate('/wiki')} sx={{ mb: 2 }}>
          ← Volver a la Wiki
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Chip label={articulo.categoria} size="small" color="primary" />
          {isAuthenticated && (
            <Button variant="outlined" size="small" onClick={() => navigate(`/wiki/${slug}/editar`)}>
              Editar
            </Button>
          )}
        </Box>

        <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, mb: 1 }}>
          {articulo.titulo}
        </Typography>

        {articulo.resumen && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {articulo.resumen}
          </Typography>
        )}

        <Typography variant="caption" color="text.disabled">
          Por {articulo.autor?.nombre} {articulo.autor?.apellido} (@{articulo.autor?.username}) ·{' '}
          {articulo.vistas} vistas · Actualizado {new Date(articulo.updatedAt).toLocaleDateString('es-ES')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            lineHeight: 1.8,
            bgcolor: 'background.paper',
          }}
        >
          <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {articulo.contenidoMarkdown}
          </Typography>
        </Paper>

        {articulo.revisiones && articulo.revisiones.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Historial de revisiones ({articulo.revisiones.length})
            </Typography>
            {articulo.revisiones.map((rev) => (
              <Accordion key={rev.id} variant="outlined" sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {rev.editor?.nombre} {rev.editor?.apellido} (@{rev.editor?.username})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(rev.createdAt).toLocaleString('es-ES')}
                      {rev.resumen ? ` — ${rev.resumen}` : ''}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}
                  >
                    {rev.contenidoMarkdown}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default WikiArticulo
