import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import FormScreen from './components/FormScreen';
import InstructionScreen from './components/InstructionScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import SplashScreen from './components/SplashScreen';
import './index.css';

const SCREENS = {
  SPLASH: 'SPLASH',
  FORM: 'FORM',
  INSTRUCTIONS: 'INSTRUCTIONS',
  GAME: 'GAME',
  RESULTS: 'RESULTS'
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.SPLASH);
  const [, setUserData] = useState(null);
  const [gameResult, setGameResult] = useState(null); 

  // Audio Reference
  const bgMusicRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (bgMusicRef.current) bgMusicRef.current.muted = next;
      return next;
    });
  };

  useEffect(() => {
    const startAudio = () => {
      if (!hasInteracted && bgMusicRef.current) {
        // En móviles, el play() debe llamarse sincrónicamente en el evento
        if (currentScreen !== SCREENS.GAME) {
          bgMusicRef.current.play().catch(e => console.log('Autoplay prevented', e));
        }
        setHasInteracted(true);
      }
    };
    
    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });
    
    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
  }, [hasInteracted, currentScreen]);

  useEffect(() => {
    if (hasInteracted && bgMusicRef.current) {
      if (currentScreen === SCREENS.GAME) {
        bgMusicRef.current.pause();
      } else {
        bgMusicRef.current.play().catch(e => console.log('Autoplay prevented', e));
      }
    }
  }, [currentScreen, hasInteracted]);

  const handleSplashEnd = () => {
    setCurrentScreen(SCREENS.FORM);
  };

  const handleFormSubmit = (data) => {
    setUserData(data);
    setCurrentScreen(SCREENS.INSTRUCTIONS);
  };

  const handleStartGame = () => {
    setCurrentScreen(SCREENS.GAME);
  };

  const handleGameEnd = (result) => {
    setGameResult(result);
    setCurrentScreen(SCREENS.RESULTS);
  };

  const handleRestart = () => {
    setCurrentScreen(SCREENS.SPLASH);
    setUserData(null);
    setGameResult(null);
  };

  return (
    <div className="mobile-container">
      {/* Música de fondo global */}
      <audio ref={bgMusicRef} src="/sounds/soccer.mp3" loop />

      {/* Botón de mute global */}
      <button
        onClick={toggleMute}
        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
        style={{
          position: 'fixed',
          top: 'calc(12px + env(safe-area-inset-top))',
          right: '14px',
          zIndex: 200,
          background: 'rgba(0,0,0,0.45)',
          border: '1.5px solid rgba(255,255,255,0.25)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          fontSize: '1.2rem',
          transition: 'background 0.2s, transform 0.15s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
        }}
        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.88)'}
        onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <AnimatePresence mode="wait">
        {currentScreen === SCREENS.SPLASH && (
          <SplashScreen key="splash" onStart={handleSplashEnd} />
        )}
        {currentScreen === SCREENS.FORM && (
          <FormScreen key="form" onSubmit={handleFormSubmit} />
        )}
        {currentScreen === SCREENS.INSTRUCTIONS && (
          <InstructionScreen key="instructions" onStart={handleStartGame} />
        )}
        {currentScreen === SCREENS.GAME && (
          <GameScreen key="game" onEnd={handleGameEnd} isMuted={isMuted} />
        )}
        {currentScreen === SCREENS.RESULTS && (
          <ResultScreen key="results" result={gameResult} onRestart={handleRestart} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
