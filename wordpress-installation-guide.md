# WordPress Integration Installation Guide

## 📋 Quick Installation Steps

### Step 1: Upload JavaScript File
1. Download `wordpress-integration.js` from the project files
2. Upload it to your WordPress theme directory: `/wp-content/themes/[your-theme-name]/`
3. Or upload via cPanel File Manager to the same location

### Step 2: Add PHP Functions
1. **Download** the `wordpress-functions.php` file
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

## 🔧 Troubleshooting

### If the button doesn't appear:
- Check that WP Recipe Maker plugin is active
- Verify the JavaScript file was uploaded correctly
- Check WordPress error logs for PHP errors

### If clicking the button doesn't work:
- Open browser developer console (F12) to check for JavaScript errors
- Verify the meal planner app domain is correct in the JavaScript file
- Test with popup blocker disabled

### Alternative installation method:
If the enqueue method doesn't work, uncomment this line in the PHP code:
```php
add_action('wp_footer', 'add_meal_planner_script_to_footer');
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

- **Backup first**: Always backup `functions.php` before editing
- **Child themes**: Use child theme functions.php if available
- **Testing**: Test on a staging site first if possible
- **Updates**: Code will survive theme updates if using child theme

## 🆘 Need Help?

If you encounter issues:
1. Check WordPress error logs
2. Test with browser developer tools
3. Verify file permissions and locations
4. Contact support with specific error messages