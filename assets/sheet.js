/* De contact-sheet (#32) — bouwt de markup en doet het gedrag. Eén bron voor /voor-ouders, pakket en betaal.
   Gebruik:  <script src="assets/sheet.js" data-trigger="hero|direct" data-regel="…"></script>
     data-trigger="hero"   → het blad is WEG zolang de opening (.hero) in beeld is; voorbij de hero glijdt het in,
                             terug naar boven glijdt het weer weg (hysterese van 24px, dus geen flikker op de grens).
     data-trigger="direct" → het blad glijdt kort na het laden in (pakket / betaal: daar is geen hero).
     data-regel            → de lichte regel in de gedokte rij (per scherm), standaard "Even bellen? Ik neem zelf op."
   Gedrag: tik op de rij = open/dicht; slepen volgt de vinger (rubber-band), loslaten snapt op positie + snelheid (telefoon);
   op brede schermen groeit het blad op zijn plek. Dim-tik, kruisje, omlaag slepen of Esc = dicht. Bel/app werkt in elke stand. */
(function () {
  var me = document.currentScript || (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var TRIGGER = (me && me.getAttribute('data-trigger')) || 'direct';
  var REGEL = (me && me.getAttribute('data-regel')) || 'Heb je een vraag? Bel me gerust.';
  var TEL = 'tel:+31630231640';
  var WA = 'https://wa.me/31630231640?text=Hoi%20Philip%2C%20ik%20heb%20een%20vraag%20over%20WisWiz%20voor%20mijn%20kind.';
  var SVG_WA = '<svg viewBox="0 0 448 512" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>';
  var SVG_TEL = '<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>';
  var SVG_X = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>';

  var html =
    '<div class="ws-dim" id="ws-dim" aria-hidden="true"></div>' +
    '<section class="ws-sheet" id="ws-sheet" aria-label="Contact met Philip">' +
      '<div class="ws-in">' +
        '<span class="ws-grab" aria-hidden="true"><i></i><i></i></span>' +
        '<div class="ws-peek" id="ws-peek" role="button" tabindex="0" aria-expanded="false" aria-controls="ws-body" aria-label="Over Philip en contact">' +
          '<img src="assets/philip.png" alt="" width="36" height="36" />' +
          '<span class="ws-lijn"><span class="ws-naam">Hoi! Ik ben Philip</span><span class="ws-regel">' + REGEL + '</span></span>' +
          '<span class="ws-acties">' +
            '<a class="ws-icon ws-wa" href="' + WA + '" target="_blank" rel="noopener" data-cta="whatsapp" aria-label="WhatsApp Philip">' + SVG_WA + '</a>' +
            '<a class="ws-icon ws-tel" href="' + TEL + '" data-cta="bel-bar" aria-label="Bel Philip, 06 30 23 16 40">' + SVG_TEL + '</a>' +
          '</span>' +
        '</div>' +
        '<div class="ws-body" id="ws-body"><div class="ws-body-in">' +
          '<button class="ws-sluit" type="button" id="ws-sluit" aria-label="Sluiten">' + SVG_X + '</button>' +
          '<div class="ws-over">' +
            '<img src="assets/philip.png" alt="Philip" width="56" height="56" />' +
            '<h2 class="ws-kop">Hoi! Ik ben Philip, een van de ontwikkelaars van WisWiz.</h2>' +
          '</div>' +
          '<p class="ws-tekst">In WisWiz stoppen we alles wat we in jaren bijles geven hebben geleerd. Heb je nog vragen? Bel me gerust.</p>' +
          '<div class="ws-knoppen">' +
            '<a class="ws-btn ws-tel" href="' + TEL + '" data-cta="bel-sheet">' + SVG_TEL + 'Bel Philip <span class="ws-nr">06&nbsp;30&nbsp;23&nbsp;16&nbsp;40</span></a>' +
            '<a class="ws-btn ws-wa" href="' + WA + '" target="_blank" rel="noopener" data-cta="whatsapp-sheet">' + SVG_WA + 'App via WhatsApp</a>' +
          '</div>' +
        '</div></div>' +
      '</div>' +
    '</section>';

  function init() {
    var wrap = document.createElement('div'); wrap.innerHTML = html;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    var sh = document.getElementById('ws-sheet'), dim = document.getElementById('ws-dim'), peek = document.getElementById('ws-peek'), sluit = document.getElementById('ws-sluit');
    var desk = window.matchMedia('(min-width: 768px)');
    var open = false, shown = false;
    var safeProbe = document.createElement('div'); safeProbe.style.cssText = 'position:fixed;left:-9999px;height:env(safe-area-inset-bottom,0px);width:1px;'; document.body.appendChild(safeProbe);

    function setIn(v) { if (shown === v) return; shown = v; if (!v && open) setOpen(false); sh.classList.toggle('is-in', v); try { sh.inert = !v; } catch (_) {} sh.setAttribute('aria-hidden', v ? 'false' : 'true'); }
    function setOpen(o) { open = o; sh.classList.toggle('is-open', o); dim.classList.toggle('is-on', o); peek.setAttribute('aria-expanded', o ? 'true' : 'false');
      sh.style.setProperty('--dy', '0px'); sh.style.removeProperty('--p'); dim.style.opacity = ''; dim.style.pointerEvents = ''; }

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

    // --- slepen (telefoon) + tik ---
    var dragging = false, y0 = 0, t0 = 0, lastY = 0, lastT = 0, startOpen = false, moved = false, tapOK = true, lastToggle = 0;
    function peekPx() { var v = parseFloat(getComputedStyle(sh).getPropertyValue('--peek')); return isFinite(v) ? v : 78; }
    function travel() { // afstand tussen gedokt en open: de hoogte van het open blad (rij ingeklapt tot 8px) min de gedokte hoogte (--peek) en de safe-area
      var H = sh.getBoundingClientRect().height - (startOpen ? 0 : Math.max(0, peek.offsetHeight - 8)); return Math.max(80, H - peekPx() - safeProbe.offsetHeight); }
    function rubber(d, max) { var s = 0.55, c = max * 0.35; return d > 0 ? c * (1 - Math.exp(-d * s / c)) : -c * (1 - Math.exp(d * s / c)); }
    function down(e) { if (e.target.closest && e.target.closest('a,button')) return; if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; moved = false; startOpen = open; y0 = lastY = e.clientY; t0 = lastT = e.timeStamp;
      tapOK = !open || !!(e.target.closest && e.target.closest('.ws-peek,.ws-grab'));  // open blad: een tik op de tekst sluit niet
      if (!desk.matches) { sh.classList.add('is-drag'); } try { sh.setPointerCapture(e.pointerId); } catch (_) {} }
    function move(e) { if (!dragging) return; var d = e.clientY - y0; if (Math.abs(d) > 4) moved = true; if (desk.matches) return; var T = travel(), dy;
      if (startOpen) { dy = d < 0 ? rubber(d, T) : Math.min(d, T + rubber(Math.max(0, d - T), T)); }
      else { dy = d > 0 ? rubber(d, T) : Math.max(d, -T + rubber(Math.min(0, d + T), T)); }
      sh.style.setProperty('--dy', dy + 'px'); lastT = e.timeStamp; lastY = e.clientY;
      var p = startOpen ? 1 - Math.min(1, Math.max(0, dy / T)) : Math.min(1, Math.max(0, -dy / T));
      sh.style.setProperty('--p', p.toFixed(3)); dim.style.opacity = p; if (!startOpen) dim.style.pointerEvents = -dy > 8 ? 'auto' : 'none'; }
    function up(e) { if (!dragging) return; dragging = false; sh.classList.remove('is-drag');
      var d = e.clientY - y0, v = (e.clientY - lastY) / Math.max(1, e.timeStamp - lastT), T = travel();
      if (!moved || desk.matches) { if (tapOK) { setOpen(!startOpen); lastToggle = e.timeStamp; } return; }
      var target = startOpen ? !(d > T * 0.33 || v > 0.5) : (-d > T * 0.33 || v < -0.5);
      setOpen(target); }
    sh.addEventListener('pointerdown', down); sh.addEventListener('pointermove', move); sh.addEventListener('pointerup', up); sh.addEventListener('pointercancel', up);
    peek.addEventListener('click', function (e) { // tik/klik opent altijd — ook als de pointer-reeks niet (volledig) aankwam; niet dubbel na de pointer-tik hierboven
      if (e.target.closest && e.target.closest('a')) return; if (moved || e.timeStamp - lastToggle < 600) return; setOpen(!open); lastToggle = e.timeStamp; });
    peek.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } });
    dim.addEventListener('click', function () { setOpen(false); });
    sluit.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setOpen(false); });
    window.wsSheet = { setOpen: setOpen, setIn: setIn };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
