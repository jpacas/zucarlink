import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import styles from './Footer.module.css'

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h4 className={styles.title}>Contáctanos</h4>
          <p>Email: zucarlink@gmail.com</p>
          <p>Teléfono: (503) 7069-4907</p>
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
              href='https://www.facebook.com/ZucarLink'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaFacebook className={styles.icon} />
            </a>
            <a
              href='https://x.com/ZucarLink'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaTwitter className={styles.icon} />
            </a>
            <a
              href='https://www.instagram.com/zucarlink'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaInstagram className={styles.icon} />
            </a>
            <a
              href='https://www.linkedin.com/company/zucarlink'
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
          © {new Date().getFullYear()} Zucarlink. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
