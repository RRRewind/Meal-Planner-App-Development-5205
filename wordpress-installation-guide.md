# WordPress Integration Installation Guide

## 📋 Quick Installation Steps for Gutenberg Blocks

### Step 1: Upload JavaScript File
1. Download `wordpress-integration.js` from the project files
2. Upload it to your WordPress theme directory: `/wp-content/themes/[your-theme-name]/`
3. Or upload via cPanel File Manager to the same location

### Step 2: Add PHP Functions (Enhanced for Gutenberg)
1. **Download** the `wordpress-functions.php` file (now supports Gutenberg blocks!)
2. **Copy** all the code inside it
3. **Go to** WordPress Admin → Appearance → Theme Editor
4. **Select** `functions.php` from the file list
5. **Scroll to the bottom** of the file
6. **Paste the copied code** at the very end
7. **Click** "Update File"

### Step 3: Test the Integration
1. Visit any recipe post on your blog
2. You should see an orange "Add to Meal Planner" button
3. Click it to test the integration with your meal planner app

## 🔧 Troubleshooting for Gutenberg Blocks

### If you're using Gutenberg blocks but no button appears:

**Step 1: Use the Debug Version**
- Replace your functions.php code with `wordpress-functions-debug.php`
- Visit your recipe post
- Look for comprehensive debug information on the right side of the screen

**Step 2: Use the Simple Test**
- Replace with `wordpress-simple-gutenberg-test.php`
- This will show exactly what blocks are detected
- Will confirm if your recipe blocks are being found

### Common Gutenberg Issues:

**Issue: "No recipe blocks found"**
- Solution: Make sure you're using the WP Recipe Maker Gutenberg block, not shortcodes
- Check that the block shows "wp-recipe-maker/recipe" in the debug info

**Issue: "Recipe block found but no ID"**
- Solution: The recipe might not be properly saved. Re-edit and save the recipe block

**Issue: Button appears but in wrong location**
- Solution: The CSS selector might need adjustment for your theme

### How to Add Recipe with Gutenberg Block:
1. **Edit your post** in WordPress
2. **Click the "+" button** to add a block
3. **Search for "Recipe"** or "WP Recipe Maker"
4. **Select the WP Recipe Maker block**
5. **Create or select your recipe**
6. **Update the post**

## 🔍 Debug Information

The enhanced version now detects recipes through:
1. **Gutenberg blocks** (wp-recipe-maker/recipe)
2. **WP Recipe Maker API** (get_recipe_ids_from_post)
3. **Shortcodes** (fallback method)

### Expected Debug Output:
```
COMPREHENSIVE RECIPE DEBUG:
Post ID: 85959
Has Gutenberg blocks: YES
Has [wprm-recipe] shortcode: NO
Has "wprm-recipe" in content: YES
Recipe IDs detected: 123, 456
WP Recipe Maker active: YES

Detection Details:
WP Recipe Manager method found: 2 recipes
Gutenberg blocks method found: 2 recipes
No shortcodes detected

Block Analysis:
Recipe block found with attrs: Array([id] => 123)
Recipe block found with attrs: Array([id] => 456)
All block types: wp-recipe-maker/recipe, core/paragraph, core/heading
```

## 📝 File Locations
- **JavaScript file**: `/wp-content/themes/[your-theme]/wordpress-integration.js`
- **PHP code**: Add to `/wp-content/themes/[your-theme]/functions.php`

## 🎯 Domain Configuration
The JavaScript automatically detects:
- **Development**: `https://meal-planner-app-development-5205.vercel.app`
- **Production**: `https://mealplan.supertasty.recipes`

Update the production domain in `wordpress-integration.js` when you set up your custom domain.

## ⚠️ Important Notes
- **Gutenberg blocks**: This version specifically detects WP Recipe Maker Gutenberg blocks
- **Backup first**: Always backup `functions.php` before editing
- **Child themes**: Use child theme functions.php if available
- **Testing**: Test on a staging site first if possible
- **Updates**: Code will survive theme updates if using child theme

## 🆘 Need Help?
If you encounter issues:
1. Use the debug version first (`wordpress-functions-debug.php`)
2. Try the simple test version (`wordpress-simple-gutenberg-test.php`)
3. Check WordPress error logs
4. Verify you're using Gutenberg blocks, not shortcodes
5. Contact support with specific debug output

The enhanced detection should now work perfectly with your Gutenberg block setup! 🎉