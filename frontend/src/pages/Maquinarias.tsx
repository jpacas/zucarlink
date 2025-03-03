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
} from '@mui/material'

import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSnackbar } from 'notistack'
import {
  Engineering,
  LocationOn,
  Business,
  CalendarToday,
  FilterAlt,
  MoreVert,
  Edit,
  Delete,
  AttachMoney,
  PhotoCamera,
  AttachFile,
  Download,
  Close,
} from '@mui/icons-material'

import { Maquinaria } from '../types/interfaces'

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
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    precioMin: '',
    precioMax: '',
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
    paisid: '',
  })

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      contacto: '',
      marca: '',
      modelo: '',
      anio: '',
      paisid: '',
    })
    setSelectedFile(null)
    setSelectedFiles([])
    setPreviewUrl(null)
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

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/maquinaria/${selectedMaquinariaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
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
      nombre: maquinaria.nombre,
      descripcion: maquinaria.descripcion,
      precio: maquinaria.precio.toString(),
      contacto: maquinaria.contacto,
      marca: maquinaria.marca,
      modelo: maquinaria.modelo,
      anio: maquinaria.anio.toString(),
      paisid: maquinaria.paisId.toString(),
    })
    setPreviewUrl(maquinaria.foto || null)
    setEditMode(true)
    setModalOpen(true)
    setMenuAnchorEl(null)
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

    return matchBusqueda && matchPrecio
  })

  return (
    <Box sx={{ padding: 3, marginTop: '64px' }}>
      <Grid container spacing={3}>
        {/* Sección de filtros */}
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
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              Publicar Maquinaria
            </Button>
          </Paper>
        </Grid>

        {/* Sección de maquinarias */}
        <Grid item xs={12} md={9} lg={10}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : maquinariasFiltradas.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant='h6'>
                No se encontraron maquinarias con los criterios seleccionados
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {maquinariasFiltradas.map((maquinaria) => (
                <Grid item xs={12} sm={6} md={6} lg={4} key={maquinaria.id}>
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
                    {/* Menú de opciones (solo visible para el propietario) */}
                    {user && maquinaria.usuarioId === user.id && (
                      <>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                          }}
                          onClick={(e) => {
                            setSelectedMaquinariaId(maquinaria.id)
                            setMenuAnchorEl(e.currentTarget)
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                        <Menu
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
                    {maquinaria.foto && (
                      <Box
                        sx={{
                          height: 200,
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={maquinaria.foto}
                          alt={maquinaria.nombre}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant='h6'
                        gutterBottom
                        sx={{ fontWeight: 'bold', mb: 2 }}
                      >
                        {maquinaria.nombre}
                      </Typography>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <AttachMoney color='primary' sx={{ mr: 1 }} />
                        <Typography variant='h6' color='primary'>
                          ${maquinaria.precio.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Business
                          fontSize='small'
                          color='action'
                          sx={{ mr: 1 }}
                        />
                        <Typography variant='body2' color='text.secondary'>
                          {maquinaria.marca} - {maquinaria.modelo}
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
                          {maquinaria.pais?.nombre}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <CalendarToday
                          fontSize='small'
                          color='action'
                          sx={{ mr: 1 }}
                        />
                        <Typography variant='body2' color='text.secondary'>
                          Año: {maquinaria.anio}
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

                      {maquinaria.usuario && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mt: 2 }}
                        >
                          <Avatar
                            src={maquinaria.usuario.avatarUrl}
                            alt={maquinaria.usuario.nombre}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          <Typography variant='caption' color='text.secondary'>
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

      {/* Modal de creación/edición */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          resetForm()
        }}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
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
            >
              Cancelar
            </Button>
            <Button type='submit' variant='contained'>
              {editMode ? 'Guardar Cambios' : 'Publicar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta maquinaria? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color='error' variant='contained'>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Maquinarias
