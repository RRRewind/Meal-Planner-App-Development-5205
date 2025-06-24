import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTimer } from '../context/TimerContext';

const { FiClock, FiPlay, FiPause, FiX, FiEye } = FiIcons;

const FloatingTimer = () => {
  const { activeTimer, timeLeft, isRunning, recipeName, recipeData, pauseTimer, resumeTimer, stopTimer, formatTime, openCookingMode } = useTimer();

  if (!activeTimer || timeLeft === 0) {
    return null;
  }

  const isUrgent = timeLeft <= 60; // Red when less than 1 minute

  const handleViewRecipe = () => {
    if (openCookingMode && recipeData) {
      openCookingMode();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          animate={{
            scale: isUrgent ? [1, 1.05, 1] : 1,
            boxShadow: isUrgent 
              ? ['0 10px 25px rgba(239, 68, 68, 0.3)', '0 15px 35px rgba(239, 68, 68, 0.5)', '0 10px 25px rgba(239, 68, 68, 0.3)']
              : '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
          transition={{
            scale: { duration: 1, repeat: isUrgent ? Infinity : 0 },
            boxShadow: { duration: 1, repeat: isUrgent ? Infinity : 0 }
          }}
          className={`bg-white rounded-2xl shadow-2xl border-2 p-4 min-w-[300px] ${
            isUrgent ? 'border-red-300' : 'border-orange-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isUrgent ? 'bg-red-500' : 'bg-orange-500'
              }`}>
                <SafeIcon icon={FiClock} className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Cooking Timer</div>
                {recipeName && (
                  <div className="text-xs text-gray-600 truncate max-w-[150px]">{recipeName}</div>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopTimer}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className={`text-3xl font-bold ${
              isUrgent ? 'text-red-600' : 'text-orange-600'
            }`}>
              {formatTime(timeLeft)}
            </div>
            {isUrgent && (
              <div className="text-xs text-red-600 font-medium animate-pulse">
                Almost done! 🔥
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Timer Controls */}
            <div className="flex items-center justify-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRunning ? pauseTimer : resumeTimer}
                className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                  isRunning
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <SafeIcon icon={isRunning ? FiPause : FiPlay} className="w-4 h-4" />
                <span>{isRunning ? 'Pause' : 'Resume'}</span>
              </motion.button>
            </div>

            {/* View Recipe Button */}
            {recipeData && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewRecipe}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiEye} className="w-4 h-4" />
                <span>View Recipe</span>
              </motion.button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ 
                width: `${timeLeft > 0 ? (timeLeft / (timeLeft + 1)) * 100 : 0}%`,
                backgroundColor: isUrgent ? '#ef4444' : '#f97316'
              }}
              className="h-2 rounded-full transition-all duration-300"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingTimer;