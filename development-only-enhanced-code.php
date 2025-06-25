<?php
/**
 * ENHANCED VERSION - Development URL Only
 * This version always uses the development URL until you launch your subdomain
 */

// Enhanced shortcode with better styling and stats
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
    
    // Enhanced recipe data with ingredients and instructions
    $recipe_data = array(
        'id' => $recipe->id(),
        'name' => $recipe->name(),
        'prep_time' => $recipe->prep_time(),
        'servings' => $recipe->servings(),
        'url' => get_permalink(),
        'ingredients' => array(),
        'instructions' => array()
    );

    // Safely add more fields
    if (method_exists($recipe, 'summary')) {
        $recipe_data['summary'] = $recipe->summary();
    }
    if (method_exists($recipe, 'course')) {
        $recipe_data['course'] = $recipe->course();
    }
    if (method_exists($recipe, 'cook_time')) {
        $recipe_data['cook_time'] = $recipe->cook_time();
    }

    // Safely get ingredients
    try {
        $ingredients = $recipe->ingredients();
        if (is_array($ingredients)) {
            foreach ($ingredients as $ingredient_group) {
                if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                    foreach ($ingredient_group['ingredients'] as $ingredient) {
                        $recipe_data['ingredients'][] = array(
                            'name' => isset($ingredient['name']) ? $ingredient['name'] : '',
                            'quantity' => isset($ingredient['amount']) ? $ingredient['amount'] : '',
                            'unit' => isset($ingredient['unit']) ? $ingredient['unit'] : '',
                            'category' => 'Other'
                        );
                    }
                }
            }
        }
    } catch (Exception $e) {
        // If ingredients fail, continue without them
    }

    // Safely get instructions
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
    
    $recipe_json = json_encode($recipe_data);
    $recipe_json_safe = esc_attr($recipe_json);
    
    // Get counts for display
    $ingredient_count = count($recipe_data['ingredients']);
    $instruction_count = count($recipe_data['instructions']);
    $prep_time = $recipe_data['prep_time'];
    
    // Enhanced button HTML with stats
    return '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <!-- Debug info for admins -->
        ' . (current_user_can('administrator') ? '<div style="background: green; color: white; padding: 5px; margin-bottom: 10px; border-radius: 5px; font-size: 12px;">
            ✅ Enhanced Button: ' . esc_html($recipe->name()) . ' (ID: ' . $recipe_id . ') → Development URL
        </div>' : '') . '
        
        <button onclick="developmentMealPlannerImport(\'' . $recipe_json_safe . '\')" style="
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

// JavaScript with FIXED development URL
function add_development_meal_planner_script() {
    if (is_single() && has_shortcode(get_post()->post_content, 'meal_planner_button')) {
        ?>
        <script>
        function developmentMealPlannerImport(recipeJson) {
            console.log('🍽️ Development import starting...');
            
            try {
                const recipe = JSON.parse(recipeJson);
                console.log('✅ Recipe data:', recipe);
                console.log('📊 Recipe has:', {
                    ingredients: recipe.ingredients.length,
                    instructions: recipe.instructions.length,
                    name: recipe.name
                });
                
                // 🎯 FIXED: Always use development URL
                const developmentUrl = 'https://meal-planner-app-development-5205.vercel.app';
                
                // Open meal planner
                const url = developmentUrl + '/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (!popup) {
                    alert('Please allow popups for this site to use the meal planner integration.');
                    return;
                }
                
                // Show feedback
                showDevelopmentFeedback('Opening meal planner (development)...', 'info');
                
                // Send recipe data after delay
                setTimeout(function() {
                    try {
                        popup.postMessage({
                            type: 'IMPORT_RECIPE',
                            recipe: recipe,
                            source: 'wordpress',
                            timestamp: Date.now()
                        }, developmentUrl);
                        
                        console.log('✅ Recipe sent to development meal planner');
                        showDevelopmentFeedback('Recipe imported successfully! 🎉', 'success');
                    } catch (error) {
                        console.log('Recipe will be available when meal planner loads');
                        showDevelopmentFeedback('Recipe queued for import...', 'info');
                    }
                }, 3000);
                
            } catch (error) {
                console.error('❌ Development import error:', error);
                showDevelopmentFeedback('Error importing recipe: ' + error.message, 'error');
            }
        }
        
        // Enhanced feedback system
        function showDevelopmentFeedback(message, type) {
            // Remove existing feedback
            const existing = document.getElementById('development-feedback');
            if (existing) existing.remove();
            
            // Create feedback element
            const feedback = document.createElement('div');
            feedback.id = 'development-feedback';
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

add_action('wp_footer', 'add_development_meal_planner_script');

// Debug message for admins
function show_development_debug() {
    if (is_single() && current_user_can('administrator')) {
        $recipe_count = 0;
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            $recipe_count = count($recipe_ids);
        }
        
        echo '<div style="background: blue; color: white; padding: 10px; position: fixed; top: 10px; right: 10px; z-index: 9999; border-radius: 8px;">
            🎉 Development Integration Active!<br>
            Found ' . $recipe_count . ' recipe(s)<br>
            <small>→ Using development URL</small>
        </div>';
    }
}

add_action('wp_footer', 'show_development_debug');
?>