<?php
namespace Site;

class Starter extends \Timber\Site {

    /**
     * Wordpress theme folder, set in .env SITE_NAME
     */
    private $themeFolder;

    /**
     * Manifest Cache
     */
    private $manifest = false;

    /**
     * Timber context
     */
    private $timberContext = [];

    /** Add timber support. */
	public function __construct() {
        $this->themeFolder = env('SITE_NAME') ?: 'default';

		add_action( 'after_setup_theme', array( $this, 'theme_supports' ) );
		add_filter( 'timber/context', array( $this, 'add_to_context' ) );
		add_filter( 'timber/twig', array( $this, 'add_to_twig' ) );
		add_action( 'init', array( $this, 'register_post_types' ) );
		add_action( 'init', array( $this, 'register_taxonomies' ) );
        add_action( 'acf/init', [ $this, 'acf_add_options' ] );

        add_action('wp_enqueue_scripts', [$this, 'remove_gutenberg_assets'], 100);
        add_action('wp_footer', [$this, 'remove_embed_scripts']);
        add_filter('the_generator', [$this, 'remove_version']);
        add_filter('login_errors', [$this, 'wrong_login_info']);
        add_filter('upload_mimes', [$this, 'cc_mime_types']);

        // Not using Windows Live Writer
        remove_action('wp_head', 'wlwmanifest_link');

        // Disable xmlrpc
        add_filter('xmlrpc_enabled', '__return_false');

		parent::__construct();
    }

    /** This is where you can register custom post types. */
	public function register_post_types() {
    }

	/** This is where you can register custom taxonomies. */
	public function register_taxonomies() {
    }

    /**
     * Add Options page.
     *
     * @return void
     */
    public function acf_add_options() {

        if( function_exists('acf_add_options_page') ) {
            acf_add_options_page(array(
                'page_title' 	=> 'Theme Settings',
                'menu_title'	=> 'Theme Settings',
                'menu_slug' 	=> 'theme-general-settings',
                'capability'	=> 'edit_posts',
                'redirect'		=> false
            ));
        }
    }

	/**
     * This is where you add data to context
     *
     * Feel free to add global data in this method
	 *
	 * @param string $context context['this'] Being the Twig's {{ this }}.
     * @return void
	 */
	public function add_to_context( $context ) {
		$this->timberContext = $context;

		// Load ACF Options into context
		$this->timberContext['options'] = get_field('options', 'options');

        // Nonce for form CSRF
        $this->timberContext['options']['nonce'] = wp_create_nonce('form-submit');

        // Loads the main menu
        $this->timberContext['menu'] = new \Timber\Menu();

        $this->timberContext['static'] = $this->getStaticPath();
		$this->timberContext['site'] = $this;

		// Theme link, for cors
        $domain = $_SERVER['HTTP_HOST'];
        $this->timberContext['theme']->link = "//{$domain}/app/themes/{$this->themeFolder}";
    }

	public function theme_supports() {
        // Add default posts and comments RSS feed links to head.
		// add_theme_support( 'automatic-feed-links' );

		/*
		 * Let WordPress manage the document title.
		 * By adding theme support, we declare that this theme does not use a
		 * hard-coded <title> tag in the document head, and expect WordPress to
		 * provide it for us.
		 */
        add_theme_support( 'title-tag' );

        /*

		 * Enable support for Post Thumbnails on posts and pages.
		 *
		 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		 */
        add_theme_support( 'post-thumbnails' );

		/*
		 * Switch default core markup for search form, comment form, and comments
		 * to output valid HTML5.
		 */
		add_theme_support(
			'html5', array(
				'comment-form',
				'comment-list',
				'gallery',
				'caption',
			)
        );

		/*
		 * Enable support for Post Formats.
		 *
		 * See: https://codex.wordpress.org/Post_Formats
		 */
		add_theme_support(
			'post-formats', array(
				'aside',
				'image',
				'video',
				'quote',
				'link',
				'gallery',
				'audio',
			)
        );

		add_theme_support( 'menus' );
    }

    /**
     * Returns the static path of the theme
     *
     * @return string
     */
    private function getStaticPath() {
        return "{$this->theme->uri}/static";
    }

    /**
     * Returns the file from the manifest.json (with the hash attached)
	 *
	 * @param string $file File to retrieve from the manifest.json
     * @return string
	 */
    public function manifest($file) {
        // Get maifest information from the cache
        $this->manifest = get_transient('manifest_json');

        // If cache is empty or too old, fetch new information
        if (! $this->manifest) {
            $path = dirname(__DIR__, 1);
            $manifestPath = "{$path}/static/manifest.json";

			if (file_get_contents($manifestPath)) {
				$this->manifest = json_decode(file_get_contents($manifestPath), true);

				// Cache
            	set_transient('manifest_json', $this->manifest, 300);
			} else {
                // There is no file, just return the file path,
                // used for development
				return "{$this->getStaticPath()}/{$file}";
			}
        }

        // Return the manifest resolved path
        return "{$this->getStaticPath()}/{$this->manifest[$file]}";
    }

	/**
     * This is where you can add your own functions to twig.
	 *
	 * @param string $twig get extension.
	 */
	public function add_to_twig( $twig ) {
		$twig->addExtension( new \Twig_Extension_StringLoader() );
        $twig->addFunction(new \Timber\Twig_Function('manifest', [$this, 'manifest']));

        return $twig;
	}

    /**
     * Remove Gutenberg assets
     */
    private function remove_gutenberg_assets() {
        wp_dequeue_style('wp-block-library');
    }

    /**
     * Remove embed scripts (Javascript from frontend)
     */
    private function remove_embed_scripts() {
        wp_deregister_script('wp-embed');
    }

    /**
     * This hides the Wordpress version
     *
     * @return string
     */
    private function get_wordpress_version() {
        return '';
    }

    /**
     * Error message for wrong login information
     *
     * @return string
     */
    private function wrong_login_info() {
        return 'Wrong username or password.';
    }

    /**
     * Add SVG Support
     *
     * Keep in mind, the SVG needs the <xml> line at the top in order to work
     */
    private function cc_mime_types($mimes) {
        $mimes['svg'] = 'image/svg+xml';
        return $mimes;
    }
}
