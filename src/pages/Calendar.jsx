import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, isPast, startOfDay, isToday, isBefore } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useMealPlan } from '../context/MealPlanContext';
import MealPlanModal from '../components/MealPlanModal';

const { FiChevronLeft, FiChevronRight, FiPlus, FiCoffee, FiSun, FiSunset, FiMoreHorizontal, FiX, FiClock, FiCalendar } = FiIcons;

const Calendar = () => {
  const { currentWeek, setCurrentWeek, getWeekMeals, recipes, removeMealFromPlan } = useMealPlan();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [hoveredMeal, setHoveredMeal] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDateSticky, setIsDateSticky] = useState(false);

  const weekMeals = getWeekMeals(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  // Get current date in user's timezone
  const now = new Date();
  const today = startOfDay(now);

  // Check if current view is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set initial day to today if it's in the current week, otherwise first non-past day
  useEffect(() => {
    const todayIndex = weekDays.findIndex(day => isToday(day));
    if (todayIndex !== -1) {
      setCurrentDayIndex(todayIndex);
    } else {
      // Find first non-past day in the week
      const firstNonPastDayIndex = weekDays.findIndex(day => !isPast(startOfDay(day)) || isToday(day));
      setCurrentDayIndex(firstNonPastDayIndex !== -1 ? firstNonPastDayIndex : 0);
    }
  }, [currentWeek]);

  // Handle scroll for sticky date on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const dateElement = document.getElementById('mobile-date-header');
      const snacksElement = document.querySelector('[data-meal-type="snacks"]');
      
      if (dateElement && snacksElement) {
        const dateRect = dateElement.getBoundingClientRect();
        const snacksRect = snacksElement.getBoundingClientRect();
        
        // Show sticky when date header is scrolled past
        const shouldShowSticky = dateRect.bottom < 80; // Account for navigation height
        
        // Hide sticky when reaching snacks section
        const shouldHideSticky = snacksRect.top < 120;
        
        setIsDateSticky(shouldShowSticky && !shouldHideSticky);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, currentDayIndex]);

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: FiCoffee, color: 'from-yellow-400 to-orange-500' },
    { key: 'lunch', label: 'Lunch', icon: FiSun, color: 'from-blue-400 to-cyan-500' },
    { key: 'dinner', label: 'Dinner', icon: FiSunset, color: 'from-purple-400 to-pink-500' },
    { key: 'snacks', label: 'Snacks', icon: FiMoreHorizontal, color: 'from-green-400 to-emerald-500' }
  ];

  // Mobile-optimized motion variants
  const mobileMotionVariants = {
    container: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    item: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }
  };

  // Desktop motion variants
  const desktopMotionVariants = {
    container: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    item: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    }
  };

  const motionVariants = isMobile ? mobileMotionVariants : desktopMotionVariants;

  // Check if we can navigate to previous week
  const canGoToPreviousWeek = () => {
    const previousWeek = subWeeks(currentWeek, 1);
    return !isBefore(addDays(previousWeek, 6), today);
  };

  // Mobile day navigation - updated to prevent past dates
  const canGoToPreviousDay = () => {
    if (currentDayIndex > 0) {
      // Check if previous day in current week is not past
      const previousDay = weekDays[currentDayIndex - 1];
      return !isPast(startOfDay(previousDay)) || isToday(previousDay);
    }
    // Check if we can go to previous week and if the last day of previous week is not past
    if (canGoToPreviousWeek()) {
      const previousWeek = subWeeks(currentWeek, 1);
      const lastDayOfPreviousWeek = addDays(previousWeek, 6);
      return !isPast(startOfDay(lastDayOfPreviousWeek)) || isToday(lastDayOfPreviousWeek);
    }
    return false;
  };

  const canGoToNextDay = () => {
    return currentDayIndex < 6 || true; // Always allow going to next day/week
  };

  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      const previousDay = weekDays[currentDayIndex - 1];
      // Only navigate if the previous day is not past
      if (!isPast(startOfDay(previousDay)) || isToday(previousDay)) {
        setCurrentDayIndex(currentDayIndex - 1);
      }
    } else if (canGoToPreviousWeek()) {
      const previousWeek = subWeeks(currentWeek, 1);
      const lastDayOfPreviousWeek = addDays(previousWeek, 6);
      // Only navigate if the last day of previous week is not past
      if (!isPast(startOfDay(lastDayOfPreviousWeek)) || isToday(lastDayOfPreviousWeek)) {
        setCurrentWeek(previousWeek);
        setCurrentDayIndex(6);
      }
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < 6) {
      setCurrentDayIndex(currentDayIndex + 1);
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
      setCurrentDayIndex(0);
    }
  };

  const handlePrevWeek = () => {
    if (canGoToPreviousWeek()) {
      setCurrentWeek(subWeeks(currentWeek, 1));
    }
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleAddMeal = (date, mealType) => {
    if (isPast(startOfDay(date)) && !isToday(date)) {
      return;
    }
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setShowMealModal(true);
  };

  const handleRemoveMeal = (date, mealType, recipeId = null) => {
    if (window.confirm('Are you sure you want to remove this meal from your plan?')) {
      removeMealFromPlan(date, mealType, recipeId);
    }
  };

  const handleCloseModal = () => {
    setShowMealModal(false);
    setSelectedDate(null);
    setSelectedMealType(null);
  };

  const isDatePast = (date) => {
    return isPast(startOfDay(date)) && !isToday(date);
  };

  const getDateStatus = (date) => {
    if (isToday(date)) return 'today';
    if (isDatePast(date)) return 'past';
    return 'future';
  };

  // Mobile Single Day View - Optimized for performance
  const MobileDayView = () => {
    const currentDay = weekDays[currentDayIndex];
    const dateKey = format(currentDay, 'yyyy-MM-dd');
    const dayMeals = weekMeals[dateKey];
    const dateStatus = getDateStatus(currentDay);
    const isPastDate = dateStatus === 'past';

    // Don't render if it's a past date on mobile
    if (isPastDate && isMobile) {
      return null;
    }

    return (
      <div className="md:hidden">
        {/* Mobile Header */}
        <motion.div
          {...motionVariants.container}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text-stable mb-1">
              Meal Calendar
            </h1>
            <p className="text-gray-600 text-sm">Tap arrows to navigate</p>
          </div>
          <SafeIcon icon={FiCalendar} className="w-8 h-8 text-orange-500" />
        </motion.div>

        {/* Mobile Date Navigation */}
        <motion.div
          id="mobile-date-header"
          {...motionVariants.container}
          transition={{ duration: 0.15 }}
          className="bg-white rounded-2xl shadow-lg border border-orange-100 p-4 mb-6 motion-safe"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevDay}
              disabled={!canGoToPreviousDay()}
              className={`p-3 rounded-xl transition-colors motion-safe ${
                canGoToPreviousDay()
                  ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 active:bg-orange-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <SafeIcon icon={FiChevronLeft} className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className={`text-xl font-bold ${
                dateStatus === 'today' ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {format(currentDay, 'EEEE')}
                {dateStatus === 'today' && (
                  <span className="ml-2 text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {format(currentDay, 'MMMM d, yyyy')}
              </div>
            </div>

            <button
              onClick={handleNextDay}
              disabled={!canGoToNextDay()}
              className={`p-3 rounded-xl transition-colors motion-safe ${
                canGoToNextDay()
                  ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 active:bg-orange-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <SafeIcon icon={FiChevronRight} className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Sticky Date Header */}
        <AnimatePresence>
          {isDateSticky && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-orange-100 z-40 py-3 px-4 motion-safe"
            >
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  dateStatus === 'today' ? 'text-orange-600' : 'text-gray-900'
                }`}>
                  {format(currentDay, 'EEEE, MMMM d')}
                  {dateStatus === 'today' && (
                    <span className="ml-2 text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Meals List */}
        <motion.div
          key={currentDayIndex}
          {...motionVariants.container}
          transition={{ duration: 0.15 }}
          className="space-y-4 motion-safe"
          style={{ paddingTop: isDateSticky ? '60px' : '0' }}
        >
          {mealTypes.map((mealType, index) => {
            const meal = dayMeals?.[mealType.key];
            return (
              <motion.div
                key={mealType.key}
                data-meal-type={mealType.key}
                {...motionVariants.item}
                transition={{ duration: 0.1, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden motion-safe"
              >
                {/* Meal Type Header */}
                <div className={`bg-gradient-to-r ${mealType.color} p-4 text-white`}>
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={mealType.icon} className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">{mealType.label}</h3>
                  </div>
                </div>

                {/* Meal Content */}
                <div className="p-4">
                  {mealType.key === 'snacks' ? (
                    <div className="space-y-3">
                      {meal?.map((snack, snackIndex) => (
                        <motion.div
                          key={`${snack.id}-${snackIndex}`}
                          {...motionVariants.item}
                          transition={{ duration: 0.1 }}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 relative motion-safe"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-green-800 mb-1">
                                {snack.title}
                              </div>
                              <div className="text-sm text-green-600">
                                {snack.prepTime} minutes • {snack.servings} servings
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMeal(currentDay, mealType.key, snack.id)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors motion-safe"
                              style={{ 
                                touchAction: 'manipulation',
                                WebkitTapHighlightColor: 'transparent'
                              }}
                            >
                              <SafeIcon icon={FiX} className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      <button
                        onClick={() => handleAddMeal(currentDay, mealType.key)}
                        className="w-full p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors duration-200 flex items-center justify-center space-x-2 active:bg-green-100 motion-safe"
                        style={{ 
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        <SafeIcon icon={FiPlus} className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-medium">Add Snack</span>
                      </button>
                    </div>
                  ) : meal ? (
                    <motion.div
                      {...motionVariants.item}
                      transition={{ duration: 0.1 }}
                      className="bg-gradient-to-r from-gray-50 to-orange-50 p-4 rounded-xl border border-orange-200 relative motion-safe"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {meal.title}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {meal.prepTime} minutes • {meal.servings} servings
                          </div>
                          <div className="text-sm text-gray-500">
                            {meal.category}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMeal(currentDay, mealType.key)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors motion-safe"
                          style={{ 
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          <SafeIcon icon={FiX} className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => handleAddMeal(currentDay, mealType.key)}
                      className="w-full p-6 border-2 border-dashed border-orange-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors duration-200 flex items-center justify-center space-x-2 active:bg-orange-100 motion-safe"
                      style={{ 
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      <SafeIcon icon={FiPlus} className="w-6 h-6 text-orange-500" />
                      <span className="text-orange-600 font-medium">Add {mealType.label}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Navigation Tips */}
        <motion.div
          {...motionVariants.container}
          transition={{ duration: 0.15, delay: 0.1 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 motion-safe"
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiIcons.FiInfo} className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Navigation Tips:</p>
              <p>• Use arrow buttons to navigate between days</p>
              <p>• Tap plus buttons to add meals</p>
              <p>• Only current and future dates are shown</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Desktop Week View (with reduced motion for mobile)
  const DesktopWeekView = () => (
    <div className="hidden md:block">
      {/* Header */}
      <motion.div
        {...motionVariants.container}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text-stable mb-2">
            Meal Calendar
          </h1>
          <p className="text-gray-600">Plan your weekly meals</p>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={canGoToPreviousWeek() && !isMobile ? { scale: 1.1 } : {}}
            whileTap={canGoToPreviousWeek() ? { scale: 0.9 } : {}}
            onClick={handlePrevWeek}
            disabled={!canGoToPreviousWeek()}
            className={`p-2 rounded-xl shadow-lg border border-orange-100 transition-colors ${
              canGoToPreviousWeek()
                ? 'bg-white hover:bg-orange-50 cursor-pointer'
                : 'bg-gray-100 cursor-not-allowed opacity-50'
            }`}
          >
            <SafeIcon icon={FiChevronLeft} className={`w-5 h-5 ${
              canGoToPreviousWeek() ? 'text-gray-600' : 'text-gray-400'
            }`} />
          </motion.button>

          <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
            {format(currentWeek, 'MMMM d')} - {format(addDays(currentWeek, 6), 'MMMM d, yyyy')}
          </div>

          <motion.button
            whileHover={!isMobile ? { scale: 1.1 } : {}}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextWeek}
            className="p-2 bg-white rounded-xl shadow-lg border border-orange-100 hover:bg-orange-50 transition-colors"
          >
            <SafeIcon icon={FiChevronRight} className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </motion.div>

      {/* Navigation Hint for Disabled Previous Button */}
      {!canGoToPreviousWeek() && (
        <motion.div
          {...motionVariants.container}
          transition={{ duration: 0.2 }}
          className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2"
        >
          <SafeIcon icon={FiClock} className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-800">
            You can only view the current week and future weeks for meal planning.
          </p>
        </motion.div>
      )}

      {/* Calendar Grid */}
      <motion.div
        {...motionVariants.container}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden"
      >
        {/* Day Headers */}
        <div className="grid grid-cols-8 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="p-4"></div>
          {weekDays.map((day) => {
            const dateStatus = getDateStatus(day);
            return (
              <div
                key={day.toISOString()}
                className={`p-4 text-center border-r border-orange-100 last:border-r-0 relative ${
                  dateStatus === 'past' ? 'opacity-50' : ''
                }`}
              >
                <div className={`font-semibold ${
                  dateStatus === 'past' ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-2xl font-bold mt-1 flex items-center justify-center ${
                  dateStatus === 'today'
                    ? 'text-orange-600'
                    : dateStatus === 'past'
                    ? 'text-gray-400'
                    : 'text-gray-700'
                }`}>
                  {format(day, 'd')}
                  {dateStatus === 'today' && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full ml-1"></div>
                  )}
                  {dateStatus === 'past' && (
                    <SafeIcon icon={FiClock} className="w-3 h-3 ml-1 text-gray-400" />
                  )}
                </div>
                {dateStatus === 'past' && (
                  <div className="text-xs text-gray-400 mt-1">Past</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Meal Rows */}
        {mealTypes.map((mealType) => (
          <div key={mealType.key} className="border-t border-gray-100">
            <div className="grid grid-cols-8">
              <div className="p-4 bg-gray-50 border-r border-gray-100 flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${mealType.color} rounded-lg flex items-center justify-center`}>
                  <SafeIcon icon={mealType.icon} className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">{mealType.label}</span>
              </div>

              {weekDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayMeals = weekMeals[dateKey];
                const meal = dayMeals?.[mealType.key];
                const dateStatus = getDateStatus(day);
                const isPastDate = dateStatus === 'past';

                return (
                  <div
                    key={`${dateKey}-${mealType.key}`}
                    className={`p-2 border-r border-gray-100 last:border-r-0 min-h-[120px] ${
                      isPastDate ? 'bg-gray-50 opacity-60' : ''
                    }`}
                  >
                    {/* Desktop meal content (simplified for performance) */}
                    {mealType.key === 'snacks' ? (
                      <div className="space-y-2">
                        {meal?.map((snack, index) => (
                          <div
                            key={`${snack.id}-${index}`}
                            className={`bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded-lg border border-green-200 group relative ${
                              isPastDate ? 'opacity-70' : ''
                            }`}
                            onMouseEnter={() => !isPastDate && setHoveredMeal(`${dateKey}-${mealType.key}-${index}`)}
                            onMouseLeave={() => setHoveredMeal(null)}
                          >
                            <div className="text-xs font-medium text-green-800 truncate pr-6">
                              {snack.title}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {snack.prepTime}m
                            </div>
                            <AnimatePresence>
                              {!isPastDate && hoveredMeal === `${dateKey}-${mealType.key}-${index}` && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMeal(day, mealType.key, snack.id);
                                  }}
                                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                >
                                  <SafeIcon icon={FiX} className="w-3 h-3" />
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                        {!isPastDate && (
                          <button
                            onClick={() => handleAddMeal(day, mealType.key)}
                            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200 flex items-center justify-center"
                          >
                            <SafeIcon icon={FiPlus} className="w-4 h-4 text-gray-400 hover:text-green-500" />
                          </button>
                        )}
                        {isPastDate && meal?.length === 0 && (
                          <div className="w-full p-2 text-center text-xs text-gray-400 italic">
                            No meal planned
                          </div>
                        )}
                      </div>
                    ) : meal ? (
                      <div
                        className={`bg-gradient-to-r ${mealType.color.replace('to-', 'to-').replace('from-', 'from-').replace('400', '50').replace('500', '100')} p-3 rounded-lg border border-opacity-50 h-full relative group ${
                          isPastDate ? 'opacity-70' : ''
                        }`}
                        onMouseEnter={() => !isPastDate && setHoveredMeal(`${dateKey}-${mealType.key}`)}
                        onMouseLeave={() => setHoveredMeal(null)}
                      >
                        <div className="text-sm font-medium text-gray-800 truncate mb-1 pr-6">
                          {meal.title}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {meal.prepTime} min • {meal.servings} servings
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {meal.category}
                        </div>
                        <AnimatePresence>
                          {!isPastDate && hoveredMeal === `${dateKey}-${mealType.key}` && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMeal(day, mealType.key);
                              }}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                            >
                              <SafeIcon icon={FiX} className="w-3 h-3" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      !isPastDate ? (
                        <button
                          onClick={() => handleAddMeal(day, mealType.key)}
                          className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors duration-200 flex items-center justify-center"
                        >
                          <SafeIcon icon={FiPlus} className="w-5 h-5 text-gray-400 hover:text-orange-500" />
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 italic">
                          No meal planned
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Render Mobile or Desktop View */}
      <MobileDayView />
      <DesktopWeekView />

      {/* Empty State */}
      {recipes.length === 0 && (
        <motion.div
          {...motionVariants.container}
          transition={{ duration: 0.2, delay: 0.3 }}
          className="text-center py-16 mt-8"
        >
          <SafeIcon icon={FiIcons.FiBook} className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No recipes to plan with</h3>
          <p className="text-gray-600 mb-8">Add some recipes first to start planning your meals</p>
        </motion.div>
      )}

      {/* Meal Planning Modal */}
      <AnimatePresence>
        {showMealModal && (
          <MealPlanModal
            date={selectedDate}
            mealType={selectedMealType}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;