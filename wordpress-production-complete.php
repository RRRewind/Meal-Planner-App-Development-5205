<?php
/**
 * Complete Meal Planner Integration - Production Ready
 * Replace your test code with this final version
 * 
 * INSTRUCTIONS:
 * 1. Copy this entire code
 * 2. Replace your test code in functions.php
 * 3. Save and test on any recipe post
 * 4. Buttons should appear automatically after each recipe!
 */

// Generate meal planner button with safe JSON encoding
function generate_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '';
    }
    
    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) return '';
    
    try {
        // Get basic recipe data safely
        $recipe_data = array(
            'id' => intval($recipe->id()),
            'name' => wp_strip_all_tags($recipe->name()),
            'summary' => wp_strip_all_tags($recipe->summary()),
            'course' => wp_strip_all_tags($recipe->course()),
            'prep_time' => intval($recipe->prep_time()),
            'cook_time' => intval($recipe->cook_time()),
            'total_time' => intval($recipe->total_time()),
            'servings' => intval($recipe->servings()),
            'url' => get_permalink(),
            'ingredients' => array(),
            'instructions' => array()
        );
        
        // Get ingredients safely
        $ingredients = $recipe->ingredients();
        if (is_array($ingredients)) {
            foreach ($ingredients as $ingredient_group) {
                if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                    foreach ($ingredient_group['ingredients'] as $ingredient) {
                        $recipe_data['ingredients'][] = array(
                            'amount' => wp_strip_all_tags(isset($ingredient['amount']) ? $ingredient['amount'] : ''),
                            'unit' => wp_strip_all_tags(isset($ingredient['unit']) ? $ingredient['unit'] : ''),
                            'name' => wp_strip_all_tags(isset($ingredient['name']) ? $ingredient['name'] : ''),
                            'notes' => wp_strip_all_tags(isset($ingredient['notes']) ? $ingredient['notes'] : '')
                        );
                    }
                }
            }
        }
        
        // Get instructions safely
        $instructions = $recipe->instructions();
        if (is_array($instructions)) {
            foreach ($instructions as $instruction_group) {
                if (isset($instruction_group['instructions']) && is_array($instruction_group['instructions'])) {
                    foreach ($instruction_group['instructions'] as $instruction) {
                        $text = isset($instruction['text']) ? $instruction['text'] : '';
                        // Clean text but preserve basic formatting
                        $clean_text = wp_kses($text, array(
                            'strong' => array(),
                            'em' => array(),
                            'b' => array(),
                            'i' => array()
                        ));
                        
                        $recipe_data['instructions'][] = array(
                            'text' => $clean_text
                        );
                    }
                }
            }
        }
        
        // Safely encode JSON
        $recipe_json = wp_json_encode($recipe_data);
        if ($recipe_json === false) {
            return ''; // Skip if JSON encoding fails
        }
        
        $recipe_json_escaped = htmlspecialchars($recipe_json, ENT_QUOTES, 'UTF-8');
        
        return '<div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
            <button class="meal-planner-import-btn" onclick="importToMealPlanner(\'' . $recipe_json_escaped . '\')" style="
                background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                color: white; border: none; padding: 12px 24px; border-radius: 12px;
                font-weight: 600; font-size: 16px; cursor: pointer;
                box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;
            " onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 6px 20px rgba(249, 115, 22, 0.4)\'"
               onmouseout="this.style.transform=\'\'; this.style.boxShadow=\'0 4px 12px rgba(249, 115, 22, 0.3)\'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add to Meal Planner
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">
                Save this recipe to your personal meal planning app
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

// Automatic insertion method
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
            if ($button) {
                $content .= $button;
            }
        }
    }
    
    return $content;
}

// Hook into content filter for automatic insertion
add_filter('the_content', 'automatic_meal_planner_insertion', 999);

// Alternative: Hook into WP Recipe Maker template
add_filter('wprm_recipe_template_shortcode', function($template, $recipe) {
    $import_button = generate_meal_planner_button($recipe->id());
    $template = str_replace(
        '%wprm_recipe_summary%',
        '%wprm_recipe_summary%' . $import_button,
        $template
    );
    return $template;
}, 10, 2);

// JavaScript for meal planner integration
function add_meal_planner_integration_script() {
    if (is_single()) {
        $recipe_ids = detect_recipes_in_post();
        if (!empty($recipe_ids)) {
            ?>
            <script>
            function importToMealPlanner(recipeData) {
                console.log('🍽️ Importing recipe to meal planner:', recipeData.name);
                
                try {
                    // Parse if it's a string
                    if (typeof recipeData === 'string') {
                        recipeData = JSON.parse(recipeData);
                    }
                    
                    // Multi-domain support
                    const domains = {
                        development: 'https://meal-planner-app-development-5205.vercel.app',
                        production: 'https://mealplan.supertasty.recipes'
                    };
                    
                    // Auto-detect domain (you can customize this logic)
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
                    position: fixed; top: 20px; right: 20px; z-index: 10000;
                    padding: 12px 20px; border-radius: 8px; color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px; font-weight: 500; max-width: 300px;
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

// Optional: Shortcode for manual placement
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
    
    return '';
}

add_shortcode('meal_planner_button', 'meal_planner_button_shortcode');

?>