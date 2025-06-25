<?php
/**
 * ULTRA SAFE STEP 1 - Just a simple test
 * This does absolutely nothing except show a green message
 * If this causes an error, we know there's a deeper issue
 */

// Simple test - just shows a message, does nothing else
function ultra_safe_test_step1() {
    // Only show to admins, only on single posts
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: green; color: white; padding: 10px; margin: 10px 0;">
            ✅ Ultra Safe Step 1: Basic PHP test successful!
        </div>';
    }
}

// Add the test to footer (safest hook)
add_action('wp_footer', 'ultra_safe_test_step1');

?>