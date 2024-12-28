import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import styles from './Footer.module.css'

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h4 className={styles.title}>Contáctanos</h4>
          <p>Email: contacto@tuapp.com</p>
          <p>Teléfono: +1 (234) 567-890</p>
        </div>
        <div className={styles.section}>
          <h4 className={styles.title}>Enlaces</h4>
          <ul className={styles.links}>
            <li>
              <a href='/privacy-policy'>Política de Privacidad</a>
            </li>
            <li>
              <a href='/terms-of-use'>Términos de Uso</a>
            </li>
          </ul>
        </div>
        <div className={styles.section}>
          <h4 className={styles.title}>Síguenos</h4>
          <div className={styles.socialLinks}>
            <a
              href='https://facebook.com'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaFacebook className={styles.icon} />
            </a>
            <a
              href='https://twitter.com'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaTwitter className={styles.icon} />
            </a>
            <a
              href='https://instagram.com'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaInstagram className={styles.icon} />
            </a>
            <a
              href='https://linkedin.com'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaLinkedin className={styles.icon} />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.copy}>
        <p>
          © {new Date().getFullYear()} Tu App. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
