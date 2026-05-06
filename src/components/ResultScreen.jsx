import { motion } from 'framer-motion';
import { Trophy, Gift } from 'lucide-react';

const ResultScreen = ({ result, onRestart }) => {
  const { saves, total } = result || { saves: 0, total: 2 };
  
  // Condición de victoria: tapar los 2 goles
  const isWinner = saves >= total;

  return (
    <motion.div 
      className="result-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: isWinner ? [0, -10, 10, -10, 10, 0] : 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{ marginBottom: '2rem' }}
      >
        {isWinner ? (
          <Trophy color="var(--color-gold)" size={100} />
        ) : (
          <Gift color="var(--color-accent-teal)" size={100} />
        )}
      </motion.div>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: isWinner ? 'var(--color-gold)' : 'var(--color-white)' }}>
        {isWinner ? '¡ERES UN CAMPEÓN!' : '¡BUEN INTENTO!'}
      </h1>

      <div style={{ backgroundColor: 'var(--color-secondary)', padding: '1.5rem', borderRadius: '15px', width: '100%', marginBottom: '3rem' }}>
        <p style={{ fontSize: '1.2rem', margin: '0 0 1rem 0' }}>
          Lograste tapar <strong>{saves}</strong> de {total} penales.
        </p>
        
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-gold)' }}>
          {isWinner ? '¡Ganaste el Premio Mayor!' : '¡Te llevas un Premio de Consolación!'}
        </h2>
      </div>

      <motion.button 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onRestart} 
        className="btn-primary" 
        style={{ width: '100%' }}
      >
        Volver a Jugar
      </motion.button>
    </motion.div>
  );
};

export default ResultScreen;
