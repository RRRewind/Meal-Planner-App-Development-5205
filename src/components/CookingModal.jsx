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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBjiH0fPTgjMG');
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

  // Mobile-optimized motion props
  const getMobileMotionProps = (baseProps) => {
    if (isMobile) {
      return {
        initial: { opacity: 0.95 },
        animate: { opacity: 1 },
        exit: { opacity: 0.95 },
        transition: { duration: 0.1, ease: 'linear' },
        ...baseProps
      };
    }
    return baseProps;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 performance-optimized">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden vercel-optimized"
        style={{
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          WebkitTransform: 'translate3d(0, 0, 0)',
          transform: 'translate3d(0, 0, 0)'
        }}
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
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 relative">
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div
                className="h-2 bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
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
          <div className="lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto performance-optimized">
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
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isChecked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => toggleIngredient(index)}
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    <button
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isChecked
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-orange-400'
                      }`}
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                      }}
                    >
                      {isChecked && (
                        <SafeIcon icon={FiCheck} className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium transition-all duration-200 ${
                        isChecked ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timer Controls */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Cooking Timer</h3>
              
              {/* Current Timer Display */}
              {timeRemaining > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{timerName}</div>
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => isTimerActive ? pauseTimer() : setIsTimerActive(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                        style={{
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                      >
                        <SafeIcon icon={isTimerActive ? FiPause : FiPlay} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={resetTimer}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                        style={{
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                      >
                        <SafeIcon icon={FiRotateCcw} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Timer Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickTimers.map((timer, index) => (
                  <button
                    key={index}
                    onClick={() => startTimer(timer.minutes, timer.label)}
                    className="bg-gray-100 hover:bg-orange-100 p-3 rounded-lg text-sm font-medium text-gray-700 hover:text-orange-700 transition-colors flex items-center justify-center space-x-1"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    <SafeIcon icon={timer.icon} className="w-3 h-3" />
                    <span>{timer.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Timer */}
              <button
                onClick={() => setShowTimerSettings(!showTimerSettings)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg font-medium transition-colors"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                Custom Timer
              </button>

              {/* Custom Timer Settings */}
              {showTimerSettings && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <button
                      onClick={() => setCustomTime(Math.max(1, customTime - 1))}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-1 rounded"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                      }}
                    >
                      <SafeIcon icon={FiMinus} className="w-3 h-3" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-lg font-semibold">{customTime} min</span>
                    </div>
                    <button
                      onClick={() => setCustomTime(customTime + 1)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-1 rounded"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                      }}
                    >
                      <SafeIcon icon={FiPlus} className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => startTimer(customTime, `${customTime} Minute Timer`)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg font-medium transition-colors"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    Start {customTime} Min Timer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Instructions */}
          <div className="lg:w-2/3 p-6 overflow-y-auto performance-optimized">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-4">
              {instructions.map((instruction, index) => {
                const isCompleted = completedSteps.has(index);
                const isCurrent = index === currentStep;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : isCurrent
                        ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => toggleStep(index)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-200 ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isCurrent
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400'
                        }`}
                        style={{
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                      >
                        {isCompleted ? (
                          <SafeIcon icon={FiCheck} className="w-4 h-4" />
                        ) : (
                          <span className="text-sm">{index + 1}</span>
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`transition-all duration-200 ${
                          isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {instruction}
                        </p>
                        {isCurrent && (
                          <div className="mt-2 text-sm text-orange-600 font-medium">
                            Current Step
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                Previous Step
              </button>
              
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {totalSteps}
              </div>

              <button
                onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
                disabled={currentStep === totalSteps - 1}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Timer (when active and modal is closed) */}
      {timeRemaining > 0 && (
        <div
          className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-orange-200 p-4 z-50 performance-optimized"
          style={{
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            WebkitTransform: 'translate3d(0, 0, 0)',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-600 mb-2">{timerName}</div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => isTimerActive ? pauseTimer() : setIsTimerActive(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-lg transition-colors"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <SafeIcon icon={isTimerActive ? FiPause : FiPlay} className="w-3 h-3" />
              </button>
              <button
                onClick={resetTimer}
                className="bg-gray-500 hover:bg-gray-600 text-white p-1.5 rounded-lg transition-colors"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <SafeIcon icon={FiX} className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookingModal;