import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import styles from './Navbar.module.css'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMenu = (): void => {
    setIsOpen(!isOpen)
  }

  const closeMenu = (): void => {
    setIsOpen(false)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to='/'>Zucarlink</Link>
      </div>
      {/* Icono Hamburguesa */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        <FaBars className={`${styles.icon} ${isOpen ? styles.hide : ''}`} />
      </div>
      {/* Contenedor del Menú */}
      <div className={`${styles.navLinks} ${isOpen ? styles.navOpen : ''}`}>
        {/* Icono para cerrar el menú (visible solo en pantallas menores a 768px) */}
        <div className={styles.closeIcon} onClick={closeMenu}>
          <FaTimes className={styles.icon} />
        </div>
        <ul>
          <li onClick={closeMenu}>
            <Link to='#home'>Inicio</Link>
          </li>
          <li onClick={closeMenu}>
            <Link to='#about'>Acerca de</Link>
          </li>
          <li onClick={closeMenu}>
            <Link to='#services'>Servicios</Link>
          </li>
          <li onClick={closeMenu}>
            <Link to='#contact'>Contacto</Link>
          </li>
          {isOpen && (
            <div className={styles.mobileButtons}>
              <Link
                to='/login'
                className={styles.mobileLogin}
                onClick={closeMenu}
              >
                Ingreso
              </Link>
              <Link
                to='/register'
                className={styles.mobileRegister}
                onClick={closeMenu}
              >
                Registro
              </Link>
            </div>
          )}
        </ul>
      </div>
      {/* Botones para pantallas grandes */}
      <div className={styles.buttons}>
        <Link to='/login' className={styles.login}>
          Ingreso
        </Link>
        <Link to='/register' className={styles.register}>
          Registro
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
