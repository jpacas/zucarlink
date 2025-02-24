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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{ maxWidth: '800px', margin: 'auto', padding: 4, marginTop: '64px' }}
    >
      {/* Formulario de perfil */}
      <Box
        sx={{ backgroundColor: '#fff', borderRadius: 2, boxShadow: 3, p: 3 }}
      >
        <Typography variant='h4' mb={3} textAlign='center'>
          Editar Perfil
        </Typography>
        <Box
          {...getRootProps()}
          sx={{
            textAlign: 'center',
            padding: 2,
            border: '2px dashed gray',
            borderRadius: 2,
            cursor: 'pointer',
            marginTop: 2,
            marginBottom: 4,
            backgroundColor: '#fafafa',
            transition: 'border .24s ease-in-out',
            maxWidth: '400px',
            margin: '2rem auto',
            '&:hover': {
              border: '2px dashed #1976d2',
              backgroundColor: '#f0f7ff',
            },
          }}
        >
          <input {...getInputProps()} />
          <Typography variant='subtitle1' gutterBottom>
            Foto de Perfil
          </Typography>
          {avatarPreview || formData.avatarUrl ? (
            <Box>
              <Avatar
                src={avatarPreview || formData.avatarUrl}
                sx={{ width: 100, height: 100, margin: 'auto', mb: 2 }}
              />
              <Typography variant='body2' color='textSecondary'>
                Click o arrastra para cambiar la imagen
              </Typography>
            </Box>
          ) : (
            <Box>
              <Avatar sx={{ width: 100, height: 100, margin: 'auto', mb: 2 }} />
              <Typography variant='body1' gutterBottom>
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
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label='Nombre'
            name='nombre'
            value={formData.nombre}
            onChange={handleChange}
            margin='normal'
          />
          <TextField
            fullWidth
            label='Apellido'
            name='apellido'
            value={formData.apellido}
            onChange={handleChange}
            margin='normal'
          />
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
                margin='normal'
                fullWidth
                required
              />
            )}
            isOptionEqualToValue={(option, value) => option === value}
          />

          {formData.proveedor ? (
            <Autocomplete
              options={proveedores}
              value={
                proveedores.find((prov) => prov === formData.proveedor) || null
              }
              onChange={(_, value) =>
                setFormData((prev) => ({ ...prev, proveedor: value || '' }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Empresa'
                  margin='normal'
                  fullWidth
                />
              )}
              isOptionEqualToValue={(option, value) => option === value}
            />
          ) : (
            <>
              <Autocomplete
                options={ingenios.filter(
                  (ingenio) => ingenio.pais === formData.pais
                )}
                value={
                  ingenios.find((ing) => ing.nombre === formData.ingenio) ||
                  null
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
                    margin='normal'
                    fullWidth
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.nombre === (value?.nombre || value)
                }
              />

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
                    margin='normal'
                    fullWidth
                  />
                )}
                isOptionEqualToValue={(option, value) => option === value}
              />
            </>
          )}

          <TextField
            fullWidth
            label='Biografía'
            name='acercaDe'
            value={formData.acercaDe}
            onChange={handleChange}
            margin='normal'
            multiline
            rows={3}
          />

          <Button
            type='submit'
            variant='contained'
            color='primary'
            fullWidth
            sx={{ mt: 3 }}
          >
            Guardar Cambios
          </Button>
        </form>
        {message && (
          <Snackbar
            open
            autoHideDuration={6000}
            onClose={() => setMessage(null)}
          >
            <Alert
              onClose={() => setMessage(null)}
              severity={message.type}
              sx={{ width: '100%' }}
            >
              {message.text}
            </Alert>
          </Snackbar>
        )}
      </Box>

      {/* Formulario de cambio de contraseña */}
      <PasswordChangeForm />
    </Box>
  )
}

export default EditarPerfil
