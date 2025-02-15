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
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

interface User {
  id: string
  nombre: string
  apellido: string
  pais: string
  email: string
  avatarUrl?: string
  area: string
  acercaDe: string
  ingenio: string
  empleador: string
}

interface Experience {
  id: string | null
  cargo: string
  acercaDe: string
  ingenio: string
  area: string
  fechaInicio: string
  fechaFin: string
  actualmenteTrabaja: boolean
}

const Perfil: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState<User | null>(null)
  const [experiencias, setExperiencias] = useState<Experience[]>([]) // Corrección aquí
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [experienceData, setExperienceData] = useState<Experience>({
    id: null,
    ingenio: '',
    fechaInicio: '',
    fechaFin: '',
    cargo: '',
    area: '',
    acercaDe: '',
    actualmenteTrabaja: false,
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

  const formatDate = (isoString: string) => {
    return isoString.split('T')[0] // Extrae solo la parte de la fecha (YYYY-MM-DD)
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

  const handleOpenModal = (experience: Experience | null = null) => {
    return () => {
      setExperienceData(
        experience || {
          id: null,
          ingenio: '',
          fechaInicio: '',
          fechaFin: '',
          cargo: '',
          area: '',
          acercaDe: '',
          actualmenteTrabaja: false,
        }
      )
      setModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setExperienceData({
      id: null,
      ingenio: '',
      fechaInicio: '',
      fechaFin: '',
      cargo: '',
      area: '',
      acercaDe: '',
      actualmenteTrabaja: false,
    })
  }

  const handleSaveExperience = async () => {
    if (!user?.id) {
      console.error('Error: Usuario no autenticado.')
      return
    }
    try {
      if (experienceData.id) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/experiencias/${experienceData.id}`,
          experienceData
        )
        setExperiencias(
          experiencias.map((exp) =>
            exp.id === experienceData.id ? experienceData : exp
          )
        )
      } else {
        const { id, ...dataWithoutId } = experienceData // Extraer id y guardar el resto en dataWithoutId
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/experiencias/${user.id}`,
          dataWithoutId
        )

        setExperiencias([...experiencias, response.data])
      }
      handleCloseModal()
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

  const handleDeleteExperience = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    if (!experienceData.id) return
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/experiencias/${experienceData.id}`,
        {
          data: { userId: user?.id },
        }
      )
      setExperiencias(
        experiencias.filter((exp) => exp.id !== experienceData.id)
      )
      handleCloseModal()
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
                  <strong>Ingenio:</strong> {usuario.ingenio}
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
        Experiencia Azucarera
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
                  {exp.actualmenteTrabaja
                    ? 'Actual'
                    : formatearFecha(exp.fechaFin)}
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
              onClick={handleOpenModal(exp)}
              sx={{ position: 'absolute', bottom: 8, right: 8 }}
            >
              <EditIcon />
            </IconButton>
          )}
        </Card>
      ))}
      {esPropietario && (
        <Button
          variant='contained'
          onClick={handleOpenModal(null)}
          sx={{ mt: 2 }}
        >
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
            width: 600,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <TextField
            fullWidth
            label='Ingenio'
            name='ingenio'
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
            name='fechaInicio'
            InputLabelProps={{ shrink: true }}
            margin='dense'
            value={
              experienceData.fechaInicio
                ? formatDate(experienceData.fechaInicio)
                : ''
            }
            onChange={(e) =>
              setExperienceData({
                ...experienceData,
                fechaInicio: e.target.value,
              })
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                id='actualmenteTrabaja'
                name='actualmenteTrabaja'
                checked={experienceData.actualmenteTrabaja}
                onChange={(e) =>
                  setExperienceData({
                    ...experienceData,
                    actualmenteTrabaja: e.target.checked,
                    fechaFin: '',
                  })
                }
              />
            }
            label='Actualmente trabajo aquí'
          />
          <TextField
            fullWidth
            type='date'
            name='fechaFin'
            label='Fecha de Fin'
            InputLabelProps={{ shrink: true }}
            margin='dense'
            value={
              experienceData.fechaFin ? formatDate(experienceData.fechaFin) : ''
            }
            onChange={(e) => {
              const nuevaFechaFin = e.target.value
              if (
                experienceData.fechaInicio &&
                nuevaFechaFin < experienceData.fechaInicio
              ) {
                alert(
                  'La fecha de fin no puede ser anterior a la fecha de inicio.'
                )
              } else {
                setExperienceData({
                  ...experienceData,
                  fechaFin: nuevaFechaFin,
                })
              }
            }}
            disabled={experienceData.actualmenteTrabaja}
          />
          <TextField
            fullWidth
            label='Cargo'
            name='cargo'
            margin='dense'
            variant='outlined'
            value={experienceData.cargo}
            onChange={(e) =>
              setExperienceData({ ...experienceData, cargo: e.target.value })
            }
          />
          <FormControl fullWidth margin='dense'>
            <InputLabel id='area-label'>Área de Trabajo</InputLabel>
            <Select
              labelId='area-label'
              id='area'
              name='area'
              value={experienceData.area}
              label='Área de Trabajo'
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
          </FormControl>
          <TextField
            fullWidth
            label='Descripción'
            name='acercaDe'
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
            color='primary'
            sx={{ mt: 3 }}
            onClick={handleSaveExperience}
          >
            Guardar Cambios
          </Button>
          {experienceData.id && (
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                color: 'error.main',
              }}
              onClick={handleDeleteExperience}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Modal>
    </Box>
  )
}

export default Perfil
