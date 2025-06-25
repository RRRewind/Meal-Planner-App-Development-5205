<?php
// SIMPLE TEST - Meal Planner Integration Test
// Add this code to the END of your functions.php file

function meal_planner_simple_test() {
    if (is_single()) {
        global $post;
        
        // Check if this post has recipes
        if (has_shortcode($post->post_content, 'wprm-recipe') || has_blocks($post->post_content)) {
            echo '<div style="background: #4CAF50; color: white; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;">
                ✅ <strong>Meal Planner Integration Test</strong><br>
                This post has recipes! Integration ready to implement.
                <br><button onclick="alert(\'Test successful! Ready for full integration.\')" style="background: white; color: #4CAF50; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 8px; cursor: pointer;">Test Button</button>
            </div>';
        }
    }
}

// Hook the function to run on every page
add_action('wp_footer', 'meal_planner_simple_test');

?>