<?php
/**
 * Final Meal Planner Integration - Automatic Insertion
 * Production ready - clean code for Option 1
 * 
 * INSTRUCTIONS:
 * 1. Copy all the code below
 * 2. Go to WordPress Admin → Appearance → Theme Editor
 * 3. Select functions.php
 * 4. Delete your test code and paste this at the end
 * 5. Click "Update File"
 * 6. Visit any recipe post to see the buttons!
 */

// Generate meal planner button
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

    $recipe_json = htmlspecialchars(json_encode($recipe_data), ENT_QUOTES, 'UTF-8');

    return '<div class="meal-planner-import-container" style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <button class="meal-planner-import-btn" onclick="importToMealPlanner(' . $recipe_json . ')" style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;" onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 6px 20px rgba(249, 115, 22, 0.4)\'" onmouseout="this.style.transform=\'\'; this.style.boxShadow=\'0 4px 12px rgba(249, 115, 22, 0.3)\'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add to Meal Planner
        </button>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">Save this recipe to your personal meal planning app</p>
    </div>';
}

// Automatic insertion on all recipe posts
function automatic_meal_planner_insertion($content) {
    // Only on single posts in main query
    if (!is_single() || !in_the_loop() || !is_main_query() || !class_exists('WPRM_Recipe_Manager')) {
        return $content;
    }
    
    // Get recipe IDs from this post
    $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
    
    // Add button for each recipe found
    if (!empty($recipe_ids)) {
        foreach ($recipe_ids as $recipe_id) {
            $content .= generate_meal_planner_button($recipe_id);
        }
    }
    
    return $content;
}
add_filter('the_content', 'automatic_meal_planner_insertion', 999);

// JavaScript for meal planner integration
function add_meal_planner_script() {
    if (is_single()) {
        ?>
        <script>
        function importToMealPlanner(recipeData) {
            console.log('🍽️ Importing recipe:', recipeData.name);
            
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
            const feedback = document.createElement('div');
            feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; font-family: Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
            feedback.textContent = 'Opening meal planner...';
            document.body.appendChild(feedback);
            
            setTimeout(function() {
                if (feedback.parentNode) {
                    feedback.remove();
                }
            }, 3000);
        }
        </script>
        <?php
    }
}
add_action('wp_footer', 'add_meal_planner_script');

?>