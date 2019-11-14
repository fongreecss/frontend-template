<?php
namespace Site\Mail;

/**
 * This class handles sending email with twig using the
 * wp_mail function
 */
abstract Class Mail {

    protected $recipient;
    protected $templatePath;
    protected $data;
    protected $subject;
    protected $acfField;

    public function __construct() {
    }

    public function send() {
        $headers = ['Content-Type: text/html; charset=UTF-8'];

        $context = \Timber::context();
        $context['message'] = Timber::compile_string(get_field($this->acfField, 'options'), $this->data);

        $message = \Timber::compile($this->templatePath, $context);

        wp_mail($this->recipient, $this->subject, $message, $headers);
    }

    public function setAcfField($field) {
        $this->acfField = $field;

        return $this;
    }

    public function setData($data) {
        $this->data = $data;

        return $this;
    }

    public function setSubject($subject) {
        $this->subject = $subject;

        return $this;
    }

    public function setReceipient($recipient) {
        $this->recipient = $recipient;

        return $this;
    }

    public function setTemplate($templatePath) {
        $this->templatePath = $templatePath;

        return $this;
    }
}
