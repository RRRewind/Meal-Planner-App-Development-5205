<?php
/**
 * STEP 1: Simple Test - Add this first to make sure basic PHP works
 * Copy ONLY this code to functions.php
 */

// Simple test function
function meal_planner_step1_test() {
    if (is_single()) {
        echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
            ✅ Step 1: PHP code is working! Ready for Step 2.
        </div>';
    }
}
add_action('wp_footer', 'meal_planner_step1_test');

?>