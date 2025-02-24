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
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material'
import { User, Ingenio, Area } from '../types/interfaces'
import { useNavigate } from 'react-router-dom'

const Directorio: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [filtros, setFiltros] = useState({
    nombre: '',
    pais: '',
    ingenio: '',
    area: '',
    tipoUsuario: {
      ingenio: false,
      proveedor: false,
    },
  })
  const [error, setError] = useState<string | null>(null)
  const [paises, setPaises] = useState<string[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [ingeniosFiltrados, setIngeniosFiltrados] = useState<Ingenio[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosRes, paisesRes, ingeniosRes, areasRes] =
          await Promise.all([
            axios.get<User[]>(`${import.meta.env.VITE_API_URL}/users/usuarios`),
            axios.get<{ nombre: string }[]>(
              `${import.meta.env.VITE_API_URL}/helper/paises`
            ),
            axios.get<Ingenio[]>(
              `${import.meta.env.VITE_API_URL}/helper/ingenios`
            ),
            axios.get<{ nombre: string }[]>(
              `${import.meta.env.VITE_API_URL}/helper/areas`
            ),
          ])

        setUsuarios(usuariosRes.data)
        setPaises(paisesRes.data.map((pais) => pais.nombre))
        setIngenios(ingeniosRes.data)
        setIngeniosFiltrados(ingeniosRes.data)
        setAreas(areasRes.data.map((area) => area.nombre))
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Error al cargar los datos.')
        } else {
          setError('Error desconocido.')
        }
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (filtros.pais) {
      const ingeniosPorPais = ingenios.filter(
        (ingenio) => ingenio.pais.toLowerCase() === filtros.pais.toLowerCase()
      )
      setIngeniosFiltrados(ingeniosPorPais)
      if (!ingeniosPorPais.some((ing) => ing.nombre === filtros.ingenio)) {
        setFiltros((prev) => ({ ...prev, ingenio: '' }))
      }
    } else {
      setIngeniosFiltrados(ingenios)
    }
  }, [filtros.pais, ingenios])

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchNombre =
      usuario.nombre
        .toLowerCase()
        .includes(filtros.nombre.toLowerCase().trim()) ||
      usuario.apellido
        .toLowerCase()
        .includes(filtros.nombre.toLowerCase().trim())

    const matchPais =
      !filtros.pais ||
      usuario.pais?.toLowerCase() === filtros.pais?.toLowerCase()

    const matchIngenio = !filtros.ingenio || usuario.ingenio === filtros.ingenio

    const matchArea = !filtros.area || usuario.area === filtros.area

    const matchTipoUsuario =
      (!filtros.tipoUsuario.ingenio && !filtros.tipoUsuario.proveedor) ||
      (filtros.tipoUsuario.ingenio && filtros.tipoUsuario.proveedor) ||
      (filtros.tipoUsuario.ingenio && !usuario.proveedor) ||
      (filtros.tipoUsuario.proveedor && usuario.proveedor)

    return (
      matchNombre && matchPais && matchIngenio && matchArea && matchTipoUsuario
    )
  })

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  const handleTipoUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({
      ...filtros,
      tipoUsuario: {
        ...filtros.tipoUsuario,
        [e.target.name]: e.target.checked,
      },
    })
  }

  return (
    <Box
      sx={{
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        padding: 3,
        marginTop: '64px',
      }}
    >
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
              position: 'sticky',
              top: '80px', // Mantiene la caja de filtros fija al hacer scroll
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
              options={paises}
              value={filtros.pais || null}
              onChange={(_, value) =>
                setFiltros({ ...filtros, pais: value || '' })
              }
              renderInput={(params) => (
                <TextField {...params} label='País' margin='normal' fullWidth />
              )}
            />
            <Autocomplete
              options={ingeniosFiltrados.map((ing) => ing.nombre)}
              value={filtros.ingenio || null}
              onChange={(_, value) =>
                setFiltros({ ...filtros, ingenio: value || '' })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Ingenio'
                  margin='normal'
                  fullWidth
                  disabled={ingeniosFiltrados.length === 0}
                  helperText={
                    filtros.pais && ingeniosFiltrados.length === 0
                      ? 'No hay ingenios disponibles para el país seleccionado'
                      : ''
                  }
                />
              )}
            />
            <Autocomplete
              options={areas}
              value={filtros.area || null}
              onChange={(_, value) =>
                setFiltros({ ...filtros, area: value || '' })
              }
              renderInput={(params) => (
                <TextField {...params} label='Área' margin='normal' fullWidth />
              )}
            />
            <FormGroup sx={{ mt: 2 }}>
              <Typography variant='subtitle1' gutterBottom fontWeight='bold'>
                Tipo de Usuario
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 0, sm: 2 },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filtros.tipoUsuario.ingenio}
                      onChange={handleTipoUsuarioChange}
                      name='ingenio'
                    />
                  }
                  label='Ingenio'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filtros.tipoUsuario.proveedor}
                      onChange={handleTipoUsuarioChange}
                      name='proveedor'
                    />
                  }
                  label='Proveedor'
                />
              </Box>
            </FormGroup>
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
            {usuariosFiltrados.map((usuario, index) => (
              <Grid item xs={12} sm={6} md={4} key={usuario.id || index}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    willChange: 'transform',
                    '&:hover': { transform: 'translateY(-5px)' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onClick={() => navigate(`/perfil/${usuario.id}`)}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      flexGrow: 1,
                      minHeight: '300px',
                      padding: '24px',
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
                    {usuario.proveedor ? (
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Empresa:</strong> {usuario.proveedor}
                      </Typography>
                    ) : (
                      <>
                        <Typography variant='body2' color='text.secondary'>
                          <strong>Ingenio:</strong> {usuario.ingenio}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          <strong>Área:</strong> {usuario.area}
                        </Typography>
                      </>
                    )}
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
