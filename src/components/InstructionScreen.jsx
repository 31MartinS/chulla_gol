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
      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>CÓMO JUGAR</h2>
        <p style={{ color: 'var(--color-accent-teal)', fontSize: '1.1rem' }}>Ponte los guantes y defiende tu arco</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-secondary)', padding: '1rem', borderRadius: '12px' }}
        >
          <Target color="var(--color-gold)" size={32} />
          <p style={{ margin: 0, lineHeight: 1.4 }}>Toca el lado <strong>izquierdo o derecho</strong> de la pantalla para mover los guantes a esa dirección.</p>
        </motion.div>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-secondary)', padding: '1rem', borderRadius: '12px' }}
        >
          <ShieldCheck color="var(--color-green)" size={32} />
          <p style={{ margin: 0, lineHeight: 1.4 }}>Adivina la dirección del balón (son <strong>2 tiros</strong> en total).</p>
        </motion.div>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-secondary)', padding: '1rem', borderRadius: '12px' }}
        >
          <Trophy color="var(--color-gold)" size={32} />
          <p style={{ margin: 0, lineHeight: 1.4 }}>Tapa los <strong>2 goles</strong> para ganar el premio mayor. ¡Si no, te llevas el de consolación!</p>
        </motion.div>
      </div>

      <motion.button 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onStart} 
        className="btn-primary" 
        style={{ width: '100%', marginTop: 'auto', marginBottom: '2rem' }}
      >
        ¡A Jugar!
      </motion.button>
    </motion.div>
  );
};

export default InstructionScreen;
