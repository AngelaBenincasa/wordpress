<?php
/**
  * The template for displaying the header
 *
 * Displays all of the <head> section and everything up till <div id="main">
 *
 * @package WordPress
 * @subpackage Skillcrush_Starter
 * @since Skillcrush Starter 2.0
 */
?>
<!DOCTYPE html>
<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width">
	<meta name="description" content="A WordPress portfolio project site, built with Skillcrush.">
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>">
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap" rel="stylesheet">
	<script src="https://use.fontawesome.com/6cda8e6ea1.js"></script>
	<?php wp_head(); ?>

</head>

<body <?php body_class(); ?>>

	<div id="page" class="hfeed site">
		<header class="page-header container">

			<?php
				 $custom_logo_id = get_theme_mod( 'custom_logo' );
				 $image = wp_get_attachment_image_src( $custom_logo_id , 'full' );
						?>
			<img src="<?php echo $image[0]; ?>" "<?php echo site_url(); ?>" alt="" class="top-logo">

			<nav class="top-nav">
				<?php wp_nav_menu(array('theme_location' => 'primary-menu')); ?>
			</nav>

			<?php
				if ( is_active_sidebar( 'custom-header-widget' ) ) : ?>
				<div id="header-widget-area" class="chw-widget-area widget-area" role="complementary">
					<?php dynamic_sidebar( 'custom-header-widget' ); ?>
				</div>

			<?php endif; ?>

		</header>

		<div id="main" class="site-main">
