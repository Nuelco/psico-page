/* ============================================================
   SEILA ZARZOSO — main.js
   Scroll reveals, nav behaviour, form, mobile menu
   ============================================================ */

/* ---- NAV: scroll state + mobile menu ---- */
(function initNav() {
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('navBurger');
  const mobile  = document.getElementById('navMobile');
  let   mobileOpen = false;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  burger.addEventListener('click', () => {
    mobileOpen = !mobileOpen;
    mobile.classList.toggle('open', mobileOpen);
    burger.setAttribute('aria-expanded', mobileOpen);
    /* animate burger → X */
    const spans = burger.querySelectorAll('span');
    if (mobileOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  /* close mobile menu on link click */
  mobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileOpen = false;
      mobile.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      const spans = burger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });
})();

/* ---- SCROLL REVEAL ---- */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* ---- ACTIVE NAV LINK by current page URL ---- */
(function initActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
})();

/* ---- CONTACT FORM ---- */
(function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const error   = document.getElementById('formError');
  if (!form) return;

  /* generate math captcha */
  let captchaAnswer = 0;
  function newCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    captchaAnswer = a + b;
    document.getElementById('captchaQuestion').textContent = `${a} + ${b}`;
    form.querySelector('#captcha').value = '';
  }
  newCaptcha();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre     = form.querySelector('#nombre');
    const email      = form.querySelector('#email');
    const mensaje    = form.querySelector('#mensaje');
    const privacidad = form.querySelector('[name="privacidad"]');
    const honeypot   = form.querySelector('[name="website"]');
    const captcha    = form.querySelector('#captcha');
    const captchaHint = document.getElementById('captchaHint');

    if (error) error.classList.remove('visible');

    /* honeypot: bots fill this, humans don't. Esta parte es para evitar envíos automáticos*/
    if (honeypot && honeypot.value) return;

    let valid = true;

    [nombre, email, mensaje].forEach(field => {
      const isEmpty = !field.value.trim();
      field.style.borderColor = isEmpty ? '#e87070' : '';
      if (isEmpty) valid = false;
    });

    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#e87070';
      valid = false;
    }

    if (!privacidad.checked) valid = false;

    /* captcha validation */
    const captchaVal = parseInt(captcha.value, 10);
    if (!captcha.value || captchaVal !== captchaAnswer) {
      captcha.style.borderColor = '#e87070';
      captchaHint.textContent = 'Respuesta incorrecta. Inténtalo de nuevo.';
      newCaptcha();
      captcha.value = '';
      valid = false;
    } else {
      captcha.style.borderColor = '';
      captchaHint.textContent = '';
    }

    if (!valid) return;

    /* envío real al endpoint del formulario (Formspark) vía AJAX */
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Enviando…';

    /* Construimos el cuerpo como urlencoded (Formspark trata multipart/FormData
       como vacío en peticiones AJAX). No enviamos campos internos de control. */
    const data = new FormData(form);
    data.delete('captcha');
    data.delete('website');
    data.delete('_redirect');
    const params = new URLSearchParams();
    for (const [k, v] of data.entries()) params.append(k, v);

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: params,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (!res.ok) throw new Error('Respuesta ' + res.status);
      form.reset();
      newCaptcha();
      success.classList.add('visible');
      setTimeout(() => success.classList.remove('visible'), 6000);
    } catch (err) {
      console.error('[form] ❌ ERROR al enviar:', err);
      if (error) error.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Enviar mensaje';
    }
  });

  /* clear error styles on input */
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
      if (field.id === 'captcha') document.getElementById('captchaHint').textContent = '';
    });
  });
})();

