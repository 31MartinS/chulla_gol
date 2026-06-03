import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onStart }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTap = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Esperar 1 segundo antes de cambiar de pantalla para que la música empiece a sonar
    setTimeout(() => {
      onStart();
    }, 1000);
  };

  return (
    <motion.div 
      className="splash-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleTap}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '1rem',
        textAlign: 'center',
        cursor: 'pointer',
        overflowY: 'auto'
      }}
    >
      {/* Fondo del Estadio (pantalla inicio) */}
      <img 
        src="/assets/fondo_estadio_inicio.svg" 
        alt="Fondo Estadio Inicio" 
        style={{ position: 'absolute', top: 0, left: '-15%', width: '130%', height: '100%', objectFit: 'cover', zIndex: 0}} 
      />

      {/* Overlay para mejorar legibilidad de textos e imágenes */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(2,18,38,0.7) 0%, rgba(2,18,38,0.35) 40%, rgba(2,18,38,0.6) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0 0.5rem' }}>
        <motion.img 
          src="/assets/hernan.svg" 
          alt="Hernán Galíndez" 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: '30vh', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', 
            color: 'var(--color-gold)', 
            margin: '0', 
            lineHeight: 1.2,
            textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
            wordBreak: 'break-word',
            padding: '0 0.5rem'
          }}>
            ¡CONVIÉRTETE EN LAS MANOS DE LA TRI!
          </h1>
        </motion.div>

        <AnimatePresence>
          {!isTransitioning && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ delay: 1, repeat: Infinity, duration: 1.5 }}
              style={{ color: 'var(--color-white)', fontSize: '1.2rem', marginTop: '2rem', textShadow: '1px 1px 3px rgba(0,0,0,1)' }}
            >
              Toca la pantalla para comenzar
            </motion.p>
          )}
        </AnimatePresence>
        
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: '2rem' }}
          >
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid var(--color-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SplashScreen;
