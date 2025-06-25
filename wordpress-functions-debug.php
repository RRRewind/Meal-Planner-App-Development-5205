<?php
/**
 * ENHANCED DEBUG VERSION - Meal Planner Integration for WP Recipe Maker
 * This version includes comprehensive debugging for Gutenberg blocks
 *
 * INSTRUCTIONS:
 * 1. Replace your current functions.php code with this debug version
 * 2. Check your website for debug messages
 * 3. Once working, switch back to the regular version
 */

// Enhanced recipe detection for Gutenberg blocks
function detect_recipes_in_post_debug($post_id = null) {
    if (!$post_id) {
        $post_id = get_the_ID();
    }
    
    global $post;
    if (!$post) {
        $post = get_post($post_id);
    }
    
    $recipe_ids = array();
    $debug_info = array();
    
    if (class_exists('WPRM_Recipe_Manager')) {
        // Method 1: Use WP Recipe Maker's built-in method
        $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post($post_id);
        $debug_info[] = 'WP Recipe Manager method found: ' . count($recipe_ids) . ' recipes';
        
        // Method 2: Check for Gutenberg blocks in post content
        if (has_blocks($post->post_content)) {
            $blocks = parse_blocks($post->post_content);
            $block_recipe_ids = extract_recipe_ids_from_blocks_debug($blocks, $debug_info);
            if (empty($recipe_ids)) {
                $recipe_ids = $block_recipe_ids;
            }
            $debug_info[] = 'Gutenberg blocks method found: ' . count($block_recipe_ids) . ' recipes';
        } else {
            $debug_info[] = 'No Gutenberg blocks detected';
        }
        
        // Method 3: Check for shortcodes (fallback)
        if (has_shortcode($post->post_content, 'wprm-recipe')) {
            preg_match_all('/\[wprm-recipe[^\]]*id=["\']?(\d+)["\']?[^\]]*\]/', $post->post_content, $matches);
            if (!empty($matches[1])) {
                $shortcode_recipe_ids = array_map('intval', $matches[1]);
                if (empty($recipe_ids)) {
                    $recipe_ids = $shortcode_recipe_ids;
                }
                $debug_info[] = 'Shortcode method found: ' . count($shortcode_recipe_ids) . ' recipes';
            }
        } else {
            $debug_info[] = 'No shortcodes detected';
        }
    } else {
        $debug_info[] = 'WP Recipe Manager class not found!';
    }
    
    return array('recipe_ids' => $recipe_ids, 'debug_info' => $debug_info);
}

// Recursively extract recipe IDs from Gutenberg blocks with debugging
function extract_recipe_ids_from_blocks_debug($blocks, &$debug_info) {
    $recipe_ids = array();
    
    foreach ($blocks as $block) {
        $debug_info[] = 'Processing block: ' . ($block['blockName'] ?? 'unnamed');
        
        // Check if this is a WP Recipe Maker block
        if (isset($block['blockName']) && $block['blockName'] === 'wp-recipe-maker/recipe') {
            if (isset($block['attrs']['id'])) {
                $recipe_ids[] = intval($block['attrs']['id']);
                $debug_info[] = 'Found recipe block with ID: ' . $block['attrs']['id'];
            } else {
                $debug_info[] = 'Found recipe block but no ID attribute';
            }
        }
        
        // Check inner blocks recursively
        if (!empty($block['innerBlocks'])) {
            $inner_recipe_ids = extract_recipe_ids_from_blocks_debug($block['innerBlocks'], $debug_info);
            $recipe_ids = array_merge($recipe_ids, $inner_recipe_ids);
        }
    }
    
    return $recipe_ids;
}

