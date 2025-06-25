<?php
/**
 * ULTRA SAFE JSON TEST - Step by step to find the exact problem
 * Replace your current test with this version
 */

function ultra_safe_json_test() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: blue; color: white; padding: 10px; margin: 10px 0;">
            🔍 ULTRA SAFE JSON TEST: Step by step testing...
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
                    
                    // Test 1: Basic data only
                    try {
                        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">
                            🧪 Test 1: Basic recipe data only...
                        </div>';
                        
                        $basic_data = array(
                            'id' => intval($recipe->id()),
                            'name' => wp_strip_all_tags($recipe->name()),
                            'prep_time' => intval($recipe->prep_time()),
                            'servings' => intval($recipe->servings())
                        );
                        
                        $basic_json = wp_json_encode($basic_data);
                        
                        if ($basic_json !== false) {
                            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                ✅ Test 1 PASSED: Basic JSON works
                            </div>';
                            
                            // Test 2: Add ingredients (simple)
                            echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">
                                🧪 Test 2: Adding simple ingredients...
                            </div>';
                            
                            $simple_ingredients = array();
                            $ingredients = $recipe->ingredients();
                            
                            if (is_array($ingredients)) {
                                $count = 0;
                                foreach ($ingredients as $ingredient_group) {
                                    if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                                        foreach ($ingredient_group['ingredients'] as $ingredient) {
                                            if ($count < 5) { // Only first 5 ingredients for safety
                                                $simple_ingredients[] = array(
                                                    'name' => wp_strip_all_tags(isset($ingredient['name']) ? $ingredient['name'] : 'Unknown'),
                                                    'amount' => wp_strip_all_tags(isset($ingredient['amount']) ? $ingredient['amount'] : '1')
                                                );
                                                $count++;
                                            }
                                        }
                                    }
                                }
                            }
                            
                            $basic_data['ingredients'] = $simple_ingredients;
                            $ingredients_json = wp_json_encode($basic_data);
                            
                            if ($ingredients_json !== false) {
                                echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                    ✅ Test 2 PASSED: Ingredients JSON works (' . count($simple_ingredients) . ' ingredients)
                                </div>';
                                
                                // Test 3: Add instructions (simple)
                                echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">
                                    🧪 Test 3: Adding simple instructions...
                                </div>';
                                
                                $simple_instructions = array();
                                $instructions = $recipe->instructions();
                                
                                if (is_array($instructions)) {
                                    $count = 0;
                                    foreach ($instructions as $instruction_group) {
                                        if (isset($instruction_group['instructions']) && is_array($instruction_group['instructions'])) {
                                            foreach ($instruction_group['instructions'] as $instruction) {
                                                if ($count < 3) { // Only first 3 instructions for safety
                                                    $text = isset($instruction['text']) ? $instruction['text'] : '';
                                                    // Remove special characters that might cause issues
                                                    $clean_text = wp_strip_all_tags($text);
                                                    $clean_text = preg_replace('/[^\x20-\x7E]/', '', $clean_text); // Remove non-printable chars
                                                    $clean_text = substr($clean_text, 0, 100) . '...'; // Limit length
                                                    
                                                    $simple_instructions[] = array(
                                                        'text' => $clean_text
                                                    );
                                                    $count++;
                                                }
                                            }
                                        }
                                    }
                                }
                                
                                $basic_data['instructions'] = $simple_instructions;
                                $full_json = wp_json_encode($basic_data);
                                
                                if ($full_json !== false) {
                                    echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                        ✅ Test 3 PASSED: Full JSON works! (' . count($simple_instructions) . ' instructions)
                                    </div>';
                                    
                                    // Create working button with minimal data
                                    $safe_json_for_button = htmlspecialchars($full_json, ENT_QUOTES, 'UTF-8');
                                    
                                    echo '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
                                        <button onclick="ultraSafeImport(\'' . $safe_json_for_button . '\')" style="
                                            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                                            color: white; border: none; padding: 12px 24px; border-radius: 12px;
                                            font-weight: 600; font-size: 16px; cursor: pointer;
                                            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                                        ">
                                            🍽️ Test Import: ' . esc_html($recipe->name()) . '
                                        </button>
                                        <p style="font-size: 12px; color: #666; margin-top: 8px;">
                                            ✅ Minimal safe version: ' . count($simple_ingredients) . ' ingredients, ' . count($simple_instructions) . ' instructions
                                        </p>
                                    </div>';
                                    
                                } else {
                                    echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                        ❌ Test 3 FAILED: Instructions caused JSON failure
                                    </div>';
                                }
                                
                            } else {
                                echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                    ❌ Test 2 FAILED: Ingredients caused JSON failure
                                </div>';
                            }
                            
                        } else {
                            echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                ❌ Test 1 FAILED: Basic JSON failed
                            </div>';
                        }
                        
                    } catch (Exception $e) {
                        echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                            ❌ Exception during testing: ' . esc_html($e->getMessage()) . '
                        </div>';
                    }
                }
            }
        }
    }
}

// Ultra safe JavaScript
function ultra_safe_import_script() {
    if (is_single() && current_user_can('administrator')) {
        ?>
        <script>
        function ultraSafeImport(jsonString) {
            console.log('🍽️ Ultra safe import starting...');
            
            try {
                const recipeData = JSON.parse(jsonString);
                console.log('✅ Recipe data:', recipeData);
                
                // Just show alert for now - no popup yet
                alert('🎉 SUCCESS!\n\nRecipe: ' + recipeData.name + 
                      '\nIngredients: ' + recipeData.ingredients.length + 
                      '\nInstructions: ' + recipeData.instructions.length + 
                      '\n\nJSON parsing works perfectly!');
                
                // Optional: Test meal planner connection
                if (confirm('Test connection to meal planner app?')) {
                    const url = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
                    const popup = window.open(url, 'mealplanner', 'width=1200,height=800');
                    
                    if (popup) {
                        setTimeout(() => {
                            try {
                                popup.postMessage({
                                    type: 'IMPORT_RECIPE',
                                    recipe: recipeData,
                                    source: 'wordpress'
                                }, 'https://meal-planner-app-development-5205.vercel.app');
                            } catch (e) {
                                console.log('Recipe will be sent when app loads');
                            }
                        }, 3000);
                    }
                }
                
            } catch (error) {
                alert('❌ Error: ' + error.message);
                console.error('Import error:', error);
            }
        }
        </script>
        <?php
    }
}

add_action('wp_footer', 'ultra_safe_json_test');
add_action('wp_footer', 'ultra_safe_import_script');

?>