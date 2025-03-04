import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BusinessIcon from '@mui/icons-material/Business'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CategoryIcon from '@mui/icons-material/Category'
import { useAuth } from '../context/AuthContext'
import { Empleo, Area, Ingenio } from '../types/interfaces'
import { useSnackbar } from 'notistack'

const EmpleoDetalle: React.FC = () => {
  const { empleoId } = useParams<{ empleoId: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [empleo, setEmpleo] = useState<Empleo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [areas, setAreas] = useState<Area[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [paises, setPaises] = useState<string[]>([])
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    pais: '',
    ingenio: '',
    area: '',
    contacto: '',
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filesToDelete, setFilesToDelete] = useState<number[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Verificar modo edición y cargar datos iniciales
  useEffect(() => {
    const isEditing = searchParams.get('edit') === 'true'
    setEditMode(isEditing)

    if (isEditing && empleo) {
      setFormData({
        nombre: empleo.nombre || '',
        descripcion: empleo.descripcion || '',
        pais: empleo.pais?.nombre || '',
        ingenio: empleo.ingenio?.nombre || '',
        area: empleo.area?.nombre || '',
        contacto: empleo.contacto || '',
      })
    }
  }, [searchParams, empleo])

  // Cargar datos necesarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, ingeniosRes, paisesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/helper/areas`),
          axios.get(`${import.meta.env.VITE_API_URL}/helper/ingenios`),
          axios.get(`${import.meta.env.VITE_API_URL}/helper/paises`),
        ])

        setAreas(areasRes.data)
        setIngenios(ingeniosRes.data)
        setPaises(paisesRes.data)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }

    fetchData()
  }, [])

  // Cargar empleo
  const fetchEmpleo = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/empleos/${empleoId}`,
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

      setEmpleo(response.data)

      // Inicializar datos de edición si estamos en modo edición
      if (searchParams.get('edit') === 'true') {
        setFormData({
          nombre: response.data.nombre || '',
          descripcion: response.data.descripcion || '',
          pais: response.data.pais?.nombre || '',
          ingenio: response.data.ingenio?.nombre || '',
          area: response.data.area?.nombre || '',
          contacto: response.data.contacto || '',
        })
      }

      setLoading(false)
    } catch (err) {
      console.error('Error completo:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (empleoId) {
      fetchEmpleo()
    } else {
      setLoading(false)
    }
  }, [empleoId])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
    }
  }

  const handleFileDelete = (fileId: number) => {
    setFilesToDelete((prev) => [...prev, fileId])
  }

  const handleRemoveFileFromDelete = (fileId: number) => {
    setFilesToDelete((prev) => prev.filter((id) => id !== fileId))
  }

  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdate = async () => {
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('nombre', formData.nombre)
      formDataToSend.append('descripcion', formData.descripcion)
      formDataToSend.append('pais', formData.pais)
      formDataToSend.append('ingenio', formData.ingenio)
      formDataToSend.append('area', formData.area)
      formDataToSend.append('contacto', formData.contacto)
      formDataToSend.append('usuarioId', user?.id?.toString() || '')

      // Asegurarse de que filesToDelete sea un array válido
      const filesToDeleteArray = Array.from(new Set(filesToDelete))
      formDataToSend.append('filesToDelete', JSON.stringify(filesToDeleteArray))

      selectedFiles.forEach((file) => {
        formDataToSend.append('archivos', file)
      })

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/empleos/${empleoId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setEmpleo(response.data)
      setEditMode(false)
      enqueueSnackbar('Oferta de empleo actualizada con éxito', {
        variant: 'success',
      })
      setFilesToDelete([])
      setSelectedFiles([])
      navigate(`/empleos/${empleoId}`)
    } catch (error) {
      console.error('Error al actualizar el empleo:', error)
      enqueueSnackbar('Error al actualizar la oferta de empleo', {
        variant: 'error',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/empleos/${empleoId}`)
      enqueueSnackbar('Oferta de empleo eliminada con éxito', {
        variant: 'success',
      })
      navigate('/empleos')
    } catch (error) {
      console.error('Error al eliminar el empleo:', error)
      enqueueSnackbar('Error al eliminar la oferta de empleo', {
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
        <Typography sx={{ mt: 2 }}>Cargando oferta de empleo...</Typography>
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
          onClick={() => navigate('/empleos')}
          sx={{ mt: 2 }}
        >
          Volver a Empleos
        </Button>
      </Box>
    )
  }

  if (!empleo) {
    return (
      <Box sx={{ mt: 10, p: 2 }}>
        <Typography>Oferta de empleo no encontrada</Typography>
        <Button
          variant='contained'
          onClick={() => navigate('/empleos')}
          sx={{ mt: 2 }}
        >
          Volver a Empleos
        </Button>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        minHeight: '100vh',
        padding: 3,
        marginTop: '64px',
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/empleos')}
        sx={{
          mb: 2,
          color: '#4a4a4a',
          '&:hover': {
            backgroundColor: 'rgba(255, 99, 71, 0.1)',
            color: '#ff6347',
          },
        }}
      >
        Volver a Empleos
      </Button>

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
          {editMode ? (
            <Box
              component='form'
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdate()
              }}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                fullWidth
                label='Título de la oferta'
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

              <TextField
                fullWidth
                multiline
                rows={4}
                label='Descripción'
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
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

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={paises}
                    value={formData.pais || null}
                    onChange={(_, value) => {
                      setFormData({ ...formData, pais: value || '' })
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
                    options={ingenios
                      .filter((ing) => ing.pais === formData.pais)
                      .map((ing) => ing.nombre)}
                    value={formData.ingenio || null}
                    onChange={(_, value) => {
                      setFormData({ ...formData, ingenio: value || '' })
                    }}
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
                            : ingenios.filter(
                                (ing) => ing.pais === formData.pais
                              ).length === 0
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
                    onChange={(_, value) => {
                      setFormData({ ...formData, area: value || '' })
                    }}
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
                value={formData.contacto}
                onChange={(e) =>
                  setFormData({ ...formData, contacto: e.target.value })
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
                  Documentos adjuntos
                </Typography>

                {/* Mostrar archivos existentes */}
                {empleo.archivos && empleo.archivos.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      Archivos existentes:
                    </Typography>
                    <Box sx={{ maxHeight: '150px', overflow: 'auto' }}>
                      {empleo.archivos.map((archivo) => (
                        <Box
                          key={archivo.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            borderBottom: '1px solid #eee',
                            bgcolor: filesToDelete.includes(archivo.id)
                              ? 'rgba(255, 99, 71, 0.1)'
                              : 'transparent',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {archivo.tipo.includes('pdf') ? (
                              <PictureAsPdfIcon sx={{ color: '#ff6347' }} />
                            ) : archivo.tipo.includes('word') ? (
                              <DescriptionIcon sx={{ color: '#ff6347' }} />
                            ) : (
                              <DescriptionIcon />
                            )}
                            <Typography
                              variant='body2'
                              noWrap
                              sx={{ maxWidth: '80%' }}
                            >
                              {archivo.nombre}
                            </Typography>
                          </Box>
                          <Button
                            size='small'
                            onClick={() => {
                              if (filesToDelete.includes(archivo.id)) {
                                handleRemoveFileFromDelete(archivo.id)
                              } else {
                                handleFileDelete(archivo.id)
                              }
                            }}
                            sx={{
                              color: filesToDelete.includes(archivo.id)
                                ? '#ff6347'
                                : 'text.secondary',
                              '&:hover': {
                                backgroundColor: '#ff634710',
                              },
                            }}
                          >
                            {filesToDelete.includes(archivo.id)
                              ? 'Restaurar'
                              : 'Eliminar'}
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

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
                  startIcon={<BusinessIcon />}
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
                  Agregar nuevos archivos
                </Button>

                {selectedFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      Nuevos archivos seleccionados:
                    </Typography>
                    <Box sx={{ maxHeight: '150px', overflow: 'auto' }}>
                      {selectedFiles.map((file, index) => (
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
                            onClick={() => handleRemoveNewFile(index)}
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
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setEditMode(false)
                    navigate(`/empleos/${empleoId}`)
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
                  variant='contained'
                  type='submit'
                  sx={{
                    backgroundColor: '#ff6347',
                    '&:hover': {
                      backgroundColor: '#e5533f',
                    },
                  }}
                >
                  Guardar cambios
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Card
                sx={{
                  mb: 2,
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant='h4'
                      sx={{
                        color: '#1a1a1a',
                        fontWeight: 700,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          display: 'block',
                          width: '60px',
                          height: '4px',
                          backgroundColor: '#ff6347',
                          mt: 1,
                          borderRadius: '2px',
                        },
                      }}
                    >
                      {empleo.nombre}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Typography sx={{ color: '#4a4a4a' }}>
                        {empleo.autor?.nombre} {empleo.autor?.apellido}
                      </Typography>
                      <Avatar
                        src={empleo.autor?.avatarUrl || ''}
                        alt={`${empleo.autor?.nombre} ${empleo.autor?.apellido}`}
                        onClick={() => navigate(`/perfil/${empleo.usuarioId}`)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <BusinessIcon sx={{ color: '#ff6347' }} />
                      <Typography variant='subtitle1'>
                        {empleo.ingenio?.nombre}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <LocationOnIcon sx={{ color: '#4a4a4a' }} />
                      <Typography variant='subtitle1'>
                        {empleo.pais?.nombre}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CategoryIcon sx={{ color: '#4a4a4a' }} />
                      <Typography variant='subtitle1'>
                        {empleo.area?.nombre}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant='body1'
                    sx={{
                      mb: 3,
                      color: '#4a4a4a',
                      lineHeight: 1.7,
                    }}
                  >
                    {empleo.descripcion}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{
                          color: '#4a4a4a',
                        }}
                      >
                        {formatDistanceToNow(new Date(empleo.createdAt), {
                          locale: es,
                          addSuffix: true,
                        })}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Typography sx={{ color: '#4a4a4a' }}>
                        {empleo.views} vistas
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Card de Archivos Adjuntos */}
              {empleo.archivos && empleo.archivos.length > 0 && (
                <Card
                  sx={{
                    mb: 2,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant='subtitle1'
                      sx={{
                        mb: 2,
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
                      Archivos adjuntos ({empleo.archivos.length})
                    </Typography>
                    <Grid container spacing={1}>
                      {empleo.archivos.map((archivo) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          key={`archivo-${archivo.id}`}
                        >
                          <Card
                            variant='outlined'
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                bgcolor: 'rgba(255, 99, 71, 0.1)',
                              },
                            }}
                            onClick={() => window.open(archivo.url, '_blank')}
                          >
                            {archivo.tipo.includes('pdf') ? (
                              <PictureAsPdfIcon
                                sx={{ fontSize: 24, color: '#ff6347' }}
                              />
                            ) : archivo.tipo.includes('word') ? (
                              <DescriptionIcon
                                sx={{ fontSize: 24, color: '#ff6347' }}
                              />
                            ) : (
                              <DescriptionIcon
                                sx={{ fontSize: 24, color: '#4a4a4a' }}
                              />
                            )}
                            <Typography
                              variant='body2'
                              sx={{
                                ml: 1,
                                color: '#4a4a4a',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {archivo.nombre}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  mt: 2,
                }}
              >
                {user?.id === empleo.usuarioId && (
                  <>
                    <Button
                      variant='contained'
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setFormData({
                          nombre: empleo.nombre || '',
                          descripcion: empleo.descripcion || '',
                          pais: empleo.pais?.nombre || '',
                          ingenio: empleo.ingenio?.nombre || '',
                          area: empleo.area?.nombre || '',
                          contacto: empleo.contacto || '',
                        })
                        setEditMode(true)
                      }}
                      sx={{
                        backgroundColor: '#ff6347',
                        '&:hover': {
                          backgroundColor: '#e5533f',
                        },
                      }}
                    >
                      Editar oferta
                    </Button>
                    <Button
                      variant='contained'
                      color='error'
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Eliminar oferta
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta oferta de empleo? Esta
            acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='primary'>
            Cancelar
          </Button>
          <Button onClick={handleDelete} variant='contained' color='error'>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EmpleoDetalle
