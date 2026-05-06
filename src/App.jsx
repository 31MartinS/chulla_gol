import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import FormScreen from './components/FormScreen';
import InstructionScreen from './components/InstructionScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import './index.css';

const SCREENS = {
  FORM: 'FORM',
  INSTRUCTIONS: 'INSTRUCTIONS',
  GAME: 'GAME',
  RESULTS: 'RESULTS'
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.FORM);
  const [, setUserData] = useState(null);
  const [gameResult, setGameResult] = useState(null); 

  // Audio Reference
  const bgMusicRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const startAudio = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };
    
    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });
    
    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
  }, [hasInteracted]);

  useEffect(() => {
    if (hasInteracted && bgMusicRef.current) {
      if (currentScreen === SCREENS.GAME) {
        bgMusicRef.current.pause();
      } else {
        bgMusicRef.current.play().catch(e => console.log('Autoplay prevented', e));
      }
    }
  }, [currentScreen, hasInteracted]);

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
    setCurrentScreen(SCREENS.FORM);
    setUserData(null);
    setGameResult(null);
  };

  return (
    <div className="mobile-container">
      {/* Música de fondo global */}
      <audio ref={bgMusicRef} src="/sounds/soccer.mp3" loop />
      
      <AnimatePresence mode="wait">
        {currentScreen === SCREENS.FORM && (
          <FormScreen key="form" onSubmit={handleFormSubmit} />
        )}
        {currentScreen === SCREENS.INSTRUCTIONS && (
          <InstructionScreen key="instructions" onStart={handleStartGame} />
        )}
        {currentScreen === SCREENS.GAME && (
          <GameScreen key="game" onEnd={handleGameEnd} />
        )}
        {currentScreen === SCREENS.RESULTS && (
          <ResultScreen key="results" result={gameResult} onRestart={handleRestart} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
