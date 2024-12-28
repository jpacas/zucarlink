import React from 'react'
import { Link } from 'react-router-dom'
import styles from './CallToAction.module.css'
import ctaImage from '../assets/images/Zucar-image.png' // Importar la imagen directamente

const CallToAction: React.FC = () => {
  return (
    <section className={styles.callToAction}>
      <div className={styles.container}>
        <div className={styles.textColumn}>
          <h2>Únete a Nuestra Comunidad</h2>
          <p>
            Descubre todas las oportunidades que tenemos para ti. Regístrate
            ahora y comienza tu viaje con nosotros.
          </p>
          <Link to='/register' className={styles.ctaButton}>
            Regístrate Ahora
          </Link>
        </div>
        <div className={styles.imageColumn}>
          <img src={ctaImage} alt='Call to Action' className={styles.image} />
        </div>
      </div>
    </section>
  )
}

export default CallToAction
