import { motion } from 'framer-motion';
import { ShieldCheck, Target, Trophy, HandMetal, MousePointer2, Zap } from 'lucide-react';
import { useState } from 'react';

const InstructionScreen = ({ onStart }) => {
  const [activeCard, setActiveCard] = useState(0);
  const [visitedCards, setVisitedCards] = useState(new Set([0])); // Marcar primera card como visitada

  const instructionCards = [
    {
      icon: MousePointer2,
      color: 'var(--color-gold)',
      title: 'PON A PRUEBA TU AGILIDAD VISUAL',
      sections: [
        { label: 'Desliza tu dedo', text: 'por la pantalla para mover los guantes' },
        { label: 'Cuando sueltes el dedo', text: 'esa será tu posición de atajada donde atraparás el tiro' }
      ]
    },
    {
      icon: Target,
      color: '#00D9FF',
      title: 'MISIÓN',
      sections: [
        { label: 'Tu objetivo:', text: 'Coloca los guantes exactamente donde crees que irá el balón antes de que termine el tiempo' },
        { label: '', text: '' }
      ]
    },
    {
      icon: Trophy,
      color: 'var(--color-gold)',
      title: 'PREMIOS',
      sections: [
        { label: '👕 Dos atajadas:', text: '1 camiseta para apoyar a la selección' },
        { label: '⚽ Una atajada:', text: 'Balón' },
        { label: '🥤 Sin atajadas:', text: 'Tomatodo' }
      ]
    }
  ];

  const currentCard = instructionCards[activeCard];
  const IconComponent = currentCard.icon;
  const allCardsVisited = visitedCards.size === instructionCards.length;

  const handleCardChange = (newIndex) => {
    setActiveCard(newIndex);
    setVisitedCards(prev => new Set([...prev, newIndex]));
  };

  return (
    <motion.div
      className="instruction-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      style={{ 
        padding: '1rem 1rem calc(1rem + env(safe-area-inset-bottom))', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflowY: 'auto', 
        justifyContent: 'flex-start',
        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))'
      }}
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
            {currentCard.sections.filter(section => section.label || section.text).map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <p style={{ margin: 0, lineHeight: 1.4, fontSize: '0.9rem' }}>
                  {section.label && <strong>{section.label} </strong>}{section.text}
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
            onClick={() => handleCardChange(idx)}
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
          onClick={() => handleCardChange(Math.max(0, activeCard - 1))}
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
          onClick={() => handleCardChange(Math.min(instructionCards.length - 1, activeCard + 1))}
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

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: allCardsVisited ? 1.05 : 1 }}
        whileTap={{ scale: allCardsVisited ? 0.95 : 1 }}
        onClick={onStart}
        disabled={!allCardsVisited}
        className="btn-primary"
        style={{ 
          width: '100%', 
          marginTop: '1rem', 
          marginBottom: '1rem',
          flexShrink: 0,
          fontWeight: 'bold',
          fontSize: '1.05rem',
          padding: '0.9rem',
          opacity: allCardsVisited ? 1 : 0.5,
          cursor: allCardsVisited ? 'pointer' : 'not-allowed'
        }}
      >
        {allCardsVisited ? '¡A JUGAR! →' : '👀 Lee todas las instrucciones'}
      </motion.button>
    </motion.div>
  );
};

export default InstructionScreen;
