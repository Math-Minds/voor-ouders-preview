/* De contact-bar (#32) — bouwt de markup en doet het verschijnen. Eén bron voor /voor-ouders, pakket en betaal.
   Philip 19 aug (drie eisen): ÉÉN teksthiërarchie (één regel, één stijl), één natuurlijke regel in zijn eigen stem, en
   GEEN ingeklapt/uitgeklapt — de bar is één continue strook die altijd hetzelfde toont: foto links, één regel, app + bel rechts.
   Gebruik:  <script src="assets/sheet.js" data-trigger="hero|direct" data-regel="…"></script>
     data-trigger="hero"   → de bar is WEG zolang de opening (.hero) in beeld is; voorbij de hero glijdt hij in,
                             terug naar boven glijdt hij weer weg (hysterese van 24px, dus geen flikker op de grens).
     data-trigger="direct" → de bar glijdt kort na het laden in (pakket / betaal: daar is geen hero).
     data-regel            → de ene regel (per scherm te overschrijven). */
(function () {
  var me = document.currentScript || (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var TRIGGER = (me && me.getAttribute('data-trigger')) || 'direct';
  var REGEL = (me && me.getAttribute('data-regel')) || 'Hoi! Ik ben Philip, medeoprichter van WisWiz. Voor alle vragen die je nog hebt kan je me bellen of appen.';  // Philips letterlijke tekst (19 aug)
  var TEL = 'tel:+31630231640';
  var WA = 'https://wa.me/31630231640?text=Hoi%20Philip%2C%20ik%20heb%20een%20vraag%20over%20WisWiz%20voor%20mijn%20kind.';
  var SVG_WA = '<svg viewBox="0 0 448 512" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>';
  var SVG_TEL = '<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>';

  var html =
    '<section class="ws-sheet" id="ws-sheet" aria-label="Contact met Philip">' +
      '<div class="ws-in">' +
        '<img class="ws-foto" src="assets/philip.png" alt="" width="36" height="36" />' +
        '<p class="ws-regel">' + REGEL + '</p>' +
        '<span class="ws-acties">' +
          '<a class="ws-icon ws-wa" href="' + WA + '" target="_blank" rel="noopener" data-cta="whatsapp" aria-label="WhatsApp Philip">' + SVG_WA + '</a>' +
          '<a class="ws-icon ws-tel" href="' + TEL + '" data-cta="bel-bar" aria-label="Bel Philip, 06 30 23 16 40">' + SVG_TEL + '</a>' +
        '</span>' +
      '</div>' +
    '</section>';

  function init() {
    var wrap = document.createElement('div'); wrap.innerHTML = html;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    var sh = document.getElementById('ws-sheet');
    var shown = false;
    function setIn(v) { if (shown === v) return; shown = v; sh.classList.toggle('is-in', v); document.body.classList.toggle('ws-bar-in', v);   /* 20 aug: de pagina (bottom-dock-CTA) stapelt hierop */
      try { sh.inert = !v; } catch (_) {} sh.setAttribute('aria-hidden', v ? 'false' : 'true'); }

    // --- verschijnen ---
    if (TRIGGER === 'hero') {
      var hero = document.querySelector('.hero');
      if (!hero) { setIn(true); }
      else {
        var raf = 0;
        function check() { raf = 0; var b = hero.getBoundingClientRect().bottom;
          if (!shown && b < -24) setIn(true); else if (shown && b > 24) setIn(false); }
        function onScroll() { if (!raf) raf = requestAnimationFrame(check); }
        addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); check();
      }
    } else { setTimeout(function () { setIn(true); }, 380); }
    // de barhoogte als --ws-bar op <html>: pakket/betaal houden er precies onder vrij (padding-bottom: calc(var(--ws-bar) + 12px))
    function meet() { document.documentElement.style.setProperty('--ws-bar', sh.offsetHeight + 'px'); }
    meet(); if (window.ResizeObserver) new ResizeObserver(meet).observe(sh); addEventListener('resize', meet);
    window.wsSheet = { setIn: setIn };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
