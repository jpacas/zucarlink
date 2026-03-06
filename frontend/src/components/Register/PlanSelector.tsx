import React from 'react'
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardActions,
} from '@mui/material'
import { CheckCircleOutline, ArrowBack } from '@mui/icons-material'
import { Plan } from '../../types/interfaces'

interface PlanSelectorProps {
  plans: Plan[]
  selectedPlan: Plan | null
  onSelectPlan: (plan: Plan) => void
  onBack: () => void
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  selectedPlan,
  onSelectPlan,
  onBack,
}) => {
  return (
    <Box>
      <Button
        onClick={onBack}
        startIcon={<ArrowBack />}
        sx={{
          mb: 3,
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        Volver
      </Button>

      <Typography
        variant='h4'
        textAlign='center'
        mb={2}
        sx={{
          color: 'text.primary',
          fontWeight: 700,
          letterSpacing: '-0.5px',
        }}
      >
        Selecciona tu plan
      </Typography>
      <Typography
        variant='body1'
        textAlign='center'
        mb={6}
        color='text.secondary'
        sx={{ maxWidth: 600, margin: '0 auto 48px' }}
      >
        Elige el plan que mejor se adapte a tus necesidades
      </Typography>

      <Grid container spacing={4} justifyContent='center'>
        {plans.map((plan) => (
          <Grid item xs={12} md={6} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '2px solid',
                borderColor:
                  selectedPlan?.id === plan.id
                    ? 'primary.main'
                    : 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 4 }}>
                <Typography
                  variant='h5'
                  gutterBottom
                  fontWeight='bold'
                  color='primary.main'
                  textAlign='center'
                >
                  {plan.name}
                </Typography>
                <Box
                  sx={{
                    textAlign: 'center',
                    my: 3,
                    py: 2,
                    backgroundColor: 'primary.light',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant='h3'
                    fontWeight='bold'
                    color='primary.main'
                  >
                    ${plan.price}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {plan.interval === 'month' ? 'por mes' : 'por año'}
                  </Typography>
                </Box>
                <List>
                  {plan.features.map((feature) => (
                    <ListItem key={feature} sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleOutline
                          color='primary'
                          fontSize='small'
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          variant: 'body2',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant={
                    selectedPlan?.id === plan.id ? 'contained' : 'outlined'
                  }
                  color='primary'
                  fullWidth
                  size='large'
                  onClick={() => onSelectPlan(plan)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                  }}
                >
                  {selectedPlan?.id === plan.id
                    ? 'Plan Seleccionado'
                    : 'Seleccionar Plan'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default PlanSelector