// Add import button to WP Recipe Maker recipe cards
function add_meal_planner_import_button_debug($recipe_id) {
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
        DEBUG: Meal Planner button for recipe "<?php echo esc_html($recipe->name()); ?>" (ID: <?php echo $recipe_id; ?>)
    </div>
    <div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <button class="meal-planner-import-btn" 
                onclick="importToMealPlanner(<?php echo $recipe_json; ?>)"
                style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(249,115,22,0.3); transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(249,115,22,0.4)'"
                onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(249,115,22,0.3)'">
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

// Hook into WP Recipe Maker template to add import button
add_filter('wprm_recipe_template_shortcode', function($template, $recipe) {
    // Debug message
    error_log('DEBUG: Meal Planner filter triggered for recipe: ' . $recipe->name());
    
    $import_button = add_meal_planner_import_button_debug($recipe->id());
    
    // Try multiple places to insert the button
    $template = str_replace('%wprm_recipe_summary%', '%wprm_recipe_summary%' . $import_button, $template);
    $template = str_replace('%wprm_recipe_course%', '%wprm_recipe_course%' . $import_button, $template);
    $template = str_replace('%wprm_recipe_instructions%', $import_button . '%wprm_recipe_instructions%', $template);
    
    return $template;
}, 10, 2);

// Alternative: Add button via content filter (for Gutenberg blocks)
add_filter('the_content', function($content) {
    // Only on single posts in the main query
    if (is_single() && in_the_loop() && is_main_query()) {
        $result = detect_recipes_in_post_debug();
        $recipe_ids = $result['recipe_ids'];
        $debug_info = $result['debug_info'];
        
        // Add debug information
        $debug_output = '<div style="background: purple; color: white; padding: 10px; margin: 10px 0; font-size: 12px;">';
        $debug_output .= '<strong>DEBUG: Content Filter Detection</strong><br>';
        $debug_output .= implode('<br>', $debug_info) . '<br>';
        $debug_output .= 'Total recipes found: ' . count($recipe_ids);
        $debug_output .= '</div>';
        
        $content = $debug_output . $content;
        
        if (!empty($recipe_ids)) {
            // Add button after each recipe
            foreach ($recipe_ids as $recipe_id) {
                $import_button = add_meal_planner_import_button_debug($recipe_id);
                
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

// Comprehensive debug function
function debug_recipe_detection_comprehensive() {
    if (is_single()) {
        global $post;
        
        $result = detect_recipes_in_post_debug();
        $recipe_ids = $result['recipe_ids'];
        $debug_info = $result['debug_info'];
        
        $has_shortcode = has_shortcode($post->post_content, 'wprm-recipe');
        $has_blocks = has_blocks($post->post_content);
        $has_recipe_class = strpos($post->post_content, 'wprm-recipe') !== false;
        
        echo '<div style="position: fixed; top: 0; right: 0; background: black; color: white; padding: 10px; z-index: 9999; font-size: 11px; max-width: 400px; max-height: 80vh; overflow-y: auto;">';
        echo '<strong>COMPREHENSIVE RECIPE DEBUG:</strong><br>';
        echo 'Post ID: ' . get_the_ID() . '<br>';
        echo 'Has Gutenberg blocks: ' . ($has_blocks ? 'YES' : 'NO') . '<br>';
        echo 'Has [wprm-recipe] shortcode: ' . ($has_shortcode ? 'YES' : 'NO') . '<br>';
        echo 'Has "wprm-recipe" in content: ' . ($has_recipe_class ? 'YES' : 'NO') . '<br>';
        echo 'Recipe IDs detected: ' . (empty($recipe_ids) ? 'NONE' : implode(', ', $recipe_ids)) . '<br>';
        echo 'WP Recipe Maker active: ' . (class_exists('WPRM_Recipe_Manager') ? 'YES' : 'NO') . '<br>';
        echo '<br><strong>Detection Details:</strong><br>';
        echo implode('<br>', $debug_info) . '<br>';
        
        if ($has_blocks) {
            echo '<br><strong>Block Analysis:</strong><br>';
            $blocks = parse_blocks($post->post_content);
            $block_names = array();
            foreach ($blocks as $block) {
                if (!empty($block['blockName'])) {
                    $block_names[] = $block['blockName'];
                    if ($block['blockName'] === 'wp-recipe-maker/recipe') {
                        echo 'Recipe block found with attrs: ' . print_r($block['attrs'], true) . '<br>';
                    }
                }
            }
            echo 'All block types: ' . implode(', ', array_unique($block_names)) . '<br>';
        }
        
        echo '</div>';
    }
}
add_action('wp_footer', 'debug_recipe_detection_comprehensive');
?>