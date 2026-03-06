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
      textAlign: 'center',
      padding: 3,
      width: { xs: '100%', sm: '320px' },
      maxWidth: { xs: '100%', sm: '340px' },
      margin: '0 auto',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 12px 28px rgba(16, 24, 40, 0.12)',
      },
    }}
  >
    <CardContent>
        <Avatar
          sx={{
            margin: '0 auto',
            bgcolor: 'primary.main',
            width: 76,
            height: 76,
            boxShadow: '0 8px 16px rgba(228, 93, 69, 0.24)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 12px 22px rgba(228, 93, 69, 0.28)',
            },
          }}
        >
        <Icon sx={{ fontSize: 38 }} />
      </Avatar>
      <Typography
        variant='h6'
        sx={{
          mt: 2.5,
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
        {title}
      </Typography>
      <Typography
        variant='body2'
        sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.7 }}
      >
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
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: '50%',
          background: 'transparent',
          transition: 'all 0.3s ease',
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
    <Box
      sx={{
        py: 8,
        px: '5%',
        backgroundColor: 'background.paper',
        borderRadius: { xs: 0, md: '16px' },
        maxWidth: '1800px',
        mx: 'auto',
        my: 4,
        border: { xs: 'none', md: '1px solid' },
        borderColor: { xs: 'transparent', md: 'divider' },
        boxShadow: { xs: 'none', md: '0 8px 24px rgba(16, 24, 40, 0.08)' },
      }}
    >
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
        Nuestros Beneficios
      </Typography>
      <Slider {...sliderSettings}>
        {groups.map((group, index) => (
          <Box key={index} sx={{ textAlign: 'center', px: 2, mb: 3 }}>
            <Typography
              variant='h4'
              sx={{
                mb: 4,
                color: 'primary.main',
                fontWeight: 600,
              }}
            >
              {group.title}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 4,
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
