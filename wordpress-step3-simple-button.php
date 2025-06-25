<?php
/**
 * STEP 3: Simple Button Test
 * Replace Step 2 code with this after Step 2 works
 */

// Simple button test
function add_simple_meal_planner_button() {
    if (is_single()) {
        global $post;
        
        // Only show on posts with recipes
        if (has_shortcode($post->post_content, 'wprm-recipe') || 
            (has_blocks($post->post_content) && strpos($post->post_content, 'wp-recipe-maker/recipe') !== false)) {
            
            echo '<div style="text-align: center; margin: 20px 0; padding: 20px; background: #f0f0f0; border-radius: 10px;">
                <button onclick="testMealPlanner()" style="background: #f97316; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    🍽️ Add to Meal Planner (Test)
                </button>
                <p style="font-size: 12px; color: #666; margin-top: 8px;">Test button - clicks will show alert</p>
            </div>';
        }
    }
}
add_action('wp_footer', 'add_simple_meal_planner_button');

// Simple JavaScript test
function add_simple_meal_planner_script() {
    if (is_single()) {
        ?>
        <script>
        function testMealPlanner() {
            alert('🎉 Button works! Ready for full integration.');
            console.log('Meal planner test successful');
        }
        </script>
        <?php
    }
}
add_action('wp_footer', 'add_simple_meal_planner_script');

?>