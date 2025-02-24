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
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import { User, Experience, Area, Ingenio } from '../types/interfaces'
import {
  fetchAreas,
  fetchIngenios,
  fetchPaises,
} from '../functions/fetchFunctions'
import ExperienceModal from './ExperienceModal'

const Perfil: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState<User | null>(null)
  const [experiencias, setExperiencias] = useState<Experience[]>([]) // Corrección aquí
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [areas, setAreas] = useState<Area[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [paises, setPaises] = useState<string[]>([])
  const [experienceData, setExperienceData] = useState<Experience>({
    id: '',
    ingenio: '',
    fechaInicio: '',
    fechaFin: '',
    cargo: '',
    pais: '',
    area: '',
    acercaDe: '',
    actualmenteTrabaja: false,
  })

  const { user } = useAuth() // Usuario autenticado
  const esPropietario = user?.id === id // Verifica si es su propio perfil

  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), 'MMM yyyy', { locale: es }) // Ejemplo: "Feb 2025"
  }

  const formatDate = (isoString: string) => {
    return isoString.split('T')[0] // Extrae solo la parte de la fecha (YYYY-MM-DD)
  }

  useEffect(() => {
    const fetchData = async () => {
      const { areas, error: areasError } = await fetchAreas()
      const { ingenios, error: ingeniosError } = await fetchIngenios()
      const { paises, error: paisesError } = await fetchPaises()

      if (areasError) {
        setError(areasError)
      } else {
        setAreas(areas || [])
      }

      if (ingeniosError) {
        setError(ingeniosError)
      } else {
        setIngenios(ingenios || [])
      }

      if (paisesError) {
        setError(paisesError)
      } else {
        setPaises(paises || [])
      }
    }
    fetchData()
  }, [])

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
          id: '',
          ingenio: '',
          fechaInicio: '',
          fechaFin: '',
          cargo: '',
          area: '',
          pais: '',
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
      id: '',
      ingenio: '',
      fechaInicio: '',
      fechaFin: '',
      cargo: '',
      area: '',
      pais: '',
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
          { ...experienceData, userId: user.id }
        )
      } else {
        const { id, ...dataWithoutId } = experienceData
        await axios.post(
          `${import.meta.env.VITE_API_URL}/experiencias/${user.id}`,
          dataWithoutId
        )
      }

      // 🔄 Vuelve a cargar la lista completa de experiencias desde la API
      const expResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/experiencias/${user.id}`
      )
      setExperiencias(expResponse.data)

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

  const handleDeleteExperience = async () => {
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
                  <strong>{usuario.proveedor ? 'Empresa' : 'Ingenio'}:</strong>{' '}
                  {usuario.proveedor || usuario.ingenio}
                </Typography>
                {!usuario.proveedor && (
                  <Typography variant='body1' gutterBottom>
                    <strong>Área:</strong>{' '}
                    {usuario.area === 'null' || usuario.area?.trim() === ''
                      ? 'No especificada'
                      : usuario.area}
                  </Typography>
                )}
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

      {modalOpen && (
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <ExperienceModal
            experienceData={experienceData}
            setExperienceData={setExperienceData}
            paises={paises}
            ingenios={ingenios}
            areas={areas}
            onSave={handleSaveExperience}
            onClose={handleCloseModal}
            onDelete={experienceData.id ? handleDeleteExperience : undefined}
            formatDate={formatDate}
          />
        </Modal>
      )}
    </Box>
  )
}

export default Perfil
