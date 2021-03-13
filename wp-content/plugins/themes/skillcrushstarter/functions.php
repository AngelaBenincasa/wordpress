<?php
/**
 * Skillcrush Starter functions and definitions
 *
 * Set up the theme and provides some helper functions, which are used in the
 * theme as custom template tags. Others are attached to action and filter
 * hooks in WordPress to change core functionality.
 *
 * When using a child theme you can override certain functions (those wrapped
 * in a function_exists() call) by defining them first in your child theme's
 * functions.php file. The child theme's functions.php file is included before
 * the parent theme's file, so the child theme functions would be used.
 *
 * @link http://codex.wordpress.org/Theme_Development
 * @link http://codex.wordpress.org/Child_Themes
 *
 * Functions that are not pluggable (not wrapped in function_exists()) are
 * instead attached to a filter or action hook.
 *
 * For more information on hooks, actions, and filters,
 * @link http://codex.wordpress.org/Plugin_API
 *
 * @package WordPress
 * @subpackage Skillcrush_Starter
  * @since Skillcrush Starter 2.0
 */

// Theme support for post-thumbnails and menus
function skillcrushstarter_setup() {

	// Post thumbnails support
	add_theme_support('post-thumbnails');

	/*
	 * Let WordPress manage the document title.
	 * By adding theme support, we declare that this theme does not use a
	 * hard-coded <title> tag in the document head, and expect WordPress to
	 * provide it for us.
	 */
	add_theme_support( 'title-tag' );

	// Register Menus
	register_nav_menus ( array (
		'primary-menu' => __( 'Primary Menu', 'skillcrushstarter' ),
	) );
}
add_action( 'after_setup_theme', 'skillcrushstarter_setup' );

// Enqueue scripts and styles
function skillcrushstarter_scripts() {
	wp_enqueue_style( 'skillcrushstarter-style', get_stylesheet_uri() );
}
add_action( 'wp_enqueue_scripts', 'skillcrushstarter_scripts' );

// Register widget area
function skillcrushstarter_widgets_init() {
	 register_sidebar( array(
	 'name'         => 'Custom Header Widget Area',
	 'id'           => 'custom-header-widget',
	 'description'  => 'Header Widget Area',
	 'before_widget' => '<div class="chw-widget">',
	 'after_widget'  => '</div>',
	 'before_title'  => '<h2 class="chw-title">',
	 'after_title'   => '</h2>',
	 ));

	register_sidebar( array(
		'name'          => __( 'Sidebar 1', 'skillcrushstarter' ),
		'id'            => 'sidebar-1',
		'description'   => __( 'Add widgets here to appear in your sidebar.', 'skillcrushstarter' ),
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h2 class="widget-title">',
		'after_title'   => '</h2>',
	) );

	register_sidebar( array(
	 'name'          => 'Footer Column 1',
	 'id'            => 'footer_column_1',
	 'description'   => 'Footer Widget Area Column 1',
	 'before_widget' => '<section class="footer-column footer-column-1">',
	 'after_widget'  => '</section>',
	 'before_title'  => '<h4>',
	 'after_title'   => '</h4>',
 ));

 register_sidebar( array(
	'name'          => 'Footer Column 2',
 	'id'            => 'footer_column_2',
 	'description'   => 'Footer Widget Area Column 2',
 	'before_widget' => '<section class="footer-column footer-column-2">',
 	'after_widget'  => '</section>',
 	'before_title'  => '<h4>',
	'after_title'   => '</h4>',
 ));

 register_sidebar( array(
 'name'          => 'Footer Column 3',
	 'id'            => 'footer_column_3',
	 'description'   => 'Footer Widget Area Column 3',
	 'before_widget' => '<section id="copyright" class="footer-column footer-column-3">',
	 'after_widget'  => '</section>',
	 'before_title'  => '<h4>',
	 'after_title'   => '</h4>',
 ));

}
add_action( 'widgets_init', 'skillcrushstarter_widgets_init' );


