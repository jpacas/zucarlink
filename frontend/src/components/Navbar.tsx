import React from 'react'
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Avatar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/images/ZL-Horizontal-sinfondo02.png'

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const { isAuthenticated, user, logout } = useAuth() // Asegúrate de que 'user' contiene los datos del usuario
  const navigate = useNavigate()
  const location = useLocation()

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open)
  }

  const getInitials = (name: string): string => {
    const initials = name
      .split(' ')
      .map((word) => word[0])
      .join('')
    return initials.toUpperCase()
  }

  const isActive = (path: string) => location.pathname === path // Verifica si la ruta coincide con la URL actual

  return (
    <AppBar
      position='fixed'
      sx={{
        backgroundColor: '#fff',
        boxShadow: 1,
        color: '#333',
        px: '5%',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#333',
          }}
          component={Link}
          to='/'
        >
          <img
            src={logo}
            alt='Zucarlink Logo'
            style={{
              height: '40px',
              marginRight: '10px',
            }}
          />
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: 3,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Button
            component={Link}
            to='/'
            color={isActive('/') ? 'primary' : 'inherit'} // Aplica estilo activo
            sx={{
              fontSize: '1rem',
              fontWeight: isActive('/') ? 'bold' : 'normal', // Resalta el enlace activo
            }}
          >
            Inicio
          </Button>
          {isAuthenticated && (
            <Button
              component={Link}
              to='/directorio'
              color={isActive('/directorio') ? 'primary' : 'inherit'} // Aplica estilo activo
              sx={{
                fontSize: '1rem',
                fontWeight: isActive('/directorio') ? 'bold' : 'normal',
              }}
            >
              Directorio
            </Button>
          )}
          <Button
            component={Link}
            to='#services'
            color='inherit'
            sx={{ fontSize: '1rem' }}
          >
            Servicios
          </Button>
          <Button
            component={Link}
            to='#contact'
            color='inherit'
            sx={{ fontSize: '1rem' }}
          >
            Contacto
          </Button>
          {isAuthenticated && user && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                marginRight: 2,
              }}
            >
              <Avatar
                src={user.avatar || ''}
                alt={user.nombre}
                onClick={() => navigate(`/perfil/${user.id}`)}
                sx={{
                  cursor: 'pointer',
                  width: 40,
                  height: 40,
                  backgroundColor: '#ff6347',
                  color: '#fff',
                }}
              >
                {!user.avatar && getInitials(`${user.nombre} ${user.apellido}`)}
              </Avatar>
            </Box>
          )}
          {isAuthenticated ? (
            <Button
              color='error'
              variant='contained'
              onClick={logout}
              sx={{
                backgroundColor: '#ff6347',
                '&:hover': {
                  backgroundColor: '#e5533f',
                },
              }}
              startIcon={<ExitToAppIcon />}
            >
              Salir
            </Button>
          ) : (
            <>
              <Button
                component={Link}
                to='/login'
                sx={{
                  color: '#333',
                  textTransform: 'none',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  '&:hover': {
                    backgroundColor: '#333',
                    color: '#fff',
                  },
                }}
                startIcon={<LoginIcon />}
              >
                Ingreso
              </Button>
              <Button
                component={Link}
                to='/register'
                sx={{
                  backgroundColor: '#ff6347',
                  color: '#fff',
                  textTransform: 'none',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  '&:hover': {
                    backgroundColor: '#e5533f',
                  },
                }}
                startIcon={<PersonAddIcon />}
              >
                Registro
              </Button>
            </>
          )}
        </Box>

        <IconButton
          color='inherit'
          sx={{ display: { xs: 'block', md: 'none' } }}
          onClick={() => toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
