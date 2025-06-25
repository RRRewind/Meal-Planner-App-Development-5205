<?php
/**
 * FIXED VERSION - Forces Development URL Only
 * Replace your enhanced code with this version that ONLY uses development URL
 */

// Enhanced shortcode with FORCED development URL
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
    
    // Enhanced recipe data
    $recipe_data = array(
        'id' => $recipe->id(),
        'title' => $recipe->name(),
        'name' => $recipe->name(),
        'prep_time' => $recipe->prep_time(),
        'prepTime' => $recipe->prep_time(),
        'servings' => $recipe->servings(),
        'url' => get_permalink(),
        'ingredients' => array(),
        'instructions' => array()
    );

    // Safely add more fields
    if (method_exists($recipe, 'summary')) {
        $recipe_data['summary'] = $recipe->summary();
        $recipe_data['description'] = $recipe->summary();
    }
    if (method_exists($recipe, 'course')) {
        $recipe_data['course'] = $recipe->course();
        $recipe_data['category'] = $recipe->course();
    }
    if (method_exists($recipe, 'cook_time')) {
        $recipe_data['cook_time'] = $recipe->cook_time();
        $recipe_data['cookTime'] = $recipe->cook_time();
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
                            'quantity' => isset($ingredient['amount']) ? floatval($ingredient['amount']) : 1,
                            'unit' => isset($ingredient['unit']) ? $ingredient['unit'] : 'piece',
                            'category' => 'Other',
                            'notes' => isset($ingredient['notes']) ? $ingredient['notes'] : ''
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
    
    $recipe_json = wp_json_encode($recipe_data);
    if ($recipe_json === false) {
        return '<p style="color: red;">Error encoding recipe data.</p>';
    }
    $recipe_json_safe = esc_attr($recipe_json);
    
    // Get counts for display
    $ingredient_count = count($recipe_data['ingredients']);
    $instruction_count = count($recipe_data['instructions']);
    $prep_time = $recipe_data['prep_time'];
    
    // Enhanced button HTML with DEVELOPMENT URL ONLY
    return '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <!-- Debug info for admins -->
        ' . (current_user_can('administrator') ? '<div style="background: green; color: white; padding: 5px; margin-bottom: 10px; border-radius: 5px; font-size: 12px;">
            ✅ DEVELOPMENT ONLY: ' . esc_html($recipe->name()) . ' → Development URL
        </div>' : '') . '
        
        <button onclick="developmentOnlyImport(\'' . $recipe_json_safe . '\')" style="
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
            color: white;
            border: none;
            padding: 14px 28px;
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
            Add to Meal Planner (Dev)
        </button>
        
        <div style="margin-top: 12px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 8px;">
            <p style="font-size: 14px; color: #333; margin: 0; font-weight: 500;">
                <strong>' . esc_html($recipe->name()) . '</strong>
            </p>
            <div style="display: flex; justify-content: center; gap: 16px; margin-top: 6px; flex-wrap: wrap;">
                <span style="font-size: 11px; background: #e7f3ff; color: #1e40af; padding: 3px 8px; border-radius: 12px;">
                    🥄 ' . $ingredient_count . ' ingredients
                </span>
                <span style="font-size: 11px; background: #f0fdf4; color: #166534; padding: 3px 8px; border-radius: 12px;">
                    📝 ' . $instruction_count . ' steps
                </span>
            </div>
        </div>
    </div>';
}

add_shortcode('meal_planner_button', 'meal_planner_button_shortcode');

// 🎯 FIXED: JavaScript with FORCED development URL only
function add_development_only_script() {
    if (is_single() && has_shortcode(get_post()->post_content, 'meal_planner_button')) {
        ?>
        <script>
        function developmentOnlyImport(recipeJsonString) {
            console.log('🍽️ DEVELOPMENT ONLY import starting...');
            
            try {
                const recipe = JSON.parse(recipeJsonString);
                console.log('✅ Recipe data:', recipe);
                
                // 🎯 FIXED: ALWAYS use development URL
                const developmentUrl = 'https://meal-planner-app-development-5205.vercel.app';
                
                console.log('🌐 FORCED development domain:', developmentUrl);
                
                // Open meal planner with development URL
                const url = developmentUrl + '/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (!popup) {
                    showDevFeedback('Please allow popups for this site to use the meal planner integration.', 'error');
                    return;
                }
                
                // Show immediate feedback
                showDevFeedback('Opening DEVELOPMENT meal planner...', 'info');
                
                // Send recipe data with multiple attempts
                const sendAttempts = [2000, 4000, 6000, 8000];
                let attemptCount = 0;
                
                sendAttempts.forEach((delay, index) => {
                    setTimeout(function() {
                        if (popup.closed) {
                            console.log('Popup closed, stopping attempts');
                            return;
                        }
                        
                        attemptCount++;
                        console.log(`📤 Attempt ${attemptCount}: Sending recipe to DEVELOPMENT...`);
                        
                        try {
                            popup.postMessage({
                                type: 'IMPORT_RECIPE',
                                recipe: recipe,
                                source: 'wordpress',
                                timestamp: Date.now(),
                                attempt: attemptCount
                            }, developmentUrl);
                            
                            console.log(`✅ Recipe sent to DEVELOPMENT successfully (attempt ${attemptCount})`);
                            
                            if (attemptCount === 1) {
                                showDevFeedback('Recipe imported to development! 🎉', 'success');
                            }
                        } catch (error) {
                            console.warn(`⚠️ Development attempt ${attemptCount} failed:`, error);
                            if (attemptCount === sendAttempts.length) {
                                showDevFeedback('Recipe queued for import...', 'info');
                            }
                        }
                    }, delay);
                });
                
            } catch (error) {
                console.error('❌ Development import error:', error);
                showDevFeedback('Error importing recipe: ' + error.message, 'error');
            }
        }
        
        // Better feedback system
        function showDevFeedback(message, type) {
            // Remove existing feedback
            const existing = document.getElementById('dev-feedback');
            if (existing) existing.remove();
            
            // Create feedback element
            const feedback = document.createElement('div');
            feedback.id = 'dev-feedback';
            feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                padding: 12px 20px;
                border-radius: 12px;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                max-width: 320px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                ${type === 'success' ? 'background: linear-gradient(135deg, #059669, #10b981); border: 2px solid #34d399;' : 
                  type === 'error' ? 'background: linear-gradient(135deg, #dc2626, #ef4444); border: 2px solid #f87171;' : 
                  'background: linear-gradient(135deg, #f97316, #dc2626); border: 2px solid #fb923c;'}
            `;
            
            const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '🍽️';
            feedback.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">${icon}</span>
                <span>${message}</span>
            </div>`;
            
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

add_action('wp_footer', 'add_development_only_script');

// Debug message for admins
function show_development_only_debug() {
    if (is_single() && current_user_can('administrator')) {
        $recipe_count = 0;
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            $recipe_count = count($recipe_ids);
        }
        
        echo '<div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 12px; position: fixed; top: 10px; right: 10px; z-index: 9999; border-radius: 12px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); max-width: 250px;">
            <div style="font-weight: bold; margin-bottom: 4px;">🚨 DEVELOPMENT ONLY MODE!</div>
            <div style="font-size: 12px; opacity: 0.9;">
                📊 Found ' . $recipe_count . ' recipe(s)<br>
                🔗 Target: DEVELOPMENT URL ONLY<br>
                <small style="opacity: 0.7;">Will NOT try subdomain until you switch</small>
            </div>
        </div>';
    }
}

add_action('wp_footer', 'show_development_only_debug');
?>