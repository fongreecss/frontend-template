<?php
namespace Site\Forms;

class SampleForm extends \Site\Forms\Form {

    /**
     * Form name, used within Wordpress
     *
     * This value has to be unique and passed via
     * the 'action' field, or the formHandler
     * will not be called.
     *
     * @string
     */
    private $name = 'sample';

    public function __construct()
    {
        parent::__construct($this->name);
    }

    public function formHandler(): void {
        $this->verifyNonce();

        // switch to the right blog
        $this->switchToBlog();

        // Sanitize fields sanitize_text_field($_POST['name']
        // Sanitize fields sanitize_email_field($_POST['email']

        // Return error if needed
        // wp_send_json_error(['error' => 'Email already used'], 400);

        // Send success response
        wp_send_json(['success' => 'ok']);
    }
}
