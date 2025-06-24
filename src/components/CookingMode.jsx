import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTimer } from '../context/TimerContext';

const { FiX, FiPlay, FiPause, FiRotateCcw, FiCheck, FiClock, FiChefHat, FiCheckCircle } = FiIcons;

const CookingMode = ({ recipe, onClose }) => {
  const { startTimer, activeTimer, timeLeft, isRunning, pauseTimer, resumeTimer, stopTimer, formatTime } = useTimer();
  const [currentStep, setCurrentStep] = useState(0);
  const [customTimer, setCustomTimer] = useState('');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showCustomTimer, setShowCustomTimer] = useState(false);

  const handleCustomTimer = () => {
    const minutes = parseInt(customTimer);
    if (minutes > 0) {
      startTimer(minutes, recipe.title, recipe, () => setShowCookingMode(true));
      setCustomTimer('');
      setShowCustomTimer(false);
    }
  };

  const handleQuickTimer = (minutes) => {
    startTimer(minutes, recipe.title, recipe, () => setShowCookingMode(true));
  };

  const toggleStepComplete = (stepIndex) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const nextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const commonTimers = [
    { label: '5 min', minutes: 5 },
    { label: '10 min', minutes: 10 },
    { label: '15 min', minutes: 15 },
    { label: '20 min', minutes: 20 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '1 hour', minutes: 60 }
  ];

  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <SafeIcon icon={FiChefHat} className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{recipe.title}</h2>
                <p className="text-white text-opacity-90 text-lg">
                  Cooking Mode • {recipe.prepTime} min prep • {recipe.servings} servings
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiX} className="w-7 h-7" />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)]">
          {/* Left Sidebar - Ingredients & Timer */}
          <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
            {/* Timer Section */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <SafeIcon icon={FiClock} className="w-6 h-6" />
                <span>Cooking Timer</span>
              </h3>

              {/* Active Timer Display */}
              {activeTimer && timeLeft > 0 && (
                <div className="mb-6">
                  <div className={`text-4xl font-bold text-center mb-4 ${
                    timeLeft <= 60 ? 'text-red-500' : 'text-orange-500'
                  }`}>
                    {formatTime(timeLeft)}
                  </div>
                  
                  <div className="flex justify-center space-x-3 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isRunning ? pauseTimer : resumeTimer}
                      className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                        isRunning
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      <SafeIcon icon={isRunning ? FiPause : FiPlay} className="w-5 h-5" />
                      <span>{isRunning ? 'Pause' : 'Resume'}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopTimer}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiRotateCcw} className="w-5 h-5" />
                      <span>Stop</span>
                    </motion.button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        timeLeft <= 60 ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${timeLeft > 0 ? 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Timer Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {commonTimers.map((timerOption) => (
                  <motion.button
                    key={timerOption.minutes}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickTimer(timerOption.minutes)}
                    className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-colors text-sm font-medium"
                  >
                    {timerOption.label}
                  </motion.button>
                ))}
              </div>

              {/* Custom Timer */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCustomTimer(!showCustomTimer)}
                  className="w-full p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                >
                  Custom Timer
                </motion.button>

                <AnimatePresence>
                  {showCustomTimer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex space-x-2"
                    >
                      <input
                        type="number"
                        value={customTimer}
                        onChange={(e) => setCustomTimer(e.target.value)}
                        placeholder="Minutes"
                        className="flex-1 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCustomTimer}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                      >
                        Start
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{ingredient.name}</span>
                      <span className="text-gray-500">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Instructions */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Instructions
              </h3>
              <div className="text-lg text-gray-600">
                Step {currentStep + 1} of {instructions.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / instructions.length) * 100}%` }}
              />
            </div>

            {/* Current Step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-8"
              >
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {currentStep + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-xl leading-relaxed mb-4">
                        {instructions[currentStep] || 'No instruction available'}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleStepComplete(currentStep)}
                        className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                          completedSteps.has(currentStep)
                            ? 'bg-green-500 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <SafeIcon icon={completedSteps.has(currentStep) ? FiCheckCircle : FiCheck} className="w-5 h-5" />
                        <span>{completedSteps.has(currentStep) ? 'Completed' : 'Mark Complete'}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-8 py-4 rounded-xl font-semibold transition-colors ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                Previous Step
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                disabled={currentStep === instructions.length - 1}
                className={`px-8 py-4 rounded-xl font-semibold transition-colors ${
                  currentStep === instructions.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                }`}
              >
                {currentStep === instructions.length - 1 ? 'Recipe Complete!' : 'Next Step'}
              </motion.button>
            </div>

            {/* All Steps Overview */}
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">All Steps</h4>
              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setCurrentStep(index)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      index === currentStep
                        ? 'border-orange-500 bg-orange-50'
                        : completedSteps.has(index)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === currentStep
                          ? 'bg-orange-500 text-white'
                          : completedSteps.has(index)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {completedSteps.has(index) ? (
                          <SafeIcon icon={FiCheck} className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p className={`text-sm ${
                        index === currentStep ? 'text-orange-800' : 'text-gray-700'
                      }`}>
                        {instruction}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CookingMode;