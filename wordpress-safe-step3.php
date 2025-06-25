<?php
/**
 * SAFE STEP 3: Add automatic insertion (CAREFULLY)
 * Add this ONLY after Steps 1 & 2 work perfectly
 */

// Safe automatic insertion function
function safe_automatic_insertion($content) {
    // VERY strict safety checks
    if (!is_single() || !in_the_loop() || !is_main_query()) {
        return $content;
    }
    
    // Only proceed if we have WP Recipe Maker
    if (!class_exists('WPRM_Recipe_Manager')) {
        return $content;
    }
    
    try {
        // Get recipe IDs safely
        $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
        
        if (!empty($recipe_ids)) {
            // Add button for each recipe (at the end for safety)
            foreach ($recipe_ids as $recipe_id) {
                $button = generate_meal_planner_button($recipe_id);
                if ($button) {
                    $content .= $button;
                }
            }
        }
    } catch (Exception $e) {
        // Silently fail - don't break the content
        error_log('Meal planner integration error: ' . $e->getMessage());
    }
    
    return $content;
}

// IMPORTANT: Only uncomment this line AFTER testing Steps 1 & 2
// add_filter('the_content', 'safe_automatic_insertion', 999);

// Test message for Step 3
function safe_step3_test() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 90px; right: 10px; z-index: 9999;">
            ✅ Safe Step 3: Auto-insertion ready!<br>
            Uncomment the add_filter line to activate.
        </div>';
    }
}

add_action('wp_footer', 'safe_step3_test');

?>