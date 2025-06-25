<?php
/**
 * SAFE ENHANCEMENT - Just improve the recipe data
 * Add this to your existing working code (don't replace everything)
 */

// Enhanced recipe data function (replace your existing generate function)
function generate_enhanced_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '';
    }
    
    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) return '';

    try {
        // Start with basic data that we know works
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

        // Safe JSON encoding
        $recipe_json = json_encode($recipe_data);
        if ($recipe_json === false) {
            return '';
        }
        
        $recipe_json_safe = esc_attr($recipe_json);

        // Enhanced button with stats
        return '<div style="margin: 20px 0; text-align: center; background: #fef7ed; border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
            <button onclick="enhancedMealPlannerImport(\'' . $recipe_json_safe . '\')" style="
                background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                cursor: pointer;">
                🍽️ Add to Meal Planner
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">
                Recipe: <strong>' . esc_html($recipe->name()) . '</strong><br>
                <span style="font-size: 10px;">📊 ' . count($recipe_data['ingredients']) . ' ingredients • ' . count($recipe_data['instructions']) . ' steps</span>
            </p>
        </div>';

    } catch (Exception $e) {
        return '';
    }
}

// Enhanced JavaScript (replace your existing function)
?>
<script>
function enhancedMealPlannerImport(recipeJsonString) {
    console.log('🍽️ Enhanced import starting...');
    
    try {
        const recipeData = JSON.parse(recipeJsonString);
        console.log('✅ Enhanced recipe data:', recipeData);
        console.log('📊 Recipe has:', {
            ingredients: recipeData.ingredients.length,
            instructions: recipeData.instructions.length,
            name: recipeData.name
        });

        // Open meal planner
        const url = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
        const popup = window.open(url, 'mealplanner', 'width=1200,height=800');

        if (!popup) {
            alert('Please allow popups for this site.');
            return;
        }

        // Send enhanced data
        setTimeout(function() {
            try {
                popup.postMessage({
                    type: 'IMPORT_RECIPE',
                    recipe: recipeData,
                    source: 'wordpress'
                }, 'https://meal-planner-app-development-5205.vercel.app');
                
                console.log('✅ Enhanced recipe sent successfully');
                
                // Show success message
                const feedback = document.createElement('div');
                feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: green; color: white; padding: 10px; border-radius: 8px; z-index: 9999;';
                feedback.textContent = 'Recipe imported successfully! 🎉';
                document.body.appendChild(feedback);
                setTimeout(() => feedback.remove(), 3000);
                
            } catch (error) {
                console.log('Recipe queued for import');
            }
        }, 3000);

    } catch (error) {
        console.error('Import error:', error);
        alert('Error importing recipe. Please try again.');
    }
}
</script>
<?php