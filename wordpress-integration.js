/**
 * WordPress Integration Script for Meal Planner
 * Multi-domain support for development and production
 */
(function() {
    'use strict';

    // Multi-domain configuration
    const DOMAINS = {
        development: 'https://meal-planner-app-development-5205.vercel.app',
        production: 'https://mealplan.supertasty.recipes'
    };

    // Auto-detect which domain to use
    const getMealPlannerDomain = () => {
        // Check if production domain is accessible (for live site)
        if (window.location.hostname.includes('supertasty.recipes') || 
            window.location.hostname.includes('yourdomain.com')) {
            return DOMAINS.production;
        }
        // Default to development for testing
        return DOMAINS.development;
    };

    const MEAL_PLANNER_DOMAIN = getMealPlannerDomain();
    const POPUP_FEATURES = 'width=1200,height=800,scrollbars=yes,resizable=yes,location=yes';

    // Global reference to meal planner window
    window.mealPlannerWindow = null;

    console.log('🔗 Meal Planner Integration loaded for domain:', MEAL_PLANNER_DOMAIN);

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
                    handlePopupBlocked(recipeData);
                    return;
                }

                // Wait for window to load, then send recipe
                let attempts = 0;
                const maxAttempts = 15; // Increased for better reliability

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
                            showImportFeedback('Failed to import recipe. Please try again.', 'error');
                        }
                    }
                };

                // Start trying to send recipe after initial delay
                setTimeout(sendRecipeWhenReady, 2000);
            }

            // Show user feedback
            showImportFeedback('Recipe is being imported to your meal planner...', 'info');

        } catch (error) {
            console.error('Error importing recipe:', error);
            showImportFeedback('Error importing recipe. Please try again.', 'error');
        }
    };

    /**
     * Handle popup blocked scenario
     */
    function handlePopupBlocked(recipeData) {
        const message = `
            Popup was blocked by your browser. Please allow popups for this site or manually open the meal planner:
            ${MEAL_PLANNER_DOMAIN}
        `;

        if (confirm(message + '\n\nWould you like to copy the meal planner URL?')) {
            copyToClipboard(MEAL_PLANNER_DOMAIN);
            showImportFeedback('Meal planner URL copied to clipboard!', 'success');
        }
    }

    /**
     * Show user feedback message
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

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    console.log('🔗 WordPress Meal Planner Integration loaded');
    console.log('🌐 Target domain:', MEAL_PLANNER_DOMAIN);

})();