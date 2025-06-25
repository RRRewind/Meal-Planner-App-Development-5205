<?php
/**
 * SAFE WordPress Integration - No Content Filter Conflicts
 * This version avoids all content filter conflicts
 * 
 * INSTRUCTIONS:
 * 1. Remove ALL previous code from functions.php
 * 2. Add ONLY this code
 * 3. This won't modify content directly - much safer!
 */

// Generate meal planner button (safe version)
function generate_safe_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '';
    }
    
    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) return '';
    
    try {
        // Get basic recipe data safely
        $recipe_data = array(
            'id' => intval($recipe->id()),
            'name' => wp_strip_all_tags($recipe->name()),
            'summary' => wp_strip_all_tags($recipe->summary()),
            'course' => wp_strip_all_tags($recipe->course()),
            'prep_time' => intval($recipe->prep_time()),
            'cook_time' => intval($recipe->cook_time()),
            'total_time' => intval($recipe->total_time()),
            'servings' => intval($recipe->servings()),
            'url' => get_permalink(),
            'ingredients' => array(),
            'instructions' => array()
        );
        
        // Get ingredients safely
        $ingredients = $recipe->ingredients();
        if (is_array($ingredients)) {
            foreach ($ingredients as $ingredient_group) {
                if (isset($ingredient_group['ingredients']) && is_array($ingredient_group['ingredients'])) {
                    foreach ($ingredient_group['ingredients'] as $ingredient) {
                        $recipe_data['ingredients'][] = array(
                            'amount' => wp_strip_all_tags(isset($ingredient['amount']) ? $ingredient['amount'] : ''),
                            'unit' => wp_strip_all_tags(isset($ingredient['unit']) ? $ingredient['unit'] : ''),
                            'name' => wp_strip_all_tags(isset($ingredient['name']) ? $ingredient['name'] : ''),
                            'notes' => wp_strip_all_tags(isset($ingredient['notes']) ? $ingredient['notes'] : '')
                        );
                    }
                }
            }
        }
        
        // Get instructions safely
        $instructions = $recipe->instructions();
        if (is_array($instructions)) {
            foreach ($instructions as $instruction_group) {
                if (isset($instruction_group['instructions']) && is_array($instruction_group['instructions'])) {
                    foreach ($instruction_group['instructions'] as $instruction) {
                        $text = isset($instruction['text']) ? $instruction['text'] : '';
                        $clean_text = wp_kses($text, array(
                            'strong' => array(),
                            'em' => array(),
                            'b' => array(),
                            'i' => array()
                        ));
                        
                        $recipe_data['instructions'][] = array(
                            'text' => $clean_text
                        );
                    }
                }
            }
        }
        
        // Safely encode JSON
        $recipe_json = wp_json_encode($recipe_data);
        if ($recipe_json === false) {
            return '';
        }
        
        return $recipe_json;
        
    } catch (Exception $e) {
        return '';
    }
}

// Safe recipe detection
function safe_detect_recipes() {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return array();
    }
    
    try {
        return WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
    } catch (Exception $e) {
        return array();
    }
}

