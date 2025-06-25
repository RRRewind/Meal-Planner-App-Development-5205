<?php
/**
 * SIMPLE GUTENBERG TEST - Just detects blocks and adds test button
 * Use this if you want to verify Gutenberg block detection is working
 *
 * INSTRUCTIONS:
 * 1. Replace your functions.php code with this simple test version
 * 2. This will show what blocks are found and add a test button
 * 3. If this works, we know Gutenberg detection is working
 */

// Simple function to detect and display blocks
function simple_gutenberg_block_test() {
    // Only on single posts
    if (!is_single()) return;
    
    global $post;
    
    echo '<div style="background: #f0f0f0; border: 2px solid #ccc; padding: 20px; margin: 20px 0;">';
    echo '<h3>🔍 Gutenberg Block Detection Test</h3>';
    
    if (has_blocks($post->post_content)) {
        echo '<p>✅ <strong>Gutenberg blocks detected!</strong></p>';
        
        $blocks = parse_blocks($post->post_content);
        echo '<p><strong>Blocks found:</strong></p><ul>';
        
        $recipe_blocks_found = 0;
        foreach ($blocks as $block) {
            if (!empty($block['blockName'])) {
                echo '<li>' . $block['blockName'];
                
                if ($block['blockName'] === 'wp-recipe-maker/recipe') {
                    $recipe_blocks_found++;
                    echo ' <strong style="color: green;">← RECIPE BLOCK!</strong>';
                    if (isset($block['attrs']['id'])) {
                        echo ' (ID: ' . $block['attrs']['id'] . ')';
                    }
                }
                echo '</li>';
            }
        }
        echo '</ul>';
        
        if ($recipe_blocks_found > 0) {
            echo '<p style="color: green;">🎉 <strong>' . $recipe_blocks_found . ' recipe block(s) found!</strong></p>';
            echo '<button onclick="testMealPlannerConnection()" style="background: #f97316; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">🍽️ Test Meal Planner Connection</button>';
        } else {
            echo '<p style="color: orange;">⚠️ <strong>No recipe blocks found.</strong></p>';
            echo '<p>Make sure you added the recipe using the WP Recipe Maker Gutenberg block.</p>';
        }
        
    } else {
        echo '<p>❌ <strong>No Gutenberg blocks detected.</strong></p>';
        echo '<p>This post might be using the classic editor or shortcodes.</p>';
        
        // Check for shortcodes as fallback
        if (has_shortcode($post->post_content, 'wprm-recipe')) {
            echo '<p>✅ <strong>But shortcodes were found!</strong></p>';
        }
    }
    
    // Always add test button for connection testing
    echo '<hr style="margin: 15px 0;">';
    echo '<button onclick="testMealPlannerConnection()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">🧪 Test Meal Planner App Connection</button>';
    echo '</div>';
    
    // Add JavaScript for testing
    echo '<script>
    function testMealPlannerConnection() {
        alert("Testing connection to meal planner app...");
        console.log("Opening meal planner app for testing");
        
        // Test opening the meal planner
        const testUrl = "https://meal-planner-app-development-5205.vercel.app/#/?import=pending";
        const testWindow = window.open(testUrl, "mealplanner", "width=1200,height=800,scrollbars=yes,resizable=yes");
        
        if (testWindow) {
            console.log("✅ Meal planner window opened successfully");
        } else {
            alert("⚠️ Popup was blocked. Please allow popups for this site.");
        }
    }
    </script>';
}

// Add the test to post content
add_filter('the_content', function($content) {
    if (is_single() && in_the_loop() && is_main_query()) {
        ob_start();
        simple_gutenberg_block_test();
        $test_output = ob_get_clean();
        return $test_output . $content;
    }
    return $content;
});

// Also add basic debug info
function simple_debug_info() {
    if (is_single()) {
        echo '<div style="position: fixed; top: 10px; right: 10px; background: black; color: white; padding: 10px; z-index: 9999; font-size: 12px; max-width: 250px;">';
        echo '<strong>SIMPLE DEBUG:</strong><br>';
        echo 'Post ID: ' . get_the_ID() . '<br>';
        echo 'WP Recipe Maker: ' . (class_exists('WPRM_Recipe_Manager') ? 'ACTIVE' : 'NOT FOUND') . '<br>';
        echo 'Gutenberg blocks: ' . (has_blocks(get_post()->post_content) ? 'YES' : 'NO') . '<br>';
        echo 'Shortcodes: ' . (has_shortcode(get_post()->post_content, 'wprm-recipe') ? 'YES' : 'NO') . '<br>';
        echo '</div>';
    }
}
add_action('wp_footer', 'simple_debug_info');
?>