import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Container,
  Alert,
  Paper,
  Stack,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import axiosInstance from '../utils/axiosConfig'

const CATEGORIAS = ['Fabricación', 'Maquinaria', 'Agronomía', 'Laboratorio', 'Electricidad', 'Administración', 'General']

const isNuevo = (slug: string | undefined) => slug === 'nuevo'

const EditarWikiArticulo: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const [loading, setLoading] = useState(!isNuevo(slug))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [titulo, setTitulo] = useState('')
  const [contenidoMarkdown, setContenidoMarkdown] = useState('')
  const [resumen, setResumen] = useState('')
  const [categoria, setCategoria] = useState('General')

  useEffect(() => {
    if (isNuevo(slug)) return

    const fetchArticulo = async () => {
      try {
        setLoading(true)
        const res = await axiosInstance.get(`/wiki/${slug}`)
        setTitulo(res.data.titulo)
        setContenidoMarkdown(res.data.contenidoMarkdown)
        setResumen(res.data.resumen || '')
        setCategoria(res.data.categoria)
      } catch {
        setError('No se pudo cargar el artículo para editar')
      } finally {
        setLoading(false)
      }
    }
    fetchArticulo()
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !contenidoMarkdown.trim()) {
      enqueueSnackbar('El título y el contenido son requeridos', { variant: 'warning' })
      return
    }

    setSaving(true)
    try {
      if (isNuevo(slug)) {
        const res = await axiosInstance.post('/wiki', { titulo, contenidoMarkdown, resumen, categoria })
        enqueueSnackbar('Artículo creado exitosamente', { variant: 'success' })
        navigate(`/wiki/${res.data.slug}`)
      } else {
        await axiosInstance.put(`/wiki/${slug}`, { titulo, contenidoMarkdown, resumen })
        enqueueSnackbar('Artículo actualizado exitosamente', { variant: 'success' })
        navigate(`/wiki/${slug}`)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (msg?.includes('reputación') || msg?.includes('insufficient_reputation')) {
        enqueueSnackbar('Necesitas 500 puntos de reputación o plan Pro para editar', { variant: 'error' })
      } else {
        enqueueSnackbar(msg || 'Error al guardar el artículo', { variant: 'error' })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ pt: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ pt: 10, pb: 6, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Button size="small" onClick={() => navigate(isNuevo(slug) ? '/wiki' : `/wiki/${slug}`)} sx={{ mb: 2 }}>
          ← Cancelar
        </Button>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {isNuevo(slug) ? 'Nuevo artículo' : 'Editar artículo'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Título"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                fullWidth
                required
                disabled={saving}
              />

              <TextField
                label="Resumen (opcional)"
                value={resumen}
                onChange={e => setResumen(e.target.value)}
                fullWidth
                multiline
                rows={2}
                inputProps={{ maxLength: 500 }}
                helperText={`${resumen.length}/500`}
                disabled={saving}
              />

              {isNuevo(slug) && (
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={categoria}
                    label="Categoría"
                    onChange={e => setCategoria(e.target.value)}
                    disabled={saving}
                  >
                    {CATEGORIAS.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                label="Contenido (Markdown)"
                value={contenidoMarkdown}
                onChange={e => setContenidoMarkdown(e.target.value)}
                fullWidth
                multiline
                rows={20}
                required
                disabled={saving}
                inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.9rem' } }}
                helperText="Puedes usar Markdown para formatear el contenido"
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={18} /> : null}
                >
                  {saving ? 'Guardando...' : isNuevo(slug) ? 'Publicar artículo' : 'Guardar cambios'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default EditarWikiArticulo