// Safe JavaScript insertion - NO content filters
function add_safe_meal_planner_script() {
    if (is_single()) {
        $recipe_ids = safe_detect_recipes();
        if (!empty($recipe_ids)) {
            ?>
            <script>
            // Wait for page to fully load
            document.addEventListener('DOMContentLoaded', function() {
                console.log('🍽️ Meal Planner: Page loaded, looking for recipes...');
                
                // Recipe data from PHP
                const recipeData = {
                    <?php foreach ($recipe_ids as $index => $recipe_id): ?>
                        <?php $json = generate_safe_meal_planner_button($recipe_id); ?>
                        <?php if ($json): ?>
                            '<?php echo $recipe_id; ?>': <?php echo $json; ?><?php echo $index < count($recipe_ids) - 1 ? ',' : ''; ?>
                        <?php endif; ?>
                    <?php endforeach; ?>
                };
                
                console.log('🍽️ Found', Object.keys(recipeData).length, 'recipes');
                
                // Find all recipe elements and add buttons
                const recipeElements = document.querySelectorAll('.wprm-recipe, .wp-block-wp-recipe-maker-recipe');
                console.log('🍽️ Found', recipeElements.length, 'recipe elements on page');
                
                if (recipeElements.length > 0) {
                    let recipeIndex = 0;
                    recipeElements.forEach(function(element) {
                        // Get the recipe ID for this element
                        const recipeIds = Object.keys(recipeData);
                        if (recipeIndex < recipeIds.length) {
                            const recipeId = recipeIds[recipeIndex];
                            const recipe = recipeData[recipeId];
                            
                            // Create button
                            const buttonContainer = document.createElement('div');
                            buttonContainer.innerHTML = `
                                <div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
                                    <button onclick="importToMealPlanner('${recipeId}')" style="
                                        background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                                        color: white; border: none; padding: 12px 24px; border-radius: 12px;
                                        font-weight: 600; font-size: 16px; cursor: pointer;
                                        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                                        transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;
                                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(249, 115, 22, 0.4)'"
                                       onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(249, 115, 22, 0.3)'">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                        </svg>
                                        Add to Meal Planner
                                    </button>
                                    <p style="font-size: 12px; color: #666; margin-top: 8px;">
                                        Save this recipe: <strong>${recipe.name}</strong>
                                    </p>
                                </div>
                            `;
                            
                            // Insert after the recipe element
                            element.parentNode.insertBefore(buttonContainer, element.nextSibling);
                            recipeIndex++;
                            
                            console.log('✅ Added button for recipe:', recipe.name);
                        }
                    });
                } else {
                    console.log('⚠️ No recipe elements found, adding single button at bottom');
                    // Fallback: add button to bottom of content
                    const content = document.querySelector('.entry-content, .post-content, .content, main');
                    if (content && Object.keys(recipeData).length > 0) {
                        const firstRecipeId = Object.keys(recipeData)[0];
                        const firstRecipe = recipeData[firstRecipeId];
                        
                        const buttonContainer = document.createElement('div');
                        buttonContainer.innerHTML = `
                            <div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
                                <button onclick="importToMealPlanner('${firstRecipeId}')" style="
                                    background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                                    color: white; border: none; padding: 12px 24px; border-radius: 12px;
                                    font-weight: 600; font-size: 16px; cursor: pointer;
                                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                                    transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;
                                ">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                    </svg>
                                    Add to Meal Planner
                                </button>
                                <p style="font-size: 12px; color: #666; margin-top: 8px;">
                                    Save this recipe: <strong>${firstRecipe.name}</strong>
                                </p>
                            </div>
                        `;
                        
                        content.appendChild(buttonContainer);
                    }
                }
            });
            
            // Global recipe data for import function
            window.mealPlannerRecipes = {
                <?php foreach ($recipe_ids as $index => $recipe_id): ?>
                    <?php $json = generate_safe_meal_planner_button($recipe_id); ?>
                    <?php if ($json): ?>
                        '<?php echo $recipe_id; ?>': <?php echo $json; ?><?php echo $index < count($recipe_ids) - 1 ? ',' : ''; ?>
                    <?php endif; ?>
                <?php endforeach; ?>
            };
            
            function importToMealPlanner(recipeId) {
                console.log('🍽️ Importing recipe ID:', recipeId);
                
                const recipeData = window.mealPlannerRecipes[recipeId];
                if (!recipeData) {
                    alert('Recipe data not found');
                    return;
                }
                
                try {
                    // Multi-domain support
                    const domains = {
                        development: 'https://meal-planner-app-development-5205.vercel.app',
                        production: 'https://mealplan.supertasty.recipes'
                    };
                    
                    const isProduction = window.location.hostname.includes('supertasty.recipes') || 
                                        window.location.hostname.includes('yourdomain.com');
                    const targetDomain = isProduction ? domains.production : domains.development;
                    
                    // Open meal planner
                    const url = targetDomain + '/#/?import=pending';
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
                            }, targetDomain);
                            
                            console.log('✅ Recipe sent to meal planner');
                            showImportFeedback('Recipe imported successfully!', 'success');
                        } catch (error) {
                            console.log('Recipe will be available when meal planner loads');
                            showImportFeedback('Recipe queued for import...', 'info');
                        }
                    }, 3000);
                    
                    showImportFeedback('Opening meal planner...', 'info');
                    
                } catch (error) {
                    console.error('Error importing recipe:', error);
                    showImportFeedback('Error importing recipe. Please try again.', 'error');
                }
            }
            
            function showImportFeedback(message, type) {
                const existing = document.getElementById('meal-planner-feedback');
                if (existing) existing.remove();
                
                const feedback = document.createElement('div');
                feedback.id = 'meal-planner-feedback';
                feedback.style.cssText = `
                    position: fixed; top: 20px; right: 20px; z-index: 10000;
                    padding: 12px 20px; border-radius: 8px; color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px; font-weight: 500; max-width: 300px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    ${type === 'success' ? 'background: linear-gradient(135deg, #059669, #10b981);' :
                      type === 'error' ? 'background: linear-gradient(135deg, #dc2626, #ef4444);' :
                      'background: linear-gradient(135deg, #f97316, #dc2626);'}
                `;
                
                feedback.textContent = message;
                document.body.appendChild(feedback);
                
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
}

// SAFE hook - only JavaScript, no content modification
add_action('wp_footer', 'add_safe_meal_planner_script');

// Optional: Shortcode for manual placement
function meal_planner_button_shortcode($atts) {
    $atts = shortcode_atts(array(
        'recipe_id' => null
    ), $atts);
    
    if (!$atts['recipe_id']) {
        $recipe_ids = safe_detect_recipes();
        if (!empty($recipe_ids)) {
            $atts['recipe_id'] = $recipe_ids[0];
        }
    }
    
    if ($atts['recipe_id']) {
        $recipe_json = generate_safe_meal_planner_button($atts['recipe_id']);
        if ($recipe_json) {
            $recipe_data = json_decode($recipe_json, true);
            return '<div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
                <button onclick="importToMealPlanner(\'' . $atts['recipe_id'] . '\')" style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer;">
                    🍽️ Add to Meal Planner
                </button>
                <p style="font-size: 12px; color: #666; margin-top: 8px;">Save: <strong>' . esc_html($recipe_data['name']) . '</strong></p>
            </div>';
        }
    }
    
    return '';
}

add_shortcode('meal_planner_button', 'meal_planner_button_shortcode');

?>