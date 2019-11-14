<?php
namespace Site\Forms;

/**
 * This class handles form submits
 *
 * Each form requires 2 hidden fields to work correctly.
 *  - action (the value has to be the same as the name)
 *  - nonce (value is {{ options.nonce }})
 *  - blog_id (Optional on multisite network, value is {{ function('get_current_blog_id') }})
 */
abstract Class Form {

    public function __construct($name) {
        add_action("wp_ajax_{$name}", [$this, 'formHandler']);
        add_action("wp_ajax_nopriv_{$name}", [$this, 'formHandler']);
    }

    /**
     * Handle the form
     *
     * @return void
     */
    public abstract function formHandler(): void;

    /**
     * Retrieves the submitter IP
     *
     * @return string
     */
    protected function getUserIp(): string {
        $ip = '';

        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }

        return $ip;
    }

    /**
     * Verifies that the supplied nonce is valid
     *
     * The nonce is generated in the StarterSite class.
     * You can use the nonce in the template by using
     * {{ options.nonce }}
     *
     * @return void
     */
    protected function verifyNonce():void {
        $nonce = $_POST['nonce'];

        if (! wp_verify_nonce($nonce, 'form-submit') ) {
            wp_die();
        }
    }

    /**
     * Switched to the correct blog id
     *
     * This prevents for CPT being stored in the
     * wrong network site
     *
     * Optional, only for mulstisite network installs
     *
     * @return void
     */
    protected function switchToBlog():void {
        if (is_multisite()) {
            switch_to_blog(intval($_POST['blog_id']));
        }
    }
}
