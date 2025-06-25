<?php
/**
 * Complete Meal Planner Integration - Production Ready
 * Replace your debug code with this complete version
 */

// Generate meal planner button with complete recipe data
function generate_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '';
    }
    
    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) return '';
    
    try {
        // Get complete recipe data
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
        
        // Safely encode JSON
        $recipe_json = wp_json_encode($recipe_data);
        if ($recipe_json === false) {
            return ''; // Skip if JSON encoding fails
        }
        
        $recipe_json_escaped = esc_attr($recipe_json);
        
        return '<div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
            <button onclick="importToMealPlanner(\'' . $recipe_json_escaped . '\')" style="
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
                onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 6px 20px rgba(249, 115, 22, 0.4)\'"
                onmouseout="this.style.transform=\'\'; this.style.boxShadow=\'0 4px 12px rgba(249, 115, 22, 0.3)\'"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add to Meal Planner
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">
                Save this recipe: <strong>' . esc_html($recipe->name()) . '</strong>
            </p>
        </div>';
        
    } catch (Exception $e) {
        return ''; // Skip silently if there's an error
    }
}

// Enhanced recipe detection for all methods
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
        
        // Method 2: Check for Gutenberg blocks
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

// Shortcode for manual placement
function meal_planner_button_shortcode($atts) {
    $atts = shortcode_atts(array(
        'recipe_id' => null
    ), $atts);
    
    // If no recipe ID provided, try to find one
    if (!$atts['recipe_id']) {
        $recipe_ids = detect_recipes_in_post();
        if (!empty($recipe_ids)) {
            $atts['recipe_id'] = $recipe_ids[0];
        }
    }
    
    if ($atts['recipe_id']) {
        return generate_meal_planner_button($atts['recipe_id']);
    }
    
    return '<p style="color: orange; font-style: italic;">No recipe found for meal planner button.</p>';
}

add_shortcode('meal_planner_button', 'meal_planner_button_shortcode');

// Automatic insertion after recipe content
function automatic_meal_planner_insertion($content) {
    // Only on single posts in main query
    if (!is_single() || !in_the_loop() || !is_main_query()) {
        return $content;
    }
    
    $recipe_ids = detect_recipes_in_post();
    
    if (!empty($recipe_ids)) {
        // Add button after each recipe
        foreach ($recipe_ids as $recipe_id) {
            $button = generate_meal_planner_button($recipe_id);
            $content .= $button;
        }
    }
    
    return $content;
}

add_filter('the_content', 'automatic_meal_planner_insertion', 999);

// JavaScript for meal planner integration
function add_meal_planner_integration_script() {
    if (is_single()) {
        $recipe_ids = detect_recipes_in_post();
        if (!empty($recipe_ids)) {
            ?>
            <script>
            function importToMealPlanner(recipeDataString) {
                console.log('🍽️ Starting recipe import...');
                
                try {
                    // Parse the recipe data
                    const recipeData = JSON.parse(recipeDataString);
                    console.log('Recipe to import:', recipeData.name);
                    
                    // Multi-domain support
                    const domains = {
                        development: 'https://meal-planner-app-development-5205.vercel.app',
                        production: 'https://mealplan.supertasty.recipes'
                    };
                    
                    // Auto-detect domain (customize this logic for your setup)
                    const isProduction = window.location.hostname.includes('supertasty.recipes') || 
                                        window.location.hostname.includes('yourdomain.com');
                    const targetDomain = isProduction ? domains.production : domains.development;
                    
                    // Open meal planner
                    const url = targetDomain + '/#/?import=pending';
                    const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                    
                    if (!popup) {
                        alert('Please allow popups for this site to use the meal planner integration.');
                        return;
                    }
                    
                    // Send recipe data after delay
                    setTimeout(function() {
                        try {
                            popup.postMessage({
                                type: 'IMPORT_RECIPE',
                                recipe: recipeData,
                                source: 'wordpress',
                                timestamp: Date.now()
                            }, targetDomain);
                            
                            console.log('✅ Recipe sent to meal planner');
                            showImportFeedback('Recipe imported successfully!', 'success');
                        } catch (error) {
                            console.log('Recipe will be available when meal planner loads');
                            showImportFeedback('Recipe queued for import...', 'info');
                        }
                    }, 3000);
                    
                    // Show immediate feedback
                    showImportFeedback('Opening meal planner...', 'info');
                    
                } catch (error) {
                    console.error('Error importing recipe:', error);
                    showImportFeedback('Error importing recipe. Please try again.', 'error');
                }
            }
            
            function showImportFeedback(message, type) {
                // Remove existing feedback
                const existing = document.getElementById('meal-planner-feedback');
                if (existing) existing.remove();
                
                // Create feedback element
                const feedback = document.createElement('div');
                feedback.id = 'meal-planner-feedback';
                feedback.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    max-width: 300px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    ${type === 'success' ? 'background: linear-gradient(135deg, #059669, #10b981);' : 
                      type === 'error' ? 'background: linear-gradient(135deg, #dc2626, #ef4444);' : 
                      'background: linear-gradient(135deg, #f97316, #dc2626);'}
                `;
                feedback.textContent = message;
                document.body.appendChild(feedback);
                
                // Auto-remove after 5 seconds
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.remove();
                    }
                }, 5000);
            }
            </script>
            <?php
        }
    }
}

add_action('wp_footer', 'add_meal_planner_integration_script');

// Success message for admins
function show_integration_success() {
    if (is_single() && current_user_can('administrator')) {
        $recipe_ids = detect_recipes_in_post();
        if (!empty($recipe_ids)) {
            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 10px; right: 10px; z-index: 9999;">
                🎉 Meal Planner Integration Active!<br>
                Found ' . count($recipe_ids) . ' recipe(s) on this post.
            </div>';
        }
    }
}

add_action('wp_footer', 'show_integration_success');

?>