<?php
/**
 * ALTERNATIVE: Test-only version 
 * Use this if you just want to test the concept
 */

// Test shortcode only
function test_meal_planner_shortcode() {
    return '<div style="background: #4CAF50; color: white; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;">
        ✅ <strong>Meal Planner Test Button</strong><br>
        <button onclick="alert(\'Test successful! Ready for integration.\')" style="
            background: white; color: #4CAF50; border: none; padding: 8px 16px; 
            border-radius: 4px; margin-top: 8px; cursor: pointer;
        ">
            🍽️ Test Meal Planner
        </button>
    </div>';
}

add_shortcode('test_meal_planner', 'test_meal_planner_shortcode');

?>