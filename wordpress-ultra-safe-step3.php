<?php
/**
 * ULTRA SAFE STEP 3 - Recipe detection and real integration
 * Replace Step 2 code with this
 */

// Recipe detection and real button generation
function ultra_safe_test_step3() {
    // Only show to admins, only on single posts
    if (is_single() && current_user_can('administrator')) {
        global $post;
        
        // Check WP Recipe Maker
        $wprm_active = class_exists('WPRM_Recipe_Manager');
        
        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0;">
            ✅ Ultra Safe Step 3: Recipe detection loaded!<br>
            WP Recipe Maker: ' . ($wprm_active ? 'ACTIVE' : 'NOT FOUND') . '
        </div>';
        
        // Try to find recipes
        $recipe_ids = array();
        $detection_method = 'none';
        
        if ($wprm_active) {
            // Method 1: Use WP Recipe Maker API
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            if (!empty($recipe_ids)) {
                $detection_method = 'WP Recipe Maker API';
            }
            
            // Method 2: Check for shortcodes
            if (empty($recipe_ids) && has_shortcode($post->post_content, 'wprm-recipe')) {
                preg_match_all('/\[wprm-recipe[^\]]*id=["\']?(\d+)["\']?[^\]]*\]/', $post->post_content, $matches);
                if (!empty($matches[1])) {
                    $recipe_ids = array_map('intval', $matches[1]);
                    $detection_method = 'shortcode parsing';
                }
            }
            
            // Method 3: Check for Gutenberg blocks
            if (empty($recipe_ids) && has_blocks($post->post_content)) {
                $blocks = parse_blocks($post->post_content);
                $recipe_ids = extract_recipe_ids_from_blocks($blocks);
                if (!empty($recipe_ids)) {
                    $detection_method = 'Gutenberg blocks';
                }
            }
        }
        
        // Show detection results
        echo '<div style="background: ' . (!empty($recipe_ids) ? 'green' : 'orange') . '; color: white; padding: 10px; margin: 10px 0;">
            📊 Detection Results:<br>
            Method: ' . $detection_method . '<br>
            Recipes found: ' . count($recipe_ids) . '<br>
            Recipe IDs: ' . implode(', ', $recipe_ids) . '
        </div>';
        
        // If recipes found, show real button
        if (!empty($recipe_ids)) {
            foreach ($recipe_ids as $recipe_id) {
                echo generate_real_meal_planner_button($recipe_id);
            }
        } else {
            echo '<div style="text-align: center; margin: 20px 0; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px;">
                ⚠️ <strong>No recipes detected on this post</strong><br>
                <small>Make sure this post contains a recipe created with WP Recipe Maker</small>
            </div>';
        }
    }
}

// Helper function to extract recipe IDs from Gutenberg blocks
function extract_recipe_ids_from_blocks($blocks) {
    $recipe_ids = array();
    foreach ($blocks as $block) {
        // Check if this is a WP Recipe Maker block
        if (isset($block['blockName']) && $block['blockName'] === 'wp-recipe-maker/recipe') {
            if (isset($block['attrs']['id'])) {
                $recipe_ids[] = intval($block['attrs']['id']);
            }
        }
        
        // Check inner blocks recursively
        if (!empty($block['innerBlocks'])) {
            $inner_recipe_ids = extract_recipe_ids_from_blocks($block['innerBlocks']);
            $recipe_ids = array_merge($recipe_ids, $inner_recipe_ids);
        }
    }
    return $recipe_ids;
}

// Generate real meal planner button
function generate_real_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '';
    }
    
    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) return '';
    
    // Get recipe data
    $recipe_data = array(
        'id' => $recipe->id(),
        'name' => $recipe->name(),
        'summary' => $recipe->summary(),
        'course' => $recipe->course(),
        'prep_time' => $recipe->prep_time(),
        'cook_time' => $recipe->cook_time(),
        'total_time' => $recipe->total_time(),
        'servings' => $recipe->servings(),
        'ingredients' => array(),
        'instructions' => array(),
        'url' => get_permalink()
    );
    
    // Get ingredients
    foreach ($recipe->ingredients() as $ingredient_group) {
        foreach ($ingredient_group['ingredients'] as $ingredient) {
            $recipe_data['ingredients'][] = array(
                'amount' => $ingredient['amount'],
                'unit' => $ingredient['unit'],
                'name' => $ingredient['name'],
                'notes' => $ingredient['notes']
            );
        }
    }
    
    // Get instructions
    foreach ($recipe->instructions() as $instruction_group) {
        foreach ($instruction_group['instructions'] as $instruction) {
            $recipe_data['instructions'][] = array(
                'text' => $instruction['text']
            );
        }
    }
    
    // Encode recipe data
    $recipe_json = htmlspecialchars(json_encode($recipe_data), ENT_QUOTES, 'UTF-8');
    
    return '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <button onclick="importToMealPlanner(' . $recipe_json . ')" style="
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
            onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 6px 20px rgba(249,115,22,0.4)\'"
            onmouseout="this.style.transform=\'\'; this.style.boxShadow=\'0 4px 12px rgba(249,115,22,0.3)\'"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add to Meal Planner
        </button>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
            Recipe: <strong>' . esc_html($recipe->name()) . '</strong> (ID: ' . $recipe_id . ')
        </p>
    </div>';
}

// Real meal planner JavaScript
function real_meal_planner_script() {
    if (is_single() && current_user_can('administrator')) {
        ?>
        <script>
        function importToMealPlanner(recipeData) {
            console.log('🍽️ Importing recipe to meal planner:', recipeData.name);
            
            try {
                // Open meal planner app
                const url = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
                const popup = window.open(url, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (!popup) {
                    alert('Please allow popups for this site to use the meal planner integration.');
                    return;
                }
                
                // Send recipe data after delay (allows app to load)
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
                
                // Show user feedback
                showImportFeedback('Recipe is being imported to your meal planner...', 'info');
                
            } catch (error) {
                console.error('Error importing recipe:', error);
                showImportFeedback('Error importing recipe. Please try again.', 'error');
            }
        }
        
        function showImportFeedback(message, type) {
            // Remove existing feedback
            const existing = document.getElementById('meal-planner-feedback');
            if (existing) existing.remove();
            
            // Create feedback element
            const feedback = document.createElement('div');
            feedback.id = 'meal-planner-feedback';
            feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                padding: 12px 20px;
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                color: white;
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

// Add both functions
add_action('wp_footer', 'ultra_safe_test_step3');
add_action('wp_footer', 'real_meal_planner_script');

?>