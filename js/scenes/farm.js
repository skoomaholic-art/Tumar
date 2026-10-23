'use strict';
// Глава 7. Мюльфиртель. Март 1944 — май 1945. Хутор Хуберов, Верхняя Австрия.
// Работа (сверху, мешки) → Стол (панели) → Сталинград для Марты (кино, кухня) → Лизль (сеновал) →
// Казнь в соседней деревне (живая картинка) → Февральская ночь (стелс мимо фонаря Штайнера) → облава →
// Американцы (кино, ответ из выученных слов) → Расплата (сверху) → Предупреждение (панели, выбор).
// Палитра: весна — зелень с охрой, зима — серо-синяя; насилие — только общим планом.
function sceneFarm(){
  resetCamera();
  const DAT = DATA.ch7, CH = 'Глава 7 · Мюльфиртель';
  scene = new THREE.Scene();
  const SKY = 0xc9c4ad; scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 30, 140);
  const hemi = new THREE.HemisphereLight(0xe8e2c8, 0x4a4632, .5); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d0, .6); sun.position.set(-14,26,16); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:1,far:100});
  scene.add(sun, sun.target);
  const tmp=new THREE.Vector3(), tmp2=new THREE.Vector3();
  const pick=a=>a[Math.random()*a.length|0];
  const S = { busy:true, clock:0, phase:'intro', sacks:0, carrying:false, near:null };
  memory.flags.ruFluent = true;
  const DIR = { shot:null, t:0, fresh:false };
  const until = (f, max=180000) => new Promise(r=>{ const t0=performance.now(); const h=setInterval(()=>{ if(f()||performance.now()-t0>max){ clearInterval(h); r(); } },50); });
  const gwait = sec => { const t0=S.clock; return until(()=>S.clock-t0>=sec); };
  function setShot(n){ DIR.shot=n; DIR.t=0; DIR.fresh=true; }
  const hooks={}, run=makeRunner(hooks);
  const box=(w,h,d,c,x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c)); m.position.set(x,y,z); scene.add(shadowAll(m)); return m; };

  // ---------- хутор (в начале координат) ----------
  const groundM=M(0x8a8a5a);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),groundM); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  // холмы вокруг
  for(let i=0;i<22;i++){ const h=new THREE.Mesh(new THREE.SphereGeometry(rand(14,26),12,8,0,Math.PI*2,0,Math.PI/2),M(i%2?0x7e8052:0x8c8a5c)); const a=i/22*Math.PI*2; h.position.set(Math.cos(a)*rand(70,95),-4,Math.sin(a)*rand(70,95)); h.scale.y=rand(.35,.6); scene.add(h); }
  const yard=new THREE.Mesh(new THREE.PlaneGeometry(26,16),M(0x7e7256)); yard.rotation.x=-Math.PI/2; yard.position.set(1,.01,-2); scene.add(yard);
  // дом Хуберов: белёные стены, крутая крыша
  const house=new THREE.Group(); scene.add(house);
  const hw=new THREE.Mesh(new THREE.BoxGeometry(8,3.4,5),M(0xe2dccb)); hw.position.y=1.7; house.add(hw);
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(.01,4.6,2.6,4,1),M(0x6a3e2a)); roof.rotation.y=Math.PI/4; roof.scale.set(1.3,1,.86); roof.position.y=4.7; house.add(roof);
  const door=new THREE.Mesh(new THREE.BoxGeometry(1,2,.08),M(0x4a3020)); door.position.set(1.4,1,2.52); house.add(door);
  for(const x of [-2.4,-.6,3]){ const w=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.06),M(0x3a4048)); w.position.set(x,2.1,2.52); house.add(w); }
  house.position.set(-3,0,-8); shadowAll(house);
  const HOUSE_DOOR=new THREE.Vector3(-1.6,0,-5.2);
  // амбар-сеновал
  const barn=new THREE.Group(); scene.add(barn);
  const bw=new THREE.Mesh(new THREE.BoxGeometry(7,4,6),M(0x7a5e40)); bw.position.y=2; barn.add(bw);
  const broof=new THREE.Mesh(new THREE.CylinderGeometry(.01,5,2.4,4,1),M(0x4e3a2a)); broof.rotation.y=Math.PI/4; broof.scale.set(1.1,1,.95); broof.position.y=5.2; barn.add(broof);
  const bdoor=new THREE.Mesh(new THREE.BoxGeometry(2.4,3,.1),M(0x2e2218)); bdoor.position.set(0,1.5,3.02); barn.add(bdoor);
  barn.position.set(10,0,-6); shadowAll(barn);
  const BARN_DOOR=new THREE.Vector3(10,0,-2.4);
  // стог у сеновала
  const hay=new THREE.Mesh(new THREE.SphereGeometry(1.6,12,8,0,Math.PI*2,0,Math.PI/2),M(0xc8a85a)); hay.scale.set(1.2,.9,1); hay.position.set(14.4,0,-1.6); scene.add(shadowAll(hay));
  // телега с мешками
  const cart=new THREE.Group(); scene.add(cart);
  const bed=new THREE.Mesh(new THREE.BoxGeometry(2.6,.25,1.5),M(0x5a4430)); bed.position.y=.8; cart.add(bed);
  for(const [x,z] of [[-1,.82],[1,.82],[-1,-.82],[1,-.82]]){ const wh=new THREE.Mesh(new THREE.TorusGeometry(.42,.07,6,12),M(0x3a2a1c)); wh.position.set(x,.45,z); cart.add(wh); }
  const sackM=M(0xd8cfb4); const cartSacks=[];
  for(let i=0;i<3;i++){ const s=new THREE.Mesh(new THREE.SphereGeometry(.34,8,6),sackM); s.scale.set(1.3,.75,.9); s.position.set(-.8+i*.8,1.15,0); cart.add(s); cartSacks.push(s); }
  cart.position.set(-8,0,3); shadowAll(cart);
  const CART=new THREE.Vector3(-8,0,4.4);
  const carried=new THREE.Mesh(new THREE.SphereGeometry(.34,8,6),sackM); carried.scale.set(1.3,.75,.9); carried.visible=false; scene.add(carried);
  const stored=[]; // сложенные в амбаре — видны у двери
  // мельница у ручья
  const stream=new THREE.Mesh(new THREE.PlaneGeometry(4,90),M(0x6a7a7e)); stream.rotation.x=-Math.PI/2; stream.position.set(-20,.02,0); scene.add(stream);
  const mill=box(4,4.5,4,0xd2c8b0,-24,2.25,-6); const wheel=new THREE.Mesh(new THREE.TorusGeometry(1.8,.18,6,16),M(0x4a3a28)); wheel.position.set(-21.6,1.9,-6); wheel.rotation.y=Math.PI/2; scene.add(wheel);
  // хутор Штайнера на соседнем холме
  const st=new THREE.Group(); scene.add(st);
  const sw=new THREE.Mesh(new THREE.BoxGeometry(7,3.2,5),M(0xd8d2c0)); sw.position.y=1.6; st.add(sw);
  const sr=new THREE.Mesh(new THREE.CylinderGeometry(.01,4.2,2.4,4,1),M(0x5a3426)); sr.rotation.y=Math.PI/4; sr.scale.set(1.3,1,.86); sr.position.y=4.4; st.add(sr);
  const stWin=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.06),M(0x3a4048)); stWin.position.set(-1.5,2.1,2.52); st.add(stWin);
  st.position.set(26,0,-26); st.rotation.y=-.5; shadowAll(st);
  // забор вдоль поля
  for(let i=0;i<16;i++){ box(.12,1.1,.12,0x5a4a36,-12+i*2,.55,7); }
  box(30,.08,.08,0x5a4a36,3,.85,7); box(30,.08,.08,0x5a4a36,3,.45,7);

  // ---------- люди ----------
  const asan=makePerson({coat:0x5c5a3a, hat:'none'}); asan.position.set(-6,0,5.5); scene.add(asan);
  const marta=makePerson({coat:0x3e3a36, hat:'scarf'}); marta.position.set(-1.2,0,-4.6); scene.add(marta);
  const lisl=makePerson({coat:0x6e5a48, hat:'scarf', scale:.92}); lisl.position.set(12,0,-1); lisl.visible=false; scene.add(lisl);
  const tad=makePerson({coat:0x55503e, hat:'pilotka'}); tad.position.set(-7,0,2.4); scene.add(tad);
  const steiner=makePerson({coat:0x2e3a2c, hat:'borik'}); steiner.position.set(24,0,-22); steiner.visible=false; scene.add(steiner);
  const dub=makePerson({coat:0x6a6a70, hat:'none'}); dub.visible=false; scene.add(dub); // полосатая роба — серая
  for(const p of [asan,marta,lisl,tad,steiner,dub]) shadowAll(p);
  const photo=new THREE.Group(); { const f=new THREE.Mesh(new THREE.BoxGeometry(.32,.42,.03),M(0x3a2a1c)); const pic=new THREE.Mesh(new THREE.PlaneGeometry(.24,.32),M(0x9a9282)); pic.position.z=.02; const fig=new THREE.Mesh(new THREE.CircleGeometry(.06,10),M(0x4a4436)); fig.position.set(0,.05,.025); photo.add(f,pic,fig); } photo.visible=false; scene.add(photo);

  // ---------- кухня (кино): отдельный набор справа ----------
  const KX=70;
  const kfloor=box(8,.1,6,0x5a4430,KX,.05,0); box(8,3.2,.15,0x9a907c,KX,1.6,-3); box(.15,3.2,6,0x9a907c,KX-4,1.6,0);
  const ktable=box(2.2,.1,1.2,0x7a5a3c,KX,.82,-.6); for(const [x,z] of [[-.95,-.5],[.95,-.5],[-.95,.5],[.95,.5]]) box(.08,.8,.08,0x5a4030,KX+x,.4,-.6+z);
  const klamp=new THREE.PointLight(0xffd7a0,0,9,1.6); klamp.position.set(KX,2.4,-.6); scene.add(klamp);
  const kwin=box(1,1,.06,0x8a9aa4,KX+1.8,1.8,-2.92);
  const martaK=makePerson({coat:0x3e3a36, hat:'scarf'}), lislK=makePerson({coat:0x6e5a48, hat:'scarf', scale:.92}), asanK=makePerson({coat:0x5c5a3a, hat:'none'});
  const sitK=(p,x,z,ry)=>{ p.position.set(KX+x,-.4,-.6+z); p.rotation.y=ry; p.userData.legL.rotation.x=p.userData.legR.rotation.x=-1.45; scene.add(shadowAll(p)); };
  sitK(martaK,-1.3,0,Math.PI/2); sitK(asanK,1.3,0,-Math.PI/2); sitK(lislK,0,-1.1,0);

  // ---------- соседняя деревня: площадь ----------
  const VX=-70;
  const vsq=new THREE.Mesh(new THREE.PlaneGeometry(26,18),M(0x8e8670)); vsq.rotation.x=-Math.PI/2; vsq.position.set(VX,.02,0); scene.add(vsq);
  for(const [x,z,r] of [[-9,-8,0],[0,-10,0],[9,-8,0],[-12,2,Math.PI/2],[12,2,-Math.PI/2]]){ const h=box(6,3.2,4,0xd6cfbe,VX+x,1.6,z); h.rotation.y=r; }
  const church=box(3,9,3,0xe0dacb,VX,4.5,-12); const spire=new THREE.Mesh(new THREE.ConeGeometry(1.4,4,4),M(0x4a3020)); spire.position.set(VX,11,-12); spire.rotation.y=Math.PI/4; scene.add(spire);
  const gallows=new THREE.Group(); { const p1=new THREE.Mesh(new THREE.BoxGeometry(.2,4,.2),M(0x2a2018)); p1.position.set(-1,2,0); const p2=p1.clone(); p2.position.x=1; const bm=new THREE.Mesh(new THREE.BoxGeometry(2.4,.2,.2),M(0x2a2018)); bm.position.y=4; gallows.add(p1,p2,bm);
    const hang=makePerson({coat:0x4a4436, hat:'none'}); hang.position.set(0,.9,0); hang.userData.legL.rotation.x=.05; gallows.add(hang); gallows.userData.hang=hang;
    const rope=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.35,4),M(0x2a2018)); rope.position.set(0,3.8,0); gallows.add(rope); }
  gallows.position.set(VX,0,-5); scene.add(gallows);
  const crowd=[]; for(let i=0;i<16;i++){ const p=makePerson({coat:[0x5c5a3a,0x4e4c34,0x6a6244,0x55503a][i%4], hat:i%3?'none':'pilotka'}); p.position.set(VX+rand(-7,7),0,rand(3,7)); p.rotation.y=Math.PI+rand(-.2,.2); scene.add(p); crowd.push(p); }
  const asanV=makePerson({coat:0x5c5a3a, hat:'none'}); asanV.position.set(VX+1.2,0,6.4); asanV.rotation.y=Math.PI; scene.add(asanV);
  const steinerV=makePerson({coat:0x2e3a2c, hat:'borik'}); steinerV.position.set(VX+6,0,9); steinerV.visible=false; scene.add(steinerV);

  // ---------- дорога (американцы) ----------
  const RZ=60;
  const road=new THREE.Mesh(new THREE.PlaneGeometry(200,6),M(0x7a7058)); road.rotation.x=-Math.PI/2; road.position.set(0,.03,RZ); scene.add(road);
  function starMesh(){ const sh=new THREE.Shape(); for(let i=0;i<10;i++){ const r=i%2?.18:.45, a=Math.PI/2+i*Math.PI/5; i?sh.lineTo(Math.cos(a)*r,Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,Math.sin(a)*r); } return new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0xf0ece0})); }
  const tanks=[]; for(let i=0;i<3;i++){ const g=new THREE.Group(); const hull=new THREE.Mesh(new THREE.BoxGeometry(5.6,1.3,3),M(0x4e5638)); hull.position.y=.9; const tur=new THREE.Mesh(new THREE.CylinderGeometry(1,1.1,.9,10),M(0x4a5234)); tur.position.set(-.3,1.95,0); const gun=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,3,6),M(0x3a3e2a)); gun.rotation.z=Math.PI/2; gun.position.set(1.9,2,0);
    const s1=starMesh(); s1.position.set(0,1,1.52); const s2=starMesh(); s2.position.set(-.3,2.1,1.12); g.add(hull,tur,gun,s1,s2); g.position.set(-60-i*12,0,RZ-.5); scene.add(shadowAll(g)); tanks.push(g); }
  const gis=[]; for(let i=0;i<5;i++){ const p=makePerson({coat:0x6a6a48, hat:'helmet'}); p.position.set(rand(-3,3),0,RZ+rand(-2,2)); p.visible=false; const rf=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,1),M(0x2a2018)); rf.position.set(0,-.3,.4); p.userData.armR.add(rf); scene.add(p); gis.push(p); }
  const kowalski=gis[0];
  const asanR=makePerson({coat:0x5c5a3a, hat:'none'}); asanR.visible=false; scene.add(asanR);

  // ---------- дым и снег ----------
  const smokeTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); const gr=g.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,'rgba(70,64,58,.7)'); gr.addColorStop(1,'rgba(70,64,58,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
  const smokes=[]; function puff(x,y,z,s){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false})); sp.position.set(x,y,z); sp.scale.setScalar(s); scene.add(sp); smokes.push({sp,life:4,max:4,base:s}); }
  const snow=(()=>{ const g=new THREE.BufferGeometry(), n=900, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=rand(-30,40); a[i*3+1]=rand(0,24); a[i*3+2]=rand(-30,20); } g.setAttribute('position',new THREE.BufferAttribute(a,3)); const p=new THREE.Points(g,new THREE.PointsMaterial({color:0xeef2f4,size:.12})); p.visible=false; scene.add(p); return p; })();
  // фонарь Штайнера: луч конусом
  const lantern=new THREE.SpotLight(0xffd090,0,18,.42,.5,1.2); scene.add(lantern, lantern.target);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(Math.tan(.42)*12,12,20,1,true),new THREE.MeshBasicMaterial({color:0xffe0a0,transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide})); cone.visible=false; scene.add(cone);

  // ---------- камера ----------
  const SHOTS = {
    follow(){ camera.fov=40; const a=asan.position; camera.position.set(a.x+1.5,15*S.zoom,a.z+10*S.zoom); return tmp.set(a.x,0,a.z-1); },
    farmWide(k){ camera.fov=38; const e=Math.min(1,k/9); camera.position.set(lerp(-26,-18,e),lerp(14,10,e),lerp(26,20,e)); return tmp.set(2,1,-4); },
    barnDoor(){ camera.fov=34; camera.position.set(BARN_DOOR.x-4,2.2,BARN_DOOR.z+6); return tmp.set(BARN_DOOR.x,1.2,BARN_DOOR.z); },
    kitchen(){ camera.fov=40; camera.position.set(KX+3.2,2.3,3.4); return tmp.set(KX,1,-.6); },
    photo(){ camera.fov=26; camera.position.set(KX+.6,1.6,.5); return tmp.set(KX,.9,-.6); },
    martaFace(){ camera.fov=28; camera.position.set(KX+.4,1.5,.9); return tmp.set(KX-1.3,1.25,-.6); },
    hay(k){ camera.fov=34; camera.position.set(14.4+3.5,2.4-k*.02,1.8+4); return tmp.set(13.4,.8,-.2); },
    hands(){ camera.fov=22; camera.position.set(13.4,2.6,1.6); return tmp.set(13.4,.55,.15); },
    square(k){ camera.fov=30; camera.position.set(VX+2+Math.min(k,20)*.03,1.7,16); return tmp.set(VX,2.6,-5); },
    steinerTwo(){ camera.fov=28; camera.position.set(VX+3.8,1.7,11.5); return tmp.set(VX+1.9,1.5,6.6); },
    night(){ camera.fov=40; camera.position.set(6,14,12); return tmp.set(8,0,-3); },
    hayNight(){ camera.fov=34; camera.position.set(BARN_DOOR.x-3,2,BARN_DOOR.z+5); return tmp.set(BARN_DOOR.x+.5,1,BARN_DOOR.z-1); },
    forest(){ camera.fov=36; camera.position.set(BARN_DOOR.x-2,3,BARN_DOOR.z+8); return tmp.set(BARN_DOOR.x+12,3,BARN_DOOR.z-20); },
    road(k){ camera.fov=34; camera.position.set(-6,1.6,RZ+10); return tmp.set(-20+Math.min(k,10)*1.2,1.4,RZ); },
    aim(){ camera.fov=34; camera.position.set(asanR.position.x-1.2,1.75,asanR.position.z+2.2); return tmp.set(gis[2].position.x,1.4,gis[2].position.z); },
    gum(){ camera.fov=24; camera.position.set(asanR.position.x+1.2,1.6,asanR.position.z+1.6); return tmp.set(asanR.position.x,1.1,asanR.position.z); },
    riot(k){ camera.fov=38; const e=Math.min(1,k/10); camera.position.set(lerp(6,10,e),lerp(16,12,e),lerp(-6,-10,e)); return tmp.set(24,1,-24); },
    gate(){ camera.fov=32; camera.position.set(-1,2.2,1.5); return tmp.set(asan.position.x,1.3,asan.position.z); }
  };

  // ---------- крючки ремарок ----------
  const walkTo=(o,tgt,v,dt,limp)=>{ const dx=tgt.x-o.position.x, dz=tgt.z-o.position.z, d=Math.hypot(dx,dz); if(d<.06){ animWalk(o,0,dt); o.rotation.z=0; return true; } const s=Math.min(d,v*dt); o.position.x+=dx/d*s; o.position.z+=dz/d*s; o.rotation.y=Math.atan2(dx,dz); animWalk(o,1,dt); o.rotation.z = limp ? Math.sin(S.clock*6)*.07 : 0; return false; };
  const movers=[]; function goTo(o,x,z,v=1.2,limp=false){ return new Promise(r=>movers.push({o,to:new THREE.Vector3(x,0,z),v,limp,r})); }
  Object.assign(hooks, {
    async farmWide(){ setShot('farmWide'); await gwait(4.5); setShot('follow'); },
    async lislWater(){ lisl.visible=true; lisl.position.set(BARN_DOOR.x+3,0,BARN_DOOR.z+2); setShot('barnDoor'); await goTo(lisl, BARN_DOOR.x+.9, BARN_DOOR.z+1.2, 1.1); lisl.lookAt(asan.position.x,0,asan.position.z); lisl.userData.armR.rotation.x=-1.2; await gwait(.6); },
    async tablePanels(){ closeDlg(); await fadeTo(1,700); await showComic(DAT.panels.table); await gwait(.2); },
    async photo(){ photo.visible=true; photo.position.set(KX-.2,1.08,-.4); photo.rotation.x=-.3; setShot('photo'); await gwait(2.4); setShot('kitchen'); },
    async photoDown(){ setShot('photo'); photo.rotation.x=-Math.PI/2; photo.position.y=.9; await gwait(2.4); setShot('kitchen'); },
    async photoHold(){ setShot('martaFace'); photo.position.set(KX-1.05,1.25,-.5); photo.rotation.set(0,Math.PI/2,0); martaK.userData.armL.rotation.x=martaK.userData.armR.rotation.x=-1.4; await gwait(2.6); setShot('kitchen'); },
    async martaHands(){ setShot('martaFace'); martaK.userData.armR.rotation.x=-1.5; asanK.userData.armR.rotation.x=-1.4; await gwait(2.6); setShot('kitchen'); },
    async haySit(){ asan.position.set(13.8,-.45,.2); asan.rotation.y=Math.PI*.9; asan.userData.legL.rotation.x=asan.userData.legR.rotation.x=-1.45; lisl.visible=true; lisl.position.set(13,-.45,.3); lisl.rotation.y=Math.PI*1.1; lisl.userData.legL.rotation.x=lisl.userData.legR.rotation.x=-1.45; lisl.userData.armR.rotation.x=0; setShot('hay'); await gwait(2.6); },
    async hands(){ asan.userData.armL.rotation.x=-.5; lisl.userData.armR.rotation.x=-.5; setShot('hands'); await gwait(2.8); setShot('hay'); },
    async gallows(){ setShot('square'); await gwait(6); },
    async steiner(){ steinerV.visible=true; await goTo(steinerV, VX+2.1, 6.6, 1); steinerV.lookAt(asanV.position.x,0,asanV.position.z); setShot('steinerTwo'); await gwait(1.6); },
    async knock(){ setShot('night'); noiseBurst({dur:.08,freq:300,q:2,gain:.3}); await gwait(.4); noiseBurst({dur:.08,freq:300,q:2,gain:.3}); await gwait(.3); noiseBurst({dur:.08,freq:300,q:2,gain:.3}); dub.visible=true; dub.position.set(BARN_DOOR.x+1.2,0,BARN_DOOR.z+1.4); dub.lookAt(asan.position.x,0,asan.position.z); setShot('hayNight'); await gwait(1.6); },
    async hideHay(){ await goTo(dub, BARN_DOOR.x, BARN_DOOR.z-1.5, 1.4); dub.visible=false; await gwait(.6); },
    async toForest(){ setShot('forest'); await goTo(dub, BARN_DOOR.x+8, BARN_DOOR.z-16, 2.2); dub.visible=false; await gwait(.8); },
    async shut(){ dub.visible=false; noiseBurst({dur:.25,freq:160,q:1,gain:.3,type:'lowpass'}); await gwait(1.8); },
    async ssArrive(){ setShot('hayNight'); steiner.visible=true; steiner.position.set(BARN_DOOR.x+6,0,BARN_DOOR.z+4); for(const g of ss) { g.visible=true; } await Promise.all([goTo(steiner,BARN_DOOR.x+2.2,BARN_DOOR.z+2.4,1.3), goTo(ss[0],BARN_DOOR.x+1.2,BARN_DOOR.z+3.2,1.3), goTo(ss[1],BARN_DOOR.x+3.2,BARN_DOOR.z+3.4,1.3)]); steiner.lookAt(asan.position.x,0,asan.position.z); lantern.intensity=2.4; await gwait(.6); },
    async point(){ asan.userData.armR.rotation.x=-1.6; asan.rotation.y=Math.PI*.75; await gwait(1.4); asan.userData.armR.rotation.x=0; },
    async bayonet(){ for(let i=0;i<2;i++){ ss[0].userData.armR.rotation.x=-1.6; noiseBurst({dur:.14,freq:500,q:.6,gain:.25,type:'lowpass'}); await gwait(.6); ss[0].userData.armR.rotation.x=-.6; await gwait(.6); } },
    async ssLeave(){ await Promise.all([goTo(steiner,BARN_DOOR.x-8,BARN_DOOR.z+14,1.6), goTo(ss[0],BARN_DOOR.x-9,BARN_DOOR.z+15,1.6), goTo(ss[1],BARN_DOOR.x-7,BARN_DOOR.z+15,1.6)]); steiner.visible=false; ss.forEach(g=>g.visible=false); lantern.intensity=0; },
    async martaOut(){ marta.visible=true; marta.position.copy(HOUSE_DOOR); await goTo(marta, BARN_DOOR.x-1.5, BARN_DOOR.z+2.6, 1.2); marta.lookAt(ss[0].position.x,0,ss[0].position.z); await gwait(1.2); await hooks.ssLeave(); },
    async tanks(){ setShot('road'); S.tanksGo=true; asanR.visible=true; asanR.position.set(6,0,RZ+6); await goTo(asanR, 1.5, RZ+5.2, 1.1, true); },
    async aim(){ gis.forEach((g,i)=>{ g.visible=true; g.position.set(-1.8+i*1.0,0,RZ-.8+(i%2)*.5); g.lookAt(asanR.position.x,0,asanR.position.z); g.userData.armR.rotation.x=-1.4; g.userData.armL.rotation.x=-1.2; }); S.tanksGo=false; setShot('aim'); await gwait(1.8); },
    async gum(){ kowalski.userData.armR.rotation.x=-.9; kowalski.userData.armL.rotation.x=0; gis.forEach(g=>{ g.userData.armR.rotation.x=0; g.userData.armL.rotation.x=0; }); setShot('gum'); asanR.userData.armR.rotation.x=-.9; await gwait(2.4); },
    async riot(){ setShot('riot'); S.riot=true; for(const p of rioters) p.visible=true; await gwait(5); },
    async gate(){ asan.position.set(-1,0,-1.5); asan.rotation.y=0; asan.userData.armR.rotation.x=-1.2; setShot('gate'); await gwait(2.4); asan.userData.armR.rotation.x=0; },
    async glass(){ setShot('riot'); noiseBurst({dur:.3,freq:3200,q:.5,gain:.3,type:'highpass'}); await gwait(2.6); },
    async warnPanels(){ closeDlg(); await fadeTo(1,700); await showComic(DAT.panels.warning); await fadeTo(0,500); }
  });
  const ss=[0,1].map(()=>{ const g=makePerson({coat:0x3c3e38, hat:'helmet'}); g.visible=false; scene.add(g); return g; });
  const rioters=[]; for(let i=0;i<9;i++){ const p=makePerson({coat:[0x5c5a3a,0x4e4c34,0x55503a][i%3], hat:i%2?'none':'pilotka'}); p.position.set(24+rand(-6,6),0,-20+rand(-3,4)); p.visible=false; p.userData.ph=rand(0,6); scene.add(p); rioters.push(p); }

  // ---------- оформление времён года ----------
  function setLook(kind){
    const L={ spring:[0xb4b09a,0x6e7446,.48,.6,0xfff0d0], summer:[0xbcb08c,0x7a7846,.5,.66,0xfff0c8], autumn:[0xa49a82,0x6e6040,.42,.5,0xf0d8b0],
              winter:[0x6e7884,0xb8bec4,.26,.1,0x8899bb], may:[0xb8b49e,0x6e7a48,.5,.62,0xfff4dc], kitchen:[0x2a2620,0x3a3228,.16,.05,0xffd7a0] }[kind];
    scene.background.setHex(L[0]); scene.fog.color.setHex(L[0]); groundM.color.setHex(L[1]); hemi.intensity=L[2]; sun.intensity=L[3]; sun.color.setHex(L[4]);
    snow.visible = kind==='winter';
  }

  // ---------- 1. Работа: мешки ----------
  async function workPart(){
    S.phase='intro'; setLook('spring'); S.zoom=1;
    await fadeTo(0,1400);
    await run(DAT.scripts.work_intro); closeDlg();
    S.phase='sacks'; S.busy=false; cine(false); setShot('follow');
    setObj(CH, fillObj(isTouch?DAT.objectives.sacksTouch:DAT.objectives.sacks,{n:0}));
    setHelp(isTouch?'Джойстик — идти · кнопка — взять / сложить':'WASD — идти · E — взять / сложить мешок');
    await until(()=>S.sacks>=3, 1e9);
    S.busy=true; S.phase='intro'; setObj(CH,''); cine(true);
    await run(DAT.scripts.work_end); closeDlg();
    lisl.userData.armR.rotation.x=0;
  }
  function sackAct(){
    if(S.phase!=='sacks' || S.busy || dlgOpen) return;
    if(!S.carrying && asan.position.distanceTo(CART)<2.2 && cartSacks.some(s=>s.visible)){ const s=cartSacks.filter(x=>x.visible).pop(); s.visible=false; S.carrying=true; carried.visible=true; noiseBurst({dur:.2,freq:300,q:.6,gain:.2,type:'lowpass'});
      if(S.sacks===0) bark('Тадеуш','Спину прямо. Ногу береги.','ru'); }
    else if(S.carrying && asan.position.distanceTo(BARN_DOOR)<2.4){ S.carrying=false; carried.visible=false; S.sacks++; noiseBurst({dur:.3,freq:200,q:.5,gain:.3,type:'lowpass'});
      const s=new THREE.Mesh(new THREE.SphereGeometry(.34,8,6),sackM); s.scale.set(1.3,.75,.9); s.position.set(BARN_DOOR.x-1+S.sacks*.7,.25,BARN_DOOR.z-.4); scene.add(s); stored.push(s);
      setObj(CH, fillObj(isTouch?DAT.objectives.sacksTouch:DAT.objectives.sacks,{n:S.sacks}));
      if(S.sacks===1) think('Восемьдесят кило. Нога горит. Ещё два.');
      if(S.sacks===2) bark('Марта', pick(DAT.deBarks), 'de'); }
  }

  // ---------- 2–3. Стол и Сталинград ----------
  async function tablePart(){
    await fadeTo(1,900); setLook('summer');
    await run(DAT.scripts.table); closeDlg();
    // кухня, вечер: Марта ставит фотографию
    setLook('kitchen'); klamp.intensity=2.2; setShot('kitchen'); cine(true); await fadeTo(0,900);
    await run(DAT.scripts.table_after); closeDlg();
    await run(DAT.scripts.stalingrad); closeDlg();
    photo.visible=false; klamp.intensity=0;
  }
  // ---------- 4. Лизль: сеновал ----------
  async function lislPart(){
    await fadeTo(1,900); setLook('summer'); marta.visible=false; tad.visible=false; await fadeTo(0,900);
    await run(DAT.scripts.lisl); closeDlg();
    asan.userData.legL.rotation.x=asan.userData.legR.rotation.x=0; asan.position.y=0; asan.userData.armL.rotation.x=0; lisl.visible=false;
  }
  // ---------- 5. Казнь: живая картинка ----------
  async function executionPart(){
    await fadeTo(1,1100); setLook('autumn'); setShot('square'); S.wind=true; await fadeTo(0,1400);
    await run(DAT.scripts.execution); closeDlg();
    S.wind=false; steinerV.visible=false;
  }
  // ---------- 6. Февральская ночь: стелс + облава ----------
  async function februaryPart(){
    await fadeTo(1,1100); setLook('winter'); asan.position.set(BARN_DOOR.x-.8,0,BARN_DOOR.z+.6); asan.rotation.y=0; tad.visible=false; await fadeTo(0,1400);
    await run(DAT.scripts.february); closeDlg();
    if(memory.flags.dubrovin==='hid') await stealthPart();
    await run(DAT.scripts.search); closeDlg();
    steiner.visible=false; ss.forEach(g=>g.visible=false); lantern.intensity=0; cone.visible=false; marta.visible=false;
  }
  // ночью отнести Дубровину хлеб в сеновал, не попав под фонарь Штайнера (он ходит вдоль забора)
  async function stealthPart(){
    asan.position.set(HOUSE_DOOR.x,0,HOUSE_DOOR.z+1.2); steiner.visible=true; steiner.position.set(-8,0,9); S.patrol=0; lantern.intensity=2.6; cone.visible=true;
    S.phase='stealth'; S.busy=false; cine(false); setShot('follow'); S.zoom=1.7;
    setObj(CH, DAT.objectives.stealth); setHelp(isTouch?'Джойстик — идти':'WASD — идти, держись вне луча фонаря');
    caption(DAT.texts.stealthCap);
    for(;;){
      S.caught=false; S.reached=false;
      await until(()=>S.caught||S.reached, 1e9);
      if(S.reached) break;
      S.busy=true; bark('Штайнер','Wer da?! Halt!','de'); await gwait(1.2); await fadeTo(1,600);
      asan.position.set(HOUSE_DOOR.x,0,HOUSE_DOOR.z+1.2); S.patrol=0; await fadeTo(0,600); S.busy=false; toast(DAT.texts.stealthRetry);
    }
    S.busy=true; S.phase='intro'; setObj(CH,''); cine(true);
    think(DAT.texts.stealthDone); await gwait(2.6);
    steiner.visible=false; cone.visible=false; lantern.intensity=0;
  }
  // ---------- 7. Американцы: ответ из выученных слов ----------
  async function americansPart(){
    await fadeTo(1,1100); setLook('may'); await fadeTo(0,1200);
    await run(DAT.scripts.americans); closeDlg();
    const ok = await phraseGame();
    if(!ok){ gis[1].userData.armR.rotation.x=-1.6; noiseBurst({dur:.12,freq:900,q:.6,gain:.35}); await gwait(.4); think(DAT.texts.warnShot); await gwait(2.4); }
    await run(DAT.scripts.americans_after); closeDlg();
    gis.forEach(g=>g.visible=false); asanR.visible=false; tanks.forEach(t=>t.position.x=-200);
  }
  // кнопки-слова: собрать «Ich Russe… Kriegsgefangener». Слова — из блокнота, если выучены; немецкий на слух
  function phraseGame(){
    return new Promise(res=>{
      const P=DAT.phrase, known=w=>memory.knownWords.has(w.toLowerCase());
      const tiles=P.tiles.map(t=>({w:t, k:known(t)||t==='Ich'}));
      const el=document.createElement('div'); el.id='phrase';
      el.innerHTML=`<div class="ph-q">${escapeHtml(P.hint)}</div><div class="ph-line"></div><div class="ph-tiles"></div><div class="ph-row"><button type="button" class="ph-clear">Стереть</button><button type="button" class="ph-go">Сказать</button></div>`;
      document.body.appendChild(el); const picked=[];
      const draw=()=>{ el.querySelector('.ph-line').textContent = picked.join(' ') || '…';
        const T=el.querySelector('.ph-tiles'); T.innerHTML='';
        tiles.forEach(t=>{ const b=document.createElement('button'); b.type='button'; b.textContent=t.w; b.className=t.k?'known':''; b.disabled=picked.includes(t.w);
          b.onclick=()=>{ picked.push(t.w); sfx.paper&&sfx.paper(); draw(); }; T.appendChild(b); }); };
      el.querySelector('.ph-clear').onclick=()=>{ picked.length=0; draw(); };
      el.querySelector('.ph-go').onclick=()=>{ if(!picked.length) return; el.remove();
        const said=picked.join(' '); say('Асан', said, 'de');
        const good = picked.includes('Kriegsgefangener') && !picked.includes('Deutsch') && !picked.includes('Heil');
        memory.flags.amSaid = said; res(good); };
      draw();
    });
  }
  // ---------- 8. Расплата ----------
  async function revengePart(){
    await fadeTo(1,1000); setLook('may'); asan.position.set(-1,0,0); marta.visible=false; lisl.visible=false; await fadeTo(0,1000);
    await run(DAT.scripts.revenge); closeDlg();
    S.riot=false; rioters.forEach(p=>p.visible=false);
  }
  // ---------- 9. Предупреждение ----------
  async function warningPart(){
    setShot('farmWide'); lisl.visible=false;
    await run(DAT.scripts.warning); closeDlg();
  }

  // ---------- кадр ----------
  const sc = {
    S,
    update(dt,t){
      S.clock+=dt;
      for(let i=movers.length-1;i>=0;i--){ const m=movers[i]; if(walkTo(m.o,m.to,m.v,dt,m.limp)){ movers.splice(i,1); m.r(); } }
      for(let i=smokes.length-1;i>=0;i--){ const f=smokes[i]; f.life-=dt; const k=1-f.life/f.max; f.sp.position.y+=dt*.9; f.sp.scale.setScalar(f.base*(1+k*1.6)); f.sp.material.opacity=Math.max(0,.8*(1-k)); if(f.life<=0){ scene.remove(f.sp); smokes.splice(i,1); } }
      wheel.rotation.x+=dt*.6;
      if(snow.visible){ const a=snow.geometry.attributes.position; for(let i=0;i<a.count;i++){ let y=a.getY(i)-dt*1.4; if(y<0) y=24; a.setY(i,y); } a.needsUpdate=true; }
      if(S.wind){ const h=gallows.userData.hang; h.rotation.z=Math.sin(t*.8)*.05; crowd.forEach((p,i)=>p.rotation.z=Math.sin(t*.6+i)*.01); }
      if(S.tanksGo) tanks.forEach(g=>{ g.position.x=Math.min(g.position.x+dt*4.5, -6-tanks.indexOf(g)*9); });
      if(S.riot){ if(Math.random()<dt*6) puff(26+rand(-3,3),4+rand(0,2),-26+rand(-2,2),rand(2,4)); rioters.forEach(p=>{ p.rotation.y=Math.sin(t+p.userData.ph)*1.2; animWalk(p,.6,dt); p.userData.armR.rotation.x=-1.2+Math.sin(t*4+p.userData.ph)*.8; }); }
      // игровые фазы: ходьба
      if((S.phase==='sacks'||S.phase==='stealth') && !S.busy && !dlgOpen){
        const [mx,mz]=moveInput(); const v=(S.carrying?1.05:1.9)*(memory.flags.limpBad?.8:1);
        if(mx||mz){ asan.position.x+=mx*v*dt; asan.position.z+=mz*v*dt; asan.rotation.y=Math.atan2(mx,mz); animWalk(asan,S.carrying?.7:1,dt); asan.rotation.z=Math.sin(S.clock*6)*.07; }
        else { animWalk(asan,0,dt); asan.rotation.z=0; }
        asan.position.x=clamp(asan.position.x,-16,20); asan.position.z=clamp(asan.position.z,-4,10);
        const pr=$('prompt'); let label=null, at=null;
        if(S.phase==='sacks'){
          if(!S.carrying && asan.position.distanceTo(CART)<2.2 && cartSacks.some(s=>s.visible)){ label=isTouch?'Взять мешок':'E — взять мешок'; at=CART; }
          else if(S.carrying && asan.position.distanceTo(BARN_DOOR)<2.4){ label=isTouch?'Сложить':'E — сложить в амбар'; at=BARN_DOOR; }
          S.near=label;
          if(S.deCD===undefined) S.deCD=6; S.deCD-=dt; if(S.deCD<=0){ S.deCD=rand(8,13); bark('Марта', pick(DAT.deBarks), 'de'); }
        }
        if(label){ tmp.copy(at).setY(2.4).project(camera); pr.style.display='block'; pr.style.left=((tmp.x+1)/2*innerWidth)+'px'; pr.style.top=((1-tmp.y)/2*innerHeight)+'px'; pr.textContent=label; } else pr.style.display='none';
        if(S.phase==='stealth'){
          // Штайнер ходит вдоль забора туда-обратно, фонарь смотрит вперёд и чуть к дому
          S.patrol+=dt*.16; const ph=(Math.sin(S.patrol*Math.PI)+1)/2; const px=lerp(-10,18,ph), dir=Math.cos(S.patrol*Math.PI)>=0?1:-1;
          steiner.position.set(px,0,8.2); steiner.rotation.y=Math.atan2(dir*.8,-1); animWalk(steiner,.7,dt);
          const look=tmp2.set(px+dir*4,0,-3.5);
          lantern.position.set(px,1.6,8.2); lantern.target.position.copy(look);
          cone.position.set((px+look.x)/2,.8,(8.2+look.z)/2); cone.scale.y=lantern.position.distanceTo(look)/12; cone.lookAt(lantern.position); cone.rotateX(Math.PI/2);
          const to=tmp.copy(asan.position).sub(lantern.position).setY(0), fw=tmp2.copy(look).sub(lantern.position).setY(0).normalize();
          const d=to.length(), ang=Math.acos(clamp(to.normalize().dot(fw),-1,1));
          if(d<12.5 && ang<.38 && !S.caught) S.caught=true;
          if(asan.position.distanceTo(BARN_DOOR)<1.8) S.reached=true;
        }
      } else if(S.phase!=='sacks' && S.phase!=='stealth') $('prompt').style.display='none';
      if(S.carrying){ carried.position.copy(asan.position).add(tmp.set(0,1.95,0)); carried.rotation.y=asan.rotation.y; asan.userData.armL.rotation.x=asan.userData.armR.rotation.x=-2.6; }
      else if(S.phase==='sacks'){ asan.userData.armL.rotation.x=asan.userData.armR.rotation.x=0; }
      if(DIR.shot){ const look=SHOTS[DIR.shot](DIR.t,dt); camera.updateProjectionMatrix();
        if(DIR.fresh||!S.dirLook){ S.dirLook=look.clone(); DIR.fresh=false; } else S.dirLook.lerp(look,1-Math.pow(.12,dt));
        camera.lookAt(S.dirLook); DIR.t+=dt; }
      sun.target.position.copy(asan.position); sun.position.set(asan.position.x-14,26,asan.position.z+16);
    },
    onKey(code,down){ if(down && code==='KeyE') sackAct(); },
    act(){ sackAct(); },
    wantsJoy(){ return (S.phase==='sacks'||S.phase==='stealth') && !S.busy; },
    touchAction(){ return S.phase==='sacks' && !S.busy && S.near ? (S.carrying?'Сложить':'Взять') : null; },
    holdStart(){}, holdEnd(){},
    debug:{ go:async part=>{ const P={work:workPart,table:tablePart,lisl:lislPart,exec:executionPart,feb:februaryPart,stealth:stealthPart,am:americansPart,rev:revengePart,warn:warningPart}; await P[part](); } },
    async begin(){
      $('bars').style.display='none'; $('hold').style.display='none'; $('eyelid').style.opacity=0; $('compass').style.display='none';
      setHeart(0); setRing(false); setObj(CH,'');
      await showCard(DAT.card.small, DAT.card.big, DAT.card.text, 'Дальше');
      cine(true);
      await workPart();
      await tablePart();
      await lislPart();
      await executionPart();
      await februaryPart();
      await americansPart();
      await revengePart();
      await warningPart();
      cine(false); setHelp('');
      endChapter7();
    }
  };
  return sc;
}
