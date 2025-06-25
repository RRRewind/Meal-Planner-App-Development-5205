# Debugging the Loading Screen Issue

## 🔍 **What to Check:**

### **Step 1: Browser Console**
1. **Open browser dev tools** (F12)
2. **Go to Console tab**
3. **Click the meal planner button**
4. **Look for these messages:**
   - "🍽️ FIXED import starting..."
   - "✅ Recipe data:" (with recipe object)
   - "📤 Attempt 1: Sending recipe to meal planner..."
   - "✅ Recipe sent successfully"

### **Step 2: Check the Meal Planner Console**
1. **In the meal planner window** (after it opens)
2. **Press F12** to open dev tools there too
3. **Look for:**
   - Import modal appearing
   - Recipe data being received
   - Any error messages

### **Step 3: Manual Test**
If the automatic import isn't working, try this in the meal planner console:
```javascript
// Test if the import system is working
const testRecipe = {
    title: "Test Recipe",
    description: "Test description",
    category: "Other",
    prepTime: 15,
    servings: 4,
    ingredients: [{name: "Test ingredient", quantity: 1, unit: "cup"}],
    instructions: ["Test instruction"]
};

// Trigger import manually
window.dispatchEvent(new CustomEvent('recipeImportRequest', {
    detail: { recipeData: testRecipe }
}));
```

## 🛠️ **What the Fixed Code Does:**

1. **Multiple Send Attempts**: Tries to send the recipe 5 times over 10 seconds
2. **Better Field Mapping**: Uses `title` instead of `name` to match your app
3. **Proper Data Types**: Converts numbers to proper types
4. **Enhanced Debugging**: More console logs to track what's happening
5. **Message Listener**: Listens for confirmation from meal planner

## 🚨 **If Still Stuck:**

Try this **super simple test** - add this to any page and click it:
```html
<button onclick="testMealPlannerDirect()">Test Direct Import</button>

<script>
function testMealPlannerDirect() {
    const testRecipe = {
        title: "WordPress Test Recipe",
        description: "Testing import from WordPress",
        category: "Other",
        prepTime: 15,
        servings: 4,
        ingredients: [
            {name: "Test ingredient", quantity: 1, unit: "cup", category: "Other"}
        ],
        instructions: ["Step 1: Test instruction"]
    };
    
    const popup = window.open('https://meal-planner-app-development-5205.vercel.app/#/?import=pending', 'test', 'width=1200,height=800');
    
    setTimeout(() => {
        popup.postMessage({
            type: 'IMPORT_RECIPE',
            recipe: testRecipe,
            source: 'test'
        }, 'https://meal-planner-app-development-5205.vercel.app');
    }, 3000);
}
</script>
```

This will help us determine if it's a WordPress integration issue or a meal planner app issue.