# WordPress Integration Troubleshooting Guide

## 🔍 Step-by-Step Troubleshooting

### Step 1: Check Basic Requirements

**First, verify these basics:**

1. **WP Recipe Maker Plugin is Active**
   - Go to WordPress Admin → Plugins
   - Make sure "WP Recipe Maker" is installed and activated
   - Version should be recent (2.0+ recommended)

2. **You Have Recipe Posts**
   - Go to a post that contains a recipe
   - Make sure the recipe is created with WP Recipe Maker (not just text)
   - You should see the recipe card displaying properly

### Step 2: Test with Debug Version

1. **Replace your functions.php code** with the code from `wordpress-functions-debug.php`
2. **Visit a recipe post** on your site
3. **Look for debug messages** - you should see colored debug boxes
4. **Check what messages appear:**
   - Green: Button should be visible
   - Red: WP Recipe Maker not found
   - Orange: Recipe not found
   - Purple: Content filter working
   - Blue: Direct hook working

### Step 3: Try Simple Test Version

If the debug version shows issues:

1. **Replace functions.php code** with `wordpress-simple-test.php`
2. **Visit any recipe post**
3. **Look for "Add to Meal Planner (TEST)" button**
4. **Click it** - should show alert and open meal planner

### Step 4: Check File Locations

Verify the JavaScript file is in the right place:

```
/wp-content/themes/[your-theme-name]/wordpress-integration.js
```

**Common locations:**
- `/wp-content/themes/your-theme/wordpress-integration.js`
- `/wp-content/themes/child-theme/wordpress-integration.js`

### Step 5: Browser Console Check

1. **Open browser developer tools** (F12)
2. **Go to Console tab**
3. **Visit a recipe post**
4. **Look for errors** - especially:
   - "importToMealPlanner is not defined"
   - "Failed to load resource" (JavaScript file)
   - Any red error messages

### Step 6: Alternative Installation Methods

**Method A: Direct Script in Functions.php**
Add this to your functions.php instead:

```php
function add_meal_planner_script_direct() {
    if (is_single() && has_shortcode(get_post()->post_content, 'wprm-recipe')) {
        ?>
        <script>
        function importToMealPlanner(recipeData) {
            alert('Button clicked! Recipe: ' + (recipeData.name || 'Unknown'));
            const url = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
            window.open(url, 'mealplanner', 'width=1200,height=800');
        }
        </script>
        <?php
    }
}
add_action('wp_footer', 'add_meal_planner_script_direct');
```

**Method B: Plugin Approach**
Create a simple plugin instead of using functions.php

### Step 7: Check Theme Compatibility

Some themes might interfere:

1. **Try switching to a default theme** (Twenty Twenty-Three) temporarily
2. **Test if button appears** with default theme
3. **If it works**, the issue is theme-related

### Step 8: Common Issues & Solutions

**Issue: "WP Recipe Maker plugin not found"**
- Solution: Install/activate WP Recipe Maker plugin

**Issue: Button appears but doesn't work**
- Solution: JavaScript file not loading - check file path

**Issue: No button at all**
- Solution: Try the simple test version first

**Issue: Button on wrong posts**
- Solution: Check that posts actually contain recipe shortcodes

## 🆘 Emergency Simple Solution

If nothing works, add this minimal code to functions.php:

```php
add_action('wp_footer', function() {
    if (is_single()) {
        ?>
        <script>
        jQuery(document).ready(function($) {
            if ($('.wprm-recipe').length > 0) {
                $('.wprm-recipe').after('<div style="text-align:center;margin:20px 0;"><button onclick="alert(\'Meal Planner Integration Test\')" style="background:#f97316;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;">🍽️ Add to Meal Planner</button></div>');
            }
        });
        </script>
        <?php
    }
});
```

## 📞 Next Steps

1. **Try the debug version first**
2. **Report back what debug messages you see**
3. **Check browser console for errors**
4. **Let me know your theme name** - some themes need special handling

The debug version will help us identify exactly what's going wrong!