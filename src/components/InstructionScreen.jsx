import { motion } from 'framer-motion';
import { ShieldCheck, Target, Trophy } from 'lucide-react';

const InstructionScreen = ({ onStart }) => {
  return (
    <motion.div 
      className="instruction-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', justifyContent: 'flex-start' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '0.5rem', marginTop: '0.5rem', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>CÓMO JUGAR</h2>
        <p style={{ color: 'var(--color-accent-teal)', fontSize: '1rem', margin: 0 }}>Ponte los guantes y defiende tu arco</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', flexShrink: 0 }}>
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'var(--color-secondary)', padding: '0.6rem', borderRadius: '12px' }}
        >
          <Target color="var(--color-gold)" size={24} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, lineHeight: 1.3, fontSize: '0.9rem' }}>Toca la zona <strong>izquierda, centro o derecha</strong> para mover los guantes. Puedes cambiar de posición durante el conteo. Una vez se termine el conteo ya no podrás cambiar el lugar.</p>
        </motion.div>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'var(--color-secondary)', padding: '0.6rem', borderRadius: '12px' }}
        >
          <ShieldCheck color="var(--color-green)" size={24} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, lineHeight: 1.3, fontSize: '0.9rem' }}>¡Pon a prueba tu agilidad visual! Durante el conteo, un balón transparente saltará entre las posiciones. Su <strong>última posición</strong> indica hacia dónde irá el tiro.</p>
        </motion.div>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'var(--color-secondary)', padding: '0.6rem', borderRadius: '12px' }}
        >
          <Trophy color="var(--color-gold)" size={24} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, lineHeight: 1.3, fontSize: '0.9rem' }}>
            Tendrás que atajar 2 tiros.<br />
            Premios:<br />
            2 tiros: 1 camiseta<br />
            1 tiro: 1 balón ⚽<br />
            0 tiros: Tomatodo
          </p>
        </motion.div>
      </div>

      <motion.button 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onStart} 
        className="btn-primary" 
        style={{ width: '100%', marginTop: '1rem', marginBottom: '2rem', flexShrink: 0 }}
      >
        ¡A Jugar!
      </motion.button>
    </motion.div>
  );
};

export default InstructionScreen;
