'use strict';
// Глава 1. Аул
// ======================================================================
// СЦЕНА 1. АУЛ — вид сверху, камера с масштабом
// ======================================================================
function sceneAul(){
  resetCamera();
  const DAT = DATA.ch1, CH = 'Глава 1 · '+DAT.title;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa9a291);
  scene.fog = new THREE.Fog(0xa9a291, 110, 560);
  const hemi = new THREE.HemisphereLight(0xcfc8b8, 0x4a3c2c, .55); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe2b8, .78); // низкое утреннее солнце с востока (справа)
  sun.position.set(30, 18, 8); sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:90});
  scene.add(sun); scene.add(sun.target);

  // степь: охра, бурая трава, пятна талого снега
  const gGeo = new THREE.PlaneGeometry(800,800,160,160); gGeo.rotateX(-Math.PI/2);
  const col=[], pos=gGeo.attributes.position, c=new THREE.Color();
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), z=pos.getZ(i);
    const n = Math.sin(x*.21)*Math.cos(z*.17)+Math.sin(x*.07+z*.11)*.8+Math.sin(x*.5-z*.4)*.25;
    pos.setY(i, Math.sin(x*.05)*Math.cos(z*.04)*.35);
    if(n>1.0) c.setHex(0xcfcac0); else if(n>.6) c.setHex(0xa29676); else if(n<-.8) c.setHex(0x5e4c34); else c.setHex(0x84714f);
    c.offsetHSL(0,0,rand(-.03,.03)); col.push(c.r,c.g,c.b);
  }
  gGeo.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); gGeo.computeVertexNormals();
  const ground = new THREE.Mesh(gGeo, new THREE.MeshLambertMaterial({vertexColors:true}));
  ground.receiveShadow = true; scene.add(ground);

  // пучки сухой травы
  const tuftGeo = new THREE.ConeGeometry(.12,.5,4); const tuftM = M(0xa38c5c);
  const tufts = new THREE.InstancedMesh(tuftGeo, tuftM, 500); const dm = new THREE.Object3D();
  for(let i=0;i<500;i++){ dm.position.set(rand(-60,60),.2,rand(-60,60)); if(Math.abs(dm.position.x)<9&&Math.abs(dm.position.z)<9){i--;continue;} dm.rotation.set(rand(-.3,.3),rand(0,6),rand(-.3,.3)); dm.scale.setScalar(rand(.6,1.4)); dm.updateMatrix(); tufts.setMatrixAt(i,dm.matrix); }
  scene.add(tufts);

  // саманный дом
  const house = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(7,2.8,5), M(0xb39a74)); walls.position.y=1.4;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(7.6,.35,5.6), M(0x6a5a44)); roof.position.y=2.95;
  const door = new THREE.Mesh(new THREE.BoxGeometry(1,1.9,.1), M(0x3a2c1e)); door.position.set(1.2,.95,2.52);
  const win = new THREE.Mesh(new THREE.BoxGeometry(.9,.7,.1), M(0x2a2a28,{emissive:0x000000})); win.position.set(-1.6,1.6,2.52);
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(.6,1,.6), M(0x8e7a5c)); chimney.position.set(-2.4,3.4,-1);
  house.add(walls,roof,door,win,chimney); house.position.set(-6,0,-6); shadowAll(house); scene.add(house);
  const winMat = win.material;

  // юрта
  const yurt = new THREE.Group();
  const yw = new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,1.7,16), M(0xd8cfba)); yw.position.y=.85;
  const yr = new THREE.Mesh(new THREE.ConeGeometry(2.6,1.3,16), M(0xcfc4ac)); yr.position.y=2.35;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(2.42,2.42,.18,16), M(0x7a2a22)); band.position.y=1.5;
  yurt.add(yw,yr,band); yurt.position.set(-15,0,-3); shadowAll(yurt); scene.add(yurt);

  // загон: столбы и жерди, три пустых места подсвечены
  const pen = new THREE.Group(); pen.position.set(5,0,2); scene.add(pen);
  const postM = M(0x5e4a34), railM = M(0x8a7050);
  const W=8, D=6, posts=[];
  for(let i=0;i<=4;i++){ posts.push([-W/2+i*W/4,-D/2],[-W/2+i*W/4,D/2]); }
  for(let j=1;j<3;j++){ posts.push([-W/2,-D/2+j*D/3],[W/2,-D/2+j*D/3]); }
  posts.forEach(([x,z])=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,1.5,6), postM); p.position.set(x,.75,z); pen.add(shadowAll(p)); });
  const railGeoX = new THREE.CylinderGeometry(.06,.06,W/4,6); railGeoX.rotateZ(Math.PI/2);
  const railGeoZ = new THREE.CylinderGeometry(.06,.06,D/3,6); railGeoZ.rotateX(Math.PI/2);
  const slots=[];
  for(let i=0;i<4;i++) for(const z of [-D/2,D/2]) for(const y of [.6,1.2]){
    const r=new THREE.Mesh(railGeoX, railM); r.position.set(-W/2+W/8+i*W/4,y,z);
    // три пустые жерди — на ближней стороне
    if(z===D/2 && y===1.2 && i<3){ r.material = new THREE.MeshBasicMaterial({color:0xfff2d0,transparent:true,opacity:.28}); r.castShadow=false; slots.push(r); }
    else shadowAll(r);
    pen.add(r);
  }
  for(let j=0;j<3;j++) for(const x of [-W/2,W/2]) for(const y of [.6,1.2]){ const r=new THREE.Mesh(railGeoZ, railM); r.position.set(x,y,-D/2+D/6+j*D/3); pen.add(shadowAll(r)); }
  // ягнята внутри
  const lambs=[];
  for(let i=0;i<4;i++){ const l=new THREE.Group(); const b=new THREE.Mesh(new THREE.SphereGeometry(.28,8,6),M(0xe8e2d4)); b.scale.set(1.3,1,1); b.position.y=.38; const h=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),M(0x3a3028)); h.position.set(.34,.5,0); l.add(b,h); l.position.set(rand(-3,3),0,rand(-2,2)); pen.add(shadowAll(l)); lambs.push(l); }

  // штабель жердей у дома
  const pile=[];
  for(let i=0;i<3;i++){ const r=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2,6), railM); r.rotation.z=Math.PI/2; r.position.set(-1.5,.12+i*.14,-2.6+i*.05); scene.add(shadowAll(r)); pile.push(r); }

  // дым из трубы — частицы на canvas с мягкими краями
  const smokeTex = (()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'); const gr=x.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,'rgba(220,214,200,.55)'); gr.addColorStop(1,'rgba(220,214,200,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); })();
  const smoke=[]; for(let i=0;i<14;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false})); s.userData.t=i/14; scene.add(s); smoke.push(s); }
  const chimneyPos = new THREE.Vector3(-8.4,3.9,-7);
  const windN=260, windGeo=new THREE.BufferGeometry(), wpos=new Float32Array(windN*3);
  for(let i=0;i<windN;i++){ wpos[i*3]=rand(-30,30); wpos[i*3+1]=rand(.2,4); wpos[i*3+2]=rand(-25,25); }
  windGeo.setAttribute('position',new THREE.BufferAttribute(wpos,3));
  const windPts=new THREE.Points(windGeo,new THREE.PointsMaterial({color:0xe8e2d4,size:.07,transparent:true,opacity:.55,depthWrite:false})); scene.add(windPts);

  // --- взгляд из травы: передний план крепится к камере ---
  scene.add(camera);
  const fg = new THREE.Group(); camera.add(fg);
  const bladeM = new THREE.MeshLambertMaterial({color:0x4a3f2a, side:THREE.DoubleSide});
  const fgBlades=[];
  for(let i=0;i<26;i++){
    const g=new THREE.ConeGeometry(.018+Math.random()*.02, rand(.5,1.1), 3); g.translate(0,.5*g.parameters.height,0); g.scale(1,1,.25);
    const b=new THREE.Mesh(g, bladeM); const side = i<13 ? -1 : 1;
    b.position.set(side*rand(.35,1.05), -.75, -1.5 - rand(0,.5)); b.rotation.z = -side*rand(.05,.45); b.userData.base=b.rotation.z; b.userData.ph=rand(0,6);
    fg.add(b); fgBlades.push(b);
  }
  // жук ползёт по одному из стеблей
  const beetle=new THREE.Group();
  const bb=new THREE.Mesh(new THREE.SphereGeometry(.028,10,8),new THREE.MeshPhongMaterial({color:0x1f2a1a,shininess:90,specular:0x88aa77})); bb.scale.set(.8,1.4,.6);
  const bh=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),M(0x111111)); bh.position.y=.038;
  beetle.add(bb,bh); for(let i=0;i<3;i++) for(const sd of [-1,1]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.03,.003,.003),M(0x111111)); l.position.set(sd*.025,(i-1)*.02,0); l.rotation.z=sd*.4; beetle.add(l); }
  const beetleStem=fgBlades[16]; beetleStem.add(beetle); beetle.userData.t=0;
  // суслик у норки на среднем плане
  const suslik=new THREE.Group();
  const sb=new THREE.Mesh(new THREE.CylinderGeometry(.09,.13,.38,8),M(0xb09468)); sb.position.y=.19;
  const sh=new THREE.Mesh(new THREE.SphereGeometry(.085,8,6),M(0xa88c60)); sh.position.y=.43;
  const mound=new THREE.Mesh(new THREE.SphereGeometry(.35,8,4,0,Math.PI*2,0,Math.PI/2),M(0x6e5a3e)); mound.scale.y=.35;
  suslik.add(sb,sh); const susBox=new THREE.Group(); susBox.add(mound, suslik); susBox.position.set(10.5,0,11.5); scene.add(shadowAll(susBox));
  // вороньё на столбе загона
  const crow=new THREE.Group(); const cbody=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),M(0x1a1816)); cbody.scale.set(.8,.9,1.5);
  const cbeak=new THREE.Mesh(new THREE.ConeGeometry(.03,.1,4),M(0x2a2622)); cbeak.rotation.x=Math.PI/2; cbeak.position.set(0,.05,.2);
  crow.add(cbody,cbeak); crow.position.set(5+4,1.65,2-3); scene.add(shadowAll(crow));
  const OBS = { pos:new THREE.Vector3(15,2.6,17.5), look:new THREE.Vector3(-.5,1.0,-.5) };
  // точка в кадре наблюдателя: dist — вглубь, side — вправо (+) или влево (−)
  const obsFwd = OBS.look.clone().sub(OBS.pos).setY(0).normalize(), obsRight = new THREE.Vector3(-obsFwd.z,0,obsFwd.x);
  const frameAt = (dist, side) => OBS.pos.clone().addScaledVector(obsFwd, dist).addScaledVector(obsRight, side).setY(0);
  // справа за аулом — далёкие горы (Ерейментау), в дымке
  const mtnM = new THREE.MeshLambertMaterial({color:0x55585c});
  [[280,10,95,30],[300,70,110,38],[270,120,80,26],[320,170,120,34],[290,-40,90,24],[310,230,100,28],[275,40,60,18]].forEach(([dist,side,r,h])=>{
    const p=frameAt(dist,side); const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,7,1),mtnM); m.scale.z=rand(.5,.8); m.position.set(p.x,h/2-2,p.z); m.rotation.y=rand(0,3); scene.add(m);
    // снега на вершинах нет: в марте он лежит пятнами, а шапки в дымке читаются как висящие в воздухе
  });

  // --- второй план-«наблюдатель»: изнутри юрты через дверной проём ---
  const YURT_SHOT = { pos:new THREE.Vector3(-13.25,1.3,-3.05), look:new THREE.Vector3(-1.5,.9,-2.2), fov:42 };
  const doorway = new THREE.Group(); doorway.visible=false; scene.add(doorway);
  const feltDark = new THREE.MeshBasicMaterial({color:0x1c140e, side:THREE.DoubleSide});
  const lw=new THREE.Mesh(new THREE.PlaneGeometry(3,4),feltDark); lw.position.set(-12.75,1.6,-5.12); lw.rotation.y=Math.PI/2;
  const rw=lw.clone(); rw.position.z=-0.98;
  const top=new THREE.Mesh(new THREE.PlaneGeometry(2,1.6),feltDark); top.position.set(-12.75,2.75,-3.05); top.rotation.y=Math.PI/2;
  const sill=new THREE.Mesh(new THREE.BoxGeometry(.25,.12,1.2),M(0x3a2a1c)); sill.position.set(-12.75,.06,-3.05);
  const jambM=M(0x5a3e26); const j1=new THREE.Mesh(new THREE.BoxGeometry(.12,1.9,.12),jambM); j1.position.set(-12.72,.95,-3.62); const j2=j1.clone(); j2.position.z=-2.48;
  const lint=new THREE.Mesh(new THREE.BoxGeometry(.14,.14,1.3),jambM); lint.position.set(-12.72,1.92,-3.05);
  // полог: войлок, наполовину скатанный, край колышется
  const flapGeo=new THREE.PlaneGeometry(.42,1.5,4,10); const flapBase=flapGeo.attributes.position.array.slice();
  const flap=new THREE.Mesh(flapGeo, new THREE.MeshLambertMaterial({color:0x8a7a62, side:THREE.DoubleSide})); flap.position.set(-12.68,1.15,-2.62); flap.rotation.y=Math.PI/2+.35;
  const rolled=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,1.25,10),M(0x7a6a52)); rolled.rotation.x=Math.PI/2; rolled.position.set(-12.62,1.86,-3.05);
  doorway.add(lw,rw,top,sill,j1,j2,lint,flap,rolled);

  // люди
  const asan = makePerson({coat:0x6e5a42, hat:'borik'}); asan.position.set(-2,0,1); scene.add(asan);
  const father = makePerson({coat:0x4a3a2a, hat:'tymak', beard:true}); father.position.set(3.2,0,6.3); father.rotation.y = Math.PI; scene.add(father);
  const kulash = makePerson({coat:0x7a6a50, hat:'scarf', scale:.68}); kulash.position.set(-3.5,0,-3); scene.add(kulash); kulash.visible=false;
  const rider = new THREE.Group(); // всадник на коне
  const horse = makeHorse();
  const rman = makePerson({coat:0x5c5a3a, hat:'pilotka', scale:.9}); rman.position.y=1.1; rman.userData.legL.rotation.x=-1.2; rman.userData.legR.rotation.x=-1.2;
  rider.add(horse, rman); scene.add(rider);
  const RIDER_PATH = [frameAt(115,48), frameAt(80,34), frameAt(50,22)];
  rider.position.copy(RIDER_PATH[0]);

  // взаимодействия
  const S = { asan, father, kulash, rider, target:null, carry:null, placed:0, busy:true, zoom:1, step:0, stepT:0, cam:'obs',
    colliders:[{x:-6,z:-6,w:7.6,d:5.6},{x:-15,z:-3,r:2.6},{x:5,z:2,w:8.2,d:6.2,pen:true}] };
  camera.position.set(asan.position.x, 14, asan.position.z+12); camera.lookAt(asan.position);

  // клик/касание по земле — идти туда
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  function pointerGround(ev){
    if(S.busy || dlgOpen) return;
    const r = canvas.getBoundingClientRect();
    mouse.set(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObject(ground)[0]; if(!hit) return;
    // клик рядом с предметом действия — подойти и сделать
    const it = nearestInteract(hit.point, 1.8);
    S.target = it ? {x:it.pos.x, z:it.pos.z, then:it} : {x:hit.point.x, z:hit.point.z};
  }
  canvas.addEventListener('pointerdown', pointerGround);
  // масштаб колесом и щипком
  canvas.addEventListener('wheel', e=>{ S.zoom = clamp(S.zoom + Math.sign(e.deltaY)*.1, .45, 1.7); }, {passive:true});
  const toggleCam=()=>{ S.cam = S.cam==='obs' ? 'top' : 'obs'; fg.visible = S.cam==='obs'; toast(S.cam==='obs' ? 'Ракурс: из травы' : 'Ракурс: сверху'); };
  let pinch=null;
  canvas.addEventListener('touchmove', e=>{ if(e.touches.length===2){ const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); if(pinch) S.zoom=clamp(S.zoom*(pinch/d),.45,1.7); pinch=d; } }, {passive:true});
  canvas.addEventListener('touchend', ()=>pinch=null);

  // крючки, которые сценарий главы вызывает по имени
  const run = makeRunner({
    paper(){ sfx.paper(); },
    showDoc,
    async kulashRuns(){ kulash.visible=true; kulash.position.set(-4,0,-2); S.kulashGo=true; await wait(1400); S.kulashGo=false; faceEach(kulash,asan); },
    riderLeaves(){ rider.visible=false; faceEach(father,asan); }
  });

  function interactables(){
    const list=[];
    if(S.step===1) list.push({pos:father.position, label:'Поговорить с отцом', act:talkFather});
    if(S.step===2 && !S.carry && S.placed<3) list.push({pos:new THREE.Vector3(-1.5,0,-2.4), label:'Взять жердь', act:takePole});
    if(S.step===2 && S.carry){ const sl=slots[S.placed]; const wp=new THREE.Vector3(); sl.getWorldPosition(wp); wp.y=0; wp.z+=.9; list.push({pos:wp, label:'Приладить жердь', act:placePole}); }
    if(S.step===4) list.push({pos:new THREE.Vector3(-4.8,0,-2.9), label:'Зайти в дом', act:enterHouse});
    return list;
  }
  function nearestInteract(p, r){ let best=null, bd=r; for(const it of interactables()){ const d=Math.hypot(it.pos.x-p.x, it.pos.z-p.z); if(d<bd){bd=d;best=it;} } return best; }

  async function talkFather(){
    S.busy=true; faceEach(asan,father);
    await run(DAT.scripts.father_intro);
    closeDlg(); S.step=2; setObj(CH, fillObj(DAT.objectives.bring,{n:0})); S.busy=false;
  }
  function takePole(){
    const p = pile.pop(); p.parent.remove(p);
    const carried = new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2,6), railM); carried.rotation.z=Math.PI/2; carried.position.set(0,1.75,.1);
    asan.add(shadowAll(carried)); S.carry=carried; asan.userData.carry=true; asan.userData.armL.rotation.x=asan.userData.armR.rotation.x=-2.6;
    sfx.wood(); setObj(CH, fillObj(DAT.objectives.attach,{n:S.placed}));
  }
  async function placePole(){
    asan.remove(S.carry); S.carry=null; asan.userData.carry=false; asan.userData.armL.rotation.x=asan.userData.armR.rotation.x=0;
    const sl = slots[S.placed]; sl.material = railM; shadowAll(sl); sfx.wood(); setTimeout(sfx.wood,180);
    S.placed++;
    setObj(CH, fillObj(DAT.objectives.bring,{n:S.placed}));
    if(S.placed===1){ S.busy=true; faceEach(asan,father); await run(DAT.scripts.pole_1); closeDlg(); S.busy=false; }
    if(S.placed===2){ await fatherStory(); }
    if(S.placed===3){ /* последняя жердь — приезжает всадник, работа остаётся недоделанной */ }
    if(S.placed===2){ setObj(CH, DAT.objectives.last); }
    if(S.placed===3) await riderArrives();
  }
  async function fatherStory(){
    S.busy=true; faceEach(asan,father); father.lookAt(40,0,30);
    await run(DAT.scripts.father_story);
    closeDlg(); S.busy=false;
  }
  async function riderArrives(){
    S.busy=true; S.target=null; sfx.hooves(); setTimeout(sfx.hooves,1500); setTimeout(sfx.hooves,3000);
    // долгий план: всадник рысью идёт к аулу, камера снимает его длинным объективом
    S.riderGo=true; S.camFocus=rider; S.tele=1; cine(true);
    const t0=performance.now();
    while(S.riderGo && performance.now()-t0<11000){ await wait(200); if(rider.position.distanceTo(tmp.set(asan.position.x+4,0,asan.position.z+3))<1.2) break; }
    S.riderGo=false; S.camFocus=null; S.tele=0; cine(false); faceEach(asan,rider);
    await run(DAT.scripts.rider);
    closeDlg(); S.step=4; setObj(CH, DAT.objectives.evening); S.busy=false;
    S.evening=0.001;
  }
  function showDoc(known){
    return new Promise(res=>{
      const body = DAT.summons;
      const html = body.split('\n').map((line,i)=> i===0 ? `<b>${renderLang(line,'ru')}</b>` : renderLang(line,'ru')).join('<br>');
      $('paper').innerHTML = html + `<div class="stamp"></div><div class="hint">${known?'Слова, которые прочитала Күләш, теперь понятны.':'Асан узнаёт только своё имя.'} Нажми, чтобы закрыть.</div>`;
      $('doc').style.display='flex'; S.busy=true;
      $('doc').onclick=()=>{ $('doc').style.display='none'; res(); };
    });
  }
  async function enterHouse(){
    S.busy=true; S.step=5; setObj(CH,'');
    // кадры для рисованных панелей: пока рендер из движка с крупных ракурсов
    const shots = [];
    const cam2 = new THREE.PerspectiveCamera(40, 1, .1, 200);
    function shot(pos, look, w=900, h=900){ cam2.aspect=w/h; cam2.updateProjectionMatrix(); cam2.position.copy(pos); cam2.lookAt(look); const old=renderer.getSize(new THREE.Vector2()); renderer.setSize(w,h,false); renderer.render(scene,cam2); const url=canvas.toDataURL('image/jpeg',.85); renderer.setSize(old.x,old.y,false); return url; }
    father.position.set(-4.6,0,-2.2); father.lookAt(-4.6,0,5); asan.position.set(-3.6,0,-1.4); asan.lookAt(-4.6,0,-2.2);
    const tumar = new THREE.Mesh(new THREE.ConeGeometry(.12,.2,3), new THREE.MeshLambertMaterial({color:0x8e1f1a,emissive:0x3a0806}));
    tumar.rotation.x=Math.PI/2; tumar.position.set(-4.3,1.25,-1.7); scene.add(tumar);
    shots.push(shot(new THREE.Vector3(-12,3.2,12), new THREE.Vector3(-6,1.6,-4), 900,1100));
    shots.push(shot(new THREE.Vector3(-3.6,2.1,0.2), new THREE.Vector3(-4.6,1.75,-2.2)));
    shots.push(shot(new THREE.Vector3(-4.1,1.6,-1.2), new THREE.Vector3(-4.3,1.25,-1.7)));
    const caps = DAT.panels.captions.map(c => c.if ? (evalCond(c.if, memory.flags) ? c.text : c.else) : c.text);
    await fadeTo(1,900);
    const page=$('page'); page.innerHTML='';
    shots.forEach((u,i)=>{ const d=document.createElement('div'); d.className='pn'; d.innerHTML=`<img src="${u}" alt=""><div class="cap">${caps[i]}</div>`; page.appendChild(d); });
    $('panels').style.display='flex'; await fadeTo(0,700);
    const clickPanels = () => new Promise(r=>{ const h=()=>{ $('panels').removeEventListener('pointerdown',h); r(); }; $('panels').addEventListener('pointerdown',h); const k=e=>{ if(e.code==='Space'||e.code==='Enter'){ removeEventListener('keydown',k); $('panels').removeEventListener('pointerdown',h); r(); } }; addEventListener('keydown',k); });
    const cells=[...page.children];
    for(let i=0;i<cells.length;i++){ cells[i].classList.add('on'); $('pnNext').textContent = i<cells.length-1 ? 'Нажми, чтобы открыть следующий кадр' : 'Нажми, чтобы перевернуть страницу'; await wait(350); await clickPanels(); }
    await run(DAT.scripts.house_end);
    await wait(900);
    await fadeTo(1,900); $('panels').style.display='none';
    endChapter1();
  }
  function faceEach(a,b){ a.lookAt(b.position.x,0,b.position.z); }
  // долгий план в начале главы: горы и далёкий всадник справа, потом взгляд медленно уходит к двору
  function introShot(dt){
    const I=S.intro; I.t+=dt; const k=Math.min(1,I.t/9), e=k*k*(3-2*k);
    camera.position.copy(OBS.pos); camera.fov = lerp(20, 38, e); camera.updateProjectionMatrix();
    const from = frameAt(150,62).setY(14), to = OBS.look;
    camera.lookAt(lerp(from.x,to.x,e), lerp(from.y,to.y,e), lerp(from.z,to.z,e));
    fg.scale.x = clamp(camera.aspect/1.78,.3,1);
  }

  // столкновения: дом и юрта — препятствия, загон — нельзя войти
  function collide(p){
    for(const c of S.colliders){
      if(c.r){ const dx=p.x-c.x, dz=p.z-c.z, d=Math.hypot(dx,dz); if(d<c.r+.35){ p.x=c.x+dx/d*(c.r+.35); p.z=c.z+dz/d*(c.r+.35);} }
      else { const hx=c.w/2+.35, hz=c.d/2+.35, dx=p.x-c.x, dz=p.z-c.z; if(Math.abs(dx)<hx && Math.abs(dz)<hz){ if(hx-Math.abs(dx) < hz-Math.abs(dz)) p.x=c.x+Math.sign(dx)*hx; else p.z=c.z+Math.sign(dz)*hz; } }
    }
  }

  const tmp = new THREE.Vector3();
  const sc = {
    update(dt, t){
      // движение
      let mx=0, mz=0;
      if(!S.busy && !dlgOpen){
        if(keys.KeyW||keys.ArrowUp) mz-=1; if(keys.KeyS||keys.ArrowDown) mz+=1;
        if(keys.KeyA||keys.ArrowLeft) mx-=1; if(keys.KeyD||keys.ArrowRight) mx+=1;
        if(mx||mz) S.target=null;
        if(S.target){ const dx=S.target.x-asan.position.x, dz=S.target.z-asan.position.z, d=Math.hypot(dx,dz);
          if(d<.25 || (S.target.then && d<1.4)){ const th=S.target.then; S.target=null; if(th) th.act(); } else { mx=dx/d; mz=dz/d; } }
      }
      const len=Math.hypot(mx,mz); const speed = S.carry ? 3 : 4.2;
      if(len>0){ mx/=len; mz/=len; asan.position.x+=mx*speed*dt; asan.position.z+=mz*speed*dt; collide(asan.position); asan.rotation.y = Math.atan2(mx,mz);
        S.stepT+=dt; if(S.stepT>.32){ S.stepT=0; sfx.step(); } }
      animWalk(asan, len>0?1:0, dt);
      // отец работает у загона, если свободен
      if(!S.busy && S.step>=1 && S.step<4){ father.lookAt(5,0,5); }
      // всадник подъезжает по дороге
      // всадник: пока работа идёт — шагом к очередной точке, на последней жерди — рысью к Асану
      { const tgt = S.riderGo ? tmp.set(asan.position.x+4,0,asan.position.z+3) : RIDER_PATH[Math.min(S.placed,2)];
        const dx=tgt.x-rider.position.x, dz=tgt.z-rider.position.z, dd=Math.hypot(dx,dz), v=S.riderGo?5.5:1.4;
        if(dd>.3 && (S.riderGo || S.step>=1)){ const st=Math.min(dd, v*dt); rider.position.x+=dx/dd*st; rider.position.z+=dz/dd*st; rider.rotation.y=Math.atan2(dx,dz);
          horse.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*(S.riderGo?9:5)+(i%2?Math.PI:0)+(i>1?1:0))*(S.riderGo?.7:.35)); rider.position.y=S.riderGo?Math.abs(Math.sin(t*9))*.12:0; }
        else horse.userData.legs.forEach(l=>l.rotation.x*=.9); }
      if(S.kulashGo){ tmp.set(asan.position.x-1,0,asan.position.z-1); kulash.position.lerp(tmp, dt*2.2); animWalk(kulash,1,dt); kulash.lookAt(asan.position.x,0,asan.position.z); }
      // ягнята бродят
      lambs.forEach((l,i)=>{ l.position.x=clamp(l.position.x+Math.sin(t*.4+i*2)*dt*.3,-3.4,3.4); l.position.z=clamp(l.position.z+Math.cos(t*.3+i)*dt*.3,-2.4,2.4); l.rotation.y=Math.sin(t*.4+i*2)>0?0:Math.PI; });
      // пустые места мигают, пока их не закрыли
      slots.forEach((s,i)=>{ if(i>=S.placed && s.material.transparent) s.material.opacity = .18+.18*Math.sin(t*3); });
      // ветер гонит крупу слева направо, как в степи в марте
      const wp=windGeo.attributes.position.array;
      for(let i=0;i<windN;i++){ wp[i*3]+=dt*(7+(i%5)); wp[i*3+1]+=Math.sin(t*2+i)*dt*.3; if(wp[i*3]>asan.position.x+30){ wp[i*3]=asan.position.x-30; wp[i*3+2]=asan.position.z+rand(-25,25);} }
      windGeo.attributes.position.needsUpdate=true;
      // дым
      smoke.forEach(s=>{ s.userData.t+=dt*.12; if(s.userData.t>1) s.userData.t-=1; const k=s.userData.t; s.position.set(chimneyPos.x + k*7 + Math.sin(k*6)*.3, chimneyPos.y + k*6, chimneyPos.z - k*1.5); s.scale.setScalar(.8+k*3); s.material.opacity = (1-k)*.8; });
      // вечер: свет садится, окно загорается
      if(S.evening){ S.evening=Math.min(1,S.evening+dt*.25); const e=S.evening;
        sun.intensity=lerp(.78,.22,e); sun.color.setHex(0xff9a5c); hemi.intensity=lerp(.55,.28,e);
        scene.background.setRGB(lerp(.66,.22,e),lerp(.64,.2,e),lerp(.57,.22,e)); scene.fog.color.copy(scene.background);
        winMat.emissive.setRGB(.9*e,.6*e,.25*e); }
      // камера: следует за героем, во время сцен — за действующим лицом
      const focus = S.camFocus || asan;
      const z = S.zoom;
      // приём «глаза птицы» — только для сцен, целиком снятых сверху; в этой главе его нет
      // режиссёрский план: пока Асан у штабеля жердей — смотрим на него из проёма юрты
      const want = (!S.intro && !S.tele && S.step===2 && asan.position.x<1.2 && asan.position.z<1.5) ? 'yurt' : 'obs';
      if(want!==S.shot){ S.shot=want; S.cut=true; }
      doorway.visible = S.shot==='yurt'; yurt.visible = S.shot!=='yurt'; // камера внутри юрты: снаружи её стенки не нужны fg.visible = S.shot!=='yurt' && !S.tele;
      if(S.intro){ introShot(dt); }
      else if(S.shot==='yurt'){
        camera.position.copy(YURT_SHOT.pos); camera.position.y += Math.sin(t*.4)*.02;
        camera.fov=YURT_SHOT.fov; camera.updateProjectionMatrix();
        tmp.set(lerp(YURT_SHOT.look.x, asan.position.x, .35), .9, lerp(YURT_SHOT.look.z, asan.position.z, .5));
        if(S.cut){ S.yLook=tmp.clone(); S.cut=false; } else S.yLook.lerp(tmp, 1-Math.pow(.1,dt));
        camera.lookAt(S.yLook);
        const fp=flapGeo.attributes.position; for(let i=0;i<fp.count;i++){ const by=flapBase[i*3+1], k=(.75-by)/1.5; fp.setZ(i, Math.sin(t*2.1+by*3)*.07*k + Math.sin(t*3.3+flapBase[i*3]*4)*.03*k); } fp.needsUpdate=true; flapGeo.computeVertexNormals();
      }
      else if(S.cam==='obs' || S.tele){
        if(S.cut){ S.cut=false; camera.position.copy(OBS.pos); }
        // подглядываем из травы: широкий план двора, камера чуть дышит и ведёт героя
        const portrait = camera.aspect<1 ? 1.75 : 1;
        const fov = (S.tele ? 16 : 26 + z*12) * portrait;
        fg.scale.x = clamp(camera.aspect/1.78,.3,1);
        camera.fov = lerp(camera.fov, fov, 1-Math.pow(.05,dt)); camera.updateProjectionMatrix();
        tmp.copy(OBS.pos); tmp.x += Math.sin(t*.23)*.25 + (S.tele? 4:0); tmp.y += Math.sin(t*.31)*.08;
        camera.position.lerp(tmp, 1-Math.pow(.05,dt));
        const lx = lerp(OBS.look.x, focus.position.x, S.tele?.85:.45), lz = lerp(OBS.look.z, focus.position.z, S.tele?.85:.45);
        S.lookAt = S.lookAt || new THREE.Vector3(lx,1,lz); S.lookAt.lerp(tmp.set(lx,1.0,lz), 1-Math.pow(.08,dt));
        camera.lookAt(S.lookAt);
      } else {
        camera.fov = lerp(camera.fov, 45, 1-Math.pow(.05,dt)); camera.updateProjectionMatrix();
        tmp.set(focus.position.x, 14*z+1.5, focus.position.z + 11*z + 1);
        camera.position.lerp(tmp, 1-Math.pow(.02,dt));
        camera.lookAt(focus.position.x, 0.8, focus.position.z);
      }
      // трава у объектива колышется, жук ползёт, суслик встаёт столбиком
      fgBlades.forEach(b=>{ b.rotation.z = b.userData.base + Math.sin(t*1.6+b.userData.ph)*.06; });
      beetle.userData.t += dt*.06; const bt=(Math.sin(beetle.userData.t*2)+1)/2; beetle.position.set(0,.15+bt*.45,.012);
      suslik.position.y = Math.max(0, Math.sin(t*.5))>.3 ? 0 : -.35; suslik.rotation.y = Math.sin(t*.9)*.8;
      crow.rotation.y = Math.sin(t*.4)*1.2;
      sun.position.set(asan.position.x+30, 18, asan.position.z+8); sun.target.position.copy(asan.position);
      // подсказка действия
      const near = (!S.busy && !dlgOpen) ? nearestInteract(asan.position, 2.2) : null;
      const pr=$('prompt');
      if(near){ tmp.copy(near.pos); tmp.y=2.4; tmp.project(camera); pr.style.display='block'; pr.style.left=((tmp.x+1)/2*innerWidth)+'px'; pr.style.top=((1-tmp.y)/2*innerHeight)+'px'; pr.textContent=(isTouch?'':'[E] ')+near.label; S.near=near; }
      else { pr.style.display='none'; S.near=null; }
    },
    S,
    onKey(code, down){ if(down && code==='KeyE' && S.near && !S.busy && !dlgOpen) S.near.act(); },
    act(){ if(S.near && !S.busy && !dlgOpen) S.near.act(); },
    async begin(){
      setObj(CH,'');
      await showCard(DAT.card.small, DAT.card.big, DAT.card.text, 'Начать');
      S.intro={t:0}; cine(true);
      await fadeTo(0,2600); await wait(7200);
      S.intro=null; S.lookAt=null; cine(false);
      S.busy=false; S.step=1; setObj(CH, DAT.objectives.talk);
    }
  };
  return sc;
}
