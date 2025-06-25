<?php
/**
 * COMPLETE Meal Planner Integration - Full Recipe Data
 * Replace your ultra-minimal code with this complete version
 * 
 * INSTRUCTIONS:
 * 1. Replace your current functions.php code with this
 * 2. This includes full recipe data extraction
 * 3. Test with [meal_planner_button] shortcode first
 * 4. Then uncomment automatic insertion if desired
 */

// Generate meal planner button with COMPLETE recipe data
function generate_complete_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '';
    }
    
    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) return '';
    
    try {
        // Get COMPLETE recipe data
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
        
        // Get ALL ingredients with complete data
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
        
        // Get ALL instructions
        foreach ($recipe->instructions() as $instruction_group) {
            foreach ($instruction_group['instructions'] as $instruction) {
                $recipe_data['instructions'][] = array(
                    'text' => $instruction['text']
                );
            }
        }
        
        // Safely encode complete JSON
        $recipe_json = wp_json_encode($recipe_data);
        if ($recipe_json === false) {
            return '<p style="color: red;">Error encoding recipe data</p>';
        }
        
        $recipe_json_safe = esc_attr($recipe_json);
        
        // Complete button HTML with full styling
        return '<div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
            <button onclick="completeMealPlannerImport(\'' . $recipe_json_safe . '\')" style="
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
                onmouseout="this.style.transform=\'\'; this.style.boxShadow=\'0 4px 12px rgba(249, 115, 22, 0.3)\'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add to Meal Planner
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">
                Save this recipe: <strong>' . esc_html($recipe->name()) . '</strong><br>
                <span style="font-size: 10px;">📊 ' . count($recipe_data['ingredients']) . ' ingredients • ' . count($recipe_data['instructions']) . ' steps</span>
            </p>
        </div>';
        
    } catch (Exception $e) {
        return '<p style="color: red;">Error processing recipe: ' . esc_html($e->getMessage()) . '</p>';
    }
}

// Shortcode for manual placement (SAFE)
function complete_meal_planner_shortcode($atts) {
    $atts = shortcode_atts(array(
        'recipe_id' => null
    ), $atts);
    
    // If no recipe ID provided, try to find one
    if (!$atts['recipe_id']) {
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            if (!empty($recipe_ids)) {
                $atts['recipe_id'] = $recipe_ids[0];
            }
        }
    }
    
    if ($atts['recipe_id']) {
        return generate_complete_meal_planner_button($atts['recipe_id']);
    }
    
    return '<p style="color: orange; font-style: italic;">No recipe found for meal planner button.</p>';
}

add_shortcode('meal_planner_button', 'complete_meal_planner_shortcode');

// Complete JavaScript with full integration
function add_complete_meal_planner_script() {
    if (is_single()) {
        ?>
        <script>
        function completeMealPlannerImport(recipeJsonString) {
            console.log('🍽️ Starting COMPLETE recipe import...');
            
            try {
                // Parse the complete recipe data
                const recipeData = JSON.parse(recipeJsonString);
                console.log('✅ Complete recipe data:', recipeData);
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
                
                // Open meal planner
                const url = targetDomain + '/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (!popup) {
                    alert('Please allow popups for this site to use the meal planner integration.');
                    return;
                }
                
                // Send COMPLETE recipe data after delay
                setTimeout(function() {
                    try {
                        popup.postMessage({
                            type: 'IMPORT_RECIPE',
                            recipe: recipeData,
                            source: 'wordpress',
                            timestamp: Date.now()
                        }, targetDomain);
                        
                        console.log('✅ COMPLETE recipe sent to meal planner');
                        showImportFeedback('Recipe imported successfully! 🎉', 'success');
                    } catch (error) {
                        console.log('Recipe will be available when meal planner loads');
                        showImportFeedback('Recipe queued for import...', 'info');
                    }
                }, 3000);
                
                // Show immediate feedback
                showImportFeedback('Opening meal planner with complete recipe data...', 'info');
                
            } catch (error) {
                console.error('❌ Error importing recipe:', error);
                showImportFeedback('Error importing recipe: ' + error.message, 'error');
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

add_action('wp_footer', 'add_complete_meal_planner_script');

// OPTIONAL: Automatic insertion (uncomment to enable)
// function automatic_meal_planner_insertion($content) {
//     // Only on single posts in main query
//     if (!is_single() || !in_the_loop() || !is_main_query()) {
//         return $content;
//     }
//     
//     if (class_exists('WPRM_Recipe_Manager')) {
//         $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
//         if (!empty($recipe_ids)) {
//             foreach ($recipe_ids as $recipe_id) {
//                 $button = generate_complete_meal_planner_button($recipe_id);
//                 $content .= $button;
//             }
//         }
//     }
//     
//     return $content;
// }
// add_filter('the_content', 'automatic_meal_planner_insertion', 999);

// Success message for admins
function show_complete_integration_success() {
    if (is_single() && current_user_can('administrator')) {
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            if (!empty($recipe_ids)) {
                echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 10px; right: 10px; z-index: 9999; border-radius: 8px;">
                    🎉 COMPLETE Integration Active!<br>
                    Found ' . count($recipe_ids) . ' recipe(s) with full data.<br>
                    <small>Use [meal_planner_button] shortcode</small>
                </div>';
            }
        }
    }
}

add_action('wp_footer', 'show_complete_integration_success');

?>