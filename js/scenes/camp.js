'use strict';
// Глава 5, вторая половина: сборный пункт («Джуде?») и палатка умирающих.
// Сборный пункт снят издалека и сбоку, решающий момент — рисованными панелями, без тел: сапоги, палец, лица, руки.
// Палатка — сверху, операция — в темноте, только звук.
function sceneCamp(){
  resetCamera();
  const DAT = DATA.ch5b, CH = 'Глава 5 · Подсолнухи';
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb7ab90); scene.fog = new THREE.Fog(0xb7ab90, 30, 140);
  const hemi = new THREE.HemisphereLight(0xd8ccb0, 0x4a3c2c, .6); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe6c0, .8); sun.position.set(-14,20,10); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:80});
  scene.add(sun, sun.target);

  // ---------- сборный пункт у разбитой МТС ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400,400), M(0x8a7b5c)); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  const dirt = new THREE.Mesh(new THREE.CircleGeometry(14,24), M(0x7a6a4c)); dirt.rotation.x=-Math.PI/2; dirt.position.y=.01; scene.add(dirt);
  // кирпичные стены мастерской МТС — без крыши, с проломами
  const brick = M(0x8e5a42), brickD = M(0x6e4434);
  [[-9,-7,10,3.4,.5],[-14,-2,.5,2.8,10],[-4.5,-7,1.2,1.6,.5],[3,-7.5,6,2.2,.5]].forEach(([x,z,w,h,d],i)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), i%2?brickD:brick); b.position.set(x,h/2,z); scene.add(shadowAll(b)); });
  // сгоревший трактор
  const tractor = new THREE.Group(); const tb=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,1.4),M(0x2a2622)); tb.position.y=1.1;
  const tw1=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.3,10),M(0x1c1a18)); tw1.rotation.x=Math.PI/2; tw1.position.set(-.8,.9,.8); const tw2=tw1.clone(); tw2.position.z=-.8;
  tractor.add(tb,tw1,tw2); tractor.position.set(-10,0,-3.5); tractor.rotation.y=.4; scene.add(shadowAll(tractor));
  // вышка
  const tower = new THREE.Group(); for(const [x,z] of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.15,5,.15),M(0x4a3a2a)); l.position.set(x,2.5,z); tower.add(l); }
  const tp=new THREE.Mesh(new THREE.BoxGeometry(2.2,.2,2.2),M(0x4a3a2a)); tp.position.y=5; const tr=new THREE.Mesh(new THREE.ConeGeometry(1.8,1,4),M(0x3a2e22)); tr.position.y=6.1; tr.rotation.y=Math.PI/4;
  tower.add(tp,tr); tower.position.set(-11,0,8); scene.add(shadowAll(tower));
  // колючая проволока: столбы и нити — между камерой и строем
  const wireM = new THREE.LineBasicMaterial({color:0x2a2420});
  function fence(x0,z0,x1,z1){ const n=Math.max(2,Math.round(Math.hypot(x1-x0,z1-z0)/2.6));
    for(let i=0;i<=n;i++){ const p=new THREE.Mesh(new THREE.BoxGeometry(.1,1.9,.1),M(0x3e3226)); p.position.set(lerp(x0,x1,i/n),.95,lerp(z0,z1,i/n)); p.rotation.z=rand(-.05,.05); scene.add(shadowAll(p)); }
    for(const y of [.4,.8,1.2,1.6]){ const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x0,y,z0), new THREE.Vector3(x1,y+rand(-.05,.05),z1)]); scene.add(new THREE.Line(g,wireM)); } }
  fence(-16,6,16,6); fence(-16,-9,-16,6); fence(16,-9,16,6);

  // люди: строй пленных лицом к нам
  const prisoners=[]; const coats=[0x5c5a3a,0x4e4c34,0x6a6244,0x55503a,0x5e5640,0x4a4836];
  for(let i=0;i<9;i++){ const x=-6+i*1.5; if(Math.abs(x)<1.6) continue; const p=makePerson({coat:coats[i%coats.length], hat:i%3?'pilotka':'none'}); p.position.set(x+rand(-.15,.15),0,rand(-.2,.2)); scene.add(p); prisoners.push(p); }
  const asan = makePerson({coat:0x5c5a3a, hat:'none'}); asan.position.set(.3,0,0); scene.add(asan);
  const tatar = makePerson({coat:0x3a3228, hat:'borik', beard:true}); tatar.position.set(-.6,0,.05); scene.add(tatar);
  // Асан висит на старике: наклон, рука на его плече
  asan.rotation.z=.12; asan.userData.armR.rotation.z=-.0; asan.userData.armL.rotation.x=-.3; asan.userData.armL.rotation.z=-.9; asan.userData.carry=true;
  const feld = makePerson({coat:0x5a5e52, hat:'pilotka'}); feld.position.set(7,0,1.6); feld.rotation.y=-Math.PI/2; scene.add(feld);
  // вытянутый палец на конце правой руки — он и есть кадр панели
  const finger = new THREE.Mesh(new THREE.BoxGeometry(.035,.14,.035), M(0xb08a6a)); finger.position.set(0,-.44,0); feld.userData.armR.add(finger);
  const guards=[]; for(const [x,z] of [[3,4],[4.2,3.6]]){ const g=makePerson({coat:0x5a5e52, hat:'helmet'}); const rifle=new THREE.Mesh(new THREE.BoxGeometry(.06,1.2,.08),M(0x2a2018)); rifle.position.set(.2,1.1,.3); rifle.rotation.x=.25; g.add(rifle); g.position.set(x,0,z); g.rotation.y=Math.PI; g.userData.rifle=rifle; scene.add(g); guards.push(g); }

  // ---------- палатка умирающих (в стороне, x≈100) ----------
  const TX=100;
  const tent = new THREE.Group(); scene.add(tent);
  const canvasM = new THREE.MeshLambertMaterial({color:0x9e9478, side:THREE.BackSide});
  const tentBox = new THREE.Mesh(new THREE.BoxGeometry(16,3,7.4), canvasM); tentBox.position.set(TX,1.5,0); tent.add(tentBox);
  const straw = new THREE.Mesh(new THREE.PlaneGeometry(15.8,7.2), M(0x8c7a4a)); straw.rotation.x=-Math.PI/2; straw.position.set(TX,.02,0); tent.add(straw);
  // конёк и растяжки: передний план для съёмки сверху
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(16,.14,.14), M(0x4a3a2a)); ridge.position.set(TX,3.6,0); tent.add(ridge);
  for(const x of [-6,-2,2,6]){ const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,3.6,6),M(0x4a3a2a)); pole.position.set(TX+x,1.8,0); tent.add(pole); }
  const lying=[];
  for(let i=0;i<8;i++) for(const side of [-1,1]){ const x=TX-7+i*1.9+rand(-.2,.2); if(side<0 && i===3) continue;
    const p=makePerson({coat:coats[(i+side+2)%coats.length], hat:'none'}); p.rotation.x=-Math.PI/2; if(side>0) p.rotation.y=Math.PI;
    p.position.set(x, .2, side*-.7); p.userData.armL.rotation.z=rand(-.4,.2); tent.add(p); lying.push(p); }
  // Асан — в ряду у стены
  const asanT = makePerson({coat:0x5c5a3a, hat:'none'}); asanT.rotation.x=-Math.PI/2; asanT.position.set(TX-7+3*1.9,.2,.7); tent.add(asanT);
  const tumar = new THREE.Mesh(new THREE.ConeGeometry(.08,.14,3), new THREE.MeshLambertMaterial({color:0x8e1f1a, emissive:0x3a0806})); tumar.rotation.x=Math.PI/2; tumar.position.set(0,1.45,.26); asanT.add(tumar);
  const bandage = new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.22,8), M(0xd8d0bc)); bandage.position.set(-.12,.45,0); asanT.add(bandage);
  // сосед сидит рядом: капает воду с тряпки
  const nb = makePerson({coat:0x4e4c34, hat:'none'}); nb.position.set(asanT.position.x+.75,-.32,-.55); nb.rotation.y=-.6; nb.userData.legL.rotation.x=nb.userData.legR.rotation.x=-1.3; nb.userData.carry=true; nb.userData.armR.rotation.x=-1.1; tent.add(nb);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(.03,6,4), new THREE.MeshBasicMaterial({color:0xd8e4ec})); drop.visible=false; tent.add(drop);
  const sin = makePerson({coat:0xcfc8b4, hat:'none'}); sin.position.set(TX-9,0,0); sin.visible=false; tent.add(sin);
  const orderly = makePerson({coat:0xb8b2a0, hat:'pilotka'}); orderly.position.set(TX-8.4,0,-.6); orderly.visible=false; tent.add(orderly);
  const guardT = makePerson({coat:0x5a5e52, hat:'helmet'}); guardT.position.set(TX-8.6,0,0); guardT.visible=false; tent.add(guardT);

  const S = { busy:true, clock:0, phase:'point', near:null, swallow:0, holding:false };
  const DIR = { shot:null, t:0, fresh:false }; S.dir=DIR;
  const tmp = new THREE.Vector3();
  const until = (f, max=120000) => new Promise(r=>{ const t0=performance.now(); const h=setInterval(()=>{ if(f()||performance.now()-t0>max){ clearInterval(h); r(); } },50); });
  const gwait = sec => { const t0=S.clock; return until(()=>S.clock-t0>=sec); };
  function setShot(n){ DIR.shot=n; DIR.t=0; DIR.fresh=true; }
  const hooks = {}, run = makeRunner(hooks);
  const wp = o => o.getWorldPosition(new THREE.Vector3());

  // планы: каждый возвращает точку, куда смотреть
  const SHOTS = {
    // издалека, длинным объективом, сквозь проволоку
    estab(k){ camera.fov=22; camera.position.set(13-k*.08,1.55,24); return tmp.set(-1,1.1,-1); },
    // вдоль строя: фельдфебель идёт по ряду
    line(k){ camera.fov=26; camera.position.set(-12.5,1.9,3.6); return tmp.set(lerp(3,0,Math.min(1,k/8)),1.35,.2); },
    // лица: Асан на плече у старика
    // руки на груди — крупно
    hands(k){ camera.fov=34; camera.position.set(-.05,1.5,2.5); return tmp.set(-.15,1.3,0); },
    faces(k){ camera.fov=28; camera.position.set(.9,1.62,3.4-Math.min(.5,k*.04)); return tmp.set(-.1,1.55,0); },
    // старик кричит
    tatar(k){ camera.fov=26; camera.position.set(-2.2,1.5,2.6); return tmp.set(-.3,1.6,0); },
    // палатка сверху: медленный наезд на Асана, конёк проходит над кадром
    tentTop(k){ camera.fov=40; const e=Math.min(1,k/16); camera.position.set(lerp(TX-1,asanT.position.x+.6,e), lerp(10,6.2,e), lerp(5,2.6,e)); return tmp.set(lerp(TX,asanT.position.x,e),0,lerp(0,.4,e)); },
    // снизу, глазами лежащего: лица над ним
    lowPOV(k){ camera.fov=55; const a=asanT.position; camera.position.set(a.x-.55,.3,a.z+.95); const f=DIR.look||nb; const p=wp(f); return p.setY(1.45); },
    // обыск: сверху и сбоку, охранник идёт по ряду
    search(k){ camera.fov=34; camera.position.set(asanT.position.x+4.2,3.4,4.6); return tmp.set(guardT.position.x*.5+asanT.position.x*.5,.6,.3); }
  };

  // ---------- панели ----------
  const cam2 = new THREE.PerspectiveCamera(36,1,.1,300);
  function shot(p, l, w=900, h=900){ cam2.aspect=w/h; cam2.updateProjectionMatrix(); cam2.position.copy(p); cam2.lookAt(l); const old=renderer.getSize(new THREE.Vector2()); renderer.setSize(w,h,false); renderer.render(scene,cam2); const u=canvas.toDataURL('image/jpeg',.85); renderer.setSize(old.x,old.y,false); return u; }
  // подпись панели: «{de:слово}» — немецкое слово выводится шумом, как в речи
  const capHtml = s => escapeHtml(s).replace(/\{de:([^}]+)\}/g, (_,w)=>renderLang(w,'de'));
  // рисованные кадры (img/…) — макет artpage: подписи под кадром, картинка целиком; два кадра — в ряд
  async function panels(urls, caps){
    const page=$('page'); page.innerHTML=''; const art=urls.every(u=>u.startsWith('img/'));
    page.classList.toggle('artpage',art); page.classList.toggle('four',art&&urls.length===2);
    urls.forEach((u,i)=>{ const d=document.createElement('div'); d.className=art?'pn art':'pn'; d.innerHTML=`<img${art?' class="art"':''} src="${u}" alt=""><div class="cap">${capHtml(caps[i])}</div>`; page.appendChild(d); });
    $('panels').style.display='flex'; if(art) fitArtPage(page); await fadeTo(0,700);
    const clickPanels = () => new Promise(r=>{ const h=()=>{ $('panels').removeEventListener('pointerdown',h); removeEventListener('keydown',kk); r(); }; const kk=e=>{ if(e.code==='Space'||e.code==='Enter') h(); }; $('panels').addEventListener('pointerdown',h); addEventListener('keydown',kk); });
    const cells=[...page.children];
    for(let i=0;i<cells.length;i++){ cells[i].classList.add('on'); $('pnNext').textContent = i<cells.length-1 ? 'Нажми, чтобы открыть следующий кадр' : 'Нажми, чтобы перевернуть страницу'; await wait(350); await clickPanels(); }
    await fadeTo(1,700); $('panels').style.display='none'; page.classList.remove('artpage','four','row','two'); page.style.width='';
  }
  const caps = list => list.map(c => c.if ? (evalCond(c.if, memory.flags) ? c.text : c.else) : c.text);

  // ---------- сборный пункт ----------
  async function point(){
    S.phase='point'; setObj(CH, DAT.objectives.point); setShot('estab'); cine(true);
    asan.position.set(-5,0,.6); tatar.position.set(-5.9,0,.65);
    await fadeTo(0,1800); await gwait(2.5);
    await run(DAT.scripts.point_intro); closeDlg();
    await run(DAT.scripts.point_order); closeDlg();
    await until(()=>!S.feldWalk);
    // панели: сапоги, палец, винтовки — без тел, только сапоги, руки и лица
    feld.position.set(1.4,0,1.5); feld.rotation.y=-Math.PI/2; const f1=shot(new THREE.Vector3(3.2,.28,2.9), new THREE.Vector3(1.2,.35,1.4), 900, 700);
    feld.position.set(.45,0,1.25); feld.lookAt(asan.position.x,0,asan.position.z); feld.userData.armR.rotation.x=-1.8; feld.userData.armR.position.set(.3,1.52,.34); feld.userData.carry=true;
    const f2=shot(new THREE.Vector3(1.1,1.72,-.45), new THREE.Vector3(.38,1.62,1.25), 900, 560);
    guards.forEach((g,i)=>{ g.position.set(1.1+i*1.1,0,2.7+i*.2); g.lookAt(asan.position.x,0,asan.position.z); g.userData.rifle.rotation.x=1.3; g.userData.rifle.position.set(.2,1.35,.45); });
    const f3=shot(new THREE.Vector3(.2,1.55,.25), new THREE.Vector3(1.4,1.35,3.2), 900, 700);
    // фельдфебель отступает на шаг, всё ещё показывая пальцем: не заслоняет лица в следующих планах
    feld.position.set(2.3,0,1.7); feld.lookAt(asan.position.x,0,asan.position.z);
    await fadeTo(1,500);
    await panels(['img/ch5p_1.jpg','img/ch5p_2.jpg','img/ch5p_3.jpg'], caps(DAT.panels.point));
    setShot('tatar'); await fadeTo(0,250);
    await run(DAT.scripts.point_choice); closeDlg();
    feld.userData.armR.rotation.x=0; feld.userData.armR.position.set(.37,1.15,0);
    feld.position.set(3.6,0,1.6);
    const f4=shot(new THREE.Vector3(.4,1.55,2.2), new THREE.Vector3(-.15,1.3,0), 900, 900);
    feld.position.set(3.6,0,1.6); feld.rotation.y=Math.PI/2;
    const f5=shot(new THREE.Vector3(.6,.3,2.1), new THREE.Vector3(3.6,.4,1.6), 900, 700);
    await fadeTo(1,500);
    await panels([memory.flags.mussulman==='self'?'img/ch5p_4a.jpg':'img/ch5p_4b.jpg','img/ch5p_5.jpg'], caps(DAT.panels.after));
    cine(false);
  }

  // ---------- палатка ----------
  async function tentPhase(){
    S.phase='tent';
    scene.background.setHex(0x1e1a14); scene.fog.color.setHex(0x1e1a14); scene.fog.near=12; scene.fog.far=40; hemi.intensity=.36; sun.intensity=.22; sun.position.set(TX-6,20,8); sun.target.position.set(TX,0,0);
    setShot('tentTop'); cine(true);
    await fadeTo(0,1600); await gwait(4);
    await run(DAT.scripts.tent_intro); closeDlg(); cine(false);
    // глотать по капле
    S.phase='swallow'; setObj(CH, isTouch ? DAT.objectives.swallowTouch : DAT.objectives.swallow);
    S.busy=false; await until(()=>S.swallow>=4, 1e9); S.busy=true; setObj(CH,'');
    await run(DAT.scripts.tent_bread); closeDlg();
    // хирург и немецкий санитар
    sin.visible=true; orderly.visible=true; S.sinWalk=new THREE.Vector3(asanT.position.x+.2,0,-.25);
    setShot('tentTop'); DIR.t=16; await until(()=>!S.sinWalk);
    DIR.look=sin; setShot('lowPOV'); cine(true);
    await run(DAT.scripts.surgeon); closeDlg();
    await operation();
  }
  // операция: чёрный экран, только дыхание, инструменты и ремень в зубах
  async function operation(){
    await fadeTo(1,1200); cine(false);
    await run(DAT.scripts.op_start); closeDlg();
    setHeart(118); S.breath=true;
    let kept=0;
    $('holdLabel').textContent=DAT.objectives.endureLabel;
    setObj(CH, isTouch ? DAT.objectives.endureTouch : DAT.objectives.endure);
    for(let i=0;i<3;i++){
      await gwait(2.2);
      // приступ боли: держать, пока режут
      S.spike=true; S.spikeHeld=0; S.spikeT=0; $('hold').style.display='block'; $('bHold').style.width='0%';
      for(let j=0;j<6;j++) tone({f:1900+Math.random()*900,dur:.06,type:'triangle',gain:.05,delay:j*.33});
      await until(()=>S.spikeT>=2.4);
      S.spike=false; $('hold').style.display='none';
      if(S.spikeHeld/2.4 > .65) kept++; else { tone({f:150,dur:.6,type:'sawtooth',gain:.06,slide:-40}); }
    }
    setObj(CH,'');
    S.breath=false; setHeart(70);
    await run(kept>=2 ? DAT.scripts.op_end_brave : DAT.scripts.op_end_cried); closeDlg();
    await run(DAT.scripts.op_after); closeDlg();
    setHeart(0);
  }
  // обыск: охранник срывает тумар
  async function search(){
    sin.visible=false; orderly.visible=false; nb.visible=false;
    bandage.scale.set(1.25,1,1.25);
    guardT.visible=true; guardT.position.set(TX-8,0,0);
    const w=wipe(1500,'left'); setShot('search'); cine(true); await w;
    await fadeTo(0,200);
    await run(DAT.scripts.search); closeDlg();
    S.guardWalk=new THREE.Vector3(TX+8,0,0); setShot('search');
    await gwait(3.5);
    await fadeTo(1,2200); cine(false);
  }

  // крючки ремарок: всё, что описано в сценарии, показывает сцена
  Object.assign(hooks, {
    async dragIn(){ S.drag=true; await until(()=>!S.drag); setShot('faces'); },
    feldWalk(){ setShot('line'); S.feldWalk=true; },
    async beltsDown(){ S.belts=true; await gwait(1.4); },
    async crossArms(who){
      if(who==='tatar'){ tatar.userData.armR.rotation.set(-1.0,0,.6); setShot('hands'); await gwait(.8); }
      asan.userData.armL.rotation.set(-1.25,0,-.75); asan.userData.armR.rotation.set(-1.25,0,.75);
      tatar.userData.carry=true; tatar.userData.armL.rotation.set(-1.25,0,-.75); tatar.userData.armR.rotation.set(-1.25,0,.75);
      setShot('hands'); await gwait(1.6); setShot('tatar'); },
    async neighbourDrip(){ for(let i=0;i<2;i++){ drop.visible=true; drop.position.set(asanT.position.x+.25,1.1,asanT.position.z-1.2); tone({f:620,dur:.12,type:'sine',gain:.05}); await gwait(.9); } },
    async bread(){ const b=new THREE.Mesh(new THREE.BoxGeometry(.09,.06,.07),M(0xb89a62)); b.position.set(0,-.42,.1); nb.userData.armR.add(b);
      nb.userData.armR.rotation.x=-1.5; DIR.look=nb; setShot('lowPOV'); await gwait(1.6); nb.userData.armR.remove(b); nb.userData.armR.rotation.x=-1.1; setShot('tentTop'); DIR.t=16; },
    async sinKneel(){ sin.position.y=-.32; sin.userData.legL.rotation.x=sin.userData.legR.rotation.x=-1.3; sin.lookAt(asanT.position.x,0,asanT.position.z+.6);
      DIR.look=sin; setShot('lowPOV'); await gwait(1.2); },
    async guardWalk(){ S.guardWalk=new THREE.Vector3(asanT.position.x+.15,0,.05); await until(()=>!S.guardWalk); DIR.look=guardT; setShot('lowPOV');
      guardT.lookAt(asanT.position.x,0,asanT.position.z+1); guardT.userData.carry=true; guardT.userData.armR.rotation.x=-1.0; await gwait(.6); },
    async tearTumar(){ sfx.paper(); asanT.remove(tumar); tumar.position.set(0,-.42,.1); guardT.userData.armR.add(tumar); guardT.userData.armR.rotation.x=-1.6; await gwait(1.4); }
  });

  function walkTo(o, tgt, v, dt){ const dx=tgt.x-o.position.x, dz=tgt.z-o.position.z, dd=Math.hypot(dx,dz);
    if(dd<.08){ animWalk(o,0,dt); return true; } const st=Math.min(dd,v*dt); o.position.x+=dx/dd*st; o.position.z+=dz/dd*st; o.rotation.y=Math.atan2(dx,dz); const c=o.userData.carry; o.userData.carry=false; animWalk(o,1,dt); o.userData.carry=c; return false; }

  let breathT=0, breathIn=true;
  const sc = {
    S,
    update(dt, t){
      dt *= (window.__fast||1); // ускорение только для автотестов
      S.clock += dt;
      if(S.feldWalk && walkTo(feld, tmp.set(1.4,0,1.5), 1.1, dt)) S.feldWalk=false;
      // Асана волокут: старик и он идут в строй, Асан припадает на ногу
      if(S.drag){ const a=walkTo(asan, tmp.set(.3,0,0), .75, dt), b=walkTo(tatar, new THREE.Vector3(-.6,0,.05), .75, dt);
        asan.rotation.z=.12+Math.sin(S.clock*5)*.05; asan.userData.legR.rotation.x*=.3; if(a&&b){ S.drag=false; asan.rotation.y=0; tatar.rotation.y=0; asan.rotation.z=.12; } }
      if(S.belts) prisoners.forEach((p,i)=>{ p.userData.carry=true; p.userData.armR.rotation.x=lerp(p.userData.armR.rotation.x,-.45-(i%2)*.15,dt*2); p.userData.armL.rotation.x=lerp(p.userData.armL.rotation.x,-.4,dt*2); p.rotation.x=lerp(p.rotation.x,.12,dt*2); });
      if(S.sinWalk && walkTo(sin, S.sinWalk, 1.2, dt)){ S.sinWalk=null; sin.lookAt(asanT.position.x,0,asanT.position.z); }
      if(sin.visible && S.sinWalk) walkTo(orderly, tmp.set(TX-6.6,0,-.7), 1.1, dt);
      if(S.guardWalk && walkTo(guardT, S.guardWalk, 1.0, dt)) S.guardWalk=null;
      // старик чуть покачивается, держа Асана
      tatar.rotation.z = Math.sin(t*.7)*.015;
      // капля с тряпки
      if(drop.visible){ drop.position.y-=dt*1.6; if(drop.position.y<.5) drop.visible=false; }
      // дыхание в темноте
      if(S.breath){ breathT-=dt; if(breathT<=0){ breathT = S.spike ? .55 : 1.5; noiseBurst({dur:breathIn?.7:.9, freq:breathIn?900:500, q:.6, gain:S.spike?.22:.12, type:'bandpass'}); breathIn=!breathIn; } }
      if(S.spike){ S.spikeT+=dt; if(S.holding||keys.Space) S.spikeHeld+=dt; $('bHold').style.width=Math.min(100,S.spikeHeld/2.4*100)+'%'; }
      // камера
      if(DIR.shot){ const look=SHOTS[DIR.shot](DIR.t, dt); camera.updateProjectionMatrix();
        if(DIR.fresh || !S.dirLook){ S.dirLook=look.clone(); DIR.fresh=false; } else S.dirLook.lerp(look, 1-Math.pow(.15,dt));
        camera.lookAt(S.dirLook); DIR.t+=dt; }
    },
    onKey(code, down){ if(down && code==='KeyE') sc.act(); },
    touchAction(){ if(S.phase==='swallow' && !S.busy) return 'Глотать'; if(S.spike) return 'Терпеть'; return null; },
    act(){ if(S.phase==='swallow' && !S.busy && !dlgOpen){ S.swallow++; drop.visible=true; drop.position.set(asanT.position.x+.25,1.1,asanT.position.z-1.2); tone({f:620,dur:.12,type:'sine',gain:.05}); } },
    holdStart(){ S.holding=true; }, holdEnd(){ S.holding=false; },
    async begin(){
      $('bars').style.display='none'; $('touch').style.display='none'; $('hold').style.display='none'; $('eyelid').style.opacity=0; $('compass').style.display='none';
      setHeart(0); setRing(false);
      await point();
      await tentPhase();
      await search();
      endChapter5();
    }
  };
  return sc;
}
