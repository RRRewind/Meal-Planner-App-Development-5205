import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiClock, FiUsers, FiChef, FiPlay, FiPause, FiRotateCcw, FiCheck, FiPlus, FiMinus } = FiIcons;

const CookingModal = ({ recipe, onClose, mealInfo = null }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [customTime, setCustomTime] = useState(recipe?.prepTime || 30);
  const [timerName, setTimerName] = useState('Cooking Timer');
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsTimerActive(false);
            // Show completion notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🍳 Cooking Timer Complete!', {
                body: `${timerName} has finished!`,
                icon: '/vite.svg'
              });
            }
            // Play sound if available
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMG');
              audio.play();
            } catch (e) {
              console.log('Timer sound not available');
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isTimerActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining, timerName]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!recipe) return null;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const totalSteps = instructions.length;
  const progress = totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0;

  const getCategoryColor = (category) => {
    const colors = {
      'Breakfast': 'from-yellow-400 to-orange-500',
      'Lunch': 'from-blue-400 to-cyan-500',
      'Dinner': 'from-purple-400 to-pink-500',
      'Snack': 'from-green-400 to-emerald-500',
      'Dessert': 'from-pink-400 to-rose-500',
      'Appetizer': 'from-indigo-400 to-blue-500',
      'Soup': 'from-orange-400 to-red-500',
      'Salad': 'from-green-400 to-teal-500',
      'Main Course': 'from-red-400 to-pink-500',
      'Side Dish': 'from-teal-400 to-cyan-500',
      'Beverage': 'from-blue-400 to-indigo-500'
    };
    return colors[recipe.category] || 'from-gray-400 to-gray-500';
  };

  const toggleIngredient = (index) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const toggleStep = (index) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  const startTimer = (minutes, name = 'Cooking Timer') => {
    setTimeRemaining(minutes * 60);
    setTimerName(name);
    setIsTimerActive(true);
    setShowTimerSettings(false);
  };

  const pauseTimer = () => {
    setIsTimerActive(false);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeRemaining(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const quickTimers = [
    { label: 'Prep Time', minutes: recipe.prepTime || 30, icon: FiChef },
    { label: '5 min', minutes: 5, icon: FiClock },
    { label: '10 min', minutes: 10, icon: FiClock },
    { label: '15 min', minutes: 15, icon: FiClock },
    { label: '20 min', minutes: 20, icon: FiClock },
    { label: '30 min', minutes: 30, icon: FiClock }
  ];

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
        <div className={`bg-gradient-to-r ${getCategoryColor(recipe.category)} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <SafeIcon icon={FiChef} className="w-8 h-8" />
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  {recipe.category}
                </span>
                {mealInfo && (
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {mealInfo.mealType} • {format(mealInfo.date, 'MMM d')}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-3">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-white text-opacity-90 mb-4">{recipe.description}</p>
              )}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiClock} className="w-4 h-4" />
                  <span>{recipe.prepTime || recipe.prep_time || 0} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUsers} className="w-4 h-4" />
                  <span>{recipe.servings} servings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  <span>{completedSteps.size} of {totalSteps} steps</span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 relative">
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-2 bg-white rounded-full transition-all duration-300"
              />
            </div>
            <div className="text-right text-sm mt-1 text-white text-opacity-90">
              {Math.round(progress)}% Complete
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-200px)]">
          {/* Left Panel - Ingredients */}
          <div className="lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Ingredients</h2>
              <span className="text-sm text-gray-500">
                {checkedIngredients.size} of {ingredients.length}
              </span>
            </div>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => {
                const isChecked = checkedIngredients.has(index);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isChecked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => toggleIngredient(index)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isChecked
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-orange-400'
                      }`}
                    >
                      {isChecked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <SafeIcon icon={FiCheck} className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                    <div className="flex-1">
                      <div className={`font-medium transition-all duration-200 ${
                        isChecked ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Timer Controls */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Cooking Timer</h3>
              
              {/* Current Timer Display */}
              {timeRemaining > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200 mb-4"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{timerName}</div>
                    <div className="flex items-center justify-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => isTimerActive ? pauseTimer() : setIsTimerActive(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={isTimerActive ? FiPause : FiPlay} className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetTimer}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiRotateCcw} className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Timer Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickTimers.map((timer, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startTimer(timer.minutes, timer.label)}
                    className="bg-gray-100 hover:bg-orange-100 p-3 rounded-lg text-sm font-medium text-gray-700 hover:text-orange-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <SafeIcon icon={timer.icon} className="w-3 h-3" />
                    <span>{timer.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Custom Timer */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTimerSettings(!showTimerSettings)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg font-medium transition-colors"
              >
                Custom Timer
              </motion.button>

              {/* Custom Timer Settings */}
              <AnimatePresence>
                {showTimerSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCustomTime(Math.max(1, customTime - 1))}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-1 rounded"
                      >
                        <SafeIcon icon={FiMinus} className="w-3 h-3" />
                      </motion.button>
                      <div className="flex-1 text-center">
                        <span className="text-lg font-semibold">{customTime} min</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCustomTime(customTime + 1)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-1 rounded"
                      >
                        <SafeIcon icon={FiPlus} className="w-3 h-3" />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startTimer(customTime, `${customTime} Minute Timer`)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg font-medium transition-colors"
                    >
                      Start {customTime} Min Timer
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel - Instructions */}
          <div className="lg:w-2/3 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-4">
              {instructions.map((instruction, index) => {
                const isCompleted = completedSteps.has(index);
                const isCurrent = index === currentStep;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : isCurrent
                        ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleStep(index)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-200 ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isCurrent
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400'
                        }`}
                      >
                        {isCompleted ? (
                          <SafeIcon icon={FiCheck} className="w-4 h-4" />
                        ) : (
                          <span className="text-sm">{index + 1}</span>
                        )}
                      </motion.button>
                      <div className="flex-1">
                        <p className={`transition-all duration-200 ${
                          isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {instruction}
                        </p>
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 text-sm text-orange-600 font-medium"
                          >
                            Current Step
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Previous Step
              </motion.button>
              
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {totalSteps}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
                disabled={currentStep === totalSteps - 1}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Next Step
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Timer (when active and modal is closed) */}
      {timeRemaining > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-orange-200 p-4 z-50"
        >
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-600 mb-2">{timerName}</div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => isTimerActive ? pauseTimer() : setIsTimerActive(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-lg transition-colors"
              >
                <SafeIcon icon={isTimerActive ? FiPause : FiPlay} className="w-3 h-3" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className="bg-gray-500 hover:bg-gray-600 text-white p-1.5 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CookingModal;