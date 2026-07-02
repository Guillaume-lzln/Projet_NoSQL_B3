/* Panopli — front de démonstration (vanilla JS, hash-routing).
   Consomme l'API Express qui exploite les quatre bases du projet. */
'use strict';

/* ── Utilitaires ─────────────────────────────────────────────────── */

const $ = (sel, el = document) => el.querySelector(sel);
const app = $('#app');

const EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const eur = (n) => EUR.format(n);
const eurCents = (c) => EUR.format(c / 100);

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

async function api(path, options) {
  const res = await fetch(path, options);
  let data = null;
  try { data = await res.json(); } catch { /* réponse vide */ }
  if (!res.ok) throw new Error((data && data.erreur) || `Erreur ${res.status}`);
  return data;
}

function frDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtSpec(v) {
  if (v === true) return 'Oui';
  if (v === false) return 'Non';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

function deliveryDate(days) {
  const d = new Date(Date.now() + days * 86400000);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // pas de livraison le dimanche
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function toast(message) {
  const el = $('#toast');
  el.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>${escapeHtml(message)}`;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ── Visuels produits (pas de photos : pictogrammes par rayon) ───── */

const ICONS = {
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4.5" height="6" rx="2"/><rect x="16.5" y="14" width="4.5" height="6" rx="2"/>',
  watch: '<circle cx="12" cy="12" r="5.5"/><path d="M12 9.5V12l1.8 1.3M9.5 6.7 10 2.5h4l.5 4.2M9.5 17.3l.5 4.2h4l.5-4.2"/>',
  tablet: '<rect x="4.5" y="2.5" width="15" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  screen: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M9 20.5h6M12 17v3.5"/>',
  laptop: '<rect x="4" y="4.5" width="16" height="11" rx="1.5"/><path d="M2 19.5h20l-1.5-3h-17z"/>',
  mouse: '<rect x="7.5" y="3" width="9" height="18" rx="4.5"/><path d="M12 6.5v3.5"/>',
  shirt: '<path d="M8.5 3.5 4 6l1.5 4 2-.8V20.5h9V9.2l2 .8L20 6l-4.5-2.5a3.5 3.5 0 0 1-7 0Z"/>',
  cup: '<path d="M5 8h11v7a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8ZM16 9.5h2a2.5 2.5 0 0 1 0 5h-2M7.5 4.5v-2M10.5 4.5v-2M13.5 4.5v-2"/>',
  lamp: '<path d="M8 3.5h8l3 8H5l3-8ZM12 11.5v7M8 20.5h8"/>',
  book: '<path d="M5 4a2 2 0 0 1 2-2h12v17.5H7A2 2 0 0 0 5 21.5V4Z"/><path d="M5 17.5A2 2 0 0 1 7 15.5h12M9 6.5h6"/>',
  gamepad: '<path d="M7 7h10a5.5 5.5 0 0 1 5.5 6.5l-.8 3.7a2.6 2.6 0 0 1-4.7 1L15.5 16h-7l-1.5 2.2a2.6 2.6 0 0 1-4.7-1l-.8-3.7A5.5 5.5 0 0 1 7 7Z"/><path d="M8 10.5v3M6.5 12h3M15.5 11h.01M17.5 13h.01"/>',
  dumbbell: '<path d="M2.5 12h3M18.5 12h3M8.5 12h7"/><rect x="5" y="7.5" width="3.5" height="9" rx="1"/><rect x="15.5" y="7.5" width="3.5" height="9" rx="1"/>',
  shoe: '<path d="M2.5 17.5h19v-1.8c0-1.5-1.2-2.6-2.7-2.9l-4.3-.9-3.4-3.4c-.6.9-1.9 1.6-3.1 1.4l-1.5 2-4 1.1v4.5Z"/><path d="M11 12l1.2 1.2M13.2 10.6l1.2 1.2"/>',
  keyboard: '<rect x="2.5" y="7" width="19" height="10" rx="2"/><path d="M6 10.5h.01M9 10.5h.01M12 10.5h.01M15 10.5h.01M18 10.5h.01M7 13.5h10"/>',
  webcam: '<circle cx="12" cy="9.5" r="6"/><circle cx="12" cy="9.5" r="2.3"/><path d="M12 15.5v2M8.5 21h7l-1-2.5h-5l-1 2.5Z"/>',
};

// Certains produits d'une même sous-catégorie méritent leur propre pictogramme.
const TAG_ICON = { clavier: 'keyboard', webcam: 'webcam', sneakers: 'shoe', baskets: 'shoe' };

const CATEGORY_ART = {
  'high-tech': { hue: 215, icon: 'phone' },
  informatique: { hue: 245, icon: 'laptop' },
  mode: { hue: 335, icon: 'shirt' },
  maison: { hue: 30, icon: 'cup' },
  livres: { hue: 160, icon: 'book' },
  'jeux-loisirs': { hue: 270, icon: 'gamepad' },
  sport: { hue: 195, icon: 'dumbbell' },
};

const SUBCATEGORY_ICON = {
  audio: 'headphones', wearables: 'watch', tablettes: 'tablet', tv: 'screen',
  ecrans: 'screen', peripheriques: 'mouse', luminaires: 'lamp',
};

function artFor(p) {
  const base = CATEGORY_ART[p.category] || { hue: 220, icon: 'phone' };
  const tagIcon = (p.tags || []).map((t) => TAG_ICON[t]).find(Boolean);
  const icon = tagIcon || SUBCATEGORY_ICON[p.subcategory] || base.icon;
  let h = 0;
  for (const ch of p.sku) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const hue = base.hue + (h % 17) - 8;
  return {
    bg: `hsl(${hue} 36% 95%)`,
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="hsl(${hue} 32% 42%)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[icon]}</svg>`,
  };
}

/* ── Étoiles de notation ─────────────────────────────────────────── */

const STAR = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6 14.9 8.6l6.6.8-4.9 4.5 1.3 6.5L12 17.2 6.1 20.4l1.3-6.5L2.5 9.4l6.6-.8L12 2.6Z"/></svg>';

function starsHTML(avg, count) {
  if (!avg) return '<span class="stars"><span style="color:#9a9ea7;font-size:12px">Aucun avis</span></span>';
  const pct = Math.round((avg / 5) * 100);
  const five = STAR.repeat(5);
  return `<span class="stars">
    <span class="stars-track">
      <span class="stars-row">${five}</span>
      <span class="stars-row stars-fill" style="width:${pct}%">${five}</span>
    </span>
    ${count != null ? `<span>(${count})</span>` : ''}
  </span>`;
}

/* ── État : utilisateur de démonstration, caches ─────────────────── */

const USER_KEY = 'panopli_user';
const getUserId = () => parseInt(localStorage.getItem(USER_KEY) || '7', 10);

let _customers = null;
async function getCustomers() {
  if (!_customers) _customers = (await api('/api/customers')).clients;
  return _customers;
}

let _products = null;
let _bySku = null;
async function getProducts() {
  if (!_products) {
    _products = (await api('/api/products')).products;
    _bySku = Object.fromEntries(_products.map((p) => [p.sku, p]));
  }
  return _products;
}

let _flash = null;
async function getFlash() {
  if (!_flash) {
    const { ventes_flash } = await api('/api/flash-sales');
    _flash = ventes_flash.map((v) => ({ ...v, deadline: Date.now() + v.finitDansSecondes * 1000 }));
  }
  return _flash;
}
const flashFor = (sku) => (_flash || []).find((f) => f.sku === sku && f.deadline > Date.now());

/* ── Panier ──────────────────────────────────────────────────────── */

async function refreshCartBadge() {
  const badge = $('#cart-badge');
  try {
    const { panier } = await api(`/api/cart/${getUserId()}`);
    const n = panier.reduce((s, l) => s + l.quantite, 0);
    badge.textContent = n;
    badge.hidden = n === 0;
  } catch { badge.hidden = true; }
}

async function addToCart(sku, quantite = 1, silent = false) {
  try {
    await api(`/api/cart/${getUserId()}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, quantite }),
    });
    if (!silent) toast('Ajouté au panier');
    refreshCartBadge();
    return true;
  } catch (e) {
    toast(e.message);
    return false;
  }
}

/* ── Compte à rebours des ventes flash ───────────────────────────── */

function fmtCountdown(ms) {
  if (ms <= 0) return 'Offre terminée';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')} min ${String(sec).padStart(2, '0')} s`;
}
setInterval(() => {
  document.querySelectorAll('[data-deadline]').forEach((el) => {
    el.textContent = fmtCountdown(parseInt(el.dataset.deadline, 10) - Date.now());
  });
}, 1000);

/* ── Composants ──────────────────────────────────────────────────── */

function priceHTML(p) {
  const f = flashFor(p.sku);
  if (f) {
    const remise = p.price * (1 - f.remisePct / 100);
    return `<span class="price price-flash">${eur(remise)}<span class="price-old">${eur(p.price)}</span></span>`;
  }
  return `<span class="price">${eur(p.price)}</span>`;
}

function cardHTML(p, opts = {}) {
  const art = artFor(p);
  const f = flashFor(p.sku);
  const badge = opts.rank
    ? `<span class="card-rank">N°&nbsp;${opts.rank}</span>`
    : (f ? `<span class="card-flash">−${f.remisePct}&nbsp;%</span>` : '');
  return `<div class="card">
    <a href="#/p/${p.sku}">
      <div class="card-art" style="background:${art.bg}">${art.svg}${badge}</div>
    </a>
    <div class="card-body">
      <span class="card-brand">${escapeHtml(p.brand)}</span>
      <a class="card-name" href="#/p/${p.sku}">${escapeHtml(p.name)}</a>
      ${starsHTML(p.ratingAverage, p.ratingCount)}
      ${priceHTML(p)}
      <div class="card-cta">
        <button class="btn-add" data-add="${p.sku}">Ajouter au panier</button>
      </div>
    </div>
  </div>`;
}

function gridHTML(products, opts = {}) {
  return `<div class="grid ${opts.four ? 'grid-4' : ''}">${
    products.map((p, i) => cardHTML(p, { rank: opts.ranked ? i + 1 : null })).join('')
  }</div>`;
}

function skeletonGrid(n = 5) {
  return `<div class="grid">${'<div class="sk sk-card"></div>'.repeat(n)}</div>`;
}

const CAT_LABELS = {
  'high-tech': 'High-tech', informatique: 'Informatique', mode: 'Mode',
  maison: 'Maison', livres: 'Livres', 'jeux-loisirs': 'Jeux & Loisirs', sport: 'Sport',
};

/* ── Vues ────────────────────────────────────────────────────────── */

async function viewHome() {
  app.innerHTML = `<div class="section">${skeletonGrid()}</div><div class="section">${skeletonGrid()}</div>`;

  const [products, flash, best] = await Promise.all([
    getProducts(), getFlash(), api('/api/stats/bestsellers'),
  ]);
  const bestProducts = best.top.map((t) => _bySku[t.sku]).filter(Boolean);
  const flashProducts = flash.filter((f) => f.deadline > Date.now())
    .map((f) => _bySku[f.sku]).filter(Boolean);
  const minDeadline = Math.min(...flash.map((f) => f.deadline));

  const catRow = (cat) => {
    const items = products.filter((p) => p.category === cat).slice(0, 5);
    return `<section class="section">
      <div class="section-head"><h2>${CAT_LABELS[cat]}</h2><a href="#/c/${cat}">Tout voir</a></div>
      ${gridHTML(items)}
    </section>`;
  };

  app.innerHTML = `
    <div class="promos">
      <a class="promo promo-flash" href="#/flash">
        <div><h3>Ventes flash</h3>
        <p>Jusqu'à −30&nbsp;% sur une sélection, fin dans <span class="promo-timer" data-deadline="${minDeadline}"></span></p></div>
        <span class="promo-link">J'en profite</span>
      </a>
      <a class="promo promo-tech" href="#/c/informatique">
        <div><h3>Équipez votre rentrée</h3>
        <p>PC portables, écrans et accessoires dès ${eur(24.9)}</p></div>
        <span class="promo-link">Découvrir le rayon</span>
      </a>
      <a class="promo promo-sport" href="#/c/sport">
        <div><h3>Objectif forme</h3>
        <p>Le matériel sport et fitness noté 4,4/5 par nos clients</p></div>
        <span class="promo-link">Voir la sélection</span>
      </a>
    </div>

    ${flashProducts.length ? `<section class="section">
      <div class="section-head"><h2>Ventes flash en cours</h2><a href="#/flash">Toutes les offres</a></div>
      ${gridHTML(flashProducts, { four: true })}
    </section>` : ''}

    <section class="section">
      <div class="section-head"><h2>Meilleures ventes</h2><a href="#/bestsellers">Voir le top complet</a></div>
      ${gridHTML(bestProducts.slice(0, 5), { ranked: true })}
    </section>

    ${catRow('high-tech')}
    ${catRow('informatique')}
    ${catRow('maison')}
    ${catRow('jeux-loisirs')}
  `;
}

async function viewCategory(cat) {
  app.innerHTML = skeletonGrid(10);
  const products = (await getProducts()).filter((p) => p.category === cat);
  await getFlash();

  const render = (list) => {
    $('#cat-grid').innerHTML = gridHTML(list);
    $('.toolbar .count').textContent = `${list.length} article${list.length > 1 ? 's' : ''}`;
  };

  app.innerHTML = `
    <nav class="crumbs"><a href="#/">Accueil</a><span>›</span>${CAT_LABELS[cat] || escapeHtml(cat)}</nav>
    <h1 class="page-title">${CAT_LABELS[cat] || escapeHtml(cat)}</h1>
    <div class="toolbar">
      <span class="count"></span>
      <select id="sort" aria-label="Trier">
        <option value="reco">Tri : pertinence</option>
        <option value="price-asc">Prix croissant</option>
        <option value="price-desc">Prix décroissant</option>
        <option value="rating">Meilleures notes</option>
      </select>
    </div>
    <div id="cat-grid"></div>`;

  render(products);
  $('#sort').addEventListener('change', (e) => {
    const list = [...products];
    if (e.target.value === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (e.target.value === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (e.target.value === 'rating') list.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
    render(list);
  });
}

async function viewSearch(q) {
  app.innerHTML = skeletonGrid(10);
  await Promise.all([getProducts(), getFlash()]);
  const { products } = await api(`/api/products?q=${encodeURIComponent(q)}`);
  const full = products.map((p) => _bySku[p.sku] || p);
  app.innerHTML = `
    <nav class="crumbs"><a href="#/">Accueil</a><span>›</span>Recherche</nav>
    <h1 class="page-title">Résultats pour «&nbsp;${escapeHtml(q)}&nbsp;»</h1>
    <p class="page-sub">${full.length} résultat${full.length > 1 ? 's' : ''}</p>
    ${full.length ? gridHTML(full)
      : `<div class="empty-block"><h2>Aucun résultat</h2>
         <p>Vérifiez l'orthographe ou essayez un terme plus général.</p></div>`}`;
}

async function viewFlash() {
  app.innerHTML = skeletonGrid(4);
  const [flash] = await Promise.all([getFlash(), getProducts()]);
  const actives = flash.filter((f) => f.deadline > Date.now());
  const items = actives.map((f) => _bySku[f.sku]).filter(Boolean);
  const minDeadline = actives.length ? Math.min(...actives.map((f) => f.deadline)) : 0;
  app.innerHTML = `
    <div class="flash-banner">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z"/></svg>
      <h1>Ventes flash</h1>
      ${actives.length ? `<span class="promo-timer">Fin dans <span data-deadline="${minDeadline}"></span></span>` : ''}
    </div>
    ${items.length ? gridHTML(items, { four: true })
      : `<div class="empty-block"><h2>Aucune vente flash en cours</h2>
         <p>Les offres expirent automatiquement — revenez un peu plus tard.</p></div>`}`;
}

async function viewBestsellers() {
  app.innerHTML = skeletonGrid(10);
  const [best] = await Promise.all([api('/api/stats/bestsellers'), getProducts(), getFlash()]);
  const items = best.top.map((t) => _bySku[t.sku]).filter(Boolean);
  app.innerHTML = `
    <nav class="crumbs"><a href="#/">Accueil</a><span>›</span>Meilleures ventes</nav>
    <h1 class="page-title">Meilleures ventes</h1>
    <p class="page-sub">Le classement est mis à jour en temps réel à chaque commande.</p>
    ${gridHTML(items, { ranked: true })}`;
}

async function viewProduct(sku) {
  app.innerHTML = `<div class="sk" style="height:420px"></div>`;
  await Promise.all([getProducts(), getFlash()]);

  let data;
  try {
    data = await api(`/api/products/${encodeURIComponent(sku)}`);
  } catch (e) {
    app.innerHTML = `<div class="empty-block"><h2>Produit introuvable</h2><p>${escapeHtml(e.message)}</p></div>`;
    return;
  }
  const p = data.produit;
  const stock = data.stock;
  const art = artFor(p);
  const f = flashFor(p.sku);
  const prix = f ? p.price * (1 - f.remisePct / 100) : p.price;

  const stockLine = stock === 0
    ? '<span class="stock-out">Rupture de stock</span>'
    : stock <= 10
      ? `<span class="stock-low">Plus que ${stock} en stock — commandez vite</span>`
      : '<span class="stock-ok">En stock</span>';

  const specRows = Object.entries(p.specs || {}).map(([k, v]) =>
    `<tr><th>${escapeHtml(k.replaceAll('_', ' '))}</th><td>${escapeHtml(fmtSpec(v))}</td></tr>`
  ).join('');

  const variants = (p.variants || []).map((v) =>
    Object.values(v).join(' · ')
  );

  const reviews = p.reviews || [];
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n, count: reviews.filter((r) => r.rating === n).length,
  }));

  app.innerHTML = `
    <nav class="crumbs">
      <a href="#/">Accueil</a><span>›</span>
      <a href="#/c/${p.category}">${CAT_LABELS[p.category] || p.category}</a><span>›</span>
      ${escapeHtml(p.name)}
    </nav>

    <div class="product-top">
      <div class="product-gallery" style="background:${art.bg}">${art.svg}</div>

      <div>
        <div class="product-head">
          <h1>${escapeHtml(p.name)}</h1>
          <a class="product-brand" href="#/q/${encodeURIComponent(p.brand)}">Voir tous les produits ${escapeHtml(p.brand)}</a>
          <div class="product-rating-line">
            ${starsHTML(p.ratingAverage, null)}
            <a href="#avis">${p.ratingAverage ? String(p.ratingAverage).replace('.', ',') + ' sur 5 — ' : ''}${p.ratingCount || 0} avis</a>
          </div>
        </div>
        <hr class="product-divider">
        <div class="product-price-line">
          <span class="product-price ${f ? 'price-flash' : ''}">${eur(prix)}</span>
          ${f ? `<span class="price-old">${eur(p.price)}</span><span class="card-flash" style="position:static">−${f.remisePct}&nbsp;%</span>` : ''}
          <span class="product-vat">TVA incluse</span>
        </div>
        ${f ? `<p style="color:var(--flash);font-size:13px;font-weight:600;margin:6px 0 0">
          Vente flash — se termine dans <span data-deadline="${f.deadline}"></span></p>` : ''}
        <ul class="spec-inline">
          ${Object.entries(p.specs || {}).slice(0, 5).map(([k, v]) =>
            `<li><strong>${escapeHtml(k.replaceAll('_', ' '))}</strong><span>${escapeHtml(fmtSpec(v))}</span></li>`).join('')}
          ${variants.length ? `<li><strong>Disponible en</strong><span>${escapeHtml(variants.join(' / '))}</span></li>` : ''}
        </ul>
        ${data.vues > 150 ? `<p style="font-size:12.5px;color:var(--gray);margin-top:12px">
          ${data.vues.toLocaleString('fr-FR')} personnes ont consulté cet article ce mois-ci</p>` : ''}
      </div>

      <aside class="buybox">
        <span class="product-price">${eur(prix)}</span>
        ${stockLine}
        <p class="delivery-line">Livraison <strong>${prix >= 49 ? 'offerte' : eur(4.99)}</strong> —
          recevez-le <strong>${deliveryDate(2)}</strong></p>
        <p class="seller-line">Vendu et expédié par <a href="#/vendre">${escapeHtml(data.vendeur || 'Panopli')}</a></p>
        <div class="qty-row">
          <label for="qty">Quantité</label>
          <select id="qty">${[1, 2, 3, 4, 5].map((n) => `<option>${n}</option>`).join('')}</select>
        </div>
        <button class="btn-primary" id="add-main" ${stock === 0 ? 'disabled' : ''}>Ajouter au panier</button>
        <button class="btn-secondary" id="buy-now" ${stock === 0 ? 'disabled' : ''}>Acheter maintenant</button>
        <div class="buybox-reassure">
          <span>Retours gratuits sous 30 jours</span>
          <span>Paiement sécurisé 3D Secure</span>
          <span>Garantie légale 2 ans</span>
        </div>
      </aside>
    </div>

    <section class="section product-desc">
      <h2>Description</h2>
      <p>${escapeHtml(p.description)}</p>
    </section>

    <section class="section specs-block">
      <h2>Caractéristiques techniques</h2>
      <table class="specs-table">${specRows}</table>
    </section>

    <section class="section reviews" id="avis">
      <h2>Avis clients</h2>
      ${reviews.length ? `<div class="reviews-layout">
        <div class="reviews-score">
          <span class="big">${String(p.ratingAverage).replace('.', ',')}</span>
          <div>${starsHTML(p.ratingAverage, null)}</div>
          <p class="sub">${p.ratingCount} avis — dont ${reviews.filter((r) => r.verified).length} achats vérifiés</p>
          <div class="rating-bars">
            ${dist.map((d) => `<div class="rating-bar">
              <span>${d.n} étoile${d.n > 1 ? 's' : ''}</span>
              <span class="track"><span class="fill" style="width:${reviews.length ? Math.round((d.count / reviews.length) * 100) : 0}%"></span></span>
              <span>${d.count}</span>
            </div>`).join('')}
          </div>
        </div>
        <div>
          ${reviews.slice(0, 6).map((r) => `<article class="review">
            <div class="review-head">
              <span class="review-avatar">${escapeHtml(r.author.charAt(0))}</span>
              <div>
                <strong>${escapeHtml(r.author)}</strong>
                <div class="review-meta">${starsHTML(r.rating, null)} — le ${frDate(r.date)}
                  ${r.verified ? ' · <span class="review-verified">Achat vérifié</span>' : ''}</div>
              </div>
            </div>
            <p>${escapeHtml(r.comment)}</p>
          </article>`).join('')}
        </div>
      </div>` : '<p class="page-sub">Aucun avis pour le moment.</p>'}
    </section>

    <section class="section" id="reco-block"></section>
    <section class="section" id="also-block"></section>
  `;

  const qtySel = $('#qty');
  $('#add-main').addEventListener('click', () => addToCart(sku, parseInt(qtySel.value, 10)));
  $('#buy-now').addEventListener('click', async () => {
    if (await addToCart(sku, parseInt(qtySel.value, 10), true)) location.hash = '#/panier';
  });

  // Recommandations Neo4j, chargées après la fiche.
  api(`/api/products/${encodeURIComponent(sku)}/reco`).then(({ recommandations }) => {
    const items = recommandations.map((r) => _bySku[r.sku]).filter(Boolean);
    if (items.length) {
      $('#reco-block').innerHTML = `
        <div class="section-head"><h2>Les clients ayant acheté cet article ont aussi acheté</h2></div>
        ${gridHTML(items)}`;
    }
  }).catch(() => {});
  api(`/api/products/${encodeURIComponent(sku)}/aussi-consultes`).then(({ produits }) => {
    const items = produits.map((r) => _bySku[r.sku]).filter(Boolean);
    if (items.length) {
      $('#also-block').innerHTML = `
        <div class="section-head"><h2>Les clients ont aussi regardé</h2></div>
        ${gridHTML(items)}`;
    }
  }).catch(() => {});
}

async function viewCart(errorMessage) {
  app.innerHTML = `<div class="sk" style="height:260px"></div>`;
  await Promise.all([getProducts(), getFlash()]);
  const { panier, totalCents, expireDansSecondes } = await api(`/api/cart/${getUserId()}`);

  if (panier.length === 0) {
    app.innerHTML = `<div class="cart-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="17.5" cy="20" r="1.6"/><path d="M2.5 3.5h2.6l2.3 11.2a1.6 1.6 0 0 0 1.6 1.3h8.3a1.6 1.6 0 0 0 1.6-1.2l1.7-7.3H6"/></svg>
      <h2>Votre panier est vide</h2>
      <p>Parcourez nos rayons pour trouver votre bonheur.</p>
      <p><a class="btn-primary" style="display:inline-flex;align-items:center;padding:0 24px" href="#/">Continuer mes achats</a></p>
    </div>`;
    return;
  }

  const heures = Math.floor(expireDansSecondes / 3600);
  const nbArticles = panier.reduce((s, l) => s + l.quantite, 0);

  app.innerHTML = `
    <h1 class="page-title">Mon panier</h1>
    <p class="page-sub">${nbArticles} article${nbArticles > 1 ? 's' : ''}</p>
    ${errorMessage ? `<p class="alert-error">${escapeHtml(errorMessage)}</p>` : ''}
    <div class="cart-layout">
      <div class="cart-list">
        ${panier.map((l) => {
          const p = _bySku[l.sku];
          const art = p ? artFor(p) : { bg: '#f4f5f7', svg: '' };
          return `<div class="cart-row">
            <a class="cart-row-art" style="background:${art.bg}" href="#/p/${l.sku}">${art.svg}</a>
            <div>
              <a class="cart-row-name" href="#/p/${l.sku}">${escapeHtml(l.nom)}</a>
              <div class="cart-row-unit">${eurCents(l.prixUnitaireCents)} l'unité — vendu par ${escapeHtml(p?.brand || 'Panopli')}</div>
              <div class="cart-row-actions">
                <span class="qty-stepper">
                  <button data-dec="${l.sku}" aria-label="Retirer un exemplaire">−</button>
                  <span>${l.quantite}</span>
                  <button data-inc="${l.sku}" aria-label="Ajouter un exemplaire">+</button>
                </span>
                <button class="link-danger" data-del="${l.sku}">Supprimer</button>
              </div>
            </div>
            <span class="cart-row-total">${eurCents(l.quantite * l.prixUnitaireCents)}</span>
          </div>`;
        }).join('')}
      </div>
      <aside class="cart-side">
        <div class="cart-side-total">
          <span>Sous-total (${nbArticles} article${nbArticles > 1 ? 's' : ''})</span>
          <strong>${eurCents(totalCents)}</strong>
        </div>
        <p class="delivery-line">Livraison <strong>${totalCents >= 4900 ? 'offerte' : eur(4.99)}</strong></p>
        <button class="btn-primary" id="checkout">Passer la commande</button>
        <p class="cart-ttl">Votre panier est conservé encore <strong>${heures}&nbsp;h</strong>.
          Passé ce délai, il expire automatiquement.</p>
      </aside>
    </div>`;

  $('#checkout').addEventListener('click', async () => {
    const btn = $('#checkout');
    btn.disabled = true;
    btn.textContent = 'Commande en cours…';
    try {
      const { commande } = await api(`/api/orders/${getUserId()}`, { method: 'POST' });
      refreshCartBadge();
      location.hash = `#/merci/${commande.id}`;
    } catch (e) {
      viewCart(e.message);
    }
  });
}

async function viewConfirm(orderId) {
  let detail = null;
  try { detail = await api(`/api/orders/${orderId}`); } catch { /* affichage minimal */ }
  app.innerHTML = `<div class="confirm">
    <div class="confirm-ico">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
    </div>
    <h1>Merci, votre commande est confirmée</h1>
    <p>Commande <strong>n°&nbsp;${escapeHtml(orderId)}</strong>${detail ? ` — ${eurCents(detail.total_cents)}` : ''}.<br>
    Un e-mail de confirmation vient de vous être envoyé.
    Livraison estimée&nbsp;: <strong>${deliveryDate(3)}</strong>.</p>
    <div class="actions">
      <a class="btn-secondary" href="#/commandes">Suivre ma commande</a>
      <a class="btn-primary" href="#/">Continuer mes achats</a>
    </div>
  </div>`;
}

const STATUS_LABELS = {
  en_attente: 'En attente de paiement', payee: 'Payée',
  expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée',
};

async function viewOrders() {
  app.innerHTML = `<div class="sk" style="height:260px"></div>`;
  const { commandes } = await api(`/api/customers/${getUserId()}/orders`);

  if (commandes.length === 0) {
    app.innerHTML = `<h1 class="page-title">Mes commandes</h1>
      <div class="empty-block"><h2>Aucune commande</h2>
      <p>Vos commandes apparaîtront ici après votre premier achat.</p></div>`;
    return;
  }

  app.innerHTML = `
    <h1 class="page-title">Mes commandes</h1>
    <p class="page-sub">${commandes.length} commande${commandes.length > 1 ? 's' : ''}</p>
    ${commandes.map((c) => `<div class="order-card">
      <div class="order-head">
        <span>Commande passée le<b>${frDate(c.ordered_at)}</b></span>
        <span>Total<b>${eurCents(c.total_cents)}</b></span>
        <span>N° de commande<b>${c.id}</b></span>
        <span class="status status-${c.status}">${STATUS_LABELS[c.status] || c.status}</span>
        <button class="order-toggle" data-order="${c.id}">Voir le détail</button>
      </div>
      <div class="order-lines" id="order-lines-${c.id}" hidden></div>
    </div>`).join('')}`;
}

// Dépliage du détail d'une commande (délégation globale, voir initHeader).
async function toggleOrderDetail(btn) {
  const id = btn.dataset.order;
  const box = $(`#order-lines-${id}`);
  if (!box.hidden) { box.hidden = true; btn.textContent = 'Voir le détail'; return; }
  if (!box.dataset.loaded) {
    const detail = await api(`/api/orders/${id}`);
    box.innerHTML = detail.lignes.map((l) => `<div class="order-line">
      <a href="#/p/${l.sku}" style="color:var(--blue)">${escapeHtml(l.produit)}</a>
      <span>×&nbsp;${l.quantite} — ${eurCents(l.quantite * l.prixUnitaireCents)}</span>
    </div>`).join('') + (detail.paiement
      ? `<div class="order-line"><span style="color:var(--gray)">Paiement par ${detail.paiement} — ${detail.statut_paiement}</span>
         <strong>${eurCents(detail.total_cents)}</strong></div>` : '');
    box.dataset.loaded = '1';
  }
  box.hidden = false;
  btn.textContent = 'Masquer le détail';
}

function viewStatic(title, lines) {
  app.innerHTML = `<div class="static-page">
    <nav class="crumbs"><a href="#/">Accueil</a><span>›</span>${title}</nav>
    <h1>${title}</h1>
    ${lines.map((l) => `<p>${l}</p>`).join('')}
  </div>`;
}

/* ── Routeur ─────────────────────────────────────────────────────── */

function setActiveNav(hash) {
  document.querySelectorAll('#catnav a').forEach((a) => {
    a.classList.toggle('is-active', a.getAttribute('href') === hash
      || (a.getAttribute('href') !== '#/' && hash.startsWith(a.getAttribute('href'))));
  });
}

async function router() {
  const hash = location.hash || '#/';
  setActiveNav(hash);
  window.scrollTo({ top: 0 });

  const [, route, param] = hash.match(/^#\/([^/]*)\/?(.*)$/) || [];
  try {
    if (!route) await viewHome();
    else if (route === 'c') await viewCategory(decodeURIComponent(param));
    else if (route === 'q') await viewSearch(decodeURIComponent(param));
    else if (route === 'p') await viewProduct(decodeURIComponent(param));
    else if (route === 'panier') await viewCart();
    else if (route === 'commandes') await viewOrders();
    else if (route === 'merci') await viewConfirm(param);
    else if (route === 'flash') await viewFlash();
    else if (route === 'bestsellers') await viewBestsellers();
    else if (route === 'aide') viewStatic('Aide et contact', [
      'Notre service client est disponible du lundi au samedi, de 9 h à 19 h.',
      'Suivi de commande : rendez-vous dans la rubrique « Retours et commandes » de votre compte.',
      'Livraison offerte dès 49 € d\'achat, retours gratuits sous 30 jours.',
    ]);
    else if (route === 'vendre') viewStatic('Vendre sur Panopli', [
      'Rejoignez plus de 6 vendeurs partenaires et développez votre activité en ligne.',
      'Commission de 8 à 15 % selon la catégorie, versement sous 7 jours.',
      'Ouvrez votre boutique en quelques minutes depuis l\'espace vendeur.',
    ]);
    else if (route === 'apropos') viewStatic('À propos de Panopli', [
      'Panopli est une marketplace fictive développée dans le cadre du cours NoSQL B3 (Ynov).',
      'Elle sert de support à une architecture de persistance polyglotte : PostgreSQL, MongoDB, Redis et Neo4j.',
      'Aucune vente réelle n\'est effectuée sur ce site.',
    ]);
    else await viewHome();
  } catch (e) {
    app.innerHTML = `<div class="empty-block"><h2>Une erreur est survenue</h2>
      <p>${escapeHtml(e.message)}</p></div>`;
  }
}

/* ── Header : recherche, compte, panier ──────────────────────────── */

function initHeader() {
  $('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#search-input').value.trim();
    if (q) location.hash = `#/q/${encodeURIComponent(q)}`;
  });

  const btn = $('#account-btn');
  const menu = $('#account-menu');
  btn.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', (e) => {
    if (!$('#account').contains(e.target)) menu.hidden = true;
  });

  // Délégation : tous les boutons « Ajouter au panier » des cartes.
  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) addToCart(add.dataset.add);
    const inc = e.target.closest('[data-inc]');
    if (inc) addToCart(inc.dataset.inc, 1, true).then(() => viewCart());
    const dec = e.target.closest('[data-dec]');
    if (dec) addToCart(dec.dataset.dec, -1, true).then(() => viewCart());
    const del = e.target.closest('[data-del]');
    if (del) {
      api(`/api/cart/${getUserId()}/items/${del.dataset.del}`, { method: 'DELETE' })
        .then(() => { refreshCartBadge(); viewCart(); });
    }
    const order = e.target.closest('[data-order]');
    if (order) toggleOrderDetail(order);
  });
}

async function initAccount() {
  const clients = await getCustomers();
  const current = clients.find((c) => c.id === getUserId()) || clients[0];
  $('#account-name').textContent = current.first_name;
  $('#account-list').innerHTML = clients.slice(0, 8).map((c) =>
    `<button data-user="${c.id}" class="${c.id === current.id ? 'is-current' : ''}">
      ${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}
    </button>`).join('');
  $('#account-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-user]');
    if (!b) return;
    localStorage.setItem(USER_KEY, b.dataset.user);
    $('#account-menu').hidden = true;
    toast(`Connecté en tant que ${b.textContent.trim()}`);
    initAccount();
    refreshCartBadge();
    router();
  });
}

/* ── Démarrage ───────────────────────────────────────────────────── */

window.addEventListener('hashchange', router);
initHeader();
initAccount().catch(() => { $('#account-name').textContent = 'Invité'; });
refreshCartBadge();
router();
