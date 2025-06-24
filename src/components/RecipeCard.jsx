import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import CookingMode from './CookingMode';

const { FiClock, FiUsers, FiEdit3, FiTrash2, FiChef, FiPlay } = FiIcons;

const RecipeCard = ({ recipe, onEdit, onDelete }) => {
  const [showCookingMode, setShowCookingMode] = useState(false);

  // Safely access recipe properties with fallbacks
  if (!recipe) {
    return null;
  }

  const title = recipe.title || 'Untitled Recipe';
  const description = recipe.description || '';
  const category = recipe.category || 'Other';
  const prepTime = recipe.prepTime || recipe.prep_time || 0;
  const servings = recipe.servings || 1;
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

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
    return colors[category] || 'from-gray-400 to-gray-500';
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(recipe);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(recipe.id);
    }
  };

  const handleCookingMode = () => {
    setShowCookingMode(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getCategoryColor(category)} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                {category}
              </span>
              <SafeIcon icon={FiChef} className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>
            {description && (
              <p className="text-white text-opacity-90 text-sm line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Recipe Stats */}
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiClock} className="w-4 h-4" />
              <span>{prepTime} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiUsers} className="w-4 h-4" />
              <span>{servings} servings</span>
            </div>
          </div>

          {/* Ingredients Preview */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
            <div className="text-sm text-gray-600">
              {ingredients.slice(0, 3).map((ingredient, index) => (
                <div key={index} className="flex justify-between">
                  <span>{ingredient?.name || 'Unknown ingredient'}</span>
                  <span>
                    {ingredient?.quantity || 0} {ingredient?.unit || ''}
                  </span>
                </div>
              ))}
              {ingredients.length > 3 && (
                <div className="text-orange-600 font-medium mt-1">
                  +{ingredients.length - 3} more ingredients
                </div>
              )}
              {ingredients.length === 0 && (
                <div className="text-gray-400 italic">
                  No ingredients listed
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {/* Primary Action - Start Cooking */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCookingMode}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <SafeIcon icon={FiPlay} className="w-5 h-5" />
              <span>Start Cooking</span>
            </motion.button>

            {/* Secondary Actions */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                <span>Edit</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cooking Mode Modal */}
      <AnimatePresence>
        {showCookingMode && (
          <CookingMode
            recipe={recipe}
            onClose={() => setShowCookingMode(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default RecipeCard;