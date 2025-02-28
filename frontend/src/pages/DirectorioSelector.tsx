import React from 'react'
import { Box, Card, CardContent, Typography, Grid } from '@mui/material'
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
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        padding: 3,
        marginTop: '64px',
      }}
    >
      <Grid container spacing={4} justifyContent='center'>
        {options.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
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
                    color: 'primary.main',
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {option.icon}
                </Box>
                <Typography variant='h5' component='h2' gutterBottom>
                  {option.title}
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default DirectorioSelector
