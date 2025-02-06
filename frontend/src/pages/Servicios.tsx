import React from 'react'
import { Card, CardContent, Typography, Grid, Box } from '@mui/material'

const servicios = [
  {
    titulo: 'Directorio de Industria',
    descripcion:
      'Encuentra y conéctate con profesionales y empresas del sector azucarero. Un directorio completo que facilita el networking y la colaboración dentro de la industria.',
  },
  {
    titulo: 'Foro Técnico',
    descripcion:
      'Comparte conocimientos y resuelve dudas técnicas con expertos del sector. Un espacio de discusión donde la comunidad puede intercambiar experiencias y soluciones.',
  },
  {
    titulo: 'Inteligencia Artificial',
    descripcion:
      'Accede a un asistente de IA especializado en la industria azucarera, capaz de responder preguntas técnicas y proporcionar información basada en datos actualizados.',
  },
  {
    titulo: 'Noticias del Sector',
    descripcion:
      'Mantente informado con las últimas novedades y tendencias del sector azucarero. Noticias verificadas y relevantes para la comunidad.',
  },
  {
    titulo: 'Marketplace Azucarero',
    descripcion:
      'Compra y vende productos, equipos y servicios relacionados con la industria. Un mercado digital diseñado para facilitar transacciones seguras y eficientes.',
  },
  {
    titulo: 'Empleos en la Industria',
    descripcion:
      'Encuentra oportunidades laborales en el sector azucarero. Empresas y profesionales conectados en un espacio para impulsar el crecimiento laboral.',
  },
]

const ServiciosZucarlink: React.FC = () => {
  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        marginTop: '64px',
      }}
    >
      <Typography
        variant='h3'
        textAlign='center'
        marginBottom={4}
        color='primary'
      >
        Servicios que Ofrecemos
      </Typography>
      <Grid container spacing={4} justifyContent='center'>
        {servicios.map((servicio, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                boxShadow: 3,
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' },
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography variant='h5' color='primary' gutterBottom>
                  {servicio.titulo}
                </Typography>
                <Typography variant='body1'>{servicio.descripcion}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ServiciosZucarlink
