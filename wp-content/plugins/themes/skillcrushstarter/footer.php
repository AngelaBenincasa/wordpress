<?php
/**
 * The template for displaying the footer
 *
 * Contains footer content and the closing of the #main and #page div elements.
 *
 * @package WordPress
 * @subpackage Skillcrush_Starter
 * @since Skillcrush Starter 2.0
 */
?>

	</div><!-- #page -->

	<?php wp_footer(); ?>

	<section class="footer">

    <div class="pure-g">

        <div class="footer-sidebar-column-1" "pure-u-1 pure-u-sm-1 pure-u-md-1 pure-u-lg-1-5 pure-u-xl-1-5">

					<?php dynamic_sidebar( 'footer_column_1' ); ?>

        </div>

        <div class="footer-sidebar-column-2" "pure-u-1 pure-u-sm-1-3 pure-u-md-1-3 pure-u-lg-1-5 pure-u-xl-1-5">

					<?php dynamic_sidebar( 'footer_column_2' ); ?>

        </div>

				<div class="footer-sidebar-column-3" "pure-u-1 pure-u-sm-1-3 pure-u-md-1-3 pure-u-lg-1-5 pure-u-xl-1-5">

					<?php dynamic_sidebar( 'footer_column_3' ); ?>

				</div>

        </div>

    </div>

</section>
</body>
</html>