// Defines custom markup for post comments
function skillcrushstarter_comments($comment, $args, $depth) {
	$comment  = '<li class="comment">';
	$comment .=	'<header class="comment-head">';
	$comment .= '<span class="comment-author">' . get_comment_author() . '</span>';
	$comment .= '<span class="comment-meta">' . get_comment_date('m/d/Y') . '&emsp;|&emsp;' . get_comment_reply_link(array('depth' => $depth, 'max_depth' => 5)) . '</span>';
	$comment .= '</header>';
	$comment .= '<div class="comment-body">';
	$comment .= '<p>' . get_comment_text() . '</p>';
	$comment .= '</div>';
	$comment .= '</li>';

	echo $comment;
}

// Changes excerpt symbol
function custom_excerpt_more($more) {
	return '...<div class="read-more"><a href="'. get_permalink() . '"><span>Read more</span> »</a></div>';
}
add_filter('excerpt_more', 'custom_excerpt_more');

add_theme_support( 'custom-logo' );

// Defines custom markup for custom logos
function theme_prefix_setup() {

	add_theme_support( 'custom-logo', array(
		'height'      => 100,
		'width'       => 400,
		'flex-height' => true,
		'flex-width'  => true,
		'header-text' => array( 'site-title', 'site-description' ),
) );

}
add_action( 'after_setup_theme', 'theme_prefix_setup' );

function theme_prefix_the_custom_logo() {

	if ( function_exists( 'the_custom_logo' ) ) {
		the_custom_logo();
	}

}

/**
 * Font Awesome CDN Setup Webfont
 *
 * This will load Font Awesome from the Font Awesome Free or Pro CDN.
 */
if (! function_exists('fa_custom_setup_cdn_webfont') ) {
  function fa_custom_setup_cdn_webfont($cdn_url = '', $integrity = null) {
    $matches = [];
    $match_result = preg_match('|/([^/]+?)\.css$|', $cdn_url, $matches);
    $resource_handle_uniqueness = ($match_result === 1) ? $matches[1] : md5($cdn_url);
    $resource_handle = "font-awesome-cdn-webfont-$resource_handle_uniqueness";

    foreach ( [ 'wp_enqueue_scripts', 'admin_enqueue_scripts', 'login_enqueue_scripts' ] as $action ) {
      add_action(
        $action,
        function () use ( $cdn_url, $resource_handle ) {
          wp_enqueue_style( $resource_handle, $cdn_url, [], null );
        }
      );
    }

    if($integrity) {
      add_filter(
        'style_loader_tag',
        function( $html, $handle ) use ( $resource_handle, $integrity ) {
          if ( in_array( $handle, [ $resource_handle ], true ) ) {
            return preg_replace(
              '/\/>$/',
              'integrity="' . $integrity .
              '" crossorigin="anonymous" />',
              $html,
              1
            );
          } else {
            return $html;
          }
        },
        10,
        2
      );
    }
  }
}

fa_custom_setup_cdn_webfont(
	'https://use.fontawesome.com/releases/v5.15.2/css/all.css',
	'sha384-vSIIfh2YWi9wW0r9iZe7RJPrKwp6bG+s9QZMoITbCckVJqGCCRhc+ccxNcdpHuYu'
);

/**
 * Font Awesome Conflict Resolution
 */
if (! function_exists('fa_custom_remove_conflicts') ) {
  function fa_custom_remove_conflicts($blacklist = array()) {
    foreach ( [ 'wp_print_styles', 'admin_print_styles', 'login_head' ] as $action ) {
      add_action(
        $action,
        function() use ( $blacklist ) {
          $collections = array(
            'style'  => wp_styles(),
            'script' => wp_scripts(),
          );

          foreach ( $collections as $key => $collection ) {
            foreach ( $collection->registered as $handle => $details ) {
              if ( FALSE !== array_search(md5($details->src), $blacklist) ) {
                $collection->dequeue([ $handle ]);
              } else {
                foreach ( [ 'before', 'after' ] as $position ) {
                  $data = $collection->get_data($handle, $position);
                  if( $data && is_array($data) &&
                    FALSE !== array_search(
                      md5("\n" . implode("\n", $data) . "\n"),
                      $blacklist)
                    ) {
                    unset( $collection->registered[$handle]->extra[$position] );
                  }
                }
              }
            }
          }
        },
        0
      );
    }
  }
}

fa_custom_remove_conflicts([
  '7ca699f29404dcdb477ffe225710067f',
  '3c937b6d9b50371df1e78b5d70e11512',
]);
