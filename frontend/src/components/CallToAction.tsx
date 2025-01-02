import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import ctaImage from '../assets/images/Zucar-image.png' // Asegúrate de usar la ruta correcta

const CallToAction: React.FC = () => {
  return (
    <Box
      component='section'
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        maxWidth: '1800px',
        width: '100%',
        mx: 'auto',
        mt: '64px', // Ajustar margen superior según el diseño
        px: '5%',
        backgroundColor: '#fff',
      }}
    >
      {/* Columna de texto */}
      <Box
        sx={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <Typography
          variant='h4'
          component='h2'
          sx={{
            mb: 2,
            textAlign: 'center',
            color: '#333',
            wordWrap: 'break-word',
          }}
        >
          Únete a Nuestra Comunidad
        </Typography>
        <Typography
          variant='body1'
          sx={{
            mb: 3,
            fontSize: '1.2rem',
            lineHeight: 1.6,
            textAlign: 'center',
            color: '#666',
          }}
        >
          Descubre todas las oportunidades que tenemos para ti. Regístrate ahora
          y comienza tu viaje con nosotros.
        </Typography>
        <Button
          component={Link}
          to='/register'
          variant='contained'
          sx={{
            backgroundColor: '#ff6347',
            color: '#fff',
            padding: '0.8rem 2rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: '5px',
            '&:hover': {
              backgroundColor: '#e5533f',
            },
          }}
        >
          Regístrate Ahora
        </Button>
      </Box>

      {/* Columna de imagen */}
      <Box
        sx={{
          flex: '1 1 50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={ctaImage}
          alt='Call to Action'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>
    </Box>
  )
}

export default CallToAction
