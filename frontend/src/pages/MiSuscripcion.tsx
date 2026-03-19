import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper, Button, Chip, CircularProgress } from '@mui/material'
import { Link } from 'react-router-dom'
import axiosInstance from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'

const MiSuscripcion: React.FC = () => {
  const { user } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const response = await axiosInstance.get('/payments/subscription-status')
        setHasSubscription(true)
        setSubscriptionStatus(response.data.status || 'activo')
      } catch (error: any) {
        if (error?.response?.status === 400) {
          setHasSubscription(false)
        } else {
          console.error('Error al obtener estado de suscripción:', error)
          setHasSubscription(false)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionInfo()
  }, [user])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await axiosInstance.post('/payments/billing-portal')
      window.location.href = response.data.url
    } catch (error: any) {
      console.error('Error al abrir portal de facturación:', error)
      if (error?.response?.status === 400) {
        setHasSubscription(false)
      }
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
        px: 3,
      }}
    >
      <Box sx={{ maxWidth: 600, margin: 'auto' }}>
        <Typography
          variant="h3"
          textAlign="center"
          mb={4}
          sx={{
            color: 'text.primary',
            fontWeight: 700,
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
          Mi Suscripción
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : hasSubscription ? (
          <Paper
            sx={{
              p: 4,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Estado de la suscripción
              </Typography>
              <Chip
                label={subscriptionStatus === 'activo' ? 'Activa' : subscriptionStatus ?? 'Activa'}
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              Administra tu suscripción, actualiza tu método de pago o cancela tu plan desde el portal de facturación de Stripe.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleManageSubscription}
              disabled={portalLoading}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
              }}
            >
              {portalLoading ? (
                <CircularProgress size={22} sx={{ color: '#fff' }} />
              ) : (
                'Gestionar suscripción'
              )}
            </Button>
          </Paper>
        ) : (
          <Paper
            sx={{
              p: 4,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}>
              No tienes una suscripción activa
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              Suscríbete a uno de nuestros planes para acceder a todos los beneficios de Zucarlink.
            </Typography>
            <Button
              component={Link}
              to="/services"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
              }}
            >
              Ver planes
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default MiSuscripcion
