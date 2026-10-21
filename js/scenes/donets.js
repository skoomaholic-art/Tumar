'use strict';
// Глава 4. Северский Донец: ночь с Гришей, рассвет 5 июля, воронка, окружение и ранение.
// Глава кончается ранением в бедро и грудь в поле подсолнухов — оттуда начинается глава 5.
// Монтаж: долгие планы, жёсткие склейки внутри сцены, шторка на скачках времени.
// Приём «глаза птицы» здесь не используется: верхние сцены обрываются темнотой, а не взлётом.

function sceneDonets(){
  resetCamera();
  const DAT = DATA.ch4, CH = 'Глава 4 · '+DAT.title;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x141a26);
  scene.fog = new THREE.Fog(0x141a26, 40, 300);
  const hemi = new THREE.HemisphereLight(0x8a98b8, 0x1e1a16, .35); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0x9fb0d0, .3); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:1,far:140});
  scene.add(sun, sun.target);
  // свет по времени суток: ночь, рассвет в дыму, день в гари
  const LIGHT = {
    night:{bg:0x141a26, fogN:40, fogF:300, hemi:[0x8a98b8,.35], sun:[0x9fb0d0,.3], sp:[-30,40,-20]},
    dawn: {bg:0x8a7462, fogN:30, fogF:220, hemi:[0xe0c8a8,.5],  sun:[0xffb070,.75], sp:[60,18,-30]},
    day:  {bg:0x9a8a70, fogN:22, fogF:170, hemi:[0xe8d8b8,.55], sun:[0xfff0d0,.7],  sp:[-20,40,25]}
  };
  function setLight(k){ const L=LIGHT[k]; scene.background.setHex(L.bg); scene.fog.color.setHex(L.bg); scene.fog.near=L.fogN; scene.fog.far=L.fogF;
    hemi.color.setHex(L.hemi[0]); hemi.intensity=L.hemi[1]; sun.color.setHex(L.sun[0]); sun.intensity=L.sun[1]; S.sunOff=L.sp; }

  // ---------- земля: июльская степь, чернозём, зелень с выгоревшими пятнами ----------
  const gGeo = new THREE.PlaneGeometry(700,700,140,140); gGeo.rotateX(-Math.PI/2);
  const col=[], pos=gGeo.attributes.position, c=new THREE.Color();
  for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i);
    const n=Math.sin(x*.08)*Math.cos(z*.06)+Math.sin(x*.27+z*.21)*.4;
    c.setHex(n>.7?0x8a8250:(n<-.6?0x4e4a2c:0x6a6a3c)); c.offsetHSL(0,0,rand(-.03,.03)); col.push(c.r,c.g,c.b); }
  gGeo.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); gGeo.computeVertexNormals();
  const ground = new THREE.Mesh(gGeo, new THREE.MeshLambertMaterial({vertexColors:true})); ground.receiveShadow=true; scene.add(ground);

  // ---------- река: Северский Донец течёт с запада на восток, немцы на том (северном) берегу ----------
  const RIVER_Z = -50;
  const river = new THREE.Mesh(new THREE.PlaneGeometry(700,24), new THREE.MeshPhongMaterial({color:0x2c3c44, shininess:70})); river.rotation.x=-Math.PI/2; river.position.set(0,.05,RIVER_Z); scene.add(river);
  for(const z of [RIVER_Z+13.5, RIVER_Z-13.5]){ const b=new THREE.Mesh(new THREE.PlaneGeometry(700,4),M(0x7e6e50)); b.rotation.x=-Math.PI/2; b.position.set(0,.045,z); scene.add(b); }
  // вербы на том берегу
  const willowM = M(0x3a4630);
  for(let i=0;i<46;i++){ const w=new THREE.Mesh(new THREE.SphereGeometry(rand(1.6,3),7,5),willowM); w.scale.y=rand(.8,1.3); w.position.set(rand(-120,120),rand(1.8,2.8),RIVER_Z-rand(16,30)); scene.add(shadowAll(w)); }

  // ---------- окоп над рекой, ДП на бруствере, ход сообщения к селу ----------
  const trench = new THREE.Mesh(new THREE.BoxGeometry(90,.06,1.5), M(0x2e2416)); trench.position.set(0,.03,0); scene.add(trench);
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(90,.5,1), M(0x5e4c30)); parapet.position.set(0,.25,-1.2); scene.add(shadowAll(parapet));
  const commTrench = new THREE.Mesh(new THREE.BoxGeometry(1.2,.06,22), M(0x2e2416)); commTrench.position.set(-3,.035,11); scene.add(commTrench);
  const dp=new THREE.Group(); const dpB=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.25,6),M(0x1e1e1e)); dpB.rotation.x=Math.PI/2; dpB.position.z=-.55;
  const dpD=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.06,14),M(0x2a2a26)); dpD.position.set(0,.12,-.05); dp.add(dpB,dpD); dp.position.set(0,.6,-1.25); scene.add(dp);
  const muzzle = new THREE.PointLight(0xffd090, 0, 8); scene.add(muzzle);

  // ---------- село: белёные хаты под соломой, вишни ----------
  const huts=[];
  for(const [x,z] of [[-26,26],[-17,30],[-8,25],[-30,38],[-12,40],[2,34]]){
    const h=new THREE.Group(); const wl=new THREE.Mesh(new THREE.BoxGeometry(5,2.2,4),M(0xd8d0bc)); wl.position.y=1.1;
    const rf=new THREE.Mesh(new THREE.ConeGeometry(4.2,2,4),M(0x8e7a4c)); rf.rotation.y=Math.PI/4; rf.position.y=3.2; rf.scale.set(1.25,1,1);
    const dr=new THREE.Mesh(new THREE.BoxGeometry(.9,1.6,.08),M(0x4a3a28)); dr.position.set(.8,.8,2.02);
    h.add(wl,rf,dr); h.position.set(x,0,z); scene.add(shadowAll(h)); huts.push(h);
    for(let k=0;k<3;k++){ const t=new THREE.Mesh(new THREE.SphereGeometry(1.1,7,5),M(0x3e4a2c)); t.position.set(x+rand(-5,5),1.8,z+rand(3,6)); scene.add(shadowAll(t)); }
  }

  // ---------- поле подсолнухов: от окопа к балке на юго-восток. Это же поле — в главе 5 ----------
  const FIELD = {x0:5, x1:70, z0:3, z1:75};
  const LIE = new THREE.Vector3(10,0,8);   // здесь Асан ляжет с ДП и прикроет отход
  const stemG = new THREE.CylinderGeometry(.03,.04,2.1,4); stemG.translate(0,1.05,0);
  const headG = new THREE.CylinderGeometry(.29,.29,.07,10); headG.rotateX(Math.PI/2*.7); headG.translate(0,2.15,.05);
  const discG = new THREE.CylinderGeometry(.15,.15,.08,8); discG.rotateX(Math.PI/2*.7); discG.translate(0,2.16,.08);
  const NIGHT_CAM = new THREE.Vector3(5.6,1.35,3.4);
  const NSF=4600, stems=new THREE.InstancedMesh(stemG,M(0x5a6a34),NSF), heads=new THREE.InstancedMesh(headG,M(0xc9a028),NSF), discs=new THREE.InstancedMesh(discG,M(0x4a3218),NSF);
  { const d=new THREE.Object3D(); let i=0;
    while(i<NSF){ let x=rand(FIELD.x0,FIELD.x1), z=rand(FIELD.z0,FIELD.z1);
      if(i<1200){ const a=rand(0,Math.PI*2), r=rand(2.6,15); x=LIE.x+Math.cos(a)*r; z=LIE.z+Math.sin(a)*r; if(x<FIELD.x0-1.5||z<FIELD.z0) continue; }
      if(Math.hypot(x-LIE.x,z-LIE.z)<2.6 || Math.hypot(x-NIGHT_CAM.x,z-NIGHT_CAM.z)<3 || (z<6.5 && x<13)) continue;   // у окопа поле начинается дальше            // примятое место, где он ляжет
      d.position.set(x,0,z); d.rotation.set(rand(-.08,.08), Math.PI+rand(-.5,.5), rand(-.08,.08)); d.scale.setScalar(rand(.85,1.15)); d.updateMatrix();
      stems.setMatrixAt(i,d.matrix); heads.setMatrixAt(i,d.matrix); discs.setMatrixAt(i,d.matrix); i++; } }
  scene.add(stems,heads,discs);
  // ночной план: два подсолнуха у самого объектива — смотрим на реку сквозь них
  const nightF = new THREE.Vector3(-18.4,0,-128).normalize(), nightR = new THREE.Vector3(-nightF.z,0,nightF.x);
  for(const [fw,sd,sc] of [[1.7,-1.0,.86],[2.4,1.15,.9]]){ const g=new THREE.Group(); g.add(new THREE.Mesh(stemG,stems.material), new THREE.Mesh(headG,heads.material), new THREE.Mesh(discG,discs.material));
    g.position.copy(NIGHT_CAM).addScaledVector(nightF,fw).addScaledVector(nightR,sd).setY(0); g.scale.setScalar(sc); g.rotation.y=Math.atan2(-nightF.x,-nightF.z)+rand(-.4,.4); scene.add(g); }

  // ---------- их «глаз»: привязной аэростат над тем берегом ----------
  const balloon=new THREE.Group();
  const bBody=new THREE.Mesh(new THREE.SphereGeometry(5,14,10),M(0xa8a89a,{emissive:0x1c1c20})); bBody.scale.set(2.6,1,1);
  const finM=M(0x8a8a7c); for(const [ry,rz] of [[0,0],[0,Math.PI/2],[0,-Math.PI/2]]){ const f=new THREE.Mesh(new THREE.BoxGeometry(4,.2,3.4),finM); f.position.set(-12,0,0); f.rotation.set(rz?Math.PI/2:0,ry,0); if(rz) f.position.y=rz>0?2:-2; balloon.add(f); }
  const gond=new THREE.Mesh(new THREE.BoxGeometry(1.4,1,1),M(0x3a3a34)); gond.position.y=-6.5;
  balloon.add(bBody,gond); balloon.position.set(-25,62,-210); balloon.rotation.y=.4; scene.add(balloon);
  const cable=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-25,55,-210),new THREE.Vector3(-25,0,-210)]),new THREE.LineBasicMaterial({color:0x2a2a2a})); scene.add(cable);
  // звёзды и луна (их видно только в ночном общем плане)
  const starG=new THREE.BufferGeometry(), sp=[]; for(let i=0;i<500;i++){ const a=rand(-1.4,1.4), e=rand(.05,1.1), r=420; sp.push(Math.sin(a)*Math.cos(e)*r, Math.sin(e)*r, -Math.cos(a)*Math.cos(e)*r); }
  starG.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  const stars=new THREE.Points(starG,new THREE.PointsMaterial({color:0xe8e4d8,size:1.2,sizeAttenuation:false,fog:false,transparent:true,opacity:.8})); scene.add(stars);
  const moon=new THREE.Mesh(new THREE.CircleGeometry(9,24),new THREE.MeshBasicMaterial({color:0xf0ead8,fog:false})); moon.position.set(90,120,-380); moon.lookAt(0,0,0); scene.add(moon);

  const tmp=new THREE.Vector3(), tmp2=new THREE.Vector3(); const GLOW=new THREE.Color(1,.82,.6);

  // ---------- эффекты (как в главе 2): взрывы, воронки, трассеры ----------
  const softTex = (rgba)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'); const gr=x.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,rgba); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); };
  const dustTex=softTex('rgba(70,60,44,.85)'), fireTex=softTex('rgba(255,200,120,1)'), smokeTex=softTex('rgba(40,36,32,.75)'), greyTex=softTex('rgba(150,146,138,.6)');
  const fx=[];
  function puff(p, tex, size, life, vy=1.5, grow=2.5, add=false, vx=0){
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));
    s.position.copy(p); s.scale.setScalar(size); scene.add(s); fx.push({s,life,max:life,vy,vx,grow,base:size});
  }
  const craterM=new THREE.MeshBasicMaterial({color:0x221a10,transparent:true,opacity:.88}), bloodM=new THREE.MeshBasicMaterial({color:0x4a0e0a,transparent:true,opacity:.8});
  function decal(x,z,r,mat){ const d=new THREE.Mesh(new THREE.CircleGeometry(r,14),mat); d.rotation.x=-Math.PI/2; d.position.set(x,.035+Math.random()*.01,z); scene.add(d); return d; }
  let shake=0;
  function explode(x,z,big=1,silent=false){
    puff(tmp.set(x,.6,z), fireTex, 1.6*big, .22, 1, 1, true);
    for(let i=0;i<6;i++) puff(tmp.set(x+rand(-1,1),.8+rand(0,1.5),z+rand(-1,1)), dustTex, rand(2,3.5)*big, rand(1.2,2.2), rand(2,4), 2.2);
    puff(tmp.set(x,1.5,z), smokeTex, 4*big, 3.5, 1.2, 3);
    if(z>RIVER_Z+12 || z<RIVER_Z-12) decal(x,z,rand(1.2,1.8)*big,craterM);
    else puff(tmp.set(x,.4,z), softTex('rgba(220,230,235,.8)'), 3*big, 1.4, 5, 1.2);   // столб воды
    const d = Math.hypot(S.gun.x-x, S.gun.z-z);
    shake=Math.max(shake, clamp(1.4-d/18,0,1.2)*big);
    if(!silent){ sfx.boom(); if(d<9) noiseBurst({dur:.5,freq:1800,q:.5,gain:.12,type:'highpass'}); }
    return d;
  }
  const tracerM=new THREE.LineBasicMaterial({color:0xffe2a0,transparent:true,opacity:.9}), enemyTracerM=new THREE.LineBasicMaterial({color:0xfff6d8,transparent:true,opacity:.7});
  const tracers=[];
  function tracer(a,b,mat=tracerM){ const g=new THREE.BufferGeometry().setFromPoints([a.clone(),b.clone()]); const l=new THREE.Line(g,mat.clone()); scene.add(l); tracers.push({l,life:.07}); }

  // ---------- люди ----------
  const KHAKI=0x7a7148, FELD=0x5a5e4a;
  const asan=makePerson({coat:KHAKI, hat:'pilotka'}), grisha=makePerson({coat:0x7f764c, hat:'pilotka', scale:.95});
  const officer=makePerson({coat:0x6a6444, hat:'pilotka'});
  scene.add(asan, grisha, officer); officer.visible=false;
  const grishaCap=new THREE.Mesh(new THREE.BoxGeometry(.3,.09,.17),M(0x6a6640)); grishaCap.visible=false; scene.add(grishaCap);
  const comrades=[];
  for(const x of [-18,-12,-7,6,12,18]){ const p=makePerson({coat:KHAKI, hat:'pilotka'}); p.position.set(x,-.45,0); p.rotation.y=Math.PI; scene.add(p); comrades.push({p,alive:true,t:rand(0,3)}); }

  // ---------- состояние и игровые часы: всё в сцене идёт во времени игры ----------
  const S = { phase:'intro', busy:true, zoom:1, hp:100, ammo:47, disks:4, reload:0, firing:false, fireCd:0, aim:new THREE.Vector3(0,0,-30),
    gun:new THREE.Vector3(0,.68,-1.9), clock:0, shot:null, shotT:0, sunOff:[-30,40,-20], battleT:0, artT:2, boatT:3, stepT:0 };
  const until=(f,max=180000)=>new Promise(r=>{ const t0=performance.now(); const h=setInterval(()=>{ if(f()||performance.now()-t0>max){ clearInterval(h); r(); } },50); });
  const gwait=sec=>{ const t0=S.clock; return until(()=>S.clock-t0>=sec); };
  const run = makeRunner({
    // аэростат крупно, длинным объективом, потом снова общий план
    async lookBalloon(){ cut(shotBalloon); await gwait(3.6); cut(shotNight); await gwait(1.2); },
    // тот берег вспыхивает: сначала свет, звук догоняет
    async barrageFlashes(){ S.barrage=true; await gwait(4.5); S.barrage=false; await gwait(1.2); },
    async lookCrater(){ await lookTo(new THREE.Vector3(0,.05,-1.3), 2.8); },
    async lookCommTrench(){ await lookTo(new THREE.Vector3(-3,.3,6), 2.4); },
    async lookCap(){ await lookTo(grishaCap.position.clone(), 2.4); },
    // общий план назад, на село: хаты горят, по улице идут немцы
    async showEncircled(){ villageGermans(); villageFG.visible=true; for(let i=0;i<10;i++){ const f=pick(S.fires); puff(tmp.copy(f).setY(4+i*.6),smokeTex,rand(5,8),6,1.6,2,false,1.4); } cut(shotVillage); await gwait(4.5); villageFG.visible=false; },
    async hitThigh(){ await hitThigh(); },
    async hitChest(){ await hitChest(); }
  });
  const pick = a => a[(Math.random()*a.length)|0];
  // режиссёр: план — функция, которая ставит камеру; k — время плана
  function cut(fn){ S.shot=fn; S.shotT=0; S.fresh=true; }

  // ---------- ввод ----------
  const ray=new THREE.Raycaster(), mouse=new THREE.Vector2(), groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  function screenToGround(ev,out){ const r=canvas.getBoundingClientRect(); mouse.set(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1); ray.setFromCamera(mouse,camera); return ray.ray.intersectPlane(groundPlane,out); }
  const fighting = ()=> S.phase==='battle' || S.phase==='encircle';
  const onMove=ev=>{ if(fighting()){ screenToGround(ev,S.aim); const a=$('aim'); a.style.left=ev.clientX+'px'; a.style.top=ev.clientY+'px'; } };
  const onDown=ev=>{ if(dlgOpen || active!==sc) return;
    if(fighting()){ screenToGround(ev,S.aim); S.firing=true; onMove(ev); return; }
    if(S.phase==='dig') dig(); };
  const onUp=()=>{ S.firing=false; };
  listen(canvas,'pointermove',onMove); listen(canvas,'pointerdown',onDown); listen(window,'pointerup',onUp);
  listen(window,'keyup',e=>{ if(e.code==='Space' && fighting()) S.firing=false; });
  listen(canvas,'wheel',e=>{ S.zoom=clamp(S.zoom+Math.sign(e.deltaY)*.1,.6,1.6); },{passive:true});

  // ---------- стрельба (как в главе 2, но от любой точки: окоп или лёжа в подсолнухах) ----------
  const enemies=[], boats=[], tanks=[];
  function spawnEnemy(x,z,o={}){ const p=makePerson({coat:FELD, hat:'helmet'}); p.position.set(x,0,z); scene.add(p);
    const e={p, hp:Math.random()<.3?2:1, alive:true, prone:0, nextProne:rand(2,6), fireT:rand(1.5,4), speed:rand(1.8,2.6), boat:null, ...o}; enemies.push(e); return e; }
  function spawnBoat(){ const g=new THREE.Group(); const hull=new THREE.Mesh(new THREE.BoxGeometry(1.6,.5,4.2),M(0x3c4038)); hull.position.y=.2; g.add(hull);
    const x=rand(-26,26); g.position.set(x,0,RIVER_Z-12); scene.add(shadowAll(g)); const b={g, alive:true, men:[]};
    for(let i=0;i<3;i++){ const e=spawnEnemy(x,RIVER_Z-12,{boat:b}); e.off=(i-1)*1.1; b.men.push(e); }
    boats.push(b); }
  function spawnTank(x, iron=false){ const g=new THREE.Group(); const hull=new THREE.Mesh(new THREE.BoxGeometry(3.6,1.3,6.2),M(0x5a5c52)); hull.position.y=.95;
    const tur=new THREE.Mesh(new THREE.BoxGeometry(2.4,.9,2.6),M(0x50524a)); tur.position.set(0,2,-.2);
    const gun=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,3.4,8),M(0x2a2a28)); gun.rotation.x=Math.PI/2; gun.position.set(0,2.05,2.6);
    const t1=new THREE.Mesh(new THREE.BoxGeometry(.7,1,6.4),M(0x2e2e2a)); t1.position.set(-1.8,.5,0); const t2=t1.clone(); t2.position.x=1.8;
    g.add(hull,tur,gun,t1,t2); g.position.set(x,0,RIVER_Z+14); scene.add(shadowAll(g));
    const tk={g, alive:true, fireT:1, smokeT:0, iron}; tanks.push(tk); return tk; }
  function shoot(){
    if(S.ammo<=0 || S.reload>0) return;
    S.ammo--; S.fireCd = S.wounded ? .16 : .1;
    const from=S.gun;
    const dir=tmp.copy(S.aim).setY(.9).sub(from); const dist=dir.length(); dir.normalize();
    const spread=S.wounded?.06:.035; dir.x+=rand(-spread,spread); dir.z+=rand(-spread,spread); dir.normalize();
    let best=null, bt=999;
    for(const e of enemies){ if(!e.alive) continue; const rel=tmp2.copy(e.p.position).setY(.9).sub(from); const along=rel.dot(dir); if(along<0) continue;
      const perp=rel.clone().addScaledVector(dir,-along); perp.y=0; const r=e.prone>0?.32:.55; if(perp.length()<r && along<bt){ bt=along; best=e; } }
    let end;
    for(const tk of tanks){ if(!tk.alive) continue; const rel=tmp2.copy(tk.g.position).setY(.9).sub(from); const along=rel.dot(dir); const perp=rel.clone().addScaledVector(dir,-along); perp.y=0;
      if(along>0 && perp.length()<2.2 && along<bt){ end=from.clone().addScaledVector(dir,along); tracer(from,end); puff(end,fireTex,.5,.08,0,0,true); if(Math.random()<.3) tone({f:2400,dur:.05,type:'square',gain:.04}); afterShot(); return; } }
    if(best){ end=from.clone().addScaledVector(dir,bt); best.hp--; if(best.hp<=0) killEnemy(best); }
    else { end=from.clone().addScaledVector(dir,Math.max(dist,8)+rand(0,6)); end.y=0; puff(tmp2.copy(end).setY(.3),dustTex,.7,.4,1,1.5); }
    tracer(from,end); afterShot();
  }
  function afterShot(){ muzzle.position.copy(S.gun).add(tmp.set(0,.1,-.2)); muzzle.intensity=2.5; noiseBurst({dur:.07,freq:1100,q:.6,gain:.16,type:'bandpass'}); tone({f:90,dur:.06,type:'square',gain:.06}); shake=Math.max(shake,.08); }
  function killEnemy(e){ e.alive=false; if(e.boat){ e.boat=null; e.p.position.y=-.3; e.p.rotation.x=-Math.PI/2; return; }
    const p=e.p; p.rotation.x=-Math.PI/2*rand(.85,1); p.rotation.z=rand(-.4,.4); p.position.y=.22; decal(p.position.x+rand(-.3,.3),p.position.z+rand(-.2,.4),rand(.4,.8),bloodM);
    if(Math.random()<.35) tone({f:300,dur:.25,type:'sawtooth',gain:.03,delay:.05,slide:-180}); }
  function hitFlash(){ const h=$('hit'); h.style.opacity=1; setTimeout(()=>h.style.opacity=0,220); shake=Math.max(shake,.5); }
  function playerHit(d){ if(S.phase==='encircle'){ S.hp=Math.max(30,S.hp-d*.5); hitFlash(); return; } S.hp-=d; hitFlash(); if(S.hp<=0 && S.phase==='battle') battleLost(); }
  function reload(){ if(S.reload>0 || S.ammo===47) return; if(S.disks<=0){ bark('Асан','Дисков нет…'); return; } S.reload=S.wounded?3.2:2.2; S.disks--; noiseBurst({dur:.15,freq:600,gain:.15}); S.reloadClick=S.clock+.9; }
  function hud(){ $('ammo').innerHTML = S.reload>0 ? 'смена диска…' : `<b>${S.ammo}</b> / 47<br>запасных дисков: ${S.disks}`; }
  function battleHud(on){ $('ammo').style.display=on?'block':'none'; $('aim').style.display=(on&&!isTouch)?'block':'none'; canvas.style.cursor=(on&&!isTouch)?'none':'';
    if(!on) S.firing=false; }

  // ---------- планы ----------
  // ночь: из подсолнухов у кромки поля — над рекой висит их аэростат; держим долго
  const shotNight = k => { camera.fov=34; camera.position.copy(NIGHT_CAM); camera.position.x-=k*.02; camera.lookAt(-12.8,19.3,-124.6); };
  const shotBalloon = k => { camera.fov=11; camera.position.copy(NIGHT_CAM); camera.lookAt(balloon.position.x, balloon.position.y-2, balloon.position.z); };
  // назад, на село: горят хаты, в улице немцы — мы уже отрезаны
  const VCAM = new THREE.Vector3(LIE.x-1,4.4,LIE.z+2), VLOOK = new THREE.Vector3(-12,1.6,30);
  const shotVillage = k => { camera.fov=36; camera.position.copy(VCAM); camera.position.x-=k*.05; camera.lookAt(VLOOK.x-k*.3,VLOOK.y,VLOOK.z); };
  // на спине: снизу вверх, сквозь подсолнухи — небо (так начнётся глава 5)
  const shotSky = k => { camera.fov=72; camera.position.set(LIE.x,.3,LIE.z+.4); camera.lookAt(LIE.x+.6+Math.sin(k*.3)*.25, 3.2, LIE.z-2.3); };
  // двое у пулемёта: низко сбоку, лица в профиль, между ними — река
  const shotTwo = k => { camera.fov=40; camera.position.set(.55,1.0,2.7); camera.lookAt(.3,1.15,-25); };
  // сверху: окоп, река, тот берег
  const shotTop = k => { camera.fov=46; camera.position.set(1,15,14); camera.lookAt(0,0,-12); };
  // перед рассветом — длинный объектив через реку: горизонт вспыхивает
  const shotAcross = k => { camera.fov=22; camera.position.set(-1.5,1.3,1.4); camera.lookAt(-6,3,-120); };
  // на дне окопа за спиной Асана: сыплется земля
  const shotDown = k => { camera.fov=55; camera.position.set(3.0,.6,1.6); camera.lookAt(-.6,1.0,-1.2); };
  // бой сверху: за расчётом, видно реку и переправу
  const shotBattle = () => { const z=S.zoom; tmp2.set(S.aim.x*.12, 15*z, 15*z); if(S.fresh) camera.position.copy(tmp2); else camera.position.lerp(tmp2,.06); camera.fov=55; camera.lookAt(S.aim.x*.2,0,-28); };
  // танк над головой: из окопа вверх
  const shotIron = k => { camera.fov=66; camera.position.set(S.crushX-1.35,.18,.75); camera.lookAt(S.crushX+.5,2.5,-.5); };
  // окружение сверху: за Асаном, лежащим в подсолнухах
  const shotEnc = () => { const z=S.zoom; tmp2.set(LIE.x+(S.aim.x-LIE.x)*.08, 16*z, LIE.z+9*z); if(S.fresh) camera.position.copy(tmp2); else camera.position.lerp(tmp2,.06); camera.fov=50; camera.lookAt(LIE.x+(S.aim.x-LIE.x)*.2, 0, LIE.z-9); };
  // ранен: у самой земли, сквозь стебли
  const shotLow = k => { camera.fov=40; camera.position.set(LIE.x+3.2,.45,LIE.z+2.4); camera.lookAt(LIE.x,.3,LIE.z-.6); };
  // отход: из-за плеча Асана — люди уходят в подсолнухи
  const shotRetreat = k => { camera.fov=34; camera.position.set(LIE.x-1.2,1.6,LIE.z-3.5); camera.lookAt(LIE.x+6,1,LIE.z+30); };

  // ---------- фаза 1: ночь перед боем ----------
  async function phaseNight(){
    S.phase='night'; setLight('night'); battleHud(false); setHeart(0);
    asan.position.set(0,-.45,0); asan.rotation.y=Math.PI; grisha.position.set(1.1,-.45,.15); grisha.rotation.y=Math.PI*.85;
    cut(shotNight); cine(true);
    await fadeTo(0,2400);
    // долгий общий план: тишина, сверчки, аэростат
    S.crickets=true; await gwait(6.5);
    await run(DAT.scripts.night_open); closeDlg();
    cut(shotTwo);
    await gwait(1.5);
    await run(DAT.scripts.night_talk); closeDlg();
    cut(shotTop); await gwait(2.5);
    S.crickets=false;
    // шторка: прошло несколько часов
    const w=wipe(1500); phaseDawnSet(); await w;
    phaseDawn();
  }
  // ---------- фаза 2: рассвет 5 июля, артподготовка и бой ----------
  function phaseDawnSet(){ setLight('dawn'); stars.visible=false; moon.visible=false; cut(shotAcross); }
  async function phaseDawn(){
    S.phase='barrage';
    await gwait(1.2);
    await run(DAT.scripts.dawn_open); closeDlg();
    cut(shotDown); bark('Сосед', pick(DAT.barks.barrage));
    for(let i=0;i<9;i++){ let x,z; do{ x=rand(-20,20); z=rand(-14,10); }while(Math.hypot(x,z)<3); explode(x,z,1.1); if(i%3===1) puff(tmp.set(1,1.2,0),dustTex,2.5,1.5,-.6,1.5); await gwait(rand(.35,.8)); }
    setRing(true); await gwait(1.5); setRing(false);
    cut(shotBattle); phaseBattle();
  }
  function phaseBattle(){
    S.phase='battle'; S.busy=false; S.battleT=0; S.hp=Math.max(S.hp,70); S.ironDone=false; S.tank1=false; S.tank2=false;
    setLight('dawn'); setObj(CH, isTouch?DAT.objectives.battleTouch:DAT.objectives.battle); battleHud(true); setHeart(115);
    bark('Гриша', pick(DAT.barks.boats));
  }
  async function battleLost(){
    S.phase='lost'; battleHud(false); setHeart(0);
    await fadeTo(1,1600);
    await showCard('','Асан погиб у Донца','Бей по лодкам, пока пехота не вылезла на берег, и меняй диск, пока они лежат.','Попробовать снова');
    enemies.forEach(e=>scene.remove(e.p)); enemies.length=0; boats.forEach(b=>scene.remove(b.g)); boats.length=0; tanks.forEach(t=>scene.remove(t.g)); tanks.length=0;
    S.hp=100; S.ammo=47; S.disks=4; S.reload=0; grisha.visible=true; grisha.position.set(1.1,-.45,.15);
    cut(shotBattle); await fadeTo(0,1000); phaseBattle();
  }
  // танк утюжит окоп: из окопа вверх, затем выбор с песочными часами, затем разрыв
  async function ironing(tk){
    S.phase='iron'; battleHud(false); S.ironX=tk.g.position.x; S.crushX=6; tk.ironing=true; S.ironTank=tk;
    // танк в двадцати шагах: видно за спинами — решать сейчас
    S.tankHold=true; cut(shotTwo); cine(true);
    await run(DAT.scripts.iron_choice); closeDlg();
    // и он идёт через окоп — прямо над нами; сосед под левой гусеницей
    tk.g.position.z=-6.5; S.tankHold=false; S.ironRolling=true;
    cut(shotIron); noiseBurst({dur:4,freq:55,q:.5,gain:.6,type:'lowpass'}); setTimeout(()=>noiseBurst({dur:2.5,freq:90,q:.4,gain:.4,type:'lowpass'}),1500);
    await until(()=>tk.g.position.z>4.2); S.ironRolling=false;
    const order=memory.flags.grishaOrder;
    if(order==='disks'){ S.grishaRun=true; }
    if(order==='stay'){ grisha.position.set(.7,-.45,.25); }
    cine(false); cut(shotTop); await gwait(order==='disks'?2.6:1.6);
    // прямое попадание в пулемётное гнездо: белая вспышка — темнота
    explode(0,-1.1,2.2); $('fade').style.transitionDuration='0ms'; $('fade').style.background='#fff'; $('fade').style.opacity=1;
    await gwait(.18); $('fade').style.background='#000';
    setRing(true); setHeart(0); cine(false);
    // воронка вместо гнезда, ДП завязан дугой, Гриши нет
    decal(0,-1.2,2.4,craterM); const rim=new THREE.Mesh(new THREE.TorusGeometry(2.4,.35,6,18),M(0x3a2c1c)); rim.rotation.x=Math.PI/2; rim.position.set(0,.05,-1.2); scene.add(rim);
    dp.position.set(-1.8,.15,-.4); dp.rotation.set(.4,1.2,.9); dpB.scale.set(1,1,.7);
    grisha.visible=false; S.grishaRun=false;
    if(order!=='disks'){ grishaCap.visible=true; grishaCap.position.set(1.9,.06,-.3); grishaCap.rotation.y=.7; }
    enemies.forEach(e=>scene.remove(e.p)); enemies.length=0; boats.forEach(b=>scene.remove(b.g)); boats.length=0;
    tanks.forEach(t=>{ t.alive=false; t.g.position.z=Math.max(t.g.position.z,6); t.g.children.forEach(m=>m.material=M(0x1e1c1a)); });
    await gwait(2.2); phaseDig();
  }
  // ---------- фаза 3: воронка — темнота, откапываться рывками, от первого лица ----------
  let dirt=null;
  function phaseDig(){
    S.phase='dig'; S.dig=0; asan.visible=false; grisha.visible=false; setLight('day'); scene.background.setHex(0x8a7a64); scene.fog.color.setHex(0x8a7a64);
    camera.position.set(.6,.32,1.0); camera.fov=62; camera.updateProjectionMatrix(); S.shot=null; camera.lookAt(.2,.9,-2);
    dirt=document.createElement('div');
    dirt.style.cssText='position:fixed;inset:0;z-index:8;pointer-events:none;background:radial-gradient(ellipse at 50% 30%,#3a2c1e 0,#22180f 55%,#120c07 100%);opacity:1;transition:opacity .25s';
    document.body.appendChild(dirt);
    $('fade').style.transitionDuration='1600ms'; $('fade').style.opacity=0;
    setObj(CH, isTouch?DAT.objectives.digTouch:DAT.objectives.dig);
    setHeart(62); S.busy=false;
  }
  function lookTo(v, sec){ S.lookFrom=(S.curLook||S.lookFrom).clone(); S.lookTo=v.clone(); S.lookT=0; return gwait(sec); }
  function dig(){ if(S.phase!=='dig' || S.dig>=1) return;
    S.dig=Math.min(1,S.dig+.13); shake=Math.max(shake,.25); noiseBurst({dur:.18,freq:240,q:.6,gain:.4,type:'lowpass'}); if(Math.random()<.5) noiseBurst({dur:.3,freq:500,q:.3,gain:.08,delay:.12});
    if(S.dig>=1) dugOut(); }
  async function dugOut(){
    S.phase='dug'; S.busy=true; dirt.style.transition='opacity 1.6s'; dirt.style.opacity=0; setTimeout(()=>{ dirt&&dirt.remove(); dirt=null; },1800);
    setObj(CH,''); setRing(false);
    // медленный взгляд от бруствера к тому месту, где был пулемёт
    S.lookT=1; S.lookFrom=new THREE.Vector3(.2,.9,-2); S.lookTo=S.lookFrom.clone(); S.curLook=null;
    await gwait(2.2);
    await run(DAT.scripts.crater_find); closeDlg();
    officer.visible=true; officer.position.set(-3,-.45,3.5); officer.rotation.y=Math.PI*.8;
    await lookTo(new THREE.Vector3(-3,1.3,3.5), 1.4);
    await run(memory.flags.raft==='wounded'?DAT.scripts.officer_wounded:DAT.scripts.officer_other); closeDlg();
    // шторка: прошли сутки
    const w=wipe(1500); setupEncircle(); await w;
    phaseEncircle();
  }
  // ---------- фаза 4: окружение — прикрыть отход через подсолнухи, ранение ----------
  const runners=[];
  function setupEncircle(){
    S.phase='encOpen'; setLight('day'); scene.background.setHex(0x8e8068); scene.fog.color.setHex(0x8e8068); scene.fog.near=18; scene.fog.far=140;
    asan.visible=true; asan.position.set(LIE.x,.2,LIE.z); asan.rotation.set(-Math.PI/2,Math.PI,0); tanks.forEach(t=>t.g.visible=false);
    dp.position.set(LIE.x,.25,LIE.z-1.15); dp.rotation.set(0,0,0); dpB.scale.set(1,1,1);
    S.gun.set(LIE.x,.35,LIE.z-1.4); S.aim.set(LIE.x,0,LIE.z-20);
    officer.position.set(LIE.x-1.6,0,LIE.z+1.5); officer.rotation.y=Math.PI;
    comrades.forEach(cm=>cm.p.visible=false); grishaCap.visible=false;
    // горит село за спиной
    huts[2].children.forEach(m=>m.material=M(0x2a2420)); huts[4].children.forEach(m=>m.material=M(0x2a2420));
    for(let i=0;i<8;i++){ const r=makePerson({coat:KHAKI, hat:'pilotka'}); r.position.set(LIE.x-3+rand(-2,2),0,LIE.z+rand(-1,2)); scene.add(r); runners.push({p:r, go:false, out:false, to:new THREE.Vector3(rand(14,26),0,rand(66,76))}); }
    cut(shotEnc);
  }
  async function phaseEncircle(){
    await gwait(1);
    await run(DAT.scripts.encircle_open); closeDlg();
    cut(shotRetreat);
    await run(memory.flags.raft==='wounded'?DAT.scripts.encircle_order_wounded:DAT.scripts.encircle_order_other); closeDlg();
    await run(DAT.scripts.encircle_go);
    cut(shotEnc);
    S.phase='encircle'; S.busy=false; S.encT=0; S.ammo=47; S.disks=3; S.hp=100; S.wounded=false; S.encSpawn=1;
    battleHud(true); setHeart(120); officer.visible=false; runners.push({p:officer, go:false, out:false, to:new THREE.Vector3(20,0,72)});
    S.sent=0; S.sendT=1.5;
    bark(memory.flags.raft==='wounded'?'Волков':'Старшина', pick(DAT.barks.encircle));
    await until(()=>runners.every(r=>r.out) || S.encT>48);
    // пуля в бедро: всё дальше — лёжа, медленнее
    battleHud(false); cine(true);
    await run(DAT.scripts.thigh); closeDlg();
    cine(false); cut(shotEnc); battleHud(true);
    for(let i=0;i<4;i++){ const e=spawnEnemy(LIE.x+rand(-12,12),LIE.z-rand(14,20)); e.speed=1.4; }
    await gwait(9);
    // вторая — в грудь. Небо, потом темнота.
    battleHud(false); S.phase='down';
    await run(DAT.scripts.chest); closeDlg();
    $('fade').style.transitionDuration='2200ms'; $('fade').style.opacity=1;
    await gwait(2.6); setRing(false); setHeart(0); cine(false); setObj('','');
    cleanup();
    endChapter4();
  }
  const villageFG = new THREE.Group(); villageFG.visible=false; scene.add(villageFG);
  { const f=VLOOK.clone().sub(VCAM).setY(0).normalize(), r=new THREE.Vector3(-f.z,0,f.x);
    for(const [fw,sd,sc] of [[2.6,-1.3,1.95],[2.3,1.25,2.0],[3.6,1.75,1.8]]){ const g=new THREE.Group(); g.add(new THREE.Mesh(stemG,stems.material), new THREE.Mesh(headG,heads.material), new THREE.Mesh(discG,discs.material));
      g.position.copy(VCAM).addScaledVector(f,fw).addScaledVector(r,sd).setY(0); g.scale.setScalar(sc); g.rotation.y=Math.atan2(-f.x,-f.z)+rand(-.5,.5); villageFG.add(g); } }
  function villageGermans(){ if(S.vg) return; S.vg=true; for(const [x,z] of [[-14,24],[-10,28],[-20,31],[-6,30],[-16,36]]){ const g=makePerson({coat:FELD,hat:'helmet'}); g.position.set(x,0,z); g.rotation.y=rand(-1,1); scene.add(g); }
    for(const h of [huts[2],huts[4]]) for(let i=0;i<3;i++) S.fires=(S.fires||[]).concat([h.position.clone().add(tmp.set(rand(-1.5,1.5),3,rand(-1,1)))]); }
  async function hitThigh(){
    S.wounded=true; cut(shotLow); setHeart(140);
    await gwait(.6);
    // удар: тело дёргается, нога подламывается, на штанине кровь
    hitFlash(); shake=1; tone({f:180,dur:.4,type:'sawtooth',gain:.08,slide:-120}); noiseBurst({dur:.08,freq:400,gain:.4});
    asan.userData.legR.rotation.x=.75; asan.position.y=.26; asan.rotation.z=.12;
    const b=decal(LIE.x+.25,LIE.z+.55,.35,bloodM); S.thighBlood=b;
    await gwait(1.6); asan.rotation.z=.05; asan.position.y=.2;
    await gwait(.8);
  }
  async function hitChest(){
    cut(shotLow); await gwait(.5);
    hitFlash(); shake=1.3; tone({f:120,dur:.6,type:'sawtooth',gain:.08,slide:-80}); noiseBurst({dur:.1,freq:350,gain:.45});
    // его переворачивает на спину; ДП падает рядом
    asan.rotation.set(Math.PI/2,Math.PI,0); asan.position.y=.22; decal(LIE.x,LIE.z-.2,.6,bloodM); dp.rotation.set(0,1.2,.4); dp.position.set(LIE.x+.9,.12,LIE.z-.6);
    setHeart(54); await gwait(1.4);
    // и мы — его глазами: подсолнухи качаются над головой, небо
    asan.visible=false; cut(shotSky); setRing(true);
    await gwait(3);
  }
  function cleanup(){ battleHud(false); if(dirt){ dirt.remove(); dirt=null; } $('vig').style.background='';
}

  // ---------- обновление боя у реки ----------
  function battleUpdate(dt,t){
    S.battleT+=dt; S.fireCd-=dt;
    if(S.reload>0){ S.reload-=dt; if(S.reloadClick && S.clock>S.reloadClick){ S.reloadClick=0; noiseBurst({dur:.12,freq:900,gain:.18}); } if(S.reload<=0) S.ammo=47; }
    if(S.firing && S.fireCd<=0 && S.ammo>0 && S.reload<=0) shoot();
    if(S.ammo===0 && S.reload<=0 && S.disks>0 && !S.autoHint){ S.autoHint=true; bark('Гриша','Диск! Давай диск!'); }
    if(S.ammo>0) S.autoHint=false;
    if(S.phase==='battle' && S.disks===0 && S.ammo<10 && !S.gotDisks){ S.gotDisks=true; S.disks+=2; bark('Гриша','Держи, последние два!'); }
    hud();
    // лодки идут через реку и высаживают пехоту
    if(S.phase==='battle' && S.battleT<40){ S.boatT-=dt; if(S.boatT<=0){ S.boatT=rand(3.5,6); spawnBoat(); if(Math.random()<.4) bark('Гриша',pick(DAT.barks.boats)); } }
    for(const b of boats){ if(!b.alive) continue; b.g.position.z+=2.4*dt; b.g.rotation.z=Math.sin(t*2+b.g.position.x)*.05;
      b.men.forEach(e=>{ if(e.boat){ e.p.position.set(b.g.position.x+e.off*.3, .25, b.g.position.z+e.off); } });
      if(b.g.position.z>RIVER_Z+11){ b.alive=false; b.men.forEach(e=>{ if(e.alive && e.boat){ e.boat=null; e.p.position.y=0; } }); if(Math.random()<.5) bark('Немец',pick(DAT.barks.de),'de'); } }
    // танки с переправы
    if(!S.tank1 && S.battleT>16){ S.tank1=true; spawnTank(rand(-14,-4)); bark('Сосед',pick(DAT.barks.tank1)); }
    if(!S.tank2 && S.battleT>32){ S.tank2=true; spawnTank(7.8,true); bark('Гриша',pick(DAT.barks.tank2)); }   // левая гусеница пройдёт ровно по соседу в окопе (x=6)
    for(const tk of tanks){ if(!tk.alive){ tk.smokeT-=dt; if(tk.smokeT<=0){ tk.smokeT=.25; puff(tmp.copy(tk.g.position).setY(2.2),smokeTex,2.5,3,2,2.5); } continue; }
      if(!(tk.ironing && S.tankHold)) tk.g.position.z+=(tk.ironing?2.1:1.6)*dt; tk.fireT-=dt;
      if(tk.fireT<=0){ tk.fireT=rand(.15,.3); tracer(tmp.copy(tk.g.position).setY(2),tmp2.set(rand(-8,8),.6,rand(-2,1)),enemyTracerM); if(Math.random()<.035) playerHit(5); }
      if(!tk.iron && tk.g.position.z>-20){ tk.alive=false; explode(tk.g.position.x,tk.g.position.z,1.6); tk.g.children.forEach(m=>m.material=M(0x1e1c1a)); bark('Сосед',pick(DAT.barks.tank1dead)); }
      if(tk.iron && tk.g.position.z>-15 && !S.ironDone && S.phase==='battle'){ S.ironDone=true; ironing(tk); } }
    // пехота: перебежками к окопу
    for(const e of enemies){ if(!e.alive || e.boat) continue; const p=e.p;
      if(e.prone>0){ e.prone-=dt; if(e.prone<=0){ p.rotation.x=0; p.position.y=0; } continue; }
      e.nextProne-=dt; if(e.nextProne<=0){ e.prone=rand(1,2.2); e.nextProne=rand(3,6); p.rotation.x=-Math.PI/2*.9; p.position.y=.2; continue; }
      p.position.z+=e.speed*dt; animWalk(p,1,dt);
      e.fireT-=dt; if(e.fireT<=0){ e.fireT=rand(2,4.5); tracer(tmp.copy(p.position).setY(1.2),tmp2.set(rand(-4,4),.8,rand(-1.5,.5)),enemyTracerM); noiseBurst({dur:.06,freq:1600,gain:.05}); if(Math.random()<.12) playerHit(6); }
      if(p.position.z>-4){ e.alive=false; scene.remove(p); explode(rand(-2,2),-1.5,.7); playerHit(20); } }
    // артиллерия по окопам — чаще, чем на Дону
    S.artT-=dt; if(S.artT<=0){ S.artT=rand(1.3,3); let x,z; do{ x=rand(-26,26); z=rand(-20,10); }while(Math.hypot(x,z)<3.5);
      const d=explode(x,z,1); if(d<5.5){ playerHit(10); }
      comrades.forEach(cm=>{ if(cm.alive && Math.hypot(cm.p.position.x-x,cm.p.position.z-z)<2.2){ cm.alive=false; cm.p.rotation.x=Math.PI/2; cm.p.position.y=-.2; decal(cm.p.position.x,cm.p.position.z,.7,bloodM); } }); }
    comrades.forEach(cm=>{ if(!cm.alive) return; cm.t-=dt; if(cm.t<=0){ cm.t=rand(1.2,3); const tg=enemies.find(e=>e.alive&&!e.boat&&Math.random()<.5); const to=tg?tmp2.copy(tg.p.position).setY(1):tmp2.set(rand(-20,20),.5,rand(-40,-20)); tracer(tmp.copy(cm.p.position).setY(.9),to); noiseBurst({dur:.08,freq:900,gain:.05}); if(tg&&Math.random()<.12) killEnemy(tg); } });
    $('vig').style.background=`radial-gradient(ellipse at center,transparent ${30+S.hp*.2}%,rgba(${(100-S.hp)*.9|0},0,0,.85) 100%)`;
  }
  // ---------- обновление окружения ----------
  function encircleUpdate(dt,t){
    S.encT+=dt; S.fireCd-=dt;
    if(S.reload>0){ S.reload-=dt; if(S.reload<=0) S.ammo=47; }
    if(S.firing && S.fireCd<=0 && S.ammo>0 && S.reload<=0) shoot();
    if(S.ammo===0 && S.reload<=0 && S.disks>0){ reload(); }
    hud();
    // по одному уходят в подсолнухи
    S.sendT-=dt; if(S.sendT<=0 && S.sent<runners.length){ runners[S.sent].go=true; S.sent++; S.sendT=rand(2.6,4.2); if(Math.random()<.4) bark('Сосед',pick(DAT.barks.encircle)); }
    let out=0; runners.forEach(r=>{ if(r.out){ out++; return; } if(!r.go) return; r.p.visible=true; const dx=r.to.x-r.p.position.x, dz=r.to.z-r.p.position.z, d=Math.hypot(dx,dz);
      if(d<1){ r.out=true; r.p.visible=false; } else { r.p.position.x+=dx/d*3.6*dt; r.p.position.z+=dz/d*3.6*dt; r.p.rotation.y=Math.atan2(dx,dz); animWalk(r.p,1.3,dt); } });
    setObj(CH, fillObj(DAT.objectives.encircle,{n:out,m:runners.length}));
    // немцы: с севера, от наших бывших окопов, и с востока; ложатся и бьют по нему
    S.encSpawn-=dt; if(S.encSpawn<=0){ S.encSpawn=rand(1.4,2.6); const east=Math.random()<.3; spawnEnemy(east?LIE.x+rand(26,32):LIE.x+rand(-14,16), east?LIE.z+rand(-6,10):LIE.z-rand(18,26)); }
    for(const e of enemies){ if(!e.alive) continue; const p=e.p; const dx=LIE.x-p.position.x, dz=LIE.z-p.position.z, d=Math.hypot(dx,dz);
      if(e.prone>0){ e.prone-=dt; if(e.prone<=0 && d>9){ p.rotation.x=0; p.position.y=0; } }
      else { e.nextProne-=dt; if(e.nextProne<=0 || d<9){ e.prone=rand(1.4,2.6); e.nextProne=rand(2.5,5); p.rotation.x=-Math.PI/2*.9; p.position.y=.2; } else { p.position.x+=dx/d*e.speed*dt; p.position.z+=dz/d*e.speed*dt; p.rotation.y=Math.atan2(dx,dz); animWalk(p,1,dt); } }
      e.fireT-=dt; if(e.fireT<=0){ e.fireT=rand(1.6,3.4); tracer(tmp.copy(p.position).setY(p.position.y>.1?.3:1.1),tmp2.set(LIE.x+rand(-2,2),.4,LIE.z+rand(-2,2)),enemyTracerM); noiseBurst({dur:.06,freq:1600,gain:.05}); if(Math.random()<.1) playerHit(6); } }
    // пулемёт с фланга: длинные очереди по подсолнухам
    if(Math.random()<dt*1.2){ const from=tmp.set(LIE.x+30,1,LIE.z-10); for(let i=0;i<4;i++) tracer(from, tmp2.set(LIE.x+rand(-6,6),.5,LIE.z+rand(-4,8)), enemyTracerM); noiseBurst({dur:.5,freq:1300,gain:.06}); }
    // дым над полем
    if(Math.random()<dt*2) puff(tmp.set(LIE.x+rand(-25,25),rand(.5,2),LIE.z+rand(-20,10)),greyTex,rand(5,9),rand(4,7),.3,1.2,false,1.2);
    $('vig').style.background=`radial-gradient(ellipse at center,transparent ${30+S.hp*.2}%,rgba(${(100-S.hp)*.9|0},0,0,.85) 100%)`;
  }

  // ---------- кадр ----------
  const sc = {
    S,
    update(dt,t){
      S.clock+=dt*(window.__dbgSpeed||1);   // ускорение только для автопроверки
      for(let i=fx.length-1;i>=0;i--){ const f=fx[i]; f.life-=dt; const k=1-f.life/f.max; f.s.position.y+=f.vy*dt; f.s.position.x+=f.vx*dt; f.s.scale.setScalar(f.base*(1+k*f.grow)); f.s.material.opacity=Math.max(0,1-k); if(f.life<=0){ scene.remove(f.s); f.s.material.dispose(); fx.splice(i,1);} }
      for(let i=tracers.length-1;i>=0;i--){ const tr=tracers[i]; tr.life-=dt; tr.l.material.opacity=tr.life/.07; if(tr.life<=0){ scene.remove(tr.l); tr.l.geometry.dispose(); tracers.splice(i,1);} }
      muzzle.intensity=Math.max(0,muzzle.intensity-dt*30);
      balloon.position.y=62+Math.sin(t*.3)*.6; balloon.rotation.y=.4+Math.sin(t*.13)*.08;
      if(S.fires && Math.random()<dt*6){ const f=pick(S.fires); puff(tmp.copy(f).add(tmp2.set(rand(-.6,.6),0,rand(-.6,.6))),fireTex,rand(1.8,3),.6,2.4,1,true); puff(tmp.copy(f).setY(4),smokeTex,rand(4,6.5),5,1.8,2.2,false,1.2); }
      if(S.barrage){ const bk=scene.background; S.glow=Math.max(0,(S.glow||0)-dt*3);
        if(Math.random()<dt*22){ const x=rand(-32,22), z=RIVER_Z-rand(35,95); puff(tmp.set(x,rand(4,8),z),fireTex,rand(14,24),.4,0,.4,true); puff(tmp.set(x,rand(2,4),z),fireTex,rand(6,10),.25,0,.2,true); S.glow=Math.min(1,S.glow+.45); shake=Math.max(shake,.14);
          if(Math.random()<.6) puff(tmp.set(x,9,z),smokeTex,rand(12,20),8,3,1.6); if(Math.random()<.35) noiseBurst({dur:1.2,freq:70,q:.4,gain:.35,type:'lowpass',delay:.4}); }
        bk.setHex(0x8a7462).lerp(GLOW, S.glow*.6); scene.fog.color.copy(bk); hemi.intensity=.5+S.glow*.4; }
      if(S.crickets && Math.random()<dt*3) tone({f:rand(4200,4800),dur:.05,type:'sine',gain:.012});
      if(S.phase==='battle' || S.phase==='iron') battleUpdate(dt,t);
      if(S.phase==='encircle') encircleUpdate(dt,t);
      // танк, утюжащий окоп, проходит прямо над камерой
      if(S.ironRolling){ const tz=S.ironTank.g.position.z; shake=Math.max(shake,.35);
        if(Math.abs(tz)<3.4 && Math.random()<dt*28) puff(tmp.set(S.crushX-1.35+rand(-1,1.2),rand(1,2.2),.75+rand(-1.2,.3)),dustTex,rand(.25,.5),rand(.6,1),-2.2,.4);
        if(tz>-.4) comrades.forEach(cm=>{ if(cm.alive && Math.abs(cm.p.position.x-S.crushX)<1.2){ cm.alive=false; cm.p.rotation.x=Math.PI/2; cm.p.position.y=-.38; cm.p.scale.y=.6; decal(cm.p.position.x,cm.p.position.z,.8,bloodM); } }); }
      if(S.grishaRun){ grisha.position.x-=1.2*dt; grisha.position.z+=2.4*dt; grisha.rotation.y=-.5; animWalk(grisha,1.2,dt); }
      // камера
      if(S.phase==='dig'){ camera.position.set(.6,.32+S.dig*.45,1.0); S.dig=Math.max(0,S.dig-dt*.035); }
      else if(S.phase==='dug'){ S.lookT=Math.min(1,S.lookT+dt*.5); S.rise=Math.min(1,(S.rise||0)+dt*.3); camera.position.set(.6,lerp(.77,1.0,S.rise),1.0); const e=S.lookT*S.lookT*(3-2*S.lookT);
        S.curLook=(S.curLook||S.lookFrom.clone()).lerp(tmp.copy(S.lookFrom).lerp(S.lookTo,e), 1-Math.pow(.05,dt)); camera.lookAt(S.curLook); }
      else if(S.shot){ S.shot(S.shotT, dt); S.shotT+=dt; S.fresh=false; camera.updateProjectionMatrix(); }
      if(shake>0){ camera.position.x+=rand(-1,1)*shake*.3; camera.position.y+=rand(-1,1)*shake*.2; shake=Math.max(0,shake-dt*2.5); }
      const so=S.sunOff; sun.position.set(camera.position.x+so[0],so[1],camera.position.z+so[2]); sun.target.position.set(camera.position.x,0,camera.position.z-10);
    },
    onKey(code,down){ if(!down) return;
      if(code==='KeyR' && fighting()) reload();
      if(code==='Space'){ if(fighting()) S.firing=true; else if(S.phase==='dig') dig(); }
    },
    act(){ if(fighting()) reload(); else if(S.phase==='dig') dig(); },
    holdStart(){}, holdEnd(){},
    // по этой главе не ходят: джойстик не нужен; кнопка действия — по обстановке
    wantsJoy(){ return false; },
    touchAction(){ if(fighting()) return 'Диск'; if(S.phase==='dig') return 'Рыть'; return null; },
    async begin(){
      setObj(CH,'');
      await showCard(DAT.card.small, DAT.card.big, DAT.card.text, 'Начать');
      phaseNight();
    },
    // для автопроверки: перемотать бой и отход
    debugSkipBattle(){ S.battleT=Math.max(S.battleT,31.5); enemies.forEach(e=>e.alive&&killEnemy(e)); tanks.forEach(tk=>{ if(tk.iron) tk.g.position.z=Math.max(tk.g.position.z,-8); }); },
    async debugEncircle(){ S.phase='encOpen'; stars.visible=false; moon.visible=false; setupEncircle(); $('fade').style.opacity=0; await phaseEncircle(); },
    debugSkipEncircle(){ runners.forEach(r=>{ r.go=true; r.out=true; r.p.visible=false; }); }
  };
  return sc;
}
