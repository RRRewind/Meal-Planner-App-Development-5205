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

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Load from localStorage for guests
      loadLocalData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load recipes from Supabase
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes_mp2025')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recipesError) throw recipesError;

      // Load meal plans from Supabase
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from('meal_plans_mp2025')
        .select('*')
        .eq('user_id', user.id);

      if (mealPlansError) throw mealPlansError;

      // Transform meal plans data
      const mealPlansMap = {};
      mealPlansData?.forEach(plan => {
        if (!mealPlansMap[plan.date]) {
          mealPlansMap[plan.date] = {};
        }
        if (plan.meal_type === 'snacks') {
          if (!mealPlansMap[plan.date][plan.meal_type]) {
            mealPlansMap[plan.date][plan.meal_type] = [];
          }
          mealPlansMap[plan.date][plan.meal_type].push(plan.recipe_data);
        } else {
          mealPlansMap[plan.date][plan.meal_type] = plan.recipe_data;
        }
      });

      setRecipes(recipesData || []);
      setMealPlans(mealPlansMap);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to localStorage
      loadLocalData();
    }
    setLoading(false);
  };

  const loadLocalData = () => {
    const savedRecipes = localStorage.getItem('mealPlannerRecipes');
    const savedMealPlans = localStorage.getItem('mealPlannerMealPlans');

    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
    if (savedMealPlans) {
      setMealPlans(JSON.parse(savedMealPlans));
    }
  };

  // Save to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('mealPlannerRecipes', JSON.stringify(recipes));
    }
  }, [recipes, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('mealPlannerMealPlans', JSON.stringify(mealPlans));
    }
  }, [mealPlans, user]);

  const addRecipe = async (recipe) => {
    const newRecipe = {
      ...recipe,
      id: uuidv4(),
      created_at: new Date().toISOString()
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('recipes_mp2025')
          .insert([{
            id: newRecipe.id,
            user_id: user.id,
            title: newRecipe.title,
            description: newRecipe.description,
            category: newRecipe.category,
            prep_time: newRecipe.prepTime,
            servings: newRecipe.servings,
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
    if (user) {
      try {
        const { error } = await supabase
          .from('recipes_mp2025')
          .update({
            title: updatedRecipe.title,
            description: updatedRecipe.description,
            category: updatedRecipe.category,
            prep_time: updatedRecipe.prepTime,
            servings: updatedRecipe.servings,
            ingredients: updatedRecipe.ingredients,
            instructions: updatedRecipe.instructions
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
        if (updatedMealPlans[date][mealType]) {
          if (mealType === 'snacks') {
            updatedMealPlans[date][mealType] = updatedMealPlans[date][mealType].filter(
              snack => snack.id !== id
            );
          } else if (updatedMealPlans[date][mealType].id === id) {
            updatedMealPlans[date][mealType] = null;
          }
        }
      });
    });
    setMealPlans(updatedMealPlans);
  };

  const addMealToPlan = async (date, mealType, recipe) => {
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
        updated[dateKey] = {
          ...updated[dateKey],
          snacks: updated[dateKey]?.snacks?.filter(snack => snack.id !== recipeId) || []
        };
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
      const mealDate = new Date(dateKey);
      if (isAfter(mealDate, today) || isSameDay(mealDate, today)) {
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
          if (meals[mealType]) {
            if (mealType === 'snacks') {
              meals[mealType].forEach(snack => {
                upcomingMeals.push({
                  date: mealDate,
                  mealType,
                  recipe: snack
                });
              });
            } else {
              upcomingMeals.push({
                date: mealDate,
                mealType,
                recipe: meals[mealType]
              });
            }
          }
        });
      }
    });

    return upcomingMeals.sort((a, b) => a.date - b.date);
  };

  const getShoppingList = () => {
    const ingredientMap = new Map();
    const upcomingMeals = getUpcomingMeals();

    upcomingMeals.forEach(({ recipe }) => {
      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          ingredientMap.set(key, {
            ...existing,
            quantity: existing.quantity + ingredient.quantity,
            recipes: [...existing.recipes, recipe.title]
          });
        } else {
          ingredientMap.set(key, {
            ...ingredient,
            recipes: [recipe.title]
          });
        }
      });
    });

    return Array.from(ingredientMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
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