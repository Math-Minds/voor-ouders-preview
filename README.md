# voor-ouders-preview

Tijdelijke iteratiepagina voor de WisWiz ouder-landingspagina (`/voor-ouders`).
Eén statisch HTML-bestand, geen build, geen CI. Alle knoppen wijzen naar de
echte productie-routes op https://wiswiz.nl, dus de pagina werkt voor een echte bezoeker.

## De loop

1. Wijzig `index.html` (of iets in `assets/`).
2. `./publish.sh "wat je deed"`
3. Klaar — na ~30-60 s staat het live op de GitHub Pages-URL (het script print hem).

Hard-refresh op de telefoon als je de oude versie nog ziet.

## Waar wat staat

- `index.html` — de hele pagina, CSS inline bovenin.
- `assets/` — logo, Philip, TU, app-schermafbeelding (hero), krantencompositie.
- `assets/stapel.css` + `assets/stapel.js` — de institutie-stapel (Parool, FD, Vossius, Wijs Bijles, Wiskunde Actief), gedreven door ÉÉN layout-spec: het `<script type="application/json" id="stapel-spec">`-blok onder de stapel in `index.html`. Vaste referentie-canvas (ref.w × ref.h), per kaart x/y/w/rot/z + labelplek; de canvas wordt als één blok geschaald (WYSIWYG, #32 19 aug). **Nieuwe layout toepassen:** Philip sleept op de sleep-pagina (`stapel-layout.html`, ook op de mock-server: http://agents-philip:8791/wiswiz-stapel/) en tikt *Kopieer spec*; plak die JSON over het `stapel-spec`-blok in `index.html`, draai `python3 build-stapel-tool.py` (bouwt de tool opnieuw uit `stapel-layout.src.html` + `index.html` en kopieert naar `~/mocks/wiswiz-stapel/`), bump `CACHE` in `sw.js`, publish. Zelfde spec → `website/src/app/voor-ouders/stapelSpec.ts` op de Next-branch.
- `assets/contactbar.css` + `assets/contactbar.js` — de bottom bar (Philip/contact-element), gedeeld door `index.html`, `pakket.html` en `bar-varianten.html` (nacht #32, 19 aug). Pas de bar dáár aan, niet per pagina.
- `pakket.html` — de pakketkeuze: drie kaartjes met planeet-illustratie, jaar bovenaan (Philip 19 aug: terug naar deze versie); elke knop geeft `?plan=` door aan `gegevens.html`.
- `contact/` — de contact/vertrouwen-varianten A–G (#32, 19 aug): `contact/index.html` is het keuze-overzicht; `contact/build.py` bouwt `a.html`…`g.html` en `pakket-*.html` uit `index.html` + `pakket.html` (na een wijziging aan de basis opnieuw draaien).
- Het videoslot in de hero is nu een statische schermafbeelding van de app.
  Als de productvideo er is: zet `product.mp4` in `assets/` en vervang de
  `<img>` in `.hero-visual` door een `<video autoplay muted loop playsinline>`.

## Sync met de echte site

De Next.js-versie leeft in `Math-Minds/wiswiz` op `website/src/app/voor-ouders/page.tsx`.
Wat hier definitief goed blijkt, wordt daar overgenomen; deze pagina is de speeltuin.
