<?php
/**
 * FULL DATA EXTRACTION TEST
 * Now that we know basic access works, let's test the detailed data extraction
 * Replace the minimal debug code with this
 */

function full_data_extraction_test() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: blue; color: white; padding: 10px; margin: 10px 0;">
            🔍 FULL DATA TEST: Testing detailed data extraction...
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
                    
                    // Test detailed ingredients extraction
                    try {
                        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">
                            🧪 Testing ingredients extraction...
                        </div>';
                        
                        $ingredients = $recipe->ingredients();
                        $ingredients_array = array();
                        
                        if (is_array($ingredients)) {
                            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                ✅ Ingredients is array with ' . count($ingredients) . ' groups
                            </div>';
                            
                            foreach ($ingredients as $group_index => $ingredient_group) {
                                echo '<div style="background: cyan; color: black; padding: 5px; margin: 5px 0;">
                                    Group ' . $group_index . ' type: ' . gettype($ingredient_group) . '
                                </div>';
                                
                                if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                                    echo '<div style="background: green; color: white; padding: 5px; margin: 5px 0;">
                                        ✅ Group has ' . count($ingredient_group['ingredients']) . ' ingredients
                                    </div>';
                                    
                                    foreach ($ingredient_group['ingredients'] as $ing_index => $ingredient) {
                                        echo '<div style="background: lightgreen; color: black; padding: 3px; margin: 3px 0; font-size: 12px;">
                                            Ingredient ' . $ing_index . ': ' . print_r($ingredient, true) . '
                                        </div>';
                                        
                                        try {
                                            $ingredients_array[] = array(
                                                'amount' => isset($ingredient['amount']) ? $ingredient['amount'] : '',
                                                'unit' => isset($ingredient['unit']) ? $ingredient['unit'] : '',
                                                'name' => isset($ingredient['name']) ? $ingredient['name'] : '',
                                                'notes' => isset($ingredient['notes']) ? $ingredient['notes'] : ''
                                            );
                                        } catch (Exception $e) {
                                            echo '<div style="background: red; color: white; padding: 5px; margin: 5px 0;">
                                                ❌ Error processing ingredient ' . $ing_index . ': ' . esc_html($e->getMessage()) . '
                                            </div>';
                                        }
                                    }
                                } else {
                                    echo '<div style="background: orange; color: white; padding: 5px; margin: 5px 0;">
                                        ⚠️ Group ' . $group_index . ' has no ingredients array
                                    </div>';
                                }
                            }
                            
                            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                ✅ Ingredients extraction completed: ' . count($ingredients_array) . ' ingredients processed
                            </div>';
                            
                        } else {
                            echo '<div style="background: orange; color: white; padding: 10px; margin: 10px 0;">
                                ⚠️ Ingredients is not an array: ' . gettype($ingredients) . '
                            </div>';
                        }
                        
                    } catch (Exception $e) {
                        echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                            ❌ INGREDIENTS ERROR: ' . esc_html($e->getMessage()) . '
                        </div>';
                    }
                    
                    // Test detailed instructions extraction
                    try {
                        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">
                            🧪 Testing instructions extraction...
                        </div>';
                        
                        $instructions = $recipe->instructions();
                        $instructions_array = array();
                        
                        if (is_array($instructions)) {
                            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                ✅ Instructions is array with ' . count($instructions) . ' groups
                            </div>';
                            
                            foreach ($instructions as $group_index => $instruction_group) {
                                echo '<div style="background: cyan; color: black; padding: 5px; margin: 5px 0;">
                                    Group ' . $group_index . ' type: ' . gettype($instruction_group) . '
                                </div>';
                                
                                if (isset($instruction_group['instructions']) && is_array($instruction_group['instructions'])) {
                                    echo '<div style="background: green; color: white; padding: 5px; margin: 5px 0;">
                                        ✅ Group has ' . count($instruction_group['instructions']) . ' instructions
                                    </div>';
                                    
                                    foreach ($instruction_group['instructions'] as $inst_index => $instruction) {
                                        echo '<div style="background: lightgreen; color: black; padding: 3px; margin: 3px 0; font-size: 12px;">
                                            Instruction ' . $inst_index . ': ' . print_r($instruction, true) . '
                                        </div>';
                                        
                                        try {
                                            $instructions_array[] = array(
                                                'text' => isset($instruction['text']) ? $instruction['text'] : ''
                                            );
                                        } catch (Exception $e) {
                                            echo '<div style="background: red; color: white; padding: 5px; margin: 5px 0;">
                                                ❌ Error processing instruction ' . $inst_index . ': ' . esc_html($e->getMessage()) . '
                                            </div>';
                                        }
                                    }
                                } else {
                                    echo '<div style="background: orange; color: white; padding: 5px; margin: 5px 0;">
                                        ⚠️ Group ' . $group_index . ' has no instructions array
                                    </div>';
                                }
                            }
                            
                            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                ✅ Instructions extraction completed: ' . count($instructions_array) . ' instructions processed
                            </div>';
                            
                        } else {
                            echo '<div style="background: orange; color: white; padding: 10px; margin: 10px 0;">
                                ⚠️ Instructions is not an array: ' . gettype($instructions) . '
                            </div>';
                        }
                        
                    } catch (Exception $e) {
                        echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                            ❌ INSTRUCTIONS ERROR: ' . esc_html($e->getMessage()) . '
                        </div>';
                    }
                    
                    // Test final JSON creation
                    try {
                        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">
                            🧪 Testing final JSON creation...
                        </div>';
                        
                        $complete_recipe_data = array(
                            'id' => $recipe->id(),
                            'name' => $recipe->name(),
                            'summary' => $recipe->summary(),
                            'course' => $recipe->course(),
                            'prep_time' => $recipe->prep_time(),
                            'cook_time' => $recipe->cook_time(),
                            'total_time' => $recipe->total_time(),
                            'servings' => $recipe->servings(),
                            'ingredients' => $ingredients_array,
                            'instructions' => $instructions_array,
                            'url' => get_permalink()
                        );
                        
                        $final_json = json_encode($complete_recipe_data);
                        
                        if ($final_json !== false) {
                            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                ✅ COMPLETE JSON CREATION SUCCESSFUL!
                            </div>';
                            
                            // Show working button with real data
                            $recipe_json_escaped = esc_attr($final_json);
                            echo '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
                                <button onclick="testRealImport(' . $recipe_json_escaped . ')" style="
                                    background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                                    color: white; border: none; padding: 12px 24px; border-radius: 12px;
                                    font-weight: 600; font-size: 16px; cursor: pointer;
                                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                                ">
                                    🍽️ Test Real Import - ' . esc_html($recipe->name()) . '
                                </button>
                                <p style="font-size: 12px; color: #666; margin-top: 8px;">
                                    This button has the complete recipe data!
                                </p>
                            </div>';
                            
                        } else {
                            echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                ❌ FINAL JSON CREATION FAILED
                            </div>';
                        }
                        
                    } catch (Exception $e) {
                        echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                            ❌ FINAL JSON ERROR: ' . esc_html($e->getMessage()) . '
                        </div>';
                    }
                }
            }
        }
    }
}

