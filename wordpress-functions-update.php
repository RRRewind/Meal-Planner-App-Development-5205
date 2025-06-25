<?php
/**
 * Updated WordPress Functions for Multi-Domain Support
 * Add this to your theme's functions.php file
 */

// Add import button to WP Recipe Maker recipe cards
function add_meal_planner_import_button($recipe_id) {
    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) return '';

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
    <?php
    return ob_get_clean();
}

// Hook into WP Recipe Maker template to add import button
add_filter('wprm_recipe_template_shortcode', function($template, $recipe) {
    // Add import button after recipe summary
    $import_button = add_meal_planner_import_button($recipe->id());
    $template = str_replace(
        '%wprm_recipe_summary%',
        '%wprm_recipe_summary%' . $import_button,
        $template
    );
    return $template;
}, 10, 2);

// Enqueue the integration script
function enqueue_meal_planner_integration() {
    // Only load on posts with recipes
    if (is_single() && has_shortcode(get_post()->post_content, 'wprm-recipe')) {
        wp_enqueue_script(
            'meal-planner-integration',
            get_template_directory_uri() . '/wordpress-integration.js',
            array(),
            '1.1', // Version number for cache busting
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_meal_planner_integration');

// Alternative: Add script directly to footer (if the above doesn't work)
function add_meal_planner_script_to_footer() {
    if (is_single() && has_shortcode(get_post()->post_content, 'wprm-recipe')) {
        ?>
        <script src="<?php echo get_template_directory_uri(); ?>/wordpress-integration.js?v=1.1"></script>
        <?php
    }
}
// Uncomment the line below if the enqueue method doesn't work
// add_action('wp_footer', 'add_meal_planner_script_to_footer');
?>