#!/usr/bin/env python3
"""contact/build.py — bouwt de contact/vertrouwen-varianten (#32, Philip 19 aug: "probeer alles").

Leest ../index.html (de nachtstand van /voor-ouders) en ../pakket.html (kaartjes+planeten) en schrijft per variant een
volledig werkende pagina in deze map: <x>.html (= /voor-ouders met die variant) en pakket-<x>.html (= de pakketkeuze met
die variant). De hoofdpagina's zelf blijven onaangeraakt — dit is een keuzeronde. Draai opnieuw na elke wijziging aan de
basis: `python3 contact/build.py`.

Varianten (zie index.html in deze map):
  A  splits de rollen: bar puur nut + Philip-moment in de pagina
  B  geen vaste balk: Bel-of-app-Philip-blok bij de CTA en op de pakketkeuze
  C  slanke balk die pas NA de hero verschijnt
  D  founder-forward op de pakketkeuze ("Twijfel je welk pakket? Bel me even")
  E  Apple-achtige slide-bar (bottom sheet met grabber, sleepbaar, spring)
  F  combinatie: A's Philip-moment + C's late balk + D op de pakketkeuze (aanbeveling)
  G  drijvende Philip-knop (pill rechtsonder, opent Bel/App)
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

TEL = "tel:+31630231640"
WA = "https://wa.me/31630231640?text=Hoi%20Philip%2C%20ik%20heb%20een%20vraag%20over%20WisWiz%20voor%20mijn%20kind."
NR = "06&nbsp;30&nbsp;23&nbsp;16&nbsp;40"
SVG_WA = '<svg viewBox="0 0 448 512" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>'
SVG_TEL = '<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>'

# ---------------------------------------------------------------------------------------------------------------------
# Gedeelde stijl (cv- namespace; de site-tokens komen uit de pagina zelf)
# ---------------------------------------------------------------------------------------------------------------------
COMMON_CSS = r"""
/* ===== contact-varianten (#32): gedeelde knoppen/blokken in de site-taal ===== */
.cv-btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 48px; padding: 12px 18px; border-radius: 12px;
  background: #fff; color: var(--gray-950); font-size: 15.5px; font-weight: 700; letter-spacing: -0.005em; border: 1px solid var(--gray-300);
  box-shadow: 0 2px 0 rgba(17,24,39,.12); -webkit-tap-highlight-color: transparent; transition: transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease; cursor: pointer; }
