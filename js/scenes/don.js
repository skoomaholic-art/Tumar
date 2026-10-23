'use strict';
// Глава 2. Дон: эшелон под бомбами, окоп, первый бой, кухня, ночная переправа.
// Вся глава снята сверху, поэтому в конце боя срабатывает приём «глаза птицы».

function sceneDon(){
  resetCamera();
  const DAT = DATA.ch2, CH = 'Глава 2 · '+DAT.title;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc4ad84);
  scene.fog = new THREE.Fog(0xc4ad84, 70, 260);
  const hemi = new THREE.HemisphereLight(0xf2e2c0, 0x5a4630, .45); scene.add(hemi);
  // июльское солнце высоко и чуть сзади-слева: короткие резкие тени
  const sun = new THREE.DirectionalLight(0xfff0d0, .8); sun.position.set(-20,40,25); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:120});
  scene.add(sun, sun.target);

  // выгоревшая степь
  const gGeo = new THREE.PlaneGeometry(700,700,140,140); gGeo.rotateX(-Math.PI/2);
  const col=[], pos=gGeo.attributes.position, c=new THREE.Color();
  for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i);
    const n=Math.sin(x*.09)*Math.cos(z*.07)+Math.sin(x*.31+z*.23)*.4;
    c.setHex(n>.7?0xb59f6e:(n<-.6?0x7d6a46:0x9d8858)); c.offsetHSL(0,0,rand(-.03,.03)); col.push(c.r,c.g,c.b); }
  gGeo.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); gGeo.computeVertexNormals();
  const ground = new THREE.Mesh(gGeo, new THREE.MeshLambertMaterial({vertexColors:true})); ground.receiveShadow=true; scene.add(ground);
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(.12,.45,4), M(0xa89058), 900); const dm=new THREE.Object3D();
  for(let i=0;i<900;i++){ dm.position.set(rand(-120,120),.18,rand(-140,220)); dm.rotation.set(rand(-.3,.3),rand(0,6),rand(-.3,.3)); dm.scale.setScalar(rand(.6,1.5)); dm.updateMatrix(); tufts.setMatrixAt(i,dm.matrix); }
  scene.add(tufts);

  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

  // ---------- общие эффекты: взрывы, воронки, трассеры ----------
  const softTex = (rgba)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'); const gr=x.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,rgba); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); };
  const dustTex = softTex('rgba(90,74,52,.85)'), fireTex = softTex('rgba(255,200,120,1)'), smokeTex = softTex('rgba(40,36,32,.75)');
  const fx = []; // {sprite, life, max, vy, grow}
  function puff(p, tex, size, life, vy=1.5, grow=2.5, add=false){
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));
    s.position.copy(p); s.scale.setScalar(size); scene.add(s); fx.push({s,life,max:life,vy,grow,base:size});
  }
  const craterM = new THREE.MeshBasicMaterial({color:0x2e2418, transparent:true, opacity:.85});
  const bloodM = new THREE.MeshBasicMaterial({color:0x4a0e0a, transparent:true, opacity:.8});
  function decal(x,z,r,mat){ const d=new THREE.Mesh(new THREE.CircleGeometry(r,14),mat); d.rotation.x=-Math.PI/2; d.position.set(x,.03+Math.random()*.01,z); scene.add(d); return d; }
  let shake=0;
  function explode(x,z,big=1){
    const p=new THREE.Vector3(x,.6,z);
    puff(p, fireTex, 1.6*big, .22, 1, 1, true);
    for(let i=0;i<6;i++) puff(tmp.set(x+rand(-1,1),.8+rand(0,1.5),z+rand(-1,1)), dustTex, rand(2,3.5)*big, rand(1.2,2.2), rand(2,4), 2.2);
    puff(tmp.set(x,1.5,z), smokeTex, 4*big, 3.5, 1.2, 3);
    decal(x,z,rand(1.2,1.8)*big,craterM);
    const d = asan ? Math.hypot(asan.position.x-x, asan.position.z-z) : 99;
    shake = Math.max(shake, clamp(1.4 - d/18, 0, 1.2)*big);
    sfx.boom(); if(d<9) noiseBurst({dur:.5,freq:1800,q:.5,gain:.12,type:'highpass'});
    return d;
  }
  const tracerM = new THREE.LineBasicMaterial({color:0xffe2a0, transparent:true, opacity:.9});
  const enemyTracerM = new THREE.LineBasicMaterial({color:0xfff6d8, transparent:true, opacity:.7});
  const tracers=[];
  function tracer(a,b,mat=tracerM){ const g=new THREE.BufferGeometry().setFromPoints([a.clone(),b.clone()]); const l=new THREE.Line(g,mat.clone()); scene.add(l); tracers.push({l,life:.07}); }

  // ---------- люди ----------
  const KHAKI=0x7a7148, FELD=0x5a5e4a;
  const asan = makePerson({coat:KHAKI, hat:'pilotka'});
  const zhum = makePerson({coat:0x736a42, hat:'pilotka'});
  const kol  = makePerson({coat:0x6c6440, hat:'pilotka'});
  // Семён Кузьмин — с Асаном с одного эшелона; светлая выгоревшая гимнастёрка
  const semyon = makePerson({coat:0x9a9068, hat:'pilotka'});
  scene.add(asan, zhum, kol, semyon);

  // ---------- место 1: разъезд и эшелон (далеко за рекой, z≈230) ----------
  const TRAIN_Z = 230;
  const train = new THREE.Group(); scene.add(train);
  const loco=new THREE.Group();
  const boiler=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,4.2,14),M(0x262422)); boiler.rotation.z=Math.PI/2; boiler.position.set(1.2,1.9,0);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(2,2.4,2.4),M(0x2c2a26)); cab.position.set(-1.6,2.1,0);
  loco.add(boiler,cab); loco.position.x=20; train.add(shadowAll(loco));
  for(let i=0;i<5;i++){ const w=new THREE.Mesh(new THREE.BoxGeometry(5.2,2.4,2.6),M(0x5a3426)); w.position.set(14-i*5.8,2,0); train.add(shadowAll(w)); }
  train.position.set(0,0,TRAIN_Z);
  const rails=new THREE.Mesh(new THREE.BoxGeometry(300,.35,3),M(0x6e5e46)); rails.position.set(0,.17,TRAIN_Z); scene.add(rails);
  const SAFE = new THREE.Vector3(2.6,0,TRAIN_Z); // под вагоном
  const singer = makePerson({coat:KHAKI, hat:'pilotka'}); singer.position.set(-6,0,TRAIN_Z+3.5); scene.add(singer);
  const planes=[];
  function makePlane(){ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(.9,.7,7),M(0x3a3c36)); const w=new THREE.Mesh(new THREE.BoxGeometry(11,.15,1.6),M(0x3a3c36)); w.position.z=.6; const t=new THREE.Mesh(new THREE.BoxGeometry(3.4,.12,.9),M(0x3a3c36)); t.position.z=-3; g.add(b,w,t); scene.add(g); return g; }

  // ---------- место 2: окоп в степи (z≈0), бой идёт на север (−z) ----------
  const trench = new THREE.Mesh(new THREE.BoxGeometry(60,.06,1.6), M(0x3b2e1e)); trench.position.set(0,.03,0); scene.add(trench);
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(60,.45,.9), M(0x7a6442)); parapet.position.set(0,.22,-1.2); scene.add(shadowAll(parapet));
  const comrades=[];
  for(const x of [-16,-11,-6,6,11,16]){ const p=makePerson({coat:KHAKI, hat:'pilotka'}); p.position.set(x,-.45,0); p.rotation.y=Math.PI; scene.add(p); comrades.push({p, alive:true, t:rand(0,3)}); }
  // ДП на бруствере
  const dp=new THREE.Group(); const dpB=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.25,6),M(0x1e1e1e)); dpB.rotation.x=Math.PI/2; dpB.position.z=-.55;
  const dpD=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.06,14),M(0x2a2a26)); dpD.position.set(0,.12,-.05); dp.add(dpB,dpD); dp.position.set(0,.6,-1.25); scene.add(dp);
  const muzzle = new THREE.PointLight(0xffd090, 0, 8); scene.add(muzzle);

  // враги
  const enemies=[];
  function spawnEnemy(){
    const p = makePerson({coat:FELD, hat:'helmet'}); p.position.set(rand(-28,28),0,rand(-92,-74)); p.rotation.y=0; scene.add(p);
    enemies.push({p, hp: Math.random()<.3?2:1, alive:true, prone:0, nextProne:rand(2,6), fireT:rand(1.5,4), speed:rand(1.8,2.6)});
  }
  let tank=null;
  function spawnTank(){
    const g=new THREE.Group(); const hull=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.2,5.6),M(0x55584e)); hull.position.y=.9;
    const tur=new THREE.Mesh(new THREE.BoxGeometry(2,.8,2.2),M(0x4c4f46)); tur.position.set(0,1.85,-.3);
    const gun=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,2.8,8),M(0x2a2a28)); gun.rotation.x=Math.PI/2; gun.position.set(0,1.9,2.2);
    const tr1=new THREE.Mesh(new THREE.BoxGeometry(.6,.9,5.8),M(0x2e2e2a)); tr1.position.set(-1.6,.45,0); const tr2=tr1.clone(); tr2.position.x=1.6;
    g.add(hull,tur,gun,tr1,tr2); g.position.set(rand(-8,8),0,-95); scene.add(shadowAll(g));
    tank={g, alive:true, fireT:1, smokeT:0};
  }

  // ---------- место 3: переправа ночью (z≈120..160) ----------
  const river = new THREE.Mesh(new THREE.PlaneGeometry(400,40), new THREE.MeshPhongMaterial({color:0x2e3a40, shininess:60})); river.rotation.x=-Math.PI/2; river.position.set(0,.05,140); scene.add(river);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(400,10), M(0x8d7a58)); sand.rotation.x=-Math.PI/2; sand.position.set(0,.04,116); scene.add(sand);
  const raft = new THREE.Group(); for(let i=0;i<5;i++){ const l=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,3.4,8),M(0x6a5236)); l.rotation.z=Math.PI/2; l.position.set(0,.18,i*.38-.76); raft.add(l); }
  raft.position.set(0,0,119.5); scene.add(shadowAll(raft));
  const lieutenant = makePerson({coat:0x6a6444, hat:'pilotka'}); lieutenant.rotation.set(-Math.PI/2,0,.3); lieutenant.position.set(-2.2,.25,115); scene.add(lieutenant);
  const dpGround = dp.clone(); dpGround.position.set(2.2,.1,115); dpGround.rotation.y=.6; scene.add(dpGround);
  const politruk = makePerson({coat:0x5e5a40, hat:'pilotka'}); politruk.position.set(4.5,0,113); scene.add(politruk);
  const flare = new THREE.PointLight(0xfff0e0, 0, 90); scene.add(flare);

  // ---------- кухня (для панелей), за окопом ----------
  const kitchen = new THREE.Group();
  const cart=new THREE.Mesh(new THREE.BoxGeometry(1.6,1,2.4),M(0x4a3a2a)); cart.position.y=.9;
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.6,.55,.8,14),M(0x2a2a28)); pot.position.y=1.7;
  for(const s of [-1,1]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.12,12),M(0x2e2418)); w.rotation.z=Math.PI/2; w.position.set(s*.85,.45,.4); kitchen.add(w); }
  kitchen.add(cart,pot);
  for(let i=0;i<9;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.12,.1,.14,10),M(0x5a5a50)); b.position.set(-2+i*.5,.07,2.2); kitchen.add(b); }
  kitchen.position.set(-4,0,14); scene.add(shadowAll(kitchen));

  // ---------- состояние ----------
  const S = { phase:'intro', busy:true, zoom:1, hp:100, ammo:47, disks:3, reload:0, firing:false, fireCd:0, aim:new THREE.Vector3(0,0,-30),
    wave:0, waveT:0, spawnLeft:0, spawnT:0, artT:3, battleT:0, target:null, stepT:0, camFocus:null };
  // ремарки показываются в кадре: короткие режиссёрские планы поверх обычной камеры
  const gwait = sec => { const t0=S.clock; return new Promise(r=>{ const h=setInterval(()=>{ if(S.clock-t0>=sec){ clearInterval(h); r(); } },50); }); };
  function holdCam(pos, look, sec){ S.shot={pos:pos.clone(), look:look.clone(), until:S.clock+sec}; return gwait(sec); }
  const run = makeRunner({
    singer(){ S.singing=true; [392,440,392,349,330,349,392].forEach((f,i)=>tone({f, dur:.42, gain:.035, delay:i*.45, type:'triangle'})); },
    async deadSinger(){ closeDlg(); const p=singer.position; await holdCam(new THREE.Vector3(p.x+2.2,1.6,p.z+2.4), new THREE.Vector3(p.x,.3,p.z), 3.2); },
    async shakeFlask(){ closeDlg(); S.flaskT=1.6; await holdCam(new THREE.Vector3(zhum.position.x+1.6,1.1,zhum.position.z+2.2), new THREE.Vector3(zhum.position.x,.9,zhum.position.z), 1.8); },
    async raftView(){ closeDlg(); await holdCam(new THREE.Vector3(0,7.5,108.5), new THREE.Vector3(0,0,116.5), 3.4); },
    raftPush(){ S.raftDrift=true; },
    async pushedOnRaft(){ closeDlg(); await fadeTo(.85,500); asan.position.set(0,.45,raft.position.z); await fadeTo(0,700); }
  });

  // ---------- ввод ----------
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), groundPlane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
  function screenToGround(ev, out){
    const r=canvas.getBoundingClientRect(); mouse.set(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1);
    ray.setFromCamera(mouse, camera); return ray.ray.intersectPlane(groundPlane, out);
  }
  // прицел: точка на земле, но не дальше поля боя — иначе у горизонта луч уходит на сотни метров и камеру уводит
  const aimP=new THREE.Vector3();
  function setAim(ev){ if(!screenToGround(ev, aimP)) return; aimP.x=clamp(aimP.x,-28,28); aimP.z=clamp(aimP.z,-75,-3);
    // на телефоне палец толстый: цель рядом с касанием берётся сама и ведётся, пока держишь
    S.lock=null; if(isTouch){ let bd=4.5; for(const e of enemies){ if(!e.alive) continue; const d=Math.hypot(e.p.position.x-aimP.x, e.p.position.z-aimP.z); if(d<bd){ bd=d; S.lock=e; } } }
    S.aim.copy(aimP); }
  const onMove = ev=>{ if(S.phase==='battle'){ setAim(ev); const a=$('aim'); a.style.left=ev.clientX+'px'; a.style.top=ev.clientY+'px'; } };
  const onDown = ev=>{
    if(dlgOpen) return;
    if(S.phase==='battle'){ if(S.buried) return; S.firing=true; if(isTouch) $('aim').style.display='block'; onMove(ev); return; }
    if(!S.busy && (S.phase==='train' || S.phase==='riverWalk')){ const p=screenToGround(ev, tmp2); if(p) S.target={x:p.x, z:p.z}; }
  };
  const onUp = ()=>{ S.firing=false; S.lock=null; if(isTouch) $('aim').style.display='none'; };
  listen(canvas,'pointermove', onMove); listen(canvas,'pointerdown', onDown); listen(window,'pointerup', onUp);
  listen(canvas,'wheel', e=>{ S.zoom = clamp(S.zoom + Math.sign(e.deltaY)*.1, .6, 1.6); }, {passive:true});

  function walk(dt, t, bounds){
    let mx=0, mz=0;
    if(!S.busy && !dlgOpen){
      [mx, mz] = moveInput();
      if(mx||mz) S.target=null;
      if(S.target){ const dx=S.target.x-asan.position.x, dz=S.target.z-asan.position.z, d=Math.hypot(dx,dz); if(d<.25) S.target=null; else { mx=dx/d; mz=dz/d; } }
    }
    const len=Math.hypot(mx,mz);
    if(len){ mx/=len; mz/=len; asan.position.x+=mx*4.4*dt; asan.position.z+=mz*4.4*dt; asan.rotation.y=Math.atan2(mx,mz);
      if(bounds){ asan.position.x=clamp(asan.position.x,bounds[0],bounds[1]); asan.position.z=clamp(asan.position.z,bounds[2],bounds[3]); }
      S.stepT+=dt; if(S.stepT>.3){ S.stepT=0; sfx.step(); } }
    animWalk(asan, len?1:0, dt);
  }

  // налёт: бомбы ложатся «дорожкой» вдоль состава; на земле заранее видна растущая тень
  const shadowM = new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:.0});
  async function dropBomb(x,z){
    const m=new THREE.Mesh(new THREE.CircleGeometry(2.4,20), shadowM.clone()); m.rotation.x=-Math.PI/2; m.position.set(x,.05,z); m.scale.setScalar(.2); scene.add(m);
    tone({f:1400,dur:1.1,type:'sine',gain:.05,slide:-900,bus:'sfx'});
    const t0=performance.now();
    while(performance.now()-t0<1150){ const k=(performance.now()-t0)/1150; m.scale.setScalar(.2+k*.8); m.material.opacity=.15+k*.4; await wait(30); }
    scene.remove(m);
    explode(x,z,1.2);
    if(Math.hypot(singer.position.x-x, singer.position.z-z)<3 && singer.rotation.x===0){ S.singing=false; singer.rotation.x=-Math.PI/2; singer.position.y=.25; decal(singer.position.x, singer.position.z+.4, .8, bloodM); }
    if(S.zhumFrozen && Math.hypot(zhum.position.x-x, zhum.position.z-z)<3.2){ zhum.rotation.x=-Math.PI/2; zhum.position.y=.25; setTimeout(()=>{ zhum.rotation.x=0; zhum.position.y=0; bark('Жумабай','Живой… живой я!'); },2200); }
    const under = asan.position.distanceTo(SAFE)<2.2;
    return !under && Math.hypot(asan.position.x-x, asan.position.z-z)<3.4;
  }
  async function raid(){
    await wait(2600); // самолёты заходят, первая бомба отрывается
    const path=[[-27,TRAIN_Z+6],[-20,TRAIN_Z+4],[-13,TRAIN_Z+7],[-6,TRAIN_Z+3.4],[-2.5,TRAIN_Z+5.5],[1,TRAIN_Z+3.8],[5,TRAIN_Z+6.5],[10,TRAIN_Z+4],[17,TRAIN_Z+6],[24,TRAIN_Z+3.5]];
    let hit=false; const all=[];
    for(const [x,z] of path){ all.push(dropBomb(x,z).then(h=>{ if(h) hit=true; })); await wait(520); if(hit) break; }
    await Promise.all(all); await wait(hit?0:1500);
    return hit;
  }
  // ---------- фазы ----------
  async function phaseTrain(){
    S.phase='train'; asan.position.set(-3,0,TRAIN_Z+4); zhum.position.set(-1.5,0,TRAIN_Z+4.5); kol.position.set(5,0,TRAIN_Z+4); semyon.position.set(1,0,TRAIN_Z+4.6);
    camera.position.set(-3,16,TRAIN_Z+18); camera.lookAt(asan.position);
    await fadeTo(0,1600);
    await run(DAT.scripts.train_intro); closeDlg();
    S.busy=false; setObj(CH, DAT.objectives.train);
    // гул, затем заход трёх самолётов вдоль состава
    noiseBurst({dur:4,freq:120,q:.4,gain:.25,type:'lowpass'});
    for(let i=0;i<3;i++){ const p=makePlane(); p.position.set(-140-i*14, 45+i*3, TRAIN_Z-12+i*6); p.rotation.y=Math.PI/2; planes.push(p); }
    S.bombT=0;
    // Семён первым замечает самолёты и ныряет под вагон: «Ложись» Асан уже понимает
    bark('Семён', DAT.barks.semyonAlarm, 'ru'); S.semyonRun=true;
    // Жумабай застыл посреди насыпи — его можно утащить под вагон (E)
    S.zhumFrozen=true; S.zhumPulled=false;
    await wait(1200); bark('Жумабай','Ой-бай… Құдай…');
    for(;;){
      const hit = await raid();
      if(!hit) break;
      // Асана накрыло: заново с начала налёта
      S.busy=true; S.target=null; hitFlash(); await wait(700); await fadeTo(1,900);
      await showCard('','Асана накрыло у насыпи', DAT.texts && DAT.texts.raidRetry || 'Тени бомб ползут по земле к составу. Как только крикнули «Ложись!» — под вагон.','Попробовать снова');
      singer.rotation.x=0; singer.position.set(-6,0,TRAIN_Z+3.5); S.singing=true;
      asan.position.set(-3,0,TRAIN_Z+4); zhum.position.set(-1.5,0,TRAIN_Z+4.5); zhum.rotation.set(0,0,0); S.zhumFrozen=!S.zhumPulled; S.zhumGo=false;
      planes.forEach(p=>scene.remove(p)); planes.length=0;
      for(let i=0;i<3;i++){ const p=makePlane(); p.position.set(-140-i*14, 45+i*3, TRAIN_Z-12+i*6); p.rotation.y=Math.PI/2; planes.push(p); }
      await fadeTo(0,700); S.busy=false; bark('Семён', DAT.barks.semyonAlarm, 'ru');
    }
    S.busy=true; S.target=null;
    if(S.zhumPulled){ memory.flags.zhumPulled=true; memory.relations.zhumabai=(memory.relations.zhumabai||0)+1; remember('Ты утащил Жумабая под вагон, когда он застыл под бомбами'); }
    planes.forEach(p=>scene.remove(p)); planes.length=0;
    await run(DAT.scripts.train_after); closeDlg();
    await fadeTo(1,1200);
    phaseTrench();
  }
  async function phaseTrench(){
    S.phase='trench'; asan.position.set(0,-.45,0); asan.rotation.y=Math.PI; zhum.position.set(1.2,-.45,.2); zhum.rotation.y=Math.PI; kol.position.set(-2.4,-.45,.1); kol.rotation.y=Math.PI*.9;
    S.semyonRun=false; semyon.position.set(3.3,-.45,.15); semyon.rotation.set(0,Math.PI,0);
    scene.background.setHex(0xcbb184); scene.fog.color.setHex(0xcbb184);
    setObj(CH,'');
    await fadeTo(0,1400);
    await run(DAT.scripts.trench); closeDlg();
    phaseBattle();
  }
  function startWave(){
    S.wave++; S.waveT=0; S.spawnLeft = [0,9,12,14][S.wave]||0; S.spawnT=0;
    if(S.wave===2){ spawnTank(); zhumabaiRun(); }
    bark('Колесников', ['','Идут! Дыши. Вперёд смотри!','Танк! По пехоте бей, по пехоте!','Ещё идут! Диск!'][S.wave], 'ru');
  }
  // Жумабай уходит за дисками. Что с ним — игрок понимает сам, когда диск кончится, а его всё нет
  async function zhumabaiRun(){
    // врезка: диск пуст, Жумабай бежит за новыми
    S.cut=true; S.firing=false; cine(true); $('aim').style.display='none';
    for(let i=0;i<7;i++){ afterShot(); tracer(tmp.set(0,.8,-2.1), tmp2.set(rand(-6,6),.5,rand(-40,-25))); await wait(95); }
    tone({f:900,dur:.04,type:'square',gain:.05}); await wait(260); tone({f:900,dur:.04,type:'square',gain:.05});
    bark('Асан','Пусто! Жумабай, диск! Диск давай!');
    await wait(1600);
    bark('Жумабай','Последний был! Сейчас — к старшине, мигом!');
    await wait(1100);
    S.zhumRun=1;
    await wait(2600);
    S.cut=false; cine(false); if(!isTouch) $('aim').style.display='block';
    S.ammo=0; S.disks=Math.min(S.disks,1); // один запасной в подсумке — и всё
    await wait(2600);
    // разрыв там, куда он убежал; дым, и больше его не видно
    explode(zhum.position.x, zhum.position.z-.4, 1.1); zhum.visible=false; S.zhumRun=0;
    const cap=new THREE.Mesh(new THREE.BoxGeometry(.32,.08,.18), M(KHAKI)); cap.position.set(zhum.position.x+.6,-.4,zhum.position.z+.3); cap.rotation.y=.6; scene.add(cap);
    S.zhumWait=true; S.zhumWaitT=0;
  }
  async function zhumabaiRealize(){
    S.zhumWait=false;
    think('Жумабай?');
    await wait(2200);
    think('Его всё нет. Тот разрыв в ходе сообщения… там, куда он побежал.');
    await run(DAT.scripts.zhumabai_lost);
    await wait(2500); S.disks+=2; bark('Колесников','Держи диски! Жумабая не жди — ход сообщения накрыло!','ru');
    await wait(1500); bark('Асан','Жумабай…');
  }
  function phaseBattle(){
    semyon.visible=false; // в бою он на соседнем участке
    S.phase='battle'; S.busy=false; S.hp=Math.max(S.hp,60); S.battleT=0;
    setObj(CH, isTouch ? DAT.objectives.battleTouch : DAT.objectives.battle);
    $('ammo').style.display='block'; if(!isTouch){ $('aim').style.display='block'; canvas.style.cursor='none'; }
    if(isTouch){ $('touch').style.display='flex'; $('tAct').textContent='Диск'; $('tCrawl').style.display='none'; }
    setHeart(110); startWave();
  }
  function shoot(){
    if(S.ammo<=0 || S.reload>0) return;
    S.ammo--; S.fireCd=.1;
    const from = new THREE.Vector3(0,.68,-1.9);
    const dir = tmp.copy(S.aim).setY(.9).sub(from); const dist=dir.length(); dir.normalize();
    const spread=.035; dir.x+=rand(-spread,spread); dir.z+=rand(-spread,spread); dir.normalize();
    // попадание: ближайший враг рядом с линией выстрела
    let best=null, bt=999;
    for(const e of enemies){ if(!e.alive) continue;
      const rel=tmp2.copy(e.p.position).setY(.9).sub(from); const along=rel.dot(dir); if(along<0) continue;
      const perp=rel.clone().addScaledVector(dir,-along); perp.y=0; const r = e.prone>0 ? .32 : .55;
      if(perp.length()<r && along<bt){ bt=along; best=e; } }
    let end;
    if(tank && tank.alive){ const rel=tmp2.copy(tank.g.position).setY(.9).sub(from); const along=rel.dot(dir); const perp=rel.clone().addScaledVector(dir,-along); perp.y=0;
      if(along>0 && perp.length()<2 && along<bt){ end=from.clone().addScaledVector(dir,along); tracer(from,end); puff(end, fireTex, .5, .08, 0, 0, true); if(Math.random()<.3) tone({f:2400,dur:.05,type:'square',gain:.04}); afterShot(); return; } }
    if(best){ end=from.clone().addScaledVector(dir,bt); best.hp--; if(best.hp<=0) killEnemy(best); }
    else { end=from.clone().addScaledVector(dir, Math.max(dist,8)+rand(0,6)); end.y=0; puff(tmp2.copy(end).setY(.3), dustTex, .7, .4, 1, 1.5); }
    tracer(from,end); afterShot();
  }
  function afterShot(){
    muzzle.position.set(0,.8,-2.1); muzzle.intensity=2.5;
    noiseBurst({dur:.07,freq:1100,q:.6,gain:.16,type:'bandpass'}); tone({f:90,dur:.06,type:'square',gain:.06});
    shake=Math.max(shake,.08);
  }
  function killEnemy(e){
    e.alive=false; const p=e.p; p.rotation.x = -Math.PI/2*rand(.85,1); p.rotation.z=rand(-.4,.4); p.position.y=.22;
    decal(p.position.x+rand(-.3,.3), p.position.z+rand(-.2,.4), rand(.4,.8), bloodM);
    if(Math.random()<.35) tone({f:300,dur:.25,type:'sawtooth',gain:.03,delay:.05,slide:-180});
  }
  function hitFlash(){ const h=$('hit'); h.style.opacity=1; setTimeout(()=>h.style.opacity=0, 220); shake=Math.max(shake,.5); }
  function playerHit(dmg){ S.hp-=dmg; hitFlash(); if(S.hp<=0 && S.phase==='battle') battleLost(); }
  async function battleLost(){
    S.phase='lost'; S.firing=false; setHeart(0); $('aim').style.display='none'; canvas.style.cursor='';
    await fadeTo(1,1600);
    await showCard('','Асан погиб у Дона','Не подпускай пехоту к окопу и меняй диск, пока они лежат.','Попробовать снова');
    // заново только бой: враги и танк убираются
    enemies.forEach(e=>scene.remove(e.p)); enemies.length=0; if(tank){ scene.remove(tank.g); tank=null; }
    S.wave=0; S.buried=false; S.buriedOnce=false; if($('buried')) $('buried').style.display='none'; S.zhumWait=false; S.zhumRun=0; S.hp=100; S.ammo=47; S.disks=3; S.reload=0; zhum.visible=true; zhum.position.set(1.2,-.45,.2);
    await fadeTo(0,1000); phaseBattle();
  }
  async function battleWon(){
    S.phase='retreat'; S.firing=false; S.buried=false; if($('buried')) $('buried').style.display='none'; $('aim').style.display='none'; canvas.style.cursor=''; $('ammo').style.display='none'; $('touch').style.display='none';
    setObj(CH, DAT.objectives.retreat);
    await run(DAT.scripts.retreat); closeDlg();
    setHeart(0);
    // вся глава снята сверху: на прощание с полем оказывается, что мы смотрели глазами птицы
    await birdReveal(new THREE.Vector3(.6,0,1), new THREE.Vector3(0,0,-20));
    await kitchenPanels();
    phaseRiver();
  }
  async function kitchenPanels(){
    scene.background.setHex(0x8a6a4a); scene.fog.color.setHex(0x8a6a4a); sun.color.setHex(0xff9a5c); sun.intensity=.5; hemi.intensity=.4;
    const cam2 = new THREE.PerspectiveCamera(40,1,.1,300);
    function shot(p, l, w=900, h=900){ cam2.aspect=w/h; cam2.updateProjectionMatrix(); cam2.position.copy(p); cam2.lookAt(l); const old=renderer.getSize(new THREE.Vector2()); renderer.setSize(w,h,false); renderer.render(scene,cam2); const u=canvas.toDataURL('image/jpeg',.85); renderer.setSize(old.x,old.y,false); return u; }
    asan.position.set(-2.4,0,16.6); asan.rotation.y=Math.PI; asan.userData.armR.rotation.x=-1.2;
    const shots=['img/ch2k_1.jpg','img/ch2k_2.jpg','img/ch2k_3.jpg']; // рисованные кадры: кухня, Асан ест за троих, нетронутые котелки
    const caps = DAT.panels.captions.map(c => c.if ? (evalCond(c.if, memory.flags) ? c.text : c.else) : c.text);
    const page=$('page'); page.innerHTML='';
    shots.forEach((u,i)=>{ const d=document.createElement('div'); d.className='pn art'; d.innerHTML=`<img class="art" src="${u}" alt=""><div class="cap">${escapeHtml(caps[i])}</div>`; page.appendChild(d); });
    page.classList.add('artpage'); page.classList.remove('four');
    $('panels').style.display='flex'; fitArtPage(page); await fadeTo(0,700);
    const clickPanels = () => new Promise(r=>{ const h=()=>{ $('panels').removeEventListener('pointerdown',h); removeEventListener('keydown',kk); r(); }; const kk=e=>{ if(e.code==='Space'||e.code==='Enter') h(); }; $('panels').addEventListener('pointerdown',h); addEventListener('keydown',kk); });
    const cells=[...page.children];
    for(let i=0;i<cells.length;i++){ cells[i].classList.add('on'); $('pnNext').textContent = i<cells.length-1 ? 'Нажми, чтобы открыть следующий кадр' : 'Нажми, чтобы перевернуть страницу'; await wait(350); await clickPanels(); }
    await run(DAT.scripts.kitchen);
    await fadeTo(1,900); $('panels').style.display='none'; page.classList.remove('artpage','row','two'); page.style.width=''; asan.userData.armR.rotation.x=0;
  }
  async function phaseRiver(){
    S.phase='riverWalk'; S.busy=true;
    scene.background.setHex(0x12161c); scene.fog.color.setHex(0x12161c); scene.fog.near=20; scene.fog.far=110; sun.intensity=.08; hemi.intensity=.18; sun.color.setHex(0x8899bb);
    asan.position.set(0,0,104); asan.rotation.y=0; kol.position.set(-6,0,108); zhum.visible=false;
    camera.position.set(0,18,120); camera.lookAt(asan.position);
    setObj(CH, DAT.objectives.raft); setHeart(84);
    await fadeTo(0,1500); S.busy=false; S.flareT=1;
  }
  async function raftChoice(){
    S.busy=true; S.phase='raft'; S.target=null;
    await run(DAT.scripts.raft); closeDlg();
    // переправа: плот уходит в темноту под разрывами
    asan.position.set(0,.36,119.5); asan.rotation.y=Math.PI;
    const choice = memory.flags.raft;
    if(choice==='wounded'){ lieutenant.position.set(-.6,.45,119.5); }
    if(choice==='gun'){ dpGround.position.set(.8,.45,119.7); }
    S.crossing=true; S.camFocus=raft; cine(true);
    for(let i=0;i<6;i++){ setTimeout(()=>{ const x=rand(-14,14), z=rand(125,152); puff(new THREE.Vector3(x,.5,z), softTex('rgba(220,230,235,.8)'), 3, 1.2, 4, 1.5); sfx.boom(); shake=Math.max(shake,.3); }, 900+i*1300); }
    await wait(9000); S.crossing=false; cine(false);
    await run(DAT.scripts.after_river); closeDlg();
    await fadeTo(1,1600);
    endChapter2();
  }

  // ---------- кадр ----------
  const sc = {
    S,
    wantsJoy(){ return !S.busy && (S.phase==='train' || S.phase==='riverWalk'); },
    update(dt,t){
      S.clock=(S.clock||0)+dt;
      // ремарки и мелкие жизни сцены — в любой фазе
      if(S.singing && singer.rotation.x===0){ singer.userData.armR.rotation.x=-2.2+Math.sin(t*2)*.3; singer.position.y=Math.abs(Math.sin(t*2.2))*.04; }
      if(S.flaskT>0){ S.flaskT-=dt; zhum.userData.armR.rotation.x=-1.4+Math.sin(t*16)*.45; if(S.flaskT<=0) zhum.userData.armR.rotation.x=0; }
      if(S.raftDrift && !S.crossing){ raft.position.z+=dt*.25; }
      if(S.semyonRun){ const dx=SAFE.x+1.1-semyon.position.x, dz=SAFE.z-semyon.position.z, d=Math.hypot(dx,dz); if(d>.15){ semyon.position.x+=dx/d*Math.min(d,4.8*dt); semyon.position.z+=dz/d*Math.min(d,4.8*dt); semyon.rotation.y=Math.atan2(dx,dz); animWalk(semyon,1.4,dt); } else { semyon.position.y=-.5; animWalk(semyon,0,dt); } }
      if(BIRD.active){ BIRD.update(dt); return; }
      // эффекты
      for(let i=fx.length-1;i>=0;i--){ const f=fx[i]; f.life-=dt; const k=1-f.life/f.max; f.s.position.y+=f.vy*dt; f.s.scale.setScalar(f.base*(1+k*f.grow)); f.s.material.opacity=Math.max(0,1-k); if(f.life<=0){ scene.remove(f.s); f.s.material.dispose(); fx.splice(i,1);} }
      for(let i=tracers.length-1;i>=0;i--){ const tr=tracers[i]; tr.life-=dt; tr.l.material.opacity=tr.life/.07; if(tr.life<=0){ scene.remove(tr.l); tr.l.geometry.dispose(); tracers.splice(i,1);} }
      muzzle.intensity=Math.max(0,muzzle.intensity-dt*30);

      if(S.phase==='train'){
        walk(dt,t,[-30,30,TRAIN_Z-1.2,TRAIN_Z+12]);
        if(asan.position.distanceTo(SAFE)<2.2){ asan.position.y=-.5; } else asan.position.y=0;
        S.bombT=(S.bombT||0)+dt;
        planes.forEach((p,i)=>{ p.position.x+=dt*(38+i*2); p.position.y=Math.max(22, p.position.y - (Math.abs(p.position.x)<60?dt*6:0)); });
        // знак укрытия под вагоном
        tmp.copy(SAFE); tmp.y=1.2; tmp.project(camera); const pr=$('prompt');
        const nearZ = S.zhumFrozen && asan.position.distanceTo(zhum.position)<1.8;
        if(nearZ){ tmp.copy(zhum.position); tmp.y=2; tmp.project(camera); }
        if(!S.busy && (nearZ || asan.position.distanceTo(SAFE)>2.2)){ pr.style.display='block'; pr.style.left=((tmp.x+1)/2*innerWidth)+'px'; pr.style.top=((1-tmp.y)/2*innerHeight)+'px'; pr.textContent= nearZ ? (isTouch?'Тащить Жумабая':'E — тащить Жумабая') : 'Сюда — под вагон'; } else pr.style.display='none';
        if(S.zhumGo){ const dx=SAFE.x-1-zhum.position.x, dz=SAFE.z-zhum.position.z, d=Math.hypot(dx,dz); if(d>.15){ zhum.position.x+=dx/d*Math.min(d,5*dt); zhum.position.z+=dz/d*Math.min(d,5*dt); zhum.rotation.y=Math.atan2(dx,dz); animWalk(zhum,1.4,dt); } else { zhum.position.y=-.5; S.zhumGo=false; animWalk(zhum,0,dt); } }
        camFollow(dt, asan.position, 15, 13);
      }
      else if(S.phase==='trench'){ camFollow(dt, tmp.set(0,0,-6), 13, 12); }
      else if(S.phase==='battle'){ battleUpdate(dt,t); }
      else if(S.phase==='retreat' || S.phase==='lost'){ camFollow(dt, tmp.set(0,0,-10), 18, 14); }
      else if(S.phase==='riverWalk'){
        walk(dt,t,[-20,20,100,117]);
        S.flareT-=dt; if(S.flareT<=0){ S.flareT=rand(3,6); flare.position.set(rand(-25,25),24,rand(95,150)); flare.intensity=2.4; sfx.flare(); }
        flare.intensity=Math.max(0,flare.intensity-dt*.5);
        if(!S.busy && asan.position.z>113.5){ raftChoice(); }
        const pr=$('prompt'); tmp.copy(raft.position); tmp.y=1.2; tmp.project(camera);
        if(!S.busy){ pr.style.display='block'; pr.style.left=((tmp.x+1)/2*innerWidth)+'px'; pr.style.top=((1-tmp.y)/2*innerHeight)+'px'; pr.textContent='Плот'; } else pr.style.display='none';
        camFollow(dt, asan.position, 16, 12);
      }
      else if(S.phase==='raft'){
        flare.intensity=Math.max(0,flare.intensity-dt*.5);
        if(S.crossing){ raft.position.z+=dt*2.6; asan.position.z=raft.position.z; if(memory.flags.raft==='wounded') lieutenant.position.z=raft.position.z; if(memory.flags.raft==='gun') dpGround.position.z=raft.position.z+.2; raft.rotation.z=Math.sin(t*1.3)*.04; }
        // длинный объектив с берега: плот уходит в ночь
        camera.fov=lerp(camera.fov, S.crossing?22:45, 1-Math.pow(.05,dt)); camera.updateProjectionMatrix();
        camFollow(dt, raft.position, S.crossing?6:16, S.crossing?-34:12);
      }
      if(shake>0){ camera.position.x+=rand(-1,1)*shake*.35; camera.position.y+=rand(-1,1)*shake*.25; shake=Math.max(0,shake-dt*2.5); }
      sun.target.position.copy(asan.position); sun.position.set(asan.position.x-20,40,asan.position.z+25);
    },
    onKey(code,down){ if(!down) return;
      if(code==='KeyR' && S.phase==='battle') reload();
      if(S.phase==='battle' && S.buried && (code==='Space'||code==='KeyE')){ dig(); return; }
      if(S.phase==='battle' && code==='Space') S.firing=true;
      if(S.phase==='train' && code==='KeyE') pullZhum();
    },
    act(){ if(S.phase==='battle'){ if(S.buried) dig(); else reload(); } else if(S.phase==='train') pullZhum(); },
    holdStart(){}, holdEnd(){},
    async begin(){
      setObj(CH,'');
      await showCard(DAT.card.small, DAT.card.big, DAT.card.text, 'Начать');
      phaseTrain();
    },
    // для автопроверки: закончить бой сразу
    debugZhum(){ zhumabaiRun(); },
    debugBattle(){ S.busy=true; asan.position.set(0,-.45,0); asan.rotation.y=Math.PI; zhum.position.set(1.2,-.45,.2); zhum.rotation.y=Math.PI; kol.position.set(-2.4,-.45,.1); phaseBattle(); },
    debugWin(){ enemies.forEach(e=>e.alive&&killEnemy(e)); S.wave=3; S.spawnLeft=0; }
  };
  listen(window,'keyup', e=>{ if(e.code==='Space' && S.phase==='battle') S.firing=false; });

  // засыпало: земля сверху, пулемёт не стреляет, пока не откопаешься
  function bury(){
    S.buried=true; S.digs=0; S.lastBury=S.battleT; S.firing=false; shake=Math.max(shake,1);
    let el=$('buried'); if(!el){ el=document.createElement('div'); el.id='buried'; document.body.appendChild(el);
      el.innerHTML='<div class="bText">Засыпало землёй</div><button type="button" id="digBtn">Копать</button><div class="bBar"><i></i></div><div class="bHint">жми быстро · Пробел или E</div>';
      el.querySelector('#digBtn').addEventListener('pointerdown',e=>{ e.stopPropagation(); e.preventDefault(); dig(); }); }
    el.querySelector('.bBar i').style.width='0%'; el.style.display='flex'; void el.offsetWidth; el.classList.add('on');
    noiseBurst({dur:1.4,freq:180,q:.4,gain:.3,type:'lowpass'});
    if(!S.buriedThink){ S.buriedThink=true; setTimeout(()=>think('Темно. Земля во рту. Дышать нечем — копай!'),400); }
  }
  function dig(){
    if(!S.buried) return;
    S.digs++; noiseBurst({dur:.12,freq:420+Math.random()*200,q:.7,gain:.14}); shake=Math.max(shake,.15);
    const el=$('buried'); el.querySelector('.bBar i').style.width=Math.min(100,S.digs/9*100)+'%';
    el.style.setProperty('--dirt', (1-S.digs/9).toFixed(2));
    if(S.digs>=9){ S.buried=false; el.classList.remove('on'); setTimeout(()=>{ if(!S.buried) el.style.display='none'; },350); bark('Асан','Ххх… Жив!'); }
  }
  function pullZhum(){ if(!S.zhumFrozen || S.busy || asan.position.distanceTo(zhum.position)>1.8) return; S.zhumFrozen=false; S.zhumPulled=true; S.zhumGo=true; zhum.rotation.x=0; zhum.position.y=0; bark('Асан','Жумабай! Вниз, вниз!'); }
  function reload(){ if(S.reload>0 || S.ammo===47) return; if(S.disks<=0){ if(S.zhumWait) zhumabaiRealize(); else bark('Асан','Дисков нет…'); return; } S.reload=2.2; S.disks--; noiseBurst({dur:.15,freq:600,gain:.15}); setTimeout(()=>noiseBurst({dur:.12,freq:900,gain:.18}),900); }

  function camFollow(dt, target, h, back){
    if(S.shot && S.shot.until>S.clock){ camera.position.copy(S.shot.pos); camera.lookAt(S.shot.look); return; }
    const z=S.zoom; tmp2.set(target.x, h*z, target.z + back*z);
    camera.position.lerp(tmp2, 1-Math.pow(.03,dt)); camera.lookAt(target.x, 0, target.z - (S.phase==='battle'?10:0));
  }

  function battleUpdate(dt,t){
    if(S.cut){ if(S.zhumRun){ zhum.position.x-=3.2*dt; zhum.rotation.y=-Math.PI/2; animWalk(zhum,1,dt); }
      muzzle.intensity=Math.max(0,muzzle.intensity-dt*30);
      tmp2.set(3.6,1.05,2.4); camera.position.lerp(tmp2, 1-Math.pow(.001,dt)); camera.fov=lerp(camera.fov,38,1-Math.pow(.02,dt)); camera.updateProjectionMatrix();
      camera.lookAt(lerp(.4,-1.5,Math.min(1,Math.max(0,(1.2-zhum.position.x)/8))), .35, -.2); return; }
    // нужен диск, а Жумабая нет — тут и доходит
    if(S.zhumWait){ S.zhumWaitT+=dt; if((S.disks===0 && (S.ammo<12 || S.reload>0)) || S.zhumWaitT>28) zhumabaiRealize(); }
    S.battleT+=dt; S.waveT+=dt;
    // первый раз засыпает обязательно: снаряд ложится на бруствер
    if(!S.buriedOnce && S.battleT>14 && !S.cut){ S.buriedOnce=true; explode(rand(-1.5,1.5),-2.6,1); playerHit(8); bury(); }
    if(S.buried){ S.firing=false; }
    // огонь
    S.fireCd-=dt;
    if(S.reload>0){ S.reload-=dt; if(S.reload<=0){ S.ammo=47; } }
    if(S.firing && S.fireCd<=0 && S.ammo>0 && S.reload<=0) shoot();
    if(S.ammo===0 && S.reload<=0 && S.disks>0 && !S.autoHint){ S.autoHint=true; bark('Колесников','Диск! Меняй диск!','ru'); }
    if(S.ammo>0) S.autoHint=false;
    $('ammo').innerHTML = S.reload>0 ? 'смена диска…' : `<b>${S.ammo}</b> / 47<br>запасных дисков: ${S.disks}`;
    // волны
    if(S.spawnLeft>0){ S.spawnT-=dt; if(S.spawnT<=0){ spawnEnemy(); S.spawnLeft--; S.spawnT=rand(.4,1.1); } }
    const alive = enemies.filter(e=>e.alive).length;
    if(S.spawnLeft===0 && alive===0 && S.waveT>4){ if(S.wave<3) startWave(); else if(S.phase==='battle') battleWon(); }
    // пехота
    for(const e of enemies){ if(!e.alive) continue; const p=e.p;
      if(e.prone>0){ e.prone-=dt; if(e.prone<=0){ p.rotation.x=0; p.position.y=0; } continue; }
      e.nextProne-=dt; if(e.nextProne<=0){ e.prone=rand(1,2.2); e.nextProne=rand(3,6); p.rotation.x=-Math.PI/2*.9; p.position.y=.2; continue; }
      p.position.z += e.speed*dt; p.position.x += Math.sin(t*.7+p.id)*dt*.3; animWalk(p,1,dt);
      e.fireT-=dt; if(e.fireT<=0){ e.fireT=rand(2,4.5); tracer(tmp.copy(p.position).setY(1.2), tmp2.set(rand(-4,4),.8,rand(-1.5,.5)), enemyTracerM); noiseBurst({dur:.06,freq:1600,gain:.05}); if(Math.random()<.12) playerHit(6); }
      if(p.position.z>-5){ e.alive=false; scene.remove(p); explode(rand(-2,2), -1.5, .7); playerHit(22); }
    }
    // танк: ползёт, бьёт из пулемёта; у рубежа его поджигает ПТО
    if(tank && tank.alive){ tank.g.position.z+=1.5*dt; tank.fireT-=dt;
      if(tank.fireT<=0){ tank.fireT=rand(.15,.3); tracer(tmp.copy(tank.g.position).setY(1.9), tmp2.set(rand(-8,8),.6,rand(-2,1)), enemyTracerM); if(Math.random()<.04) playerHit(5); }
      if(tank.g.position.z>-30){ tank.alive=false; explode(tank.g.position.x, tank.g.position.z, 1.6); tank.g.children.forEach(m=>m.material=M(0x1e1c1a)); bark('Колесников','Горит! Сорокапятка его взяла!','ru'); } }
    if(tank && !tank.alive){ tank.smokeT-=dt; if(tank.smokeT<=0){ tank.smokeT=.25; puff(tmp.copy(tank.g.position).setY(2.2), smokeTex, 2.5, 3, 2, 2.5); } }
    // артиллерия
    S.artT-=dt; if(S.artT<=0){ S.artT=rand(1.8,3.6); let x,z; do{ x=rand(-26,26); z=rand(-22,10); }while(Math.hypot(x,z)<3.5);
      const d=explode(x,z,1); if(d<5.5){ playerHit(12); setRing(true); setTimeout(()=>setRing(false),3500); if(d<4 && !S.buried && S.battleT-(S.lastBury||-99)>25) bury(); }
      comrades.forEach(cm=>{ if(cm.alive && Math.hypot(cm.p.position.x-x, cm.p.position.z-z)<2.2){ cm.alive=false; cm.p.rotation.x=Math.PI/2; cm.p.position.y=-.2; decal(cm.p.position.x, cm.p.position.z, .7, bloodM); } }); }
    // товарищи стреляют
    comrades.forEach(cm=>{ if(!cm.alive) return; cm.t-=dt; if(cm.t<=0){ cm.t=rand(1.2,3); const tg=enemies.find(e=>e.alive && Math.random()<.5); const to = tg ? tmp2.copy(tg.p.position).setY(1) : tmp2.set(rand(-20,20),.5,rand(-60,-30)); tracer(tmp.copy(cm.p.position).setY(.9), to); noiseBurst({dur:.08,freq:900,gain:.05}); if(tg && Math.random()<.12) killEnemy(tg); } });
    // Жумабай бежит по ходу сообщения за дисками
    if(S.zhumRun){ zhum.position.x-=3.2*dt; zhum.rotation.y=-Math.PI/2; animWalk(zhum,1,dt); }
    // камера над окопом: видно сектор впереди
    // низкая камера за спиной расчёта: виден и окоп, и всё поле до горизонта
    if(S.lock){ if(S.lock.alive) S.aim.set(S.lock.p.position.x,0,S.lock.p.position.z); else S.lock=null; }
    // камера чуть смотрит туда, куда целишься; на телефоне стоит на месте — иначе поле уезжает из-под пальца
    const ax = isTouch ? 0 : clamp(S.aim.x,-28,28);
    const z=S.zoom; tmp2.set(1.6+ax*.06, 5.2*z, 7.5*z);
    camera.position.lerp(tmp2, 1-Math.pow(.03,dt));
    camera.fov = lerp(camera.fov, 50, 1-Math.pow(.05,dt)); camera.updateProjectionMatrix();
    camera.lookAt(ax*.3, 0, -24);
    // сердце и сознание: чем меньше здоровья, тем краснее по краям
    $('vig').style.background = `radial-gradient(ellipse at center,transparent ${30+S.hp*.2}%,rgba(${(100-S.hp)*.9|0},0,0,.85) 100%)`;
  }
  return sc;
}
