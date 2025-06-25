<?php
/**
 * STEP 2: Recipe Detection Test
 * Replace Step 1 code with this after Step 1 works
 */

// Test recipe detection
function meal_planner_step2_test() {
    if (is_single()) {
        global $post;
        
        $has_recipes = false;
        $recipe_method = 'none';
        
        // Check for WP Recipe Maker
        if (class_exists('WPRM_Recipe_Manager')) {
            // Method 1: Shortcodes
            if (has_shortcode($post->post_content, 'wprm-recipe')) {
                $has_recipes = true;
                $recipe_method = 'shortcode';
            }
            
            // Method 2: Gutenberg blocks
            if (has_blocks($post->post_content)) {
                $blocks = parse_blocks($post->post_content);
                foreach ($blocks as $block) {
                    if (isset($block['blockName']) && $block['blockName'] === 'wp-recipe-maker/recipe') {
                        $has_recipes = true;
                        $recipe_method = 'gutenberg';
                        break;
                    }
                }
            }
        }
        
        echo '<div style="background: ' . ($has_recipes ? 'green' : 'orange') . '; color: white; padding: 10px; margin: 10px 0;">
            ✅ Step 2: Recipe Detection<br>
            WP Recipe Maker: ' . (class_exists('WPRM_Recipe_Manager') ? 'Found' : 'Not Found') . '<br>
            Has Recipes: ' . ($has_recipes ? 'Yes' : 'No') . '<br>
            Method: ' . $recipe_method . '
        </div>';
    }
}
add_action('wp_footer', 'meal_planner_step2_test');

?>