// Add test JavaScript
function add_real_import_test_script() {
    if (is_single() && current_user_can('administrator')) {
        ?>
        <script>
        function testRealImport(recipeData) {
            console.log('🍽️ Testing real import with complete data:', recipeData);
            
            try {
                // Parse if it's a string
                if (typeof recipeData === 'string') {
                    recipeData = JSON.parse(recipeData);
                }
                
                console.log('Recipe name:', recipeData.name);
                console.log('Ingredients count:', recipeData.ingredients.length);
                console.log('Instructions count:', recipeData.instructions.length);
                
                // Test opening meal planner
                const url = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (!popup) {
                    alert('Please allow popups for this site to test the integration.');
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
                        }, 'https://meal-planner-app-development-5205.vercel.app');
                        
                        console.log('✅ Recipe sent to meal planner successfully');
                        alert('✅ Recipe sent successfully! Check the meal planner window.');
                        
                    } catch (error) {
                        console.log('Recipe will be available when meal planner loads');
                        alert('🔄 Recipe queued for import. It will be available when the meal planner finishes loading.');
                    }
                }, 3000);
                
                alert('🍽️ Opening meal planner with: ' + recipeData.name + '\n' + 
                      'Ingredients: ' + recipeData.ingredients.length + '\n' +
                      'Instructions: ' + recipeData.instructions.length);
                
            } catch (error) {
                console.error('Error in test import:', error);
                alert('❌ Error: ' + error.message);
            }
        }
        </script>
        <?php
    }
}

add_action('wp_footer', 'full_data_extraction_test');
add_action('wp_footer', 'add_real_import_test_script');

?>