<?php
/**
 * Enhanced WordPress Meal Planner Integration
 * Building on your existing working code
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
        'title' => $recipe->name(), // ENHANCED: Use 'title' for better compatibility
        'name' => $recipe->name(),  // Keep both for compatibility
        'prep_time' => $recipe->prep_time(),
        'prepTime' => $recipe->prep_time(), // ENHANCED: Alternative field name
        'servings' => $recipe->servings(),
        'url' => get_permalink(),
        'ingredients' => array(),
        'instructions' => array()
    );

    // Safely add more fields
    if (method_exists($recipe, 'summary')) {
        $recipe_data['summary'] = $recipe->summary();
        $recipe_data['description'] = $recipe->summary(); // ENHANCED: Alternative field
    }
    if (method_exists($recipe, 'course')) {
        $recipe_data['course'] = $recipe->course();
        $recipe_data['category'] = $recipe->course(); // ENHANCED: Alternative field
    }
    if (method_exists($recipe, 'cook_time')) {
        $recipe_data['cook_time'] = $recipe->cook_time();
        $recipe_data['cookTime'] = $recipe->cook_time(); // ENHANCED: Alternative field
    }
    // ENHANCED: Add total time calculation
    $recipe_data['total_time'] = $recipe_data['prep_time'] + ($recipe_data['cook_time'] ?? 0);

    // Safely get ingredients
    try {
        $ingredients = $recipe->ingredients();
        if (is_array($ingredients)) {
            foreach ($ingredients as $ingredient_group) {
                if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                    foreach ($ingredient_group['ingredients'] as $ingredient) {
                        $recipe_data['ingredients'][] = array(
                            'name' => isset($ingredient['name']) ? $ingredient['name'] : '',
                            'quantity' => isset($ingredient['amount']) ? floatval($ingredient['amount']) : 1, // ENHANCED: Convert to number
                            'unit' => isset($ingredient['unit']) ? $ingredient['unit'] : 'piece',
                            'category' => 'Other',
                            // ENHANCED: Add notes if available
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
    
    // ENHANCED: Safe JSON encoding with error handling
    $recipe_json = wp_json_encode($recipe_data);
    if ($recipe_json === false) {
        return '<p style="color: red;">Error encoding recipe data.</p>';
    }
    $recipe_json_safe = esc_attr($recipe_json);
    
    // Get counts for display
    $ingredient_count = count($recipe_data['ingredients']);
    $instruction_count = count($recipe_data['instructions']);
    $prep_time = $recipe_data['prep_time'];
    $total_time = $recipe_data['total_time']; // ENHANCED: Show total time
    
    // Enhanced button HTML with stats
    return '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);">
        <!-- Debug info for admins -->
        ' . (current_user_can('administrator') ? '<div style="background: green; color: white; padding: 5px; margin-bottom: 10px; border-radius: 5px; font-size: 12px;">
            ✅ Enhanced Button: ' . esc_html($recipe->name()) . ' (ID: ' . $recipe_id . ') → Development URL
        </div>' : '') . '
        
        <button onclick="developmentMealPlannerImport(\'' . $recipe_json_safe . '\')" style="
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
            Add to Meal Planner
        </button>
        
        <!-- ENHANCED: Better recipe stats display -->
        <div style="margin-top: 12px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 8px; border: 1px solid rgba(251,146,60,0.2);">
            <p style="font-size: 14px; color: #333; margin: 0; font-weight: 500;">
                <strong>' . esc_html($recipe->name()) . '</strong>
            </p>
            <div style="display: flex; justify-content: center; gap: 16px; margin-top: 6px; flex-wrap: wrap;">
                <span style="font-size: 11px; background: #e7f3ff; color: #1e40af; padding: 3px 8px; border-radius: 12px; border: 1px solid #bfdbfe;">
                    🥄 ' . $ingredient_count . ' ingredients
                </span>
                <span style="font-size: 11px; background: #f0fdf4; color: #166534; padding: 3px 8px; border-radius: 12px; border: 1px solid #bbf7d0;">
                    📝 ' . $instruction_count . ' steps
                </span>
                <span style="font-size: 11px; background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 12px; border: 1px solid #fed7aa;">
                    ⏱️ ' . $total_time . 'm total
                </span>
            </div>
        </div>
    </div>';
}

add_shortcode('meal_planner_button', 'meal_planner_button_shortcode');

// ENHANCED: JavaScript with better error handling and retry logic
function add_development_meal_planner_script() {
    if (is_single() && has_shortcode(get_post()->post_content, 'meal_planner_button')) {
        ?>
        <script>
        function developmentMealPlannerImport(recipeJsonString) {
            console.log('🍽️ ENHANCED Development import starting...');
            
            try {
                const recipe = JSON.parse(recipeJsonString);
                console.log('✅ Enhanced recipe data:', recipe);
                console.log('📊 Recipe statistics:', {
                    title: recipe.title || recipe.name,
                    ingredients: recipe.ingredients.length,
                    instructions: recipe.instructions.length,
                    prepTime: recipe.prepTime || recipe.prep_time,
                    cookTime: recipe.cookTime || recipe.cook_time,
                    totalTime: recipe.total_time
                });
                
                // 🎯 ENHANCED: Multi-domain support
                const domains = {
                    development: 'https://meal-planner-app-development-5205.vercel.app',
                    production: 'https://mealplan.supertasty.recipes'
                };
                
                // Auto-detect domain (you can customize this logic)
                const isProduction = window.location.hostname.includes('supertasty.recipes') || 
                                   window.location.hostname.includes('yourdomain.com');
                const targetDomain = isProduction ? domains.production : domains.development;
                
                console.log('🌐 Target domain:', targetDomain);
                
                // Open meal planner
                const url = targetDomain + '/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (!popup) {
                    showDevelopmentFeedback('Please allow popups for this site to use the meal planner integration.', 'error');
                    return;
                }
                
                // Show immediate feedback
                showDevelopmentFeedback('Opening enhanced meal planner...', 'info');
                
                // ENHANCED: Multiple send attempts with increasing delays
                const sendAttempts = [2000, 4000, 6000, 8000];
                let attemptCount = 0;
                
                sendAttempts.forEach((delay, index) => {
                    setTimeout(function() {
                        if (popup.closed) {
                            console.log('Popup closed, stopping attempts');
                            return;
                        }
                        
                        attemptCount++;
                        console.log(`📤 Attempt ${attemptCount}: Sending enhanced recipe...`);
                        
                        try {
                            popup.postMessage({
                                type: 'IMPORT_RECIPE',
                                recipe: recipe,
                                source: 'wordpress',
                                timestamp: Date.now(),
                                attempt: attemptCount
                            }, targetDomain);
                            
                            console.log(`✅ Enhanced recipe sent successfully (attempt ${attemptCount})`);
                            
                            if (attemptCount === 1) {
                                showDevelopmentFeedback('Recipe imported successfully! 🎉', 'success');
                            }
                        } catch (error) {
                            console.warn(`⚠️ Attempt ${attemptCount} failed:`, error);
                            if (attemptCount === sendAttempts.length) {
                                showDevelopmentFeedback('Recipe queued for import...', 'info');
                            }
                        }
                    }, delay);
                });
                
            } catch (error) {
                console.error('❌ Enhanced development import error:', error);
                showDevelopmentFeedback('Error importing recipe: ' + error.message, 'error');
            }
        }
        
        // ENHANCED: Better feedback system with animations
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
                border-radius: 12px;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                max-width: 320px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease-out;
                ${type === 'success' ? 'background: linear-gradient(135deg, #059669, #10b981); border: 2px solid #34d399;' : 
                  type === 'error' ? 'background: linear-gradient(135deg, #dc2626, #ef4444); border: 2px solid #f87171;' : 
                  'background: linear-gradient(135deg, #f97316, #dc2626); border: 2px solid #fb923c;'}
            `;
            
            // Add icon based on type
            const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '🍽️';
            feedback.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">${icon}</span>
                <span>${message}</span>
            </div>`;
            
            document.body.appendChild(feedback);
            
            // Animate in
            setTimeout(() => {
                feedback.style.transform = 'translateX(0)';
            }, 10);
            
            // Auto-remove after 5 seconds with animation
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.style.transform = 'translateX(100%)';
                    setTimeout(() => feedback.remove(), 300);
                }
            }, 5000);
        }
        
        // ENHANCED: Listen for messages from meal planner (optional)
        window.addEventListener('message', function(event) {
            if (event.origin !== 'https://meal-planner-app-development-5205.vercel.app') {
                return;
            }
            
            if (event.data && event.data.type === 'IMPORT_SUCCESS') {
                console.log('✅ Meal planner confirmed successful import!');
                showDevelopmentFeedback('Recipe successfully added to meal planner! 🎉', 'success');
            }
        });
        </script>
        <?php
    }
}

add_action('wp_footer', 'add_development_meal_planner_script');

// ENHANCED: Debug message for admins with more info
function show_development_debug() {
    if (is_single() && current_user_can('administrator')) {
        $recipe_count = 0;
        $recipe_ids = array();
        
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            $recipe_count = count($recipe_ids);
        }
        
        echo '<div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 12px; position: fixed; top: 10px; right: 10px; z-index: 9999; border-radius: 12px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); max-width: 250px;">
            <div style="font-weight: bold; margin-bottom: 4px;">🚀 Enhanced Integration Active!</div>
            <div style="font-size: 12px; opacity: 0.9;">
                📊 Found ' . $recipe_count . ' recipe(s)<br>
                🔗 Target: Development URL<br>
                ' . (!empty($recipe_ids) ? '✅ Recipe IDs: ' . implode(', ', $recipe_ids) : '⚠️ No recipes detected') . '<br>
                <small style="opacity: 0.7;">Enhanced with retry logic & better UX</small>
            </div>
        </div>';
    }
}

add_action('wp_footer', 'show_development_debug');

// ENHANCED: Optional automatic insertion for convenience
function auto_meal_planner_insertion($content) {
    // Only on single posts in main query
    if (!is_single() || !in_the_loop() || !is_main_query()) {
        return $content;
    }
    
    // Check if shortcode is already in content
    if (has_shortcode($content, 'meal_planner_button')) {
        return $content;
    }
    
    // Check if this post has recipes
    if (class_exists('WPRM_Recipe_Manager')) {
        $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
        if (!empty($recipe_ids)) {
            // Add button at the end of content
            $content .= do_shortcode('[meal_planner_button]');
        }
    }
    
    return $content;
}

// UNCOMMENT this line to enable automatic insertion:
// add_filter('the_content', 'auto_meal_planner_insertion', 999);

?>