<?php
/**
 * ULTRA SAFE STEP 3 FIXED - Recipe detection with safer button generation
 * Replace Step 3 code with this fixed version
 */

// Recipe detection and real button generation (FIXED VERSION)
function ultra_safe_test_step3_fixed() {
    // Only show to admins, only on single posts
    if (is_single() && current_user_can('administrator')) {
        global $post;
        
        // Check WP Recipe Maker
        $wprm_active = class_exists('WPRM_Recipe_Manager');
        
        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">
            ✅ Ultra Safe Step 3 FIXED: Recipe detection loaded!<br>
            WP Recipe Maker: ' . ($wprm_active ? 'ACTIVE' : 'NOT FOUND') . '
        </div>';
        
        // Try to find recipes
        $recipe_ids = array();
        $detection_method = 'none';
        
        if ($wprm_active) {
            try {
                // Method 1: Use WP Recipe Maker API
                $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
                if (!empty($recipe_ids)) {
                    $detection_method = 'WP Recipe Maker API';
                }
                
                // Method 2: Check for shortcodes (fallback)
                if (empty($recipe_ids) && has_shortcode($post->post_content, 'wprm-recipe')) {
                    preg_match_all('/\[wprm-recipe[^\]]*id=["\']?(\d+)["\']?[^\]]*\]/', $post->post_content, $matches);
                    if (!empty($matches[1])) {
                        $recipe_ids = array_map('intval', $matches[1]);
                        $detection_method = 'shortcode parsing';
                    }
                }
            } catch (Exception $e) {
                echo '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
                    ❌ Error during recipe detection: ' . esc_html($e->getMessage()) . '
                </div>';
            }
        }
        
        // Show detection results
        echo '<div style="background: ' . (!empty($recipe_ids) ? 'green' : 'orange') . '; color: white; padding: 10px; margin: 10px 0;">
            📊 Detection Results:<br>
            Method: ' . esc_html($detection_method) . '<br>
            Recipes found: ' . count($recipe_ids) . '<br>
            Recipe IDs: ' . implode(', ', $recipe_ids) . '
        </div>';
        
        // If recipes found, show safer button
        if (!empty($recipe_ids)) {
            foreach ($recipe_ids as $recipe_id) {
                echo generate_safe_meal_planner_button($recipe_id);
            }
        } else {
            echo '<div style="text-align: center; margin: 20px 0; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px;">
                ⚠️ <strong>No recipes detected on this post</strong><br>
                <small>Make sure this post contains a recipe created with WP Recipe Maker</small>
            </div>';
        }
    }
}

// SAFER button generation function
function generate_safe_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '<div style="background: red; color: white; padding: 10px;">WP Recipe Maker not found</div>';
    }
    
    try {
        $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
        if (!$recipe) {
            return '<div style="background: orange; color: white; padding: 10px;">Recipe not found for ID: ' . intval($recipe_id) . '</div>';
        }
        
        // Get basic recipe data SAFELY
        $recipe_name = $recipe->name();
        $recipe_summary = $recipe->summary();
        $recipe_course = $recipe->course();
        $prep_time = intval($recipe->prep_time());
        $cook_time = intval($recipe->cook_time());
        $servings = intval($recipe->servings());
        
        // Build simple recipe data structure
        $recipe_data = array(
            'id' => intval($recipe->id()),
            'name' => $recipe_name,
            'summary' => $recipe_summary,
            'course' => $recipe_course,
            'prep_time' => $prep_time,
            'cook_time' => $cook_time,
            'servings' => $servings,
            'url' => get_permalink(),
            'ingredients' => array(),
            'instructions' => array()
        );
        
        // Try to get ingredients SAFELY
        try {
            $ingredients = $recipe->ingredients();
            if (is_array($ingredients)) {
                foreach ($ingredients as $ingredient_group) {
                    if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                        foreach ($ingredient_group['ingredients'] as $ingredient) {
                            $recipe_data['ingredients'][] = array(
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
            // If ingredients fail, continue without them
            $recipe_data['ingredients'] = array();
        }
        
        // Try to get instructions SAFELY
        try {
            $instructions = $recipe->instructions();
            if (is_array($instructions)) {
                foreach ($instructions as $instruction_group) {
                    if (isset($instruction_group['instructions']) && is_array($instruction_group['instructions'])) {
                        foreach ($instruction_group['instructions'] as $instruction) {
                            $recipe_data['instructions'][] = array(
                                'text' => isset($instruction['text']) ? $instruction['text'] : ''
                            );
                        }
                    }
                }
            }
        } catch (Exception $e) {
            // If instructions fail, continue without them
            $recipe_data['instructions'] = array();
        }
        
        // Safely encode JSON
        $recipe_json = wp_json_encode($recipe_data);
        $recipe_json_escaped = esc_attr($recipe_json);
        
        // Generate safe HTML
        $button_html = '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
            <button onclick="importToMealPlanner(' . $recipe_json_escaped . ')" style="
                background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(249,115,22,0.3);
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
                Recipe: <strong>' . esc_html($recipe_name) . '</strong> (ID: ' . intval($recipe_id) . ')
            </p>
        </div>';
        
        return $button_html;
        
    } catch (Exception $e) {
        return '<div style="background: red; color: white; padding: 10px; margin: 10px 0;">
            ❌ Error generating button: ' . esc_html($e->getMessage()) . '
        </div>';
    }
}

// Safer meal planner JavaScript
function safer_meal_planner_script() {
    if (is_single() && current_user_can('administrator')) {
        ?>
        <script>
        function importToMealPlanner(recipeData) {
            console.log('🍽️ Importing recipe to meal planner:', recipeData);
            
            try {
                // Parse recipe data if it's a string
                if (typeof recipeData === 'string') {
                    recipeData = JSON.parse(recipeData);
                }
                
                console.log('Recipe name:', recipeData.name || 'Unknown');
                
                // Open meal planner app
                const url = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
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
                        }, 'https://meal-planner-app-development-5205.vercel.app');
                        console.log('✅ Recipe sent to meal planner');
                    } catch (error) {
                        console.log('Recipe will be available when meal planner loads');
                    }
                }, 3000);
                
                // Show simple feedback
                alert('🍽️ Opening meal planner with recipe: ' + (recipeData.name || 'Unknown'));
                
            } catch (error) {
                console.error('Error importing recipe:', error);
                alert('❌ Error importing recipe. Please try again.');
            }
        }
        </script>
        <?php
    }
}

// Add both functions
add_action('wp_footer', 'ultra_safe_test_step3_fixed');
add_action('wp_footer', 'safer_meal_planner_script');

?>