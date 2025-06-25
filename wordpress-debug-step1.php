<?php
/**
 * DEBUG STEP 1: Test if functions.php is working at all
 * Add this to functions.php and check if you see a message
 */

// Simple test to see if functions.php is loading
function debug_functions_php_loading() {
    if (is_single()) {
        echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 10px; right: 10px; z-index: 9999;">
            ✅ Functions.php is working!
        </div>';
    }
}

add_action('wp_footer', 'debug_functions_php_loading');

// Test shortcode - should show SOMETHING
function test_shortcode_debug() {
    return '<div style="background: blue; color: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
        🧪 <strong>SHORTCODE TEST WORKING!</strong><br>
        If you see this, the shortcode system works.
    </div>';
}

add_shortcode('debug_test', 'test_shortcode_debug');

?>