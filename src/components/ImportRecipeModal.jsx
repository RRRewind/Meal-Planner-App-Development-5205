import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const { FiX, FiDownload, FiCheck, FiAlertCircle, FiClock, FiUsers, FiBook } = FiIcons;

const ImportRecipeModal = ({ isOpen, onClose, recipeData }) => {
  const { addRecipe } = useMealPlan();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mappedRecipe, setMappedRecipe] = useState(null);

  useEffect(() => {
    if (recipeData && isOpen) {
      const mapped = mapWPRecipeToApp(recipeData);
      setMappedRecipe(mapped);
      setError('');
      setImportSuccess(false);
    }
  }, [recipeData, isOpen]);

  // Map WP Recipe Maker fields to our app format
  const mapWPRecipeToApp = (wpRecipe) => {
    try {
      // Handle different time formats (minutes, hours:minutes, etc.)
      const parseTime = (timeString) => {
        if (!timeString) return 0;
        
        // If it's already a number, return it
        if (typeof timeString === 'number') return timeString;
        
        const str = timeString.toString().toLowerCase();
        
        // Handle "PT15M" format (ISO 8601 duration)
        if (str.startsWith('pt')) {
          const minutes = str.match(/(\d+)m/);
          const hours = str.match(/(\d+)h/);
          return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
        }
        
        // Handle "1 hour 30 minutes" format
        const hourMatch = str.match(/(\d+)\s*h(our)?s?/);
        const minuteMatch = str.match(/(\d+)\s*m(in|inute)?s?/);
        
        const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
        const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
        
        return hours * 60 + minutes;
      };

      // Map category from WP Recipe Maker to our categories
      const mapCategory = (wpCategory) => {
        if (!wpCategory) return 'Other';
        
        const categoryMap = {
          'appetizer': 'Appetizer',
          'appetizers': 'Appetizer',
          'breakfast': 'Breakfast',
          'lunch': 'Lunch', 
          'dinner': 'Dinner',
          'main': 'Main Course',
          'main course': 'Main Course',
          'main dish': 'Main Course',
          'side': 'Side Dish',
          'side dish': 'Side Dish',
          'dessert': 'Dessert',
          'desserts': 'Dessert',
          'snack': 'Snack',
          'snacks': 'Snack',
          'soup': 'Soup',
          'soups': 'Soup',
          'salad': 'Salad',
          'salads': 'Salad',
          'beverage': 'Beverage',
          'beverages': 'Beverage',
          'drink': 'Beverage',
          'drinks': 'Beverage'
        };
        
        const normalized = wpCategory.toLowerCase().trim();
        return categoryMap[normalized] || wpCategory;
      };

      // Parse ingredients from WP Recipe Maker format
      const parseIngredients = (wpIngredients) => {
        if (!wpIngredients || !Array.isArray(wpIngredients)) return [];
        
        return wpIngredients.map(ingredient => {
          // WP Recipe Maker ingredient structure
          const name = ingredient.name || ingredient.ingredient || '';
          const amount = ingredient.amount || ingredient.quantity || '';
          const unit = ingredient.unit || '';
          const notes = ingredient.notes || '';
          
          // Combine name and notes if notes exist
          const fullName = notes ? `${name} (${notes})` : name;
          
          return {
            name: fullName,
            quantity: parseFloat(amount) || 1,
            unit: unit || 'piece',
            category: 'Other' // Default category, user can change later
          };
        }).filter(ing => ing.name.trim());
      };

      // Parse instructions from WP Recipe Maker format
      const parseInstructions = (wpInstructions) => {
        if (!wpInstructions) return [''];
        
        if (Array.isArray(wpInstructions)) {
          return wpInstructions.map(instruction => {
            if (typeof instruction === 'string') return instruction;
            return instruction.text || instruction.instruction || '';
          }).filter(inst => inst.trim());
        }
        
        if (typeof wpInstructions === 'string') {
          // Split by common delimiters
          return wpInstructions
            .split(/\n|\d+\.\s*/)
            .map(inst => inst.trim())
            .filter(inst => inst.length > 0);
        }
        
        return [''];
      };

      const mapped = {
        title: wpRecipe.name || wpRecipe.title || 'Imported Recipe',
        description: wpRecipe.summary || wpRecipe.description || '',
        category: mapCategory(wpRecipe.course || wpRecipe.category),
        prepTime: parseTime(wpRecipe.prep_time || wpRecipe.prepTime),
        cookTime: parseTime(wpRecipe.cook_time || wpRecipe.cookTime),
        chillTime: parseTime(wpRecipe.chill_time || wpRecipe.chillTime || wpRecipe.total_time) - parseTime(wpRecipe.prep_time || wpRecipe.prepTime) - parseTime(wpRecipe.cook_time || wpRecipe.cookTime),
        servings: parseInt(wpRecipe.servings || wpRecipe.yield) || 4,
        ingredients: parseIngredients(wpRecipe.ingredients),
        instructions: parseInstructions(wpRecipe.instructions || wpRecipe.method),
        // Store original data for reference
        originalSource: 'WP Recipe Maker',
        originalUrl: wpRecipe.url || window.location.href
      };

      // Ensure chill time isn't negative
      if (mapped.chillTime < 0) mapped.chillTime = 0;

      return mapped;
    } catch (error) {
      console.error('Error mapping WP recipe:', error);
      throw new Error('Failed to parse recipe data. Please check the recipe format.');
    }
  };

  const handleImport = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!mappedRecipe) {
      setError('No recipe data to import');
      return;
    }

    setImporting(true);
    setError('');

    try {
      console.log('🍽️ Importing recipe to meal planner:', mappedRecipe.title);
      
      const result = await addRecipe(mappedRecipe);
      
      if (result) {
        setImportSuccess(true);
        console.log('✅ Recipe imported successfully:', result.id);
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
          setImportSuccess(false);
        }, 2000);
      } else {
        throw new Error('Failed to save recipe');
      }
    } catch (error) {
      console.error('❌ Recipe import error:', error);
      setError(error.message || 'Failed to import recipe. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <SafeIcon icon={FiDownload} className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Import Recipe</h2>
                  <p className="text-white text-opacity-90 text-sm">Add to your meal planner</p>
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

          <div className="p-6">
            {/* Success State */}
            {importSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiCheck} className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Recipe Imported!</h3>
                <p className="text-gray-600">Successfully added to your recipe collection</p>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start space-x-3"
              >
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Import Failed</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Recipe Preview */}
            {mappedRecipe && !importSuccess && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{mappedRecipe.title}</h3>
                  {mappedRecipe.description && (
                    <p className="text-gray-600 text-sm">{mappedRecipe.description}</p>
                  )}
                </div>

                {/* Recipe Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <SafeIcon icon={FiClock} className="w-4 h-4" />
                      <span className="text-sm font-medium">Total Time</span>
                    </div>
                    <div className="font-bold text-gray-900">
                      {(mappedRecipe.prepTime + mappedRecipe.cookTime + mappedRecipe.chillTime)} min
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <SafeIcon icon={FiUsers} className="w-4 h-4" />
                      <span className="text-sm font-medium">Servings</span>
                    </div>
                    <div className="font-bold text-gray-900">{mappedRecipe.servings}</div>
                  </div>
                </div>

                {/* Time Breakdown */}
                {(mappedRecipe.prepTime > 0 || mappedRecipe.cookTime > 0 || mappedRecipe.chillTime > 0) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Time Breakdown:</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {mappedRecipe.prepTime > 0 && (
                        <span>{mappedRecipe.prepTime}m prep</span>
                      )}
                      {mappedRecipe.cookTime > 0 && (
                        <span>{mappedRecipe.cookTime}m cook</span>
                      )}
                      {mappedRecipe.chillTime > 0 && (
                        <span>{mappedRecipe.chillTime}m chill</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Category and Ingredients Count */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Category: <span className="font-medium">{mappedRecipe.category}</span></span>
                  <span>{mappedRecipe.ingredients.length} ingredients</span>
                </div>

                {/* Import Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleImport}
                  disabled={importing}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                    importing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                  } text-white`}
                >
                  {importing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiDownload} className="w-5 h-5" />
                      <span>{user ? 'Import Recipe' : 'Sign In to Import'}</span>
                    </>
                  )}
                </motion.button>

                {/* Login Hint */}
                {!user && (
                  <p className="text-center text-sm text-gray-500">
                    You'll need to sign in or create an account to save recipes
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            defaultTab="signup"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ImportRecipeModal;