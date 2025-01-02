import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Grid,
} from '@mui/material'

interface User {
  id: string
  nombre: string
  apellido: string
  pais: string
  email: string
  bio?: string
  avatarUrl?: string
}

const Perfil: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [usuario, setUsuario] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/users/usuarios/${id}`
        )
        console.log(response.data)
        setUsuario(response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar el usuario.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsuario()
  }, [id])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          marginTop: '64px', // Ajusta el espacio para el Navbar
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          padding: 3,
          marginTop: '64px', // Ajusta el espacio para el Navbar
        }}
      >
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        maxWidth: '800px',
        margin: 'auto',
        padding: 3,
        marginTop: '64px', // Ajusta el espacio para el Navbar
      }}
    >
      {usuario && (
        <Card sx={{ boxShadow: 3, padding: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                <Avatar
                  src={usuario.avatarUrl || 'https://via.placeholder.com/150'}
                  alt={`${usuario.nombre} ${usuario.apellido}`}
                  sx={{
                    width: 150,
                    height: 150,
                    margin: 'auto',
                    border: '2px solid #ccc',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant='h4' color='primary' gutterBottom>
                  {usuario.nombre} {usuario.apellido}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>País:</strong> {usuario.pais}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Correo:</strong> {usuario.email}
                </Typography>
                {usuario.bio && (
                  <Typography variant='body1' gutterBottom>
                    <strong>Biografía:</strong> {usuario.bio}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Perfil
