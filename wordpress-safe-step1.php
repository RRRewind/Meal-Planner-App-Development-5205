<?php
/**
 * SAFE STEP 1: Basic function only - no automatic insertion
 * Add ONLY this code to functions.php first
 */

// Basic button generation function (safe)
function generate_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '';
    }
    
    try {
        $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
        if (!$recipe) return '';
        
        // Get basic recipe data safely
        $recipe_data = array(
            'id' => intval($recipe->id()),
            'name' => wp_strip_all_tags($recipe->name()),
            'summary' => wp_strip_all_tags($recipe->summary()),
            'course' => wp_strip_all_tags($recipe->course()),
            'prep_time' => intval($recipe->prep_time()),
            'cook_time' => intval($recipe->cook_time()),
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
            return '';
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
        return '';
    }
}

// Safe JavaScript - only inline
function add_safe_meal_planner_script() {
    if (is_single()) {
        ?>
        <script>
        function importToMealPlanner(recipeDataString) {
            console.log('🍽️ Starting recipe import...');
            
            try {
                const recipeData = JSON.parse(recipeDataString);
                console.log('Recipe to import:', recipeData.name);
                
                // Multi-domain support
                const domains = {
                    development: 'https://meal-planner-app-development-5205.vercel.app',
                    production: 'https://mealplan.supertasty.recipes'
                };
                
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
                
                showImportFeedback('Opening meal planner...', 'info');
                
            } catch (error) {
                console.error('Error importing recipe:', error);
                showImportFeedback('Error importing recipe. Please try again.', 'error');
            }
        }
        
        function showImportFeedback(message, type) {
            const existing = document.getElementById('meal-planner-feedback');
            if (existing) existing.remove();
            
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

add_action('wp_footer', 'add_safe_meal_planner_script');

// Test message for admins only
function safe_integration_test() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 10px; right: 10px; z-index: 9999;">
            ✅ Safe Step 1: Functions loaded successfully!<br>
            Ready for shortcode testing.
        </div>';
    }
}

add_action('wp_footer', 'safe_integration_test');

?>