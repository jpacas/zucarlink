import { Box, Typography } from '@mui/material'

const Exito = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant='h4'>Pago exitoso</Typography>
      <Typography variant='body1'>
        Gracias por tu compra. Tu pago ha sido procesado correctamente.
      </Typography>
    </Box>
  )
}

export default Exito
