<?php
/**
 * ULTRA MINIMAL - Just shortcode, no automatic insertion
 * This won't break anything - just provides a shortcode to test
 * 
 * INSTRUCTIONS:
 * 1. Remove ALL previous code from functions.php
 * 2. Add ONLY this minimal code
 * 3. Test with [meal_planner_button] shortcode in a post
 */

// Simple shortcode - no automatic insertion
function meal_planner_button_shortcode($atts) {
    // Only on posts with recipes
    if (!is_single() || !class_exists('WPRM_Recipe_Manager')) {
        return '';
    }
    
    // Get recipe IDs
    $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
    if (empty($recipe_ids)) {
        return '<p style="color: orange;">No recipes found on this post.</p>';
    }
    
    // Use first recipe
    $recipe_id = $recipe_ids[0];
    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) {
        return '<p style="color: red;">Recipe not found.</p>';
    }
    
    // Simple recipe data (minimal)
    $recipe_data = array(
        'id' => $recipe->id(),
        'name' => $recipe->name(),
        'prep_time' => $recipe->prep_time(),
        'servings' => $recipe->servings()
    );
    
    $recipe_json = json_encode($recipe_data);
    $recipe_json_safe = esc_attr($recipe_json);
    
    // Simple button HTML
    return '<div style="margin: 20px 0; text-align: center; background: #fef7ed; border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <button onclick="simpleMealPlannerImport(\'' . $recipe_json_safe . '\')" style="
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
            color: white; border: none; padding: 12px 24px; border-radius: 12px;
            font-weight: 600; font-size: 16px; cursor: pointer;
        ">
            🍽️ Add to Meal Planner
        </button>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
            Recipe: <strong>' . esc_html($recipe->name()) . '</strong>
        </p>
    </div>';
}

add_shortcode('meal_planner_button', 'meal_planner_button_shortcode');

// Simple JavaScript - only when shortcode is used
function add_simple_meal_planner_script() {
    if (is_single() && has_shortcode(get_post()->post_content, 'meal_planner_button')) {
        ?>
        <script>
        function simpleMealPlannerImport(recipeJson) {
            try {
                const recipe = JSON.parse(recipeJson);
                console.log('Importing recipe:', recipe.name);
                
                // Just open the meal planner for now
                const url = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800');
                
                if (popup) {
                    alert('Meal planner opened! Recipe: ' + recipe.name);
                } else {
                    alert('Please allow popups to use the meal planner.');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        </script>
        <?php
    }
}

add_action('wp_footer', 'add_simple_meal_planner_script');

?>