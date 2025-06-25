<?php
/**
 * ULTRA SAFE STEP 2 - Add simple button test
 * Replace Step 1 code with this
 */

// Simple test - shows message and basic button
function ultra_safe_test_step2() {
    // Only show to admins, only on single posts
    if (is_single() && current_user_can('administrator')) {
        echo '<div style="background: blue; color: white; padding: 10px; margin: 10px 0;">
            ✅ Ultra Safe Step 2: Button test loaded!
        </div>';
        
        // Add a simple test button
        echo '<div style="text-align: center; margin: 20px 0; padding: 20px; background: #f0f0f0; border-radius: 10px;">
            <button onclick="testAlert()" style="background: #f97316; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                🍽️ Test Button
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">Click to test - should show alert</p>
        </div>';
    }
}

// Add simple JavaScript
function ultra_safe_test_script() {
    if (is_single() && current_user_can('administrator')) {
        ?>
        <script>
        function testAlert() {
            alert('🎉 Button works! Ready for Step 3.');
            console.log('Button test successful');
        }
        </script>
        <?php
    }
}

// Add both functions
add_action('wp_footer', 'ultra_safe_test_step2');
add_action('wp_footer', 'ultra_safe_test_script');

?>