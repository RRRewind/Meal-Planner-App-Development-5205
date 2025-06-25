# Final WordPress Integration Steps

## 🎯 **Complete Installation:**

### **Step 1: Upload JavaScript File**
1. **Download** `wordpress-integration.js` 
2. **Upload it** to your WordPress theme directory: 
   `/wp-content/themes/[your-theme-name]/wordpress-integration.js`

### **Step 2: Replace Your Test Code**
1. **Go to** WordPress Admin → Appearance → Theme Editor
2. **Select** `functions.php`
3. **Remove** your test code (the Step 3 code)
4. **Add** the complete code from `wordpress-functions-complete.php`
5. **Click** "Update File"

### **Step 3: Test the Integration**
1. **Visit** any recipe post
2. **Look for** the orange "Add to Meal Planner" button
3. **It should appear** directly after each recipe block
4. **Click it** to test the meal planner connection

## 🎨 **Expected Result:**

- ✅ Button appears **inside/after each recipe card**
- ✅ Button has orange gradient styling
- ✅ Clicking opens the meal planner app
- ✅ Recipe data is automatically imported

## 🔧 **If Button Still Appears at Bottom:**

Try this alternative hook by adding this to functions.php:

```php
// Force button placement after recipe
add_action('wp_footer', function() {
    if (is_single()) {
        ?>
        <script>
        jQuery(document).ready(function($) {
            // Wait for page to load completely
            setTimeout(function() {
                $('.wprm-recipe').each(function() {
                    if (!$(this).next('.meal-planner-import-container').length) {
                        $(this).after($('.meal-planner-import-container').first().clone());
                    }
                });
                // Remove the original button from bottom
                $('.meal-planner-import-container').first().remove();
            }, 1000);
        });
        </script>
        <?php
    }
});
```

## 📱 **Testing Checklist:**
- [ ] Button appears with each recipe
- [ ] Button has correct styling
- [ ] Clicking opens meal planner
- [ ] Recipe data imports correctly
- [ ] Works on mobile devices

This should now properly integrate the button directly with your Gutenberg recipe blocks! 🎉