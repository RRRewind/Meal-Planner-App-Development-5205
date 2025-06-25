<?php
/**
 * SAFE STEP 2: Add shortcode method (manual placement)
 * Add this AFTER Step 1 works
 */

// Shortcode to manually place the button
function meal_planner_button_shortcode($atts) {
    $atts = shortcode_atts(array(
        'recipe_id' => null
    ), $atts);
    
    // If no recipe ID provided, try to find one on this post
    if (!$atts['recipe_id']) {
        // Try to get recipe ID from current post
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            if (!empty($recipe_ids)) {
                $atts['recipe_id'] = $recipe_ids[0]; // Use first recipe found
            }
        }
    }
    
    if ($atts['recipe_id']) {
        return generate_meal_planner_button($atts['recipe_id']);
    }
    
    return '<p style="color: orange; font-style: italic;">No recipe found for meal planner button.</p>';
}
add_shortcode('meal_planner_button', 'meal_planner_button_shortcode');

// Test shortcode function
function test_shortcode_method() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: blue; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 50px; left: 10px; z-index: 9999;">
            ✅ Safe Step 2: Shortcode method loaded! <br>
            Use [meal_planner_button] in your posts.
        </div>';
    }
}
add_action('wp_footer', 'test_shortcode_method');

?>