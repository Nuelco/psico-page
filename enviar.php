<?php
/**
 * Envío del formulario de contacto por SMTP (Hostinger).
 * Recibe POST desde contacto.html (AJAX o envío clásico sin JS).
 *
 * Requiere config.php en la raíz (NO está en el repositorio):
 * copiar config.example.php como config.php y rellenar los datos.
 */

declare(strict_types=1);

/* Buffer de salida: absorbe cualquier byte accidental (p. ej. un BOM en
   config.php) que impediría enviar cabeceras y códigos de estado. */
ob_start();

$CONFIG_FILE = __DIR__ . '/config.php';

/* ---- helpers de respuesta (AJAX = JSON, sin JS = redirección) ---- */
function wants_json(): bool {
  $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
  return strpos($accept, 'application/json') !== false;
}
function discard_output(): void {
  while (ob_get_level() > 0) { ob_end_clean(); }
}
function respond_ok(): void {
  discard_output();
  if (wants_json()) {
    header('Content-Type: application/json');
    echo json_encode(['ok' => true]);
  } else {
    header('Location: gracias', true, 303);
  }
  exit;
}
function respond_error(int $status, string $msg): void {
  discard_output();
  http_response_code($status);
  if (wants_json()) {
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => $msg]);
  } else {
    header('Location: contacto?error=1', true, 303);
  }
  exit;
}

/* ---- solo POST ---- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond_error(405, 'Método no permitido');
}

if (!is_file($CONFIG_FILE)) {
  respond_error(500, 'Falta config.php en el servidor');
}
$config = require $CONFIG_FILE;

/* ---- honeypot: si viene relleno es un bot; fingimos éxito ---- */
if (!empty($_POST['website'])) {
  respond_ok();
}

/* ---- validación en servidor ---- */
$nombre   = trim((string)($_POST['nombre'] ?? ''));
$email    = trim((string)($_POST['email'] ?? ''));
$telefono = trim((string)($_POST['telefono'] ?? ''));
$horario  = (string)($_POST['horario'] ?? '');

$horarios = ['manana' => 'Mañana', 'tarde' => 'Tarde'];

if ($nombre === '' || strlen($nombre) > 160) respond_error(422, 'Nombre no válido');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 200) respond_error(422, 'Email no válido');
if ($telefono === '' || strlen($telefono) > 40 || !preg_match('/^[0-9+\s().-]{6,}$/', $telefono)) respond_error(422, 'Teléfono no válido');
if (!isset($horarios[$horario])) respond_error(422, 'Horario no válido');
if (empty($_POST['privacidad'])) respond_error(422, 'Debes aceptar la política de privacidad');

/* ---- construir y enviar el correo ---- */
require __DIR__ . '/php/PHPMailer/PHPMailer.php';
require __DIR__ . '/php/PHPMailer/SMTP.php';
require __DIR__ . '/php/PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);
try {
  $mail->isSMTP();
  $mail->Host       = $config['smtp_host'];      // smtp.hostinger.com
  $mail->SMTPAuth   = true;
  $mail->Username   = $config['smtp_user'];      // buzón del dominio
  $mail->Password   = $config['smtp_pass'];
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  $mail->Port       = $config['smtp_port'];      // 465
  $mail->CharSet    = 'UTF-8';

  $mail->setFrom($config['smtp_user'], $config['from_name']);
  $mail->addAddress($config['mail_to']);
  $mail->addReplyTo($email, $nombre);

  $mail->Subject = 'Nueva solicitud de cita — ' . $nombre;
  $mail->Body =
    "Has recibido una nueva solicitud de cita desde la web:\n\n" .
    "Nombre:    {$nombre}\n" .
    "Email:     {$email}\n" .
    "Teléfono:  {$telefono}\n" .
    "Horario:   {$horarios[$horario]}\n\n" .
    "Enviado el " . date('d/m/Y \a \l\a\s H:i') . ".\n" .
    "Puedes responder directamente a este correo para contestar.";

  $mail->send();
  respond_ok();
} catch (Exception $e) {
  error_log('[enviar.php] ' . $mail->ErrorInfo);
  respond_error(502, 'No se pudo enviar el mensaje');
}
