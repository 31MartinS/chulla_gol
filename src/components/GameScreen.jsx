import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GameScreen = ({ onEnd, isMuted }) => {
  const TOTAL_SHOTS = 2;
  const [currentShot, setCurrentShot] = useState(1);
  const [saves, setSaves] = useState(0);
  const [results, setResults] = useState([]); // Array of 'save' or 'goal'

  const [gameState, setGameState] = useState('IDLE'); // IDLE, GHOST_MOVING, SHOOTING, ROUND_RESULT
  const [glovePosition, setGlovePosition] = useState('center');
  const [ballPosition, setBallPosition] = useState('center');
  const [timeLeft, setTimeLeft] = useState(5);
  const [showEligeOverlay, setShowEligeOverlay] = useState(false); // overlay "¡ELIGE!" al inicio
  const [message, setMessage] = useState('Toca la pantalla para empezar');
  const [ghostBallPos, setGhostBallPos] = useState('center');

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
    setMessage('¡Mueve los guantes!');
  }, []);

  const handleTouch = (side) => {
    if (gameState === 'IDLE') {
      startGhostMoving();
      return;
    }
    // Solo se pueden mover los guantes durante los 5 segundos activos
    if (gameState !== 'GHOST_MOVING') return;
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

  // Guarda la última posición real ANTES de ocultar el balón
  const finalBallPosRef = useRef('center');

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
        winAudio.current.muted = isMuted;
        winAudio.current.currentTime = 0;
        winAudio.current.play().catch(e => console.log(e));
      }
    } else {
      setResults(prev => [...prev, 'goal']);
      setMessage('¡GOL!');
      if (errorAudio.current) {
        errorAudio.current.muted = isMuted;
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
    // La dirección es la posición final guardada antes de ocultarse
    const targetDir = finalBallPosRef.current;

    setGameState('SHOOTING');
    setMessage('¡Disparo!');

    // Sonido de patada
    if (kickAudio.current) {
      kickAudio.current.muted = isMuted;
      kickAudio.current.currentTime = 0;
      kickAudio.current.play().catch(e => console.log('Audio error:', e));
    }

    setBallPosition(targetDir);

    // Tiempo de vuelo del balón
    setTimeout(() => {
      evaluateResult(targetDir);
    }, 800);
  }, [evaluateResult]);

  // Ref estable para llamar shootBall desde el effect sin re-ejecutarlo
  const shootBallRef = useRef(null);
  useEffect(() => { shootBallRef.current = shootBall; }, [shootBall]);

  // Fase principal: 5 segundos donde el balón se mueve y los guantes se pueden mover
  useEffect(() => {
    let moveTimerId;
    let countdownInterval;
    let decoyTimerId;
    let endTimerId;
    let hideEligeId;

    if (gameState === 'GHOST_MOVING') {
      const OVERLAY_MS = 1500;      // duración del overlay ¡ELIGE!
      const GAME_MS    = 5000;      // countdown 5→1 tras el overlay
      const TOTAL_MS   = OVERLAY_MS + GAME_MS; // 5500ms total
      const DECOY_BEFORE_MS = 700;
      let currentDelay = 400; // ms entre movimientos al inicio (más lento)
      const minDelay = 280;    // velocidad máxima (más controlada)

      // Silbato al inicio
      if (whistleAudio.current) {
        whistleAudio.current.muted = isMuted;
        whistleAudio.current.currentTime = 0;
        whistleAudio.current.play().catch(e => console.log('Audio error:', e));
        setTimeout(() => {
          if (whistleAudio.current) whistleAudio.current.pause();
        }, 800);
      }

      // Overlay "¡ELIGE!" — primeros 1.5s; countdown arranca al quitarse
      setShowEligeOverlay(true);
      hideEligeId = setTimeout(() => {
        setShowEligeOverlay(false);
        setTimeLeft(5);
        countdownInterval = setInterval(() => {
          setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);
      }, OVERLAY_MS);

      // Movimiento continuo del balón (empieza inmediatamente)
      const moveBall = () => {
        const possiblePos = ['left', 'center', 'right'].filter(p => p !== ghostBallPosRef.current);
        const nextPos = possiblePos[Math.floor(Math.random() * possiblePos.length)];
        setGhostBallPos(nextPos);
        if (currentDelay > minDelay) currentDelay -= 5;
        moveTimerId = setTimeout(moveBall, currentDelay);
      };
      moveTimerId = setTimeout(moveBall, 50);

      // ★ Guardar posición REAL antes de los últimos movimientos señuelo
      decoyTimerId = setTimeout(() => {
        finalBallPosRef.current = ghostBallPosRef.current;
      }, TOTAL_MS - DECOY_BEFORE_MS);

      // Fin del tiempo → ocultar balón y disparar
      endTimerId = setTimeout(() => {
        clearInterval(countdownInterval);
        clearTimeout(moveTimerId);
        setGhostBallPos('hidden');
        if (shootBallRef.current) shootBallRef.current();
      }, TOTAL_MS);
    }

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(moveTimerId);
      clearTimeout(decoyTimerId);
      clearTimeout(endTimerId);
      clearTimeout(hideEligeId);
      setShowEligeOverlay(false);
    };
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Mapa de posiciones triangular: centro=arriba, izq/der=abajo
    const POS = {
      left: { left: '25%', top: '72%' },
      center: { left: '50%', top: '30%' },
      right: { left: '75%', top: '72%' },
    };

    if (gameState === 'IDLE' || gameState === 'GHOST_MOVING' || gameState === 'COUNTDOWN') {
      return { scale: 0.15, top: '50%', left: '50%', opacity: 1 };
    }
    if (gameState === 'SHOOTING') {
      return { scale: 1.5, ...POS[ballPosition], opacity: 1 };
    }
    if (gameState === 'ROUND_RESULT') {
      if (isSave) {
        return { scale: 1.5, ...POS[ballPosition], opacity: 1 };
      } else {
        // Vuela hacia afuera en la dirección de disparo
        const flyOff = {
          left: { scale: 3, top: '120%', left: '5%', opacity: 0 },
          center: { scale: 3, top: '-20%', left: '50%', opacity: 0 },
          right: { scale: 3, top: '120%', left: '95%', opacity: 0 },
        };
        return flyOff[ballPosition];
      }
    }
    return { scale: 0.15, top: '50%', left: '50%' };
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
          minHeight: '40px',
          fontSize: 'clamp(1.5rem, 6vw, 2rem)',
          textShadow: '3px 3px 8px rgba(0,0,0,1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900
        }}>
          {message}
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
              initial={{ scale: 1.2, top: '72%', left: '50%', opacity: 0 }}
              animate={{
                scale: 1.2,
                top: ghostBallPos === 'center' ? '30%' : '72%',
                left: ghostBallPos === 'left' ? '25%' : ghostBallPos === 'right' ? '75%' : '50%',
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
                filter: 'drop-shadow(0px 5px 10px rgba(255, 255, 255, 0.8)) hue-rotate(90deg)'
              }}
            />
          )}
        </AnimatePresence>

        {/* Zonas táctiles — layout triangular: mitad superior=centro, inferior-izq=izq, inferior-der=der */}
        <div onClick={() => handleTouch('center')} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '48%', zIndex: 20, cursor: 'pointer' }} />
        <div onClick={() => handleTouch('left')} style={{ position: 'absolute', top: '48%', left: 0, width: '50%', height: '52%', zIndex: 20, cursor: 'pointer' }} />
        <div onClick={() => handleTouch('right')} style={{ position: 'absolute', top: '48%', right: 0, width: '50%', height: '52%', zIndex: 20, cursor: 'pointer' }} />

        {/* Círculos visuales — layout triangular */}
        {/* Centro: arriba */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, pointerEvents: 'none' }}>
          <span style={{ position: 'absolute', top: '-35px', color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', textShadow: '2px 2px 4px black', fontWeight: 'bold' }}>ARRIBA</span>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
        </div>
        {/* Izquierda: abajo-izq */}
        <div style={{ position: 'absolute', top: '72%', left: '25%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, pointerEvents: 'none' }}>
          <span style={{ position: 'absolute', top: '-35px', color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', textShadow: '2px 2px 4px black', fontWeight: 'bold' }}>IZQ</span>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
        </div>
        {/* Derecha: abajo-der */}
        <div style={{ position: 'absolute', top: '72%', left: '75%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, pointerEvents: 'none' }}>
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

        {/* Guantes — pop instantáneo en la posición tocada, sin slide */}
        <AnimatePresence>
          {gameState !== 'IDLE' && (
            <motion.div
              key={glovePosition}  // remonta en cada cambio → efecto pop
              initial={{ scale: 0.45, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.45, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 520, damping: 22 }}
              style={{
                position: 'absolute',
                top: glovePosition === 'center' ? '30%' : '72%',
                left: glovePosition === 'left' ? '25%' : glovePosition === 'right' ? '75%' : '50%',
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
          )}
        </AnimatePresence>

      </div>

      {/* Overlay "¡ELIGE!" — aparece al tocar para empezar */}
      <AnimatePresence>
        {showEligeOverlay && (
          <motion.div
            key="elige-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              background: 'rgba(0, 5, 20, 0.65)',
              backdropFilter: 'blur(3px)',
              pointerEvents: 'none'
            }}
          >
            <motion.div
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center', padding: '0 20px' }}
            >
              <span style={{
                fontSize: 'clamp(3rem, 14vw, 5.5rem)', fontWeight: 900, lineHeight: 1,
                color: 'rgba(255, 230, 80, 1)',
                textShadow: '0 0 30px rgba(255, 200, 0, 1), 0 0 60px rgba(255, 140, 0, 0.7), 0 6px 18px rgba(0,0,0,0.9)',
                letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'inherit'
              }}>
                ¡Elige
              </span>
              <span style={{
                fontSize: 'clamp(1.4rem, 6vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2,
                color: 'rgba(255, 210, 60, 0.95)',
                textShadow: '0 0 20px rgba(255, 180, 0, 0.9), 0 4px 12px rgba(0,0,0,0.9)',
                letterSpacing: '0.02em', textTransform: 'uppercase', fontFamily: 'inherit'
              }}>
                dónde irá el balón!
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contador de tiempo — flota sin oscurecer, zoom por cada segundo */}
      <AnimatePresence mode="wait">
        {gameState === 'GHOST_MOVING' && !showEligeOverlay && timeLeft > 0 && (
          <motion.div
            key={`timer-${timeLeft}`}
            initial={{ scale: 2.0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '18%',
              zIndex: 30,
              pointerEvents: 'none'
            }}
          >
            <span style={{
              fontSize: 'clamp(5rem, 22vw, 9rem)',
              fontWeight: 900,
              lineHeight: 1,
              color: timeLeft <= 2 ? 'rgba(255, 100, 60, 1)' : '#fff',
              textShadow: timeLeft <= 2
                ? '0 0 30px rgba(255, 60, 0, 1), 0 0 70px rgba(255, 30, 0, 0.8), 0 8px 24px rgba(0,0,0,0.9)'
                : '0 0 30px rgba(255, 200, 0, 0.9), 0 0 60px rgba(255, 120, 0, 0.6), 0 8px 24px rgba(0,0,0,0.9)',
              fontFamily: 'inherit'
            }}>
              {timeLeft}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GameScreen;
