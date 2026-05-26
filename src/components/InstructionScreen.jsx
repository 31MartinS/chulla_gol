import { motion } from 'framer-motion';
import { ShieldCheck, Target, Trophy, HandMetal, MousePointer2, Zap } from 'lucide-react';
import { useState } from 'react';

const InstructionScreen = ({ onStart }) => {
  const [activeCard, setActiveCard] = useState(0);

  const instructionCards = [
    {
      icon: MousePointer2,
      color: 'var(--color-gold)',
      title: 'MUEVE TU DEDO EN LA CANCHA',
      sections: [
        { label: '👆 Arrastra:', text: 'Desliza tu dedo por la pantalla para mover los guantes donde quieras.' },
        { label: '✋ Suelta:', text: 'Cuando sueltes el dedo, esa será tu posición de atajada para ese tiro.' }
      ]
    },
    {
      icon: Zap,
      color: '#00D9FF',
      title: 'EL JUEGO EN ACCIÓN',
      sections: [
        { label: '👁️ Verás un conteo:', text: 'Un balón fantasma se moverá a través de la cancha mostrando dónde viene el tiro.' },
        { label: '🎯 Tu misión:', text: 'Coloca los guantes EXACTAMENTE donde crees que saldrá el disparo. Solo posicionamiento, sin botones.' },
        { label: '⏱️ Tiempo crucial:', text: 'Tienes el tiempo del conteo para posicionar correctamente. Donde los dejes cuando termine, ahí atajarás.' }
      ]
    },
    {
      icon: Trophy,
      color: 'var(--color-gold)',
      title: 'CÓMO GANAR PREMIOS',
      sections: [
        { label: '⚽ Dos tiros totales:', text: 'Enfrentarás 2 disparos diferentes durante el juego.' },
        { label: '✅ Un acierto = Una atajada:', text: 'Cada balón que detengas cuenta como un acierto.' },
        { label: '🎁 Tu premio depende de ti:', text: 'Mientras más atajadas logres, mejor es tu recompensa. ¿Serás imparable?' }
      ]
    },
    {
      icon: HandMetal,
      color: '#00D9FF',
      title: 'TIPS PARA GANAR',
      sections: [
        { label: '👁️ Observa el balón:', text: 'Sigue el movimiento del balón fantasma para predecir dónde irá el tiro real.' },
        { label: '⚡ Sé rápido pero preciso:', text: 'No necesitas ser perfecto, pero cuanto más cerca estés del balón, mejor.' },
        { label: '🔄 No te muevas al final:', text: 'Evita mover los guantes en el último segundo. Mantén la posición que elegiste.' }
      ]
    }
  ];

  const currentCard = instructionCards[activeCard];
  const IconComponent = currentCard.icon;

  return (
    <motion.div
      className="instruction-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', justifyContent: 'flex-start' }}
    >
      {/* Encabezado principal */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: 'center', marginBottom: '1rem', flexShrink: 0 }}
      >
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem', letterSpacing: '0.02em', fontWeight: 'bold' }}>🥅 CÓMO JUGAR</h2>
        <p style={{ color: 'var(--color-accent-teal)', fontSize: '0.95rem', margin: 0, lineHeight: 1.4 }}>
          Eres el arquero. Los guantes son tus manos. ¡Atrapa todos los tiros!
        </p>
      </motion.div>

      {/* Imagen del portero */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0 1rem 0', flexShrink: 0 }}
      >
        <motion.img 
          src="/assets/galindez.svg" 
          alt="Hernán Galíndez" 
          style={{ maxHeight: '220px', objectFit: 'contain' }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      {/* Tarjeta de instrucción activa */}
      <motion.div
        key={activeCard}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3 }}
        style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '0.9rem', 
          backgroundColor: 'var(--color-secondary)', 
          padding: '1rem', 
          borderRadius: '16px',
          marginBottom: '0.8rem',
          border: `2px solid ${currentCard.color}`,
          flexShrink: 0
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ flexShrink: 0 }}
        >
          <IconComponent color={currentCard.color} size={32} style={{ marginTop: '4px' }} />
        </motion.div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '1.1rem', color: currentCard.color }}>
            {currentCard.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentCard.sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <p style={{ margin: 0, lineHeight: 1.4, fontSize: '0.9rem' }}>
                  <strong>{section.label}</strong> {section.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Indicadores de navegación */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '1rem', flexShrink: 0 }}>
        {instructionCards.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setActiveCard(idx)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeCard === idx ? 'var(--color-accent-teal)' : 'var(--color-secondary)',
              transition: 'background-color 0.3s',
              padding: 0
            }}
          />
        ))}
      </div>

      {/* Controles de navegación */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', flexShrink: 0 }}>
        <motion.button
          onClick={() => setActiveCard(Math.max(0, activeCard - 1))}
          disabled={activeCard === 0}
          whileHover={{ scale: activeCard === 0 ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            flex: 1,
            padding: '0.7rem',
            backgroundColor: activeCard === 0 ? 'var(--color-secondary)' : 'transparent',
            border: `2px solid ${activeCard === 0 ? 'var(--color-secondary)' : 'var(--color-accent-teal)'}`,
            borderRadius: '10px',
            color: 'var(--color-accent-teal)',
            cursor: activeCard === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            opacity: activeCard === 0 ? 0.5 : 1
          }}
        >
          ← Anterior
        </motion.button>

        <motion.button
          onClick={() => setActiveCard(Math.min(instructionCards.length - 1, activeCard + 1))}
          disabled={activeCard === instructionCards.length - 1}
          whileHover={{ scale: activeCard === instructionCards.length - 1 ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            flex: 1,
            padding: '0.7rem',
            backgroundColor: activeCard === instructionCards.length - 1 ? 'var(--color-secondary)' : 'transparent',
            border: `2px solid ${activeCard === instructionCards.length - 1 ? 'var(--color-secondary)' : 'var(--color-accent-teal)'}`,
            borderRadius: '10px',
            color: 'var(--color-accent-teal)',
            cursor: activeCard === instructionCards.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            opacity: activeCard === instructionCards.length - 1 ? 0.5 : 1
          }}
        >
          Siguiente →
        </motion.button>
      </div>

      {/* Botón principal */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="btn-primary"
        style={{ 
          width: '100%', 
          marginTop: 'auto', 
          marginBottom: '1.5rem', 
          flexShrink: 0,
          fontWeight: 'bold',
          fontSize: '1.05rem',
          padding: '0.9rem'
        }}
      >
        ¡Listo! A atajadas →
      </motion.button>
    </motion.div>
  );
};

export default InstructionScreen;
