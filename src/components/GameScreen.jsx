import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GameScreen = ({ onEnd }) => {
  const TOTAL_SHOTS = 2;
  const [currentShot, setCurrentShot] = useState(1);
  const [saves, setSaves] = useState(0);
  const [results, setResults] = useState([]); // Array of 'save' or 'goal'
  
  const [gameState, setGameState] = useState('IDLE'); // IDLE, COUNTDOWN, SHOOTING, ROUND_RESULT
  const [glovePosition, setGlovePosition] = useState('center'); // left, right, center
  const [ballPosition, setBallPosition] = useState('center'); // left, right, center
  const [countdown, setCountdown] = useState(3);
  const [message, setMessage] = useState('Toca un lado para empezar');
  const [ghostBallPos, setGhostBallPos] = useState('center'); // left, center, right

  // Referencias de Audio
  const whistleAudio = useRef(null);
  const kickAudio = useRef(null);
  const errorAudio = useRef(null);
  const winAudio = useRef(null);

  useEffect(() => {
    whistleAudio.current = new Audio('/sounds/wisper.mp3');
    kickAudio.current = new Audio('/sounds/soccer-ball-kick.mp3');
    errorAudio.current = new Audio('/sounds/error.mp3');
    winAudio.current = new Audio('/sounds/win.mp3');
  }, []);

  const resetRound = useCallback(() => {
    setGameState('IDLE');
    setGlovePosition('center');
    setBallPosition('center');
    setMessage('Toca un lado para empezar');
  }, []);

  const startCountdown = useCallback(() => {
    setGameState('COUNTDOWN');
    setCountdown(3);
    setMessage('¡Prepárate!');
    
    // Suena el silbato al iniciar la cuenta
    if (whistleAudio.current) {
      whistleAudio.current.currentTime = 0;
      whistleAudio.current.play().catch(e => console.log('Audio error:', e));
      
      // Detenemos el silbato automáticamente después de 800ms (0.8 segundos)
      setTimeout(() => {
        if (whistleAudio.current) {
          whistleAudio.current.pause();
        }
      }, 800);
    }
  }, []);

  const handleTouch = (side) => {
    // Bloquear los guantes si ya se pateó el balón o se está mostrando el resultado
    if (gameState === 'ROUND_RESULT' || gameState === 'SHOOTING') return;
    
    setGlovePosition(side);

    if (gameState === 'IDLE') {
      startCountdown();
    }
  };

  const glovePosRef = useRef(glovePosition);
  useEffect(() => {
    glovePosRef.current = glovePosition;
  }, [glovePosition]);

  const ghostBallPosRef = useRef(ghostBallPos);
  useEffect(() => {
    ghostBallPosRef.current = ghostBallPos;
  }, [ghostBallPos]);

  const currentShotRef = useRef(currentShot);
  useEffect(() => {
    currentShotRef.current = currentShot;
  }, [currentShot]);

  const savesRef = useRef(saves);
  useEffect(() => {
    savesRef.current = saves;
  }, [saves]);

  const evaluateResult = useCallback((actualBallPos) => {
    setGameState('ROUND_RESULT');
    const isSave = glovePosRef.current === actualBallPos;
    
    if (isSave) {
      setSaves(prev => prev + 1);
      setResults(prev => [...prev, 'save']);
      setMessage('¡TAPADÓN!');
      if (winAudio.current) {
        winAudio.current.currentTime = 0;
        winAudio.current.play().catch(e=>console.log(e));
      }
    } else {
      setResults(prev => [...prev, 'goal']);
      setMessage('¡GOL!');
      if (errorAudio.current) {
        errorAudio.current.currentTime = 0;
        errorAudio.current.play().catch(e=>console.log(e));
      }
    }

    setTimeout(() => {
      if (currentShotRef.current < TOTAL_SHOTS) {
        setCurrentShot(prev => prev + 1);
        resetRound();
      } else {
        onEnd({ saves: savesRef.current, total: TOTAL_SHOTS });
      }
    }, 4000);
  }, [onEnd, resetRound]);

  const shootBall = useCallback(() => {
    // La dirección del balón es exactamente la última posición del balón fantasma
    const targetDir = ghostBallPosRef.current;

    setGameState('SHOOTING');
    setMessage('¡Disparo!'); 
    
    // Sonido de patada
    if (kickAudio.current) {
      kickAudio.current.currentTime = 0;
      kickAudio.current.play().catch(e => console.log('Audio error:', e));
    }

    setBallPosition(targetDir);

    // Tiempo de vuelo del balón
    setTimeout(() => {
      evaluateResult(targetDir);
    }, 800);
  }, [evaluateResult]);

  useEffect(() => {
    let timer;
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        // Ejecutamos en el siguiente ciclo para evitar render en cascada
        setTimeout(() => {
          shootBall();
        }, 0);
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown, shootBall]);

  useEffect(() => {
    let timerId;
    if (gameState === 'COUNTDOWN') {
      const sequence = ['left', 'right', 'center'];
      let index = 0;
      let currentDelay = 700; // Inicia lento
      const minDelay = 120;   // Velocidad máxima
      
      const moveBall = () => {
        setGhostBallPos(sequence[index % sequence.length]);
        index++;
        
        // Acelerar reduciendo el retraso en un 20% en cada salto
        if (currentDelay > minDelay) {
          currentDelay = Math.max(minDelay, currentDelay * 0.8);
        }
        
        timerId = setTimeout(moveBall, currentDelay);
      };
      
      // Iniciar el primer movimiento rápido para que comience la secuencia
      timerId = setTimeout(moveBall, 50);
    }
    return () => clearTimeout(timerId);
  }, [gameState]);

  const renderHUD = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
        {[...Array(TOTAL_SHOTS)].map((_, i) => {
          let bgColor = 'rgba(255,255,255,0.2)';
          if (results[i] === 'save') bgColor = 'var(--color-green)';
          if (results[i] === 'goal') bgColor = 'var(--color-red)';
          return (
            <motion.div 
              key={i}
              initial={false}
              animate={{ backgroundColor: bgColor }}
              style={{ width: 'clamp(20px, 5vw, 24px)', height: 'clamp(20px, 5vw, 24px)', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            />
          );
        })}
      </div>
    );
  };

  // Balón
  const getBallAnim = () => {
    const isSave = glovePosition === ballPosition;
    if (gameState === 'IDLE' || gameState === 'COUNTDOWN') {
      return { scale: 0.15, top: '40%', left: '50%', opacity: 1 };
    }
    if (gameState === 'SHOOTING') {
      return { scale: 1.5, top: '80%', left: ballPosition === 'left' ? '20%' : ballPosition === 'right' ? '80%' : '50%', opacity: 1 };
    }
    if (gameState === 'ROUND_RESULT') {
      if (isSave) {
        return { scale: 1.5, top: '75%', left: ballPosition === 'left' ? '15%' : ballPosition === 'right' ? '85%' : '50%', opacity: 1 };
      } else {
        return { scale: 3, top: '130%', left: ballPosition === 'left' ? '10%' : ballPosition === 'right' ? '90%' : '50%', opacity: 0 };
      }
    }
    return { scale: 0.15, top: '40%', left: '50%' };
  };

  // Pateador
  const getKickerImage = () => {
    if (gameState === 'IDLE' || gameState === 'COUNTDOWN') {
      return '/assets/pateador_inicio.svg';
    }
    if (gameState === 'SHOOTING') {
      return '/assets/pateador_patea.svg';
    }
    if (gameState === 'ROUND_RESULT') {
      const isSave = glovePosition === ballPosition;
      return isSave ? '/assets/pateador_fallo.svg' : '/assets/pateador_gol.svg';
    }
    return '/assets/pateador_inicio.svg';
  };

  return (
    <motion.div 
      className="game-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Fondo del Estadio */}
      <img 
        src="/assets/fondo_estadio.svg" 
        alt="Fondo Estadio" 
        style={{ position: 'absolute', top: 0, left: '-20%', width: '140%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
      />

      {/* HUD Header */}
      <div style={{ 
        padding: 'calc(10px + env(safe-area-inset-top)) 10px 10px 10px', 
        textAlign: 'center', 
        zIndex: 10, 
        position: 'relative',
        background: 'linear-gradient(to bottom, rgba(2, 18, 38, 0.85) 0%, rgba(2, 18, 38, 0) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 4vw, 1.2rem)', textShadow: '2px 2px 4px rgba(0,0,0,1)' }}>Tiro {currentShot} de {TOTAL_SHOTS}</h3>
        {renderHUD()}
        <h2 style={{ 
          color: 'var(--color-gold)', 
          margin: 0, 
          minHeight: '60px', 
          fontSize: (gameState === 'COUNTDOWN' && countdown > 0) ? 'clamp(4rem, 15vw, 6rem)' : 'clamp(1.5rem, 6vw, 2rem)', 
          textShadow: '3px 3px 8px rgba(0,0,0,1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 900
        }}>
          {gameState === 'COUNTDOWN' && countdown > 0 ? countdown : message}
        </h2>
      </div>

      {/* Game Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* Balón Fantasma */}
        <AnimatePresence>
          {gameState === 'COUNTDOWN' && (
            <motion.img
              key="ghost-ball"
              src="/assets/balon.svg"
              initial={{ scale: 1.2, top: '60%', left: '50%', opacity: 0 }}
              animate={{
                scale: 1.2,
                top: '60%',
                left: ghostBallPos === 'left' ? '20%' : ghostBallPos === 'right' ? '80%' : '50%',
                opacity: 0.6
              }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                position: 'absolute',
                marginLeft: '-35px',
                marginTop: '-35px',
                width: '70px',
                height: '70px',
                zIndex: 3,
                filter: 'drop-shadow(0px 5px 10px rgba(255, 255, 255, 0.8)) hue-rotate(90deg)' // Tinte para distinguirlo del real
              }}
            />
          )}
        </AnimatePresence>

        {/* Zonas táctiles */}
        <div 
          onClick={() => handleTouch('left')}
          style={{ position: 'absolute', top: 0, left: 0, width: '33.3%', height: '100%', zIndex: 20, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px dashed rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textShadow: '1px 1px 2px black', fontWeight: 'bold' }}>IZQ</span>
          </div>
        </div>
        <div 
          onClick={() => handleTouch('center')}
          style={{ position: 'absolute', top: 0, left: '33.3%', width: '33.3%', height: '100%', zIndex: 20, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px dashed rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textShadow: '1px 1px 2px black', fontWeight: 'bold' }}>CEN</span>
          </div>
        </div>
        <div 
          onClick={() => handleTouch('right')}
          style={{ position: 'absolute', top: 0, right: 0, width: '33.3%', height: '100%', zIndex: 20, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px dashed rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textShadow: '1px 1px 2px black', fontWeight: 'bold' }}>DER</span>
          </div>
        </div>

        {/* Pateador */}
        <div style={{ position: 'absolute', top: '15%', left: '0', width: '100%', height: '50%', display: 'flex', justifyContent: 'center', zIndex: 2 }}>
          <img 
            src={getKickerImage()} 
            alt="Pateador" 
            style={{ height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Balón */}
        <AnimatePresence>
          <motion.img
            key="ball"
            src="/assets/balon.svg"
            initial={{ scale: 0.15, top: '40%', left: '50%', opacity: 1 }}
            animate={getBallAnim()}
            transition={{ 
              duration: gameState === 'SHOOTING' ? 0.8 : (gameState === 'ROUND_RESULT' ? 0.3 : 0.4), 
              ease: gameState === 'SHOOTING' ? "easeIn" : "easeOut" 
            }}
            style={{
              position: 'absolute',
              marginLeft: '-35px', // Mitad del ancho
              marginTop: '-35px', // Mitad del alto
              width: '70px',
              height: '70px',
              zIndex: 4,
              filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))'
            }}
          />
        </AnimatePresence>

        {/* Guantes */}
        <motion.div
          animate={{
            x: glovePosition === 'left' ? '-90%' : glovePosition === 'right' ? '90%' : '0%',
            y: glovePosition === 'center' ? '20%' : '0%'
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: 'calc(50% - 75px)',
            width: '150px',
            height: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5
          }}
        >
          <img 
            src="/assets/guantes.svg" 
            alt="Guantes" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0px -5px 10px rgba(0,0,0,0.6))' }} 
          />
        </motion.div>

      </div>
    </motion.div>
  );
};

export default GameScreen;
