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
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Container,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSnackbar } from 'notistack'
import {
  Engineering,
  LocationOn,
  Business,
  MoreVert,
  Edit,
  Delete,
  PhotoCamera,
  AttachFile,
  Download,
  Close,
  Email,
} from '@mui/icons-material'
import { fetchPaises, fetchIngenios } from '../functions/fetchFunctions'

import { Maquinaria, Pais, Ingenio } from '../types/interfaces'

const Maquinarias: React.FC = () => {
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentMaquinariaId, setCurrentMaquinariaId] = useState<number | null>(
    null
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMaquinariaId, setSelectedMaquinariaId] = useState<
    number | null
  >(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [paises, setPaises] = useState<Pais[]>([])
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    precioMin: '',
    precioMax: '',
    pais: '',
    ingenio: '',
  })

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    contacto: '',
    marca: '',
    modelo: '',
    anio: '',
    pais: '',
    ingenio: '',
  })

  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [ingeniosFiltrados, setIngeniosFiltrados] = useState<Ingenio[]>([])

  // Efecto para filtrar ingenios cuando cambia el país
  useEffect(() => {
    if (formData.pais) {
      const ingeniosDelPais = ingenios.filter(
        (ingenio) => ingenio.pais.toLowerCase() === formData.pais.toLowerCase()
      )
      setIngeniosFiltrados(ingeniosDelPais)
      // Resetear el ingenio seleccionado si no pertenece al país seleccionado
      if (!ingeniosDelPais.find((i) => String(i.id) === formData.ingenio)) {
        setFormData((prev) => ({ ...prev, ingenio: '' }))
      }
    } else {
      setIngeniosFiltrados(ingenios)
    }
  }, [formData.pais, ingenios])

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      contacto: '',
      marca: '',
      modelo: '',
      anio: '',
      pais: '',
      ingenio: '',
    })
    setSelectedFile(null)
    setSelectedFiles([])
    setPreviewUrl(null)
    setEditMode(false)
    setCurrentMaquinariaId(null)
  }

  const fetchMaquinarias = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/maquinaria`
      )
      setMaquinarias(response.data)
    } catch (error) {
      console.error('Error al cargar maquinarias:', error)
      enqueueSnackbar('Error al cargar las maquinarias', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaquinarias()

    fetchPaises().then(({ paises, error }) => {
      if (!error) setPaises(paises || [])
    })

    fetchIngenios().then(({ ingenios, error }) => {
      if (!error) {
        setIngenios(ingenios || [])
      }
    })
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      setSelectedFiles((prevFiles) => [...prevFiles, ...files])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      // Agregar foto principal
      if (selectedFile) {
        formDataObj.append('foto', selectedFile)
      }

      // Agregar archivos adjuntos
      selectedFiles.forEach((file) => {
        formDataObj.append('archivos', file)
      })

      formDataObj.append('usuarioId', user?.id || '')

      const token = localStorage.getItem('token')
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }

      if (editMode && currentMaquinariaId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/maquinaria/${currentMaquinariaId}`,
          formDataObj,
          config
        )
        enqueueSnackbar('Maquinaria actualizada exitosamente', {
          variant: 'success',
        })
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/maquinaria`,
          formDataObj,
          config
        )
        enqueueSnackbar('Maquinaria publicada exitosamente', {
          variant: 'success',
        })
      }

      setModalOpen(false)
      resetForm()
      fetchMaquinarias()
    } catch (error) {
      console.error('Error al procesar la maquinaria:', error)
      enqueueSnackbar('Error al procesar la maquinaria', { variant: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!selectedMaquinariaId) return
    console.log('UserID: ', user?.id)
    if (!user?.id) {
      enqueueSnackbar('Debes estar autenticado para eliminar una maquinaria', {
        variant: 'error',
      })
      return
    }

    try {
      await axios({
        method: 'DELETE',
        url: `${
          import.meta.env.VITE_API_URL
        }/maquinaria/${selectedMaquinariaId}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({ usuarioId: user.id }),
      })
      enqueueSnackbar('Maquinaria eliminada exitosamente', {
        variant: 'success',
      })
      setDeleteDialogOpen(false)
      fetchMaquinarias()
    } catch (error) {
      console.error('Error al eliminar la maquinaria:', error)
      enqueueSnackbar('Error al eliminar la maquinaria', { variant: 'error' })
    }
  }

  const handleEdit = (maquinaria: Maquinaria) => {
    setCurrentMaquinariaId(maquinaria.id)
    setFormData({
      nombre: maquinaria.nombre || '',
      descripcion: maquinaria.descripcion || '',
      precio: maquinaria.precio?.toString() || '',
      contacto: maquinaria.contacto || '',
      marca: maquinaria.marca || '',
      modelo: maquinaria.modelo || '',
      anio: maquinaria.anio?.toString() || '',
      pais: maquinaria.pais?.nombre || '',
      ingenio: maquinaria.ingenio?.nombre || '',
    })
    setPreviewUrl(maquinaria.foto || null)
    setEditMode(true)
    setModalOpen(true)
    setMenuAnchorEl(null)
  }

  const handleMaquinariaClick = (maquinariaId: number) => {
    navigate(`/maquinarias/${maquinariaId}`)
  }

  // Filtrar maquinarias según los criterios
  const maquinariasFiltradas = maquinarias.filter((maquinaria) => {
    const matchBusqueda =
      filtros.busqueda === '' ||
      maquinaria.nombre
        ?.toLowerCase()
        .includes(filtros.busqueda.toLowerCase()) ||
      maquinaria.descripcion
        ?.toLowerCase()
        .includes(filtros.busqueda.toLowerCase()) ||
      maquinaria.marca
        ?.toLowerCase()
        .includes(filtros.busqueda.toLowerCase()) ||
      maquinaria.modelo?.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const matchPrecio =
      (filtros.precioMin === '' ||
        maquinaria.precio >= parseFloat(filtros.precioMin)) &&
      (filtros.precioMax === '' ||
        maquinaria.precio <= parseFloat(filtros.precioMax))

    const matchPais =
      filtros.pais === '' || maquinaria.pais?.nombre === filtros.pais

    const matchIngenio =
      filtros.ingenio === '' ||
      maquinaria.ingenio?.id.toString() === filtros.ingenio

    return matchBusqueda && matchPrecio && matchPais && matchIngenio
  })

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
          {/* Sección de filtros */}
          <Grid
            item
            sx={{
              flex: { xs: '1 1 auto', md: '0 0 25%' },
              maxWidth: { xs: '100%', md: '25%' },
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
              }}
            >
              <Typography
                variant='h5'
                marginBottom={2}
                sx={{
                  color: '#1a1a1a',
                  fontWeight: 700,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    display: 'block',
                    width: '40px',
                    height: '3px',
                    backgroundColor: '#ff6347',
                    marginTop: '8px',
                    borderRadius: '2px',
                  },
                }}
              >
                Filtros
              </Typography>

              <TextField
                fullWidth
                label='Buscar'
                name='busqueda'
                value={filtros.busqueda}
                onChange={(e) =>
                  setFiltros({ ...filtros, busqueda: e.target.value })
                }
                variant='outlined'
                size='small'
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label='Precio mínimo'
                name='precioMin'
                type='number'
                value={filtros.precioMin}
                onChange={(e) =>
                  setFiltros({ ...filtros, precioMin: e.target.value })
                }
                variant='outlined'
                size='small'
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>$</InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label='Precio máximo'
                name='precioMax'
                type='number'
                value={filtros.precioMax}
                onChange={(e) =>
                  setFiltros({ ...filtros, precioMax: e.target.value })
                }
                variant='outlined'
                size='small'
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>$</InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Autocomplete
                  options={paises}
                  value={paises.find((pais) => pais === filtros.pais) || null}
                  onChange={(_, value) =>
                    setFiltros({ ...filtros, pais: value || '' })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='País'
                      size='small'
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
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Ingenio</InputLabel>
                <Select
                  value={filtros.ingenio}
                  label='Ingenio'
                  onChange={(e) =>
                    setFiltros({ ...filtros, ingenio: e.target.value })
                  }
                  disabled={!filtros.pais}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      '&:hover': {
                        borderColor: '#ff6347',
                      },
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff6347',
                    },
                  }}
                >
                  <MenuItem value=''>Todos los ingenios</MenuItem>
                  {ingeniosFiltrados.map((ingenio) => (
                    <MenuItem key={ingenio.nombre} value={ingenio.nombre}>
                      {ingenio.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider sx={{ my: 3 }} />

              <Button
                variant='contained'
                onClick={() => {
                  setEditMode(false)
                  resetForm()
                  setModalOpen(true)
                }}
                fullWidth
                startIcon={<Engineering />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: 'bold',
                  bgcolor: '#ff6347',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: '#e5533f',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                Publicar Equipos
              </Button>
            </Paper>
          </Grid>

          {/* Sección de maquinarias */}
          <Grid
            item
            sx={{ flex: { xs: '1 1 auto', md: '1' }, maxWidth: '100%' }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress sx={{ color: '#ff6347' }} />
              </Box>
            ) : maquinariasFiltradas.length === 0 ? (
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
                  No se encontraron equipos con los criterios seleccionados
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {maquinariasFiltradas.map((maquinaria) => (
                  <Grid item xs={12} sm={6} md={6} lg={6} key={maquinaria.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        },
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        if (
                          !(e.target as HTMLElement).closest('.menu-options')
                        ) {
                          handleMaquinariaClick(maquinaria.id)
                        }
                      }}
                    >
                      {/* Menú de opciones (solo visible para el propietario) */}
                      {user && maquinaria.usuarioId === user.id && (
                        <>
                          <IconButton
                            className='menu-options'
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 1,
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedMaquinariaId(maquinaria.id)
                              setMenuAnchorEl(e.currentTarget)
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                          <Menu
                            className='menu-options'
                            anchorEl={menuAnchorEl}
                            open={Boolean(menuAnchorEl)}
                            onClose={() => setMenuAnchorEl(null)}
                          >
                            <MenuItem onClick={() => handleEdit(maquinaria)}>
                              <Edit sx={{ mr: 1 }} /> Editar
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setDeleteDialogOpen(true)
                                setMenuAnchorEl(null)
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete sx={{ mr: 1 }} /> Eliminar
                            </MenuItem>
                          </Menu>
                        </>
                      )}

                      {/* Imagen de la maquinaria */}
                      <Box
                        sx={{
                          height: 250,
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: '#f5f5f5',
                        }}
                      >
                        {maquinaria.foto ? (
                          <img
                            src={maquinaria.foto}
                            alt={maquinaria.nombre}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Engineering sx={{ fontSize: 60, color: '#ccc' }} />
                          </Box>
                        )}
                      </Box>

                      <CardContent
                        sx={{ flexGrow: 1, p: 3, position: 'relative' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                            {maquinaria.nombre}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {maquinaria.marca} - {maquinaria.modelo}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                        >
                          <LocationOn
                            fontSize='small'
                            color='action'
                            sx={{ mr: 1 }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            {maquinaria.pais?.nombre || 'País no especificado'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                        >
                          {maquinaria.ingenio?.logo && (
                            <Avatar
                              src={maquinaria.ingenio.logo}
                              alt={maquinaria.ingenio.nombre}
                              sx={{ width: 40, height: 40, mr: 2 }}
                            />
                          )}
                          <Business
                            fontSize='small'
                            color='action'
                            sx={{ mr: 1 }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            {maquinaria.ingenio?.nombre || 'No especificado'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <Email
                            fontSize='small'
                            color='action'
                            sx={{ mr: 1 }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            {maquinaria.contacto}
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
                          {maquinaria.descripcion}
                        </Typography>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          {maquinaria.vigente ? (
                            <Chip
                              label='Disponible'
                              color='success'
                              size='small'
                            />
                          ) : (
                            <Chip
                              label='No disponible'
                              color='error'
                              size='small'
                            />
                          )}
                        </Box>

                        <Typography
                          variant='h6'
                          color='primary'
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                          }}
                        >
                          ${maquinaria.precio.toLocaleString()}
                        </Typography>

                        {maquinaria.usuario && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mt: 2,
                            }}
                          >
                            <Avatar
                              src={maquinaria.usuario.avatarUrl}
                              alt={maquinaria.usuario.nombre}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              Publicado por: {maquinaria.usuario.nombre}{' '}
                              {maquinaria.usuario.apellido}
                            </Typography>
                          </Box>
                        )}

                        {/* Mostrar archivos adjuntos */}
                        {maquinaria.archivos &&
                          maquinaria.archivos.length > 0 && (
                            <>
                              <Divider sx={{ my: 1.5 }} />
                              <Typography variant='subtitle2' gutterBottom>
                                Archivos adjuntos:
                              </Typography>
                              <List dense>
                                {maquinaria.archivos.map((archivo) => (
                                  <ListItem key={archivo.id}>
                                    <ListItemIcon>
                                      <AttachFile />
                                    </ListItemIcon>
                                    <ListItemText primary={archivo.nombre} />
                                    <ListItemSecondaryAction>
                                      <IconButton
                                        edge='end'
                                        href={archivo.url}
                                        target='_blank'
                                        download
                                      >
                                        <Download />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                ))}
                              </List>
                            </>
                          )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Modal de creación/edición */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          resetForm()
        }}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        }}
        keepMounted={false}
        disablePortal
      >
        <DialogTitle
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
          {editMode ? 'Editar Maquinaria' : 'Publicar Nueva Maquinaria'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    border: '2px dashed #ccc',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt='Preview'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <PhotoCamera
                      sx={{ fontSize: 48, color: 'text.secondary' }}
                    />
                  )}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label='Nombre'
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label='Precio'
                  type='number'
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData({ ...formData, precio: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>$</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label='Marca'
                  value={formData.marca}
                  onChange={(e) =>
                    setFormData({ ...formData, marca: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label='Modelo'
                  value={formData.modelo}
                  onChange={(e) =>
                    setFormData({ ...formData, modelo: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label='Año'
                  type='number'
                  value={formData.anio}
                  onChange={(e) =>
                    setFormData({ ...formData, anio: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <Autocomplete
                    options={paises}
                    value={
                      paises.find((pais) => pais === formData.pais) || null
                    }
                    onChange={(_, value) =>
                      setFormData({
                        ...formData,
                        pais: value || '',
                        ingenio: '',
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='País'
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
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Ingenio</InputLabel>
                  <Select
                    value={formData.ingenio}
                    label='Ingenio'
                    onChange={(e) => {
                      setFormData({ ...formData, ingenio: e.target.value })
                    }}
                    disabled={!formData.pais}
                    MenuProps={{
                      PaperProps: {
                        sx: { maxHeight: 300 },
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        '&:hover': {
                          borderColor: '#ff6347',
                        },
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ff6347',
                      },
                    }}
                  >
                    {ingeniosFiltrados.map((ingenio) => (
                      <MenuItem key={ingenio.id} value={ingenio.nombre}>
                        {ingenio.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label='Descripción'
                  multiline
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label='Contacto'
                  value={formData.contacto}
                  onChange={(e) =>
                    setFormData({ ...formData, contacto: e.target.value })
                  }
                  placeholder='Teléfono o email de contacto'
                />
              </Grid>

              {/* Sección de archivos adjuntos */}
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  Archivos adjuntos
                </Typography>
                <Button
                  component='label'
                  variant='outlined'
                  startIcon={<AttachFile />}
                  sx={{ mb: 2 }}
                >
                  Agregar archivos
                  <input
                    type='file'
                    multiple
                    onChange={handleFilesChange}
                    style={{ display: 'none' }}
                    accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
                  />
                </Button>

                <List>
                  {selectedFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <AttachFile />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge='end'
                          onClick={() => removeFile(index)}
                        >
                          <Close />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
              sx={{
                color: '#4a4a4a',
                '&:hover': {
                  backgroundColor: '#ff634710',
                  color: '#ff6347',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='contained'
              sx={{
                bgcolor: '#ff6347',
                '&:hover': {
                  bgcolor: '#e5533f',
                },
              }}
            >
              {editMode ? 'Guardar Cambios' : 'Publicar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle
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
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#4a4a4a' }}>
            ¿Estás seguro de que deseas eliminar esta maquinaria? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: '#4a4a4a',
              '&:hover': {
                backgroundColor: '#ff634710',
                color: '#ff6347',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant='contained'
            sx={{
              bgcolor: '#ff6347',
              '&:hover': {
                bgcolor: '#e5533f',
              },
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Maquinarias
