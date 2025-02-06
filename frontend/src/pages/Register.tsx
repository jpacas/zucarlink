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
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import placeholder from '../assets/images/avatar-generico.jpg'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    pais: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: '', // Nuevo campo para el tipo de usuario
  })
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const navigate = useNavigate()

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
            'México',
            'Estados Unidos',
            'España',
            'Colombia',
            'Argentina',
            'Chile',
            'Perú',
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
            <MenuItem value='empleado'>Empleado de Ingenio</MenuItem>
            <MenuItem value='proveedor'>Proveedor</MenuItem>
          </Select>
        </FormControl>

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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 2,
          }}
        >
          <img
            src={preview || placeholder}
            alt='Vista previa'
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid #ccc',
            }}
          />
        </Box>
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
