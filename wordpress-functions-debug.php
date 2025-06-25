<?php
/**
 * DEBUG VERSION - Meal Planner Integration for WP Recipe Maker
 * This version includes debugging to help identify issues
 * 
 * INSTRUCTIONS:
 * 1. Replace your current functions.php code with this debug version
 * 2. Check your website for debug messages
 * 3. Once working, switch back to the regular version
 */

// Add import button to WP Recipe Maker recipe cards
function add_meal_planner_import_button($recipe_id) {
    // Debug: Check if WP Recipe Maker is available
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">DEBUG: WP Recipe Maker plugin not found or not active!</div>';
    }

    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) {
        return '<div style="background: orange; color: white; padding: 10px; margin: 10px 0;">DEBUG: Recipe not found for ID: ' . $recipe_id . '</div>';
    }

    // Get recipe data
    $recipe_data = array(
        'id' => $recipe->id(),
        'name' => $recipe->name(),
        'summary' => $recipe->summary(),
        'course' => $recipe->course(),
        'prep_time' => $recipe->prep_time(),
        'cook_time' => $recipe->cook_time(),
        'total_time' => $recipe->total_time(),
        'servings' => $recipe->servings(),
        'ingredients' => array(),
        'instructions' => array(),
        'url' => get_permalink()
    );

    // Get ingredients
    foreach ($recipe->ingredients() as $ingredient_group) {
        foreach ($ingredient_group['ingredients'] as $ingredient) {
            $recipe_data['ingredients'][] = array(
                'amount' => $ingredient['amount'],
                'unit' => $ingredient['unit'],
                'name' => $ingredient['name'],
                'notes' => $ingredient['notes']
            );
        }
    }

    // Get instructions
    foreach ($recipe->instructions() as $instruction_group) {
        foreach ($instruction_group['instructions'] as $instruction) {
            $recipe_data['instructions'][] = array(
                'text' => $instruction['text']
            );
        }
    }

    // Encode recipe data
    $recipe_json = htmlspecialchars(json_encode($recipe_data), ENT_QUOTES, 'UTF-8');

    ob_start();
    ?>
    <div style="background: green; color: white; padding: 5px; margin: 5px 0; font-size: 12px;">
        DEBUG: Meal Planner button should appear below this message
    </div>
    <div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <button class="meal-planner-import-btn" 
                onclick="importToMealPlanner(<?php echo $recipe_json; ?>)"
                style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(249, 115, 22, 0.4)'"
                onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(249, 115, 22, 0.3)'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add to Meal Planner
        </button>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
            Save this recipe to your personal meal planning app
        </p>
    </div>
    <script>
        // Inline JavaScript for testing
        function importToMealPlanner(recipeData) {
            alert('Button clicked! Recipe: ' + recipeData.name);
            console.log('Recipe data:', recipeData);
            
            // Try to open the meal planner
            const mealPlannerUrl = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
            window.open(mealPlannerUrl, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        }
    </script>
    <?php
    return ob_get_clean();
}

// Hook into WP Recipe Maker template
add_filter('wprm_recipe_template_shortcode', function($template, $recipe) {
    // Debug message
    error_log('DEBUG: Meal Planner filter triggered for recipe: ' . $recipe->name());
    
    $import_button = add_meal_planner_import_button($recipe->id());
    
    // Try multiple places to insert the button
    $template = str_replace('%wprm_recipe_summary%', '%wprm_recipe_summary%' . $import_button, $template);
    $template = str_replace('%wprm_recipe_course%', '%wprm_recipe_course%' . $import_button, $template);
    $template = str_replace('%wprm_recipe_instructions%', $import_button . '%wprm_recipe_instructions%', $template);
    
    return $template;
}, 10, 2);

// Alternative: Hook into recipe output directly
add_action('wprm_output_recipe_template', function($recipe_id) {
    echo '<div style="background: blue; color: white; padding: 5px; margin: 5px 0;">DEBUG: Direct output hook triggered</div>';
    echo add_meal_planner_import_button($recipe_id);
});

// Force add to all recipe content
add_filter('the_content', function($content) {
    // Only on single posts
    if (is_single() && in_the_loop() && is_main_query()) {
        // Check if this post has a recipe
        if (has_shortcode($content, 'wprm-recipe')) {
            $debug_info = '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">DEBUG: Recipe post detected, adding button via content filter</div>';
            
            // Get the first recipe ID from the post
            global $post;
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post($post->ID);
            
            if (!empty($recipe_ids)) {
                $button = add_meal_planner_import_button($recipe_ids[0]);
                $content .= $debug_info . $button;
            }
        }
    }
    return $content;
});

// Debug: Check if scripts are being enqueued
function debug_meal_planner_integration() {
    if (is_single()) {
        global $post;
        $has_recipe = has_shortcode($post->post_content, 'wprm-recipe');
        
        echo '<div style="position: fixed; top: 0; left: 0; background: black; color: white; padding: 10px; z-index: 9999; font-size: 12px;">';
        echo 'DEBUG INFO:<br>';
        echo 'Is Single: ' . (is_single() ? 'YES' : 'NO') . '<br>';
        echo 'Has Recipe: ' . ($has_recipe ? 'YES' : 'NO') . '<br>';
        echo 'WP Recipe Maker Active: ' . (class_exists('WPRM_Recipe_Manager') ? 'YES' : 'NO') . '<br>';
        echo 'Post ID: ' . get_the_ID() . '<br>';
        echo '</div>';
    }
}
add_action('wp_footer', 'debug_meal_planner_integration');

?>