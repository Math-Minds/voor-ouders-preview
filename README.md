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
- `assets/contactbar.css` + `assets/contactbar.js` — de bottom bar (Philip/contact-element), gedeeld door `index.html`, `pakket.html` en `bar-varianten.html` (nacht #32, 19 aug). Pas de bar dáár aan, niet per pagina.
- `pakket.html` — de pakketkeuze als compacte selecteerbare kaarten + één knop (nacht #32); de knop geeft `?plan=` door aan `gegevens.html`.
- Het videoslot in de hero is nu een statische schermafbeelding van de app.
  Als de productvideo er is: zet `product.mp4` in `assets/` en vervang de
  `<img>` in `.hero-visual` door een `<video autoplay muted loop playsinline>`.

## Sync met de echte site

De Next.js-versie leeft in `Math-Minds/wiswiz` op `website/src/app/voor-ouders/page.tsx`.
Wat hier definitief goed blijkt, wordt daar overgenomen; deze pagina is de speeltuin.
