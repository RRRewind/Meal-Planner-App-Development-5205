import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';
import CookingMode from '../components/CookingMode';

const { FiSun, FiCoffee, FiSunset, FiMoreHorizontal, FiClock, FiCalendar, FiTrendingUp, FiPlus, FiPlay } = FiIcons;

const Dashboard = () => {
  const { getUpcomingMeals, recipes, getShoppingList } = useMealPlan();
  const { user } = useAuth();
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const upcomingMeals = getUpcomingMeals();
  const shoppingList = getShoppingList();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return FiCoffee;
      case 'lunch': return FiSun;
      case 'dinner': return FiSunset;
      case 'snacks': return FiMoreHorizontal;
      default: return FiCoffee;
    }
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'from-yellow-400 to-orange-500';
      case 'lunch': return 'from-blue-400 to-cyan-500';
      case 'dinner': return 'from-purple-400 to-pink-500';
      case 'snacks': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getDateLabel = (date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const handleStartCooking = (recipe) => {
    setSelectedRecipe(recipe);
    setShowCookingMode(true);
  };

  const todaysMeals = upcomingMeals.filter(meal => isToday(meal.date));
  const upcomingMealsFiltered = upcomingMeals.slice(0, 6);

  const statsCards = [
    {
      title: 'Recipes',
      value: recipes.length,
      icon: FiIcons.FiBook,
      color: 'from-orange-400 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      link: '/recipes'
    },
    {
      title: 'Planned',
      value: upcomingMeals.length,
      icon: FiCalendar,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      link: '/calendar'
    },
    {
      title: 'Shopping',
      value: shoppingList.length,
      icon: FiIcons.FiShoppingCart,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      link: '/shopping'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      {/* Mobile-Optimized Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8"
      >
        {statsCards.map((card, index) => (
          <Link key={card.title} to={card.link}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`bg-gradient-to-r ${card.bgColor} rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border border-orange-100 cursor-pointer transition-all duration-200`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <p className="text-gray-600 text-xs md:text-sm font-medium">{card.title}</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br ${card.color} rounded-lg md:rounded-xl flex items-center justify-center ml-auto md:ml-0`}>
                  <SafeIcon icon={card.icon} className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Today's Meals - Now More Prominent */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden"
        >
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Today's Meals</h2>
              <SafeIcon icon={FiClock} className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            </div>
          </div>
          <div className="p-4 md:p-6">
            {todaysMeals.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {todaysMeals.map((meal, index) => (
                  <motion.div
                    key={`${meal.date}-${meal.mealType}-${meal.recipe?.id || index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl"
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${getMealTypeColor(meal.mealType)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <SafeIcon icon={getMealIcon(meal.mealType)} className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 capitalize text-sm md:text-base truncate">{meal.mealType}</h3>
                      <p className="text-gray-600 text-sm md:text-base truncate">{meal.recipe?.title || 'Unknown Recipe'}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="text-xs md:text-sm text-gray-500 hidden sm:block">
                        {meal.recipe?.prepTime || meal.recipe?.prep_time || 0}m
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStartCooking(meal.recipe)}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiPlay} className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <SafeIcon icon={FiIcons.FiCalendar} className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                <p className="text-gray-500 mb-2 text-sm md:text-base">No meals planned for today</p>
                <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">Start planning your meals</p>
                <Link to="/calendar">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors inline-flex items-center space-x-2 text-sm md:text-base"
                  >
                    <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                    <span>Plan Meals</span>
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Meals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden"
        >
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Upcoming Meals</h2>
              <SafeIcon icon={FiTrendingUp} className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            </div>
          </div>
          <div className="p-4 md:p-6">
            {upcomingMealsFiltered.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {upcomingMealsFiltered.map((meal, index) => (
                  <motion.div
                    key={`${meal.date}-${meal.mealType}-${meal.recipe?.id || index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl"
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${getMealTypeColor(meal.mealType)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <SafeIcon icon={getMealIcon(meal.mealType)} className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{meal.recipe?.title || 'Unknown Recipe'}</h3>
                      <p className="text-gray-600 capitalize text-sm truncate">{meal.mealType} • {getDateLabel(meal.date)}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="text-xs md:text-sm text-gray-500 hidden sm:block">
                        {meal.recipe?.prepTime || meal.recipe?.prep_time || 0}m
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStartCooking(meal.recipe)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiPlay} className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <SafeIcon icon={FiIcons.FiCalendar} className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                <p className="text-gray-500 mb-2 text-sm md:text-base">No upcoming meals planned</p>
                <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">Start planning your week!</p>
                <Link to="/calendar">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors inline-flex items-center space-x-2 text-sm md:text-base"
                  >
                    <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                    <span>Plan Meals</span>
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Start Guide for New Users */}
      {recipes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 md:mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 md:p-8 border border-orange-200"
        >
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <SafeIcon icon={FiTrendingUp} className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Get Started with Meal Planning</h2>
            <p className="text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto text-sm md:text-base">
              Welcome to your meal planning journey! Start by adding your favorite recipes, then plan your weekly meals and generate smart shopping lists.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link to="/recipes">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Add Your First Recipe</span>
                </motion.button>
              </Link>
              <Link to="/calendar">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto border-2 border-orange-500 text-orange-600 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all inline-flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 md:w-5 md:h-5" />
                  <span>View Calendar</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cooking Mode Modal */}
      <AnimatePresence>
        {showCookingMode && selectedRecipe && (
          <CookingMode
            recipe={selectedRecipe}
            onClose={() => {
              setShowCookingMode(false);
              setSelectedRecipe(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;