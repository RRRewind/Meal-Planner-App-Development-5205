<?php
/**
 * Meal Planner Integration for WP Recipe Maker
 * Enhanced version with Gutenberg block detection
 * Multi-domain support for development and production
 *
 * INSTRUCTIONS:
 * 1. Copy this entire code
 * 2. Go to WordPress Admin → Appearance → Theme Editor
 * 3. Select functions.php
 * 4. REPLACE your test code with this code
 * 5. Click "Update File"
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
        <button class="meal-planner-import-btn" onclick="importToMealPlanner(<?php echo $recipe_json; ?>)" style="
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(249, 115, 22, 0.4)'"
            onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(249, 115, 22, 0.3)'"
        >
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

// Enhanced recipe detection for Gutenberg blocks
function detect_recipes_in_post($post_id = null) {
    if (!$post_id) {
        $post_id = get_the_ID();
    }
    
    global $post;
    if (!$post) {
        $post = get_post($post_id);
    }
    
    $recipe_ids = array();
    
    if (class_exists('WPRM_Recipe_Manager')) {
        // Method 1: Use WP Recipe Maker's built-in method
        $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post($post_id);
        
        // Method 2: Check for Gutenberg blocks in post content
        if (empty($recipe_ids) && has_blocks($post->post_content)) {
            $blocks = parse_blocks($post->post_content);
            $recipe_ids = extract_recipe_ids_from_blocks($blocks);
        }
        
        // Method 3: Check for shortcodes (fallback)
        if (empty($recipe_ids) && has_shortcode($post->post_content, 'wprm-recipe')) {
            preg_match_all('/\[wprm-recipe[^\]]*id=["\']?(\d+)["\']?[^\]]*\]/', $post->post_content, $matches);
            if (!empty($matches[1])) {
                $recipe_ids = array_map('intval', $matches[1]);
            }
        }
    }
    
    return $recipe_ids;
}

// Recursively extract recipe IDs from Gutenberg blocks
function extract_recipe_ids_from_blocks($blocks) {
    $recipe_ids = array();
    
    foreach ($blocks as $block) {
        // Check if this is a WP Recipe Maker block
        if (isset($block['blockName']) && $block['blockName'] === 'wp-recipe-maker/recipe') {
            if (isset($block['attrs']['id'])) {
                $recipe_ids[] = intval($block['attrs']['id']);
            }
        }
        
        // Check inner blocks recursively
        if (!empty($block['innerBlocks'])) {
            $inner_recipe_ids = extract_recipe_ids_from_blocks($block['innerBlocks']);
            $recipe_ids = array_merge($recipe_ids, $inner_recipe_ids);
        }
    }
    
    return $recipe_ids;
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

// Alternative method: Add button via content filter (for Gutenberg blocks)
add_filter('the_content', function($content) {
    // Only on single posts in the main query
    if (is_single() && in_the_loop() && is_main_query()) {
        $recipe_ids = detect_recipes_in_post();
        
        if (!empty($recipe_ids)) {
            // Add button after each recipe
            foreach ($recipe_ids as $recipe_id) {
                $import_button = add_meal_planner_import_button($recipe_id);
                
                // Try to insert after recipe container
                $content = preg_replace(
                    '/(<div[^>]*class="[^"]*wprm-recipe[^"]*"[^>]*>.*?<\/div>)/s',
                    '$1' . $import_button,
                    $content,
                    1
                );
            }
        }
    }
    return $content;
});

// Enqueue the integration script
function enqueue_meal_planner_integration() {
    // Only load on posts with recipes
    if (is_single()) {
        $recipe_ids = detect_recipes_in_post();
        if (!empty($recipe_ids)) {
            wp_enqueue_script(
                'meal-planner-integration',
                get_template_directory_uri() . '/wordpress-integration.js',
                array(),
                '1.2', // Version number for cache busting
                true
            );
        }
    }
}
add_action('wp_enqueue_scripts', 'enqueue_meal_planner_integration');

// Alternative method if enqueue doesn't work
function add_meal_planner_script_to_footer() {
    if (is_single()) {
        $recipe_ids = detect_recipes_in_post();
        if (!empty($recipe_ids)) {
            ?>
            <script src="<?php echo get_template_directory_uri(); ?>/wordpress-integration.js?v=1.2"></script>
            <?php
        }
    }
}
// Uncomment the line below if the enqueue method doesn't work
// add_action('wp_footer', 'add_meal_planner_script_to_footer');

?>