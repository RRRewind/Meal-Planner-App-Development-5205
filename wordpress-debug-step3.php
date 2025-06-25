<?php
/**
 * DEBUG STEP 3: Test shortcode in different ways
 * Use this if Steps 1 & 2 work
 */

// Multiple test shortcodes
function test1_shortcode() {
    return '<div style="background: red; color: white; padding: 15px; margin: 10px 0;">🔴 TEST 1 SHORTCODE WORKS</div>';
}

function test2_shortcode() {
    return '<div style="background: blue; color: white; padding: 15px; margin: 10px 0;">🔵 TEST 2 SHORTCODE WORKS</div>';
}

function test3_shortcode() {
    return '<div style="background: green; color: white; padding: 15px; margin: 10px 0;">🟢 TEST 3 SHORTCODE WORKS</div>';
}

add_shortcode('test1', 'test1_shortcode');
add_shortcode('test2', 'test2_shortcode');
add_shortcode('test3', 'test3_shortcode');

// Show instructions
function debug_instructions() {
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: #333; color: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <strong>🧪 DEBUG INSTRUCTIONS:</strong><br><br>
            Add these shortcodes to your post:<br>
            <code>[test1]</code> - Should show red box<br>
            <code>[test2]</code> - Should show blue box<br>
            <code>[test3]</code> - Should show green box<br>
            <code>[recipe_test]</code> - Should detect recipes<br><br>
            If none appear, shortcodes might be disabled in your theme.
        </div>';
    }
}

add_action('wp_footer', 'debug_instructions');

?>