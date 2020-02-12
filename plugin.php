<?php
/**
 * Plugin Name: Sandbox Onboarding
 * Description: Adds Onboarding Redirect for CAP Sandbox
 * Author: SUSE Devs
 * Author URI: https://suse.dev/
 * Version: 1.0
 * Text Domain: cap-sandbox-onboarding
 *
 * Copyright: (c) 2020 SUSE
 *
 * License: GNU General Public License v3.0
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * @author    Andrew Gracey
 * @copyright Copyright (c) 2020, SUSE
 * @license   http://www.gnu.org/licenses/gpl-3.0.html GNU General Public License v3.0
 *
 */
defined( 'ABSPATH' ) or exit;

function add_settings(){
  register_setting('general', 'onboarding_url');
  register_setting('general', 'success_page');
  register_setting('general', 'fail_page');
  register_setting('general', 'exists_page');
  register_setting('general', 'button_text');
  register_setting('general', 'loggedout_text');
  
  add_settings_section(
    'sandbox_settings_section',
    'Sandbox URL Options',
    'wporg_settings_section_cb',
    'general'
  );
  
  add_settings_field('onboarding_url','Onboarding URL',
    'onboarding_url_cb',
    'general',
    'sandbox_settings_section'
  );
  add_settings_field('success_page','Success Page',
    'success_page_cb',
    'general',
    'sandbox_settings_section'
  );
  add_settings_field('fail_page','Fail Page',
    'fail_page_cb',
    'general',
    'sandbox_settings_section'
  );
  add_settings_field('exists_page','Exists Page',
    'exists_page_cb',
    'general',
    'sandbox_settings_section'
  );
  add_settings_field('button_text','Button Text',
    'button_text_cb',
    'general',
    'sandbox_settings_section'
  );
  add_settings_field('loggedout_text','Logged-Out Text',
    'loggedout_text_cb',
    'general',
    'sandbox_settings_section'
  );

}

function wporg_settings_section_cb()
{
    echo '<p>Configure Onboarding Flow.</p>';
}
 

function onboarding_url_cb()
{
    $setting = get_option('onboarding_url');
    ?><input type="text" name="onboarding_url" value="<?php echo isset( $setting ) ? esc_attr( $setting ) : ''; ?>"><?php
}
function success_page_cb()
{
    $setting = get_option('success_page');
    ?><input type="text" name="success_page" value="<?php echo isset( $setting ) ? esc_attr( $setting ) : ''; ?>"><?php
}
function fail_page_cb()
{
    $setting = get_option('fail_page');
    ?><input type="text" name="fail_page" value="<?php echo isset( $setting ) ? esc_attr( $setting ) : ''; ?>"><?php
}
function exists_page_cb()
{
    $setting = get_option('exists_page');
    ?><input type="text" name="exists_page" value="<?php echo isset( $setting ) ? esc_attr( $setting ) : ''; ?>"><?php
}
function button_text_cb()
{
    $setting = get_option('button_text');
    ?><input type="text" name="button_text" value="<?php echo isset( $setting ) ? esc_attr( $setting ) : ''; ?>"><?php
}
function loggedout_text_cb()
{
    $setting = get_option('loggedout_text');
    ?><input type="text" name="loggedout_text" value="<?php echo isset( $setting ) ? esc_attr( $setting ) : ''; ?>"><?php
}

add_action('admin_init', 'add_settings');

function form_shortcode($atts) {
global $current_user, $user_login;
      get_currentuserinfo();

  if(!$user_login) {
    return "<a href='/wp-login.php' >".get_option("loggedout_text")."</a>";
  }

  $email = $current_user->display_name;

  $onboarding_url = get_option("onboarding_url");
  $success_url = urlencode(get_site_url().get_option("success_page"));
  $fail_url = urlencode(get_site_url().get_option("fail_page"));
  $exists_url = urlencode(get_site_url().get_option("exists_page"));
  $btn_txt = get_option("button_text")

  $form_url = $onboarding_url."?success=".$success_url."&fail=".$fail_url."&exists=".$exists_url;

  return "
  <form action=\"".$form_url."\" method=POST type=x-www-form-urlencoded>
    <button type=submit".$btn_txt."</button>
    <input type=hidden value=\"".$email."\" name=email />
  </form>
";
}


add_shortcode('onboarding_cap', 'form_shortcode');