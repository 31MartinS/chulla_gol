import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GameScreen = ({ onEnd }) => {
  const TOTAL_SHOTS = 2;
  const [currentShot, setCurrentShot] = useState(1);
  const [saves, setSaves] = useState(0);
  const [results, setResults] = useState([]); // Array of 'save' or 'goal'

  const [gameState, setGameState] = useState('IDLE'); // IDLE, GHOST_MOVING, COUNTDOWN, SHOOTING, ROUND_RESULT
  const [glovePosition, setGlovePosition] = useState('center'); // left, right, center
  const [ballPosition, setBallPosition] = useState('center'); // left, right, center
  const [countdown, setCountdown] = useState(3);
  const [message, setMessage] = useState('Toca la pantalla para empezar');
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
    setMessage('Toca la pantalla para empezar');
  }, []);

  const startGhostMoving = useCallback(() => {
    setGameState('GHOST_MOVING');
    setMessage('¡Atento al balón!');
  }, []);

  const handleTouch = (side) => {
    if (gameState === 'IDLE') {
      startGhostMoving();
      return;
    }

    // Bloquear los guantes si no estamos en COUNTDOWN
    if (gameState !== 'COUNTDOWN') return;

    setGlovePosition(side);
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
        winAudio.current.play().catch(e => console.log(e));
      }
    } else {
      setResults(prev => [...prev, 'goal']);
      setMessage('¡GOL!');
      if (errorAudio.current) {
        errorAudio.current.currentTime = 0;
        errorAudio.current.play().catch(e => console.log(e));
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
    if (gameState === 'GHOST_MOVING') {
      const totalMoves = Math.floor(Math.random() * 15) + 15; // 15 a 29 saltos
      let moveCount = 0;
      let currentDelay = 250; // Inicia un poco rápido
      const minDelay = 150;   // Velocidad máxima constante

      const moveBall = () => {
        // Mover a una posición aleatoria diferente a la actual
        const possiblePos = ['left', 'center', 'right'].filter(p => p !== ghostBallPosRef.current);
        const nextPos = possiblePos[Math.floor(Math.random() * possiblePos.length)];
        
        setGhostBallPos(nextPos);
        moveCount++;

        // Aceleración lineal suave
        if (currentDelay > minDelay) {
          currentDelay -= 10;
        }

        if (moveCount < totalMoves) {
          timerId = setTimeout(moveBall, currentDelay);
        } else {
          // Terminar movimiento y esperar un momento
          timerId = setTimeout(() => {
            setGameState('COUNTDOWN');
            setCountdown(3);
            setMessage('¡Prepárate!');

            if (whistleAudio.current) {
              whistleAudio.current.currentTime = 0;
              whistleAudio.current.play().catch(e => console.log('Audio error:', e));

              setTimeout(() => {
                if (whistleAudio.current) {
                  whistleAudio.current.pause();
                }
              }, 800);
            }
          }, 400); // 400ms de pausa para que el jugador vea dónde quedó
        }
      };

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

  const getBallAnim = () => {
    const isSave = glovePosition === ballPosition;
    if (gameState === 'IDLE' || gameState === 'GHOST_MOVING' || gameState === 'COUNTDOWN') {
      return { scale: 0.15, top: '40%', left: '50%', opacity: 1 };
    }
    if (gameState === 'SHOOTING') {
      return { scale: 1.5, top: '75%', left: ballPosition === 'left' ? '16.66%' : ballPosition === 'right' ? '83.33%' : '50%', opacity: 1 };
    }
    if (gameState === 'ROUND_RESULT') {
      if (isSave) {
        return { scale: 1.5, top: '75%', left: ballPosition === 'left' ? '16.66%' : ballPosition === 'right' ? '83.33%' : '50%', opacity: 1 };
      } else {
        return { scale: 3, top: '130%', left: ballPosition === 'left' ? '10%' : ballPosition === 'right' ? '90%' : '50%', opacity: 0 };
      }
    }
    return { scale: 0.15, top: '40%', left: '50%' };
  };

  // Pateador
  const getKickerImage = () => {
    if (gameState === 'IDLE' || gameState === 'GHOST_MOVING' || gameState === 'COUNTDOWN') {
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
          {gameState === 'GHOST_MOVING' && (
            <motion.img
              key="ghost-ball"
              src="/assets/balon.svg"
              initial={{ scale: 1.2, top: '75%', left: '50%', opacity: 0 }}
              animate={{
                scale: 1.2,
                top: '75%',
                left: ghostBallPos === 'left' ? '16.66%' : ghostBallPos === 'right' ? '83.33%' : '50%',
                opacity: 0.8
              }}
              exit={{ opacity: 0 }}
              transition={{ type: 'tween', duration: 0.15, ease: 'easeInOut' }}
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

        {/* Zonas táctiles invisibles para capturar clicks */}
        <div onClick={() => handleTouch('left')} style={{ position: 'absolute', top: 0, left: 0, width: '33.3%', height: '100%', zIndex: 20, cursor: 'pointer' }} />
        <div onClick={() => handleTouch('center')} style={{ position: 'absolute', top: 0, left: '33.3%', width: '33.3%', height: '100%', zIndex: 20, cursor: 'pointer' }} />
        <div onClick={() => handleTouch('right')} style={{ position: 'absolute', top: 0, right: 0, width: '33.3%', height: '100%', zIndex: 20, cursor: 'pointer' }} />

        {/* Círculos visuales */}
        <div style={{ position: 'absolute', top: '75%', left: '16.66%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, pointerEvents: 'none' }}>
          <span style={{ position: 'absolute', top: '-35px', color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', textShadow: '2px 2px 4px black', fontWeight: 'bold' }}>IZQ</span>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
        </div>
        <div style={{ position: 'absolute', top: '75%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, pointerEvents: 'none' }}>
          <span style={{ position: 'absolute', top: '-35px', color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', textShadow: '2px 2px 4px black', fontWeight: 'bold' }}>CEN</span>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
        </div>
        <div style={{ position: 'absolute', top: '75%', left: '83.33%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, pointerEvents: 'none' }}>
          <span style={{ position: 'absolute', top: '-35px', color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', textShadow: '2px 2px 4px black', fontWeight: 'bold' }}>DER</span>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
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
          initial={{ opacity: 0 }}
          animate={{
            top: '75%',
            left: glovePosition === 'left' ? '16.66%' : glovePosition === 'right' ? '83.33%' : '50%',
            opacity: (gameState === 'IDLE' || gameState === 'GHOST_MOVING') ? 0 : 1
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            position: 'absolute',
            marginTop: '-70px',
            marginLeft: '-110px',
            width: '220px',
            height: '140px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5,
            pointerEvents: 'none'
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
