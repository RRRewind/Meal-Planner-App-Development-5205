import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfWeek, addDays, isAfter, isSameDay, startOfDay } from 'date-fns';

const MealPlanContext = createContext();

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};

export const MealPlanProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState({});
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRecipes = localStorage.getItem('mealPlannerRecipes');
    const savedMealPlans = localStorage.getItem('mealPlannerMealPlans');
    
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
    
    if (savedMealPlans) {
      setMealPlans(JSON.parse(savedMealPlans));
    }
  }, []);

  // Save recipes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mealPlannerRecipes', JSON.stringify(recipes));
  }, [recipes]);

  // Save meal plans to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mealPlannerMealPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  const addRecipe = (recipe) => {
    const newRecipe = {
      ...recipe,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setRecipes(prev => [...prev, newRecipe]);
    return newRecipe;
  };

  const updateRecipe = (id, updatedRecipe) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
    ));
  };

  const deleteRecipe = (id) => {
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

  const addMealToPlan = (date, mealType, recipe) => {
    const dateKey = format(date, 'yyyy-MM-dd');
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

  const removeMealFromPlan = (date, mealType, recipeId = null) => {
    const dateKey = format(date, 'yyyy-MM-dd');
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