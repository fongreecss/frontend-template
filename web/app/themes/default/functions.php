<?php
require __DIR__.'/../../../../vendor/autoload.php';

/**
 * Check if Timber is enabled
 */
if ( ! class_exists( 'Timber' ) ) {
	add_action( 'admin_notices', function() {
		echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
	});
	add_filter('template_include', function( $template ) {
		return get_stylesheet_directory() . '/no-timber.html';
	});
	return;
}

/**
 * Check if ACF is enabled
 */
if ( ! function_exists( 'get_field' ) ) {
	add_action( 'admin_notices', function() {
		echo '<div class="error"><p>ACF not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#acf' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
	});
	add_filter('template_include', function( $template ) {
		return get_stylesheet_directory() . '/no-acf.html';
	});
	return;
}

/**
 * Sets the directories (inside your theme) to find .twig files
 */
Timber::$dirname = [
    'static',
    'static/templates',
    'static/templates/pages',
    'static/templates/layouts',
    'static/templates/components',
];

/**
 * By default, Timber does NOT autoescape values. Want to enable Twig's autoescape?
 * No prob! Just set this value to true
 */
Timber::$autoescape = false;

/**
 * Load the starter site
 */
new Site\Starter();
