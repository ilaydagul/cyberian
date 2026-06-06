/* Cyberian Studio — theme behaviour */
(function () {
  'use strict';

  /* ---------- STICKY / SHRINK HEADER ---------- */
  var header = document.getElementById('header');
  if (header) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          header.classList.toggle('shrink', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- MOBILE MENU ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMobile() {
    if (!burger) return;
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobile);
    });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobile(); });

  /* ---------- CATEGORY TABS (home) ---------- */
  var catTabs = document.getElementById('catTabs');
  if (catTabs) {
    var panels = document.querySelectorAll('.cat-panel');
    var countEl = document.getElementById('collectionCount');
    function showPanel(id) {
      panels.forEach(function (p) {
        var match = p.getAttribute('data-panel') === id;
        p.hidden = !match;
        if (match && countEl) {
          var n = parseInt(p.getAttribute('data-count'), 10) || 0;
          countEl.textContent = n + (n === 1 ? ' Piece' : ' Pieces');
        }
      });
    }
    catTabs.querySelectorAll('.cat-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        catTabs.querySelectorAll('.cat-tab').forEach(function (b) { b.classList.toggle('active', b === btn); });
        showPanel(btn.getAttribute('data-cat'));
      });
    });
    var first = catTabs.querySelector('.cat-tab.active') || catTabs.querySelector('.cat-tab');
    if (first) showPanel(first.getAttribute('data-cat'));
  }

  /* ---------- SCROLL REVEAL ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- PRODUCT: image thumbs ---------- */
  var mainImg = document.getElementById('ProductMainImage');
  document.querySelectorAll('.thumb-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (mainImg) mainImg.src = btn.getAttribute('data-full');
      document.querySelectorAll('.thumb-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
    });
  });

  /* ---------- PRODUCT: variant selection ---------- */
  var variantsJson = document.getElementById('ProductVariantsJson');
  var variantIdField = document.getElementById('VariantId');
  if (variantsJson && variantIdField) {
    var variants = JSON.parse(variantsJson.textContent);
    var optionSelects = Array.prototype.slice.call(document.querySelectorAll('.variant-select'));
    var priceEl = document.getElementById('ProductPrice');
    var addBtn = document.getElementById('AddToCartBtn');
    var addText = document.getElementById('AddToCartText');

    function money(cents) {
      try {
        return new Intl.NumberFormat(document.documentElement.lang || 'en', {
          style: 'currency',
          currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || 'EUR'
        }).format(cents / 100);
      } catch (e) { return (cents / 100).toFixed(2); }
    }

    function currentVariant() {
      if (!optionSelects.length) return variants[0];
      var chosen = optionSelects.map(function (s) { return s.value; });
      return variants.find(function (v) {
        return chosen.every(function (val, i) { return v.options[i] === val; });
      });
    }

    function updateVariant() {
      var v = currentVariant();
      if (!v) return;
      variantIdField.value = v.id;
      if (priceEl) {
        var html = '';
        if (v.compare_at_price && v.compare_at_price > v.price) {
          html += '<span class="was">' + money(v.compare_at_price) + '</span>';
        }
        html += money(v.price);
        priceEl.innerHTML = html;
      }
      if (addBtn && addText) {
        if (v.available) { addBtn.disabled = false; addText.textContent = 'Add to Cart'; }
        else { addBtn.disabled = true; addText.textContent = 'Sold Out'; }
      }
    }
    optionSelects.forEach(function (s) { s.addEventListener('change', updateVariant); });
    updateVariant();
  }
})();
