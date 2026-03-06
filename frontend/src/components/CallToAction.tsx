import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import ctaImage from '../assets/images/ZLSinBG.png' // Asegúrate de usar la ruta correcta

const CallToAction: React.FC = () => {
  return (
    <Box
      component='section'
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
        alignItems: 'center',
        maxWidth: '1800px',
        width: '100%',
        mx: 'auto',
        mt: '0px',
        px: '5%',
        py: 6,
        backgroundColor: 'background.paper',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
        gap: { xs: 4, md: 6 },
      }}
    >
      {/* Columna de texto */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-start' },
          p: { xs: 2, md: 5 },
        }}
      >
        <Typography
          variant='h2'
          component='h2'
          sx={{
            mb: 3,
            textAlign: { xs: 'center', md: 'left' },
            color: 'text.primary',
            fontWeight: 700,
            letterSpacing: '-0.4px',
            wordWrap: 'break-word',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              marginTop: '16px',
              borderRadius: '2px',
            },
          }}
        >
          Únete a Nuestra Comunidad
        </Typography>
        <Typography
          variant='body1'
          sx={{
            mb: 4,
            fontSize: '1.25rem',
            lineHeight: 1.7,
            textAlign: { xs: 'center', md: 'left' },
            color: 'text.secondary',
            maxWidth: '600px',
          }}
        >
          Descubre todas las oportunidades que tenemos para ti. Regístrate ahora
          y comienza tu viaje con nosotros.
        </Typography>
        <Button
          component={Link}
          to='/register'
          variant='contained'
          size='large'
          sx={{
            fontSize: '1.2rem',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          ¡Regístrate Ahora!
        </Button>
      </Box>

      {/* Columna de imagen y explicación */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, md: 5 },
          position: 'relative',
          gap: { xs: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: { xs: '220px', md: '260px' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <img
            src={ctaImage}
            alt='Zucarlink Logo'
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transition: 'transform 0.3s ease',
            }}
          />
        </Box>
        <Typography
          variant='body2'
          sx={{
            maxWidth: 420,
            textAlign: 'center',
            color: 'text.secondary',
            position: 'relative',
            '&::before': {
              content: '""',
              display: 'block',
              width: '40px',
              height: '3px',
              backgroundColor: 'primary.main',
              margin: '0 auto 16px auto',
              borderRadius: '2px',
            },
          }}
        >
          Zucarlink conecta a productores, técnicos, proveedores y educadores
          con una plataforma hecha para la industria azucarera.
        </Typography>
      </Box>
      <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}>
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            lineHeight: 1.7,
            mt: { xs: 2, md: 0 },
          }}
        >
          El nombre "Zucarlink" une "azúcar" con "link" (enlace), simbolizando
          la conexión esencial en el corazón de la industria azucarera. Nuestro
          logo, inspirado por la molécula de sacarosa, refleja este vínculo: el
          núcleo representa la plataforma Zucarlink como el corazón innovador,
          mientras los segmentos dinámicos (azul, verde, naranja) simbolizan a
          Productores, Técnicos, Proveedores, Educadores y Consumidores. En
          Zucarlink utilizamos la tecnología para unir la industria y llevarla a
          otro nivel.
        </Typography>
      </Box>
    </Box>
  )
}

export default CallToAction
