# WordPress Recipe Integration Guide

## 🎯 Overview

This integration allows users to import recipes from your WordPress blog (using WP Recipe Maker) directly into the meal planning app. Users must sign in or create an account to import recipes.

## 🔧 WordPress Setup

### Step 1: Add Import Button to Recipe Cards

Add this code to your WordPress theme's `functions.php` file or create a custom plugin:

```php
<?php
// Add import button to WP Recipe Maker recipe cards
function add_meal_planner_import_button($recipe_id) {
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
    
    ob_start();
    ?>
    <div class="meal-planner-import-container" style="margin: 20px 0; text-align: center;">
        <button 
            class="meal-planner-import-btn"
            onclick="importToMealPlanner(<?php echo $recipe_json; ?>)"
            style="
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
                gap: 8px;
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(249, 115, 22, 0.4)'"
            onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(249, 115, 22, 0.3)'"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add to Meal Planner
        </button>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
            Save this recipe to your personal meal planning app
        </p>
    </div>
    
    <script>
    function importToMealPlanner(recipeData) {
        // Check if meal planner app is open in another tab
        if (window.mealPlannerWindow && !window.mealPlannerWindow.closed) {
            // Send recipe to existing window
            window.mealPlannerWindow.postMessage({
                type: 'IMPORT_RECIPE',
                recipe: recipeData
            }, 'https://your-meal-planner-domain.com'); // Replace with your actual domain
            
            window.mealPlannerWindow.focus();
        } else {
            // Open meal planner in new tab and send recipe
            window.mealPlannerWindow = window.open(
                'https://your-meal-planner-domain.com/#/recipes?import=true', // Replace with your actual domain
                'mealplanner',
                'width=1200,height=800,scrollbars=yes,resizable=yes'
            );
            
            // Wait for window to load, then send recipe
            setTimeout(() => {
                if (window.mealPlannerWindow) {
                    window.mealPlannerWindow.postMessage({
                        type: 'IMPORT_RECIPE',
                        recipe: recipeData
                    }, 'https://your-meal-planner-domain.com'); // Replace with your actual domain
                }
            }, 2000);
        }
    }
    </script>
    <?php
    return ob_get_clean();
}

// Hook into WP Recipe Maker template
add_filter('wprm_recipe_template_shortcode', function($template, $recipe) {
    // Add import button after recipe summary
    $import_button = add_meal_planner_import_button($recipe->id());
    $template = str_replace(
        '%wprm_recipe_summary%', 
        '%wprm_recipe_summary%' . $import_button, 
        $template
    );
    return $template;
}, 10, 2);
?>
```

### Step 2: Alternative - Shortcode Method

If you prefer using shortcodes, add this to your `functions.php`:

```php
<?php
// Shortcode for meal planner import button
function meal_planner_import_shortcode($atts) {
    $atts = shortcode_atts(array(
        'recipe_id' => get_the_ID()
    ), $atts);
    
    return add_meal_planner_import_button($atts['recipe_id']);
}
add_shortcode('meal_planner_import', 'meal_planner_import_shortcode');
?>
```

Then use `[meal_planner_import]` in your posts or `[meal_planner_import recipe_id="123"]` for specific recipes.

### Step 3: Automatic Integration (Advanced)

For automatic integration with all recipe cards:

```php
<?php
// Automatically add import button to all recipe templates
add_action('wprm_output_recipe_template', function($recipe_id) {
    echo add_meal_planner_import_button($recipe_id);
});
?>
```

## 🎨 Styling Options

### Custom CSS for Better Integration

Add this CSS to your theme or customizer:

```css
.meal-planner-import-container {
    background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%);
    border: 2px solid #fb923c;
    border-radius: 16px;
    padding: 20px;
    margin: 24px 0;
}

.meal-planner-import-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
}

.meal-planner-import-btn:active {
    transform: translateY(0);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .meal-planner-import-container {
        background: linear-gradient(135deg, #431407 0%, #9a3412 100%);
        border-color: #ea580c;
    }
}
```

## ⚙️ Configuration

### Update Domain References

Replace `https://your-meal-planner-domain.com` with your actual meal planner domain in:

1. The JavaScript `postMessage` calls
2. The window.open URL
3. Any CORS configurations

### Security Considerations

1. **Domain Validation**: The meal planner app validates the origin domain
2. **Data Sanitization**: Recipe data is properly escaped and validated
3. **Authentication Required**: Users must sign in to import recipes

## 🔄 How It Works

### User Flow:
1. User visits your blog post with a recipe
2. Clicks "Add to Meal Planner" button
3. Meal planner opens in new tab (or focuses existing tab)
4. Import modal appears with recipe preview
5. User must sign in/create account to import
6. Recipe is saved to their personal collection

### Technical Flow:
1. WordPress extracts recipe data from WP Recipe Maker
2. Data is sent via `postMessage` to meal planner app
3. Meal planner validates origin and data format
4. Recipe is mapped to app format with field conversion
5. User authentication is required for import
6. Recipe is saved to Supabase database

## 🧪 Testing

### Test the Integration:

1. **Local Testing**:
   ```javascript
   // Test data structure
   const testRecipe = {
     name: "Test Recipe",
     summary: "A test recipe",
     prep_time: 15,
     cook_time: 30,
     servings: 4,
     ingredients: [
       { amount: "2", unit: "cups", name: "flour" },
       { amount: "1", unit: "tsp", name: "salt" }
     ],
     instructions: [
       { text: "Mix ingredients" },
       { text: "Bake for 30 minutes" }
     ]
   };
   
   // Trigger import
   importToMealPlanner(testRecipe);
   ```

2. **Cross-Domain Testing**: Ensure `postMessage` works between domains
3. **Mobile Testing**: Verify popup behavior on mobile devices
4. **Authentication Flow**: Test sign-in requirement

## 🎯 Customization Options

### Button Appearance:
- Modify CSS for different colors/styles
- Add your branding
- Change button text/icon

### Integration Points:
- Recipe card footer
- Recipe header
- Floating button
- Custom widget

### Data Mapping:
- Add custom fields from your WP Recipe Maker setup
- Map nutrition information
- Include recipe ratings
- Add recipe images

## 📱 Mobile Considerations

The integration works on mobile devices:
- Uses responsive popup windows
- Graceful fallback for devices that block popups
- Touch-friendly button sizing
- Mobile-optimized import modal

## 🔧 Troubleshooting

### Common Issues:

1. **Popup Blocked**: 
   - Ensure button click triggers popup directly
   - Add user instruction about popup blockers

2. **Cross-Domain Issues**:
   - Verify domain in `postMessage` calls
   - Check CORS settings

3. **Recipe Data Missing**:
   - Verify WP Recipe Maker is active
   - Check recipe data structure

4. **Import Modal Not Opening**:
   - Check browser console for errors
   - Verify meal planner domain is accessible

### Debug Mode:

Add this to test recipe data extraction:

```javascript
function debugRecipeData(recipeData) {
    console.log('Recipe data:', recipeData);
    alert('Recipe data logged to console');
}
```

## 🚀 Go Live

### Final Steps:

1. **Update Domain URLs**: Replace all placeholder domains
2. **Test on Staging**: Verify integration works
3. **Add to Recipe Templates**: Implement on your recipe cards
4. **User Documentation**: Add help text for users
5. **Monitor Analytics**: Track import button clicks

This integration creates a seamless bridge between your recipe blog and the meal planning app, requiring minimal setup while providing maximum user value! 🍽️✨