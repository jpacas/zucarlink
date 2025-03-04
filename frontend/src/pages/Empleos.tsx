import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  TextField,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Menu,
  Tooltip,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Container,
} from '@mui/material'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSnackbar } from 'notistack'
import { Empleo, Ingenio, Area } from '../types/interfaces'
import {
  LocationOn,
  Business,
  Category,
  CalendarToday,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Description,
} from '@mui/icons-material'
import {
  fetchPaises,
  fetchAreas,
  fetchIngenios,
} from '../functions/fetchFunctions'
import { useNavigate } from 'react-router-dom'

const Empleos: React.FC = () => {
  const [empleos, setEmpleos] = useState<Empleo[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentEmpleoId, setCurrentEmpleoId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedEmpleoId, setSelectedEmpleoId] = useState<number | null>(null)
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  // Estados para filtros
  const [paises, setPaises] = useState<string[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [ingeniosFiltrados, setIngeniosFiltrados] = useState<Ingenio[]>([])
  const [filtros, setFiltros] = useState({
    busqueda: '',
    pais: '',
    ingenio: '',
    area: '',
  })

  // Estado para el formulario de creación
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    pais: '',
    ingenio: '',
    area: '',
    contacto: '',
  })
  const [formLoading, setFormLoading] = useState(false)
  const [archivos, setArchivos] = useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  // Estado para ingenios filtrados en el formulario
  const [formIngeniosFiltrados, setFormIngeniosFiltrados] = useState<Ingenio[]>(
    []
  )

  const fetchEmpleos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/empleos`
      )
      setEmpleos(response.data)
    } catch (error) {
      console.error('Error al cargar empleos:', error)
      enqueueSnackbar('Error al cargar los empleos', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpleos()

    // Cargar datos para filtros
    fetchPaises().then(({ paises, error }) => {
      if (!error) setPaises(paises || [])
    })

    fetchAreas().then(({ areas, error }) => {
      if (!error) setAreas(areas || [])
    })

    fetchIngenios().then(({ ingenios, error }) => {
      if (!error) {
        setIngenios(ingenios || [])
        setIngeniosFiltrados(ingenios || [])
      }
    })
  }, [])

  // Filtrar ingenios por país seleccionado
  useEffect(() => {
    if (filtros.pais) {
      const ingeniosPorPais = ingenios.filter(
        (ingenio) => ingenio.pais.toLowerCase() === filtros.pais.toLowerCase()
      )
      setIngeniosFiltrados(ingeniosPorPais)
      if (!ingeniosPorPais.some((ing) => ing.nombre === filtros.ingenio)) {
        setFiltros((prev) => ({ ...prev, ingenio: '' }))
      }
    } else {
      setIngeniosFiltrados(ingenios)
    }
  }, [filtros.pais, ingenios])

  // Función para manejar cambios en los filtros
  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  // Filtrar empleos según los criterios
  const empleosFiltrados = empleos.filter((empleo) => {
    const matchBusqueda =
      filtros.busqueda === '' ||
      empleo.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      empleo.descripcion?.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const matchPais =
      filtros.pais === '' ||
      empleo.pais?.nombre?.toLowerCase() === filtros.pais.toLowerCase()

    const matchIngenio =
      filtros.ingenio === '' ||
      empleo.ingenio?.nombre?.toLowerCase() === filtros.ingenio.toLowerCase()

    const matchArea =
      filtros.area === '' ||
      empleo.area?.nombre?.toLowerCase() === filtros.area.toLowerCase()

    return matchBusqueda && matchPais && matchIngenio && matchArea
  })

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    if (!fecha) return ''
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Manejar cambios en el formulario
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Si cambia el país, filtrar los ingenios correspondientes
    if (name === 'pais') {
      const ingeniosPorPais = ingenios.filter(
        (ingenio) => ingenio.pais.toLowerCase() === value.toLowerCase()
      )
      setFormIngeniosFiltrados(ingeniosPorPais)
      // Resetear el ingenio seleccionado si el país cambia
      setFormData((prev) => ({ ...prev, ingenio: '' }))
    }
  }

  // Manejar carga de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setArchivos(filesArray)
    }
  }

  // Eliminar un archivo seleccionado
  const handleRemoveFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index))
  }

  // Abrir menú de opciones
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    empleoId: number
  ) => {
    event.stopPropagation()
    console.log(`Abriendo menú para empleo ID: ${empleoId}`)
    setMenuAnchorEl(event.currentTarget)
    setSelectedEmpleoId(empleoId)
  }

  // Cerrar menú de opciones
  const handleMenuClose = () => {
    setMenuAnchorEl(null)
    // No reseteamos selectedEmpleoId aquí para mantenerlo para las acciones
  }

  // Abrir modal para editar
  const handleEditClick = (empleo: Empleo) => {
    setFormData({
      nombre: empleo.nombre || '',
      descripcion: empleo.descripcion || '',
      pais: empleo.pais?.nombre || '',
      ingenio: empleo.ingenio?.nombre || '',
      area: empleo.area?.nombre || '',
      contacto: empleo.contacto || '',
    })

    // Filtrar ingenios por el país del empleo que se está editando
    if (empleo.pais?.nombre) {
      const ingeniosPorPais = ingenios.filter(
        (ingenio) =>
          ingenio.pais.toLowerCase() === empleo.pais?.nombre?.toLowerCase()
      )
      setFormIngeniosFiltrados(ingeniosPorPais)
    }

    setCurrentEmpleoId(empleo.id || null)
    setEditMode(true)
    setModalOpen(true)
    handleMenuClose()
  }

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = () => {
    console.log(
      `Abriendo diálogo de confirmación para eliminar empleo ID: ${selectedEmpleoId}`
    )
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  // Eliminar empleo
  const handleDeleteConfirm = async () => {
    console.log(
      `Intentando eliminar empleo, selectedEmpleoId: ${selectedEmpleoId}`
    )

    if (!selectedEmpleoId) {
      console.error('Error: No hay ID de empleo seleccionado para eliminar')
      enqueueSnackbar('Error: No se pudo identificar el empleo a eliminar', {
        variant: 'error',
      })
      setDeleteDialogOpen(false)
      return
    }

    try {
      setFormLoading(true)
      console.log(`Eliminando empleo con ID: ${selectedEmpleoId}`)

      // Verificar la URL completa para depuración
      const deleteUrl = `${
        import.meta.env.VITE_API_URL
      }/empleos/${selectedEmpleoId}`
      console.log(`URL de eliminación: ${deleteUrl}`)

      const response = await axios.delete(deleteUrl)
      console.log('Respuesta del servidor:', response)

      if (response.status === 200 || response.status === 204) {
        // Actualizar el estado local eliminando el empleo
        setEmpleos((prev) =>
          prev.filter((empleo) => empleo.id !== selectedEmpleoId)
        )

        enqueueSnackbar('Oferta de empleo eliminada con éxito', {
          variant: 'success',
        })
      } else {
        throw new Error(`Error al eliminar la oferta: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error detallado al eliminar empleo:', error)

      // Usar aserción de tipo para error
      const err = error as any

      // Mostrar información más detallada del error
      if (err.response) {
        console.error('Datos de respuesta de error:', err.response.data)
        console.error('Estado de error:', err.response.status)
        enqueueSnackbar(
          `Error al eliminar: ${err.response.status} - ${
            err.response.data.message || 'Error desconocido'
          }`,
          { variant: 'error' }
        )
      } else if (err.request) {
        console.error('No se recibió respuesta:', err.request)
        enqueueSnackbar(
          'No se recibió respuesta del servidor. Verifica tu conexión.',
          { variant: 'error' }
        )
      } else {
        enqueueSnackbar(
          `Error al eliminar la oferta: ${err.message || 'Error desconocido'}`,
          {
            variant: 'error',
          }
        )
      }
    } finally {
      setDeleteDialogOpen(false)
      setSelectedEmpleoId(null)
      setFormLoading(false)
    }
  }

  // Manejar envío del formulario (crear o editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      enqueueSnackbar('Debes iniciar sesión para publicar una oferta', {
        variant: 'error',
      })
      return
    }

    if (
      !formData.nombre ||
      !formData.descripcion ||
      !formData.pais ||
      !formData.ingenio ||
      !formData.area ||
      !formData.contacto
    ) {
      enqueueSnackbar('Todos los campos son obligatorios', { variant: 'error' })
      return
    }

    setFormLoading(true)

    try {
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData()

      // Añadir datos del formulario
      formDataToSend.append('nombre', formData.nombre)
      formDataToSend.append('descripcion', formData.descripcion)
      formDataToSend.append('pais', formData.pais)
      formDataToSend.append('ingenio', formData.ingenio)
      formDataToSend.append('area', formData.area)
      formDataToSend.append('contacto', formData.contacto)
      formDataToSend.append('usuarioId', user.id.toString())

      // Añadir archivos si existen (tanto en creación como en edición)
      archivos.forEach((archivo) => {
        formDataToSend.append('archivos', archivo)
      })

      let response: { data: Empleo }
      let url: string

      if (editMode && currentEmpleoId) {
        // Actualizar empleo existente
        url = `${import.meta.env.VITE_API_URL}/empleos/${currentEmpleoId}`
        console.log(`Actualizando empleo en: ${url}`)

        response = await axios.put(url, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        console.log('Respuesta de actualización:', response)

        // Actualizar el empleo en el estado
        setEmpleos((prev) =>
          prev.map((empleo) =>
            empleo.id === currentEmpleoId ? response.data : empleo
          )
        )

        enqueueSnackbar('Oferta de empleo actualizada con éxito', {
          variant: 'success',
        })
      } else {
        // Crear nuevo empleo
        url = `${import.meta.env.VITE_API_URL}/empleos`
        console.log(`Creando empleo en: ${url}`)

        response = await axios.post(url, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        console.log('Respuesta de creación:', response)

        setEmpleos((prev) => [response.data, ...prev])

        enqueueSnackbar('Oferta de empleo publicada con éxito', {
          variant: 'success',
        })
      }

      // Resetear formulario y cerrar modal
      setModalOpen(false)
      setFormData({
        nombre: '',
        descripcion: '',
        pais: '',
        ingenio: '',
        area: '',
        contacto: '',
      })
      setArchivos([])
      setFormIngeniosFiltrados([])
      setEditMode(false)
      setCurrentEmpleoId(null)
    } catch (error) {
      console.error('Error detallado al procesar empleo:', error)

      // Usar aserción de tipo para error
      const err = error as any

      // Mostrar información más detallada del error
      if (err.response) {
        console.error('Datos de respuesta de error:', err.response.data)
        console.error('Estado de error:', err.response.status)
        enqueueSnackbar(
          `Error: ${err.response.status} - ${
            err.response.data.message || 'Error desconocido'
          }`,
          { variant: 'error' }
        )
      } else if (err.request) {
        console.error('No se recibió respuesta:', err.request)
        enqueueSnackbar(
          'No se recibió respuesta del servidor. Verifica tu conexión.',
          { variant: 'error' }
        )
      } else {
        enqueueSnackbar(
          editMode
            ? `Error al actualizar la oferta: ${
                err.message || 'Error desconocido'
              }`
            : `Error al publicar la oferta: ${
                err.message || 'Error desconocido'
              }`,
          { variant: 'error' }
        )
      }
    } finally {
      setFormLoading(false)
    }
  }

  // Resetear formulario al cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData({
      nombre: '',
      descripcion: '',
      pais: '',
      ingenio: '',
      area: '',
      contacto: '',
    })
    setArchivos([])
    setFormIngeniosFiltrados([])
    setEditMode(false)
    setCurrentEmpleoId(null)
  }

  // Agregar función para manejar el clic en un empleo
  const handleEmpleoClick = (empleoId: number) => {
    navigate(`/empleos/${empleoId}`)
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
      }}
    >
      <Container maxWidth='lg'>
        <Grid container spacing={4} direction={{ xs: 'column', md: 'row' }}>
          {/* Sección de filtros (a la izquierda en pantallas grandes) */}
          <Grid
            item
            sx={{
              flex: { xs: '1 1 auto', md: '0 0 25%' },
              maxWidth: { xs: '100%', md: '25%' },
              pl: { md: 0 },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: '80px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                },
                ml: { md: -2 },
              }}
            >
              <Typography
                variant='h5'
                sx={{
                  mb: 3,
                  color: '#1a1a1a',
                  fontWeight: 700,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    display: 'block',
                    width: '40px',
                    height: '3px',
                    backgroundColor: '#ff6347',
                    mt: 1,
                    borderRadius: '2px',
                  },
                }}
              >
                Filtros
              </Typography>

              <TextField
                fullWidth
                label='Buscar por palabra clave'
                name='busqueda'
                value={filtros.busqueda}
                onChange={handleFiltroChange}
                variant='outlined'
                size='small'
                sx={{ mb: 2 }}
              />

              <Autocomplete
                options={paises}
                value={filtros.pais || null}
                onChange={(_, value) =>
                  setFiltros({ ...filtros, pais: value || '' })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='País'
                    size='small'
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Autocomplete
                options={ingeniosFiltrados.map((ing) => ing.nombre)}
                value={filtros.ingenio || null}
                onChange={(_, value) =>
                  setFiltros({ ...filtros, ingenio: value || '' })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Ingenio'
                    size='small'
                    fullWidth
                    disabled={ingeniosFiltrados.length === 0}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Autocomplete
                options={areas}
                value={filtros.area || null}
                onChange={(_, value) =>
                  setFiltros({ ...filtros, area: value || '' })
                }
                renderInput={(params) => (
                  <TextField {...params} label='Área' size='small' fullWidth />
                )}
              />

              <Divider sx={{ my: 3 }} />

              <Button
                variant='contained'
                onClick={() => {
                  setEditMode(false)
                  setModalOpen(true)
                }}
                fullWidth
                startIcon={<Business />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: 'bold',
                  bgcolor: '#ff6347',
                  '&:hover': {
                    bgcolor: '#e5533f',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(255,99,71,0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Publicar Oferta
              </Button>
            </Paper>
          </Grid>

          {/* Sección de empleos (a la derecha) */}
          <Grid
            item
            sx={{
              flex: { xs: '1 1 auto', md: '1' },
              maxWidth: '100%',
              pl: { md: 2 },
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress sx={{ color: '#ff6347' }} />
              </Box>
            ) : empleosFiltrados.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  variant='h6'
                  sx={{
                    color: '#4a4a4a',
                    fontWeight: 500,
                  }}
                >
                  No se encontraron empleos con los criterios seleccionados
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {empleosFiltrados.map((empleo) => (
                  <Grid item xs={12} sm={6} md={6} key={empleo.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                        },
                        position: 'relative',
                        mx: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleEmpleoClick(empleo.id || 0)}
                    >
                      {/* Menú de opciones (solo visible para el creador) */}
                      {user && empleo.autor && user.id === empleo.autor.id && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                          }}
                        >
                          <Tooltip title='Opciones'>
                            <IconButton
                              size='small'
                              onClick={(e) => handleMenuOpen(e, empleo.id || 0)}
                              sx={{
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: '#ff634710' },
                              }}
                            >
                              <MoreVert fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant='h6'
                          gutterBottom
                          align='center'
                          sx={{
                            fontWeight: 700,
                            color: '#1a1a1a',
                            mb: 2,
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              display: 'block',
                              width: '40px',
                              height: '3px',
                              backgroundColor: '#ff6347',
                              margin: '8px auto',
                              borderRadius: '2px',
                            },
                          }}
                        >
                          {empleo.nombre}
                        </Typography>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <Business
                            fontSize='small'
                            sx={{ mr: 1, color: '#ff6347' }}
                          />
                          <Typography
                            variant='subtitle1'
                            sx={{ color: '#1a1a1a', fontWeight: 500 }}
                          >
                            {empleo.ingenio?.nombre ||
                              'Ingenio no especificado'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <LocationOn
                            fontSize='small'
                            sx={{ mr: 1, color: '#4a4a4a' }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            {empleo.pais?.nombre || 'País no especificado'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <Category
                            fontSize='small'
                            sx={{ mr: 1, color: '#4a4a4a' }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            {empleo.area?.nombre || 'Área no especificada'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                        >
                          <CalendarToday
                            fontSize='small'
                            sx={{ mr: 1, color: '#4a4a4a' }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            Publicado: {formatFecha(empleo.createdAt)}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Typography
                          variant='body2'
                          sx={{
                            mt: 2,
                            color: '#4a4a4a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {empleo.descripcion}
                        </Typography>

                        {empleo.contacto && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 1, fontStyle: 'italic' }}
                          >
                            Contacto: {empleo.contacto}
                          </Typography>
                        )}

                        {empleo.vigente ? (
                          <Chip
                            label='Vacante activa'
                            color='success'
                            size='small'
                            sx={{ mt: 2 }}
                          />
                        ) : (
                          <Chip
                            label='Vacante cerrada'
                            color='error'
                            size='small'
                            sx={{ mt: 2 }}
                          />
                        )}

                        {empleo.autor && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mt: 2,
                            }}
                          >
                            <Avatar
                              src={empleo.autor.avatarUrl}
                              alt={empleo.autor.nombre}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              Publicado por: {empleo.autor.nombre}{' '}
                              {empleo.autor.apellido}
                            </Typography>
                          </Box>
                        )}

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            color: 'text.secondary',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            gap: 1,
                          }}
                        >
                          {empleo.archivos && empleo.archivos.length > 0 && (
                            <Tooltip
                              title={`${empleo.archivos.length} archivo(s) adjunto(s)`}
                            >
                              <Description
                                fontSize='small'
                                sx={{ color: '#ff6347' }}
                              />
                            </Tooltip>
                          )}
                          <Visibility fontSize='small' />
                          <Typography variant='body2'>
                            {empleo.views || 0}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Menú de opciones para editar/eliminar */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            const empleo = empleos.find((e) => e.id === selectedEmpleoId)
            if (empleo) handleEditClick(empleo)
          }}
          sx={{ color: '#ff6347' }}
        >
          <Edit fontSize='small' sx={{ mr: 1 }} />
          Editar oferta
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: '#ff6347' }}>
          <Delete fontSize='small' sx={{ mr: 1 }} />
          Eliminar oferta
        </MenuItem>
      </Menu>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!formLoading) {
            setDeleteDialogOpen(false)
          }
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta oferta de empleo? Esta
            acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
            }}
            color='primary'
            disabled={formLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant='contained'
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: '#ff6347',
              '&:hover': {
                bgcolor: '#e5533f',
              },
            }}
          >
            {formLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para crear/editar ofertas */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth='md'
        fullWidth
      >
        <Box component='form' onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Typography
            variant='h5'
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                width: '40px',
                height: '3px',
                backgroundColor: '#ff6347',
                mt: 1,
                borderRadius: '2px',
              },
            }}
          >
            {editMode
              ? 'Editar oferta de empleo'
              : 'Publicar nueva oferta de empleo'}
          </Typography>

          <TextField
            fullWidth
            label='Título de la oferta'
            name='nombre'
            value={formData.nombre}
            onChange={handleFormChange}
            margin='normal'
            required
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
            label='Descripción'
            name='descripcion'
            value={formData.descripcion}
            onChange={handleFormChange}
            margin='normal'
            multiline
            rows={4}
            required
            helperText='Describe los requisitos, responsabilidades y beneficios del puesto'
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

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={paises}
                value={formData.pais || null}
                onChange={(_, value) => {
                  setFormData((prev) => ({
                    ...prev,
                    pais: value || '',
                    ingenio: '',
                  }))

                  if (value) {
                    const ingeniosPorPais = ingenios.filter(
                      (ingenio) =>
                        ingenio.pais.toLowerCase() === value.toLowerCase()
                    )
                    setFormIngeniosFiltrados(ingeniosPorPais)
                  } else {
                    setFormIngeniosFiltrados([])
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='País'
                    required
                    fullWidth
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
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={formIngeniosFiltrados.map((ing) => ing.nombre)}
                value={formData.ingenio || null}
                onChange={(_, value) =>
                  setFormData((prev) => ({ ...prev, ingenio: value || '' }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Ingenio'
                    required
                    fullWidth
                    disabled={!formData.pais}
                    helperText={
                      !formData.pais
                        ? 'Selecciona un país primero'
                        : formIngeniosFiltrados.length === 0 && formData.pais
                        ? 'No hay ingenios disponibles para este país'
                        : ''
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
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#ff6347',
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={areas}
                value={formData.area || null}
                onChange={(_, value) =>
                  setFormData((prev) => ({ ...prev, area: value || '' }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Área'
                    required
                    fullWidth
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
                )}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label='Información de contacto'
            name='contacto'
            value={formData.contacto}
            onChange={handleFormChange}
            margin='normal'
            required
            helperText='Correo electrónico o teléfono para que los candidatos puedan contactarte'
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

          {/* Sección para carga de archivos */}
          <Box sx={{ mt: 3 }}>
            <Typography
              variant='subtitle1'
              gutterBottom
              sx={{
                color: '#1a1a1a',
                fontWeight: 600,
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: '#ff6347',
                  mt: 1,
                  borderRadius: '2px',
                },
              }}
            >
              {editMode
                ? 'Documentos adjuntos (los archivos nuevos reemplazarán a los existentes)'
                : 'Documentos adjuntos (opcional)'}
            </Typography>
            <input
              type='file'
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
              accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
            />
            <Button
              variant='outlined'
              onClick={() => fileInputRef.current?.click()}
              startIcon={<Business />}
              sx={{
                mb: 2,
                borderColor: '#ff6347',
                color: '#ff6347',
                '&:hover': {
                  borderColor: '#e5533f',
                  backgroundColor: '#ff634710',
                },
              }}
            >
              Seleccionar archivos
            </Button>

            {archivos.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Archivos seleccionados:
                </Typography>
                <Box sx={{ maxHeight: '150px', overflow: 'auto' }}>
                  {archivos.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <Typography
                        variant='body2'
                        noWrap
                        sx={{ maxWidth: '80%' }}
                      >
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </Typography>
                      <Button
                        size='small'
                        onClick={() => handleRemoveFile(index)}
                        sx={{
                          color: '#ff6347',
                          '&:hover': {
                            backgroundColor: '#ff634710',
                          },
                        }}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {editMode && archivos.length === 0 && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                No has seleccionado nuevos archivos. Si continúas, se mantendrán
                los archivos existentes.
              </Typography>
            )}
          </Box>

          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}
          >
            <Button
              variant='outlined'
              onClick={handleCloseModal}
              disabled={formLoading}
              sx={{
                borderColor: '#ff6347',
                color: '#ff6347',
                '&:hover': {
                  borderColor: '#e5533f',
                  backgroundColor: '#ff634710',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={formLoading}
              startIcon={formLoading ? <CircularProgress size={20} /> : null}
              sx={{
                bgcolor: '#ff6347',
                '&:hover': {
                  bgcolor: '#e5533f',
                },
              }}
            >
              {formLoading
                ? editMode
                  ? 'Actualizando...'
                  : 'Publicando...'
                : editMode
                ? 'Actualizar oferta'
                : 'Publicar oferta'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  )
}

export default Empleos