/* ---- SMOOTH SCROLL for anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 24;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- FAQ ACORDEÓN ---- */
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq__item');
    const isOpen = item.classList.contains('open');
    // cierra todos los del mismo grupo
    item.closest('.faq__group').querySelectorAll('.faq__item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ---- ACTIVE NAV LINK styling ---- */
const style = document.createElement('style');
style.textContent = `.nav__link.active { color: var(--clr-primary-ddk); background: var(--clr-primary-llt); }`;
document.head.appendChild(style);

/* ---- ZEN BUTTERFLIES ---- */
(function initButterflies() {
  const svgBody = `
    <path d="M50 45 C45 30 25 10 8 18 C0 30 8 48 28 50 C42 52 50 45 50 45Z"
          fill="currentColor" opacity="0.82"/>
    <path d="M50 48 C44 58 28 74 18 69 C10 64 14 52 28 50 C40 48 50 48 50 48Z"
          fill="currentColor" opacity="0.64"/>
    <path d="M50 45 C55 30 75 10 92 18 C100 30 92 48 72 50 C58 52 50 45 50 45Z"
          fill="currentColor" opacity="0.82"/>
    <path d="M50 48 C56 58 72 74 82 69 C90 64 86 52 72 50 C60 48 50 48 50 48Z"
          fill="currentColor" opacity="0.64"/>
    <ellipse cx="50" cy="46" rx="2.8" ry="16" fill="currentColor" opacity="0.9"/>
    <circle cx="50" cy="28" r="3.5" fill="currentColor" opacity="0.9"/>
    <path d="M48 25 Q42 15 35 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="34" cy="8" r="2.5" fill="currentColor"/>
    <path d="M52 25 Q58 15 65 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="66" cy="8" r="2.5" fill="currentColor"/>`;

  const mkSvg = () =>
    `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" class="butterfly__svg" aria-hidden="true">${svgBody}</svg>`;

  const configs = [
    {
      sel: '.hero',
      list: [
        { x:7,  y:25, sz:42, d:23, dl:0,   op:0.65, fl:0.70, c:'var(--clr-primary)'    },
        { x:80, y:15, sz:28, d:19, dl:3,   op:0.52, fl:0.52, c:'var(--clr-primary-lt)' },
        { x:12, y:68, sz:50, d:27, dl:1,   op:0.50, fl:0.80, c:'var(--clr-primary)'    },
        { x:72, y:70, sz:32, d:21, dl:6,   op:0.48, fl:0.62, c:'var(--clr-primary-lt)' },
        { x:47, y:6,  sz:22, d:16, dl:9,   op:0.42, fl:0.45, c:'var(--clr-primary-dk)' },
      ]
    },
    {
      sel: '.about',
      list: [
        { x:2,  y:30, sz:36, d:25, dl:2,   op:0.55, fl:0.70, c:'var(--clr-primary)'    },
        { x:90, y:58, sz:44, d:20, dl:4.5, op:0.52, fl:0.75, c:'var(--clr-primary-lt)' },
        { x:88, y:10, sz:26, d:18, dl:7,   op:0.42, fl:0.55, c:'var(--clr-primary)'    },
      ]
    },
    {
      sel: '.contact',
      list: [
        { x:4,  y:44, sz:34, d:24, dl:1.5, op:0.50, fl:0.68, c:'var(--clr-primary)'    },
        { x:88, y:20, sz:28, d:20, dl:5,   op:0.45, fl:0.58, c:'var(--clr-primary-lt)' },
      ]
    }
  ];

  configs.forEach(({ sel, list }) => {
    const section = document.querySelector(sel);
    if (!section) return;

    const scene = document.createElement('div');
    scene.className = 'butterfly-scene';
    scene.setAttribute('aria-hidden', 'true');

    list.forEach(b => {
      const el = document.createElement('div');
      el.className = 'butterfly';
      el.style.cssText =
        `--bx:${b.x}%;--by:${b.y}%;--bsize:${b.sz}px;--bd:${b.d}s;` +
        `--bdelay:${b.dl}s;--bopacity:${b.op};--bflutter:${b.fl}s;--bclr:${b.c}`;
      el.innerHTML = mkSvg();
      scene.appendChild(el);
    });

    section.insertBefore(scene, section.firstChild);
  });
})();

/* ---- COOKIE CONSENT (RGPD / LSSI / Guía AEPD) ----
   Bloquea contenido de terceros (Google Maps + reseñas de Google vía Elfsight)
   hasta que el usuario da su consentimiento. Rechazar es tan fácil como aceptar.
   El consentimiento se guarda en localStorage (almacenamiento técnico exento). */
(function initCookieConsent() {
  const KEY = 'sz-cookie-consent';            // 'accepted' | 'rejected'
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const set = (v) => { try { localStorage.setItem(KEY, v); } catch (e) {} };

  /* --- cargar los terceros una vez hay consentimiento --- */
  function loadThirdParty() {
    /* iframes diferidos (Google Maps) */
    document.querySelectorAll('iframe[data-src]').forEach(f => {
      f.src = f.getAttribute('data-src');
      f.removeAttribute('data-src');
    });
    /* widget de reseñas (Elfsight) */
    if (document.querySelector('[data-elfsight]') && !document.getElementById('elfsight-platform')) {
      const s = document.createElement('script');
      s.src = 'https://elfsightcdn.com/platform.js';
      s.async = true;
      s.id = 'elfsight-platform';
      document.body.appendChild(s);
    }
    /* ocultar carteles de "permitir contenido" */
    document.querySelectorAll('.consent-block').forEach(b => b.classList.add('consent-loaded'));
  }

  /* --- banner --- */
  function buildBanner() {
    const el = document.createElement('div');
    el.className = 'cookie-banner';
    el.id = 'cookieBanner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Aviso de cookies');
    el.innerHTML = `
      <div class="cookie-banner__inner">
        <div class="cookie-banner__text">
          <p class="cookie-banner__title">Tu privacidad</p>
          <p>Usamos cookies técnicas propias (necesarias) y, solo con tu permiso, cookies de terceros para mostrar el mapa de Google Maps y las reseñas de Google. Puedes aceptarlas, rechazarlas o leer más en la <a href="cookies.html">política de cookies</a>.</p>
        </div>
        <div class="cookie-banner__actions">
          <button type="button" class="btn cookie-banner__btn cookie-banner__btn--reject" id="cookieReject">Rechazar</button>
          <button type="button" class="btn btn--primary cookie-banner__btn" id="cookieAccept">Aceptar</button>
        </div>
      </div>`;
    return el;
  }

  let banner = null;
  function showBanner() {
    if (!banner) {
      banner = buildBanner();
      document.body.appendChild(banner);
      banner.querySelector('#cookieAccept').addEventListener('click', accept);
      banner.querySelector('#cookieReject').addEventListener('click', reject);
    }
    requestAnimationFrame(() => banner.classList.add('visible'));
  }
  function hideBanner() { if (banner) banner.classList.remove('visible'); }

  /* --- botón flotante para reabrir/cambiar preferencias (retirar consentimiento) --- */
  function showReopen() {
    if (document.getElementById('cookieReopen')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'cookieReopen';
    b.className = 'cookie-reopen';
    b.setAttribute('aria-label', 'Configurar cookies');
    b.title = 'Configurar cookies';
    b.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/><circle cx="9" cy="11" r="1"/><circle cx="14" cy="15" r="1"/><circle cx="15" cy="9" r="1"/></svg>`;
    b.addEventListener('click', showBanner);
    document.body.appendChild(b);
  }

  function accept() { set('accepted'); hideBanner(); loadThirdParty(); showReopen(); }
  function reject() { set('rejected'); hideBanner(); showReopen(); }

  /* botones "Permitir y ver…" dentro de cada bloque bloqueado = otorgar consentimiento */
  document.querySelectorAll('.consent-ph__btn').forEach(btn => {
    btn.addEventListener('click', accept);
  });

  /* estado inicial */
  const decision = get();
  if (decision === 'accepted') { loadThirdParty(); showReopen(); }
  else if (decision === 'rejected') { showReopen(); }
  else { showBanner(); }
})();

/* ---- WHATSAPP WIDGET ---- */
(function initWhatsApp() {
  const btn     = document.getElementById('waBtn');
  const chat    = document.getElementById('waChat');
  const closeBtn= document.getElementById('waChatClose');
  const typing  = document.getElementById('waTyping');
  const msg     = document.getElementById('waMsg');
  const dot     = document.getElementById('waBtnDot');
  if (!btn) return;

  let open = false;
  let shown = false;

  function openChat() {
    open = true;
    chat.classList.add('open');
    chat.removeAttribute('aria-hidden');
    btn.setAttribute('aria-expanded', 'true');
    if (dot) dot.style.display = 'none';

    if (!shown) {
      typing.style.display = 'flex';
      msg.classList.remove('visible');
      setTimeout(() => {
        typing.style.display = 'none';
        msg.classList.add('visible');
        shown = true;
      }, 1600);
    }
  }

  function closeChat() {
    open = false;
    chat.classList.remove('open');
    chat.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => open ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  document.addEventListener('click', (e) => {
    if (open && !document.getElementById('waWidget').contains(e.target)) closeChat();
  });
})();
