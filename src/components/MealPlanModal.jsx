import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useMealPlan } from '../context/MealPlanContext';
import CookingMode from './CookingMode';

const { FiX, FiSearch, FiPlus, FiTrash2, FiCoffee, FiSun, FiSunset, FiMoreHorizontal, FiPlay, FiClock, FiUsers } = FiIcons;

const MealPlanModal = ({ date, mealType, onClose }) => {
  const { recipes, addMealToPlan, removeMealFromPlan, getWeekMeals } = useMealPlan();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  const dateKey = format(date, 'yyyy-MM-dd');
  const weekMeals = getWeekMeals();
  const currentMeals = weekMeals[dateKey]?.[mealType] || (mealType === 'snacks' ? [] : null);

  console.log('🎯 MealPlanModal Debug:', {
    date: dateKey,
    mealType,
    recipesCount: recipes.length,
    currentMeals,
    selectedCategory,
    searchTerm
  });

  const getMealIcon = (type) => {
    switch (type) {
      case 'breakfast': return FiCoffee;
      case 'lunch': return FiSun;
      case 'dinner': return FiSunset;
      case 'snacks': return FiMoreHorizontal;
      default: return FiCoffee;
    }
  };

  const getMealColor = (type) => {
    switch (type) {
      case 'breakfast': return 'from-yellow-400 to-orange-500';
      case 'lunch': return 'from-blue-400 to-cyan-500';
      case 'dinner': return 'from-purple-400 to-pink-500';
      case 'snacks': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // Set default category based on meal type
  React.useEffect(() => {
    const mealTypeToCategoryMap = {
      'breakfast': 'Breakfast',
      'lunch': 'Lunch', 
      'dinner': 'Dinner',
      'snacks': 'Snack'
    };
    const defaultCategory = mealTypeToCategoryMap[mealType] || 'all';
    setSelectedCategory(defaultCategory);
  }, [mealType]);

  const filteredRecipes = recipes.filter(recipe => {
    if (!recipe || !recipe.title) return false;
    
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      (recipe.category || '').toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(recipes.map(recipe => recipe.category).filter(Boolean))];

  const handleStartCooking = (recipe) => {
    console.log('🍳 Starting cooking mode for:', recipe.title);
    setSelectedRecipe(recipe);
    setShowCookingMode(true);
  };

  const handleCloseCookingMode = () => {
    setShowCookingMode(false);
    setSelectedRecipe(null);
  };

  const handleAddRecipe = async (recipe) => {
    if (isAdding) return; // Prevent double-clicks
    
    console.log('🍽️ Adding recipe to meal plan:', {
      date: dateKey,
      mealType,
      recipe: recipe.title,
      recipeId: recipe.id
    });

    setIsAdding(true);
    
    try {
      await addMealToPlan(date, mealType, recipe);
      console.log('✅ Recipe added successfully');
      
      // For non-snacks, close the modal after adding
      if (mealType !== 'snacks') {
        setTimeout(() => {
          onClose();
        }, 500); // Small delay to show success
      }
    } catch (error) {
      console.error('❌ Error adding recipe to meal plan:', error);
      alert('Failed to add recipe. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveRecipe = async (recipeId = null) => {
    console.log('🗑️ Removing recipe from meal plan:', {
      date: dateKey,
      mealType,
      recipeId
    });

    try {
      await removeMealFromPlan(date, mealType, recipeId);
      console.log('✅ Recipe removed successfully');
    } catch (error) {
      console.error('❌ Error removing recipe from meal plan:', error);
      alert('Failed to remove recipe. Please try again.');
    }
  };

  return (
    <>
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
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${getMealColor(mealType)} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <SafeIcon icon={getMealIcon(mealType)} className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold capitalize">{mealType} Plan</h2>
                  <p className="text-white text-opacity-90">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </p>
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
          </div>

          <div className="flex flex-col h-[calc(90vh-140px)]">
            {/* Current Meals */}
            {((mealType === 'snacks' && currentMeals.length > 0) || (mealType !== 'snacks' && currentMeals)) && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Current Selection</h3>
                <div className="space-y-2">
                  {mealType === 'snacks' ? (
                    currentMeals.map((snack, index) => (
                      <motion.div
                        key={`${snack.id}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                            <SafeIcon icon={FiMoreHorizontal} className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{snack.title}</div>
                            <div className="text-sm text-gray-600">{snack.prepTime || snack.prep_time || 0} min • {snack.servings} servings</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStartCooking(snack)}
                            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                            title="Start Cooking"
                          >
                            <SafeIcon icon={FiPlay} className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveRecipe(snack.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from Plan"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${getMealColor(mealType)} rounded-lg flex items-center justify-center`}>
                          <SafeIcon icon={getMealIcon(mealType)} className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{currentMeals.title}</div>
                          <div className="text-sm text-gray-600">{currentMeals.prepTime || currentMeals.prep_time || 0} min • {currentMeals.servings} servings</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStartCooking(currentMeals)}
                          className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                          title="Start Cooking"
                        >
                          <SafeIcon icon={FiPlay} className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveRecipe()}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from Plan"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[150px]"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recipe List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {filteredRecipes.map((recipe, index) => (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{recipe.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{recipe.description || 'No description available'}</p>
                          </div>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium ml-2">
                            {recipe.category || 'Other'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiClock} className="w-4 h-4" />
                              <span>{recipe.prepTime || recipe.prep_time || 0}m</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiUsers} className="w-4 h-4" />
                              <span>{recipe.servings || 1}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStartCooking(recipe)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Start Cooking"
                            >
                              <SafeIcon icon={FiPlay} className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAddRecipe(recipe)}
                              disabled={isAdding}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                                isAdding 
                                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                                  : 'bg-orange-500 hover:bg-orange-600 text-white'
                              }`}
                            >
                              <SafeIcon icon={isAdding ? FiClock : FiPlus} className="w-4 h-4" />
                              <span>{isAdding ? 'Adding...' : 'Add'}</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-16">
                  <SafeIcon icon={FiCoffee} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
                  <p className="text-gray-600 mb-4">
                    {recipes.length === 0 
                      ? 'Add some recipes first to start planning meals' 
                      : 'Try adjusting your search or filter criteria'
                    }
                  </p>
                  {recipes.length === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      Add Recipes First
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Cooking Mode Modal */}
      <AnimatePresence>
        {showCookingMode && selectedRecipe && (
          <CookingMode 
            recipe={selectedRecipe} 
            onClose={handleCloseCookingMode} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MealPlanModal;