/* De pakketkaart-morph (#43, Philip 19 aug: "als je er eentje aanklikt dat dan het kaartje soort van morft en dan de
   payment kaart wordt (en de rest wordt verborgen) op een extreem elegante manier. Anthropic heeft ook veel van die
   overgaande kaartjes").

   HOE HET WERKT — één doorlopende shared-element-overgang (FLIP), geen paginawissel:
   • Tik op een kaart → de kaart zelf wordt de betaalkaart (de gegevens-stap: feiten, iDEAL, bestelling, e-mail, knop).
     Dezelfde DOM-kaart, twee lay-outs (klasse .is-pay); titel, planeet en prijs zijn SHARED ELEMENTS die op hun plek
     blijven bestaan en naar hun nieuwe plek/maat glijden (transform, uniform geschaald). De rest van de pakketinhoud
     vervaagt als een 'ghost' (kloon in de oude lay-out), de betaalinhoud vervaagt erin.
   • Tijdens de overgang worden ALLE zichtbare stukken (de drie kaarten, de vraagregel) position:fixed op hun huidige
     viewport-plek gezet; het document springt ongezien naar de eindlay-out + eindscroll (de gekozen kaart bovenaan,
     scroll 0). De gekozen kaart glijdt en groeit naar zijn eindrect, de andere kaarten lossen op (fade + kleine schaal).
     Aan het eind: alles los van fixed — de kaart staat al exact op zijn plek (gemeten uit dezelfde lay-out) → geen sprong.
   • Terug (× of de browser-terugknop): exact dezelfde motor andersom, de kaart vliegt terug naar zijn plek tussen de
     andere, de andere kaarten komen terug, de scroll van vóór de tik wordt hersteld.
   • Alleen transform/opacity op de shared elementen en de kaarten; de ene hoogte-animatie zit op de gekozen kaart
     (één element, ~100 nodes). Curve: een expo-achtige uitloop; reduced-motion → direct omschakelen.
   • Het betaalpad blijft functioneel gelijk: de knop gaat naar betaal.html?plan=… zoals gegevens.html deed. */
