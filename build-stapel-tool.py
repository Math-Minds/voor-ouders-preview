#!/usr/bin/env python3
"""Bouwt stapel-layout.html (de sleep-pagina voor de institutie-stapel, #32) uit stapel-layout.src.html + index.html.
De kaart-MARKUP en de LIVE SPEC komen letterlijk uit index.html (zodat de tool exact dezelfde elementen rendert als de
component), assets/stapel.css + assets/stapel.js worden gedeeld. Daarna wordt de tool naar ~/mocks/wiswiz-stapel/ gekopieerd
(mock-server 8791: http://agents-philip:8791/wiswiz-stapel/). Draai na ELKE wijziging aan de stapel-markup/spec in index.html."""
import os, re, shutil, sys
here = os.path.dirname(os.path.abspath(__file__))
idx = open(os.path.join(here, 'index.html'), encoding='utf-8').read()
src = open(os.path.join(here, 'stapel-layout.src.html'), encoding='utf-8').read()
m = re.search(r'(\s*<div class="stapel-canvas">.*?\n\s*</div>\n)(\s*</div>\n)', idx, re.S)
if not m: sys.exit('stapel-canvas niet gevonden in index.html')
canvas = m.group(1)
m2 = re.search(r'<script type="application/json" id="stapel-spec">(.*?)</script>', idx, re.S)
if not m2: sys.exit('stapel-spec niet gevonden in index.html')
spec = m2.group(1)
out = src.replace('<!--STAPEL-CANVAS-->', canvas.strip('\n')).replace('<!--STAPEL-SPEC-->', spec)
open(os.path.join(here, 'stapel-layout.html'), 'w', encoding='utf-8').write(out)
# kopie naar de mock-server
dst = os.path.expanduser('~/mocks/wiswiz-stapel')
if os.path.isdir(dst):
    shutil.copy(os.path.join(here, 'stapel-layout.html'), os.path.join(dst, 'index.html'))
    os.makedirs(os.path.join(dst, 'assets'), exist_ok=True)
    for f in ['stapel.css', 'stapel.js', 'parool.png', 'fd-woordmerk.png', 'vossius4.png', 'wijs-bijles.png', 'stichting-wiskunde-actief.png', 'knipsel-parool.webp', 'knipsel-fd.webp']:
        shutil.copy(os.path.join(here, 'assets', f), os.path.join(dst, 'assets', f))
    print('gekopieerd naar', dst)
print('stapel-layout.html gebouwd')
