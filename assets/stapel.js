/* De institutie-stapel (#32, WYSIWYG): ÉÉN spec drijft de sleep-pagina (stapel-layout.html) én de component.
   Spec = { ref:{w,h}, items:[{ id, x, y, w, rot, z, label:{a,x,y} }] } — alles in referentie-px op een canvas van ref.w × ref.h.
     x,y   = linkerbovenhoek van de kaart (vóór draai), w = kaartbreedte, rot = graden (om het kaartmidden), z = stapelvolgorde
     label = plek van het tabje t.o.v. de kaart: a = 'l' (x = afstand linkerrand kaart → linkerrand label),
             'c' (x = verschuiving van het label-midden t.o.v. het kaart-midden) of 'r' (x = afstand rechterrand kaart → rechterrand label);
             y = bovenkant label t.o.v. bovenkant kaart. y = TAB_Y (−36.2) = het tabje op de bovenrand (de oude vaste stand).
   De component leest de spec uit <script type="application/json" id="stapel-spec"> en zet ALLE maten als inline-stijl op de
   kaarten; de blokschaal (scale = blokbreedte / ref.w) wordt hier GEMETEN en als --stapel-scale gezet (assets/stapel.css). */
(function () {
  var MATTE = 3.52, LABEL_H = 39.7;
  var TAB_Y = Math.round((MATTE - LABEL_H) * 10) / 10;   // -36.2
  function r1(v) { return Math.round(v * 10) / 10; }

  function labelStyle(lab) {
    var a = lab && lab.a || 'l', x = lab && +lab.x || 0, y = (lab && typeof lab.y === 'number') ? lab.y : TAB_Y;
    var s = { left: 'auto', right: 'auto', translate: 'none', top: y + 'px' };
    if (a === 'c') { s.left = 'calc(50% + ' + x + 'px)'; s.translate = '-50% 0'; }
    else if (a === 'r') { s.right = x + 'px'; }
    else { s.left = x + 'px'; }
    s.shape = (y <= TAB_Y + 0.5) ? 'lab-tab' : 'lab-sticker';
    return s;
  }

  /* de blokschaal: --stapel-scale = breedte van .stapel / ref.w, gemeten en bijgehouden met een ResizeObserver (per root één keer).
     Apple WebKit rekent tan(atan2(100cqi, …px)) fout (negatieve/minuscule schaal, gemeten 19 aug), dus de schaal komt uit JS. */
  function schaal(root, spec) {
    var w = root.getBoundingClientRect().width;
    if (!(w > 0) || !(spec.ref.w > 0)) return;
    root.style.setProperty('--stapel-scale', String(w / spec.ref.w));
  }
  function apply(root, spec) {
    if (!root || !spec || !spec.ref || !spec.items) throw new Error('stapel: geen spec');
    root.style.setProperty('--ref-w', spec.ref.w);
    root.style.setProperty('--ref-h', spec.ref.h);
    root.__stapelSpec = spec;
    schaal(root, spec);
    if (!root.__stapelRO) {
      if (typeof ResizeObserver !== 'undefined') { root.__stapelRO = new ResizeObserver(function () { schaal(root, root.__stapelSpec); }); root.__stapelRO.observe(root); }
      else { root.__stapelRO = true; addEventListener('resize', function () { schaal(root, root.__stapelSpec); }); }
    }
    var canvas = root.querySelector('.stapel-canvas');
    spec.items.forEach(function (it) {
      var el = canvas.querySelector('[data-knip="' + it.id + '"]');
      if (!el) throw new Error('stapel: kaart ontbreekt: ' + it.id);
      el.style.left = it.x + 'px'; el.style.top = it.y + 'px'; el.style.width = it.w + 'px';
      el.style.transform = 'rotate(' + (it.rot || 0) + 'deg)'; el.style.zIndex = it.z;
      var lab = el.querySelector('.knip-label');
      if (lab) {
        var s = labelStyle(it.label);
        lab.style.left = s.left; lab.style.right = s.right; lab.style.top = s.top; lab.style.translate = s.translate;
        lab.classList.remove('lab-tab', 'lab-sticker'); lab.classList.add(s.shape);
      }
    });
  }

  function readSpec(doc) {
    var n = (doc || document).getElementById('stapel-spec');
    return JSON.parse(n.textContent);
  }

  /* JSON in de vaste vorm van het <script id="stapel-spec">-blok: één kaart per regel */
  function format(spec) {
    var lines = spec.items.map(function (it) {
      return '  {"id":"' + it.id + '","x":' + it.x + ',"y":' + it.y + ',"w":' + it.w + ',"rot":' + (it.rot || 0) + ',"z":' + it.z +
        ',"label":{"a":"' + (it.label && it.label.a || 'l') + '","x":' + r1(it.label && it.label.x || 0) + ',"y":' + r1(it.label && typeof it.label.y === 'number' ? it.label.y : TAB_Y) + '}}';
    });
    return '{"ref":{"w":' + spec.ref.w + ',"h":' + spec.ref.h + '},"items":[\n' + lines.join(',\n') + '\n]}';
  }

  window.Stapel = { MATTE: MATTE, LABEL_H: LABEL_H, TAB_Y: TAB_Y, labelStyle: labelStyle, apply: apply, schaal: schaal, readSpec: readSpec, format: format, r1: r1 };
})();