(function () {
  'use strict';
  var DUR = 720;                                  // ms — de hele morph
  var EASE = bezier(0.32, 0.72, 0, 1);            // de iOS-curve (ook de curve van de contact-bar): zacht los, lang en rustig landen
  var FADE = bezier(0.4, 0, 0.2, 1);
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PLANS = {
    monthly:  { fact: 'Na de proefweek start het maandabonnement: €11 per maand. Opzeggen kan altijd, ook tijdens de proefweek.', price: '€11,00 /maand' },
    yearly:   { fact: 'Na de proefweek start het jaarabonnement: €84 per schooljaar. Opzeggen kan altijd, ook tijdens de proefweek.', price: '€84,00 /jaar' },
    lifetime: { fact: 'Na de proefweek betaal je eenmalig €200 voor toegang tijdens de hele schooltijd. Tijdens de proefweek kun je nog stoppen.', price: '€200 eenmalig' }
  };

  var container, cards, q, pq, busy = false, open = null, savedScroll = 0;

  function init() {
    container = document.getElementById('plans'); if (!container) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';  // wij zetten de scroll zelf (terug = de stand van vóór de tik)
    cards = [].slice.call(container.querySelectorAll('.plan'));
    q = document.querySelector('.choice-q'); pq = document.querySelector('.pay-q');
    var end = new Date(Date.now() + 7 * 864e5);
    var trial = 'Proefweek tot ' + end.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
    cards.forEach(function (card) {
      var id = card.getAttribute('data-plan'), p = PLANS[id] || PLANS.yearly;
      // betaalinhoud (de gegevens-stap) in de kaart zelf
      var pay = document.createElement('div'); pay.className = 'pay py';
      pay.innerHTML =
        '<ul class="facts">' +
          '<li><span class="dot">✓</span><span>Vandaag betaal je €0,01 om je betaalmethode te verifiëren.</span></li>' +
          '<li><span class="dot">✓</span><span>' + p.fact + '</span></li>' +
          '<li><span class="dot">✓</span><span>Je ontvangt direct een link om je kind aan het abonnement te koppelen.</span></li>' +
        '</ul>' +
        '<h3>Hoe wil je betalen?</h3>' +
        '<div class="paycard"><img src="assets/ideal.png" alt="iDEAL" /><span>iDEAL</span></div>' +
        '<h3>Jouw bestelling</h3>' +
        '<div class="orow"><span>' + trial + '</span><b>€ 0,01 eenmalig</b></div>' +
        '<div class="orow"><span>WisWiz abonnement na de proefweek</span><b>' + p.price + '</b></div>' +
        '<div class="sep"></div>' +
        '<label class="f" for="email-' + id + '">Jouw e-mailadres <span class="req">*</span></label>' +
        '<input id="email-' + id + '" type="email" inputmode="email" autocomplete="email" placeholder="naam@voorbeeld.nl" />' +
        '<div class="terms"><input id="terms-' + id + '" type="checkbox" /><label for="terms-' + id + '">Ik ga akkoord met de <a href="https://wiswiz.nl/algemene_voorwaarden">algemene voorwaarden</a></label></div>' +
        '<button type="button" class="btn-primary go">Verifieer je betaalmethode</button>';
      card.appendChild(pay);
      var close = document.createElement('button'); close.type = 'button'; close.className = 'close py';
      close.setAttribute('aria-label', 'Terug naar de pakketten');
      close.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      card.appendChild(close);

      pay.querySelector('.go').addEventListener('click', function () { location.href = 'betaal.html?plan=' + id; });
      close.addEventListener('click', function () { if (open) history.back(); });
      // de hele kaart is het tikvlak (behalve de uitklap, de link en de betaalinhoud)
      card.addEventListener('click', function (e) {
        if (card.classList.contains('is-pay') || busy) return;
        if (e.target.closest('.incl-details, .pay, .close')) return;
        if (e.target.closest('a')) e.preventDefault();
        openCard(card, true);
      });
      card.setAttribute('tabindex', '0'); card.setAttribute('role', 'button');
      card.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); card.click(); }
      });
    });

    // deep link / herladen: ?plan=… opent direct, zonder animatie
    var want = new URLSearchParams(location.search).get('plan');
    var wc = want && cards.filter(function (c) { return c.getAttribute('data-plan') === want; })[0];
    if (wc) {   // de lijst als vorige stap in de geschiedenis, zodat × / terug naar de pakketten gaat en niet de site uit
      var base = location.pathname + location.hash;
      history.replaceState({ pay: null }, '', base); history.pushState({ pay: want }, '', '?plan=' + want);
      openCard(wc, false, true);
    } else history.replaceState({ pay: null }, '', location.href);
    window.addEventListener('popstate', function (e) {
      var st = e.state || {};
      if (st.pay) { var c = cards.filter(function (x) { return x.getAttribute('data-plan') === st.pay; })[0]; if (c && open !== c) openCard(c, true, true); }
      else if (open) closeCard(true);
    });
  }

  function openCard(card, animate, noPush) {
    if (busy || open) return;
    savedScroll = window.scrollY;
    if (!noPush) history.pushState({ pay: card.getAttribute('data-plan') }, '', '?plan=' + card.getAttribute('data-plan'));
    morph(card, true, animate && !REDUCED);
  }
  function closeCard(animate) {
    if (busy || !open) return;
    morph(open, false, animate && !REDUCED);
  }

  /* ---------- de motor ---------- */
  function rect(el) { var r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }
  function shared(card) { return [card.querySelector('.visual svg'), card.querySelector('h2'), card.querySelector('.price .amt')]; }

  function applyState(card, toPay) {
    container.classList.toggle('is-pay', toPay);
    cards.forEach(function (c) { c.classList.toggle('is-pay', toPay && c === card); c.classList.toggle('is-off', toPay && c !== card); });
    document.body.classList.toggle('pay-open', toPay);
    open = toPay ? card : null;
  }

  function morph(card, toPay, animate) {
    var others = cards.filter(function (c) { return c !== card; });
    var sh = shared(card);
    if (!animate) {
      applyState(card, toPay);
      window.scrollTo(0, toPay ? 0 : savedScroll);
      return;
    }
    busy = true; container.classList.add('busy');
    var po = [].slice.call(card.querySelectorAll(':scope > .po')), py = [].slice.call(card.querySelectorAll(':scope > .py'));
    // 1. ghost: kloon van de kaart in de HUIDIGE lay-out, shared elementen onzichtbaar
    var ghost = document.createElement('div'); ghost.className = 'ghost';
    var clone = card.cloneNode(true); clone.removeAttribute('id'); clone.classList.add('ghost-card');
    shared(clone).forEach(function (el) { el.style.visibility = 'hidden'; });
    ghost.appendChild(clone);
    // 2. meet A (viewport)
    var A = { card: rect(card), sh: sh.map(rect), others: others.map(rect) };
    // 3. doel-lay-out + doelscroll, ongezien (geen paint tussen hier en de freeze)
    applyState(card, toPay);
    window.scrollTo(0, toPay ? 0 : savedScroll);
    // de ghost na de omschakeling toevoegen (hij mag de meting niet beïnvloeden: absolute, dus geen invloed)
    card.appendChild(ghost);
    // 4. meet B
    var B = { card: rect(card), sh: sh.map(rect), others: others.map(rect), ch: container.offsetHeight };
    // 5. freeze: alles fixed op zijn A-plek (wat in het doel niet bestaat, toch tonen voor de fade)
    var fixEl = function (el, r, z) { el.style.position = 'fixed'; el.style.top = r.y + 'px'; el.style.left = r.x + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; el.style.margin = '0'; el.style.zIndex = z; };
    fixEl(card, A.card, 30); card.classList.add('morphing');
    others.forEach(function (c, i) { fixEl(c, toPay ? A.others[i] : B.others[i], 20); c.style.display = 'block'; c.style.pointerEvents = 'none'; c.style.opacity = toPay ? 1 : 0; });  // display:block: in de betaallay-out staan ze op display:none, voor de fade moeten ze renderen
    // vraag / kop: de oude vervaagt op zijn plek, de nieuwe verschijnt op zijn eindplek
    var qOut = toPay ? q : pq, qIn = toPay ? pq : q;
    qOut.style.visibility = 'visible'; qIn.style.visibility = 'visible'; qOut.style.opacity = 1; qIn.style.opacity = 0;
    // de container houdt tijdens de morph de hoogte van de eindlay-out: de kaarten zijn fixed (uit de flow), en zonder
    // dit zakt het document in en klemt de browser de scroll (terug naar een kaart onderaan landde op scroll 0)
    container.style.height = B.ch + 'px';
    // shared: lokale rects (t.o.v. de kaart), start = geïnverteerd. De tekst-elementen zijn fit-content met dezelfde
    // line-height in beide lay-outs, dus hun box schaalt zuiver met de lettergrootte (uniforme schaal, geen vervorming).
    var loc = sh.map(function (el, i) {
      var a = A.sh[i], b = B.sh[i];
      return { el: el, s: b.h ? a.h / b.h : 1, dx: (a.x - A.card.x) - (b.x - B.card.x), dy: (a.y - A.card.y) - (b.y - B.card.y) };
    });
    sh.forEach(function (el) { el.style.transformOrigin = '0 0'; el.style.willChange = 'transform'; });
    var inEls = toPay ? py.filter(function (el) { return !el.classList.contains('close'); }) : po, outGhost = ghost;
    // laat: het prijs-achtervoegsel (alleen het bedrag is shared) en de sluitknop komen pas als het bedrag bijna staat
    var lateEls = [card.querySelector(':scope > .price small')].concat(toPay ? py.filter(function (el) { return el.classList.contains('close'); }) : []);
    var payEl = toPay ? card.querySelector(':scope > .pay') : null;
    inEls.concat(lateEls).forEach(function (el) { el.style.opacity = 0; });
    card.style.willChange = 'top, height';

    var dur = window.MORPH_DUR || DUR;   // MORPH_DUR: alleen voor de iteratie-frames (vertraagd renderen)
    function render(u) {
      var e = EASE(u);
      // de kaart
      card.style.top = (A.card.y + (B.card.y - A.card.y) * e) + 'px';
      card.style.left = (A.card.x + (B.card.x - A.card.x) * e) + 'px';
      card.style.width = (A.card.w + (B.card.w - A.card.w) * e) + 'px';
      var h = A.card.h + (B.card.h - A.card.h) * e;
      card.style.height = h + 'px';
      outGhost.style.height = (h + 25) + 'px';
      // shared elementen: van geïnverteerd naar identiteit
      loc.forEach(function (l) {
        var s = l.s + (1 - l.s) * e;
        l.el.style.transform = 'translate(' + (l.dx * (1 - e)) + 'px,' + (l.dy * (1 - e)) + 'px) scale(' + s + ')';
      });
      // inhoud: een crossfade — de oude inhoud (ghost) weg in de eerste 30%, de nieuwe erin van 12% tot 70% (zodat de
      // groeiende kaart nooit lang leeg staat); de betaalinhoud komt er met een kleine opwaartse beweging in
      var go = 1 - FADE(Math.min(1, u / 0.3)), gi = FADE(Math.max(0, Math.min(1, (u - 0.12) / 0.58)));
      outGhost.style.opacity = go;
      inEls.forEach(function (el) { el.style.opacity = gi; });
      var li = FADE(Math.max(0, Math.min(1, (u - 0.4) / 0.5)));
      lateEls.forEach(function (el) { el.style.opacity = li; });
      if (payEl) payEl.style.transform = 'translateY(' + (14 * (1 - gi)) + 'px)';
      // de andere kaarten: oplossen (heen) / terugkomen (terug), met een kleine schaal
      var oo = toPay ? 1 - FADE(Math.min(1, u / 0.45)) : FADE(Math.max(0, (u - 0.4) / 0.6));
      others.forEach(function (c) { c.style.opacity = oo; c.style.transform = 'scale(' + (0.96 + 0.04 * oo) + ')'; });
      // vraag / kop
      qOut.style.opacity = 1 - FADE(Math.min(1, u / 0.4));
      qIn.style.opacity = FADE(Math.max(0, (u - 0.5) / 0.5));
      window.__morphU = u;
    }
    render(0);                                   // startstand synchroon: geen frame zonder transform
    var t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      var u = Math.min(1, (now - t0) / dur);
      render(u);
      if (u < 1) requestAnimationFrame(frame); else finish();
    }
    function finish() {
      // 6. alles los van fixed — de lay-out eronder is al de eindlay-out, dus niets springt
      [card].concat(others).forEach(function (el) {
        ['position', 'top', 'left', 'width', 'height', 'margin', 'zIndex', 'display', 'opacity', 'transform', 'pointerEvents', 'willChange'].forEach(function (k) { el.style[k] = ''; });
      });
      [q, pq].forEach(function (el) { el.style.opacity = ''; el.style.visibility = ''; });
      container.style.height = '';
      sh.forEach(function (el) { el.style.transform = ''; el.style.transformOrigin = ''; el.style.willChange = ''; });
      po.concat(py).forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
      card.querySelector(':scope > .price small').style.opacity = '';
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      card.classList.remove('morphing'); container.classList.remove('busy');
      busy = false;
    }
    requestAnimationFrame(frame);
  }

  /* cubic-bezier solver (zoals CSS), klein en exact genoeg */
  function bezier(x1, y1, x2, y2) {
    function A(a1, a2) { return 1 - 3 * a2 + 3 * a1; } function Bf(a1, a2) { return 3 * a2 - 6 * a1; } function C(a1) { return 3 * a1; }
    function calc(t, a1, a2) { return ((A(a1, a2) * t + Bf(a1, a2)) * t + C(a1)) * t; }
    function slope(t, a1, a2) { return 3 * A(a1, a2) * t * t + 2 * Bf(a1, a2) * t + C(a1); }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) { var s = slope(t, x1, x2); if (s === 0) break; var dx = calc(t, x1, x2) - x; t -= dx / s; }
      return calc(t, y1, y2);
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
