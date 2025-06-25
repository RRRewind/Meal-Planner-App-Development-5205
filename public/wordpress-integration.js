/**
 * WordPress Integration Script for Meal Planner
 * 
 * This script can be embedded in WordPress to enable recipe import functionality.
 * Users can click a button on recipe posts to import recipes into the meal planner app.
 */

(function() {
    'use strict';

    // Configuration
    const MEAL_PLANNER_DOMAIN = 'https://your-meal-planner-domain.com'; // Update this!
    const POPUP_FEATURES = 'width=1200,height=800,scrollbars=yes,resizable=yes,location=yes';

    // Global reference to meal planner window
    window.mealPlannerWindow = null;

    /**
     * Import recipe to meal planner
     * @param {Object} recipeData - Recipe data from WP Recipe Maker
     */
    window.importToMealPlanner = function(recipeData) {
        if (!recipeData) {
            console.error('No recipe data provided');
            return;
        }

        console.log('🍽️ Importing recipe to meal planner:', recipeData.name);

        try {
            // Check if meal planner is already open
            if (window.mealPlannerWindow && !window.mealPlannerWindow.closed) {
                console.log('📤 Sending recipe to existing window');
                
                // Send recipe to existing window
                window.mealPlannerWindow.postMessage({
                    type: 'IMPORT_RECIPE',
                    recipe: recipeData,
                    source: 'wordpress',
                    timestamp: Date.now()
                }, MEAL_PLANNER_DOMAIN);
                
                // Focus the existing window
                window.mealPlannerWindow.focus();
                
            } else {
                console.log('🪟 Opening new meal planner window');
                
                // Open meal planner in new window
                const url = `${MEAL_PLANNER_DOMAIN}/#/?import=pending`;
                window.mealPlannerWindow = window.open(url, 'mealplanner', POPUP_FEATURES);
                
                if (!window.mealPlannerWindow) {
                    // Popup was blocked
                    handlePopupBlocked(recipeData);
                    return;
                }
                
                // Wait for window to load, then send recipe
                let attempts = 0;
                const maxAttempts = 10;
                
                const sendRecipeWhenReady = () => {
                    attempts++;
                    
                    if (window.mealPlannerWindow.closed) {
                        console.log('Window was closed before recipe could be sent');
                        return;
                    }
                    
                    try {
                        // Try to send the recipe
                        window.mealPlannerWindow.postMessage({
                            type: 'IMPORT_RECIPE',
                            recipe: recipeData,
                            source: 'wordpress',
                            timestamp: Date.now()
                        }, MEAL_PLANNER_DOMAIN);
                        
                        console.log('✅ Recipe sent to meal planner');
                        
                    } catch (error) {
                        // Window might not be ready yet
                        if (attempts < maxAttempts) {
                            setTimeout(sendRecipeWhenReady, 1000);
                        } else {
                            console.error('Failed to send recipe after maximum attempts');
                        }
                    }
                };
                
                // Start trying to send recipe after initial delay
                setTimeout(sendRecipeWhenReady, 2000);
            }
            
            // Show user feedback
            showImportFeedback('Recipe is being imported to your meal planner...');
            
        } catch (error) {
            console.error('Error importing recipe:', error);
            showImportFeedback('Error importing recipe. Please try again.', 'error');
        }
    };

    /**
     * Handle popup blocked scenario
     * @param {Object} recipeData - Recipe data to import
     */
    function handlePopupBlocked(recipeData) {
        const message = `
            Popup was blocked by your browser. 
            Please allow popups for this site or manually open the meal planner:
            ${MEAL_PLANNER_DOMAIN}
        `;
        
        if (confirm(message + '\n\nWould you like to copy the meal planner URL?')) {
            copyToClipboard(MEAL_PLANNER_DOMAIN);
            showImportFeedback('Meal planner URL copied to clipboard!');
        }
    }

    /**
     * Show user feedback message
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, error, info)
     */
    function showImportFeedback(message, type = 'info') {
        // Remove existing feedback
        const existing = document.getElementById('meal-planner-feedback');
        if (existing) existing.remove();

        // Create feedback element
        const feedback = document.createElement('div');
        feedback.id = 'meal-planner-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: white;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
            ${getTypeStyles(type)}
        `;
        
        feedback.textContent = message;
        document.body.appendChild(feedback);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 5000);
    }

    /**
     * Get styles for different message types
     * @param {string} type - Message type
     * @returns {string} CSS styles
     */
    function getTypeStyles(type) {
        switch (type) {
            case 'success':
                return 'background: linear-gradient(135deg, #059669, #10b981);';
            case 'error':
                return 'background: linear-gradient(135deg, #dc2626, #ef4444);';
            default:
                return 'background: linear-gradient(135deg, #f97316, #dc2626);';
        }
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    /**
     * Extract recipe data from WP Recipe Maker structured data
     * @returns {Object|null} Recipe data or null if not found
     */
    window.extractRecipeFromPage = function() {
        try {
            // Look for JSON-LD structured data
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            
            for (let script of scripts) {
                try {
                    const data = JSON.parse(script.textContent);
                    
                    // Check if it's a recipe
                    if (data['@type'] === 'Recipe' || (Array.isArray(data) && data.some(item => item['@type'] === 'Recipe'))) {
                        const recipe = Array.isArray(data) ? data.find(item => item['@type'] === 'Recipe') : data;
                        return mapStructuredDataToRecipe(recipe);
                    }
                } catch (e) {
                    console.warn('Failed to parse structured data:', e);
                }
            }

            return null;
        } catch (error) {
            console.error('Error extracting recipe from page:', error);
            return null;
        }
    };

    /**
     * Map structured data to recipe format
     * @param {Object} structuredData - JSON-LD structured data
     * @returns {Object} Mapped recipe data
     */
    function mapStructuredDataToRecipe(structuredData) {
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
                    return {
                        name: ingredient,
                        amount: '1',
                        unit: 'piece'
                    };
                } else {
                    return {
                        name: ingredient.name || ingredient.text || 'Unknown ingredient',
                        amount: ingredient.amount || '1',
                        unit: ingredient.unit || 'piece'
                    };
                }
            });
        };

        // Parse instructions
        const parseInstructions = (instructions) => {
            if (!Array.isArray(instructions)) return [];
            
            return instructions.map(instruction => {
                if (typeof instruction === 'string') return { text: instruction };
                return { text: instruction.text || instruction.name || '' };
            }).filter(inst => inst.text.trim());
        };

        return {
            name: structuredData.name || 'Imported Recipe',
            summary: structuredData.description || '',
            course: structuredData.recipeCategory || 'Other',
            prep_time: parseDuration(structuredData.prepTime),
            cook_time: parseDuration(structuredData.cookTime),
            total_time: parseDuration(structuredData.totalTime),
            servings: parseInt(structuredData.recipeYield) || 4,
            ingredients: parseIngredients(structuredData.recipeIngredient || []),
            instructions: parseInstructions(structuredData.recipeInstructions || []),
            url: structuredData.url || window.location.href
        };
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Auto-extract recipe when page loads (optional)
    document.addEventListener('DOMContentLoaded', function() {
        // Only auto-extract if there's a specific indicator
        if (document.querySelector('.auto-extract-recipe')) {
            const recipe = window.extractRecipeFromPage();
            if (recipe) {
                console.log('🍽️ Auto-extracted recipe:', recipe.name);
                window.autoExtractedRecipe = recipe;
            }
        }
    });

    console.log('🔗 WordPress Meal Planner Integration loaded');

})();