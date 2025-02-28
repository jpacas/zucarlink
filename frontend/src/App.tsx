import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import CallToAction from './components/CallToAction'
import Benefits from './components/Benefits'
import Footer from './components/Footer'
import Directorio from './pages/Directorio'
import DirectorioSelector from './pages/DirectorioSelector'
import ProtectedRoute from './components/ProtectedRoute'
import Perfil from './components/Perfil'
import Foro from './pages/Foro'
import Contact from './components/Contact'
import Servicios from './pages/Servicios'
import ZucarIA from './pages/ZucarIA'
import PolPrivacidad from './pages/PolPrivacidad'
import TerminosUso from './pages/TerminosUso'
import EditarPerfil from './components/EditarPerfil'
import PostDetalle from './pages/PostDetalle'
import { SnackbarProvider } from 'notistack'
/* import Empleos from './pages/Empleos'
import Maquinarias from './pages/Maquinarias' */
import RegistroExitoso from './pages/RegistroExitoso'

const App: React.FC = () => {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000} preventDuplicate>
      <Router>
        <Navbar />
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
          <Route path='/contact' element={<Contact />} />
          <Route path='/services' element={<Servicios />} />
          <Route path='/privacidad' element={<PolPrivacidad />} />
          <Route path='/uso' element={<TerminosUso />} />
          {/*   <Route path='/empleo' element={<Empleos />} />
          <Route path='/maquinaria' element={<Maquinarias />} /> */}
          <Route path='/registro-exitoso' element={<RegistroExitoso />} />
          <Route
            path='/directorio'
            element={
              <ProtectedRoute>
                <DirectorioSelector />
              </ProtectedRoute>
            }
          />
          <Route
            path='/directorio/:tipo'
            element={
              <ProtectedRoute>
                <Directorio />
              </ProtectedRoute>
            }
          />
          <Route
            path='/perfil/:id'
            element={
              <ProtectedRoute>
                <Perfil />
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
        </Routes>
      </Router>
    </SnackbarProvider>
  )
}

export default App
