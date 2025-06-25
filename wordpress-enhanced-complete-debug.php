<?php
/**
 * COMPLETE ENHANCED VERSION WITH DEBUGGING
 * Replace ALL your current functions.php meal planner code with this
 */

// Enhanced button generation with full debugging
function generate_enhanced_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '<div style="background: red; color: white; padding: 10px;">❌ WP Recipe Maker not found</div>';
    }

    try {
        $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
        if (!$recipe) {
            return '<div style="background: orange; color: white; padding: 10px;">⚠️ Recipe not found for ID: ' . $recipe_id . '</div>';
        }

        // Get basic recipe data
        $recipe_name = $recipe->name();
        $recipe_summary = $recipe->summary();
        $recipe_course = $recipe->course();
        $prep_time = intval($recipe->prep_time());
        $cook_time = intval($recipe->cook_time());
        $servings = intval($recipe->servings());

        // Initialize arrays
        $ingredients_array = array();
        $instructions_array = array();

        // Get ingredients safely
        try {
            $ingredients = $recipe->ingredients();
            if (is_array($ingredients)) {
                foreach ($ingredients as $ingredient_group) {
                    if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                        foreach ($ingredient_group['ingredients'] as $ingredient) {
                            $ingredients_array[] = array(
                                'amount' => isset($ingredient['amount']) ? $ingredient['amount'] : '',
                                'unit' => isset($ingredient['unit']) ? $ingredient['unit'] : '',
                                'name' => isset($ingredient['name']) ? $ingredient['name'] : '',
                                'notes' => isset($ingredient['notes']) ? $ingredient['notes'] : ''
                            );
                        }
                    }
                }
            }
        } catch (Exception $e) {
            // Continue without ingredients if there's an error
        }

        // Get instructions safely
        try {
            $instructions = $recipe->instructions();
            if (is_array($instructions)) {
                foreach ($instructions as $instruction_group) {
                    if (isset($instruction_group['instructions']) && is_array($instruction_group['instructions'])) {
                        foreach ($instruction_group['instructions'] as $instruction) {
                            $instructions_array[] = array(
                                'text' => isset($instruction['text']) ? $instruction['text'] : ''
                            );
                        }
                    }
                }
            }
        } catch (Exception $e) {
            // Continue without instructions if there's an error
        }

        // Build complete recipe data
        $recipe_data = array(
            'id' => intval($recipe->id()),
            'name' => $recipe_name,
            'summary' => $recipe_summary,
            'course' => $recipe_course,
            'prep_time' => $prep_time,
            'cook_time' => $cook_time,
            'servings' => $servings,
            'ingredients' => $ingredients_array,
            'instructions' => $instructions_array,
            'url' => get_permalink()
        );

        // Safe JSON encoding
        $recipe_json = wp_json_encode($recipe_data);
        if ($recipe_json === false) {
            return '<div style="background: red; color: white; padding: 10px;">❌ JSON encoding failed</div>';
        }

        $recipe_json_escaped = esc_attr($recipe_json);
        $ingredient_count = count($ingredients_array);
        $instruction_count = count($instructions_array);

        // Enhanced button with stats
        return '<div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
            <div style="background: green; color: white; padding: 5px; margin-bottom: 10px; border-radius: 5px; font-size: 12px;">
                ✅ Enhanced Button Generated: ' . esc_html($recipe_name) . ' (ID: ' . $recipe_id . ')
            </div>
            <button onclick="enhancedMealPlannerImport(\'' . $recipe_json_escaped . '\')" style="
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
                Recipe: <strong>' . esc_html($recipe_name) . '</strong><br>
                <span style="font-size: 10px; background: #e7f3ff; padding: 2px 6px; border-radius: 3px; margin-top: 4px; display: inline-block;">
                    📊 ' . $ingredient_count . ' ingredients • ' . $instruction_count . ' steps • ' . $prep_time . 'm prep
                </span>
            </p>
        </div>';

    } catch (Exception $e) {
        return '<div style="background: red; color: white; padding: 10px;">❌ Error: ' . esc_html($e->getMessage()) . '</div>';
    }
}

// Safe recipe detection
function safe_detect_recipes() {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return array();
    }

    try {
        return WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
    } catch (Exception $e) {
        return array();
    }
}

// Automatic insertion function
function automatic_enhanced_meal_planner_insertion($content) {
    // Only on single posts in main query
    if (!is_single() || !in_the_loop() || !is_main_query()) {
        return $content;
    }

    $recipe_ids = safe_detect_recipes();
    if (!empty($recipe_ids)) {
        // Add enhanced button for each recipe
        foreach ($recipe_ids as $recipe_id) {
            $button = generate_enhanced_meal_planner_button($recipe_id);
            $content .= $button;
        }
    }

    return $content;
}

