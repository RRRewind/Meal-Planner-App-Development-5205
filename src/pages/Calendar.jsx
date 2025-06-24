import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, isPast, startOfDay, isToday } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useMealPlan } from '../context/MealPlanContext';
import MealPlanModal from '../components/MealPlanModal';

const { FiChevronLeft, FiChevronRight, FiPlus, FiCoffee, FiSun, FiSunset, FiMoreHorizontal, FiX, FiClock } = FiIcons;

const Calendar = () => {
  const { currentWeek, setCurrentWeek, getWeekMeals, recipes, removeMealFromPlan } = useMealPlan();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [hoveredMeal, setHoveredMeal] = useState(null);

  const weekMeals = getWeekMeals(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  
  // Get current date in user's timezone
  const now = new Date();
  const today = startOfDay(now);

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: FiCoffee, color: 'from-yellow-400 to-orange-500' },
    { key: 'lunch', label: 'Lunch', icon: FiSun, color: 'from-blue-400 to-cyan-500' },
    { key: 'dinner', label: 'Dinner', icon: FiSunset, color: 'from-purple-400 to-pink-500' },
    { key: 'snacks', label: 'Snacks', icon: FiMoreHorizontal, color: 'from-green-400 to-emerald-500' }
  ];

  const handlePrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleAddMeal = (date, mealType) => {
    // Don't allow adding meals to past dates (except today)
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

  // Check if a date is in the past (but not today)
  const isDatePast = (date) => {
    return isPast(startOfDay(date)) && !isToday(date);
  };

  // Get date status for styling
  const getDateStatus = (date) => {
    if (isToday(date)) return 'today';
    if (isDatePast(date)) return 'past';
    return 'future';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Meal Calendar
          </h1>
          <p className="text-gray-600">Plan your weekly meals</p>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevWeek}
            className="p-2 bg-white rounded-xl shadow-lg border border-orange-100 hover:bg-orange-50 transition-colors"
          >
            <SafeIcon icon={FiChevronLeft} className="w-5 h-5 text-gray-600" />
          </motion.button>

          <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
            {format(currentWeek, 'MMMM d')} - {format(addDays(currentWeek, 6), 'MMMM d, yyyy')}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextWeek}
            className="p-2 bg-white rounded-xl shadow-lg border border-orange-100 hover:bg-orange-50 transition-colors"
          >
            <SafeIcon icon={FiChevronRight} className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden"
      >
        {/* Day Headers */}
        <div className="grid grid-cols-8 bg-gradient-to-r from-orange-50 to-red-50">
          {/* Empty space for meal type label column */}
          <div className="p-4"></div>
          
          {/* Day headers with status indicators */}
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
                  dateStatus === 'today' ? 'text-orange-600' : 
                  dateStatus === 'past' ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  {format(day, 'd')}
                  {dateStatus === 'today' && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full ml-1 animate-pulse"></div>
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
              {/* Meal Type Label */}
              <div className="p-4 bg-gray-50 border-r border-gray-100 flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${mealType.color} rounded-lg flex items-center justify-center`}>
                  <SafeIcon icon={mealType.icon} className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">{mealType.label}</span>
              </div>

              {/* Daily Meal Slots */}
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
                    {mealType.key === 'snacks' ? (
                      <div className="space-y-2">
                        {meal?.map((snack, index) => (
                          <motion.div
                            key={`${snack.id}-${index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
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
                            
                            {/* Remove Button for Snacks - Only show for current/future dates */}
                            <AnimatePresence>
                              {!isPastDate && hoveredMeal === `${dateKey}-${mealType.key}-${index}` && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
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
                          </motion.div>
                        ))}
                        
                        {/* Add button - Only show for current/future dates */}
                        {!isPastDate && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddMeal(day, mealType.key)}
                            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 flex items-center justify-center"
                          >
                            <SafeIcon icon={FiPlus} className="w-4 h-4 text-gray-400 hover:text-green-500" />
                          </motion.button>
                        )}
                        
                        {/* Past date indicator */}
                        {isPastDate && meal?.length === 0 && (
                          <div className="w-full p-2 text-center text-xs text-gray-400 italic">
                            No meal planned
                          </div>
                        )}
                      </div>
                    ) : meal ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
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

                        {/* Remove Button for Regular Meals - Only show for current/future dates */}
                        <AnimatePresence>
                          {!isPastDate && hoveredMeal === `${dateKey}-${mealType.key}` && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
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
                      </motion.div>
                    ) : (
                      // Add button or past date indicator
                      !isPastDate ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddMeal(day, mealType.key)}
                          className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 flex items-center justify-center"
                        >
                          <SafeIcon icon={FiPlus} className="w-5 h-5 text-gray-400 hover:text-orange-500" />
                        </motion.button>
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

      {/* Empty State */}
      {recipes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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