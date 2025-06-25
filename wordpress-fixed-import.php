<?php
/**
 * FIXED VERSION - Better message handling and debugging
 * This version includes better timing and multiple attempts to send the recipe
 */

// Enhanced shortcode with better import handling
function meal_planner_button_shortcode($atts) {
    // Only on posts with recipes
    if (!is_single() || !class_exists('WPRM_Recipe_Manager')) {
        return '';
    }
    
    // Get recipe IDs
    $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
    if (empty($recipe_ids)) {
        return '<p style="color: orange;">No recipes found on this post.</p>';
    }
    
    // Use first recipe
    $recipe_id = $recipe_ids[0];
    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) {
        return '<p style="color: red;">Recipe not found.</p>';
    }
    
    // Enhanced recipe data with proper field mapping
    $recipe_data = array(
        'id' => $recipe->id(),
        'title' => $recipe->name(), // Note: using 'title' not 'name'
        'description' => $recipe->summary(),
        'category' => $recipe->course(),
        'prepTime' => intval($recipe->prep_time()),
        'cookTime' => intval($recipe->cook_time()),
        'servings' => intval($recipe->servings()),
        'url' => get_permalink(),
        'ingredients' => array(),
        'instructions' => array()
    );

    // Get ingredients with proper format
    try {
        $ingredients = $recipe->ingredients();
        if (is_array($ingredients)) {
            foreach ($ingredients as $ingredient_group) {
                if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                    foreach ($ingredient_group['ingredients'] as $ingredient) {
                        $recipe_data['ingredients'][] = array(
                            'name' => isset($ingredient['name']) ? $ingredient['name'] : '',
                            'quantity' => isset($ingredient['amount']) ? floatval($ingredient['amount']) : 1,
                            'unit' => isset($ingredient['unit']) ? $ingredient['unit'] : 'piece',
                            'category' => 'Other'
                        );
                    }
                }
            }
        }
    } catch (Exception $e) {
        // Continue without ingredients if error
    }

    // Get instructions as array of strings
    try {
        $instructions = $recipe->instructions();
        if (is_array($instructions)) {
            foreach ($instructions as $instruction_group) {
                if (isset($instruction_group['instructions']) && is_array($instruction_group['instructions'])) {
                    foreach ($instruction_group['instructions'] as $instruction) {
                        if (isset($instruction['text']) && !empty(trim($instruction['text']))) {
                            $recipe_data['instructions'][] = trim($instruction['text']);
                        }
                    }
                }
            }
        }
    } catch (Exception $e) {
        // Continue without instructions if error
    }
    
    $recipe_json = json_encode($recipe_data);
    $recipe_json_safe = esc_attr($recipe_json);
    
    // Get counts for display
    $ingredient_count = count($recipe_data['ingredients']);
    $instruction_count = count($recipe_data['instructions']);
    $prep_time = $recipe_data['prepTime'];
    
    // Enhanced button HTML
    return '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <!-- Debug info for admins -->
        ' . (current_user_can('administrator') ? '<div style="background: green; color: white; padding: 5px; margin-bottom: 10px; border-radius: 5px; font-size: 12px;">
            ✅ Fixed Import Button: ' . esc_html($recipe->name()) . ' (ID: ' . $recipe_id . ') → Development URL
        </div>' : '') . '
        
        <button onclick="fixedMealPlannerImport(\'' . $recipe_json_safe . '\')" style="
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
        
        <!-- Recipe stats display -->
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
            Recipe: <strong>' . esc_html($recipe->name()) . '</strong><br>
            <span style="font-size: 10px; background: #e7f3ff; padding: 2px 6px; border-radius: 3px; margin-top: 4px; display: inline-block;">
                📊 ' . $ingredient_count . ' ingredients • ' . $instruction_count . ' steps • ' . $prep_time . 'm prep
            </span>
        </p>
    </div>';
}

add_shortcode('meal_planner_button', 'meal_planner_button_shortcode');

