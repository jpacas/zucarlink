import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import { ChatLayout } from './components/ChatLayout'
import { Box, CircularProgress } from '@mui/material'

// Componentes que se cargan siempre (pequeños, necesarios para navegación)
import Navbar from './components/Navbar'
import Login from './pages/Login'
import CallToAction from './components/CallToAction'
import Benefits from './components/Benefits'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Contact from './components/Contact'
import RegistroExitoso from './pages/RegistroExitoso'
import ResetPassword from './pages/ResetPassword'

// Lazy loading para páginas grandes (mejora tiempo de carga inicial)
const Register = lazy(() => import('./pages/Register'))
const Directorio = lazy(() => import('./pages/Directorio'))
const DirectorioSelector = lazy(() => import('./pages/DirectorioSelector'))
const Perfil = lazy(() => import('./components/Perfil'))
const PerfilProveedor = lazy(() => import('./components/PerfilProveedor'))
const Foro = lazy(() => import('./pages/Foro'))
const Servicios = lazy(() => import('./pages/Servicios'))
const ZucarIA = lazy(() => import('./pages/ZucarIA'))
const PolPrivacidad = lazy(() => import('./pages/PolPrivacidad'))
const TerminosUso = lazy(() => import('./pages/TerminosUso'))
const EditarPerfil = lazy(() => import('./components/EditarPerfil'))
const PostDetalle = lazy(() => import('./pages/PostDetalle'))
const Empleos = lazy(() => import('./pages/Empleos'))
const EmpleoDetalle = lazy(() => import('./pages/EmpleoDetalle'))
const Maquinarias = lazy(() => import('./pages/Maquinarias'))
const MaquinariaDetalle = lazy(() => import('./pages/MaquinariaDetalle'))
const MiSuscripcion = lazy(() => import('./pages/MiSuscripcion'))
const UpgradePro = lazy(() => import('./pages/UpgradePro'))
const PerfilPublico = lazy(() => import('./pages/PerfilPublico'))
const Wiki = lazy(() => import('./pages/Wiki'))
const WikiArticuloPage = lazy(() => import('./pages/WikiArticulo'))
const EditarWikiArticulo = lazy(() => import('./pages/EditarWikiArticulo'))
const AnalyticsEmpresa = lazy(() => import('./pages/AnalyticsEmpresa'))

// Componente de loading para Suspense
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
    }}
  >
    <CircularProgress />
  </Box>
)

const App: React.FC = () => {
  return (
    <HelmetProvider>
    <SnackbarProvider maxSnack={3} autoHideDuration={3000} preventDuplicate>
      <Router>
        <AuthProvider>
          <ChatProvider>
            <ChatLayout>
              <Navbar />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route
                    path='/'
                    element={
                      <>
                        <CallToAction />
                        <Benefits />
                        <Footer />
                      </>
                    }
                  ></Route>
                  <Route path='/register' element={<Register />} />
                  <Route path='/login' element={<Login />} />
                  <Route
                    path='/reset-password/:token'
                    element={<ResetPassword />}
                  />
                  <Route path='/contact' element={<Contact />} />
                  <Route path='/services' element={<Servicios />} />
                  <Route path='/privacidad' element={<PolPrivacidad />} />
                  <Route path='/uso' element={<TerminosUso />} />
                  <Route path='/empleos' element={<Empleos />} />
                  <Route path='/empleos/:empleoId' element={<EmpleoDetalle />} />
                  <Route path='/maquinarias' element={<Maquinarias />} />
                  <Route
                    path='/maquinarias/:maquinariaId'
                    element={<MaquinariaDetalle />}
                  />
                  <Route path='/registro-exitoso' element={<RegistroExitoso />} />
                  <Route path='/directorio' element={<DirectorioSelector />} />
                  <Route path='/directorio/:tipo' element={<Directorio />} />
                  <Route
                    path='/perfil/:id'
                    element={
                      <ProtectedRoute>
                        <Perfil />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/perfil-proveedor/:id'
                    element={
                      <ProtectedRoute>
                        <PerfilProveedor />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/editar-perfil/:id'
                    element={
                      <ProtectedRoute>
                        <EditarPerfil />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/foro'
                    element={
                      <ProtectedRoute>
                        <Foro />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/zucaria'
                    element={
                      <ProtectedRoute>
                        <ZucarIA />
                      </ProtectedRoute>
                    }
                  />
                  <Route path='/foro/post/:postId' element={<PostDetalle />} />
                  <Route
                    path='/mi-suscripcion'
                    element={
                      <ProtectedRoute>
                        <MiSuscripcion />
                      </ProtectedRoute>
                    }
                  />
                  <Route path='/upgrade-pro' element={<UpgradePro />} />
                  <Route path='/ingenieros/:username' element={<PerfilPublico />} />
                  <Route path='/wiki' element={<Wiki />} />
                  <Route path='/wiki/:slug' element={<WikiArticuloPage />} />
                  <Route
                    path='/wiki/:slug/editar'
                    element={
                      <ProtectedRoute>
                        <EditarWikiArticulo />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/mi-empresa/analytics'
                    element={
                      <ProtectedRoute>
                        <AnalyticsEmpresa />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </ChatLayout>
          </ChatProvider>
        </AuthProvider>
      </Router>
    </SnackbarProvider>
    </HelmetProvider>
  )
}

export default App
