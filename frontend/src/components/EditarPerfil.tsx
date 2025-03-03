import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Avatar,
  Autocomplete,
  CircularProgress,
  Container,
  Paper,
  Grid,
} from '@mui/material'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  fetchAreas,
  fetchIngenios,
  fetchPaises,
  fetchProveedores,
} from '../functions/fetchFunctions'
import { Ingenio, Area, Proveedor } from '../types/interfaces'
import PasswordChangeForm from './PasswordChangeForm'

const EditarPerfil: React.FC = () => {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  // Primero cargar los datos y luego establecer el formData
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    pais: '',
    ingenio: '',
    acercaDe: '',
    area: '',
    avatarUrl: '',
    password: '',
    confirmPassword: '',
    proveedor: '',
  })

  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [paises, setPaises] = useState<string[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    onDrop: (acceptedFiles) => {
      setAvatar(acceptedFiles[0])
      setAvatarPreview(URL.createObjectURL(acceptedFiles[0]))
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { paises },
          { areas },
          { ingenios },
          { proveedores },
          userResponse,
        ] = await Promise.all([
          fetchPaises(),
          fetchAreas(),
          fetchIngenios(),
          fetchProveedores(),
          axios.get(
            `${import.meta.env.VITE_API_URL}/users/usuarios/${user?.id}`
          ),
        ])

        setPaises(paises || [])
        setAreas(areas || [])
        setIngenios(ingenios || [])
        setProveedores(proveedores || [])

        const userData = userResponse.data
        setFormData({
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          pais: userData.pais || '',
          ingenio: userData.ingenio || '',
          area: userData.area || '',
          acercaDe: userData.acercaDe || '',
          avatarUrl: userData.avatarUrl || '',
          password: '',
          confirmPassword: '',
          proveedor: userData.proveedor || '',
        })

        setIsLoading(false)
      } catch (error) {
        setMessage({ type: 'error', text: 'Error al cargar los datos' })
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'password' || name === 'confirmPassword') {
      setFormData({ ...formData, [name]: value })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const validarFormulario = (): boolean => {
    if (
      !formData.nombre.trim() ||
      !formData.apellido.trim() ||
      !formData.pais.trim()
    ) {
      setMessage({
        type: 'error',
        text: 'Los campos de Nombre, Apellido y País son obligatorios.',
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('nombre', formData.nombre)
      formDataToSend.append('apellido', formData.apellido)
      formDataToSend.append('pais', formData.pais)
      formDataToSend.append('area', formData.area)
      formDataToSend.append('ingenio', formData.ingenio)
      formDataToSend.append('acercaDe', formData.acercaDe)
      if (avatar) {
        formDataToSend.append('avatar', avatar)
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${user?.id}`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      const userActualizado = response.data.usuario
      const userFinal = {
        ...userActualizado,
        avatar: userActualizado.avatarUrl,
      }

      login(userFinal)
      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente.' })

      setTimeout(() => {
        navigate(`/perfil/${userFinal.id}`)
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil.' })
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#ff6347' }} />
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
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#fff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            p: 4,
            mb: 4,
          }}
        >
          <Typography
            variant='h4'
            sx={{
              textAlign: 'center',
              mb: 4,
              color: '#1a1a1a',
              fontWeight: 700,
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
            Editar Perfil
          </Typography>

          <Box
            {...getRootProps()}
            sx={{
              textAlign: 'center',
              padding: 3,
              border: '2px dashed #e0e0e0',
              borderRadius: 3,
              cursor: 'pointer',
              maxWidth: '400px',
              margin: '2rem auto',
              transition: 'all 0.3s ease',
              backgroundColor: '#fafafa',
              '&:hover': {
                borderColor: '#ff6347',
                backgroundColor: '#fff5f3',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <input {...getInputProps()} />
            <Typography
              variant='subtitle1'
              gutterBottom
              color='primary'
              sx={{ fontWeight: 600 }}
            >
              Foto de Perfil
            </Typography>
            {avatarPreview || formData.avatarUrl ? (
              <Box>
                <Avatar
                  src={avatarPreview || formData.avatarUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: 'auto',
                    mb: 2,
                    border: '3px solid #ff6347',
                    boxShadow: '0 4px 15px rgba(255, 99, 71, 0.2)',
                  }}
                />
                <Typography variant='body2' color='textSecondary'>
                  Click o arrastra para cambiar la imagen
                </Typography>
              </Box>
            ) : (
              <Box>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: 'auto',
                    mb: 2,
                    backgroundColor: '#ff634710',
                    color: '#ff6347',
                  }}
                />
                <Typography variant='body1' gutterBottom color='textPrimary'>
                  Arrastra y suelta una imagen aquí
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  o haz click para seleccionar
                </Typography>
                <Typography
                  variant='caption'
                  display='block'
                  color='textSecondary'
                  sx={{ mt: 1 }}
                >
                  Formatos permitidos: JPG, PNG (Máx. 2MB)
                </Typography>
              </Box>
            )}
          </Box>

          <Box component='form' onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Nombre'
                  name='nombre'
                  value={formData.nombre}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
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
                  fullWidth
                  label='Apellido'
                  name='apellido'
                  value={formData.apellido}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
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
                <Autocomplete
                  options={paises}
                  value={paises.find((pais) => pais === formData.pais) || null}
                  onChange={(_, value) =>
                    setFormData((prev) => ({ ...prev, pais: value || '' }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='País'
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                          },
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
                  isOptionEqualToValue={(option, value) => option === value}
                />
              </Grid>

              {formData.proveedor ? (
                <Grid item xs={12}>
                  <Autocomplete
                    options={proveedores}
                    value={
                      proveedores.find(
                        (prov) => prov.nombre === formData.proveedor
                      ) || null
                    }
                    onChange={(_, value) =>
                      setFormData((prev) => ({
                        ...prev,
                        proveedor: value ? value.nombre : '',
                      }))
                    }
                    getOptionLabel={(option) => option.nombre}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Empresa'
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
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
                    isOptionEqualToValue={(option, value) =>
                      option.nombre === value?.nombre
                    }
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={ingenios.filter(
                        (ingenio) => ingenio.pais === formData.pais
                      )}
                      value={
                        ingenios.find(
                          (ing) => ing.nombre === formData.ingenio
                        ) || null
                      }
                      onChange={(_, value) =>
                        setFormData((prev) => ({
                          ...prev,
                          ingenio: value ? value.nombre : '',
                        }))
                      }
                      getOptionLabel={(option) => option.nombre}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Ingenio'
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
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
                      isOptionEqualToValue={(option, value) =>
                        option.nombre === (value?.nombre || value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={areas}
                      value={areas.find((a) => a === formData.area) || null}
                      onChange={(_, value) =>
                        setFormData((prev) => ({ ...prev, area: value || '' }))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Área de Trabajo'
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
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
                      isOptionEqualToValue={(option, value) => option === value}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Biografía'
                  name='acercaDe'
                  value={formData.acercaDe}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
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

            <Button
              type='submit'
              variant='contained'
              fullWidth
              sx={{
                mt: 4,
                mb: 2,
                backgroundColor: '#ff6347',
                color: '#fff',
                textTransform: 'none',
                borderRadius: '50px',
                padding: '12px',
                boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#e5533f',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 99, 71, 0.4)',
                },
              }}
            >
              Guardar Cambios
            </Button>
          </Box>
        </Paper>

        {/* Formulario de cambio de contraseña */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#fff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            p: 4,
          }}
        >
          <PasswordChangeForm />
        </Paper>

        {message && (
          <Snackbar
            open
            autoHideDuration={6000}
            onClose={() => setMessage(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setMessage(null)}
              severity={message.type}
              sx={{
                width: '100%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: 2,
              }}
            >
              {message.text}
            </Alert>
          </Snackbar>
        )}
      </Container>
    </Box>
  )
}

export default EditarPerfil
