# Safe Upgrade Steps

## 📝 **Option 1: Replace Just the Function**

In your working functions.php, find this line:
```php
function generate_meal_planner_button($recipe_id) {
```

**Replace ONLY that function** with `generate_enhanced_meal_planner_button` from the file above.

## 📝 **Option 2: Replace Just the JavaScript**

In your working functions.php, find this:
```javascript
function simpleMealPlannerImport(recipeJson) {
```

**Replace ONLY that function** with `enhancedMealPlannerImport` from above.

## 📝 **Option 3: Step-by-Step Test**

1. **First, just add ingredients:**
   - In your existing function, add this after the basic recipe data:
   ```php
   // Add ingredients
   $ingredients = $recipe->ingredients();
   if (is_array($ingredients)) {
       foreach ($ingredients as $ingredient_group) {
           if (isset($ingredient_group['ingredients'])) {
               foreach ($ingredient_group['ingredients'] as $ingredient) {
                   $recipe_data['ingredients'][] = array(
                       'name' => $ingredient['name'],
                       'quantity' => $ingredient['amount'],
                       'unit' => $ingredient['unit']
                   );
               }
           }
       }
   }
   ```

2. **Test that first** - if it works, then add instructions
3. **If it breaks, remove and try a different approach**

## 🛡️ **Safety Tips:**
- **Make a backup** of your working functions.php first
- **Test on one recipe post** before enabling everywhere
- **Check browser console** for any errors
- **If anything breaks, revert immediately**

Which approach would you prefer to try first?