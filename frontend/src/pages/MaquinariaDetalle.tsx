import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

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
  Autocomplete,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Edit,
  Delete,
  AttachFile,
  Download,
  Engineering,
  PhotoCamera,
  Close,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import axiosInstance from '../utils/axiosConfig'
import { Maquinaria, Pais, Ingenio } from '../types/interfaces'
import { useAuth } from '../context/AuthContext'
import { fetchIngenios, fetchPaises } from '../functions/fetchFunctions'

const MaquinariaDetalle: React.FC = () => {
  const [maquinaria, setMaquinaria] = useState<Maquinaria | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paises, setPaises] = useState<Pais[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [ingeniosFiltrados, setIngeniosFiltrados] = useState<Ingenio[]>([])
  const [formData, setFormData] = useState<{
    nombre: string
    descripcion: string
    precio: string
    contacto: string
    marca: string
    modelo: string
    pais: string
    ingenio: string
  }>({
    nombre: '',
    descripcion: '',
    precio: '',
    contacto: '',
    marca: '',
    modelo: '',
    pais: '',
    ingenio: '',
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filesToDelete, setFilesToDelete] = useState<number[]>([])
  const { maquinariaId } = useParams<{ maquinariaId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Verificar modo edición y cargar datos iniciales
  useEffect(() => {
    if (maquinaria) {
      setFormData({
        nombre: maquinaria.nombre || '',
        descripcion: maquinaria.descripcion || '',
        precio: maquinaria.precio?.toString() || '',
        contacto: maquinaria.contacto || '',
        marca: maquinaria.marca || '',
        modelo: maquinaria.modelo || '',
        pais: maquinaria.pais?.nombre || '',
        ingenio: maquinaria.ingenio?.nombre || '',
      })
      setPreviewUrl(maquinaria.foto || null)
    }
  }, [maquinaria])

  // Manejar el modo de edición
  useEffect(() => {
    const isEditing = searchParams.get('edit') === 'true'
    setEditMode(isEditing)
  }, [searchParams])

  // Cargar datos necesarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paisesRes, ingeniosRes] = await Promise.all([
          fetchPaises(),
          fetchIngenios(),
        ])
        setPaises(paisesRes.paises || [])
        setIngenios(ingeniosRes.ingenios || [])
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (maquinariaId) {
      fetchMaquinaria()
    } else {
      setLoading(false)
    }
  }, [maquinariaId])

  const fetchMaquinaria = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get(`/maquinaria/${maquinariaId}`, {
        params: {
          incrementView: !searchParams.get('edit'), // No incrementar vistas en modo edición
        },
      })

      setMaquinaria(response.data)

      // Eliminamos la inicialización de formData aquí ya que se maneja en el useEffect
      setLoading(false)
    } catch (err) {
      console.error('Error completo:', err)
      setLoading(false)
    }
  }

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

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Evita la recarga de la página
    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value as string)
      })

      // Agregar foto principal si se ha seleccionado una nueva
      if (selectedFile) {
        formDataObj.append('foto', selectedFile)
      }

      // Agregar archivos nuevos
      selectedFiles.forEach((file) => {
        formDataObj.append('archivos', file)
      })

      // Agregar archivos a eliminar
      filesToDelete.forEach((id) => {
        formDataObj.append('archivosToDelete', id.toString())
      })

      formDataObj.append('usuarioId', user?.id || '')

      await axiosInstance.put(`/maquinaria/${maquinariaId}`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

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
      await axiosInstance.delete(`/maquinaria/${maquinariaId}`)
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

  // Efecto para filtrar ingenios cuando cambia el país
  useEffect(() => {
    if (formData.pais) {
      const ingeniosDelPais = ingenios.filter(
        (ingenio) => ingenio.pais.toLowerCase() === formData.pais.toLowerCase()
      )
      setIngeniosFiltrados(ingeniosDelPais)
      // Resetear el ingenio seleccionado si no pertenece al país seleccionado
      if (!ingeniosDelPais.find((i) => i.nombre === formData.ingenio)) {
        setFormData((prev) => ({ ...prev, ingenio: '' }))
      }
    } else {
      setIngeniosFiltrados(ingenios)
    }
  }, [formData.pais, ingenios])

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
                        <Grid item xs={6}>
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
                          onClick={() => {
                            setSearchParams({ edit: 'true' })
                          }}
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
                  {maquinaria.archivos?.map((archivo) => (
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
              onClose={() => {
                setSearchParams({})
                setEditMode(false)
              }}
              maxWidth='md'
              fullWidth
              keepMounted={false}
              disablePortal
              disableEnforceFocus
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
              <form onSubmit={(e) => handleUpdate(e)}>
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
                      <FormControl fullWidth required>
                        <Autocomplete
                          options={paises}
                          value={
                            paises.find((pais) => pais === formData.pais) ||
                            null
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
                            setFormData({
                              ...formData,
                              ingenio: e.target.value,
                            })
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
                          {ingeniosFiltrados.map((ingenio, i) => (
                            <MenuItem key={i} value={ingenio.nombre}>
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
                        {/* Archivos existentes */}
                        {maquinaria.archivos?.map((archivo) => (
                          <ListItem key={archivo.id}>
                            <ListItemIcon>
                              <AttachFile />
                            </ListItemIcon>
                            <ListItemText primary={archivo.nombre} />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge='end'
                                onClick={() => {
                                  setFilesToDelete((prev) => [
                                    ...prev,
                                    archivo.id,
                                  ])
                                }}
                                color='error'
                              >
                                <Close />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}

                        {/* Nuevos archivos */}
                        {selectedFiles.map((file, index) => (
                          <ListItem key={`new-${index}`}>
                            <ListItemIcon>
                              <AttachFile />
                            </ListItemIcon>
                            <ListItemText
                              primary={file.name}
                              secondary={`${(file.size / 1024 / 1024).toFixed(
                                2
                              )} MB`}
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
                      setSearchParams({})
                      setEditMode(false)
                    }}
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
