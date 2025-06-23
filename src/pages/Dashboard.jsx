import React from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useMealPlan } from '../context/MealPlanContext';

const { FiSun, FiCoffee, FiSunset, FiMoreHorizontal, FiClock, FiCalendar, FiTrendingUp } = FiIcons;

const Dashboard = () => {
  const { getUpcomingMeals, recipes, getShoppingList } = useMealPlan();
  const upcomingMeals = getUpcomingMeals();
  const shoppingList = getShoppingList();

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

  const todaysMeals = upcomingMeals.filter(meal => isToday(meal.date));
  const upcomingMealsFiltered = upcomingMeals.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          Welcome Back!
        </h1>
        <p className="text-gray-600 text-lg">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Recipes</p>
              <p className="text-3xl font-bold text-gray-900">{recipes.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiBook} className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">This Week's Meals</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingMeals.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiCalendar} className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Shopping Items</p>
              <p className="text-3xl font-bold text-gray-900">{shoppingList.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiShoppingCart} className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Meals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Today's Meals</h2>
              <SafeIcon icon={FiClock} className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          
          <div className="p-6">
            {todaysMeals.length > 0 ? (
              <div className="space-y-4">
                {todaysMeals.map((meal, index) => (
                  <motion.div
                    key={`${meal.date}-${meal.mealType}-${meal.recipe.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${getMealTypeColor(meal.mealType)} rounded-xl flex items-center justify-center`}>
                      <SafeIcon icon={getMealIcon(meal.mealType)} className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 capitalize">{meal.mealType}</h3>
                      <p className="text-gray-600">{meal.recipe.title}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {meal.recipe.prepTime} min
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiIcons.FiCalendar} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No meals planned for today</p>
                <p className="text-sm text-gray-400 mt-1">Visit the calendar to plan your meals</p>
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
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Meals</h2>
              <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          
          <div className="p-6">
            {upcomingMealsFiltered.length > 0 ? (
              <div className="space-y-4">
                {upcomingMealsFiltered.map((meal, index) => (
                  <motion.div
                    key={`${meal.date}-${meal.mealType}-${meal.recipe.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${getMealTypeColor(meal.mealType)} rounded-xl flex items-center justify-center`}>
                      <SafeIcon icon={getMealIcon(meal.mealType)} className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{meal.recipe.title}</h3>
                      <p className="text-gray-600 capitalize">{meal.mealType} • {getDateLabel(meal.date)}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {meal.recipe.prepTime}m
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiIcons.FiCalendar} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming meals planned</p>
                <p className="text-sm text-gray-400 mt-1">Start planning your week!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;