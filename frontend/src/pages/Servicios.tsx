import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Container,
} from '@mui/material'
import {
  People,
  Forum,
  SmartToy,
  Newspaper,
  Store,
  Work,
} from '@mui/icons-material'

const servicios = [
  {
    titulo: 'Directorio de Industria',
    descripcion:
      'Encuentra y conéctate con profesionales y empresas del sector azucarero. Un directorio completo que facilita el networking y la colaboración dentro de la industria.',
    icon: People,
  },
  {
    titulo: 'Foro Técnico',
    descripcion:
      'Comparte conocimientos y resuelve dudas técnicas con expertos del sector. Un espacio de discusión donde la comunidad puede intercambiar experiencias y soluciones.',
    icon: Forum,
  },
  {
    titulo: 'Inteligencia Artificial',
    descripcion:
      'Accede a un asistente de IA especializado en la industria azucarera, capaz de responder preguntas técnicas y proporcionar información basada en datos actualizados.',
    icon: SmartToy,
  },
  {
    titulo: 'Noticias del Sector',
    descripcion:
      'Mantente informado con las últimas novedades y tendencias del sector azucarero. Noticias verificadas y relevantes para la comunidad.',
    icon: Newspaper,
  },
  {
    titulo: 'Marketplace Azucarero',
    descripcion:
      'Compra y vende productos, equipos y servicios relacionados con la industria. Un mercado digital diseñado para facilitar transacciones seguras y eficientes.',
    icon: Store,
  },
  {
    titulo: 'Empleos en la Industria',
    descripcion:
      'Encuentra oportunidades laborales en el sector azucarero. Empresas y profesionales conectados en un espacio para impulsar el crecimiento laboral.',
    icon: Work,
  },
]

const ServiciosZucarlink: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
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
            color: 'text.primary',
            letterSpacing: '-0.5px',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              margin: '16px auto',
              borderRadius: '2px',
            },
          }}
        >
          Nuestros Servicios
        </Typography>

        <Grid container spacing={4} justifyContent='center'>
          {servicios.map((servicio, index) => {
            const Icon = servicio.icon
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 28px rgba(16, 24, 40, 0.12)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      p: 4,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: 'primary.main',
                        borderRadius: '50%',
                        width: 70,
                        height: 70,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 8px 16px rgba(228, 93, 69, 0.24)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 12px 22px rgba(228, 93, 69, 0.28)',
                        },
                      }}
                    >
                      <Icon sx={{ fontSize: 35, color: '#fff' }} />
                    </Box>
                    <Typography
                      variant='h5'
                      sx={{
                        mb: 2,
                        fontWeight: 700,
                        color: 'text.primary',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          display: 'block',
                          width: '40px',
                          height: '3px',
                          backgroundColor: 'primary.main',
                          margin: '8px auto',
                          borderRadius: '2px',
                        },
                      }}
                    >
                      {servicio.titulo}
                    </Typography>
                    <Typography
                      variant='body1'
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.7,
                      }}
                    >
                      {servicio.descripcion}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Container>
    </Box>
  )
}

export default ServiciosZucarlink
