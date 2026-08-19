// contactbar.js — gedrag van de bottom bar (openen/sluiten van de Philip-zin); gedeeld door index.html, pakket.html en bar-varianten.html.
(function(){
  // r10: bottom bar — één zin; open = DEZELFDE alinea schuift uit (hoogte 2 regels → volledig); r10c: in rust twee regels + "… meer";
  // r10d: sluiten verfijnd — variant via klasse op de nav (sluit-a: 'meer' ⇄ 'minder'; sluit-b: + chevron; sluit-c: stil kruisje),
  // sluiten iets langzamer ease-in-out, tekst blijft volledig gerenderd, 'meer' fadet aan het eind terug in. Sluit ook via Esc / tik buiten.
  window.initContactbar=function(nav){ var t=nav.querySelector('.wie'), p=t&&t.querySelector('p'), zin=p&&p.querySelector('.zin'), meer=p&&p.querySelector('.meer'), lbl=p&&p.querySelector('.lbl'), x=nav.querySelector('.sluit'); if(!t||!p||!zin||!meer||!lbl) return;
    var FULL=zin.textContent, C=nav.classList.contains('sluit-c'), reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function h(){ return p.getBoundingClientRect().height; }
    function isOpen(){ return nav.classList.contains('is-open'); }
    function lines(n){ return n*parseFloat(getComputedStyle(p).lineHeight)+1; }
    function kort(){ // grootste woordgrens waarbij zin + "… meer" in twee regels past
      if(isOpen()||p.classList.contains('is-anim')) return; lbl.textContent='meer'; p.classList.add('is-meet'); p.style.height='';
      var max=lines(2), lo=0, hi=FULL.length, best=0;
      zin.textContent=FULL; if(h()<=max){ p.classList.remove('is-meet'); return; }
      while(lo<=hi){ var mid=(lo+hi)>>1; zin.textContent=FULL.slice(0,mid).replace(/[\s.,!?]+$/,'')+'…'; if(h()<=max){ best=mid; lo=mid+1; } else hi=mid-1; }
      var cut=FULL.lastIndexOf(' ',best); if(cut>0) best=cut;
      zin.textContent=FULL.slice(0,best).replace(/[\s.,!?]+$/,'')+'…'; p.classList.remove('is-meet'); }
    function done(e){ if(e&&e.target!==p) return; p.removeEventListener('transitionend',done); p.classList.remove('is-anim'); nav.classList.remove('is-dicht'); p.style.height='';
      if(!isOpen()){ kort(); meer.classList.add('is-fade'); void meer.offsetWidth; meer.classList.remove('is-fade'); } }   // dicht: korte vorm terug, 'meer' fadet zacht in
    function setOpen(open){ if(isOpen()===open) return;
      p.removeEventListener('transitionend',done); p.classList.remove('is-anim'); nav.classList.remove('is-dicht'); p.style.height='';
      var h0=h(); nav.classList.toggle('is-open',open); zin.textContent=FULL; if(open) lbl.textContent='minder'; var h1=open?h():lines(2)-1;   // h1 = doelhoogte (open: volledig; dicht: twee regels)
      t.setAttribute('aria-expanded',open?'true':'false'); if(x) x.tabIndex=(open&&C)?0:-1;
      if(reduce){ if(!open) kort(); return; }
      p.style.height=h0+'px'; void p.offsetHeight; p.classList.add('is-anim'); if(!open) nav.classList.add('is-dicht'); p.style.height=h1+'px';   // .is-anim: tijdens de beweging volledig gerenderd
      p.addEventListener('transitionend',done); }
    t.addEventListener('click',function(){ setOpen(!isOpen()); });
    if(x) x.addEventListener('click',function(){ setOpen(false); t.focus({preventScroll:true}); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&isOpen()) setOpen(false); });
    document.addEventListener('pointerdown',function(e){ if(isOpen()&&!nav.contains(e.target)) setOpen(false); },{passive:true});
    kort(); window.addEventListener('resize',kort); window.addEventListener('orientationchange',kort);
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(kort);
    nav._bar={setOpen:setOpen,isOpen:isOpen}; };
  document.querySelectorAll('.contactbar').forEach(window.initContactbar);
})();
