import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTimer } from '../context/TimerContext';

const { FiClock, FiPlay, FiPause, FiX, FiEye, FiCheck, FiRotateCcw } = FiIcons;

const FloatingTimer = () => {
  const { 
    activeTimer, 
    timeLeft, 
    isRunning, 
    recipeName, 
    recipeData, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    formatTime, 
    openCookingMode 
  } = useTimer();

  if (!activeTimer) {
    return null;
  }

  const isCompleted = timeLeft === 0;
  const isUrgent = timeLeft <= 60 && timeLeft > 0; // Red when less than 1 minute but not completed

  const handleViewRecipe = () => {
    if (openCookingMode && recipeData) {
      openCookingMode();
    }
  };

  const handleDismiss = () => {
    stopTimer();
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
            boxShadow: isCompleted 
              ? ['0 15px 35px rgba(34,197,94,0.4)', '0 20px 45px rgba(34,197,94,0.6)', '0 15px 35px rgba(34,197,94,0.4)']
              : isUrgent 
                ? ['0 10px 25px rgba(239,68,68,0.3)', '0 15px 35px rgba(239,68,68,0.5)', '0 10px 25px rgba(239,68,68,0.3)']
                : '0 10px 25px rgba(0,0,0,0.1)'
          }}
          transition={{
            scale: { duration: 1, repeat: (isUrgent || isCompleted) ? Infinity : 0 },
            boxShadow: { duration: 1, repeat: (isUrgent || isCompleted) ? Infinity : 0 }
          }}
          className={`bg-white rounded-2xl shadow-2xl border-2 p-4 min-w-[300px] ${
            isCompleted 
              ? 'border-green-300' 
              : isUrgent 
                ? 'border-red-300' 
                : 'border-orange-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-500' 
                  : isUrgent 
                    ? 'bg-red-500' 
                    : 'bg-orange-500'
              }`}>
                <SafeIcon 
                  icon={isCompleted ? FiCheck : FiClock} 
                  className="w-4 h-4 text-white" 
                />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">
                  {isCompleted ? '🎉 Timer Complete!' : 'Cooking Timer'}
                </div>
                {recipeName && (
                  <div className="text-xs text-gray-600 truncate max-w-[150px]">{recipeName}</div>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4">
            {isCompleted ? (
              <div className="space-y-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="text-3xl font-bold text-green-600"
                >
                  ✅ DONE!
                </motion.div>
                <div className="text-sm text-green-700 font-medium">
                  Your cooking timer has finished! 🍳
                </div>
                <div className="text-xs text-green-600">
                  Time to check your {recipeName || 'dish'}! 👨‍🍳✨
                </div>
              </div>
            ) : (
              <>
                <div className={`text-3xl font-bold ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                  {formatTime(timeLeft)}
                </div>
                {isUrgent && (
                  <div className="text-xs text-red-600 font-medium animate-pulse">
                    Almost done! 🔥
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {isCompleted ? (
              /* Completion Actions */
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDismiss}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  <span>Perfect! Dismiss Timer</span>
                </motion.button>
                
                {/* View Recipe Button */}
                {recipeData && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleViewRecipe}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <SafeIcon icon={FiEye} className="w-4 h-4" />
                    <span>Continue Cooking</span>
                  </motion.button>
                )}
              </div>
            ) : (
              /* Timer Controls */
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
            )}

            {/* View Recipe Button - Always show if available */}
            {!isCompleted && recipeData && (
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
          {!isCompleted && (
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
          )}

          {/* Celebration Animation for Completion */}
          {isCompleted && (
            <div className="mt-3 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-2xl"
              >
                🎊
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingTimer;