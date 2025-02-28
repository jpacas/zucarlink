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
import { User, Ingenio, Area, Proveedor } from '../types/interfaces'
import { useNavigate, useParams } from 'react-router-dom'
import LanguageIcon from '@mui/icons-material/Language'
import EmailIcon from '@mui/icons-material/Email'

interface DirectorioProps {}

const Directorio: React.FC<DirectorioProps> = () => {
  const { tipo } = useParams<{ tipo: string }>()
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
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
  const [ingeniosList, setIngeniosList] = useState<Ingenio[]>([])
  const [proveedoresList, setProveedoresList] = useState<Proveedor[]>([])
  const [ingeniosFiltrados, setIngeniosFiltrados] = useState<Ingenio[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paisesRes, areasRes] = await Promise.all([
          axios.get<{ nombre: string }[]>(
            `${import.meta.env.VITE_API_URL}/helper/paises`
          ),
          axios.get<{ nombre: string }[]>(
            `${import.meta.env.VITE_API_URL}/helper/areas`
          ),
        ])

        setPaises(paisesRes.data.map((pais) => pais.nombre))
        setAreas(areasRes.data.map((area) => area.nombre))

        if (tipo === 'usuarios') {
          const usuariosRes = await axios.get<User[]>(
            `${import.meta.env.VITE_API_URL}/users/usuarios`
          )
          setUsuarios(usuariosRes.data)
        } else if (tipo === 'ingenios') {
          const ingeniosRes = await axios.get<Ingenio[]>(
            `${import.meta.env.VITE_API_URL}/helper/ingenios`
          )
          setIngenios(ingeniosRes.data)
          setIngeniosList(ingeniosRes.data)
        } else if (tipo === 'proveedores') {
          const proveedoresRes = await axios.get<Proveedor[]>(
            `${import.meta.env.VITE_API_URL}/helper/proveedores`
          )
          setProveedores(proveedoresRes.data)
          setProveedoresList(proveedoresRes.data)
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Error al cargar los datos.')
        } else {
          setError('Error desconocido.')
        }
      }
    }

    fetchData()
  }, [tipo])

  useEffect(() => {
    if (filtros.pais && tipo === 'ingenios') {
      const ingeniosPorPais = ingeniosList.filter(
        (ingenio) => ingenio.pais.toLowerCase() === filtros.pais.toLowerCase()
      )
      setIngeniosFiltrados(ingeniosPorPais)
    } else {
      setIngeniosFiltrados(ingeniosList)
    }
  }, [filtros.pais, ingeniosList, tipo])

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

  const filtrarElementos = () => {
    if (tipo === 'usuarios') {
      return usuarios.filter((usuario) => {
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

        const matchIngenio =
          !filtros.ingenio || usuario.ingenio === filtros.ingenio

        const matchArea = !filtros.area || usuario.area === filtros.area

        const matchTipoUsuario =
          (!filtros.tipoUsuario.ingenio && !filtros.tipoUsuario.proveedor) ||
          (filtros.tipoUsuario.ingenio && filtros.tipoUsuario.proveedor) ||
          (filtros.tipoUsuario.ingenio && !usuario.proveedor) ||
          (filtros.tipoUsuario.proveedor && usuario.proveedor)

        return (
          matchNombre &&
          matchPais &&
          matchIngenio &&
          matchArea &&
          matchTipoUsuario
        )
      })
    } else if (tipo === 'ingenios') {
      return ingenios.filter((ingenio) => {
        const matchNombre = ingenio.nombre
          .toLowerCase()
          .includes(filtros.nombre.toLowerCase().trim())
        const matchPais =
          !filtros.pais ||
          ingenio.pais.toLowerCase() === filtros.pais.toLowerCase()
        return matchNombre && matchPais
      })
    } else if (tipo === 'proveedores') {
      return proveedores.filter((proveedor) =>
        proveedor.nombre
          .toLowerCase()
          .includes(filtros.nombre.toLowerCase().trim())
      )
    }
    return []
  }

  const renderFiltros = () => {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          position: 'sticky',
          top: '80px',
        }}
      >
        <Typography variant='h5' marginBottom={2} color='primary'>
          Filtros
        </Typography>
        <TextField
          fullWidth
          label={tipo === 'usuarios' ? 'Nombre o Apellido' : 'Nombre'}
          name='nombre'
          value={filtros.nombre}
          onChange={handleFiltroChange}
          variant='outlined'
          margin='normal'
        />
        {(tipo === 'usuarios' || tipo === 'ingenios') && (
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
        )}
        {tipo === 'usuarios' && (
          <>
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
          </>
        )}
      </Box>
    )
  }

  const renderCard = (item: User | Ingenio | Proveedor) => {
    if (tipo === 'usuarios') {
      const usuario = item as User
      return (
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
      )
    } else if (tipo === 'ingenios') {
      const ingenio = item as Ingenio
      return (
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              p: 3,
            }}
          >
            <Typography variant='h6' gutterBottom>
              {ingenio.nombre}
            </Typography>
            <Typography variant='body1' color='text.secondary' gutterBottom>
              <strong>País:</strong> {ingenio.pais}
            </Typography>
            {ingenio.webpage && (
              <Box
                sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <LanguageIcon color='primary' />
                <Typography
                  variant='body2'
                  component='a'
                  href={ingenio.webpage}
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  Sitio web
                </Typography>
              </Box>
            )}
            {ingenio.correo && (
              <Box
                sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <EmailIcon color='primary' />
                <Typography
                  variant='body2'
                  component='a'
                  href={`mailto:${ingenio.correo}`}
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  Contacto
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )
    } else if (tipo === 'proveedores') {
      const proveedor = item as Proveedor
      return (
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              p: 3,
            }}
          >
            {proveedor.logo ? (
              <img
                src={proveedor.logo}
                alt={proveedor.nombre}
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain',
                  marginBottom: '1rem',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Typography variant='body2' color='text.secondary'>
                  Sin logo
                </Typography>
              </Box>
            )}
            <Typography variant='h6' gutterBottom>
              {proveedor.nombre}
            </Typography>
            {proveedor.descripcion && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {proveedor.descripcion}
              </Typography>
            )}
            {proveedor.webpage && (
              <Box
                sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <LanguageIcon color='primary' />
                <Typography
                  variant='body2'
                  component='a'
                  href={proveedor.webpage}
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  Sitio web
                </Typography>
              </Box>
            )}
            {proveedor.email && (
              <Box
                sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <EmailIcon color='primary' />
                <Typography
                  variant='body2'
                  component='a'
                  href={`mailto:${proveedor.email}`}
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  Contacto
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )
    }
  }

  const elementosFiltrados = filtrarElementos()

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
          {renderFiltros()}
        </Grid>
        {/* Resultados */}
        <Grid item sx={{ flex: { xs: '1 1 auto', md: '1' }, maxWidth: '100%' }}>
          {error && (
            <Typography color='error' textAlign='center'>
              {error}
            </Typography>
          )}
          <Grid container spacing={3}>
            {elementosFiltrados.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                {renderCard(item)}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Directorio
