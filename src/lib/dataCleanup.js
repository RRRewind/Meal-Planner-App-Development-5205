// Data cleanup utilities for meal planner
import { supabase } from './supabase';
import { format, startOfWeek, isBefore } from 'date-fns';

/**
 * Clean up old meal plan data from Supabase
 * Removes all meal plans older than the current week
 * @param {string} userId - The user ID to clean up data for
 * @returns {Promise<Object>} Cleanup result with count of deleted records
 */
export const cleanupOldMealPlans = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required for cleanup');
  }

  try {
    console.log('🧹 Starting automated meal plan cleanup for user:', userId);
    
    // Calculate cutoff date (start of current week)
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const cutoffDate = format(currentWeekStart, 'yyyy-MM-dd');
    
    console.log('📅 Cleanup cutoff date:', cutoffDate);

    // Get count of records that will be deleted (for reporting)
    const { count: recordCount, error: countError } = await supabase
      .from('meal_plans_mp2025')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lt('date', cutoffDate);

    if (countError) {
      console.warn('Could not get count of records to delete:', countError);
    }

    // Delete old meal plans
    const { data: deletedData, error: deleteError } = await supabase
      .from('meal_plans_mp2025')
      .delete()
      .eq('user_id', userId)
      .lt('date', cutoffDate);

    if (deleteError && deleteError.code !== 'PGRST116') {
      throw deleteError;
    }

    const deletedCount = recordCount || 0;
    
    console.log(`✅ Cleanup completed successfully`);
    console.log(`📊 Deleted ${deletedCount} old meal plan records`);
    console.log(`🗓️ Cutoff date: ${cutoffDate}`);

    return {
      success: true,
      deletedCount,
      cutoffDate,
      message: `Successfully cleaned up ${deletedCount} old meal plan records`
    };

  } catch (error) {
    console.error('❌ Error during meal plan cleanup:', error);
    return {
      success: false,
      error: error.message,
      deletedCount: 0
    };
  }
};

/**
 * Clean up orphaned meal plans (meal plans referring to deleted recipes)
 * @param {string} userId - The user ID to clean up data for
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanupOrphanedMealPlans = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required for cleanup');
  }

  try {
    console.log('🔍 Checking for orphaned meal plans...');

    // Get all meal plans for user
    const { data: mealPlans, error: mealPlansError } = await supabase
      .from('meal_plans_mp2025')
      .select('id, recipe_id')
      .eq('user_id', userId);

    if (mealPlansError) {
      throw mealPlansError;
    }

    if (!mealPlans || mealPlans.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        message: 'No meal plans found'
      };
    }

    // Get all recipes for user
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes_mp2025')
      .select('id')
      .eq('user_id', userId);

    if (recipesError) {
      throw recipesError;
    }

    const recipeIds = new Set(recipes?.map(r => r.id) || []);
    const orphanedMealPlans = mealPlans.filter(mp => !recipeIds.has(mp.recipe_id));

    if (orphanedMealPlans.length === 0) {
      console.log('✅ No orphaned meal plans found');
      return {
        success: true,
        deletedCount: 0,
        message: 'No orphaned meal plans found'
      };
    }

    // Delete orphaned meal plans
    const orphanedIds = orphanedMealPlans.map(mp => mp.id);
    const { error: deleteError } = await supabase
      .from('meal_plans_mp2025')
      .delete()
      .in('id', orphanedIds);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`✅ Cleaned up ${orphanedMealPlans.length} orphaned meal plans`);

    return {
      success: true,
      deletedCount: orphanedMealPlans.length,
      message: `Successfully cleaned up ${orphanedMealPlans.length} orphaned meal plans`
    };

  } catch (error) {
    console.error('❌ Error during orphaned meal plan cleanup:', error);
    return {
      success: false,
      error: error.message,
      deletedCount: 0
    };
  }
};

/**
 * Perform comprehensive cleanup (old data + orphaned records)
 * @param {string} userId - The user ID to clean up data for
 * @returns {Promise<Object>} Combined cleanup result
 */
export const performFullCleanup = async (userId) => {
  console.log('🚀 Starting full data cleanup...');

  const oldDataCleanup = await cleanupOldMealPlans(userId);
  const orphanedCleanup = await cleanupOrphanedMealPlans(userId);

  const totalDeleted = oldDataCleanup.deletedCount + orphanedCleanup.deletedCount;

  return {
    success: oldDataCleanup.success && orphanedCleanup.success,
    oldDataCleanup,
    orphanedCleanup,
    totalDeleted,
    message: `Full cleanup completed. Removed ${totalDeleted} records total.`
  };
};

/**
 * Schedule automatic cleanup to run periodically
 * @param {string} userId - The user ID
 * @param {number} intervalHours - How often to run cleanup (default: 24 hours)
 */
export const scheduleAutoCleanup = (userId, intervalHours = 24) => {
  if (!userId) return;

  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`⏰ Scheduling automatic cleanup every ${intervalHours} hours`);

  const cleanup = async () => {
    try {
      const result = await cleanupOldMealPlans(userId);
      if (result.deletedCount > 0) {
        console.log(`🗑️ Auto-cleanup removed ${result.deletedCount} old records`);
      }
    } catch (error) {
      console.warn('Auto-cleanup failed:', error);
    }
  };

  // Run initial cleanup after 5 seconds
  setTimeout(cleanup, 5000);

  // Schedule recurring cleanup
  return setInterval(cleanup, intervalMs);
};

export default {
  cleanupOldMealPlans,
  cleanupOrphanedMealPlans,
  performFullCleanup,
  scheduleAutoCleanup
};