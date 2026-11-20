(() => {
  const body = document.body;
  const theme = document.getElementById('themeBtn');
  const rtl = document.getElementById('rtlBtn');
  const menu = document.getElementById('menuBtn');
  const nav = document.getElementById('navlinks');

  // ================= THEME & DIRECTION PERSISTENCE =================
  let savedTheme = 'light';
  let savedDir = 'ltr';
  try {
    savedTheme = localStorage.getItem('ll-theme') || 'light';
    savedDir = localStorage.getItem('ll-dir') || 'ltr';
  } catch (e) { }

  if (savedTheme === 'dark') body.classList.add('dark');
  body.dir = savedDir;

  if (theme) {
    theme.addEventListener('click', () => {
      body.classList.toggle('dark');
      try {
        localStorage.setItem('ll-theme', body.classList.contains('dark') ? 'dark' : 'light');
      } catch (e) { }
    });
  }

  const updateRtlLabel = () => {
    if (!rtl) return;
    const label = rtl.querySelector('.tool-label');
    if (label) {
      label.textContent = body.dir.toUpperCase() + ' / ' + (body.dir === 'rtl' ? 'LTR' : 'RTL');
    }
  };

  if (rtl) {
    rtl.addEventListener('click', () => {
      body.dir = body.dir === 'rtl' ? 'ltr' : 'rtl';
      try {
        localStorage.setItem('ll-dir', body.dir);
      } catch (e) { }
      updateRtlLabel();
    });
  }
  updateRtlLabel();

  // ================= MOBILE NAVIGATION MENU =================
  if (menu && nav) {
    menu.addEventListener('click', () => {
      nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(el =>
      el.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 1050px)').matches) {
          nav.classList.remove('open');
          menu.setAttribute('aria-expanded', 'false');
        }
      })
    );
  }

  // ================= SCROLL REVEAL ANIMATION =================
  const revealObserver = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      }),
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.setProperty('--reveal-delay', (i % 4) * 90 + 'ms');
    revealObserver.observe(el);
  });

  // ================= IMAGE & BACKGROUND FALLBACKS =================
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener(
      'error',
      () => {
        img.classList.add('image-failed');
        img.alt = img.alt || 'Office furniture image';
        img.style.opacity = '0';
        img.parentElement.classList.add('image-fallback');
      },
      { once: true }
    );
  });

  document.querySelectorAll('[style*="background-image"]').forEach(el => {
    const match = (el.getAttribute('style') || '').match(/url\(["']?(.*?)["']?\)/);
    if (match && match[1]) {
      const probe = new Image();
      probe.onerror = () => {
        el.style.backgroundImage =
          'radial-gradient(circle at 75% 20%,rgba(46,133,124,.42),transparent 30%),linear-gradient(120deg,#122422,#1b5e57 58%,#0e1918)';
      };
      probe.src = match[1];
    }
  });

  // ================= CONTACT FORM VALIDATION =================
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const status = document.getElementById('formStatus');
      status.textContent =
        'Thank you. Your enquiry details are validated. Connect this form to your email or CRM service to receive the submission.';
      status.style.color = 'var(--accent)';
      form.reset();
    });
  }

  // ================= DEDICATED QUOTE FORM VALIDATION & PREFILL =================
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    const params = new URLSearchParams(window.location.search);
    const productMap = {
      '1': 'Ergonomic task chairs',
      '2': 'Modular workstations',
      '3': 'Executive desks & suites',
      '4': 'Conference & boardroom',
      '5': 'Lounge & acoustic pods',
      '6': 'Storage, lockers & filing'
    };

    const productId = params.get('product');
    if (productId && productMap[productId]) {
      const targetName = productMap[productId];
      quoteForm.querySelectorAll('input[name="categories"]').forEach(cb => {
        if (cb.value === targetName) cb.checked = true;
      });
    }

    if (params.get('from') === 'cart') {
      try {
        const storedCart = JSON.parse(localStorage.getItem('ll-cart') || '[]');
        if (storedCart.length) {
          const names = storedCart.map(item => item.name);
          quoteForm.querySelectorAll('input[name="categories"]').forEach(cb => {
            if (names.includes(cb.value)) cb.checked = true;
          });
          const msgBox = document.getElementById('quoteMessage');
          if (msgBox && !msgBox.value) {
            msgBox.value =
              'Shortlisted furniture categories:\n' +
              storedCart.map(x => `- ${x.name} (Qty sets: ${x.qty})`).join('\n');
          }
        }
      } catch (e) { }
    }

    quoteForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!quoteForm.reportValidity()) return;
      const status = document.getElementById('quoteStatus');
      status.textContent =
        'Thank you. Your workspace quote request has been validated. Our commercial team will respond with an itemized BOQ proposal.';
      status.style.color = 'var(--accent)';
      quoteForm.reset();
    });
  }

  // ================= PRODUCT QUOTE SHORTLIST CART =================
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  const cartItems = document.getElementById('cartItems');
  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem('ll-cart') || '[]');
  } catch (e) { }

  const save = () => {
    try {
      localStorage.setItem('ll-cart', JSON.stringify(cart));
    } catch (e) { }
    render();
  };

  const open = () => {
    if (!drawer) return;
    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-lock');
  };

  const close = () => {
    if (!drawer) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-lock');
  };

  function render() {
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = cart.reduce((n, x) => n + x.qty, 0);
    });
    if (!cartItems) return;
    if (!cart.length) {
      cartItems.innerHTML = '<p class="muted">Your shortlist is empty. Add a furniture category to get started.</p>';
      return;
    }
    cartItems.innerHTML = cart
      .map(
        (x, i) => `
      <div class="cart-line">
        <div>
          <strong>${x.name}</strong>
          <small>Furniture category enquiry</small>
        </div>
        <div class="qty-control">
          <button type="button" data-dec="${i}" aria-label="Decrease quantity">−</button>
          <b>${x.qty}</b>
          <button type="button" data-inc="${i}" aria-label="Increase quantity">+</button>
          <button type="button" class="remove-item" data-remove="${i}" aria-label="Remove item">×</button>
        </div>
      </div>`
      )
      .join('');
  }

  document.querySelectorAll('.add-cart').forEach(btn =>
    btn.addEventListener('click', () => {
      const name = btn.dataset.product;
      const found = cart.find(x => x.name === name);
      if (found) found.qty++;
      else cart.push({ name, qty: 1 });
      save();
      btn.textContent = 'Added ✓';
      setTimeout(() => (btn.textContent = 'Add to quote +'), 1200);
    })
  );

  document.querySelectorAll('.cart-open').forEach(b => b.addEventListener('click', open));
  document.querySelectorAll('.cart-close').forEach(b => b.addEventListener('click', close));
  if (backdrop) backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  if (cartItems) {
    cartItems.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      const i = Number(b.dataset.inc ?? b.dataset.dec ?? b.dataset.remove);
      if (b.dataset.inc !== undefined) cart[i].qty++;
      if (b.dataset.dec !== undefined) cart[i].qty = Math.max(1, cart[i].qty - 1);
      if (b.dataset.remove !== undefined) cart.splice(i, 1);
      save();
    });
  }

  const clear = document.getElementById('clearCart');
  if (clear) {
    clear.addEventListener('click', () => {
      cart = [];
      save();
    });
  }

  const checkout = document.getElementById('checkoutCart');
  if (checkout) {
    checkout.addEventListener('click', () => {
      if (!cart.length) {
        cartItems.innerHTML =
          '<p class="muted">Add at least one furniture category before sending your quote request.</p>';
        return;
      }
      window.location.href = 'get-quote.html?from=cart';
    });
  }

  render();
})();

// ================= BACK TO TOP CONTROL =================
document.addEventListener('click', function (event) {
  const control = event.target.closest('.back-to-top');
  if (control) {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  }
});
