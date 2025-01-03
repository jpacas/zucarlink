import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
  Autocomplete,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  nombre: string
  apellido: string
  pais: string
  email: string
  avatarUrl?: string // URL de la foto de perfil
}

const Directorio: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [filtros, setFiltros] = useState({ nombre: '', pais: '' })
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const countries = [
    'México',
    'Estados Unidos',
    'España',
    'Colombia',
    'Argentina',
    'Chile',
    'Perú',
  ]

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/usuarios`
        )
        setUsuarios(response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar los usuarios.')
      }
    }

    fetchUsuarios()
  }, [])

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      (usuario.nombre
        .toLowerCase()
        .includes(filtros.nombre.toLowerCase().trim()) ||
        usuario.apellido
          .toLowerCase()
          .includes(filtros.nombre.toLowerCase().trim())) &&
      (!filtros.pais ||
        usuario.pais.toLowerCase() === filtros.pais.toLowerCase())
  )

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  const handleCountryChange = (_: any, value: string | null) => {
    setFiltros({ ...filtros, pais: value || '' })
  }

  return (
    <Box
      sx={{
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        padding: 3,
        marginTop: '64px', // Ajustar la distancia para evitar solapamiento con el Navbar
      }}
    >
      <Typography
        variant='h3'
        textAlign='center'
        marginBottom={4}
        color='primary'
      >
        Directorio de Usuarios
      </Typography>
      <Grid container spacing={4} direction={{ xs: 'column', md: 'row' }}>
        {/* Sidebar de Filtros */}
        <Grid
          item
          sx={{
            flex: { xs: '1 1 auto', md: '0 0 25%' },
            maxWidth: { xs: '100%', md: '25%' },
          }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              padding: 3,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography variant='h5' marginBottom={2} color='primary'>
              Filtros
            </Typography>
            <TextField
              fullWidth
              label='Nombre o Apellido'
              name='nombre'
              value={filtros.nombre}
              onChange={handleFiltroChange}
              variant='outlined'
              margin='normal'
            />
            <Autocomplete
              options={countries}
              value={filtros.pais}
              onChange={handleCountryChange}
              renderInput={(params) => (
                <TextField {...params} label='País' margin='normal' fullWidth />
              )}
            />
          </Box>
        </Grid>
        {/* Resultados */}
        <Grid item sx={{ flex: { xs: '1 1 auto', md: '1' }, maxWidth: '100%' }}>
          {error && (
            <Typography color='error' textAlign='center'>
              {error}
            </Typography>
          )}
          <Grid container spacing={3}>
            {usuariosFiltrados.map((usuario) => (
              <Grid item xs={12} sm={6} md={4} key={usuario.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                  onClick={() => navigate(`/perfil/${usuario.id}`)}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    {usuario.avatarUrl ? (
                      <img
                        src={usuario.avatarUrl}
                        alt={`${usuario.nombre} ${usuario.apellido}`}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          marginBottom: '1rem',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        Sin foto
                      </Typography>
                    )}
                    <Typography variant='h6'>
                      {usuario.nombre} {usuario.apellido}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>País:</strong> {usuario.pais}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Correo:</strong> {usuario.email}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Directorio
