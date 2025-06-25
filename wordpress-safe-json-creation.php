<?php
/**
 * SAFE JSON CREATION - Fixed version that handles encoding issues
 * Replace the full data test with this safer version
 */

function safe_json_creation_test() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: blue; color: white; padding: 10px; margin: 10px 0;">
            🔍 SAFE JSON TEST: Testing with proper encoding...
        </div>';
        
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            
            if (!empty($recipe_ids)) {
                $recipe_id = $recipe_ids[0];
                $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
                
                if ($recipe) {
                    echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                        ✅ Recipe found: ' . esc_html($recipe->name()) . '
                    </div>';
                    
                    try {
                        // SAFE ingredient processing
                        $ingredients_array = array();
                        $ingredients = $recipe->ingredients();
                        
                        if (is_array($ingredients)) {
                            foreach ($ingredients as $ingredient_group) {
                                if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                                    foreach ($ingredient_group['ingredients'] as $ingredient) {
                                        // Clean and sanitize each field
                                        $clean_ingredient = array(
                                            'amount' => sanitize_text_field(isset($ingredient['amount']) ? $ingredient['amount'] : ''),
                                            'unit' => sanitize_text_field(isset($ingredient['unit']) ? $ingredient['unit'] : ''),
                                            'name' => sanitize_text_field(isset($ingredient['name']) ? $ingredient['name'] : ''),
                                            'notes' => sanitize_text_field(isset($ingredient['notes']) ? $ingredient['notes'] : '')
                                        );
                                        $ingredients_array[] = $clean_ingredient;
                                    }
                                }
                            }
                        }
                        
                        echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                            ✅ Safely processed ' . count($ingredients_array) . ' ingredients
                        </div>';
                        
                        // SAFE instruction processing
                        $instructions_array = array();
                        $instructions = $recipe->instructions();
                        
                        if (is_array($instructions)) {
                            foreach ($instructions as $instruction_group) {
                                if (isset($instruction_group['instructions']) && is_array($instruction_group['instructions'])) {
                                    foreach ($instruction_group['instructions'] as $instruction) {
                                        // Clean and sanitize instruction text
                                        $clean_instruction = array(
                                            'text' => sanitize_textarea_field(isset($instruction['text']) ? $instruction['text'] : '')
                                        );
                                        $instructions_array[] = $clean_instruction;
                                    }
                                }
                            }
                        }
                        
                        echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                            ✅ Safely processed ' . count($instructions_array) . ' instructions
                        </div>';
                        
                        // SAFE recipe data creation with smaller chunks
                        $recipe_data = array(
                            'id' => intval($recipe->id()),
                            'name' => sanitize_text_field($recipe->name()),
                            'summary' => sanitize_textarea_field($recipe->summary()),
                            'course' => sanitize_text_field($recipe->course()),
                            'prep_time' => intval($recipe->prep_time()),
                            'cook_time' => intval($recipe->cook_time()),
                            'total_time' => intval($recipe->total_time()),
                            'servings' => intval($recipe->servings()),
                            'url' => esc_url(get_permalink()),
                            'ingredients' => $ingredients_array,
                            'instructions' => $instructions_array
                        );
                        
                        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">
                            🧪 Testing JSON encoding with cleaned data...
                        </div>';
                        
                        // Try JSON encoding with proper flags
                        $json_flags = JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE;
                        $recipe_json = json_encode($recipe_data, $json_flags);
                        
                        if ($recipe_json !== false) {
                            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                ✅ JSON encoding successful! Data size: ' . strlen($recipe_json) . ' characters
                            </div>';
                            
                            // Test if we can parse it back
                            $test_decode = json_decode($recipe_json, true);
                            if ($test_decode !== null) {
                                echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                    ✅ JSON is valid and can be decoded!
                                </div>';
                                
                                // Create working button with safe JSON
                                $safe_json_attr = esc_attr($recipe_json);
                                
                                echo '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
                                    <button onclick="safeImportToMealPlanner(\'' . $safe_json_attr . '\')" style="
                                        background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                                        color: white; border: none; padding: 12px 24px; border-radius: 12px;
                                        font-weight: 600; font-size: 16px; cursor: pointer;
                                        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                                        transition: all 0.2s ease;
                                        display: inline-flex; align-items: center; gap: 8px;
                                    " onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 20px rgba(249,115,22,0.4)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 4px 12px rgba(249,115,22,0.3)\'">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                        </svg>
                                        🍽️ Add ' . esc_html($recipe->name()) . ' to Meal Planner
                                    </button>
                                    <p style="font-size: 12px; color: #666; margin-top: 8px;">
                                        ✅ Complete recipe with ' . count($ingredients_array) . ' ingredients and ' . count($instructions_array) . ' steps
                                    </p>
                                </div>';
                                
                            } else {
                                echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                    ❌ JSON is not valid - decode test failed
                                </div>';
                            }
                            
                        } else {
                            $json_error = json_last_error_msg();
                            echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                ❌ JSON encoding failed: ' . esc_html($json_error) . '
                            </div>';
                        }
                        
                    } catch (Exception $e) {
                        echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                            ❌ Error during safe processing: ' . esc_html($e->getMessage()) . '
                        </div>';
                    }
                }
            }
        }
    }
}

// Safe JavaScript function
function add_safe_import_script() {
    if (is_single() && current_user_can('administrator')) {
        ?>
        <script>
        function safeImportToMealPlanner(recipeJsonString) {
            console.log('🍽️ Safe import starting...');
            
            try {
                // Parse the JSON string
                const recipeData = JSON.parse(recipeJsonString);
                
                console.log('✅ Recipe parsed successfully:', recipeData.name);
                console.log('📊 Recipe stats:', {
                    ingredients: recipeData.ingredients.length,
                    instructions: recipeData.instructions.length,
                    prep_time: recipeData.prep_time,
                    cook_time: recipeData.cook_time
                });
                
                // Open meal planner
                const url = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (!popup) {
                    alert('Please allow popups for this site to test the integration.');
                    return;
                }
                
                // Show immediate feedback
                showSafeImportFeedback('Opening meal planner...', 'info');
                
                // Send recipe data after delay
                setTimeout(function() {
                    try {
                        popup.postMessage({
                            type: 'IMPORT_RECIPE',
                            recipe: recipeData,
                            source: 'wordpress',
                            timestamp: Date.now()
                        }, 'https://meal-planner-app-development-5205.vercel.app');
                        
                        console.log('✅ Recipe sent to meal planner successfully');
                        showSafeImportFeedback('Recipe imported successfully!', 'success');
                        
                    } catch (error) {
                        console.log('Recipe will be available when meal planner loads');
                        showSafeImportFeedback('Recipe queued for import...', 'info');
                    }
                }, 3000);
                
            } catch (error) {
                console.error('❌ Error in safe import:', error);
                showSafeImportFeedback('Error importing recipe: ' + error.message, 'error');
            }
        }
        
        function showSafeImportFeedback(message, type) {
            // Remove existing feedback
            const existing = document.getElementById('safe-import-feedback');
            if (existing) existing.remove();
            
            // Create feedback element
            const feedback = document.createElement('div');
            feedback.id = 'safe-import-feedback';
            feedback.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                padding: 12px 20px; border-radius: 8px; color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px; font-weight: 500; max-width: 300px;
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

add_action('wp_footer', 'safe_json_creation_test');
add_action('wp_footer', 'add_safe_import_script');

?>