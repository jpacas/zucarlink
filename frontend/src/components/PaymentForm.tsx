import { useState, useEffect } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'

const PaymentForm = ({
  email,
  nombre,
  plan,
  clientSecret,
}: {
  email: string
  nombre: string
  plan: string
  clientSecret: string
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!stripe || !elements) {
      return
    }

    // Verificar el estado del PaymentIntent al cargar
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      console.log('Estado del PaymentIntent:', paymentIntent?.status)
    })
  }, [stripe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      console.error('Stripe no está inicializado')
      return
    }

    setProcessing(true)

    try {
      // Guardar los datos del proveedor en sessionStorage
      const proveedorData = {
        nombre,
        email,
        plan,
        pais: window.localStorage.getItem('proveedorPais'),
        paginaWeb: window.localStorage.getItem('proveedorWeb'),
        descripcion: window.localStorage.getItem('proveedorDescripcion'),
        logo: window.localStorage.getItem('proveedorLogo'),
      }

      // Usar sessionStorage en lugar de localStorage para datos temporales
      window.sessionStorage.setItem(
        'proveedorData',
        JSON.stringify(proveedorData)
      )

      // Confirmar el pago con el método de pago creado
      console.log('Confirmando pago...')
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/registro-exitoso`,
        },
      })

      if (confirmError) {
        throw confirmError
      }
    } catch (error: any) {
      console.error('Error en el pago:', error)
      setError(error?.message || 'Error al procesar el pago')
      setProcessing(false)
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <PaymentElement
        options={{
          defaultValues: {
            billingDetails: {
              email: email,
              name: nombre,
            },
          },
        }}
      />
      {error && (
        <Typography color='error' sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <Button
        onClick={handleSubmit}
        variant='contained'
        fullWidth
        sx={{ mt: 2 }}
        disabled={!stripe || processing}
      >
        {processing
          ? 'Procesando...'
          : `Pagar $${plan === 'monthly' ? '50' : '500'}`}
      </Button>
    </Box>
  )
}

export default PaymentForm
