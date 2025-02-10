import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Grid,
  CardActions,
  Button,
  Modal,
  Chip,
  TextField,
  Select,
  MenuItem,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'

interface User {
  id: string
  nombre: string
  apellido: string
  pais: string
  email: string
  avatarUrl?: string
  area: string
  acercaDe: string
}

interface Experience {
  id: string
  cargo: string
  acercaDe: string
  ingenio: string
  area: string
  fechaInicio: string
  fechaFin: string
}

const Perfil: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState<User | null>(null)
  const [experiencias, setExperiencias] = useState<Experience[]>([]) // Corrección aquí
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [experienceData, setExperienceData] = useState({
    // Definir estado para datos de formulario
    ingenio: '',
    fechaInicio: '',
    fechaFin: '',
    cargo: '',
    area: '',
    acercaDe: '',
  })

  const { user } = useAuth() // Usuario autenticado
  const esPropietario = user?.id === id // Verifica si es su propio perfil

  const areas = [
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

  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), 'MMM yyyy', { locale: es }) // Ejemplo: "Feb 2025"
  }

  useEffect(() => {
    const fetchUsuarioYExperiencias = async () => {
      setLoading(true)
      try {
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/usuarios/${id}`
        )
        setUsuario(userResponse.data)

        const expResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/experiencias/${id}`
        )
        setExperiencias(expResponse.data.length ? expResponse.data : [])
      } catch (expError: any) {
        if (expError.response && expError.response.status === 404) {
          setExperiencias([])
        } else {
          setError('Error al cargar el usuario o las experiencias')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarioYExperiencias()
  }, [id])

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleSaveExperience = async () => {
    if (!user?.id) {
      console.error('Error: Usuario no autenticado.')
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/experiencias/${usuario?.id}`,
        experienceData
      )
      setExperiencias([...experiencias, response.data]) // Suponiendo que la API devuelve la experiencia creada
      handleCloseModal()
      setExperienceData({
        ingenio: '',
        fechaInicio: '',
        fechaFin: '',
        cargo: '',
        area: '',
        acercaDe: '',
      })
    } catch (error) {
      console.error('Error al guardar la experiencia', error)
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          marginTop: '64px',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          padding: 3,
          marginTop: '64px',
        }}
      >
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  const handleDeleteExperience = async (expId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/experiencias/${expId}`,
        {
          data: { userId: user?.id },
        }
      )
      setExperiencias(experiencias.filter((exp) => exp.id !== expId)) // Remover de la lista local
    } catch (error) {
      console.error('Error al eliminar la experiencia', error)
    }
  }

  return (
    <Box
      sx={{
        maxWidth: '800px',
        margin: 'auto',
        padding: 3,
        marginTop: '64px',
      }}
    >
      {usuario && (
        <Card sx={{ boxShadow: 3, padding: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                <Avatar
                  src={usuario.avatarUrl}
                  alt={`${usuario.nombre} ${usuario.apellido}`}
                  sx={{
                    width: 150,
                    height: 150,
                    margin: 'auto',
                    border: '2px solid #ccc',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant='h4' color='primary' gutterBottom>
                  {usuario.nombre} {usuario.apellido}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>País:</strong> {usuario.pais}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Área:</strong>{' '}
                  {usuario.area === 'null' || usuario.area.trim() === ''
                    ? 'Proveedor'
                    : usuario.area}
                </Typography>

                {usuario.acercaDe && (
                  <Typography variant='body1' gutterBottom>
                    <strong>Acerca De:</strong> {usuario.acercaDe}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
          {user?.id === id && (
            <CardActions>
              <Button
                size='small'
                onClick={() => navigate(`/editar-perfil/${id}`)}
              >
                Editar Perfil
              </Button>
            </CardActions>
          )}
        </Card>
      )}
      <Typography variant='h5' sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
        Experiencias
      </Typography>
      {experiencias.map((exp) => (
        <Card key={exp.id} sx={{ mb: 2, position: 'relative', minHeight: 120 }}>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Grid container justifyContent='space-between' alignItems='center'>
              <Grid item xs={12} sm={7}>
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                  {exp.ingenio}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {formatearFecha(exp.fechaInicio)} -{' '}
                  {formatearFecha(exp.fechaFin)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={5} sx={{ textAlign: 'right' }}>
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                >
                  {exp.cargo}
                </Typography>
                <Chip
                  label={exp.area}
                  color='primary'
                  size='small'
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
            <Typography variant='body1' sx={{ mt: 2 }}>
              {exp.acercaDe}
            </Typography>
          </CardContent>

          {esPropietario && (
            <IconButton
              aria-label='delete'
              sx={{
                color: 'gray',
                position: 'absolute',
                bottom: 8,
                right: 8,
              }}
              onClick={() => handleDeleteExperience(exp.id)}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Card>
      ))}
      {esPropietario && (
        <Button variant='contained' onClick={handleOpenModal} sx={{ mt: 2 }}>
          Agregar Experiencia
        </Button>
      )}

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id='modal-title' variant='h6' component='h2'>
            Añadir Nueva Experiencia
          </Typography>
          <TextField
            fullWidth
            label='Ingenio'
            margin='dense'
            variant='outlined'
            value={experienceData.ingenio}
            onChange={(e) =>
              setExperienceData({ ...experienceData, ingenio: e.target.value })
            }
          />
          <TextField
            fullWidth
            type='date'
            label='Fecha de Inicio'
            InputLabelProps={{ shrink: true }}
            margin='dense'
            variant='outlined'
            value={experienceData.fechaInicio}
            onChange={(e) =>
              setExperienceData({
                ...experienceData,
                fechaInicio: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            type='date'
            label='Fecha de Fin'
            InputLabelProps={{ shrink: true }}
            margin='dense'
            variant='outlined'
            value={experienceData.fechaFin}
            onChange={(e) =>
              setExperienceData({ ...experienceData, fechaFin: e.target.value })
            }
          />
          <TextField
            fullWidth
            label='Cargo'
            margin='dense'
            variant='outlined'
            value={experienceData.cargo}
            onChange={(e) =>
              setExperienceData({ ...experienceData, cargo: e.target.value })
            }
          />
          <Select
            value={experienceData.area}
            onChange={(e) =>
              setExperienceData({
                ...experienceData,
                area: e.target.value,
              })
            }
          >
            {areas.map((area) => (
              <MenuItem key={area} value={area}>
                {area}
              </MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            label='Descripción'
            margin='dense'
            variant='outlined'
            multiline
            rows={3}
            value={experienceData.acercaDe}
            onChange={(e) =>
              setExperienceData({
                ...experienceData,
                acercaDe: e.target.value,
              })
            }
          />
          <Button
            variant='contained'
            sx={{ mt: 2 }}
            onClick={handleSaveExperience}
          >
            Guardar
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}

export default Perfil
