<?php
/**
 * SAFE STEP 3: Automatic insertion (ONLY add this if Steps 1 & 2 work)
 * This is the most careful automatic insertion method
 */

// Safe automatic insertion - only if shortcode method works
function safe_automatic_meal_planner_insertion($content) {
    // SAFETY CHECKS FIRST
    if (!is_single() || !in_the_loop() || !is_main_query()) {
        return $content;
    }
    
    // Only on posts that definitely have recipes
    if (!class_exists('WPRM_Recipe_Manager')) {
        return $content;
    }
    
    $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
    if (empty($recipe_ids)) {
        return $content;
    }
    
    // Very conservative approach - only add to the end for now
    foreach ($recipe_ids as $recipe_id) {
        $button = generate_meal_planner_button($recipe_id);
        $content .= $button;
    }
    
    return $content;
}

// Only uncomment this line AFTER testing Steps 1 and 2
// add_filter('the_content', 'safe_automatic_meal_planner_insertion', 999);

// Test automatic method
function test_automatic_method() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 90px; left: 10px; z-index: 9999;">
            ✅ Safe Step 3: Automatic insertion ready! <br>
            Uncomment the add_filter line to activate.
        </div>';
    }
}
add_action('wp_footer', 'test_automatic_method');

?>