import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfWeek, addDays, isAfter, isSameDay, startOfDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const MealPlanContext = createContext();

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};

export const MealPlanProvider = ({ children }) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState({});
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [loading, setLoading] = useState(false);

  // Safe localStorage operations
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('LocalStorage getItem error:', e);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('LocalStorage setItem error:', e);
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('LocalStorage removeItem error:', e);
      }
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      loadLocalData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes_mp2025')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recipesError && recipesError.code !== 'PGRST116') {
        console.error('Error loading recipes:', recipesError);
        throw recipesError;
      }

      // Load meal plans
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from('meal_plans_mp2025')
        .select('*')
        .eq('user_id', user.id);

      if (mealPlansError && mealPlansError.code !== 'PGRST116') {
        console.error('Error loading meal plans:', mealPlansError);
        throw mealPlansError;
      }

      // Transform meal plans data
      const mealPlansMap = {};
      if (Array.isArray(mealPlansData)) {
        mealPlansData.forEach(plan => {
          if (plan && plan.date && plan.meal_type) {
            if (!mealPlansMap[plan.date]) {
              mealPlansMap[plan.date] = {};
            }
            if (plan.meal_type === 'snacks') {
              if (!mealPlansMap[plan.date][plan.meal_type]) {
                mealPlansMap[plan.date][plan.meal_type] = [];
              }
              if (plan.recipe_data) {
                mealPlansMap[plan.date][plan.meal_type].push(plan.recipe_data);
              }
            } else {
              mealPlansMap[plan.date][plan.meal_type] = plan.recipe_data;
            }
          }
        });
      }

      // Transform recipes data
      const formattedRecipes = Array.isArray(recipesData) ? recipesData.map(recipe => ({
        ...recipe,
        prepTime: recipe.prep_time || recipe.prepTime || 0,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : []
      })) : [];

      setRecipes(formattedRecipes);
      setMealPlans(mealPlansMap);
      
      console.log('✅ User data loaded successfully');
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to localStorage
      loadLocalData();
    }
    setLoading(false);
  };

  const loadLocalData = () => {
    try {
      const savedRecipes = safeLocalStorage.getItem('mealPlannerRecipes');
      const savedMealPlans = safeLocalStorage.getItem('mealPlannerMealPlans');

      if (savedRecipes) {
        const parsedRecipes = JSON.parse(savedRecipes);
        setRecipes(Array.isArray(parsedRecipes) ? parsedRecipes : []);
      } else {
        setRecipes([]);
      }

      if (savedMealPlans) {
        const parsedMealPlans = JSON.parse(savedMealPlans);
        setMealPlans(typeof parsedMealPlans === 'object' && parsedMealPlans !== null ? parsedMealPlans : {});
      } else {
        setMealPlans({});
      }

      console.log('📱 Local data loaded');
    } catch (error) {
      console.error('Error loading local data:', error);
      setRecipes([]);
      setMealPlans({});
    }
  };

  // Save to localStorage for guests
  useEffect(() => {
    if (!user && recipes.length > 0) {
      safeLocalStorage.setItem('mealPlannerRecipes', JSON.stringify(recipes));
    }
  }, [recipes, user]);

  useEffect(() => {
    if (!user && Object.keys(mealPlans).length > 0) {
      safeLocalStorage.setItem('mealPlannerMealPlans', JSON.stringify(mealPlans));
    }
  }, [mealPlans, user]);

  const addRecipe = async (recipe) => {
    if (!recipe || !recipe.title) {
      console.error('Invalid recipe data');
      return null;
    }

    const newRecipe = {
      ...recipe,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : []
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('recipes_mp2025')
          .insert([{
            id: newRecipe.id,
            user_id: user.id,
            title: newRecipe.title || '',
            description: newRecipe.description || '',
            category: newRecipe.category || 'Other',
            prep_time: Number(newRecipe.prepTime) || 0,
            servings: Number(newRecipe.servings) || 1,
            ingredients: newRecipe.ingredients,
            instructions: newRecipe.instructions,
            created_at: newRecipe.created_at
          }])
          .select()
          .single();

        if (error) throw error;

        const formattedRecipe = {
          ...data,
          prepTime: data.prep_time
        };
        setRecipes(prev => [formattedRecipe, ...prev]);
        return formattedRecipe;
      } catch (error) {
        console.error('Error adding recipe:', error);
        // Fallback to local storage
        setRecipes(prev => [newRecipe, ...prev]);
        return newRecipe;
      }
    } else {
      setRecipes(prev => [newRecipe, ...prev]);
      return newRecipe;
    }
  };

  const updateRecipe = async (id, updatedRecipe) => {
    if (!id || !updatedRecipe) {
      console.error('Invalid update data');
      return;
    }

    if (user) {
      try {
        const { error } = await supabase
          .from('recipes_mp2025')
          .update({
            title: updatedRecipe.title || '',
            description: updatedRecipe.description || '',
            category: updatedRecipe.category || 'Other',
            prep_time: Number(updatedRecipe.prepTime) || 0,
            servings: Number(updatedRecipe.servings) || 1,
            ingredients: Array.isArray(updatedRecipe.ingredients) ? updatedRecipe.ingredients : [],
            instructions: Array.isArray(updatedRecipe.instructions) ? updatedRecipe.instructions : []
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating recipe:', error);
      }
    }

    setRecipes(prev => prev.map(recipe => 
      recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
    ));
  };

  const deleteRecipe = async (id) => {
    if (!id) {
      console.error('Invalid recipe ID');
      return;
    }

    if (user) {
      try {
        const { error } = await supabase
          .from('recipes_mp2025')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        // Also delete from meal plans
        await supabase
          .from('meal_plans_mp2025')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', id);
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }

    setRecipes(prev => prev.filter(recipe => recipe.id !== id));

    // Remove from meal plans
    const updatedMealPlans = { ...mealPlans };
    Object.keys(updatedMealPlans).forEach(date => {
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
        if (updatedMealPlans[date] && updatedMealPlans[date][mealType]) {
          if (mealType === 'snacks' && Array.isArray(updatedMealPlans[date][mealType])) {
            updatedMealPlans[date][mealType] = updatedMealPlans[date][mealType].filter(
              snack => snack && snack.id !== id
            );
          } else if (updatedMealPlans[date][mealType] && updatedMealPlans[date][mealType].id === id) {
            updatedMealPlans[date][mealType] = null;
          }
        }
      });
    });
    setMealPlans(updatedMealPlans);
  };

  const addMealToPlan = async (date, mealType, recipe) => {
    if (!date || !mealType || !recipe) {
      console.error('Invalid meal plan data');
      return;
    }

    const dateKey = format(date, 'yyyy-MM-dd');

    if (user) {
      try {
        await supabase
          .from('meal_plans_mp2025')
          .insert([{
            user_id: user.id,
            recipe_id: recipe.id,
            date: dateKey,
            meal_type: mealType,
            recipe_data: recipe
          }]);
      } catch (error) {
        console.error('Error adding meal to plan:', error);
      }
    }

    setMealPlans(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: mealType === 'snacks' 
          ? [...(prev[dateKey]?.[mealType] || []), recipe]
          : recipe
      }
    }));
  };

  const removeMealFromPlan = async (date, mealType, recipeId = null) => {
    if (!date || !mealType) {
      console.error('Invalid meal plan removal data');
      return;
    }

    const dateKey = format(date, 'yyyy-MM-dd');

    if (user) {
      try {
        let query = supabase
          .from('meal_plans_mp2025')
          .delete()
          .eq('user_id', user.id)
          .eq('date', dateKey)
          .eq('meal_type', mealType);

        if (recipeId) {
          query = query.eq('recipe_id', recipeId);
        }

        await query;
      } catch (error) {
        console.error('Error removing meal from plan:', error);
      }
    }

    setMealPlans(prev => {
      const updated = { ...prev };
      if (mealType === 'snacks' && recipeId) {
        if (updated[dateKey] && Array.isArray(updated[dateKey].snacks)) {
          updated[dateKey] = {
            ...updated[dateKey],
            snacks: updated[dateKey].snacks.filter(snack => snack && snack.id !== recipeId)
          };
        }
      } else {
        updated[dateKey] = {
          ...updated[dateKey],
          [mealType]: null
        };
      }
      return updated;
    });
  };

  const getTodaysMeals = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return mealPlans[today] || {};
  };

  const getUpcomingMeals = () => {
    const today = startOfDay(new Date());
    const upcomingMeals = [];

    Object.entries(mealPlans).forEach(([dateKey, meals]) => {
      if (!meals || typeof meals !== 'object') return;
      
      try {
        const mealDate = new Date(dateKey);
        if (isAfter(mealDate, today) || isSameDay(mealDate, today)) {
          ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
            if (meals[mealType]) {
              if (mealType === 'snacks' && Array.isArray(meals[mealType])) {
                meals[mealType].forEach(snack => {
                  if (snack && snack.title) {
                    upcomingMeals.push({
                      date: mealDate,
                      mealType,
                      recipe: snack
                    });
                  }
                });
              } else if (meals[mealType] && meals[mealType].title) {
                upcomingMeals.push({
                  date: mealDate,
                  mealType,
                  recipe: meals[mealType]
                });
              }
            }
          });
        }
      } catch (e) {
        console.warn('Error processing meal date:', dateKey, e);
      }
    });

    return upcomingMeals.sort((a, b) => a.date - b.date);
  };

  const getShoppingList = () => {
    const ingredientMap = new Map();
    const upcomingMeals = getUpcomingMeals();

    upcomingMeals.forEach(({ recipe }) => {
      if (recipe && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ingredient => {
          if (ingredient && ingredient.name && typeof ingredient.name === 'string') {
            const key = ingredient.name.toLowerCase().trim();
            if (key && key.length > 0) {
              if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key);
                ingredientMap.set(key, {
                  ...existing,
                  quantity: (existing.quantity || 0) + (Number(ingredient.quantity) || 0),
                  recipes: [...(existing.recipes || []), recipe.title].filter(Boolean)
                });
              } else {
                ingredientMap.set(key, {
                  ...ingredient,
                  quantity: Number(ingredient.quantity) || 0,
                  recipes: [recipe.title].filter(Boolean)
                });
              }
            }
          }
        });
      }
    });

    return Array.from(ingredientMap.values())
      .filter(item => item && item.name)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  };

  const getWeekMeals = (weekStart = currentWeek) => {
    const weekMeals = {};
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      weekMeals[dateKey] = mealPlans[dateKey] || {};
    }
    return weekMeals;
  };

  const value = {
    recipes,
    mealPlans,
    currentWeek,
    loading,
    setCurrentWeek,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addMealToPlan,
    removeMealFromPlan,
    getTodaysMeals,
    getUpcomingMeals,
    getShoppingList,
    getWeekMeals
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
};