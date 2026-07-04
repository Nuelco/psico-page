<?php
/**
 * Configuración del envío de correo del formulario (Hostinger).
 *
 * INSTRUCCIONES:
 * 1. Copia este archivo como `config.php` (en la raíz, junto a enviar.php).
 * 2. Rellena los datos del buzón creado en Hostinger (hPanel → Correos).
 * 3. NUNCA subas config.php al repositorio (ya está en .gitignore).
 */
return [
  // Servidor SMTP de Hostinger
  'smtp_host' => 'smtp.hostinger.com',
  'smtp_port' => 465,

  // Buzón del dominio creado en Hostinger, p. ej. web@seilazarzoso.es
  'smtp_user' => 'web@seilazarzoso.es',
  'smtp_pass' => 'CONTRASEÑA-DEL-BUZÓN',

  // Nombre del remitente que verá Seila en su bandeja
  'from_name' => 'Web seilazarzoso.es',

  // Dirección que recibe las solicitudes de cita
  'mail_to'   => 'szarzoso.psico@gmail.com',
];
