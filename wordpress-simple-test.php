<?php
/**
 * SIMPLE TEST VERSION - Just adds button to all recipe posts
 * Use this if the main version doesn't work
 * 
 * INSTRUCTIONS:
 * 1. Replace your functions.php code with this simple version
 * 2. This will add the button to ALL posts with recipes
 * 3. If this works, we know the issue is with the template hooks
 */

// Simple function to add button to any post with recipes
function simple_meal_planner_button() {
    // Only on single posts
    if (!is_single()) return;
    
    global $post;
    
    // Check if post has recipe shortcode
    if (has_shortcode($post->post_content, 'wprm-recipe')) {
        ?>
        <div style="margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; border-radius: 16px; padding: 20px;">
            <button onclick="testMealPlannerButton()" style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add to Meal Planner (TEST)
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">
                Test button - if you see this, the integration is working!
            </p>
        </div>
        
        <script>
        function testMealPlannerButton() {
            alert('Test button works! Now we can implement the full integration.');
            console.log('Meal planner test button clicked');
            
            // Test opening the meal planner
            const testUrl = 'https://meal-planner-app-development-5205.vercel.app/#/?import=pending';
            window.open(testUrl, 'mealplanner', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        }
        </script>
        <?php
    }
}

// Add the button after post content
add_filter('the_content', function($content) {
    if (is_single() && in_the_loop() && is_main_query()) {
        ob_start();
        simple_meal_planner_button();
        $button = ob_get_clean();
        return $content . $button;
    }
    return $content;
});

?>