# Emergency WordPress Fix Instructions

## 🆘 **Immediate Recovery Steps:**

### **Step 1: Clear the Error**
1. **Remove ALL code** you just added to functions.php
2. **Save functions.php** (should be back to original state)
3. **Check if site loads** normally again

### **Step 2: Use Ultra-Safe Version**
1. **Copy the code** from `wordpress-ultra-minimal-safe.php`
2. **Add ONLY this code** to the END of functions.php
3. **Save and test** - should not cause any errors

### **Step 3: Test with Shortcode**
1. **Edit any recipe post**
2. **Add this shortcode**: `[meal_planner_button]`
3. **Save and view the post**
4. **Look for the orange button**

## 🛡️ **Why This Version is Safer:**

- ✅ **No automatic insertion** - only works when you use shortcode
- ✅ **No content filters** - doesn't modify post content automatically  
- ✅ **Minimal code** - less chance of conflicts
- ✅ **Simple JavaScript** - only loads when needed
- ✅ **Basic recipe data** - no complex data extraction

## 🧪 **Expected Result:**
- Button only appears when you use `[meal_planner_button]` shortcode
- Clicking opens meal planner (basic version)
- No automatic buttons anywhere

## 🔧 **If This Still Causes Issues:**

Try this **emergency minimal test**:

```php
// EMERGENCY TEST - Add to functions.php
function emergency_test() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: green; color: white; padding: 10px;">
            ✅ Emergency test working - WordPress functions.php is OK
        </div>';
    }
}
add_action('wp_footer', 'emergency_test');
```

## 📞 **Next Steps:**
1. Try the ultra-minimal version first
2. If it works, test with shortcode `[meal_planner_button]`
3. Report back if you see the button and if it opens meal planner

This version is **much safer** and won't cause critical errors! 🛡️