<?php
/**
 * ULTRA SAFE WordPress Integration - Just shortcode, no automatic insertion
 * This won't cause critical errors - very conservative approach
 */

// Simple shortcode - only works when you manually add [meal_planner_button]
function meal_planner_button_shortcode($atts) {
    // Safety checks
    if (!is_single() || !class_exists('WPRM_Recipe_Manager')) {
        return '<p style="color: orange; padding: 10px;">Meal planner integration requires WP Recipe Maker plugin.</p>';
    }
    
    try {
        // Get recipe IDs safely
        $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
        if (empty($recipe_ids)) {
            return '<p style="color: orange; padding: 10px;">No recipes found on this post.</p>';
        }
        
        // Use first recipe
        $recipe_id = $recipe_ids[0];
        $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
        if (!$recipe) {
            return '<p style="color: red; padding: 10px;">Recipe not found.</p>';
        }
        
        // Simple recipe data (minimal to avoid errors)
        $recipe_data = array(
            'id' => intval($recipe->id()),
            'title' => $recipe->name(),
            'prepTime' => intval($recipe->prep_time()),
            'servings' => intval($recipe->servings()),
            'ingredients' => array(),
            'instructions' => array()
        );
        
        // Try to get ingredients safely
        try {
            $ingredients = $recipe->ingredients();
            if (is_array($ingredients)) {
                foreach ($ingredients as $ingredient_group) {
                    if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                        foreach ($ingredient_group['ingredients'] as $ingredient) {
                            $recipe_data['ingredients'][] = array(
                                'name' => isset($ingredient['name']) ? $ingredient['name'] : '',
                                'quantity' => isset($ingredient['amount']) ? floatval($ingredient['amount']) : 1,
                                'unit' => isset($ingredient['unit']) ? $ingredient['unit'] : 'piece'
                            );
                        }
                    }
                }
            }
        } catch (Exception $e) {
            // If ingredients fail, continue without them
        }
        
        // Try to get instructions safely
        try {
            $instructions = $recipe->instructions();
            if (is_array($instructions)) {
                foreach ($instructions as $instruction_group) {
                    if (isset($instruction_group['instructions']) && is_array($instruction_group['instructions'])) {
                        foreach ($instruction_group['instructions'] as $instruction) {
                            if (isset($instruction['text'])) {
                                $recipe_data['instructions'][] = $instruction['text'];
                            }
                        }
                    }
                }
            }
        } catch (Exception $e) {
            // If instructions fail, continue without them
        }
        
        // Safe JSON encoding
        $recipe_json = json_encode($recipe_data);
        if ($recipe_json === false) {
            return '<p style="color: red; padding: 10px;">Error processing recipe data.</p>';
        }
        
        $recipe_json_safe = esc_attr($recipe_json);
        
        // Simple button HTML
        return '<div style="margin: 20px 0; text-align: center; background: #fef7ed; border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
            <button onclick="safeMealPlannerImport(\'' . $recipe_json_safe . '\')" style="
                background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                display: inline-flex;
                align-items: center;
                gap: 8px;
            ">
                🍽️ Add to Meal Planner
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">
                Recipe: <strong>' . esc_html($recipe->name()) . '</strong>
            </p>
        </div>';
        
    } catch (Exception $e) {
        return '<p style="color: red; padding: 10px;">Error: ' . esc_html($e->getMessage()) . '</p>';
    }
}

// Register the shortcode
add_shortcode('meal_planner_button', 'meal_planner_button_shortcode');

// Simple JavaScript - only loads when shortcode is used
function add_safe_meal_planner_script() {
    if (is_single() && has_shortcode(get_post()->post_content, 'meal_planner_button')) {
        ?>
        <script>
        function safeMealPlannerImport(recipeJsonString) {
            console.log('🍽️ Safe import starting...');
            
            try {
                const recipe = JSON.parse(recipeJsonString);
                console.log('✅ Recipe parsed:', recipe.title);
                
                // Open meal planner
                const url = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (!popup) {
                    alert('Please allow popups for this site to use the meal planner.');
                    return;
                }
                
                // Send recipe data after delay
                setTimeout(function() {
                    try {
                        popup.postMessage({
                            type: 'IMPORT_RECIPE',
                            recipe: recipe,
                            source: 'wordpress',
                            timestamp: Date.now()
                        }, 'https://meal-planner-app-development-5205.vercel.app');
                        
                        console.log('✅ Recipe sent to meal planner');
                        showSafeFeedback('Recipe imported successfully! 🎉', 'success');
                    } catch (error) {
                        console.log('Recipe will be available when meal planner loads');
                        showSafeFeedback('Recipe queued for import...', 'info');
                    }
                }, 3000);
                
                showSafeFeedback('Opening meal planner...', 'info');
                
            } catch (error) {
                console.error('Error importing recipe:', error);
                showSafeFeedback('Error importing recipe. Please try again.', 'error');
            }
        }
        
        function showSafeFeedback(message, type) {
            // Remove existing feedback
            const existing = document.getElementById('safe-feedback');
            if (existing) existing.remove();
            
            // Create feedback element
            const feedback = document.createElement('div');
            feedback.id = 'safe-feedback';
            feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: 500;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                ${type === 'success' ? 'background: #10b981;' :
                  type === 'error' ? 'background: #ef4444;' :
                  'background: #f97316;'}
            `;
            feedback.textContent = message;
            document.body.appendChild(feedback);
            
            // Auto-remove after 4 seconds
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.remove();
                }
            }, 4000);
        }
        </script>
        <?php
    }
}

add_action('wp_footer', 'add_safe_meal_planner_script');

// Optional: Success message for admins only
function show_safe_integration_status() {
    if (is_single() && current_user_can('administrator')) {
        $recipe_count = 0;
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            $recipe_count = count($recipe_ids);
        }
        
        if ($recipe_count > 0) {
            echo '<div style="background: green; color: white; padding: 8px; position: fixed; top: 10px; right: 10px; z-index: 9999; border-radius: 6px; font-size: 12px;">
                ✅ Safe Integration Active<br>
                Found ' . $recipe_count . ' recipe(s)<br>
                <small>Use [meal_planner_button] shortcode</small>
            </div>';
        }
    }
}

add_action('wp_footer', 'show_safe_integration_status');
?>