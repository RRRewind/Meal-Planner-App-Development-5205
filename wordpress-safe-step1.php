<?php
/**
 * SAFE STEP 1: Just add the button generation function
 * This won't automatically insert anything - just creates the function
 */

// Add this to your functions.php - SAFE VERSION

// Function to generate the meal planner button (doesn't auto-insert)
function generate_meal_planner_button($recipe_id) {
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

    return '<div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <button class="meal-planner-import-btn" onclick="importToMealPlanner(' . $recipe_json . ')" style="
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
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
            Save this recipe to your personal meal planning app
        </p>
    </div>';
}

// Add basic JavaScript (inline for safety)
function add_meal_planner_basic_script() {
    if (is_single()) {
        ?>
        <script>
        function importToMealPlanner(recipeData) {
            console.log('🍽️ Importing recipe:', recipeData.name);
            
            // Open meal planner
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
                        source: 'wordpress'
                    }, 'https://meal-planner-app-development-5205.vercel.app');
                } catch (error) {
                    console.log('Recipe will be available when meal planner loads');
                }
            }, 3000);
            
            // Show feedback
            const feedback = document.createElement('div');
            feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f97316; color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; font-family: Arial, sans-serif;';
            feedback.textContent = 'Opening meal planner...';
            document.body.appendChild(feedback);
            
            setTimeout(() => feedback.remove(), 3000);
        }
        </script>
        <?php
    }
}
add_action('wp_footer', 'add_meal_planner_basic_script');

// Test function to see if this works
function test_meal_planner_function() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 10px; left: 10px; z-index: 9999;">
            ✅ Safe Step 1: Button generation function loaded successfully!
        </div>';
    }
}
add_action('wp_footer', 'test_meal_planner_function');

?>