// Hook into content filter for automatic insertion
add_filter('the_content', 'automatic_enhanced_meal_planner_insertion', 999);

// Enhanced JavaScript with debugging
function add_enhanced_meal_planner_script() {
    if (is_single()) {
        $recipe_ids = safe_detect_recipes();
        if (!empty($recipe_ids)) {
            ?>
            <script>
            function enhancedMealPlannerImport(recipeDataString) {
                console.log('🍽️ ENHANCED import starting...');
                console.log('Raw data string length:', recipeDataString.length);
                
                try {
                    // Parse the recipe data
                    const recipeData = JSON.parse(recipeDataString);
                    console.log('✅ Enhanced recipe data parsed:', recipeData);
                    console.log('📊 Recipe stats:', {
                        name: recipeData.name,
                        ingredients: recipeData.ingredients.length,
                        instructions: recipeData.instructions.length,
                        prep_time: recipeData.prep_time,
                        cook_time: recipeData.cook_time,
                        servings: recipeData.servings
                    });

                    // Multi-domain support
                    const domains = {
                        development: 'https://meal-planner-app-development-5205.vercel.app',
                        production: 'https://mealplan.supertasty.recipes'
                    };

                    // Auto-detect domain
                    const isProduction = window.location.hostname.includes('supertasty.recipes') || 
                                       window.location.hostname.includes('yourdomain.com');
                    const targetDomain = isProduction ? domains.production : domains.development;

                    console.log('🌐 Target domain:', targetDomain);

                    // Open meal planner
                    const url = targetDomain + '/#/?import=pending';
                    const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');

                    if (!popup) {
                        alert('Please allow popups for this site to use the meal planner integration.');
                        return;
                    }

                    // Show immediate feedback
                    showEnhancedImportFeedback('Opening meal planner with enhanced recipe data...', 'info');

                    // Send recipe data after delay
                    setTimeout(function() {
                        try {
                            popup.postMessage({
                                type: 'IMPORT_RECIPE',
                                recipe: recipeData,
                                source: 'wordpress',
                                timestamp: Date.now()
                            }, targetDomain);
                            
                            console.log('✅ Enhanced recipe sent to meal planner');
                            showEnhancedImportFeedback('Recipe imported successfully! 🎉', 'success');
                        } catch (error) {
                            console.log('Recipe will be available when meal planner loads');
                            showEnhancedImportFeedback('Recipe queued for import...', 'info');
                        }
                    }, 3000);

                } catch (error) {
                    console.error('❌ Enhanced import error:', error);
                    showEnhancedImportFeedback('Error importing recipe: ' + error.message, 'error');
                }
            }

            function showEnhancedImportFeedback(message, type) {
                // Remove existing feedback
                const existing = document.getElementById('enhanced-import-feedback');
                if (existing) existing.remove();

                // Create feedback element
                const feedback = document.createElement('div');
                feedback.id = 'enhanced-import-feedback';
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
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

add_action('wp_footer', 'add_enhanced_meal_planner_script');

// Debug message for admins
function show_enhanced_integration_debug() {
    if (is_single() && current_user_can('administrator')) {
        $recipe_ids = safe_detect_recipes();
        echo '<div style="background: blue; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 10px; right: 10px; z-index: 9999; border-radius: 8px;">
            🎉 ENHANCED Integration Active!<br>
            Found ' . count($recipe_ids) . ' recipe(s) on this post.<br>
            <small>Enhanced buttons with ingredient/step counts should appear!</small>
        </div>';
    }
}

add_action('wp_footer', 'show_enhanced_integration_debug');

// Optional: Shortcode for manual placement
function enhanced_meal_planner_shortcode($atts) {
    $atts = shortcode_atts(array(
        'recipe_id' => null
    ), $atts);

    // If no recipe ID provided, try to find one
    if (!$atts['recipe_id']) {
        $recipe_ids = safe_detect_recipes();
        if (!empty($recipe_ids)) {
            $atts['recipe_id'] = $recipe_ids[0];
        }
    }

    if ($atts['recipe_id']) {
        return generate_enhanced_meal_planner_button($atts['recipe_id']);
    }

    return '<p style="color: orange; font-style: italic;">No recipe found for enhanced meal planner button.</p>';
}

add_shortcode('enhanced_meal_planner_button', 'enhanced_meal_planner_shortcode');
?>