import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import ctaImage from '../assets/images/ZLSinBG.png' // Asegúrate de usar la ruta correcta

const CallToAction: React.FC = () => {
  return (
    <Box
      component='section'
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        flexWrap: 'wrap',
        maxWidth: '1800px',
        width: '100%',
        mx: 'auto',
        mt: '0px',
        px: '5%',
        py: 6,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
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
          p: { xs: 3, md: 6 },
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1px',
            height: '70%',
            backgroundColor: 'rgba(0,0,0,0.1)',
            display: { xs: 'none', md: 'block' },
          },
        }}
      >
        <Typography
          variant='h3'
          component='h2'
          sx={{
            mb: 3,
            textAlign: 'center',
            color: '#1a1a1a',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            wordWrap: 'break-word',
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
          Únete a Nuestra Comunidad
        </Typography>
        <Typography
          variant='body1'
          sx={{
            mb: 4,
            fontSize: '1.25rem',
            lineHeight: 1.7,
            textAlign: 'center',
            color: '#4a4a4a',
            maxWidth: '600px',
          }}
        >
          Descubre todas las oportunidades que tenemos para ti. Regístrate ahora
          y comienza tu viaje con nosotros.
        </Typography>
        <Button
          component={Link}
          to='/contact'
          variant='contained'
          sx={{
            backgroundColor: '#ff6347',
            color: '#fff',
            padding: '1rem 2.5rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: '50px',
            boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#e5533f',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(255, 99, 71, 0.4)',
            },
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
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          p: { xs: 3, md: 6 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '300px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 4,
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
          variant='body1'
          sx={{
            fontSize: '1.1rem',
            lineHeight: 1.7,
            textAlign: 'justify',
            color: '#4a4a4a',
            mt: 2,
            px: { xs: 2, md: 4 },
            position: 'relative',
            '&::before': {
              content: '""',
              display: 'block',
              width: '40px',
              height: '3px',
              backgroundColor: '#ff6347',
              margin: '0 auto 16px auto',
              borderRadius: '2px',
            },
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
