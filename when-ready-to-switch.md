# When Ready to Switch to Your Subdomain

## 🚀 **When you launch your meal planner on your subdomain:**

### **Step 1: Update the URL**
Find this line in your functions.php:
```javascript
const developmentUrl = 'https://meal-planner-app-development-5205.vercel.app';
```

**Replace with:**
```javascript
const productionUrl = 'https://meals.yourdomain.com'; // Your actual subdomain
```

### **Step 2: Update the postMessage target**
Find this line:
```javascript
}, developmentUrl);
```

**Replace with:**
```javascript
}, productionUrl);
```

### **Step 3: Update function name (optional)**
You can rename:
- `developmentMealPlannerImport` → `productionMealPlannerImport`
- `showDevelopmentFeedback` → `showProductionFeedback`

## 🔄 **Quick Switch Method:**

Just replace these 3 lines:
```javascript
// OLD:
const developmentUrl = 'https://meal-planner-app-development-5205.vercel.app';

// NEW:
const productionUrl = 'https://meals.yourdomain.com';
```

```javascript
// OLD:
const url = developmentUrl + '/#/?import=pending';

// NEW:
const url = productionUrl + '/#/?import=pending';
```

```javascript
// OLD:
}, developmentUrl);

// NEW:
}, productionUrl);
```

That's it! Super simple switch when you're ready! 🎯