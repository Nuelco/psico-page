# Guía de despliegue en Hostinger — seilazarzoso.es

Rama a desplegar: **`hostinger-form`** (o `desarrollo` una vez fusionada esta rama en ella).
GitHub Pages (rama `preproduccion`) queda solo como preview interno; no ejecuta PHP.

## 1. Contratar y preparar el hosting
1. Contratar el plan **Premium** de Hostinger. Al elegir la ubicación del servidor, seleccionar **Europa** (p. ej. Francia o Países Bajos) — importante para el RGPD.
2. Reclamar el **dominio gratis**: `seilazarzoso.es`. Si se registra con Hostinger, el DNS queda configurado solo.
3. En hPanel → **Correos** → crear el buzón `web@seilazarzoso.es` y apuntar su contraseña (solo se usa para que la web envíe los avisos de cita).

## 2. Subir la web
Opción A (recomendada) — despliegue desde GitHub:
1. hPanel → Avanzado → **GIT**.
2. Repositorio: `https://github.com/Nuelco/psico-page.git`, rama `hostinger-form`, directorio `public_html`.
3. Pulsar "Crear" y luego "Desplegar". Para futuras actualizaciones: push a la rama y "Desplegar" de nuevo (o configurar el webhook de auto-deploy que ofrece Hostinger).

Opción B — a mano:
1. Descargar el ZIP de la rama desde GitHub (Code → Download ZIP).
2. hPanel → **Administrador de archivos** → `public_html` → subir y extraer el ZIP (el contenido del repositorio debe quedar directamente en `public_html`, no dentro de una subcarpeta).

## 3. Configurar el envío del formulario
1. En el Administrador de archivos, copiar `config.example.php` como **`config.php`** (misma carpeta raíz).
2. Editar `config.php`: poner la contraseña del buzón en `smtp_pass` (y ajustar `smtp_user`/`mail_to` si cambian).
3. `config.php` no se sube nunca al repositorio (está en .gitignore) y el `.htaccess` bloquea su lectura desde el navegador.

## 4. SSL y dominio
1. hPanel → **SSL** → instalar el certificado (Let's Encrypt, gratis) para seilazarzoso.es. Suele instalarse solo al asignar el dominio.
2. El `.htaccess` ya fuerza HTTPS y redirige www → sin www; no hay que activar nada más.

## 5. Comprobaciones tras desplegar
- [ ] https://seilazarzoso.es carga con candado (y http:// redirige a https://).
- [ ] Enviar el **formulario de contacto** con datos reales → llega el email a szarzoso.psico@gmail.com y la web redirige a gracias.html. Responder al correo recibido debe responder al paciente.
- [ ] Probar un envío con un campo vacío → muestra el error, no envía.
- [ ] El mapa de contacto pide consentimiento y carga tras aceptar.
- [ ] Banner de cookies: aceptar, rechazar y reabrir con el botón inferior izquierdo.
- [ ] https://seilazarzoso.es/noexiste → muestra la 404 propia.
- [ ] Cabeceras: comprobar en https://securityheaders.com (nota A esperable).

## 6. Después del lanzamiento
1. Fusionar `hostinger-form` en `desarrollo` y borrar la rama.
2. **Google Search Console**: dar de alta seilazarzoso.es y enviar `sitemap.xml`.
3. **Google Business Profile**: poner https://seilazarzoso.es como sitio web del perfil.
4. Si Formspark/Botpoison ya no se usan, dar de baja esas cuentas.
