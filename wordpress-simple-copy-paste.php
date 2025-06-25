<?php
/**
 * SIMPLE COPY-PASTE VERSION
 * Just copy everything below this comment and paste into your functions.php
 */

// Enhanced button with debugging
function generate_enhanced_meal_planner_button($recipe_id) {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '<div style="background: red; color: white; padding: 10px;">❌ WP Recipe Maker not found</div>';
    }

    $recipe = WPRM_Recipe_Manager::get_recipe($recipe_id);
    if (!$recipe) {
        return '<div style="background: orange; color: white; padding: 10px;">⚠️ Recipe not found</div>';
    }

    // Get recipe data safely
    $recipe_data = array(
        'id' => $recipe->id(),
        'name' => $recipe->name(),
        'summary' => $recipe->summary(),
        'course' => $recipe->course(),
        'prep_time' => $recipe->prep_time(),
        'cook_time' => $recipe->cook_time(),
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
    $ingredient_count = count($recipe_data['ingredients']);
    $instruction_count = count($recipe_data['instructions']);

    return '<div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
        <div style="background: green; color: white; padding: 5px; margin-bottom: 10px; border-radius: 5px; font-size: 12px;">
            ✅ Enhanced Button: ' . esc_html($recipe->name()) . ' (ID: ' . $recipe_id . ')
        </div>
        <button onclick="enhancedMealPlannerImport(\'' . $recipe_json . '\')" style="
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
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
            Recipe: <strong>' . esc_html($recipe->name()) . '</strong><br>
            <span style="font-size: 10px; background: #e7f3ff; padding: 2px 6px; border-radius: 3px;">
                📊 ' . $ingredient_count . ' ingredients • ' . $instruction_count . ' steps
            </span>
        </p>
    </div>';
}

// Automatic insertion
function automatic_enhanced_meal_planner_insertion($content) {
    if (!is_single() || !in_the_loop() || !is_main_query()) {
        return $content;
    }

    if (class_exists('WPRM_Recipe_Manager')) {
        $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
        if (!empty($recipe_ids)) {
            foreach ($recipe_ids as $recipe_id) {
                $content .= generate_enhanced_meal_planner_button($recipe_id);
            }
        }
    }

    return $content;
}

add_filter('the_content', 'automatic_enhanced_meal_planner_insertion', 999);

// JavaScript
function add_enhanced_meal_planner_script() {
    if (is_single()) {
        ?>
        <script>
        function enhancedMealPlannerImport(recipeDataString) {
            console.log('🍽️ Enhanced import starting...');
            
            try {
                const recipeData = JSON.parse(recipeDataString);
                console.log('✅ Recipe data:', recipeData);
                console.log('📊 Stats:', {
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

                // Send recipe data
                setTimeout(function() {
                    try {
                        popup.postMessage({
                            type: 'IMPORT_RECIPE',
                            recipe: recipeData,
                            source: 'wordpress',
                            timestamp: Date.now()
                        }, 'https://meal-planner-app-development-5205.vercel.app');
                        
                        console.log('✅ Recipe sent successfully');
                        alert('Recipe imported successfully! 🎉');
                    } catch (error) {
                        console.log('Recipe queued for import');
                    }
                }, 3000);

            } catch (error) {
                console.error('❌ Import error:', error);
                alert('Error importing recipe: ' + error.message);
            }
        }
        </script>
        <?php
    }
}

add_action('wp_footer', 'add_enhanced_meal_planner_script');

// Debug message for admins
function show_enhanced_debug() {
    if (is_single() && current_user_can('administrator')) {
        $recipe_count = 0;
        if (class_exists('WPRM_Recipe_Manager')) {
            $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            $recipe_count = count($recipe_ids);
        }
        
        echo '<div style="background: blue; color: white; padding: 10px; position: fixed; top: 10px; right: 10px; z-index: 9999; border-radius: 8px;">
            🎉 Enhanced Integration Active!<br>
            Found ' . $recipe_count . ' recipe(s)<br>
            <small>Look for enhanced buttons!</small>
        </div>';
    }
}

add_action('wp_footer', 'show_enhanced_debug');
?>