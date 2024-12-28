import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import CallToAction from './components/CallToAction'
import Benefits from './components/Benefits'
import Footer from './components/Footer'

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
        {/* Otras rutas */}
      </Routes>
    </Router>
  )
}

export default App
