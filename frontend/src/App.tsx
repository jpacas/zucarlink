import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import CallToAction from './components/CallToAction'
import Benefits from './components/Benefits'
import Footer from './components/Footer'
import Directorio from './pages/Directorio'
import ProtectedRoute from './components/ProtectedRoute'
import Perfil from './components/Perfil'
import Foro from './pages/Foro'
import Contact from './components/Contact'

const App: React.FC = () => {
  return (
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
        <Route
          path='/directorio'
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
          path='/foro'
          element={
            <ProtectedRoute>
              <Foro />
            </ProtectedRoute>
          }
        />
        {/* Otras rutas */}
      </Routes>
    </Router>
  )
}

export default App
