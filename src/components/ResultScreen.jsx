import { motion } from 'framer-motion';
import { Trophy, Gift } from 'lucide-react';
import { getPrizeLabel } from '../utils/prize';

const ResultScreen = ({ result, submissionStatus, submissionMessage }) => {
  const { saves, total } = result || { saves: 0, total: 2 };
  
  // Condición de victoria: tapar los 2 goles
  const isWinner = saves >= total;
  const prizeLabel = getPrizeLabel(saves, total);

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

      <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: isWinner ? 'var(--color-gold)' : 'var(--color-white)', lineHeight: 1.1 }}>
        {isWinner ? '¡MANOS DE ACERO!' : '¡BUEN INTENTO!'}
      </h1>

      <div style={{ backgroundColor: 'var(--color-secondary)', padding: '1.5rem', borderRadius: '15px', width: '100%', marginBottom: '3rem' }}>
        <p style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
          {isWinner 
            ? `¡Increíble reflejos! Has defendido el arco como un profesional.`
            : `Lograste tapar ${saves} de ${total} penales. ¡Nada mal!`}
        </p>
        
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'var(--color-gold)' }}>
          {isWinner ? '¡Premio Mayor!' : '¡Premio!'}
        </h2>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--color-white)', margin: 0, fontWeight: 600 }}>
          {prizeLabel}
        </p>

        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.78)', margin: '0.75rem 0 0', lineHeight: 1.4 }}>
          {submissionStatus === 'saving' && 'Guardando tu registro en Firebase...'}
          {submissionStatus === 'success' && submissionMessage}
          {submissionStatus === 'error' && submissionMessage}
        </p>
      </div>

    </motion.div>
  );
};

export default ResultScreen;
