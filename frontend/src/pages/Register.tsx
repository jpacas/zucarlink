import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Autocomplete,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardActions,
  Tooltip,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  CheckCircleOutline,
  Visibility,
  VisibilityOff,
  Factory,
  Business,
  Store,
  ArrowBack,
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import axiosInstance from '../utils/axiosConfig'
import { useNavigate } from 'react-router-dom'
//import placeholder from '../assets/images/avatar-generico.jpg' // Asegúrate de tener esta imagen o ajusta la ruta
import {
  fetchPaises,
  fetchAreas,
  fetchIngenios,
  fetchProveedores,
} from '../functions/fetchFunctions'
import { Ingenio, Proveedor, Area } from '../types/interfaces'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from '../components/PaymentForm'

// Definir interfaces para los tipos
interface FormData {
  nombre: string
  apellido: string
  email: string
  fecha_nacimiento: string
  pais: string
  avatarUrl: File | null
  ingenio: string
  area: string | null
  proveedor: string
  password: string
  confirmPassword: string
  paginaWeb: string
  descripcion: string
}

interface Message {
  type: 'success' | 'error'
  text: string
}

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Plan Mensual',
    price: 50,
    interval: 'month',
    features: [
      'Perfil de empresa destacado',
      'Listado en el directorio',
      'Soporte prioritario',
      'Estadísticas detalladas',
      'Facturación mensual',
      'Cancela cuando quieras',
    ],
  },
  {
    id: 'yearly',
    name: 'Plan Anual',
    price: 500,
    interval: 'year',
    features: [
      'Perfil de empresa destacado',
      'Listado en el directorio',
      'Soporte prioritario',
      'Estadísticas detalladas',
      'Facturación anual',
      '2 meses gratis',
      'Mejor valor',
    ],
  },
]

