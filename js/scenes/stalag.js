'use strict';
// Глава 6. Шталаг. Октябрь 1943 — март 1944.
// Вагон на запад (рифма к главе 1: дверь заперта, рядом никто не скачет) → лагерь сверху (быт, кольца, перекличка)
// → барак (Семён, Василий, письмо, голос из дыма) → Ибрай-ага (панели) → вербовщик (кино) → зима → отбор пальцем.
// Палитра — выцветшая, серо-бурая; насилие — общим планом, без музыки (ориентиры: Куросава, «Пианист»).
function sceneStalag(){
  resetCamera();
  const DAT = DATA.ch6, CH = 'Глава 6 · Шталаг';
  scene = new THREE.Scene();
  const SKY = 0x8e8a80; scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 26, 110);
  const hemi = new THREE.HemisphereLight(0xc4c0b4, 0x3a342a, .62); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xe6e0d0, .55); sun.position.set(-10,24,12); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:90});
  scene.add(sun, sun.target);
  const coats=[0x5c5a3a,0x4e4c34,0x6a6244,0x55503a,0x5e5640,0x4a4836];
  const sitDown = p => { p.position.y=-.45; p.userData.legL.rotation.x=p.userData.legR.rotation.x=-1.45; return p; };

  // ---------- лагерь (в начале координат) ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(300,300), M(0x5a5446)); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  const plac = new THREE.Mesh(new THREE.PlaneGeometry(34,10), M(0x6a6252)); plac.rotation.x=-Math.PI/2; plac.position.set(0,.01,0); scene.add(plac);
  // лужи — светлые пятна неба в грязи
  for(let i=0;i<14;i++){ const pd=new THREE.Mesh(new THREE.CircleGeometry(rand(.4,1.3),10), M(0x9a968a)); pd.rotation.x=-Math.PI/2; pd.position.set(rand(-22,22),.015,rand(-14,16)); pd.scale.y=rand(.4,.8); scene.add(pd); }
  const barrM=M(0x4a4236), roofM=M(0x2e2a24);
  for(const z of [-10,10]) for(const x of [-14,0,14]){
    const b=new THREE.Mesh(new THREE.BoxGeometry(11,2.6,4.6), barrM); b.position.set(x,1.3,z);
    const r=new THREE.Mesh(new THREE.CylinderGeometry(.01,3.4,1.3,4,1), roofM); r.rotation.y=Math.PI/4; r.scale.set(1.62,1,.68); r.position.set(x,3.25,z);
    const dr=new THREE.Mesh(new THREE.BoxGeometry(1,1.8,.06), M(0x221e18)); dr.position.set(x+3.5,.9,z+(z<0?2.32:-2.32));
    scene.add(shadowAll(b), shadowAll(r), dr);
  }
  const wireM = new THREE.LineBasicMaterial({color:0x221e1a});
  function fence(x0,z0,x1,z1){ const n=Math.max(2,Math.round(Math.hypot(x1-x0,z1-z0)/3));
    for(let i=0;i<=n;i++){ const p=new THREE.Mesh(new THREE.BoxGeometry(.12,2.4,.12),M(0x3a3028)); p.position.set(lerp(x0,x1,i/n),1.2,lerp(z0,z1,i/n)); p.rotation.z=rand(-.04,.04); scene.add(shadowAll(p)); }
    for(const y of [.35,.8,1.25,1.7,2.15]){ const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x0,y,z0), new THREE.Vector3(x1,y+rand(-.06,.06),z1)]); scene.add(new THREE.Line(g,wireM)); } }
  fence(-25,-17,25,-17); fence(-25,18,25,18); fence(-25,-17,-25,18); fence(25,-17,25,18);
  fence(-26.5,-18.5,26.5,-18.5); fence(-26.5,19.5,26.5,19.5);
  function tower(x,z){ const t=new THREE.Group();
    for(const [a,b] of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.16,6,.16),M(0x3a2e24)); l.position.set(a,3,b); t.add(l); }
    const pl=new THREE.Mesh(new THREE.BoxGeometry(2.4,1,2.4),M(0x3a2e24)); pl.position.y=6.4; const rf=new THREE.Mesh(new THREE.ConeGeometry(2,1,4),M(0x2a221c)); rf.position.y=7.4; rf.rotation.y=Math.PI/4;
    t.add(pl,rf); t.position.set(x,0,z); scene.add(shadowAll(t)); }
  tower(-25,-17); tower(25,-17); tower(-25,18); tower(25,18);
  // ворота
  const gate1=new THREE.Mesh(new THREE.BoxGeometry(.3,3.4,.3),M(0x3a2e24)); gate1.position.set(-2,1.7,18); const gate2=gate1.clone(); gate2.position.x=2; scene.add(gate1,gate2); const gate3=gate1.clone(); gate3.position.set(-2,1.7,-17); const gate4=gate1.clone(); gate4.position.set(2,1.7,-17); scene.add(gate3,gate4);
  // точка обмена у проволоки
  const TRADE = new THREE.Vector3(8,0,16.6);
  const guardF = makePerson({coat:0x5a5e52, hat:'helmet'}); guardF.position.set(8,0,18.7); guardF.rotation.y=Math.PI; scene.add(guardF);
  const rifleF=new THREE.Mesh(new THREE.BoxGeometry(.06,1.2,.08),M(0x2a2018)); rifleF.position.set(-.3,1.3,-.1); guardF.add(rifleF);
  const breadF=new THREE.Mesh(new THREE.BoxGeometry(.16,.09,.11),M(0xa48a58)); breadF.visible=false; scene.add(breadF);
  // люди в лагере: бредут, стоят, сидят у стен
  const walkers=[]; for(let i=0;i<14;i++){ const p=makePerson({coat:coats[i%6], hat:i%3?'pilotka':'none'}); p.position.set(rand(-20,20),0,rand(-6,6)+(i%2?9:-9)*.6); p.userData.to=new THREE.Vector3(rand(-20,20),0,rand(-6,6)); p.userData.v=rand(.35,.6); scene.add(p); walkers.push(p); }
  const sitters=[]; for(let i=0;i<8;i++){ const z=i%2?7.4:-7.4; const p=sitDown(makePerson({coat:coats[(i+2)%6], hat:'none'})); p.position.x=-18+i*5; p.position.z=z; p.rotation.y= z>0?Math.PI:0; scene.add(p); sitters.push(p); }
  // Асан: хромает (короче на два пальца)
  const asan = makePerson({coat:0x5c5a3a, hat:'none'}); asan.position.set(-3,0,6.6); scene.add(asan);
  const rings=new THREE.Group(); for(let i=0;i<3;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(.035,.012,6,10),new THREE.MeshLambertMaterial({color:0xa0703a, emissive:0x000000})); r.position.set(i*.09-.09,0,0); r.rotation.x=Math.PI/2; rings.add(r); }
  rings.position.set(0,-.4,.12); asan.userData.armR.add(rings); rings.visible=false;
  const gab = makePerson({coat:0x3a3228, hat:'borik', beard:true}); gab.position.set(-4.1,0,6.9); scene.add(gab);
  // строй на перекличке
  const rows=[]; for(let r=0;r<4;r++) for(let c=0;c<14;c++){ const p=makePerson({coat:coats[(r*3+c)%6], hat:(r+c)%4?'pilotka':'none'}); p.position.set(-9.75+c*1.5,0,-2.6+r*1.5); p.rotation.y=Math.PI; p.visible=false; scene.add(p); rows.push(p); }
  const deadP = makePerson({coat:0x4a4836, hat:'none'}); deadP.visible=false; scene.add(deadP);
  const civ = makePerson({coat:0x2a2622, hat:'borik'}); civ.visible=false; scene.add(civ);
  const fingerC=new THREE.Mesh(new THREE.BoxGeometry(.035,.14,.035),M(0xb08a6a)); fingerC.position.set(0,-.44,0); civ.userData.armR.add(fingerC);
  const ibray = makePerson({coat:0x3c3a30, hat:'borik', beard:true}); ibray.visible=false; scene.add(ibray);
  const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.28,0),M(0x6e6a62)); stone.visible=false; scene.add(stone);

  // ---------- вагон (x=200) ----------
  const WX=200;
  const wagon=new THREE.Group(); scene.add(wagon);
  const wInM=new THREE.MeshLambertMaterial({color:0x2a2218, side:THREE.BackSide}), noM=new THREE.MeshBasicMaterial({visible:false});
  const wIn=new THREE.Mesh(new THREE.BoxGeometry(8,2.5,2.9), [wInM,wInM,wInM,wInM,noM,wInM]); // стенка с дверью — только доски с щелями wIn.position.set(WX,1.25,0); wagon.add(wIn);
  // стенка с дверью — доски с щелями, сквозь щели бьёт день
  const plankM=M(0x3a2c20);
  const slatWall=new THREE.Group(); for(let i=0;i<30;i++){ const pl=new THREE.Mesh(new THREE.BoxGeometry(.19,2.5,.06),plankM); pl.position.set(WX-3.6+i*.26,1.25,1.42); slatWall.add(pl); } wagon.add(slatWall);
  // мир за щелями: мокрые чёрные поля и столбы, плывут мимо
  const outside=new THREE.Group(); scene.add(outside);
  const land=new THREE.Mesh(new THREE.PlaneGeometry(120,60),M(0x3a3428)); land.rotation.x=-Math.PI/2; land.position.set(WX,-.45,32); scene.add(land);
  for(let i=0;i<26;i++){ const f=new THREE.Mesh(new THREE.BoxGeometry(rand(3,7),.05,rand(2,6)), M([0x2a2620,0x3a3428,0x4a4434][i%3])); f.position.set(WX-40+i*3.2,-.4,rand(4,18)); outside.add(f); }
  for(let i=0;i<10;i++){ const p=new THREE.Mesh(new THREE.BoxGeometry(.14,4,.14),M(0x2a221a)); p.position.set(WX-40+i*8,1.4,3.4); outside.add(p); }
  const wLight=new THREE.PointLight(0xd8d0c0,.0,9); wLight.position.set(WX,1.6,3.2); scene.add(wLight);
  const wagonPeople=[]; for(let i=0;i<9;i++){ const p=sitDown(makePerson({coat:coats[i%6], hat:i%2?'pilotka':'none'})); p.position.set(WX-3.4+i*.8, -.45, i%2?-1:.5); p.rotation.y=i%2?0:Math.PI; wagon.add(p); wagonPeople.push(p); }
  const asanW=makePerson({coat:0x5c5a3a, hat:'none'}); asanW.position.set(WX+.6,0,1.05); asanW.rotation.y=0; wagon.add(asanW);
  const gabW=sitDown(makePerson({coat:0x3a3228, hat:'borik', beard:true})); gabW.position.set(WX-.4,-.45,.6); gabW.rotation.y=Math.PI*.8; wagon.add(gabW);

  // ---------- барак изнутри (x=-200) ----------
  const BX=-200;
  const bar=new THREE.Group(); scene.add(bar);
  const bFloor=new THREE.Mesh(new THREE.PlaneGeometry(16,6), M(0x3a3024)); bFloor.rotation.x=-Math.PI/2; bFloor.position.set(BX,.01,0); bar.add(bFloor);
  for(const z of [-3,3]){ const w=new THREE.Mesh(new THREE.BoxGeometry(16,2.6,.2),M(0x4a4030)); w.position.set(BX,1.3,z); bar.add(w); }
  for(const x of [-8,8]){ const w=new THREE.Mesh(new THREE.BoxGeometry(.2,2.6,6),M(0x4a4030)); w.position.set(BX+x,1.3,0); bar.add(w); }
  const bunkM=M(0x5a4a36), strawM=M(0x7a6a44);
  for(const side of [-1,1]) for(let i=0;i<6;i++){ const x=BX-6.6+i*2.3; if(Math.abs(i-2.5)<.6) continue;
    for(let lv=0;lv<3;lv++){ const s=new THREE.Mesh(new THREE.BoxGeometry(2.1,.08,1.7),bunkM); s.position.set(x,.35+lv*.75,side*2.05); const st=new THREE.Mesh(new THREE.BoxGeometry(2,.06,1.6),strawM); st.position.set(x,.42+lv*.75,side*2.05); bar.add(s,st); }
    for(const dx of [-1.02,1.02]){ const post=new THREE.Mesh(new THREE.BoxGeometry(.1,2.2,.1),bunkM); post.position.set(x+dx,1.1,side*1.24); bar.add(post); } }
  const stove=new THREE.Mesh(new THREE.CylinderGeometry(.42,.48,1,10),M(0x24201c)); stove.position.set(BX,.5,0); bar.add(stove);
  const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,2.2,6),M(0x24201c)); pipe.position.set(BX,2,0); bar.add(pipe);
  const glow=new THREE.Mesh(new THREE.BoxGeometry(.3,.18,.05),new THREE.MeshBasicMaterial({color:0xff8a3a})); glow.position.set(BX,.42,.47); bar.add(glow);
  const fire=new THREE.PointLight(0xff9a50,1.2,7); fire.position.set(BX,.9,.8); bar.add(fire);
  const doorLight=new THREE.PointLight(0xb8c4d0,.6,6); doorLight.position.set(BX+7.4,1.4,0); bar.add(doorLight);
  const snowDrift=new THREE.Mesh(new THREE.SphereGeometry(.9,8,4,0,Math.PI*2,0,Math.PI/2),M(0xd8dcdc)); snowDrift.scale.y=.25; snowDrift.position.set(BX+7.4,0,0); bar.add(snowDrift);
  const semyon=sitDown(makePerson({coat:0x9a9068, hat:'pilotka'})); semyon.position.set(BX+.9,-.45,.5); semyon.rotation.y=-Math.PI/2; bar.add(semyon);
  const vasily=makePerson({coat:0x55503a, hat:'none'}); vasily.rotation.x=-Math.PI/2; bar.add(vasily);
  const asanB=makePerson({coat:0x5c5a3a, hat:'none'}); asanB.rotation.x=-Math.PI/2; bar.add(asanB);
  const gabB=makePerson({coat:0x3a3228, hat:'borik', beard:true}); gabB.rotation.x=-Math.PI/2; gabB.position.set(BX-2.6,.1,-.9); gabB.visible=false; bar.add(gabB); // появится зимой, мёртвым
  const polizai=makePerson({coat:0x2e2c28, hat:'pilotka'}); polizai.visible=false; bar.add(polizai);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.12,8),M(0xd8d0bc)); band.position.set(0,.15,0); polizai.userData.armL.add(band);
  const potato=new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),M(0x8a6a3a)); potato.visible=false; bar.add(potato);
  const letter=new THREE.Mesh(new THREE.ConeGeometry(.09,.02,3),M(0xd8ccae)); letter.visible=false; bar.add(letter);
  const sleepers=[]; for(let i=0;i<10;i++){ const p=makePerson({coat:coats[i%6], hat:'none'}); p.rotation.x=-Math.PI/2; const side=i%2?1:-1; p.position.set(BX-6.6+(i>>1)*2.3+(i>>1>=2?2.3:0), .48+((i*7)%3)*.75, side*2.05); p.rotation.z=side>0?-Math.PI/2:Math.PI/2; bar.add(p); sleepers.push(p); }
  function placeAsanB(){ const spot = memory.flags.barrackSpot==='stove' ? new THREE.Vector3(BX-.9,.1,1.0) : new THREE.Vector3(BX+6.4,.1,-1.1);
    asanB.position.copy(spot); asanB.rotation.set(-Math.PI/2,0,memory.flags.barrackSpot==='stove'?0:Math.PI/2);
    vasily.position.set(spot.x+(memory.flags.barrackSpot==='stove'?-.7:-.75), spot.y, spot.z); vasily.rotation.set(-Math.PI/2,0,asanB.rotation.z); }

  // ---------- канцелярия (x=300) ----------
  const OX=300;
  const office=new THREE.Group(); scene.add(office);
  const oRoom=new THREE.Mesh(new THREE.BoxGeometry(7,3,6),new THREE.MeshLambertMaterial({color:0x4a4234, side:THREE.BackSide})); oRoom.position.set(OX,1.5,0); office.add(oRoom);
  const table=new THREE.Mesh(new THREE.BoxGeometry(1.8,.08,1),M(0x3a2a1c)); table.position.set(OX,.8,0); office.add(table);
  for(const [a,b] of [[-.8,-.42],[.8,-.42],[-.8,.42],[.8,.42]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.07,.8,.07),M(0x3a2a1c)); l.position.set(OX+a,.4,b); office.add(l); }
  const lamp=new THREE.Mesh(new THREE.ConeGeometry(.22,.2,10,1,true),M(0x2a2a24,{side:THREE.DoubleSide})); lamp.position.set(OX,2.1,0); office.add(lamp);
  const cord=new THREE.Mesh(new THREE.BoxGeometry(.02,.9,.02),M(0x111111)); cord.position.set(OX,2.6,0); office.add(cord);
  const bulb=new THREE.PointLight(0xffd8a0,1.5,6,1.6); bulb.position.set(OX,1.9,0); office.add(bulb);
  const form=new THREE.Mesh(new THREE.PlaneGeometry(.3,.4),M(0x9a927c)); form.rotation.x=-Math.PI/2; form.position.set(OX,.85,.15); form.visible=false; office.add(form);
  const pen=new THREE.Mesh(new THREE.BoxGeometry(.015,.015,.18),M(0x111111)); pen.position.set(OX+.22,.86,.15); pen.visible=false; office.add(pen);
  const haidar=sitDown(makePerson({coat:0x5e6252, hat:'pilotka'})); haidar.position.set(OX,-.15,-.75); haidar.userData.legL.rotation.x=haidar.userData.legR.rotation.x=-1.4; office.add(haidar);
  const patch=new THREE.Mesh(new THREE.CircleGeometry(.07,10),M(0x2e5a3a)); patch.position.set(-.08,.12,0); patch.rotation.y=-Math.PI/2; haidar.userData.armL.add(patch);
  const asanO=sitDown(makePerson({coat:0x5c5a3a, hat:'none'})); asanO.position.set(OX,-.15,.85); asanO.rotation.y=Math.PI; asanO.userData.legL.rotation.x=asanO.userData.legR.rotation.x=-1.4; office.add(asanO);
  const doctor=makePerson({coat:0xd8d4c8, hat:'none'}); doctor.position.set(OX+2.4,0,-1.8); doctor.visible=false; office.add(doctor);

  // ---------- режиссура ----------
  const S = { busy:true, clock:0, phase:'wagon', polish:0, holding:false, near:false };
  const DIR = { shot:null, t:0, fresh:false }; S.dir=DIR;
  const tmp=new THREE.Vector3(), tmp2=new THREE.Vector3();
  const until = (f, max=180000) => new Promise(r=>{ const t0=performance.now(); const h=setInterval(()=>{ if(f()||performance.now()-t0>max){ clearInterval(h); r(); } },50); });
  const gwait = sec => { const t0=S.clock; return until(()=>S.clock-t0>=sec); };
  function setShot(n){ DIR.shot=n; DIR.t=0; DIR.fresh=true; }
  const hooks={}, run=makeRunner(hooks);
  const wp = o => o.getWorldPosition(new THREE.Vector3());

  const SHOTS = {
    // вагон: из глубины, тела против полос света
    wagonDeep(k){ camera.fov=46; camera.position.set(WX-3.85,2.15,-1.3); return tmp.set(WX+1.2,1.0,1.3); },
    // глаз у щели: поля плывут
    gap(k){ camera.fov=50; camera.position.set(WX+.69,1.45,1.33); return tmp.set(WX+.69,1.0,8); },
    // лагерь сверху: медленный кран вниз
    campTop(k){ camera.fov=42; const e=Math.min(1,k/14); camera.position.set(lerp(-6,-2,e), lerp(46,30,e), lerp(28,22,e)); return tmp.set(0,0,lerp(2,4,e)); },
    // сверху за Асаном (игровой план)
    follow(k){ camera.fov=40; const a=asan.position; camera.position.set(a.x+.5,12,a.z+4.2); return tmp.set(a.x,0,a.z+.2); },
    // руки у проволоки: сбоку, низко
    trade(k){ camera.fov=32; camera.position.set(TRADE.x+3,1.3,TRADE.z+1.2); return tmp.set(TRADE.x,1.2,TRADE.z+1.1); },
    // перекличка: высоко и сбоку, строй как узор
    rollTop(k){ camera.fov=36; camera.position.set(-16,17-Math.min(4,k*.2),16); return tmp.set(0,0,0); },
    // мёртвый в строю — средний план со стороны
    rollDead(k){ camera.fov=28; const d=deadP.position; camera.position.set(d.x+2.4,2.0,d.z-6.5); return tmp.set(d.x-.4,1.3,d.z); },
    // барак сверху, крыши нет: печка — единственный тёплый свет
    barrackTop(k){ camera.fov=44; const e=Math.min(1,k/12); camera.position.set(BX+lerp(2,1,e), lerp(13,10,e), lerp(6,4.5,e)); return tmp.set(BX,0,0); },
    // крупнее на месте Асана
    bunk(k){ camera.fov=42; const a=asanB.position; camera.position.set(a.x+.3,2.4,a.z+(a.z>0?-.6:.6)); return tmp.set(a.x-.2,.1,a.z); },
    // Семён у печки, огонь снизу
    semyon(k){ camera.fov=34; camera.position.set(BX+2.6,1.75,1.1); return tmp.set(semyon.position.x,1.0,semyon.position.z); },
    // полицай идёт между нар
    polizai(k){ camera.fov=40; camera.position.set(BX+7.0,2.2,.6); return wp(polizai).setY(1.3); },
    // Ибрай-ага: двухплановый, учитель и ученик
    ibray(k){ camera.fov=36; const a=ibray.position; camera.position.set(a.x+1.6,1.45,a.z+(a.z>0?-1.5:1.5)); return tmp.set(a.x+.4,.9,a.z); },
    // кабинет: общий, лампа сверху
    oWide(k){ camera.fov=40; camera.position.set(OX+2.8,1.9,2.4); return tmp.set(OX,1.0,0); },
    // через плечо Асана на Хайдара
    oHaidar(k){ camera.fov=28; camera.position.set(OX+.55,1.55,1.75); return tmp.set(OX,1.35,-.75); },
    // через плечо Хайдара на Асана
    oAsan(k){ camera.fov=28; camera.position.set(OX-.5,1.6,-1.55); return tmp.set(OX,1.25,.85); },
    // анкета и перо сверху
    oForm(k){ camera.fov=26; camera.position.set(OX+.05,1.85,.45); return tmp.set(OX,.85,.12); },
    // работа: дорога сверху, камни
    stones(k){ camera.fov=40; const a=asan.position; camera.position.set(a.x-4,8,a.z+6); return tmp.set(a.x,0,a.z); },
    // отбор: вдоль строя, длинным объективом
    line(k){ camera.fov=24; camera.position.set(-17,1.7,-5.2); return wp(civ).setY(1.4).lerp(tmp2.set(0,1.3,-2.6),.4); },
    // палец на Асане
    finger(k){ camera.fov=30; camera.position.set(asan.position.x+.6,1.7,asan.position.z-2.4); return tmp.set(asan.position.x,1.55,asan.position.z); },
    // шестеро уходят к воротам: со спины строя
    leave(k){ camera.fov=36; camera.position.set(1,2.4,5.5); return tmp.set(0,1,-14); },
    // мёртвый Габдулла на нарах, иней на бороде
    gab(k){ camera.fov=34; const g=gabB.position; camera.position.set(g.x+.5,1.9-Math.min(.3,k*.05),g.z+1.0); return tmp.set(g.x,.15,g.z); }
  };

  // ---------- панели (как в главе 5) ----------
  const cam2=new THREE.PerspectiveCamera(36,1,.1,300);
  function shot(p,l,w=900,h=900){ cam2.aspect=w/h; cam2.updateProjectionMatrix(); cam2.position.copy(p); cam2.lookAt(l); const old=renderer.getSize(new THREE.Vector2()); renderer.setSize(w,h,false); renderer.render(scene,cam2); const u=canvas.toDataURL('image/jpeg',.85); renderer.setSize(old.x,old.y,false); return u; }
  async function panels(urls, caps){
    const page=$('page'); page.innerHTML='';
    urls.forEach((u,i)=>{ const d=document.createElement('div'); d.className='pn'; d.innerHTML=`<img src="${u}" alt=""><div class="cap">${escapeHtml(caps[i])}</div>`; page.appendChild(d); });
    $('panels').style.display='flex'; await fadeTo(0,700);
    const click=()=>new Promise(r=>{ const h=()=>{ $('panels').removeEventListener('pointerdown',h); removeEventListener('keydown',kk); r(); }; const kk=e=>{ if(e.code==='Space'||e.code==='Enter') h(); }; $('panels').addEventListener('pointerdown',h); addEventListener('keydown',kk); });
    const cells=[...page.children];
    for(let i=0;i<cells.length;i++){ cells[i].classList.add('on'); $('pnNext').textContent = i<cells.length-1 ? 'Нажми, чтобы открыть следующий кадр' : 'Нажми, чтобы перевернуть страницу'; await wait(350); await click(); }
    await fadeTo(1,700); $('panels').style.display='none';
  }

  // ---------- крючки ремарок ----------
  Object.assign(hooks, {
    async slats(){ setShot('wagonDeep'); await gwait(2.4); },
    async gapView(){ setShot('gap'); await gwait(3.2); },
    async eyeToGap(){ setShot('gap'); S.emptyRoad=true; await gwait(3); },
    async campTop(){ setShot('campTop'); await gwait(5); },
    async tradeHands(){ setShot('trade'); guardF.userData.armR.rotation.x=-1.4; await gwait(.9); rings.visible=false; sfx.paper();
      breadF.visible=true; breadF.position.set(TRADE.x,.06,TRADE.z+.5); guardF.userData.armR.rotation.x=0; noiseBurst({dur:.12,freq:300,q:1,gain:.3,type:'lowpass'}); await gwait(1.2); },
    async deadHand(){ deadP.visible=true; const hp=rows[4], hq=rows[5]; deadP.position.set(hp.position.x+.75,0,hp.position.z); deadP.rotation.y=Math.PI; deadP.rotation.z=.18; deadP.userData.legL.rotation.x=.3;
      hp.position.x-=.05; hq.position.x+=.05; setShot('rollDead'); await gwait(1.2); hp.userData.armR.rotation.x=-1.0; deadP.userData.armR.rotation.x=-2.9; tone({f:200,dur:.4,type:'sine',gain:.03}); await gwait(2.2); deadP.userData.armR.rotation.x=0; },
    async barrackTop(){ setShot('barrackTop'); await gwait(4); },
    async semyonLooksUp(){ semyon.rotation.y=Math.atan2(-(semyon.position.x-(BX+7)),-(semyon.position.z)); setShot('semyon'); await gwait(2.2); },
    async vasilyHides(){ placeAsanB(); potato.visible=true; potato.position.copy(vasily.position).add(tmp.set(.2,.15,0)); setShot('bunk'); await gwait(1.2); potato.visible=false; vasily.userData.armR.rotation.x=-.6; await gwait(1); },
    async polizaiWalks(){ polizai.visible=true; polizai.position.set(BX-7,0,0); S.poliTo=new THREE.Vector3(BX+4,0,0); setShot('polizai');
      for(let i=0;i<4;i++){ await gwait(.9); noiseBurst({dur:.08,freq:900,q:2,gain:.35}); } await until(()=>!S.poliTo); },
    async vasilyDragged(){ S.poliTo=new THREE.Vector3(vasily.position.x,0,vasily.position.z>0?1.1:-1.1); await until(()=>!S.poliTo);
      vasily.rotation.set(0,0,0); vasily.position.y=0; potato.visible=true; potato.position.set(vasily.position.x,.07,vasily.position.z*.5); S.potRoll=1.5; setShot('barrackTop');
      S.dragV=true; S.poliTo=new THREE.Vector3(BX+7,0,0); await until(()=>!S.poliTo); S.dragV=false; vasily.visible=false; polizai.visible=false; },
    async halfPotato(){ S.poliTo=new THREE.Vector3(BX+7.2,0,0); await until(()=>!S.poliTo); polizai.visible=false; DIR.t=12;
      setShot('bunk'); vasily.userData.armL.rotation.x=-1.2; potato.visible=true; potato.scale.set(1,.6,1); potato.position.copy(asanB.position).add(tmp.set(-.2,.2,0)); await gwait(1.8); potato.visible=false; vasily.userData.armL.rotation.x=0; },
    async kolLetterOut(){ letter.visible=true; letter.position.copy(asanB.position).add(tmp.set(.1,.25,0)); setShot('bunk'); await gwait(1.6); },
    async letterSewn(){ letter.scale.setScalar(.6); await gwait(1.4); letter.visible=false; },
    async letterTorn(){ sfx.paper(); await gwait(.4); sfx.paper(); letter.visible=false; await gwait(1.2); },
    async semyonSleeps(){ fire.intensity=.5; glow.material.color.setHex(0x8a3a1a); semyon.position.y=.0; semyon.rotation.x=-Math.PI/2; semyon.position.set(BX+.9,.15,.6); setShot('semyon'); await gwait(1.8); },
    async tumarBack(){ ibray.userData.armR.rotation.x=-1.2; await gwait(1.6); ibray.userData.armR.rotation.x=0; },
    async officeReveal(){ setShot('oWide'); await gwait(2.6); setShot('oHaidar'); await gwait(1.4); },
    async formOnTable(){ form.visible=true; pen.visible=true; setShot('oForm'); S.lampSwing=1; await gwait(2); setShot('oAsan'); },
    async signForm(){ setShot('oForm'); asanO.userData.armR.rotation.x=-1.1; closeDlg(); await signaturePad(renderLang('Turkestanische Legion. Unterschrift:','de'), 'Распишись — так же, как когда-то на повестке.', memory.signature); asanO.userData.armR.rotation.x=0; await gwait(.6); setShot('oHaidar'); },
    async formAway(){ setShot('oForm'); await gwait(1.4); form.visible=false; pen.visible=false; await gwait(.6); setShot('oHaidar'); },
    async doctorWalk(){ doctor.visible=true; haidar.visible=false; asanO.position.set(OX-2.2,0,1.6); asanO.userData.legL.rotation.x=asanO.userData.legR.rotation.x=0; asanO.rotation.y=Math.PI/2;
      S.limpTo=new THREE.Vector3(OX+1.4,0,1.6); setShot('oWide'); await until(()=>!S.limpTo); await gwait(.6); },
    async stoneWork(){ asan.position.set(-20,0,-14); stone.visible=true; S.carry=new THREE.Vector3(10,0,-14.5); setShot('stones'); await until(()=>!S.carry, 9000); S.carry=null; },
    async gabdullaStill(){ gabB.visible=true; setWinter(); fire.intensity=.35; setShot('barrackTop'); DIR.t=12; await gwait(1.4); setShot('gab'); await gwait(2.8); },
    async raiseHand(){ /* показ делает игрок: E на перекличке */ await gwait(.3); },
    async civilianPoints(){ civ.visible=true; civ.position.set(-11.5,0,-4.2); S.civTo=new THREE.Vector3(rows[13].position.x+.5,0,-4.2); setShot('line'); await until(()=>!S.civTo); },
    async fingerOnAsan(){ civ.lookAt(asan.position.x,0,asan.position.z); civ.userData.armR.rotation.x=-1.6; asan.position.z-=.9; setShot('finger'); tone({f:330,dur:.5,type:'sine',gain:.03}); await gwait(2.2); },
    async sixLeave(){ civ.userData.armR.rotation.x=0; S.six.forEach((p,i)=>{ p.userData.to=new THREE.Vector3(-1.5+i*.6,0,-17.5); }); S.sixGo=true; setShot('leave'); await gwait(5.5); }
  });

  function walkTo(o,tgt,v,dt,limp){ const dx=tgt.x-o.position.x, dz=tgt.z-o.position.z, dd=Math.hypot(dx,dz);
    if(dd<.08){ animWalk(o,0,dt); o.rotation.z=0; return true; } const st=Math.min(dd,v*dt); o.position.x+=dx/dd*st; o.position.z+=dz/dd*st; o.rotation.y=Math.atan2(dx,dz); animWalk(o,1,dt);
    if(limp) o.rotation.z=Math.sin(S.clock*6)*.07; return false; }
  function setWinter(){ scene.background.setHex(0xb8bcbc); scene.fog.color.setHex(0xb8bcbc); ground.material.color.setHex(0xc8ccc8); plac.material.color.setHex(0xd4d8d6); hemi.intensity=.7; S.snow=true; }
  // снег — точки, падают медленно
  const snowGeo=new THREE.BufferGeometry(); const sp=new Float32Array(900*3); for(let i=0;i<900;i++){ sp[i*3]=rand(-30,30); sp[i*3+1]=rand(0,24); sp[i*3+2]=rand(-20,22); } snowGeo.setAttribute('position',new THREE.BufferAttribute(sp,3));
  const snow=new THREE.Points(snowGeo,new THREE.PointsMaterial({color:0xffffff,size:.12,transparent:true,opacity:.8})); snow.visible=false; scene.add(snow);

  // ---------- сцены главы ----------
  async function wagonPart(){
    S.phase='wagon'; setShot('wagonDeep'); cine(true); S.rumble=true;
    await fadeTo(0,1800);
    await run(DAT.scripts.wagon); closeDlg();
    await fadeTo(1,1600); S.rumble=false;
  }
  async function campPart(){
    S.phase='arrive'; setShot('campTop'); await fadeTo(0,1600);
    await run(DAT.scripts.arrive); closeDlg();
    // воскресенье: кольца
    await wipe(1100,'right'); asan.position.set(-3,0,4.6); asan.rotation.y=Math.PI; sitDown(asan); gab.position.set(-4.1,0,4.9); sitDown(gab); gab.rotation.y=Math.PI*.85;
    setShot('follow'); rings.visible=true; asan.userData.armR.rotation.x=-.9;
    await run(DAT.scripts.rings_intro); closeDlg(); cine(false);
    S.phase='polish'; S.polish=0; $('holdLabel').textContent=DAT.objectives.polishLabel; $('hold').style.display='block'; $('bHold').style.width='0%';
    setObj(CH, isTouch?DAT.objectives.polishTouch:DAT.objectives.polish); S.busy=false;
    await until(()=>S.polish>=3); S.busy=true; $('hold').style.display='none';
    rings.children.forEach(r=>r.material.emissive.setHex(0x4a3410));
    // к проволоке
    asan.position.y=0; asan.userData.legL.rotation.x=asan.userData.legR.rotation.x=0; asan.userData.armR.rotation.x=-.4;
    S.phase='fence'; setObj(CH, DAT.objectives.fence); S.busy=false;
    await until(()=>S.phase==='traded'); S.busy=true; setObj(CH,'');
    cine(true); await run(DAT.scripts.trade); closeDlg();
    // перекличка с мёртвым
    await fadeTo(1,900); walkers.forEach(w=>w.visible=false); rows.forEach(r=>r.visible=true); asan.position.set(rows[6].position.x,0,rows[6].position.z); rows[6].visible=false; asan.rotation.y=Math.PI;
    setShot('rollTop'); await fadeTo(0,1200); await gwait(2);
    await run(DAT.scripts.rollcall_dead); closeDlg(); deadP.visible=false;
    await fadeTo(1,1200);
  }
  async function barrackPart(){
    S.phase='barrack'; placeAsanB(); setShot('barrackTop'); await fadeTo(0,1400);
    await run(DAT.scripts.barrack); closeDlg();
    await run(DAT.scripts.informer); closeDlg();
    await run(DAT.scripts.letter); closeDlg();
    await run(DAT.scripts.night); closeDlg();
    // утро: Ибрай-ага (панели)
    fire.intensity=1.2; glow.material.color.setHex(0xff8a3a); semyon.rotation.x=0; sitDown(semyon); semyon.position.set(BX+.9,-.45,.5);
    ibray.visible=true; sitDown(ibray); ibray.position.set(asanB.position.x-1.3,-.45+.0,asanB.position.z>0?1.0:-1.0); ibray.rotation.y=asanB.position.z>0?-Math.PI/2:Math.PI/2; scene.remove(ibray); bar.add(ibray);
    const board=new THREE.Mesh(new THREE.BoxGeometry(.4,.02,.3),M(0x2a2a26)); board.position.set(0,-.42,.15); ibray.userData.armR.add(board); S.board=board; ibray.userData.armR.rotation.x=-.8;
    const a=asanB.position, ip=ibray.position;
    const p1=shot(new THREE.Vector3(ip.x+.9,1.0,ip.z+(ip.z>0?-1.2:1.2)), new THREE.Vector3(ip.x,.9,ip.z), 900, 900);
    ibray.rotation.y+=.5; const p2=shot(new THREE.Vector3(ip.x+.6,1.15,ip.z+(ip.z>0?-.7:.7)), new THREE.Vector3(ip.x,1.3,ip.z), 900, 560);
    const p3=shot(new THREE.Vector3(ip.x-.4,1.5,ip.z+(ip.z>0?-1.6:1.6)), new THREE.Vector3(a.x,.6,a.z), 900, 700);
    await fadeTo(1,500); await panels([p1,p2,p3], DAT.panels.ibray.map(c=>c.text));
    setShot('ibray'); await fadeTo(0,500);
    await run(DAT.scripts.ibray); closeDlg();
    await fadeTo(1,1200);
  }
  async function recruiterPart(){
    S.phase='office'; setShot('oWide'); await fadeTo(0,1400);
    await run(DAT.scripts.recruiter); closeDlg();
    if(memory.flags.legion==='signed'){ await wipe(1000,'left'); await run(DAT.scripts.legion_signed); closeDlg(); }
    else { await fadeTo(1,800); scene.background.setHex(0x9a9c98); asan.visible=true; await fadeTo(0,800); await run(DAT.scripts.legion_refused); closeDlg(); stone.visible=false; }
    await fadeTo(1,1200);
  }
  async function winterPart(){
    S.phase='winter'; placeAsanB(); setShot('barrackTop'); await fadeTo(0,1400);
    await run(DAT.scripts.gabdulla_dies); closeDlg();
    await fadeTo(1,1000);
    // перекличка зимой: Асан держит Габдуллу
    snow.visible=true; rows.forEach(r=>{ r.visible=true; r.userData.armR.rotation.x=0; }); asan.visible=true; asan.position.set(rows[6].position.x,0,rows[6].position.z); asan.rotation.set(0,Math.PI,0); rows[6].visible=false;
    deadP.visible=true; deadP.position.set(rows[7].position.x,0,rows[7].position.z); deadP.rotation.set(0,Math.PI,-.18); scene.remove(gab);
    const frost=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,6),M(0xe8eeee)); frost.position.set(0,1.66,.12); frost.rotation.x=Math.PI; deadP.add(frost);
    rows[7].visible=false; asan.userData.armL.rotation.set(-.4,0,-.6);
    setShot('rollDead'); await fadeTo(0,1200); await gwait(1.5);
    S.phase='raise'; setObj(CH, isTouch?DAT.objectives.rollcallTouch:DAT.objectives.rollcall); S.busy=false;
    // номера выкликают по-немецки, пока он не поднимет руку
    S.callT=0; await until(()=>S.raised); S.busy=true; setObj(CH,'');
    await run(DAT.scripts.gabdulla_hand); closeDlg();
    deadP.userData.armR.rotation.x=0; await gwait(1); await fadeTo(1,1400);
  }
  async function selectionPart(){
    S.phase='selection'; setShot('rollTop'); scene.background.setHex(0xa8aaa6); scene.fog.color.setHex(0xa8aaa6); deadP.visible=false; rows[7].visible=true;
    // Ибрай-ага в строю, через одного от Асана
    ibray.parent && ibray.parent.remove(ibray); scene.add(ibray); ibray.rotation.set(0,Math.PI,0); ibray.position.set(rows[9].position.x,0,rows[9].position.z); ibray.userData.legL.rotation.x=ibray.userData.legR.rotation.x=0; ibray.userData.armR.rotation.x=0; rows[9].visible=false;
    if(S.board) S.board.visible=false;
    S.six=[rows[1],rows[3],asan,rows[11],rows[12],rows[13]];
    await fadeTo(0,1400);
    await run(DAT.scripts.selection); closeDlg();
    await fadeTo(1,2000);
  }

  let breathT=0, windT=0, callT=0;
  const sc = {
    S,
    update(dt,t){
      dt *= (window.__fast||1);
      S.clock+=dt;
      // вагон: поля плывут, вагон покачивается, стук колёс
      if(S.phase==='wagon'){ outside.children.forEach(o=>{ o.position.x-=dt*6; if(o.position.x<WX-44) o.position.x+=84; }); wagon.position.y=Math.sin(t*9)*.012; camera.position.y+=Math.sin(t*9)*.006;
        if(S.rumble){ breathT-=dt; if(breathT<=0){ breathT=.42; noiseBurst({dur:.09,freq:180,q:1,gain:.22,type:'lowpass'}); noiseBurst({dur:.09,freq:180,q:1,gain:.18,type:'lowpass',delay:.12}); } } }
      // ветер над лагерем
      windT-=dt; if(windT<=0 && S.phase!=='wagon' && S.phase!=='office'){ windT=rand(2.5,5); noiseBurst({dur:2.2,freq:420,q:.4,gain:.05,type:'bandpass'}); }
      walkers.forEach(w=>{ if(!w.visible) return; if(walkTo(w,w.userData.to,w.userData.v,dt)) w.userData.to.set(rand(-20,20),0,rand(-6,6)); });
      // полировка
      if(S.phase==='polish' && !S.busy){ if(S.holding||keys.Space){ S.polishT=(S.polishT||0)+dt; asan.userData.armR.rotation.x=-.9+Math.sin(t*18)*.25; if(Math.random()<dt*8) noiseBurst({dur:.06,freq:3600,q:.6,gain:.05,type:'highpass'}); }
        $('bHold').style.width=Math.min(100,((S.polishT||0)%1.6)/1.6*100)+'%'; if((S.polishT||0)>=1.6*(S.polish+1)){ S.polish++; rings.children[Math.min(2,S.polish-1)].material.emissive.setHex(0x5a4010); tone({f:880,dur:.12,gain:.04}); } }
      // ходьба к проволоке: Асан хромает
      if(S.phase==='fence' && !S.busy && !dlgOpen){ const [mx,mz]=moveInput(); if(mx||mz){ asan.position.x+=mx*1.6*dt; asan.position.z+=mz*1.6*dt; asan.rotation.y=Math.atan2(mx,mz); animWalk(asan,1,dt); asan.rotation.z=Math.sin(S.clock*6)*.07; }
        else { animWalk(asan,0,dt); asan.rotation.z=0; }
        asan.position.x=Math.max(-24,Math.min(24,asan.position.x)); asan.position.z=Math.max(-16,Math.min(17,asan.position.z));
        S.near = asan.position.distanceTo(TRADE)<1.6; const pr=$('prompt');
        if(S.near){ const v=asan.position.clone().setY(2.3).project(camera); pr.style.display='block'; pr.style.left=((v.x+1)/2*innerWidth)+'px'; pr.style.top=((1-v.y)/2*innerHeight)+'px'; pr.textContent=isTouch?'Отдать кольца':'E — отдать кольца'; } else pr.style.display='none'; }
      else if(S.phase!=='fence') $('prompt').style.display='none';
      if(S.poliTo){ if(walkTo(polizai,S.poliTo,1.3,dt)) S.poliTo=null; if(S.dragV){ vasily.position.x=polizai.position.x-.6; vasily.position.z=polizai.position.z; animWalk(vasily,1,dt); } }
      if(S.potRoll>0){ potato.position.x+=dt*S.potRoll; S.potRoll=Math.max(0,S.potRoll-dt*1.5); }
      if(S.limpTo && walkTo(asanO,S.limpTo,.9,dt,true)) S.limpTo=null;
      if(S.carry){ if(walkTo(asan,S.carry,.7,dt,true)) S.carry=null; asan.userData.armL.rotation.x=asan.userData.armR.rotation.x=-1.1; stone.position.copy(asan.position).add(tmp.set(0,1.05,0).applyAxisAngle(new THREE.Vector3(0,1,0),0)).addScaledVector(new THREE.Vector3(Math.sin(asan.rotation.y),0,Math.cos(asan.rotation.y)),.35); }
      if(S.civTo){ if(walkTo(civ,S.civTo,.8,dt)) S.civTo=null; const near=S.six.find(p=>p!==asan && Math.abs(p.position.x-civ.position.x)<.3 && !p.userData.picked); if(near){ near.userData.picked=true; civ.userData.armR.rotation.x=-1.5; setTimeout(()=>civ.userData.armR.rotation.x=0,500); near.position.z-=.9; } }
      if(S.sixGo) S.six.forEach(p=>walkTo(p,p.userData.to,1,dt,p===asan));
      if(S.lampSwing){ S.lampSwing=Math.max(0,S.lampSwing-dt*.3); const a=Math.sin(t*2.2)*.18*S.lampSwing; lamp.position.x=OX+Math.sin(a)*.5; bulb.position.x=lamp.position.x; }
      // перекличка зимой: номера выкликают, пока не поднимет руку
      if(S.phase==='raise' && !S.raised){ callT-=dt; if(callT<=0){ callT=2.6; bark('Охранник', ['Zwei-sieben-vier!','Zwei-sieben-fünf!','Zwei-sieben-sechs!'][Math.random()*3|0], 'de'); } }
      if(snow.visible){ const a=snow.geometry.attributes.position; for(let i=0;i<a.count;i++){ let y=a.getY(i)-dt*1.2; if(y<0) y=24; a.setY(i,y); } a.needsUpdate=true; }
      // камера
      if(DIR.shot){ const look=SHOTS[DIR.shot](DIR.t,dt); camera.updateProjectionMatrix();
        if(DIR.fresh||!S.dirLook){ S.dirLook=look.clone(); DIR.fresh=false; } else S.dirLook.lerp(look,1-Math.pow(.15,dt));
        camera.lookAt(S.dirLook); DIR.t+=dt; }
    },
    onKey(code,down){ if(down && code==='KeyE') sc.act(); },
    wantsJoy(){ return S.phase==='fence' && !S.busy; },
    touchAction(){ if(S.phase==='polish' && !S.busy) return 'Тереть'; if(S.phase==='fence' && !S.busy && S.near) return 'Отдать кольца'; if(S.phase==='raise' && !S.busy) return 'Поднять руку'; return null; },
    act(){
      if(S.phase==='fence' && !S.busy && S.near && !dlgOpen){ S.busy=true; $('prompt').style.display='none'; S.phase='traded'; }
      else if(S.phase==='raise' && !S.busy && !dlgOpen){ S.raised=true; asan.userData.armR.rotation.x=-.8; deadP.userData.armR.rotation.x=-2.9; }
    },
    holdStart(){ S.holding=true; }, holdEnd(){ S.holding=false; },
    debug:{ phase:p=>{ S.phase=p; } },
    async begin(){
      $('bars').style.display='none'; $('touch').style.display='none'; $('hold').style.display='none'; $('eyelid').style.opacity=0; $('compass').style.display='none';
      setHeart(0); setRing(false); setObj(CH,'');
      await showCard(DAT.card.small, DAT.card.big, DAT.card.text, 'Дальше');
      await wagonPart();
      await campPart();
      await barrackPart();
      await recruiterPart();
      await winterPart();
      await selectionPart();
      cine(false);
      endChapter6();
    }
  };
  return sc;
}
