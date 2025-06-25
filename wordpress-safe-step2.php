<?php
/**
 * SAFE STEP 2: Add shortcode support
 * Add this AFTER Step 1 works without errors
 */

// Safe shortcode function
function safe_meal_planner_shortcode($atts) {
    $atts = shortcode_atts(array(
        'recipe_id' => null
    ), $atts);
    
    // If no recipe ID provided, try to find one
    if (!$atts['recipe_id']) {
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            if (!empty($recipe_ids)) {
                $atts['recipe_id'] = $recipe_ids[0];
            }
        }
    }
    
    if ($atts['recipe_id']) {
        return generate_meal_planner_button($atts['recipe_id']);
    }
    
    return '<p style="color: orange; font-style: italic;">No recipe found for meal planner button.</p>';
}

add_shortcode('meal_planner_button', 'safe_meal_planner_shortcode');

// Test message for Step 2
function safe_step2_test() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: blue; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 50px; right: 10px; z-index: 9999;">
            ✅ Safe Step 2: Shortcode loaded!<br>
            Use [meal_planner_button] in posts.
        </div>';
    }
}

add_action('wp_footer', 'safe_step2_test');

?>