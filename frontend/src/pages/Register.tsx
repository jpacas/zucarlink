import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
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

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: 'Tipo de archivo no permitido. Solo se aceptan imágenes.',
        })
        return
      }
      setProfilePicture(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { nombre, apellido, pais, email, password, confirmPassword } =
      formData

    // Validación básica
    if (
      !nombre ||
      !apellido ||
      !pais ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setMessage({ type: 'error', text: 'Todos los campos son obligatorios.' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }

    try {
      setLoading(true)

      const formDataToSend = new FormData()
      formDataToSend.append('nombre', nombre)
      formDataToSend.append('apellido', apellido)
      formDataToSend.append('pais', pais)
      formDataToSend.append('email', email)
      formDataToSend.append('password', password)
      if (profilePicture) {
        formDataToSend.append('avatar', profilePicture)
      }

      await axios.post(
        'http://localhost:5001/api/users/register',
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      setMessage({ type: 'success', text: 'Usuario registrado exitosamente.' })

      // Limpiar el formulario
      setFormData({
        nombre: '',
        apellido: '',
        pais: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      setProfilePicture(null)

      // Redirigir después de 2 segundos
      setTimeout(() => navigate('/login'), 2000)
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
        marginTop: '64px', // Ajuste para el Navbar con position: fixed
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
        <TextField
          fullWidth
          label='País'
          name='pais'
          value={formData.pais}
          onChange={handleChange}
          margin='normal'
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