// FIXED JavaScript with better message handling
function add_fixed_meal_planner_script() {
    if (is_single() && has_shortcode(get_post()->post_content, 'meal_planner_button')) {
        ?>
        <script>
        function fixedMealPlannerImport(recipeJsonString) {
            console.log('🍽️ FIXED import starting...');
            
            try {
                const recipe = JSON.parse(recipeJsonString);
                console.log('✅ Recipe data:', recipe);
                console.log('📊 Recipe has:', {
                    ingredients: recipe.ingredients.length,
                    instructions: recipe.instructions.length,
                    title: recipe.title
                });
                
                // Development URL
                const developmentUrl = 'https://meal-planner-app-development-5205.vercel.app';
                
                // Open meal planner with import flag
                const url = developmentUrl + '/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (!popup) {
                    alert('Please allow popups for this site to use the meal planner integration.');
                    return;
                }
                
                // Show immediate feedback
                showFixedFeedback('Opening meal planner...', 'info');
                
                // Store recipe globally for multiple attempts
                window.pendingRecipeImport = recipe;
                
                // Multiple attempts to send recipe with increasing delays
                const sendAttempts = [2000, 4000, 6000, 8000, 10000]; // Try every 2 seconds for 10 seconds
                let attemptCount = 0;
                
                sendAttempts.forEach((delay, index) => {
                    setTimeout(() => {
                        if (popup.closed) {
                            console.log('Popup closed, stopping attempts');
                            return;
                        }
                        
                        attemptCount++;
                        console.log(`📤 Attempt ${attemptCount}: Sending recipe to meal planner...`);
                        
                        try {
                            popup.postMessage({
                                type: 'IMPORT_RECIPE',
                                recipe: recipe,
                                source: 'wordpress',
                                timestamp: Date.now(),
                                attempt: attemptCount
                            }, developmentUrl);
                            
                            console.log(`✅ Recipe sent successfully (attempt ${attemptCount})`);
                            
                            if (attemptCount === 1) {
                                showFixedFeedback('Recipe sent to meal planner!', 'success');
                            }
                            
                        } catch (error) {
                            console.warn(`⚠️ Attempt ${attemptCount} failed:`, error);
                            
                            if (attemptCount === sendAttempts.length) {
                                console.log('📋 All attempts completed - recipe should be available when app loads');
                                showFixedFeedback('Recipe queued for import...', 'info');
                            }
                        }
                    }, delay);
                });
                
                // Also try sending immediately
                setTimeout(() => {
                    try {
                        popup.postMessage({
                            type: 'IMPORT_RECIPE',
                            recipe: recipe,
                            source: 'wordpress',
                            timestamp: Date.now(),
                            attempt: 0
                        }, developmentUrl);
                        console.log('✅ Immediate send attempt completed');
                    } catch (error) {
                        console.log('⚠️ Immediate send failed, will retry...');
                    }
                }, 500);
                
            } catch (error) {
                console.error('❌ Fixed import error:', error);
                showFixedFeedback('Error importing recipe: ' + error.message, 'error');
            }
        }
        
        // Enhanced feedback system
        function showFixedFeedback(message, type) {
            // Remove existing feedback
            const existing = document.getElementById('fixed-feedback');
            if (existing) existing.remove();
            
            // Create feedback element
            const feedback = document.createElement('div');
            feedback.id = 'fixed-feedback';
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
        
        // Listen for messages from the meal planner (to confirm receipt)
        window.addEventListener('message', function(event) {
            if (event.origin !== 'https://meal-planner-app-development-5205.vercel.app') {
                return;
            }
            
            if (event.data && event.data.type === 'IMPORT_RECEIVED') {
                console.log('✅ Meal planner confirmed recipe receipt!');
                showFixedFeedback('Recipe imported successfully! 🎉', 'success');
            }
        });
        </script>
        <?php
    }
}

add_action('wp_footer', 'add_fixed_meal_planner_script');

// Debug message for admins
function show_fixed_debug() {
    if (is_single() && current_user_can('administrator')) {
        $recipe_count = 0;
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            $recipe_count = count($recipe_ids);
        }
        
        echo '<div style="background: blue; color: white; padding: 10px; position: fixed; top: 10px; right: 10px; z-index: 9999; border-radius: 8px;">
            🔧 FIXED Integration Active!<br>
            Found ' . $recipe_count . ' recipe(s)<br>
            <small>→ Multiple send attempts</small>
        </div>';
    }
}

add_action('wp_footer', 'show_fixed_debug');
?>