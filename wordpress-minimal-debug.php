<?php
/**
 * MINIMAL DEBUG VERSION - Find exactly what's causing the error
 * Replace Step 3 code with this minimal version
 */

// Minimal test that doesn't try to generate buttons yet
function minimal_debug_test() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: blue; color: white; padding: 10px; margin: 10px 0;">
            🔍 MINIMAL DEBUG: Starting safe tests...
        </div>';
        
        // Test 1: Basic recipe detection
        if (class_exists('WPRM_Recipe_Manager')) {
            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                ✅ Test 1: WPRM_Recipe_Manager class exists
            </div>';
            
            try {
                // Test 2: Get recipe IDs
                $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
                echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                    ✅ Test 2: Recipe IDs retrieved: ' . implode(', ', $recipe_ids) . '
                </div>';
                
                if (!empty($recipe_ids)) {
                    $recipe_id = $recipe_ids[0];
                    
                    try {
                        // Test 3: Get recipe object
                        $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
                        if ($recipe) {
                            echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                ✅ Test 3: Recipe object retrieved for ID: ' . $recipe_id . '
                            </div>';
                            
                            try {
                                // Test 4: Get basic recipe properties
                                $name = $recipe->name();
                                $summary = $recipe->summary();
                                echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                    ✅ Test 4: Basic properties - Name: ' . esc_html($name) . '
                                </div>';
                                
                                try {
                                    // Test 5: Get ingredients (this might be the problem)
                                    $ingredients = $recipe->ingredients();
                                    echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                        ✅ Test 5: Ingredients retrieved (type: ' . gettype($ingredients) . ')
                                    </div>';
                                    
                                    try {
                                        // Test 6: Get instructions (this might also be the problem)
                                        $instructions = $recipe->instructions();
                                        echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                            ✅ Test 6: Instructions retrieved (type: ' . gettype($instructions) . ')
                                        </div>';
                                        
                                        // Test 7: Try to create simple array
                                        $simple_data = array(
                                            'id' => $recipe_id,
                                            'name' => $name,
                                            'summary' => $summary
                                        );
                                        echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                            ✅ Test 7: Simple array created successfully
                                        </div>';
                                        
                                        try {
                                            // Test 8: Try JSON encoding
                                            $json = json_encode($simple_data);
                                            if ($json !== false) {
                                                echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
                                                    ✅ Test 8: JSON encoding successful
                                                </div>';
                                                
                                                // Test 9: Show minimal button (no complex data)
                                                echo '<div style="background: purple; color: white; padding: 20px; margin: 20px 0; text-align: center;">
                                                    ✅ All tests passed! Here\'s a minimal button:<br><br>
                                                    <button onclick="alert(\'Recipe: ' . esc_js($name) . '\')" style="background: #f97316; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                                                        🍽️ ' . esc_html($name) . '
                                                    </button>
                                                </div>';
                                                
                                            } else {
                                                echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                                    ❌ Test 8 FAILED: JSON encoding failed
                                                </div>';
                                            }
                                        } catch (Exception $e) {
                                            echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                                ❌ Test 8 FAILED: JSON encoding exception: ' . esc_html($e->getMessage()) . '
                                            </div>';
                                        }
                                        
                                    } catch (Exception $e) {
                                        echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                            ❌ Test 6 FAILED: Instructions error: ' . esc_html($e->getMessage()) . '
                                        </div>';
                                    }
                                    
                                } catch (Exception $e) {
                                    echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                        ❌ Test 5 FAILED: Ingredients error: ' . esc_html($e->getMessage()) . '
                                    </div>';
                                }
                                
                            } catch (Exception $e) {
                                echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                    ❌ Test 4 FAILED: Basic properties error: ' . esc_html($e->getMessage()) . '
                                </div>';
                            }
                            
                        } else {
                            echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                                ❌ Test 3 FAILED: Recipe object is null
                            </div>';
                        }
                    } catch (Exception $e) {
                        echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                            ❌ Test 3 FAILED: Recipe object error: ' . esc_html($e->getMessage()) . '
                        </div>';
                    }
                } else {
                    echo '<div style="background: orange; color: white; padding: 10px; margin: 10px 0;">
                        ⚠️ No recipe IDs found
                    </div>';
                }
                
            } catch (Exception $e) {
                echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                    ❌ Test 2 FAILED: Recipe IDs error: ' . esc_html($e->getMessage()) . '
                </div>';
            }
            
        } else {
            echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                ❌ Test 1 FAILED: WPRM_Recipe_Manager class not found
            </div>';
        }
    }
}

add_action('wp_footer', 'minimal_debug_test');

?>