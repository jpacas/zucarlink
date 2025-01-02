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
} from '@mui/material'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    pais: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.pais) {
      setMessage({
        type: 'error',
        text: 'Por favor selecciona un país válido.',
      })
      return
    }

    if (!profilePicture) {
      setMessage({ type: 'error', text: 'Por favor sube una foto de perfil.' })
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('nombre', formData.nombre)
      formDataToSend.append('apellido', formData.apellido)
      formDataToSend.append('pais', formData.pais)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('avatar', profilePicture)

      // Simulación de la solicitud al servidor
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMessage({ type: 'success', text: 'Usuario registrado exitosamente.' })
      setFormData({
        nombre: '',
        apellido: '',
        pais: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      setProfilePicture(null)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al registrar el usuario.' })
    } finally {
      setLoading(false)
    }
  }

  const countries = [
    'México',
    'Estados Unidos',
    'España',
    'Colombia',
    'Argentina',
    'Chile',
    'Perú',
  ]

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
          options={countries}
          value={formData.pais}
          onChange={handleCountryChange}
          renderInput={(params) => (
            <TextField {...params} label='País' margin='normal' fullWidth />
          )}
        />
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
        <input type='file' accept='image/*' onChange={handleFileChange} />
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
        <Snackbar
          open={Boolean(message)}
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
  )
}

export default Register
