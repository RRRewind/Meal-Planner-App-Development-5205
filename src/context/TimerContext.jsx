import React, { createContext, useContext, useState, useEffect } from 'react';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [recipeData, setRecipeData] = useState(null);
  const [cookingModeCallback, setCookingModeCallback] = useState(null);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false);
            playAlertSound();
            showNotification();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playAlertSound = () => {
    try {
      // Create audio context for alert sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a sequence of beeps
      const playBeep = (frequency, duration, delay = 0) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, delay);
      };

      // Play alert sequence: 3 beeps
      playBeep(800, 0.2, 0);
      playBeep(800, 0.2, 300);
      playBeep(800, 0.4, 600);
    } catch (error) {
      console.warn('Could not play alert sound:', error);
      
      // Fallback: try to use a simple beep
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSMFL4nS8N2QQAoUXrTp66hVFApGn+DyvmwhCz1+1O/TgjAN");
        audio.play().catch(() => {});
      } catch (e) {
        console.warn('Fallback sound also failed');
      }
    }
  };

  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🍳 Timer Finished!', {
        body: `Your cooking timer for ${recipeName || 'recipe'} has finished!`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'cooking-timer',
        requireInteraction: true
      });
    }
  };

  const startTimer = (minutes, recipe = '', recipeObj = null, openCallback = null) => {
    setActiveTimer(Date.now());
    setTimeLeft(minutes * 60);
    setIsRunning(true);
    setRecipeName(recipe);
    setRecipeData(recipeObj);
    setCookingModeCallback(() => openCallback);
    
    // Request notification permission if needed
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setActiveTimer(null);
    setTimeLeft(0);
    setIsRunning(false);
    setRecipeName('');
    setRecipeData(null);
    setCookingModeCallback(null);
  };

  const openCookingMode = () => {
    if (cookingModeCallback) {
      cookingModeCallback();
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const value = {
    activeTimer,
    timeLeft,
    isRunning,
    recipeName,
    recipeData,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    formatTime,
    openCookingMode
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};