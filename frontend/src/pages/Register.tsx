import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Avatar,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import placeholder from '../assets/images/avatar-generico.jpg'

const Register: React.FC = () => {
  const [formData, setFormData] = useState<{
    nombre: string
    apellido: string
    pais: string
    email: string
    password: string
    confirmPassword: string
    tipoUsuario: string
    area: string | null // Permitir null o string
  }>({
    nombre: '',
    apellido: '',
    pais: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: '',
    area: null, // Iniciar con null
  })
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const navigate = useNavigate()

  const areasTrabajo = [
    'Campo',
    'Molinos',
    'Fabrica',
    'Calderas',
    'Energia',
    'Alcohol',
    'Laboratorio',
    'Instrumentacion',
    'Mantenimiento',
    'Seguridad',
    'Medio Ambiente',
    'Recursos Humanos',
    'Otros',
  ]

  // Manejar cambios en los TextField
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Manejar cambios en el Select
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setFormData({ ...formData, tipoUsuario: event.target.value })
  }

  const handleCountryChange = (_: any, value: string | null) => {
    setFormData({ ...formData, pais: value || '' })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG/PNG).',
        })
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        // Máximo 2 MB
        setMessage({
          type: 'error',
          text: 'El archivo es demasiado grande. Máximo 2 MB.',
        })
        return
      }
      setProfilePicture(file)
      setPreview(URL.createObjectURL(file)) // Generar vista previa
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.pais || !formData.tipoUsuario) {
      setMessage({
        type: 'error',
        text: 'Por favor completa todos los campos obligatorios.',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach((key) =>
        formDataToSend.append(key, (formData as any)[key])
      )
      if (profilePicture) {
        formDataToSend.append('avatar', profilePicture)
      }

      console.log('formDataToSend', formData)

      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/register`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      setMessage({ type: 'success', text: 'Usuario registrado exitosamente.' })
      setTimeout(() => navigate('/login'), 3000)

      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        pais: '',
        email: '',
        password: '',
        confirmPassword: '',
        tipoUsuario: '',
        area: null, // Nuevo campo para área de trabajo
      })
      setProfilePicture(null)
      setPreview(null)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al registrar el usuario.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAreaChange = (event: SelectChangeEvent<string>) => {
    setFormData({ ...formData, area: event.target.value })
  }

  return (
    <Box
      sx={{
        maxWidth: '600px',
        margin: 'auto',
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 3,
        marginTop: '64px',
      }}
    >
      <Typography variant='h4' mb={3} textAlign='center'>
        Crear una Cuenta
      </Typography>
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
          options={[
            'El Salvador',
            'Guatemala',
            'Nicaragua',
            'Honduras',
            'Costa Rica',
            'Panama',
            'Belice',
          ]}
          value={formData.pais}
          onChange={handleCountryChange}
          renderInput={(params) => (
            <TextField {...params} label='País' margin='normal' fullWidth />
          )}
        />
        <FormControl fullWidth margin='normal'>
          <InputLabel>Tipo de Usuario</InputLabel>
          <Select
            name='tipoUsuario'
            value={formData.tipoUsuario}
            onChange={handleSelectChange}
          >
            <MenuItem value='Ingenio'>Empleado de Ingenio</MenuItem>
            <MenuItem value='Proveedor'>Proveedor</MenuItem>
          </Select>
        </FormControl>

        {formData.tipoUsuario === 'Ingenio' && (
          <FormControl fullWidth margin='normal'>
            <InputLabel>Área de Trabajo</InputLabel>
            <Select
              name='area'
              value={formData.area || ''}
              onChange={handleAreaChange}
            >
              {areasTrabajo.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          fullWidth
          label='Correo Electrónico'
          name='email'
          type='email'
          value={formData.email}
          onChange={handleChange}
          margin='normal'
        />
        <TextField
          fullWidth
          label='Contraseña'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleChange}
          margin='normal'
        />
        <TextField
          fullWidth
          label='Confirmar Contraseña'
          name='confirmPassword'
          type='password'
          value={formData.confirmPassword}
          onChange={handleChange}
          margin='normal'
        />

        <Typography variant='body1' mt={2} mb={1}>
          Subir Foto de Perfil
        </Typography>
        <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
          <Avatar
            src={preview || placeholder}
            alt='Foto de perfil'
            sx={{ width: 100, height: 100, margin: 'auto' }}
          />
          <Typography variant='body1' sx={{ marginTop: 1 }}>
            Selecciona una nueva foto de perfil:
          </Typography>

          {/* Input de archivo oculto */}
          <input
            type='file'
            accept='image/*'
            id='file-upload'
            onChange={handleFileChange}
            style={{ display: 'none' }} // Oculta el input original
          />

          {/* Botón estilizado para seleccionar archivo */}
          <label htmlFor='file-upload'>
            <Button variant='contained' component='span'>
              Seleccionar archivo
            </Button>
          </label>

          {/* Mostrar el nombre del archivo seleccionado */}
          {profilePicture && (
            <Typography
              variant='body2'
              sx={{ marginTop: 1, fontStyle: 'italic' }}
            >
              Archivo seleccionado: {profilePicture.name}
            </Typography>
          )}
        </Box>

        <Button
          type='submit'
          variant='contained'
          color='primary'
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Registrarse'}
        </Button>
      </form>

      {message && (
        <Snackbar open autoHideDuration={6000} onClose={() => setMessage(null)}>
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
  )
}

export default Register