.cv-btn:hover { border-color: #9ca3af; background: #f9fafb; transform: translateY(-1px); }
.cv-btn:active { transform: translateY(1px); box-shadow: 0 0 0 rgba(17,24,39,.12); }
.cv-btn svg { width: 18px; height: 18px; flex: none; }
.cv-btn.cv-tel svg { fill: var(--info-dark); width: 16px; height: 16px; }
.cv-btn.cv-wa svg { fill: #1da851; }
.cv-btn .cv-nr { color: var(--gray-500); font-weight: 500; font-variant-numeric: tabular-nums; }
/* getinte varianten (de V2-tinten van de nacht-bar): lezen meteen als appen / bellen, blijven rustig naast de gele CTA */
.cv-btn.cv-tint.cv-wa { background: #e7f8ee; border-color: #cdeedb; color: #0f6e35; } .cv-btn.cv-tint.cv-wa:hover { background: #d9f3e3; }
.cv-btn.cv-tint.cv-tel { background: #e8f1fb; border-color: #cfe1f5; color: #174f80; } .cv-btn.cv-tint.cv-tel:hover { background: #dbe9f8; }
/* grote, volle knoppen (B): zwart voor bellen (de hoofdactie), WhatsApp-groen voor appen */
.cv-btn.cv-big { min-height: 54px; font-size: 16.5px; border-radius: 12px; }
.cv-btn.cv-fill.cv-tel { background: var(--gray-950); border-color: var(--gray-950); color: #fff; box-shadow: 0 6px 18px rgba(3,7,18,.18); } .cv-btn.cv-fill.cv-tel svg { fill: #fff; } .cv-btn.cv-fill.cv-tel:hover { background: #111827; }
.cv-btn.cv-fill.cv-tel .cv-nr { color: rgba(255,255,255,.72); }
.cv-icon { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 9999px; background: #fff; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(15,23,42,.06); -webkit-tap-highlight-color: transparent; transition: background .15s ease, transform .15s ease; }
.cv-icon::after { content: ""; position: absolute; inset: -4px; border-radius: inherit; }
.cv-icon svg { width: 20px; height: 20px; }
.cv-icon.cv-wa { background: #e7f8ee; border-color: #cdeedb; } .cv-icon.cv-wa svg { fill: #1da851; }
.cv-icon.cv-tel { background: #e8f1fb; border-color: #cfe1f5; } .cv-icon.cv-tel svg { fill: var(--info-dark); width: 18px; height: 18px; }
.cv-icon:active { transform: translateY(1px); }
/* terug-chip naar het overzicht (alleen preview-hulp, verdwijnt bij scrollen) */
.cv-chip { position: fixed; top: calc(6px + env(safe-area-inset-top, 0px)); left: 8px; z-index: 1200; display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px 0 7px; border-radius: 9999px;
  background: rgba(3,7,18,.72); color: #fff; font-size: 11.5px; font-weight: 700; letter-spacing: .01em; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); transition: opacity .25s ease, transform .25s ease; }
.cv-chip b { color: var(--mathyellow); }
.cv-chip.is-weg { opacity: 0; transform: translateY(-8px); pointer-events: none; }

/* --- het Philip-moment (A, F): foto + één warme alinea + bel/app, direct onder de opening — géén kaart (tekst op de achtergrond) --- */
.cv-moment { display: flex; gap: 16px; align-items: flex-start; width: 100%; max-width: 32rem; margin: 56px auto 0; padding: 0 2px; text-align: left; }
.cv-moment img { flex: none; width: 64px; height: 64px; border-radius: 9999px; object-fit: cover; box-shadow: 0 0 0 3px #fff, 0 2px 8px rgba(15,23,42,.18); }
.cv-moment .cv-tekst { min-width: 0; flex: 1 1 auto; }
.cv-moment .cv-kop { margin: 0; font-size: 17px; font-weight: 700; line-height: 1.35; letter-spacing: -0.005em; }
.cv-moment p { margin: 6px 0 0; font-size: 16px; line-height: 1.55; color: var(--gray-950); text-wrap: pretty; }
.cv-moment .cv-knoppen { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.cv-moment .cv-knoppen .cv-btn { flex: 1 1 140px; min-height: 46px; padding: 10px 14px; font-size: 15px; }
.cv-moment .cv-sub { margin: 10px 0 0; font-size: 13px; color: var(--gray-500); font-variant-numeric: tabular-nums; }
@media (max-width: 374px) { .cv-moment { gap: 12px; } .cv-moment img { width: 54px; height: 54px; } }

/* --- het Bel-of-app-Philip-blok (B): het contact als eigen, prominent element — foto, kop, één regel, twee grote knoppen --- */
.cv-blok { width: 100%; max-width: var(--col, 384px); margin: 56px auto 0; text-align: center; }
.cv-blok img { width: 84px; height: 84px; border-radius: 9999px; object-fit: cover; margin: 0 auto; box-shadow: 0 0 0 4px #fff, 0 4px 14px rgba(15,23,42,.18); }
.cv-blok h2 { margin: 16px 0 0; font-size: 22px; font-weight: 800; line-height: 1.25; letter-spacing: -0.01em; }
.cv-blok p { margin: 8px 0 0; font-size: 16px; line-height: 1.55; color: var(--gray-950); text-wrap: pretty; }
.cv-blok .cv-knoppen { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
.cv-blok .cv-sub { margin: 10px 0 0; font-size: 13px; color: var(--gray-500); }

/* --- slanke nut-bar (A, C, F): één regel 'Vragen? Bel of app Philip' + de twee iconen; 52px --- */
.cv-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 900; background: rgba(255,255,255,.96); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  border-top: 1px solid rgba(191,219,254,.55); box-shadow: 0 -8px 24px rgba(15,23,42,.05); padding: 6px var(--pad) calc(6px + env(safe-area-inset-bottom, 0px)); }
.cv-bar-in { max-width: 520px; margin: 0 auto; display: flex; align-items: center; gap: 10px; min-height: 40px; }
.cv-bar-wie { display: flex; align-items: center; gap: 9px; min-width: 0; flex: 1 1 auto; }
.cv-bar-wie img { flex: none; width: 28px; height: 28px; border-radius: 9999px; object-fit: cover; box-shadow: 0 0 0 2px #fff, 0 1px 3px rgba(15,23,42,.2); }
.cv-bar-txt { font-size: 14.5px; font-weight: 500; color: var(--gray-950); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cv-bar-txt b { font-weight: 700; }
.cv-bar-knoppen { display: flex; gap: 8px; flex: none; }
@media (min-width: 640px) { .cv-bar-in { max-width: 560px; } }
/* C/F: de bar staat weg tot je voorbij de opening bent, en schuift dan van onder in (één zachte beweging; terug naar boven = weer weg) */
.cv-bar.cv-laat { transform: translateY(110%); transition: transform .42s cubic-bezier(.32,.72,0,1); will-change: transform; }
.cv-bar.cv-laat.is-zichtbaar { transform: translateY(0); }
@media (prefers-reduced-motion: reduce) { .cv-bar.cv-laat { transition: none; } }

/* --- founder-forward op de pakketkeuze (D, F): direct onder de vraag, vóór de kaarten --- */
.cv-founder { display: flex; align-items: center; gap: 12px; width: 100%; margin: 14px auto 0; padding: 0 2px; text-align: left; }
.cv-founder img { flex: none; width: 44px; height: 44px; border-radius: 9999px; object-fit: cover; box-shadow: 0 0 0 2px #fff, 0 1px 6px rgba(15,23,42,.18); }
.cv-founder p { margin: 0; min-width: 0; flex: 1 1 auto; font-size: 14.5px; line-height: 1.45; color: var(--gray-950); text-wrap: pretty; }
.cv-founder p small { display: block; margin-top: 1px; font-size: 12.5px; color: var(--gray-500); }
.cv-founder .cv-btn { flex: none; min-height: 42px; padding: 8px 14px; font-size: 14.5px; border-radius: 9999px; }
@media (max-width: 374px) { .cv-founder { flex-wrap: wrap; } .cv-founder .cv-btn { flex: 1 1 100%; } }
.cv-founder-wrap { margin: 0; }
"""

CHIP_JS = r"""
(function(){ var c=document.getElementById('cv-chip'); if(!c) return; function t(){ c.classList.toggle('is-weg', (window.scrollY||0)>40); } document.addEventListener('scroll',t,{passive:true}); t(); })();
"""

def chip(letter, titel, back="index.html"):
    return f'<a class="cv-chip" id="cv-chip" href="{back}" aria-label="Terug naar het overzicht van de varianten"><b>{letter}</b> {titel} · ‹ overzicht</a>\n'

def moment(prefix=""):
    return f'''
      <!-- Philip-moment (variant A/F): het vertrouwensverhaal staat IN de pagina, direct onder de opening, vlak bij de CTA — foto, één warme alinea, bel/app -->
      <section class="cv-moment" aria-label="Philip, oprichter van WisWiz">
        <img src="{prefix}assets/philip.png" alt="Philip" width="64" height="64" />
        <div class="cv-tekst">
          <p class="cv-kop">Hoi, ik ben Philip, oprichter van WisWiz.</p>
          <p>Twijfel je of WisWiz iets is voor jouw kind? Bel of app me even. Ik neem altijd zelf op en denk graag met je mee.</p>
          <div class="cv-knoppen">
            <a class="cv-btn cv-tel" href="{TEL}" data-cta="bel-moment">{SVG_TEL}Bel Philip</a>
            <a class="cv-btn cv-wa" href="{WA}" target="_blank" rel="noopener" data-cta="whatsapp-moment">{SVG_WA}App Philip</a>
          </div>
          <p class="cv-sub">{NR} · Philip Pinckaers, WisWiz B.V.</p>
        </div>
      </section>
'''

def blok(prefix="", pakket=False):
    kop = "Twijfel je nog? Bel Philip." if not pakket else "Twijfel je welk pakket? Bel Philip."
    regel = ("Ik ben Philip, oprichter van WisWiz. Ik neem altijd zelf op en vertel je eerlijk of WisWiz iets is voor jouw kind."
             if not pakket else
             "Ik ben Philip, oprichter van WisWiz. Ik neem altijd zelf op en denk met je mee welk pakket past.")
    return f'''
      <!-- Bel-of-app-Philip-blok (variant B): geen vaste balk; het contact is een prominent element met foto en grote knoppen -->
      <section class="cv-blok" aria-label="Bel of app Philip">
        <img src="{prefix}assets/philip.png" alt="Philip" width="84" height="84" />
        <h2>{kop}</h2>
        <p>{regel}</p>
        <div class="cv-knoppen">
          <a class="cv-btn cv-big cv-fill cv-tel" href="{TEL}" data-cta="bel-blok">{SVG_TEL}Bel Philip <span class="cv-nr">{NR}</span></a>
          <a class="cv-btn cv-big cv-tint cv-wa" href="{WA}" target="_blank" rel="noopener" data-cta="whatsapp-blok">{SVG_WA}App Philip via WhatsApp</a>
        </div>
      </section>
'''

def bar(prefix="", laat=False, avatar=True):
    cls = "cv-bar" + (" cv-laat" if laat else "")
    av = f'<img src="{prefix}assets/philip.png" alt="" width="28" height="28" />' if avatar else ""
    return f'''
  <nav class="{cls}" id="cv-bar" aria-label="Contact met Philip">
    <div class="cv-bar-in">
      <div class="cv-bar-wie">{av}<span class="cv-bar-txt"><b>Vragen?</b> Bel of app Philip</span></div>
      <div class="cv-bar-knoppen">
        <a class="cv-icon cv-wa" href="{WA}" target="_blank" rel="noopener" data-cta="whatsapp" aria-label="WhatsApp Philip">{SVG_WA}</a>
        <a class="cv-icon cv-tel" href="{TEL}" data-cta="bel-bar" aria-label="Bel Philip, 06 30 23 16 40">{SVG_TEL}</a>
      </div>
    </div>
  </nav>
'''

LAAT_JS = r"""
(function(){ // C/F: de bar verschijnt pas als de opening (hero + CTA) voorbij is; scroll je terug, dan gaat hij weer weg
  var bar=document.getElementById('cv-bar'), hero=document.querySelector('.hero'), pk=document.querySelector('.cv-pk-trigger'); var ref=hero||pk; if(!bar||!ref) return;
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ var e=es[0]; var voorbij=!e.isIntersecting && e.boundingClientRect.bottom<0; bar.classList.toggle('is-zichtbaar',voorbij); },{threshold:0, rootMargin:'0px 0px 0px 0px'}).observe(ref); }
  else { function t(){ bar.classList.toggle('is-zichtbaar', ref.getBoundingClientRect().bottom<0); } document.addEventListener('scroll',t,{passive:true}); t(); }
})();
"""

def founder(prefix=""):
    return f'''
  <!-- founder-forward (variant D/F): op het beslismoment, vóór de kaarten — Philip zelf, één zin, belknop -->
  <div class="cv-founder">
    <img src="{prefix}assets/philip.png" alt="Philip" width="44" height="44" />
    <p>Twijfel je welk pakket? Bel me even, ik denk met je mee.<small>Philip, oprichter van WisWiz · {NR}</small></p>
    <a class="cv-btn cv-tint cv-tel" href="{TEL}" data-cta="bel-founder">{SVG_TEL}Bel Philip</a>
  </div>
'''

# ---------------------------------------------------------------------------------------------------------------------
# E — Apple-achtige slide-bar (bottom sheet)
# ---------------------------------------------------------------------------------------------------------------------
E_CSS = r"""
/* ===== E — Apple-achtige slide-bar: de bar IS een bottom sheet. In rust 'dokt' hij onderaan (grabber, ronde bovenhoeken, Philip +
   'Vragen? App of bel me' + de twee iconen). Tik of sleep omhoog → het blad glijdt omhoog (de iOS sheet-curve, cubic-bezier(.32,.72,0,1))
   met een gedimde achtergrond; sleep omlaag, tik buiten, Esc of 'Sluit' → terug. Tijdens slepen volgt het blad je vinger, voorbij de
   randen met rubber-band, loslaten snapt op positie + snelheid. ===== */
.cv-sheet-dim { position: fixed; inset: 0; z-index: 899; background: rgba(3,7,18,.28); opacity: 0; pointer-events: none; transition: opacity .4s ease; }
.cv-sheet-dim.is-on { opacity: 1; pointer-events: auto; }
.cv-sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 900; --peek: 64px; --dy: 0px;
  background: rgba(255,255,255,.9); -webkit-backdrop-filter: blur(24px) saturate(180%); backdrop-filter: blur(24px) saturate(180%);
  border-radius: 20px 20px 0 0; box-shadow: 0 -1px 0 rgba(15,23,42,.06), 0 -12px 36px rgba(15,23,42,.10);
  padding: 0 var(--pad) calc(14px + env(safe-area-inset-bottom, 0px)); touch-action: none;
  transform: translateY(calc(100% - var(--peek) - env(safe-area-inset-bottom, 0px) + var(--dy)));
  transition: transform .55s cubic-bezier(.32,.72,0,1); will-change: transform; }
.cv-sheet.is-drag { transition: none; }
.cv-sheet.is-open { transform: translateY(var(--dy)); }
@media (prefers-reduced-motion: reduce) { .cv-sheet, .cv-sheet-dim { transition: none; } }
.cv-sheet-in { max-width: 520px; margin: 0 auto; }
.cv-grab { display: block; width: 36px; height: 5px; border-radius: 3px; background: #c7c7cc; margin: 7px auto 0; }
.cv-peek { display: flex; align-items: center; gap: 11px; height: 52px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.cv-peek img { flex: none; width: 38px; height: 38px; border-radius: 9999px; object-fit: cover; box-shadow: 0 0 0 2px #fff, 0 1px 4px rgba(15,23,42,.2); }
.cv-peek .cv-lijn { min-width: 0; flex: 1 1 auto; line-height: 1.25; }
.cv-peek .cv-naam { display: block; font-size: 15px; font-weight: 700; letter-spacing: -0.005em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cv-peek .cv-rol { display: block; font-size: 13px; color: var(--gray-500); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
.cv-peek .cv-bar-knoppen { flex: none; }
.cv-sheet-body { padding-top: 10px; }
.cv-sheet-body .cv-over { display: flex; gap: 14px; align-items: center; }
.cv-sheet-body .cv-over img { flex: none; width: 64px; height: 64px; border-radius: 9999px; object-fit: cover; box-shadow: 0 0 0 3px #fff, 0 2px 8px rgba(15,23,42,.18); }
.cv-sheet-body .cv-over .cv-h { font-size: 19px; font-weight: 800; letter-spacing: -0.01em; line-height: 1.2; }
.cv-sheet-body .cv-over .cv-s { font-size: 13.5px; color: var(--gray-500); font-weight: 500; margin-top: 3px; }
.cv-sheet-body p.cv-zin { margin: 14px 0 0; font-size: 16px; line-height: 1.55; color: var(--gray-950); text-wrap: pretty; }
.cv-sheet-body .cv-knoppen { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
.cv-sheet-body .cv-knoppen .cv-btn { min-height: 52px; font-size: 16.5px; border-radius: 14px; }
.cv-sheet-body .cv-sluit { display: block; width: 100%; margin: 8px 0 0; padding: 12px; border: 0; background: none; font: inherit; font-size: 15px; font-weight: 600; color: var(--info-dark); cursor: pointer; -webkit-tap-highlight-color: transparent; }
/* de peek-rij (foto, naam, iconen) vervaagt naarmate het blad opent — tijdens slepen volgt --p (0..1) de vinger, bij tik animeert hij mee */
.cv-sheet .cv-peek img, .cv-sheet .cv-peek .cv-lijn, .cv-sheet .cv-peek .cv-bar-knoppen { opacity: calc(1 - var(--p, 0)); transition: opacity .3s ease; }
.cv-sheet.is-drag .cv-peek img, .cv-sheet.is-drag .cv-peek .cv-lijn, .cv-sheet.is-drag .cv-peek .cv-bar-knoppen { transition: none; }
.cv-sheet.is-open { --p: 1; }
.cv-sheet.is-open .cv-peek .cv-bar-knoppen { pointer-events: none; }
.cv-sheet.is-open .cv-peek { height: 8px; }
.cv-sheet .cv-peek { transition: height .55s cubic-bezier(.32,.72,0,1); }
.cv-sheet.is-drag .cv-peek { transition: none; }
"""

def e_sheet(prefix=""):
    return f'''
  <div class="cv-sheet-dim" id="cv-dim" aria-hidden="true"></div>
  <section class="cv-sheet" id="cv-sheet" aria-label="Contact met Philip">
    <div class="cv-sheet-in">
      <span class="cv-grab" aria-hidden="true"></span>
      <div class="cv-peek" id="cv-peek" role="button" tabindex="0" aria-expanded="false" aria-controls="cv-sheet-body" aria-label="Over Philip en contact">
        <img src="{prefix}assets/philip.png" alt="" width="38" height="38" />
        <span class="cv-lijn"><span class="cv-naam">Philip · oprichter van WisWiz</span><span class="cv-rol">Vragen? App of bel me</span></span>
        <span class="cv-bar-knoppen">
          <a class="cv-icon cv-wa" href="{WA}" target="_blank" rel="noopener" data-cta="whatsapp" aria-label="WhatsApp Philip">{SVG_WA}</a>
          <a class="cv-icon cv-tel" href="{TEL}" data-cta="bel-bar" aria-label="Bel Philip, 06 30 23 16 40">{SVG_TEL}</a>
        </span>
      </div>
      <div class="cv-sheet-body" id="cv-sheet-body">
        <div class="cv-over">
          <img src="{prefix}assets/philip.png" alt="Philip" width="64" height="64" />
          <div><div class="cv-h">Philip Pinckaers</div><div class="cv-s">Oprichter van WisWiz · wiskundestudent TU Delft</div></div>
        </div>
        <p class="cv-zin">Hoi! Ik ben Philip, een van de ontwikkelaars van WisWiz. In WisWiz stoppen we alles wat we in jaren bijles geven hebben geleerd. Heb je nog vragen, of twijfel je of het iets is voor jouw kind? App of bel me gerust — ik neem altijd zelf op.</p>
        <div class="cv-knoppen">
          <a class="cv-btn cv-fill cv-tel" href="{TEL}" data-cta="bel-sheet">{SVG_TEL}Bel Philip <span class="cv-nr">{NR}</span></a>
          <a class="cv-btn cv-tint cv-wa" href="{WA}" target="_blank" rel="noopener" data-cta="whatsapp-sheet">{SVG_WA}App Philip via WhatsApp</a>
        </div>
        <button class="cv-sluit" type="button" id="cv-sluit">Sluit</button>
      </div>
    </div>
  </section>
'''

E_JS = r"""
(function(){ // E — bottom sheet: tik opent/sluit, slepen volgt de vinger (rubber-band), loslaten snapt; dim sluit; Esc sluit
  var sh=document.getElementById('cv-sheet'), dim=document.getElementById('cv-dim'), peek=document.getElementById('cv-peek'), sluit=document.getElementById('cv-sluit'); if(!sh||!dim||!peek) return;
  var open=false, dragging=false, y0=0, t0=0, lastY=0, lastT=0, startOpen=false, moved=false;
  function setOpen(o){ open=o; sh.classList.toggle('is-open',o); dim.classList.toggle('is-on',o); peek.setAttribute('aria-expanded',o?'true':'false'); sh.style.setProperty('--dy','0px'); sh.style.removeProperty('--p'); }
  function travel(){ // afstand tussen dicht en open (px)
    var r=sh.getBoundingClientRect(); var peekH=64+ (parseFloat(getComputedStyle(sh).paddingBottom)||0)-14; return Math.max(80, r.height-peekH); }
  function rubber(d,max){ var s=0.55, c=max*0.35; return d>0? c*(1-Math.exp(-d*s/c)) : -c*(1-Math.exp(d*s/c)); }
  function down(e){ if(e.target.closest && e.target.closest('a,button.cv-sluit')) return; dragging=true; moved=false; startOpen=open; y0=lastY=e.clientY; t0=lastT=e.timeStamp; sh.classList.add('is-drag'); try{ sh.setPointerCapture(e.pointerId); }catch(_){} }
  function move(e){ if(!dragging) return; var d=e.clientY-y0; if(Math.abs(d)>4) moved=true; var T=travel(), dy;
    if(startOpen){ dy = d<0 ? rubber(d,T) : Math.min(d,T+rubber(Math.max(0,d-T),T)); }          // open: omlaag = sluiten, omhoog = rubber
    else { dy = d>0 ? rubber(d,T) : Math.max(d,-T+rubber(Math.min(0,d+T),T)); }                   // dicht: omhoog = openen, omlaag = rubber
    sh.style.setProperty('--dy', dy+'px'); lastT=e.timeStamp; lastY=e.clientY; var p = startOpen ? 1-Math.min(1,Math.max(0,dy/T)) : Math.min(1,Math.max(0,-dy/T)); sh.style.setProperty('--p', p.toFixed(3)); dim.style.opacity=p; if(!startOpen) dim.style.pointerEvents= -dy>8?'auto':'none'; }
  function up(e){ if(!dragging) return; dragging=false; sh.classList.remove('is-drag'); var d=e.clientY-y0, dt=Math.max(1,e.timeStamp-t0), v=(e.clientY-lastY)/Math.max(1,e.timeStamp-lastT), T=travel();
    dim.style.opacity=''; dim.style.pointerEvents='';
    if(!moved){ setOpen(!startOpen); return; }                          // tik = toggle
    var target = startOpen ? !(d>T*0.33 || v>0.5) : (-d>T*0.33 || v<-0.5); // positie of snelheid beslist
    setOpen(target); }
  sh.addEventListener('pointerdown',down); sh.addEventListener('pointermove',move); sh.addEventListener('pointerup',up); sh.addEventListener('pointercancel',up);
  peek.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setOpen(!open); } });
  dim.addEventListener('click',function(){ setOpen(false); });
  if(sluit) sluit.addEventListener('click',function(){ setOpen(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&open) setOpen(false); });
  window.cvSheet={setOpen:setOpen};
})();
"""

# ---------------------------------------------------------------------------------------------------------------------
# G — drijvende Philip-knop
# ---------------------------------------------------------------------------------------------------------------------
G_CSS = r"""
/* ===== G — drijvende Philip-knop: een pill rechtsonder met zijn foto en 'Bel Philip'; tik opent een klein blad met één regel en
   Bel / App. Geen balk over de hele breedte, dus de pagina blijft vrij; de knop is altijd binnen duimbereik. ===== */
.cv-fab-wrap { position: fixed; right: 14px; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); z-index: 900; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.cv-fab { display: inline-flex; align-items: center; gap: 9px; height: 50px; padding: 0 16px 0 6px; border-radius: 9999px; border: 1px solid rgba(15,23,42,.08);
  background: rgba(255,255,255,.96); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); box-shadow: 0 6px 20px rgba(15,23,42,.16), 0 1px 2px rgba(15,23,42,.08);
  font: inherit; font-size: 15px; font-weight: 700; color: var(--gray-950); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform .2s cubic-bezier(.32,.72,0,1), box-shadow .2s ease; }
.cv-fab:active { transform: scale(.97); }
.cv-fab img { width: 38px; height: 38px; border-radius: 9999px; object-fit: cover; box-shadow: 0 0 0 2px #fff; }
.cv-pop { width: min(320px, calc(100vw - 28px)); padding: 16px 16px 14px; border-radius: 18px; background: #fff; border: 1px solid rgba(15,23,42,.06); box-shadow: 0 16px 40px rgba(15,23,42,.18), 0 2px 6px rgba(15,23,42,.08);
  transform-origin: bottom right; transform: scale(.92) translateY(8px); opacity: 0; pointer-events: none; transition: transform .32s cubic-bezier(.32,.72,0,1), opacity .25s ease; text-align: left; }
.cv-pop.is-open { transform: none; opacity: 1; pointer-events: auto; }
.cv-pop .cv-kop { display: flex; align-items: center; gap: 11px; }
.cv-pop .cv-kop img { width: 46px; height: 46px; border-radius: 9999px; object-fit: cover; box-shadow: 0 0 0 2px #fff, 0 1px 4px rgba(15,23,42,.18); }
.cv-pop .cv-kop b { display: block; font-size: 16px; letter-spacing: -0.005em; } .cv-pop .cv-kop small { display: block; font-size: 13px; color: var(--gray-500); font-weight: 500; margin-top: 1px; }
.cv-pop p { margin: 12px 0 0; font-size: 15px; line-height: 1.5; color: var(--gray-950); text-wrap: pretty; }
.cv-pop .cv-knoppen { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.cv-pop .cv-knoppen .cv-btn { min-height: 48px; }
"""

def g_fab(prefix=""):
    return f'''
  <div class="cv-fab-wrap" id="cv-fab-wrap">
    <div class="cv-pop" id="cv-pop" role="dialog" aria-label="Contact met Philip">
      <div class="cv-kop"><img src="{prefix}assets/philip.png" alt="" width="46" height="46" /><div><b>Philip Pinckaers</b><small>Oprichter van WisWiz</small></div></div>
      <p>Twijfel je of WisWiz iets is voor jouw kind? Bel of app me even — ik neem altijd zelf op.</p>
      <div class="cv-knoppen">
        <a class="cv-btn cv-fill cv-tel" href="{TEL}" data-cta="bel-fab">{SVG_TEL}Bel Philip <span class="cv-nr">{NR}</span></a>
        <a class="cv-btn cv-tint cv-wa" href="{WA}" target="_blank" rel="noopener" data-cta="whatsapp-fab">{SVG_WA}App via WhatsApp</a>
      </div>
    </div>
    <button class="cv-fab" type="button" id="cv-fab" aria-expanded="false" aria-controls="cv-pop"><img src="{prefix}assets/philip.png" alt="" width="38" height="38" />Bel Philip</button>
  </div>
'''

G_JS = r"""
(function(){ var b=document.getElementById('cv-fab'), p=document.getElementById('cv-pop'), w=document.getElementById('cv-fab-wrap'); if(!b||!p) return;
  function set(o){ p.classList.toggle('is-open',o); b.setAttribute('aria-expanded',o?'true':'false'); }
  b.addEventListener('click',function(){ set(!p.classList.contains('is-open')); });
  document.addEventListener('pointerdown',function(e){ if(p.classList.contains('is-open')&&!w.contains(e.target)) set(false); },{passive:true});
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') set(false); });
})();
"""

# ---------------------------------------------------------------------------------------------------------------------
# samenstellen
# ---------------------------------------------------------------------------------------------------------------------
def rel(html):
    """relatieve paden één map omhoog (de varianten staan in contact/)."""
    html = re.sub(r'(href|src|poster)="(assets/|pakket\.html|gegevens\.html|betaal\.html|gelukt\.html|manifest\.json|sw\.js)', r'\1="../\2', html)
    html = html.replace('navigator.serviceWorker.register("sw.js")', 'navigator.serviceWorker.register("../sw.js")')
    html = html.replace('<link rel="manifest" href="../manifest.json" />', '')  # geen eigen app-manifest voor de varianten
    return html

def strip_bar(html):
    """de bestaande contactbar (nav + css-link + js) eruit."""
    html = re.sub(r'\n  <nav class="contactbar.*?</nav>\n', '\n', html, flags=re.S)
    html = html.replace('<script src="assets/contactbar.js"></script>\n', '').replace('<script src="../assets/contactbar.js"></script>\n', '')
    html = html.replace('<link rel="stylesheet" href="assets/contactbar.css" />', '').replace('<link rel="stylesheet" href="../assets/contactbar.css" />', '')
    assert 'class="contactbar' not in html and 'contactbar.js' not in html and 'contactbar.css' not in html.split('<body')[1], 'bar niet volledig weg'
    return html

def inject(html, css, body_html_end="", after_hero="", after_main_open="", js="", bar_px=None, pad_bottom=None):
    css_all = "<style>\n" + COMMON_CSS + css
    if bar_px is not None:
        css_all += ("\n/* vouw: de opening rekent met de hoogte van het onderste element (was 64px voor de nacht-bar) */\n"
                    f"@media (max-width: 1023px) {{ .hero {{ min-height: calc(100svh - {bar_px}px - var(--opening-top) - env(safe-area-inset-bottom, 0px)); }} }}\n")
    if pad_bottom is not None:
        css_all += f"body {{ padding-bottom: {pad_bottom}; }}\n"
    css_all += "</style>\n"
    html = html.replace('</head>', css_all + '</head>', 1)
    if after_hero:
        html = html.replace('    </section>\n\n    <section class="proof" id="proof">', '    </section>\n' + after_hero + '\n    <section class="proof" id="proof">', 1)
        assert after_hero in html, 'hero-anker niet gevonden'
    if after_main_open:
        html = html.replace('<main>\n', '<main>\n' + after_main_open, 1)
    if body_html_end or js:
        html = html.replace('<script>if("serviceWorker"', body_html_end + ('<script>' + CHIP_JS + js + '</script>\n' if True else '') + '<script>if("serviceWorker"', 1)
    return html

def pakket_inject(html, css, top="", bottom="", bar_html="", js="", pad_bottom=None):
    css_all = "<style>\n" + COMMON_CSS + css + (f"body {{ padding-bottom: {pad_bottom}; }}\n" if pad_bottom is not None else "") + "</style>\n"
    html = html.replace('</head>', css_all + '</head>', 1)
    if top:
        html = html.replace('<div class="kopblok">\n', '<div class="kopblok">\n' + top, 1)
        assert top in html
    if bottom:
        html = html.replace('  </div>\n</main>', '  </div>\n' + bottom + '</main>', 1)
        assert bottom in html
    html = html.replace('<script>if("serviceWorker"', bar_html + '<script>' + CHIP_JS + js + '</script>\n<script>if("serviceWorker"', 1)
    return html

def build():
    index = rel(open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read())
    pakket = rel(open(os.path.join(ROOT, 'pakket.html'), encoding='utf-8').read())
    idx0 = strip_bar(index)
    pk0 = strip_bar(pakket)
    P = "../"
    out = {}

    # A — splits de rollen: slanke nut-bar + Philip-moment
    out['a.html'] = inject(idx0, "", body_html_end=chip('A','splits de rollen')+bar(P), after_hero=moment(P), bar_px=52, pad_bottom='calc(60px + env(safe-area-inset-bottom, 0px))')
    out['pakket-a.html'] = pakket_inject(pk0, "", bar_html=chip('A','splits de rollen')+bar(P), pad_bottom='calc(64px + env(safe-area-inset-bottom, 0px))')

    # B — geen vaste balk: groot Bel-of-app-Philip-blok onder de CTA en op de pakketkeuze
    out['b.html'] = inject(idx0, "", body_html_end=chip('B','geen vaste balk'), after_hero=blok(P), bar_px=20, pad_bottom='0px')
    out['pakket-b.html'] = pakket_inject(pk0, "", bottom=blok(P, pakket=True).replace('margin: 56px','margin: 40px'), bar_html=chip('B','geen vaste balk'), pad_bottom='48px')

    # C — slanke balk die pas NA de hero verschijnt (op de pakketkeuze: meteen, daar is geen hero)
    out['c.html'] = inject(idx0, "", body_html_end=chip('C','balk na de hero')+bar(P, laat=True), js=LAAT_JS, bar_px=20, pad_bottom='calc(60px + env(safe-area-inset-bottom, 0px))')
    out['pakket-c.html'] = pakket_inject(pk0, "", bar_html=chip('C','balk na de hero')+bar(P), pad_bottom='calc(64px + env(safe-area-inset-bottom, 0px))')

    # D — founder-forward op de pakketkeuze (alleen pakket; /voor-ouders = keuze uit A/B/C/E)
    out['pakket-d.html'] = pakket_inject(pk0, "", top=founder(P), bar_html=chip('D','founder op de pakketkeuze'), pad_bottom='48px')

    # E — Apple-achtige slide-bar (bottom sheet)
    out['e.html'] = inject(idx0, E_CSS, body_html_end=chip('E','Apple slide-bar')+e_sheet(P), js=E_JS, bar_px=64, pad_bottom='calc(76px + env(safe-area-inset-bottom, 0px))')
    out['pakket-e.html'] = pakket_inject(pk0, E_CSS, bar_html=chip('E','Apple slide-bar')+e_sheet(P), js=E_JS, pad_bottom='calc(76px + env(safe-area-inset-bottom, 0px))')

    # F — combinatie (aanbeveling): Philip-moment (A) + late slanke balk (C) + founder op de pakketkeuze (D)
    out['f.html'] = inject(idx0, "", body_html_end=chip('F','combinatie A+C+D')+bar(P, laat=True), after_hero=moment(P), js=LAAT_JS, bar_px=20, pad_bottom='calc(60px + env(safe-area-inset-bottom, 0px))')
    out['pakket-f.html'] = pakket_inject(pk0, "", top=founder(P), bar_html=chip('F','combinatie A+C+D')+bar(P), pad_bottom='calc(64px + env(safe-area-inset-bottom, 0px))')

    # G — drijvende Philip-knop
    out['g.html'] = inject(idx0, G_CSS, body_html_end=chip('G','drijvende Philip-knop')+g_fab(P), js=G_JS, bar_px=76, pad_bottom='calc(72px + env(safe-area-inset-bottom, 0px))')
    out['pakket-g.html'] = pakket_inject(pk0, G_CSS, bar_html=chip('G','drijvende Philip-knop')+g_fab(P), js=G_JS, pad_bottom='calc(72px + env(safe-area-inset-bottom, 0px))')

    for name, html in out.items():
        with open(os.path.join(HERE, name), 'w', encoding='utf-8') as f:
            f.write(html)
    print('gebouwd:', ', '.join(sorted(out)))

if __name__ == '__main__':
    build()
