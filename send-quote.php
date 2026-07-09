<?php
/**
 * Gonzales Embroidery — Quote Form Handler
 * Sends the "Get a Quote" form on index.html straight to the studio inbox.
 *
 * Requirements: works on any standard PHP hosting (e.g. Hostinger shared hosting)
 * with PHP's built-in mail() function enabled — no extra setup needed.
 *
 * If mail() is disabled on your plan, swap the sendMail() call below for
 * PHPMailer + SMTP (Hostinger also provides SMTP credentials in hPanel > Emails).
 */

header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
    exit;
}

// ---- Where quote requests get delivered ----
$to = 'order@gonzalesembroidery.com';

// ---- Honeypot spam trap (hidden field named "website") ----
if (!empty($_POST['website'])) {
    // Pretend success so bots don't learn anything, but don't actually send.
    echo json_encode(['ok' => true]);
    exit;
}

// ---- Collect + sanitize input ----
function clean($value) {
    $value = trim($value ?? '');
    // Strip anything that looks like it's trying to inject extra mail headers
    $value = str_replace(["\r", "\n"], ' ', $value);
    return $value;
}

$name    = clean($_POST['name'] ?? '');
$email   = clean($_POST['email'] ?? '');
$company = clean($_POST['company'] ?? '');
$details = trim($_POST['details'] ?? '');

// ---- Validate ----
$errors = [];
if ($name === '') $errors[] = 'name';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($details === '') $errors[] = 'details';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Please fill out your name, a valid email, and the project details.']);
    exit;
}

// ---- Build the email ----
$subject = 'New Quote Request — ' . $name;

$bodyLines = [
    'New quote request from gonzalesembroidery.com',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
];
if ($company !== '') {
    $bodyLines[] = 'Company / Team: ' . $company;
}
$bodyLines[] = '';
$bodyLines[] = 'Details:';
$bodyLines[] = $details;

$body = implode("\n", $bodyLines);

// Use the site's own domain for the From address (helps with spam filters);
// Reply-To is the customer's email so you can just hit "reply".
$hostDomain = isset($_SERVER['HTTP_HOST']) ? preg_replace('/[^a-zA-Z0-9.\-]/', '', $_SERVER['HTTP_HOST']) : 'gonzalesembroidery.com';

$headers = [];
$headers[] = 'From: Gonzales Embroidery Website <no-reply@' . $hostDomain . '>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'The message could not be sent. Please email us directly at order@gonzalesembroidery.com.']);
}
