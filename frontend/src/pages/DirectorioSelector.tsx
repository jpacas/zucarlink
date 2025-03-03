import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import BusinessIcon from '@mui/icons-material/Business'
import GroupIcon from '@mui/icons-material/Group'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'

const DirectorioSelector: React.FC = () => {
  const navigate = useNavigate()

  const options = [
    {
      title: 'Ingenios',
      icon: <BusinessIcon sx={{ fontSize: 60 }} />,
      path: '/directorio/ingenios',
      description: 'Explora el directorio de ingenios azucareros',
    },
    {
      title: 'Proveedores',
      icon: <LocalShippingIcon sx={{ fontSize: 60 }} />,
      path: '/directorio/proveedores',
      description: 'Descubre proveedores del sector azucarero',
    },
    {
      title: 'Usuarios',
      icon: <GroupIcon sx={{ fontSize: 60 }} />,
      path: '/directorio/usuarios',
      description: 'Conecta con profesionales del sector',
    },
  ]

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
      }}
    >
      <Container maxWidth='lg'>
        <Typography
          variant='h3'
          align='center'
          sx={{
            mb: 6,
            fontWeight: 700,
            color: '#1a1a1a',
            letterSpacing: '-0.5px',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '60px',
              height: '4px',
              backgroundColor: '#ff6347',
              margin: '16px auto',
              borderRadius: '2px',
            },
          }}
        >
          Directorio
        </Typography>
        <Grid container spacing={4} justifyContent='center'>
          {options.map((option) => (
            <Grid item xs={12} sm={6} md={4} key={option.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: '16px',
                  background:
                    'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  },
                }}
                onClick={() => navigate(option.path)}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                  }}
                >
                  <Box
                    sx={{
                      color: '#ff6347',
                      mb: 3,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(10deg)',
                      },
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography
                    variant='h5'
                    component='h2'
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: '#1a1a1a',
                    }}
                  >
                    {option.title}
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      color: '#4a4a4a',
                      lineHeight: 1.7,
                    }}
                  >
                    {option.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default DirectorioSelector