const Register: React.FC = () => {
  const [step, setStep] = useState<'initial' | 'form'>('initial')
  const [userType, setUserType] = useState<
    'ingenio' | 'proveedor' | 'empresa_proveedora' | null
  >(null)
  const [formPart, setFormPart] = useState<1 | 2>(1)
  const [paises, setPaises] = useState<string[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    fecha_nacimiento: '',
    pais: '',
    avatarUrl: null,
    ingenio: '',
    area: null,
    proveedor: '',
    password: '',
    confirmPassword: '',
    paginaWeb: '',
    descripcion: '',
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [registrationStep, setRegistrationStep] = useState<
    'form' | 'plan' | 'payment'
  >('form')
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const steps = ['Información Personal', 'Detalles de Usuario']

  useEffect(() => {
    fetchPaises().then(({ paises, error }) => {
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setPaises(paises || [])
      }
    })
    fetchAreas().then(({ areas, error }) => {
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setAreas(areas || [])
      }
    })
    fetchIngenios().then(({ ingenios, error }) => {
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setIngenios(ingenios || [])
      }
    })
    fetchProveedores().then(({ proveedores, error }) => {
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setProveedores(proveedores || [])
      }
    })
  }, [])

  // Filtra los ingenios según el país seleccionado
  const ingeniosFiltrados = ingenios.filter(
    (ingenio) => ingenio.pais === formData.pais
  )

  // Maneja la selección del tipo de usuario
  const handleUserTypeSelection = (
    type: 'ingenio' | 'proveedor' | 'empresa_proveedora'
  ) => {
    // Primero limpiamos el estado del formulario
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      fecha_nacimiento: '',
      pais: '',
      avatarUrl: null,
      ingenio: '',
      area: null,
      proveedor: '',
      password: '',
      confirmPassword: '',
      paginaWeb: '',
      descripcion: '',
    })
    setPreview(null)
    setMessage(null)
    setFormPart(1)
    setRegistrationStep('form')
    setSelectedPlan(null)
    setClientSecret(null)
    // Luego actualizamos el tipo de usuario y el paso
    setUserType(type)
    setStep('form')
  }

  // Maneja cambios en los campos del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    onDrop: (acceptedFiles) => {
      setFormData((prev) => ({ ...prev, avatarUrl: acceptedFiles[0] }))
      setPreview(URL.createObjectURL(acceptedFiles[0]))
    },
  })

  // Maneja la navegación entre partes del formulario
  const handleNext = () => {
    if (formPart === 1) {
      // Solo validamos si estamos en el paso 1 y el usuario ha interactuado con el formulario
      if (
        formData.nombre ||
        formData.apellido ||
        formData.email ||
        formData.fecha_nacimiento ||
        formData.pais
      ) {
        if (
          !formData.nombre ||
          !formData.apellido ||
          !formData.email ||
          !formData.fecha_nacimiento ||
          !formData.pais
        ) {
          setMessage({
            type: 'error',
            text: 'Por favor completa todos los campos obligatorios.',
          })
          return
        }
      }
      setFormPart(2)
    }
  }

  // Añade esta función de utilidad
  const formatWebUrl = (url: string): string => {
    if (!url) return ''

    // Si ya tiene http:// o https://, dejarlo como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // Si empieza con www., añadir https://
    if (url.startsWith('www.')) {
      return `https://${url}`
    }

    // Si no tiene ningún prefijo, añadir https://www.
    return `https://www.${url}`
  }

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formDataToSend = new FormData()

    try {
      if (userType === 'empresa_proveedora') {
        if (registrationStep === 'form') {
          // Guardar datos del proveedor en localStorage
          window.localStorage.setItem('proveedorPais', formData.pais)
          window.localStorage.setItem(
            'proveedorWeb',
            formatWebUrl(formData.paginaWeb)
          )
          window.localStorage.setItem(
            'proveedorDescripcion',
            formData.descripcion
          )
          if (formData.avatarUrl) {
            const reader = new FileReader()
            reader.onloadend = () => {
              window.localStorage.setItem(
                'proveedorLogo',
                reader.result as string
              )
            }
            reader.readAsDataURL(formData.avatarUrl)
          }

          setRegistrationStep('plan')
          setLoading(false)
          return
        }

        if (registrationStep === 'plan' && selectedPlan) {
          try {
            // Primero crear el proveedor
            const formDataToSend = new FormData()
            formDataToSend.append('nombre', formData.nombre)
            formDataToSend.append('pais', formData.pais)
            formDataToSend.append('email', formData.email)
            formDataToSend.append('paginaWeb', formatWebUrl(formData.paginaWeb))
            formDataToSend.append('descripcion', formData.descripcion)
            if (formData.avatarUrl) {
              formDataToSend.append('logo', formData.avatarUrl)
            }

            // Crear el proveedor primero
            const proveedorResponse = await axiosInstance.post(
              `${import.meta.env.VITE_API_URL}/helper/registerProveedor`,
              formDataToSend,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
              }
            )

            const response = await axiosInstance.post(
              `${import.meta.env.VITE_API_URL}/payments/create-payment-intent`,
              {
                plan: selectedPlan,
                email: formData.email,
                metadata: {
                  nombre: formData.nombre,
                  pais: formData.pais,
                  paginaWeb: formatWebUrl(formData.paginaWeb),
                  descripcion: formData.descripcion,
                  proveedorId: proveedorResponse.data.id.toString(),
                },
              }
            )

            setClientSecret(response.data.clientSecret)
            setRegistrationStep('payment')
            setLoading(false)
            return
          } catch (error: any) {
            console.error('Error detallado:', error.response?.data || error)
            setMessage({
              type: 'error',
              text:
                error.response?.data?.details ||
                'Error al iniciar el proceso de pago',
            })
            setLoading(false)
            return
          }
        }

        formDataToSend.append('nombre', formData.nombre)
        formDataToSend.append('pais', formData.pais)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('paginaWeb', formatWebUrl(formData.paginaWeb))
        formDataToSend.append('descripcion', formData.descripcion)
        if (formData.avatarUrl) {
          formDataToSend.append('logo', formData.avatarUrl)
        }

        await axiosInstance.post(
          `${import.meta.env.VITE_API_URL}/helper/registerProveedor`,
          formDataToSend,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        )

        setMessage({
          type: 'success',
          text: 'Empresa registrada exitosamente.',
        })
        setTimeout(() => navigate('/login'), 2000)
      } else {
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
          return
        }

        if (userType === 'ingenio' && (!formData.ingenio || !formData.area)) {
          setMessage({
            type: 'error',
            text: 'Por favor completa los campos de ingenio y área.',
          })
          return
        }

        if (userType === 'proveedor' && !formData.proveedor) {
          setMessage({
            type: 'error',
            text: 'Por favor ingresa el nombre del proveedor.',
          })
          return
        }

        // Agregar todos los campos al FormData
        Object.keys(formData).forEach((key) => {
          const value = (formData as any)[key]
          if (key === 'avatarUrl' && value) {
            // Asegurarse de que la imagen se envíe con el nombre correcto 'avatar'
            formDataToSend.append('avatar', value)
          } else if (key === 'area' && userType === 'proveedor') {
            formDataToSend.append(key, '')
          } else {
            formDataToSend.append(key, value !== null ? value : '')
          }
        })

        await axiosInstance.post(
          `${import.meta.env.VITE_API_URL}/users/register`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              // Asegurarse de que no se envíe el Content-Type automático
              Accept: 'application/json',
            },
          }
        )

        setMessage({
          type: 'success',
          text: 'Usuario registrado exitosamente.',
        })
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al registrar.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Pantalla inicial con los tres botones
  if (step === 'initial') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 3,
          background: 'linear-gradient(to bottom right, #f5f7fa, #e4e8ec)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1200px',
            backgroundColor: '#fff',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            p: { xs: 3, md: 6 },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Registro de Usuario
            </Typography>
            <Typography
              variant='h6'
              color='text.secondary'
              sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6, mb: 2 }}
            >
              Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
              y comienza a disfrutar de todos los beneficios
            </Typography>
            <Box
              sx={{
                backgroundColor: 'info.light',
                p: 2,
                borderRadius: 2,
                maxWidth: '800px',
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Store sx={{ color: 'info.main', fontSize: 40 }} />
              <Typography
                variant='body1'
                color='info.dark'
                sx={{ textAlign: 'left' }}
              >
                <strong>¿Eres una empresa proveedora?</strong> Para registrar
                usuarios de tu empresa, primero debes registrar tu empresa en la
                plataforma. Una vez registrada, tus empleados podrán crear sus
                cuentas seleccionando "Usuario Proveedor".
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4} justifyContent='center'>
            {/* Tarjeta de Usuario de Ingenio */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    '& .MuiCardContent-root': {
                      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    },
                  },
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'visible',
                    background: 'transparent',
                    boxShadow: 'none',
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      p: 4,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      backgroundColor: '#fff',
                      border: '1px solid',
                      borderColor: 'primary.light',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(10deg)',
                          backgroundColor: 'primary.main',
                        },
                      }}
                    >
                      <Factory sx={{ fontSize: 40, color: '#fff' }} />
                    </Box>
                    <Typography
                      variant='h5'
                      gutterBottom
                      fontWeight='bold'
                      color='primary.main'
                      sx={{ mb: 2 }}
                    >
                      Usuarios de Ingenios
                    </Typography>
                    <Typography
                      variant='body1'
                      color='text.secondary'
                      paragraph
                      sx={{ mb: 3, flexGrow: 1 }}
                    >
                      Personal que trabaja en ingenios azucareros. Debes de
                      registrarte con tu correo profesional.
                    </Typography>
                    <List sx={{ mb: 3, flexGrow: 1 }}>
                      {[
                        'Acceso a ZucarIA',
                        'Compra/Venta de equipos',
                        'Foro tecnico',
                        'Directorios azucareros',
                      ].map((feature) => (
                        <ListItem key={feature} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleOutline
                              color='primary'
                              fontSize='small'
                              sx={{
                                color: 'primary.main',
                                opacity: 0.8,
                                '&:hover': {
                                  opacity: 1,
                                },
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      variant='contained'
                      color='primary'
                      fullWidth
                      size='large'
                      onClick={() => handleUserTypeSelection('ingenio')}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        boxShadow: 2,
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          boxShadow: 4,
                          backgroundColor: 'primary.main',
                        },
                      }}
                    >
                      Registrarse
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            {/* Tarjeta de Empresa Proveedora */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    '& .MuiCardContent-root': {
                      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    },
                  },
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'visible',
                    background: 'transparent',
                    boxShadow: 'none',
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      p: 4,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      backgroundColor: '#fff',
                      border: '1px solid',
                      borderColor: 'info.light',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'info.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(10deg)',
                          backgroundColor: 'info.main',
                        },
                      }}
                    >
                      <Store sx={{ fontSize: 40, color: '#fff' }} />
                    </Box>
                    <Typography
                      variant='h5'
                      gutterBottom
                      fontWeight='bold'
                      color='info.main'
                      sx={{ mb: 2 }}
                    >
                      Registrar Empresa
                    </Typography>
                    <Typography
                      variant='body1'
                      color='text.secondary'
                      paragraph
                      sx={{ mb: 3, flexGrow: 1 }}
                    >
                      ¿Eres proveedor de la industria azucarera? Primero
                      registra tu empresa aquí para que tus empleados puedan
                      crear sus cuentas como usuarios proveedores.
                    </Typography>
                    <List sx={{ mb: 3, flexGrow: 1 }}>
                      {[
                        'Paso 1: Registra tu empresa',
                        'Paso 2: Registra tus empleados',
                        'Fortalece tu marca',
                        'Análisis de mercado',
                      ].map((feature) => (
                        <ListItem key={feature} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleOutline
                              color='info'
                              fontSize='small'
                              sx={{
                                color: 'info.main',
                                opacity: 0.8,
                                '&:hover': {
                                  opacity: 1,
                                },
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{
                              fontWeight: feature.startsWith('Paso')
                                ? 'bold'
                                : 'normal',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      variant='contained'
                      color='info'
                      fullWidth
                      size='large'
                      onClick={() =>
                        handleUserTypeSelection('empresa_proveedora')
                      }
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        boxShadow: 2,
                        backgroundColor: 'info.light',
                        '&:hover': {
                          boxShadow: 4,
                          backgroundColor: 'info.main',
                        },
                      }}
                    >
                      Registrar Empresa
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            {/* Tarjeta de Usuario Proveedor */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform:
                      proveedores.length > 0 ? 'translateY(-8px)' : 'none',
                    '& .MuiCardContent-root': {
                      boxShadow:
                        proveedores.length > 0
                          ? '0 12px 40px rgba(0,0,0,0.12)'
                          : 'none',
                    },
                  },
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'visible',
                    background: 'transparent',
                    boxShadow: 'none',
                    opacity: proveedores.length > 0 ? 1 : 0.7,
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      p: 4,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      backgroundColor: '#fff',
                      border: '1px solid',
                      borderColor: 'secondary.light',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'secondary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(10deg)',
                          backgroundColor: 'secondary.main',
                        },
                      }}
                    >
                      <Business sx={{ fontSize: 40, color: '#fff' }} />
                    </Box>
                    <Typography
                      variant='h5'
                      gutterBottom
                      fontWeight='bold'
                      color='secondary.main'
                      sx={{ mb: 2 }}
                    >
                      Usuarios de Proveedores
                    </Typography>
                    <Typography
                      variant='body1'
                      color='text.secondary'
                      paragraph
                      sx={{ mb: 3, flexGrow: 1 }}
                    >
                      Empleados de empresas proveedoras de la industria
                      azucarera. Tu empresa debe de estar registrada como
                      proveedor antes de que puedas registrarte como usuario.
                    </Typography>
                    <List sx={{ mb: 3, flexGrow: 1 }}>
                      {[
                        'Interactua con tecnicos',
                        'Aumenta tu visibilidad',
                        'Conoce necesidades de ingenios',
                        'Incrementa tus ventas',
                      ].map((feature) => (
                        <ListItem key={feature} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleOutline
                              color='secondary'
                              fontSize='small'
                              sx={{
                                color: 'secondary.main',
                                opacity: 0.8,
                                '&:hover': {
                                  opacity: 1,
                                },
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                    <Tooltip
                      open={tooltipOpen}
                      onClose={() => setTooltipOpen(false)}
                      title={
                        proveedores.length === 0
                          ? "Primero debes registrar tu empresa como proveedora antes de poder registrar usuarios. Haz click en 'Empresa Proveedora' para comenzar."
                          : ''
                      }
                      arrow
                      placement='top'
                    >
                      <span>
                        <Button
                          variant='contained'
                          color='secondary'
                          fullWidth
                          size='large'
                          disabled={proveedores.length === 0}
                          onClick={() => {
                            if (proveedores.length === 0) {
                              setTooltipOpen(true)
                            } else {
                              handleUserTypeSelection('proveedor')
                            }
                          }}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            boxShadow: 2,
                            backgroundColor: 'secondary.light',
                            '&:hover': {
                              boxShadow: 4,
                              backgroundColor: 'secondary.main',
                            },
                            '&.Mui-disabled': {
                              backgroundColor: 'rgba(0, 0, 0, 0.12)',
                              color: 'rgba(0, 0, 0, 0.26)',
                            },
                          }}
                        >
                          {proveedores.length === 0
                            ? 'Registra tu empresa primero'
                            : 'Registrarse'}
                        </Button>
                      </span>
                    </Tooltip>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    )
  }

  // Formulario
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '600px',
          padding: 4,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {step === 'form' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <IconButton
                onClick={() => {
                  setStep('initial')
                  setUserType(null)
                  setFormPart(1)
                  setRegistrationStep('form')
                  setSelectedPlan(null)
                  setClientSecret(null)
                  // Resetear el formulario
                  setFormData({
                    nombre: '',
                    apellido: '',
                    email: '',
                    fecha_nacimiento: '',
                    pais: '',
                    avatarUrl: null,
                    ingenio: '',
                    area: null,
                    proveedor: '',
                    password: '',
                    confirmPassword: '',
                    paginaWeb: '',
                    descripcion: '',
                  })
                }}
                sx={{ mr: 1 }}
              >
                <ArrowBack />
              </IconButton>
              <Typography
                variant='h4'
                sx={{ flexGrow: 1, textAlign: 'center' }}
              >
                Registro de{' '}
                {userType === 'ingenio'
                  ? 'Usuario de Ingenio'
                  : userType === 'proveedor'
                  ? 'Usuario Proveedor'
                  : 'Empresa Proveedora'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {registrationStep === 'payment' && clientSecret ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant='h6' gutterBottom>
              Información de Pago
            </Typography>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
                loader: 'auto',
              }}
            >
              <PaymentForm
                email={formData.email}
                nombre={formData.nombre}
                plan={selectedPlan || ''}
                clientSecret={clientSecret}
              />
            </Elements>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Formulario para usuarios de ingenio y proveedor */}
            {(userType === 'ingenio' || userType === 'proveedor') && (
              <>
                <Stepper activeStep={formPart - 1} sx={{ mb: 3 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                {formPart === 1 && (
                  <>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant='h6' gutterBottom color='primary'>
                        Información Personal
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 3 }}
                      >
                        Por favor, completa tus datos personales para crear tu
                        cuenta
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Nombre'
                          name='nombre'
                          value={formData.nombre}
                          onChange={handleChange}
                          variant='outlined'
                          required
                          InputProps={{
                            sx: {
                              borderRadius: 2,
                              backgroundColor: 'background.paper',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Apellido'
                          name='apellido'
                          value={formData.apellido}
                          onChange={handleChange}
                          variant='outlined'
                          required
                          InputProps={{
                            sx: {
                              borderRadius: 2,
                              backgroundColor: 'background.paper',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Correo Electrónico'
                          name='email'
                          type='email'
                          value={formData.email}
                          onChange={handleChange}
                          variant='outlined'
                          required
                          InputProps={{
                            sx: {
                              borderRadius: 2,
                              backgroundColor: 'background.paper',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='Fecha de Nacimiento *'
                            format='DD/MM/YYYY'
                            value={
                              formData.fecha_nacimiento
                                ? dayjs(formData.fecha_nacimiento)
                                : null
                            }
                            onChange={(newValue: Dayjs | null) =>
                              setFormData((prev) => ({
                                ...prev,
                                fecha_nacimiento: newValue
                                  ? newValue.format('YYYY-MM-DD')
                                  : '',
                              }))
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                variant: 'outlined',
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'background.paper',
                                  },
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          options={paises}
                          value={formData.pais}
                          onChange={(_, value) =>
                            setFormData((prev) => ({
                              ...prev,
                              pais: value || '',
                            }))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='País'
                              variant='outlined'
                              required
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  backgroundColor: 'background.paper',
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          {...getRootProps()}
                          sx={{
                            textAlign: 'center',
                            padding: 3,
                            border: '2px dashed',
                            borderColor: 'primary.light',
                            borderRadius: 2,
                            cursor: 'pointer',
                            backgroundColor: 'background.paper',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'primary.50',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <input {...getInputProps()} />
                          <Typography
                            variant='subtitle1'
                            gutterBottom
                            color='primary'
                          >
                            Foto de Perfil
                          </Typography>
                          {preview ? (
                            <Box>
                              <Avatar
                                src={preview}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  margin: 'auto',
                                  mb: 2,
                                  border: '4px solid',
                                  borderColor: 'primary.light',
                                }}
                              />
                              <Typography variant='body2' color='primary.dark'>
                                Click o arrastra para cambiar la imagen
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Avatar
                                sx={{
                                  width: 120,
                                  height: 120,
                                  margin: 'auto',
                                  mb: 2,
                                  backgroundColor: 'primary.light',
                                }}
                              />
                              <Typography
                                variant='body1'
                                gutterBottom
                                color='primary.dark'
                              >
                                Arrastra y suelta una imagen aquí
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                o haz click para seleccionar
                              </Typography>
                              <Typography
                                variant='caption'
                                display='block'
                                color='text.secondary'
                                sx={{ mt: 1 }}
                              >
                                Formatos permitidos: JPG, PNG (Máx. 2MB)
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    <Button
                      variant='contained'
                      color='primary'
                      fullWidth
                      onClick={handleNext}
                      sx={{
                        mt: 4,
                        mb: 2,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        boxShadow: 2,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Continuar
                    </Button>
                  </>
                )}

                {formPart === 2 && userType === 'ingenio' && (
                  <>
                    <Typography variant='h6' mb={2}>
                      Detalles de Usuario
                    </Typography>
                    <Autocomplete
                      options={ingeniosFiltrados}
                      value={
                        ingeniosFiltrados.find(
                          (ing) => ing.nombre === formData.ingenio
                        ) || null
                      }
                      onChange={(_, value) =>
                        setFormData((prev) => ({
                          ...prev,
                          ingenio: value ? value.nombre : '',
                        }))
                      }
                      getOptionLabel={(option) => option.nombre}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Ingenio'
                          margin='normal'
                          fullWidth
                          required
                        />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.nombre === (value?.nombre || value)
                      }
                    />
                    <Autocomplete
                      options={areas}
                      value={areas.find((a) => a === formData.area) || null}
                      onChange={(_, value) =>
                        setFormData((prev) => ({
                          ...prev,
                          area: value || null,
                        }))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Área'
                          margin='normal'
                          fullWidth
                          required
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option === value}
                    />
                    <TextField
                      fullWidth
                      label='Contraseña'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      margin='normal'
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label='Confirmar Contraseña'
                      name='confirmPassword'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      margin='normal'
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        variant='outlined'
                        color='secondary'
                        fullWidth
                        onClick={() => setFormPart(1)}
                      >
                        Volver
                      </Button>
                      <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        fullWidth
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                      >
                        {loading ? 'Registrando...' : 'Registrarse'}
                      </Button>
                    </Box>
                  </>
                )}

                {formPart === 2 && userType === 'proveedor' && (
                  <>
                    <Typography
                      variant='h6'
                      mb={3}
                      sx={{
                        fontWeight: 'bold',
                        color: 'primary.main',
                        textAlign: 'center',
                      }}
                    >
                      Detalles de Usuario
                    </Typography>
                    <Autocomplete
                      options={proveedores}
                      value={
                        proveedores.find(
                          (prov) => prov.nombre === formData.proveedor
                        ) || null
                      }
                      onChange={(_, value) =>
                        setFormData((prev) => ({
                          ...prev,
                          proveedor: value ? value.nombre : '',
                        }))
                      }
                      getOptionLabel={(option) => option.nombre}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Empresa'
                          margin='normal'
                          fullWidth
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'background.paper',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.nombre === (value?.nombre || value)
                      }
                    />
                    <TextField
                      fullWidth
                      label='Contraseña'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      margin='normal'
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                },
                              }}
                            >
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label='Confirmar Contraseña'
                      name='confirmPassword'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      margin='normal'
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                },
                              }}
                            >
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                      <Button
                        variant='outlined'
                        color='secondary'
                        fullWidth
                        onClick={() => setFormPart(1)}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: 1,
                          '&:hover': {
                            boxShadow: 2,
                          },
                        }}
                      >
                        Volver
                      </Button>
                      <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        fullWidth
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: 2,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {loading ? 'Registrando...' : 'Registrarse'}
                      </Button>
                    </Box>
                  </>
                )}
              </>
            )}

            {/* Formulario para empresa proveedora */}
            {userType === 'empresa_proveedora' && (
              <>
                {registrationStep === 'form' && (
                  <>
                    <TextField
                      fullWidth
                      label='Nombre de la Empresa'
                      name='nombre'
                      value={formData.nombre}
                      onChange={handleChange}
                      margin='normal'
                      required
                    />
                    <Autocomplete
                      options={paises}
                      value={formData.pais}
                      onChange={(_, value) =>
                        setFormData((prev) => ({
                          ...prev,
                          pais: value || '',
                        }))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='País'
                          margin='normal'
                          fullWidth
                          required
                        />
                      )}
                    />
                    <TextField
                      fullWidth
                      label='Correo Electrónico'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleChange}
                      margin='normal'
                      required
                    />
                    <TextField
                      fullWidth
                      label='Página Web'
                      name='paginaWeb'
                      value={formData.paginaWeb || ''}
                      onChange={handleChange}
                      margin='normal'
                      placeholder='ejemplo.com'
                      helperText="Puedes ingresar el dominio sin 'http://' o 'www'"
                    />
                    <TextField
                      fullWidth
                      label='Descripción de la Empresa'
                      name='descripcion'
                      value={formData.descripcion || ''}
                      onChange={handleChange}
                      margin='normal'
                      multiline
                      rows={4}
                      required
                    />
                    <Box
                      {...getRootProps()}
                      sx={{
                        textAlign: 'center',
                        padding: 2,
                        border: '2px dashed gray',
                        borderRadius: 2,
                        cursor: 'pointer',
                        marginTop: 2,
                        marginBottom: 4,
                        backgroundColor: '#fafafa',
                        transition: 'border .24s ease-in-out',
                        maxWidth: '400px',
                        margin: '2rem auto',
                        '&:hover': {
                          border: '2px dashed #1976d2',
                          backgroundColor: '#f0f7ff',
                        },
                      }}
                    >
                      <input {...getInputProps()} />
                      <Typography variant='subtitle1' gutterBottom>
                        Logo de la Empresa
                      </Typography>
                      {preview ? (
                        <Box>
                          <Avatar
                            src={preview}
                            sx={{
                              width: 100,
                              height: 100,
                              margin: 'auto',
                              mb: 2,
                            }}
                          />
                          <Typography variant='body2' color='textSecondary'>
                            Click o arrastra para cambiar el logo
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Avatar
                            sx={{
                              width: 100,
                              height: 100,
                              margin: 'auto',
                              mb: 2,
                            }}
                          />
                          <Typography variant='body1' gutterBottom>
                            Arrastra y suelta el logo aquí
                          </Typography>
                          <Typography variant='body2' color='textSecondary'>
                            o haz click para seleccionar
                          </Typography>
                          <Typography
                            variant='caption'
                            display='block'
                            color='textSecondary'
                            sx={{ mt: 1 }}
                          >
                            Formatos permitidos: JPG, PNG (Máx. 2MB)
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Button
                      type='submit'
                      variant='contained'
                      color='primary'
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Registrar Empresa'
                      )}
                    </Button>
                  </>
                )}

                {registrationStep === 'plan' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='h6' gutterBottom align='center'>
                      Selecciona tu Plan de Suscripción
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      align='center'
                      sx={{ mb: 3 }}
                    >
                      Elige el plan que mejor se adapte a tus necesidades.
                      Puedes cambiar o cancelar en cualquier momento.
                    </Typography>
                    <Grid container spacing={3} justifyContent='center'>
                      {plans.map((plan) => (
                        <Grid item xs={12} md={6} key={plan.id}>
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              border:
                                selectedPlan === plan.id
                                  ? '2px solid #1976d2'
                                  : 'none',
                              transition:
                                'transform 0.2s ease, box-shadow 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4,
                              },
                              position: 'relative',
                            }}
                          >
                            {plan.interval === 'year' && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 12,
                                  right: -32,
                                  transform: 'rotate(45deg)',
                                  backgroundColor: 'success.main',
                                  color: 'white',
                                  px: 4,
                                  py: 0.5,
                                  fontSize: '0.875rem',
                                  fontWeight: 'bold',
                                }}
                              >
                                MEJOR VALOR
                              </Box>
                            )}
                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                              <Typography
                                variant='h5'
                                component='div'
                                gutterBottom
                              >
                                {plan.name}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  mb: 2,
                                }}
                              >
                                <Typography
                                  variant='h3'
                                  color='primary'
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  ${plan.price}
                                </Typography>
                                <Typography
                                  variant='subtitle1'
                                  color='text.secondary'
                                  sx={{ ml: 1 }}
                                >
                                  /{plan.interval === 'month' ? 'mes' : 'año'}
                                </Typography>
                              </Box>
                              {plan.interval === 'year' && (
                                <Typography
                                  variant='subtitle1'
                                  color='success.main'
                                  gutterBottom
                                >
                                  ¡Ahorra $100 al año!
                                </Typography>
                              )}
                              <List>
                                {plan.features.map((feature, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
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
                            <CardActions sx={{ p: 2, pt: 0 }}>
                              <Button
                                fullWidth
                                variant={
                                  selectedPlan === plan.id
                                    ? 'contained'
                                    : 'outlined'
                                }
                                onClick={() => setSelectedPlan(plan.id)}
                                sx={{
                                  py: 1.5,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontSize: '1.1rem',
                                }}
                              >
                                {selectedPlan === plan.id
                                  ? 'Plan Seleccionado'
                                  : 'Seleccionar Plan'}
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    <Button
                      fullWidth
                      variant='contained'
                      sx={{
                        mt: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                      }}
                      disabled={!selectedPlan}
                      onClick={handleSubmit}
                    >
                      Continuar al Pago
                    </Button>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      align='center'
                      sx={{ mt: 2, display: 'block' }}
                    >
                      Pago seguro con Stripe. Puedes cancelar tu suscripción en
                      cualquier momento.
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </form>
        )}

        {message && (
          <Snackbar
            open
            autoHideDuration={6000}
            onClose={() => setMessage(null)}
          >
            <Alert
              onClose={() => setMessage(null)}
              severity={message.type}
              sx={{ width: '100%' }}
            >
              {message.text}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </Box>
  )
}

export default Register
