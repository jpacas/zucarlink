import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  DialogContentText,
  Container,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Maquinaria, Pais } from '../types/interfaces'
import { useSnackbar } from 'notistack'
import { Edit, Delete } from '@mui/icons-material'
import { AttachFile } from '@mui/icons-material'
import { Download } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { Engineering } from '@mui/icons-material'

const MaquinariaDetalle: React.FC = () => {
  const { maquinariaId } = useParams<{ maquinariaId: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [maquinaria, setMaquinaria] = useState<Maquinaria | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paises, setPaises] = useState<Pais[]>([])
  const [ingenios, setIngenios] = useState<
    { id: number; nombre: string; logo?: string }[]
  >([])
  const [formData, setFormData] = useState<{
    nombre: string
    descripcion: string
    precio: string
    contacto: string
    marca: string
    modelo: string
    anio: string
    pais: string
    ingenioId: string
  }>({
    nombre: '',
    descripcion: '',
    precio: '',
    contacto: '',
    marca: '',
    modelo: '',
    anio: '',
    pais: '',
    ingenioId: '',
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filesToDelete, setFilesToDelete] = useState<number[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Verificar modo edición y cargar datos iniciales
  useEffect(() => {
    const isEditing = searchParams.get('edit') === 'true'
    setEditMode(isEditing)

    if (isEditing && maquinaria) {
      setFormData({
        nombre: maquinaria.nombre || '',
        descripcion: maquinaria.descripcion || '',
        precio: maquinaria.precio.toString() || '',
        contacto: maquinaria.contacto || '',
        marca: maquinaria.marca || '',
        modelo: maquinaria.modelo || '',
        anio: maquinaria.anio.toString() || '',
        pais: maquinaria.pais?.nombre || '',
        ingenioId: maquinaria.ingenio?.id.toString() || '',
      })
    }
  }, [searchParams, maquinaria])

  // Cargar datos necesarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paisesRes, ingeniosRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/helper/paises`),
          axios.get(`${import.meta.env.VITE_API_URL}/ingenios`),
        ])
        setPaises(paisesRes.data)
        setIngenios(ingeniosRes.data)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }

    fetchData()
  }, [])

  // Cargar maquinaria
  const fetchMaquinaria = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/maquinaria/${maquinariaId}`,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            incrementView: !searchParams.get('edit'), // No incrementar vistas en modo edición
          },
        }
      )

      setMaquinaria(response.data)

      // Inicializar datos de edición si estamos en modo edición
      if (searchParams.get('edit') === 'true') {
        setFormData({
          nombre: response.data.nombre || '',
          descripcion: response.data.descripcion || '',
          precio: response.data.precio.toString() || '',
          contacto: response.data.contacto || '',
          marca: response.data.marca || '',
          modelo: response.data.modelo || '',
          anio: response.data.anio.toString() || '',
          pais: response.data.pais?.nombre || '',
          ingenioId: response.data.ingenio?.id.toString() || '',
        })
      }

      setLoading(false)
    } catch (err) {
      console.error('Error completo:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (maquinariaId) {
      fetchMaquinaria()
    } else {
      setLoading(false)
    }
  }, [maquinariaId])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      setSelectedFiles((prevFiles) => [...prevFiles, ...files])
    }
  }

  const handleUpdate = async () => {
    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value as string)
      })

      // Agregar archivos nuevos
      selectedFiles.forEach((file) => {
        formDataObj.append('archivos', file)
      })

      // Agregar archivos a eliminar
      filesToDelete.forEach((id) => {
        formDataObj.append('archivosToDelete', id.toString())
      })

      const token = localStorage.getItem('token')
      await axios.put(
        `${import.meta.env.VITE_API_URL}/maquinaria/${maquinariaId}`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      enqueueSnackbar('Maquinaria actualizada exitosamente', {
        variant: 'success',
      })
      setEditMode(false)
      fetchMaquinaria()
    } catch (error) {
      console.error('Error al actualizar la maquinaria:', error)
      enqueueSnackbar('Error al actualizar la maquinaria', {
        variant: 'error',
      })
    }
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/maquinaria/${maquinariaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      enqueueSnackbar('Maquinaria eliminada exitosamente', {
        variant: 'success',
      })
      navigate('/maquinarias')
    } catch (error) {
      console.error('Error al eliminar la maquinaria:', error)
      enqueueSnackbar('Error al eliminar la maquinaria', {
        variant: 'error',
      })
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 10,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando maquinaria...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ mt: 10, p: 2 }}>
        <Typography color='error' variant='h6'>
          {error}
        </Typography>
        <Button
          variant='contained'
          onClick={() => navigate('/maquinarias')}
          sx={{ mt: 2 }}
        >
          Volver a Maquinarias
        </Button>
      </Box>
    )
  }

  if (!maquinaria) {
    return (
      <Box sx={{ mt: 10, p: 2 }}>
        <Typography>Maquinaria no encontrada</Typography>
        <Button
          variant='contained'
          onClick={() => navigate('/maquinarias')}
          sx={{ mt: 2 }}
        >
          Volver a Maquinarias
        </Button>
      </Box>
    )
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/maquinarias')}
          sx={{
            mb: 3,
            color: '#4a4a4a',
            '&:hover': {
              backgroundColor: 'rgba(255, 99, 71, 0.1)',
              color: '#ff6347',
            },
          }}
        >
          Volver a Maquinarias
        </Button>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#ff6347' }} />
          </Box>
        ) : error ? (
          <Typography color='error' textAlign='center' sx={{ my: 4 }}>
            {error}
          </Typography>
        ) : maquinaria ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant='h3'
              sx={{
                mb: 4,
                fontWeight: 700,
                color: '#1a1a1a',
                letterSpacing: '-0.5px',
                textAlign: 'center',
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '60px',
                  height: '4px',
                  backgroundColor: '#ff6347',
                  margin: '16px auto',
                  borderRadius: '2px',
                },
              }}
            >
              {maquinaria.nombre}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
                justifyContent: 'center',
              }}
            >
              {maquinaria.ingenio?.logo && (
                <Avatar
                  src={maquinaria.ingenio.logo}
                  alt={maquinaria.ingenio.nombre}
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
              )}
              <Box>
                <Typography variant='subtitle1' color='text.secondary'>
                  Ingenio
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                  {maquinaria.ingenio?.nombre || 'No especificado'}
                </Typography>
              </Box>
            </Box>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        width: '100%',
                        height: 400,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
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
                          <Engineering sx={{ fontSize: 80, color: '#ccc' }} />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant='h5'
                        sx={{
                          color: '#1a1a1a',
                          fontWeight: 700,
                          mb: 2,
                        }}
                      >
                        Detalles
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            variant='subtitle2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                          >
                            Precio
                          </Typography>
                          <Typography variant='h6' color='primary'>
                            ${maquinaria.precio.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant='subtitle2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                          >
                            Año
                          </Typography>
                          <Typography variant='h6'>
                            {maquinaria.anio}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant='subtitle2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                          >
                            Marca
                          </Typography>
                          <Typography variant='h6'>
                            {maquinaria.marca}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant='subtitle2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                          >
                            Modelo
                          </Typography>
                          <Typography variant='h6'>
                            {maquinaria.modelo}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            variant='subtitle2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                          >
                            País
                          </Typography>
                          <Typography variant='h6'>
                            {maquinaria.pais?.nombre || 'No especificado'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            variant='subtitle2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                          >
                            Ingenio
                          </Typography>
                          <Typography variant='h6'>
                            {maquinaria.ingenio?.nombre || 'No especificado'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant='h5'
                        sx={{
                          color: '#1a1a1a',
                          fontWeight: 700,
                          mb: 2,
                        }}
                      >
                        Descripción
                      </Typography>
                      <Typography
                        variant='body1'
                        sx={{
                          color: '#4a4a4a',
                          lineHeight: 1.7,
                        }}
                      >
                        {maquinaria.descripcion}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant='h5'
                        sx={{
                          color: '#1a1a1a',
                          fontWeight: 700,
                          mb: 2,
                        }}
                      >
                        Contacto
                      </Typography>
                      <Typography
                        variant='body1'
                        sx={{
                          color: '#4a4a4a',
                          lineHeight: 1.7,
                        }}
                      >
                        {maquinaria.contacto}
                      </Typography>
                    </Box>

                    {user && maquinaria.usuarioId === user.id && (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          mt: 3,
                        }}
                      >
                        <Button
                          variant='contained'
                          startIcon={<Edit />}
                          onClick={() => setEditMode(true)}
                          sx={{
                            bgcolor: '#ff6347',
                            '&:hover': {
                              bgcolor: '#e5533f',
                            },
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant='outlined'
                          color='error'
                          startIcon={<Delete />}
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {maquinaria.archivos && maquinaria.archivos.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant='h5'
                  sx={{
                    color: '#1a1a1a',
                    fontWeight: 700,
                    mb: 3,
                  }}
                >
                  Archivos Adjuntos
                </Typography>
                <Grid container spacing={2}>
                  {maquinaria.archivos.map((archivo) => (
                    <Grid item xs={12} sm={6} md={4} key={archivo.id}>
                      <Card
                        sx={{
                          borderRadius: '16px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <AttachFile
                              sx={{
                                fontSize: 40,
                                color: '#ff6347',
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant='subtitle1'
                                sx={{
                                  fontWeight: 600,
                                  color: '#1a1a1a',
                                }}
                              >
                                {archivo.nombre}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {new Date(
                                  archivo.createdAt
                                ).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <IconButton
                              href={archivo.url}
                              target='_blank'
                              download
                              sx={{
                                color: '#ff6347',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 99, 71, 0.1)',
                                },
                              }}
                            >
                              <Download />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Diálogo de confirmación para eliminar */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
              PaperProps={{
                sx: {
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
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
                  ¿Estás seguro de que deseas eliminar esta maquinaria? Esta
                  acción no se puede deshacer.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setDeleteDialogOpen(false)}
                  sx={{
                    color: '#4a4a4a',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 99, 71, 0.1)',
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

            {/* Diálogo de edición */}
            <Dialog
              open={editMode}
              onClose={() => setEditMode(false)}
              maxWidth='md'
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
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
                Editar Maquinaria
              </DialogTitle>
              <form onSubmit={handleUpdate}>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label='Nombre'
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
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
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>País</InputLabel>
                        <Select
                          value={formData.pais}
                          label='País'
                          onChange={(e) =>
                            setFormData({ ...formData, pais: e.target.value })
                          }
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
                          {paises.map((pais) => (
                            <MenuItem key={pais} value={pais}>
                              {pais}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Ingenio</InputLabel>
                        <Select
                          value={formData.ingenioId}
                          label='Ingenio'
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ingenioId: e.target.value,
                            })
                          }
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
                          {ingenios.map((ingenio) => (
                            <MenuItem
                              key={ingenio.id}
                              value={ingenio.id.toString()}
                            >
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
                          setFormData({
                            ...formData,
                            descripcion: e.target.value,
                          })
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
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setEditMode(false)}
                    sx={{
                      color: '#4a4a4a',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 99, 71, 0.1)',
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
                    Guardar cambios
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
          </Paper>
        ) : null}
      </Container>
    </Box>
  )
}

export default MaquinariaDetalle
