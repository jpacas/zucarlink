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
  FormControl,
  InputLabel,
  Select,
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
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSnackbar } from 'notistack'
import { Empleo, Ingenio, Area } from '../types/interfaces'
import {
  LocationOn,
  Business,
  Category,
  CalendarToday,
  FilterAlt,
  MoreVert,
  Edit,
  Delete,
} from '@mui/icons-material'
import {
  fetchPaises,
  fetchAreas,
  fetchIngenios,
} from '../functions/fetchFunctions'

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

  return (
    <Box sx={{ padding: 3, marginTop: '64px' }}>
      <Grid container spacing={3}>
        {/* Sección de filtros (a la izquierda en pantallas grandes) */}
        <Grid item xs={12} md={3} lg={2}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              position: { md: 'sticky' },
              top: { md: '80px' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterAlt color='primary' sx={{ mr: 1 }} />
              <Typography variant='h6'>Filtros</Typography>
            </Box>

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
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              Publicar Oferta
            </Button>
          </Paper>
        </Grid>

        {/* Sección de empleos (a la derecha) */}
        <Grid item xs={12} md={9} lg={10}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : empleosFiltrados.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant='h6'>
                No se encontraron empleos con los criterios seleccionados
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {empleosFiltrados.map((empleo) => (
                <Grid item xs={12} sm={6} md={6} lg={4} key={empleo.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                      },
                      position: 'relative',
                    }}
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
                              '&:hover': { bgcolor: 'action.hover' },
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
                        sx={{ fontWeight: 'bold', mb: 2 }}
                      >
                        {empleo.nombre}
                      </Typography>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Business
                          fontSize='small'
                          color='primary'
                          sx={{ mr: 1 }}
                        />
                        <Typography variant='subtitle1' color='primary'>
                          {empleo.ingenio?.nombre || 'Ingenio no especificado'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <LocationOn
                          fontSize='small'
                          color='action'
                          sx={{ mr: 1 }}
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
                          color='action'
                          sx={{ mr: 1 }}
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
                          color='action'
                          sx={{ mr: 1 }}
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
                          sx={{ display: 'flex', alignItems: 'center', mt: 2 }}
                        >
                          <Avatar
                            src={empleo.autor.avatarUrl}
                            alt={empleo.autor.nombre}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          <Typography variant='caption' color='text.secondary'>
                            Publicado por: {empleo.autor.nombre}{' '}
                            {empleo.autor.apellido}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

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
            console.log(`Editando empleo ID: ${selectedEmpleoId}`)
            if (empleo) handleEditClick(empleo)
            else
              console.error(
                `No se encontró el empleo con ID: ${selectedEmpleoId}`
              )
          }}
          sx={{ color: 'primary.main' }}
        >
          <Edit fontSize='small' sx={{ mr: 1 }} />
          Editar oferta
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
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
            // No reseteamos selectedEmpleoId aquí
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
              // No reseteamos selectedEmpleoId aquí
            }}
            color='primary'
            disabled={formLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={20} /> : null}
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
          <Typography variant='h5' gutterBottom>
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

                  // Filtrar ingenios por país seleccionado
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
                  <TextField {...params} label='País' required fullWidth />
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
                  <TextField {...params} label='Área' required fullWidth />
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
          />

          {/* Sección para carga de archivos (ahora disponible tanto en creación como en edición) */}
          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
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
              sx={{ mb: 2 }}
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
                        color='error'
                        onClick={() => handleRemoveFile(index)}
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
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={formLoading}
              startIcon={formLoading ? <CircularProgress size={20} /> : null}
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
