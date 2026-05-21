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

/* ---- ACTIVE NAV LINK on scroll ---- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

/* ---- CONTACT FORM ---- */
(function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre   = form.querySelector('#nombre');
    const email    = form.querySelector('#email');
    const mensaje  = form.querySelector('#mensaje');
    const privacidad = form.querySelector('[name="privacidad"]');

    /* basic validation */
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

    if (!privacidad.checked) {
      valid = false;
    }

    if (!valid) return;

    /* simulate send */
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Enviando…';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Enviar mensaje';
      success.classList.add('visible');

      setTimeout(() => success.classList.remove('visible'), 6000);
    }, 1200);
  });

  /* clear error color on input */
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
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

/* ---- ACTIVE NAV LINK styling ---- */
const style = document.createElement('style');
style.textContent = `.nav__link.active { color: var(--clr-primary-ddk); background: var(--clr-primary-llt); }`;
document.head.appendChild(style);

/* ---- ZEN BUTTERFLIES ---- */
(function initButterflies() {
  const svgBody = `
    <path d="M50 40 Q30 8 8 20 Q0 35 15 46 Q30 58 50 40Z" opacity="0.85"/>
    <path d="M50 40 Q38 54 22 70 Q32 78 44 67 Q54 57 50 40Z" opacity="0.65"/>
    <path d="M50 40 Q70 8 92 20 Q100 35 85 46 Q70 58 50 40Z" opacity="0.85"/>
    <path d="M50 40 Q62 54 78 70 Q68 78 56 67 Q46 57 50 40Z" opacity="0.65"/>
    <ellipse cx="50" cy="40" rx="3" ry="22" opacity="0.9"/>
    <circle cx="50" cy="19" r="4.5" opacity="0.9"/>
    <path d="M47 16 Q42 9 36 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="35" cy="3" r="2.5"/>
    <path d="M53 16 Q58 9 64 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="65" cy="3" r="2.5"/>`;

  const mkSvg = () =>
    `<svg viewBox="0 0 100 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="butterfly__svg" aria-hidden="true">${svgBody}</svg>`;

  const configs = [
    {
      sel: '.hero',
      list: [
        { x:7,  y:25, sz:42, d:23, dl:0,   op:0.48, fl:0.70, c:'var(--clr-primary)'    },
        { x:80, y:15, sz:28, d:19, dl:3,   op:0.36, fl:0.52, c:'var(--clr-primary-lt)' },
        { x:12, y:68, sz:50, d:27, dl:1,   op:0.32, fl:0.80, c:'var(--clr-primary)'    },
        { x:72, y:70, sz:32, d:21, dl:6,   op:0.30, fl:0.62, c:'var(--clr-primary-lt)' },
        { x:47, y:6,  sz:22, d:16, dl:9,   op:0.26, fl:0.45, c:'var(--clr-primary-dk)' },
      ]
    },
    {
      sel: '.about',
      list: [
        { x:2,  y:30, sz:36, d:25, dl:2,   op:0.38, fl:0.70, c:'var(--clr-primary)'    },
        { x:90, y:58, sz:44, d:20, dl:4.5, op:0.36, fl:0.75, c:'var(--clr-primary-lt)' },
        { x:88, y:10, sz:26, d:18, dl:7,   op:0.26, fl:0.55, c:'var(--clr-primary)'    },
      ]
    },
    {
      sel: '.contact',
      list: [
        { x:4,  y:44, sz:34, d:24, dl:1.5, op:0.33, fl:0.68, c:'var(--clr-primary)'    },
        { x:88, y:20, sz:28, d:20, dl:5,   op:0.28, fl:0.58, c:'var(--clr-primary-lt)' },
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
