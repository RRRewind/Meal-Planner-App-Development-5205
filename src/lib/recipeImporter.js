// Recipe Import Utilities
import { v4 as uuidv4 } from 'uuid';

export class RecipeImporter {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize the importer and set up message listener
  initialize() {
    if (this.isInitialized) return;

    // Listen for messages from WordPress
    window.addEventListener('message', this.handleMessage.bind(this), false);
    
    // Set global flag to indicate meal planner is ready
    window.mealPlannerReady = true;
    window.mealPlannerImport = this.importRecipe.bind(this);
    
    this.isInitialized = true;
    console.log('🍽️ Recipe Importer initialized and ready');
  }

  // Handle messages from WordPress iframe or popup
  handleMessage(event) {
    // Verify origin for security (adjust based on your WordPress domain)
    const trustedOrigins = [
      'https://yourdomain.com',
      'http://localhost',
      'https://localhost'
      // Add your WordPress domain here
    ];

    if (!trustedOrigins.some(origin => event.origin.includes(origin.replace('https://', '').replace('http://', '')))) {
      console.warn('Untrusted origin:', event.origin);
      return;
    }

    if (event.data && event.data.type === 'IMPORT_RECIPE') {
      console.log('📨 Received recipe import request:', event.data.recipe);
      this.importRecipe(event.data.recipe);
    }
  }

  // Main import function
  importRecipe(recipeData) {
    if (!recipeData) {
      console.error('No recipe data provided');
      return;
    }

    // Dispatch custom event that components can listen to
    const importEvent = new CustomEvent('recipeImportRequest', {
      detail: { recipeData }
    });
    
    window.dispatchEvent(importEvent);
  }

  // Extract recipe data from WP Recipe Maker structured data
  static extractFromStructuredData() {
    try {
      // Look for JSON-LD structured data
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      
      for (let script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          
          // Check if it's a recipe
          if (data['@type'] === 'Recipe' || (Array.isArray(data) && data.some(item => item['@type'] === 'Recipe'))) {
            const recipe = Array.isArray(data) ? data.find(item => item['@type'] === 'Recipe') : data;
            return this.mapStructuredDataToRecipe(recipe);
          }
        } catch (e) {
          console.warn('Failed to parse structured data:', e);
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting structured data:', error);
      return null;
    }
  }

  // Map structured data to our recipe format
  static mapStructuredDataToRecipe(structuredData) {
    try {
      // Parse duration strings (PT15M format)
      const parseDuration = (duration) => {
        if (!duration) return 0;
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (!match) return 0;
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        return hours * 60 + minutes;
      };

      // Parse ingredients
      const parseIngredients = (ingredients) => {
        if (!Array.isArray(ingredients)) return [];
        
        return ingredients.map(ingredient => {
          if (typeof ingredient === 'string') {
            // Simple string format - try to parse
            const parts = ingredient.split(' ');
            const quantity = parseFloat(parts[0]) || 1;
            const unit = parts[1] || 'piece';
            const name = parts.slice(2).join(' ') || ingredient;
            
            return { name, quantity, unit, category: 'Other' };
          } else {
            // Object format
            return {
              name: ingredient.name || ingredient.text || 'Unknown ingredient',
              quantity: parseFloat(ingredient.amount) || 1,
              unit: ingredient.unit || 'piece',
              category: 'Other'
            };
          }
        });
      };

      // Parse instructions
      const parseInstructions = (instructions) => {
        if (!Array.isArray(instructions)) return [''];
        
        return instructions.map(instruction => {
          if (typeof instruction === 'string') return instruction;
          return instruction.text || instruction.name || '';
        }).filter(inst => inst.trim());
      };

      return {
        title: structuredData.name || 'Imported Recipe',
        description: structuredData.description || '',
        category: structuredData.recipeCategory || 'Other',
        prepTime: parseDuration(structuredData.prepTime),
        cookTime: parseDuration(structuredData.cookTime),
        chillTime: parseDuration(structuredData.totalTime) - parseDuration(structuredData.prepTime) - parseDuration(structuredData.cookTime),
        servings: parseInt(structuredData.recipeYield) || 4,
        ingredients: parseIngredients(structuredData.recipeIngredient || []),
        instructions: parseInstructions(structuredData.recipeInstructions || []),
        url: structuredData.url || window.location.href,
        image: structuredData.image ? (Array.isArray(structuredData.image) ? structuredData.image[0] : structuredData.image) : null
      };
    } catch (error) {
      console.error('Error mapping structured data:', error);
      throw error;
    }
  }
}

// Create global instance
export const recipeImporter = new RecipeImporter();

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  recipeImporter.initialize();
}

export default recipeImporter;