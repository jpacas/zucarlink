import React from 'react'
import { Box, Typography, Card, CardContent, Avatar } from '@mui/material'
import Slider from 'react-slick'
import {
  People,
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  Visibility,
  Insights,
  Speed,
  Business,
  Lightbulb,
} from '@mui/icons-material'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const BenefitCard: React.FC<{
  title: string
  description: string
  Icon: React.ElementType
}> = ({ title, description, Icon }) => (
  <Card
    sx={{
      boxShadow: 3,
      textAlign: 'center',
      borderRadius: 3,
      padding: 2,
      minWidth: '280px',
      maxWidth: '320px',
      margin: '0 auto',
    }}
  >
    <CardContent>
      <Avatar
        sx={{
          margin: '0 auto',
          bgcolor: 'primary.main',
          width: 56,
          height: 56,
        }}
      >
        <Icon fontSize='large' />
      </Avatar>
      <Typography variant='h6' sx={{ mt: 2, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary' }}>
        {description}
      </Typography>
    </CardContent>
  </Card>
)

const Benefits: React.FC = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Activa el cambio automático
    autoplaySpeed: 3000, // Tiempo entre cambios en milisegundos (3 segundos)
    appendDots: (dots: React.ReactNode) => (
      <Box sx={{ mt: 4 }}>
        <ul
          style={{
            margin: '0',
            padding: '0',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {dots}
        </ul>
      </Box>
    ),
    customPaging: (_: number) => (
      <div
        style={{
          width: '10px',
          height: '10px',
          border: '1px solid #333',
          borderRadius: '50%',
          background: '#ddd',
        }}
      />
    ),
  }

  const groups = [
    {
      title: 'Técnicos Azucareros',
      benefits: [
        {
          title: 'Networking',
          description:
            'Accede al directorio especializado que conecta a técnicos y empresas de la industria, optimizando la colaboración y el intercambio de contactos.',
          Icon: People,
        },
        {
          title: 'Conocimiento',
          description:
            'Intercambia conocimientos prácticos y experiencias valiosas con otros técnicos y proveedores, enriqueciendo tu crecimiento profesional.',
          Icon: Insights,
        },
        {
          title: 'Ingresos',
          description:
            'Amplía tus oportunidades profesionales y genera ingresos adicionales al participar activamente en la red.',
          Icon: AttachMoney,
        },
      ],
    },
    {
      title: 'Proveedores',
      benefits: [
        {
          title: 'Ventas',
          description:
            'Impulsa tus ventas promocionando tus productos y servicios directamente a los tomadores de decisiones en los ingenios.',
          Icon: ShoppingCart,
        },
        {
          title: 'Marca',
          description:
            'Posiciona tu marca 24/7 frente a técnicos e ingenios clave, asegurando reconocimiento y fidelidad en la industria.',
          Icon: Visibility,
        },
        {
          title: 'Visibilidad',
          description:
            'Mantente actualizado sobre las últimas tendencias y necesidades del mercado para ofrecer soluciones precisas y oportunas.',
          Icon: Lightbulb,
        },
      ],
    },
    {
      title: 'Industria Azucarera',
      benefits: [
        {
          title: 'Eficiencia',
          description:
            'Aprovecha el conocimiento de la red para optimizar la recuperación de productos y hacer que la industria azucarera sea más competitiva.',
          Icon: Speed,
        },
        {
          title: 'Rentabilidad',
          description:
            'Accede a un mercado especializado de maquinaria usada que optimiza costos y maximiza el retorno de inversión de los ingenios.',
          Icon: Business,
        },
        {
          title: 'Tecnología',
          description:
            'Implementa soluciones tecnológicas innovadoras que resuelvan desafíos operativos y potencien el desarrollo de la industria.',
          Icon: TrendingUp,
        },
      ],
    },
  ]

  return (
    <Box sx={{ py: 5, backgroundColor: '#f9f9f9' }}>
      <Typography
        variant='h4'
        align='center'
        sx={{ mb: 4, fontWeight: 'bold' }}
      >
        Nuestros Beneficios
      </Typography>
      <Slider {...sliderSettings}>
        {groups.map((group, index) => (
          <Box key={index} sx={{ textAlign: 'center', px: 2, mb: 3 }}>
            <Typography variant='h5' sx={{ mb: 3, color: 'primary.main' }}>
              {group.title}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              {group.benefits.map((benefit, idx) => (
                <BenefitCard
                  key={idx}
                  title={benefit.title}
                  description={benefit.description}
                  Icon={benefit.Icon}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  )
}

export default Benefits
