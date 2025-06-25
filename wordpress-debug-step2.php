<?php
/**
 * DEBUG STEP 2: Test WP Recipe Maker detection
 * Replace Step 1 with this after you confirm Step 1 works
 */

// Debug WP Recipe Maker
function debug_wprm_detection() {
    if (is_single()) {
        $wprm_active = class_exists('WPRM_Recipe_Manager');
        $recipe_ids = array();
        
        if ($wprm_active) {
            try {
                $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
            } catch (Exception $e) {
                // Error getting recipe IDs
            }
        }
        
        echo '<div style="background: purple; color: white; padding: 10px; margin: 10px 0; position: fixed; top: 50px; right: 10px; z-index: 9999; max-width: 250px;">
            🔍 <strong>WPRM DEBUG:</strong><br>
            Plugin Active: ' . ($wprm_active ? 'YES' : 'NO') . '<br>
            Recipe IDs: ' . implode(',', $recipe_ids) . '<br>
            Post ID: ' . get_the_ID() . '
        </div>';
    }
}

add_action('wp_footer', 'debug_wprm_detection');

// Simple recipe shortcode
function simple_recipe_shortcode() {
    if (!class_exists('WPRM_Recipe_Manager')) {
        return '<div style="background: red; color: white; padding: 10px;">❌ WP Recipe Maker not found</div>';
    }
    
    $recipe_ids = WPRM_Recipe_Manager::get_recipe_ids_from_post(get_the_ID());
    if (empty($recipe_ids)) {
        return '<div style="background: orange; color: white; padding: 10px;">⚠️ No recipes found on this post</div>';
    }
    
    return '<div style="background: green; color: white; padding: 20px; margin: 20px 0; text-align: center;">
        ✅ <strong>Recipe Found!</strong><br>
        Recipe ID: ' . $recipe_ids[0] . '<br>
        <button onclick="alert(\'Recipe detected successfully!\')" style="background: white; color: green; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 8px;">
            🍽️ Recipe Button Works
        </button>
    </div>';
}

add_shortcode('recipe_test', 'simple_recipe_shortcode');

?>