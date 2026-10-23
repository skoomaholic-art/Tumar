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

  // --- аул вокруг: зимовки соседей, кошара, колодец-журавль у Жумабаевых, контора колхоза с флагом, столбы вдоль дороги ---
  // всё дальше 25 м и мимо коридора, по которому скачет нарочный (x≈−8…20, z<0)
  { const adobe=M(0x9a8466), adobeD=M(0x7e6a50), roofM=M(0x6e5e46), felt=M(0xcfc4ac), woodM=M(0x5e4834), hayM=M(0xb8a060);
    const clear=(x,z)=> !(x>-10 && x<22 && z<2) && Math.hypot(x,z)>24;
    const smokeT=(()=>{ const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'); const gr=g.createRadialGradient(16,16,1,16,16,15); gr.addColorStop(0,'rgba(200,196,186,.55)'); gr.addColorStop(1,'rgba(200,196,186,0)'); g.fillStyle=gr; g.fillRect(0,0,32,32); return new THREE.CanvasTexture(c); })();
    const smoke=(x,y,z)=>{ for(let i=0;i<4;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeT,transparent:true,depthWrite:false,opacity:.7-i*.14})); sp.position.set(x-i*.9,y+i*1.1,z+i*.3); sp.scale.setScalar(1.2+i*.9); scene.add(sp); } };
    const zimovka=(x,z,ry,big)=>{ const g=new THREE.Group();
      const w=new THREE.Mesh(new THREE.BoxGeometry(big?8:6,2.4,4.4),adobe); w.position.y=1.2; g.add(w);
      const rf=new THREE.Mesh(new THREE.BoxGeometry(big?8.6:6.6,.35,5),roofM); rf.position.y=2.55; g.add(rf);
      const d=new THREE.Mesh(new THREE.BoxGeometry(.9,1.7,.08),M(0x3a2c1e)); d.position.set(1,.85,2.22); g.add(d);
      const wi=new THREE.Mesh(new THREE.BoxGeometry(.7,.55,.08),M(0x2a2a28)); wi.position.set(-1.6,1.5,2.22); g.add(wi);
      const ch=new THREE.Mesh(new THREE.BoxGeometry(.5,.8,.5),adobeD); ch.position.set(-2,3,-.8); g.add(ch);
      // дувал из самана и сарай рядом
      const sh=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.8,3),adobeD); sh.position.set(big?6:5,.9,-.4); g.add(sh);
      const shr=new THREE.Mesh(new THREE.BoxGeometry(3.8,.25,3.4),roofM); shr.position.set(big?6:5,1.9,-.4); g.add(shr);
      const hay=new THREE.Mesh(new THREE.SphereGeometry(1.4,10,6,0,Math.PI*2,0,Math.PI/2),hayM); hay.scale.set(1.2,.9,1); hay.position.set(big?6:5,1.95,-.4); g.add(hay);
      for(let i=0;i<6;i++){ const pst=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,1.2,5),woodM); pst.position.set(-3.5+i*1.4,.6,5.5); g.add(pst); }
      const rl=new THREE.Mesh(new THREE.BoxGeometry(7.2,.07,.07),woodM); rl.position.set(0,.95,5.5); g.add(rl);
      g.position.set(x,0,z); g.rotation.y=ry; scene.add(shadowAll(g));
      const cw=new THREE.Vector3(-2,3.6,-.8).applyAxisAngle(new THREE.Vector3(0,1,0),ry).add(g.position); smoke(cw.x,cw.y,cw.z); };
    const yurt2=(x,z)=>{ const g=new THREE.Group(); const yw=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,1.5,16),felt); yw.position.y=.75; const yr=new THREE.Mesh(new THREE.ConeGeometry(2.6,1.3,16),felt); yr.position.y=2.1; const bd=new THREE.Mesh(new THREE.CylinderGeometry(2.42,2.42,.16,16),M(0x8e2a20)); bd.position.y=1.3; g.add(yw,yr,bd); g.position.set(x,0,z); scene.add(shadowAll(g)); };
    const spots=[[-38,-14,.3,1],[-52,6,-.2,0],[-30,28,1.2,0],[-62,-30,.1,0],[34,30,-.8,1],[48,8,-1.4,0],[-20,46,2.6,0],[38,-34,-1.2,0],[60,-12,-1.6,0],[-44,-46,.5,0]];
    spots.forEach(([x,z,r,b])=>{ if(clear(x,z)) zimovka(x,z,r,b); });
    [[-46,-2],[-24,36],[42,20],[-58,-20],[52,-26]].forEach(([x,z])=>{ if(clear(x,z)) yurt2(x,z); });
    // кошара колхоза: длинный низкий сарай
    const ksh=new THREE.Mesh(new THREE.BoxGeometry(22,2,6),adobeD); ksh.position.set(-70,1,24); ksh.rotation.y=.2; scene.add(shadowAll(ksh));
    const kshr=new THREE.Mesh(new THREE.BoxGeometry(22.6,.4,6.8),roofM); kshr.position.set(-70,2.15,24); kshr.rotation.y=.2; scene.add(shadowAll(kshr));
    // колодец-журавль у зимовки Жумабаевых
    const well=new THREE.Group(); const ring=new THREE.Mesh(new THREE.CylinderGeometry(.7,.75,.8,10,1,true),M(0x6a5a44)); ring.material.side=THREE.DoubleSide; ring.position.y=.4; well.add(ring);
    const fork=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,3.2,6),woodM); fork.position.set(1.6,1.6,0); well.add(fork);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,7,6),woodM); beam.position.set(1.6,3.1,0); beam.rotation.z=1.2; well.add(beam);
    const rope=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,2.4,4),woodM); rope.position.set(-1.2,2.5,0); well.add(rope);
    well.position.set(-30,0,-24); scene.add(shadowAll(well));
    // контора колхоза с красным флагом — единственное красное вдали, кроме полосы на юртах
    const kont=new THREE.Group(); const kw=new THREE.Mesh(new THREE.BoxGeometry(9,3,5),M(0xb0a084)); kw.position.y=1.5; const kr=new THREE.Mesh(new THREE.CylinderGeometry(.01,5.6,2,4,1),roofM); kr.rotation.y=Math.PI/4; kr.scale.set(1.25,1,.75); kr.position.y=4; kont.add(kw,kr);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,4.5,5),woodM); pole.position.set(4.8,2.25,2.8); const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.9),new THREE.MeshLambertMaterial({color:0xa8281e,side:THREE.DoubleSide})); flag.position.set(5.5,4.1,2.8); kont.add(pole,flag);
    kont.position.set(44,0,-52); kont.rotation.y=-.5; scene.add(shadowAll(kont));
    // телеграфные столбы вдоль дороги на Акмолинск
    for(let i=0;i<14;i++){ const x=-20-i*16, z=-60+i*3; const tp=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,5,5),woodM); tp.position.set(x,2.5,z); const cr=new THREE.Mesh(new THREE.BoxGeometry(1.2,.08,.08),woodM); cr.position.set(x,4.6,z); scene.add(tp,cr); }
    // жизнь аула: коровы на выпасе, конь у коновязи, соседи у своих зимовок
    const cowM=[M(0x5a4636),M(0x7a6a58),M(0x3a3028)];
    for(let i=0;i<5;i++){ const c=new THREE.Group(); const bd=new THREE.Mesh(new THREE.BoxGeometry(1.5,.75,.6),cowM[i%3]); bd.position.y=.85; const hd=new THREE.Mesh(new THREE.BoxGeometry(.45,.4,.35),cowM[i%3]); hd.position.set(.9,.75,0); c.add(bd,hd);
      for(const [lx,lz] of [[.55,.22],[.55,-.22],[-.55,.22],[-.55,-.22]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.5,.12),cowM[2]); l.position.set(lx,.25,lz); c.add(l); }
      c.position.set(-60+rand(-12,12),0,40+rand(-8,8)); c.rotation.y=rand(0,6); scene.add(shadowAll(c)); }
    if(typeof makeHorse==='function'){ const hz=makeHorse(0x5a3a26); hz.position.set(-36,0,-9); hz.rotation.y=1.2; scene.add(shadowAll(hz)); const hp=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,1.3,5),woodM); hp.position.set(-34.6,.65,-8.2); scene.add(hp); }
    for(const [x,z,ry,coat,hat] of [[-34,-11,1.6,0x4a3a2a,'tymak'],[-49,9,2.4,0x5a4636,'scarf'],[31,27,-1,0x4e4030,'borik']]){ const v=makePerson({coat,hat}); v.position.set(x,0,z); v.rotation.y=ry; scene.add(shadowAll(v)); }
    // кладбище-мазар на дальнем бугре
    const maz=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2,2.4,8),M(0x9a8a6c)); maz.position.set(-90,1.2,-70); const mazd=new THREE.Mesh(new THREE.SphereGeometry(1.6,10,6,0,Math.PI*2,0,Math.PI/2),M(0x8a7a5e)); mazd.position.set(-90,2.4,-70); scene.add(maz,mazd);
  }

  // --- второй план-«наблюдатель»: изнутри юрты, через открытую дверь ---
  // Юрта стоит дверью на восток, во двор. Внутри: решётка-кереге, красные уыки, жүк на сундуке,
  // домбра на решётке, очаг. В проёме — тканевый полог: им закрывают дверь, и он ходит на ветру.
  const YC = new THREE.Vector3(-15,0,-3), YR = 2.4, DOOR_W = .95, DOOR_H = 1.5, DX = YC.x + YR + .03;
  const YURT_SHOT = { pos:new THREE.Vector3(-14.9,1.05,-3.12), look:new THREE.Vector3(-1.5,.9,-2.4), fov:50 };
  const canvasTex = (w,h,draw,rx=1,ry=1)=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; draw(cv.getContext('2d'),w,h); const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); return t; };
  // кереге: тёмный войлок за светлыми перекрещенными планками, в узлах — ремешки
  const keregeTex = canvasTex(128,128,(x,w,h)=>{ x.fillStyle='#241a12'; x.fillRect(0,0,w,h);
    x.strokeStyle='#8f6c42'; x.lineWidth=9; for(let i=-2;i<3;i++){ x.beginPath(); x.moveTo(i*64,0); x.lineTo(i*64+128,128); x.stroke(); x.beginPath(); x.moveTo(i*64+128,0); x.lineTo(i*64,128); x.stroke(); }
    x.fillStyle='#4a2c18'; for(const [u,v] of [[0,0],[64,64],[128,0],[0,128],[128,128]]){ x.beginPath(); x.arc(u,v,9,0,7); x.fill(); } }, 56, 6);
  // уыки: красные жерди купола по закопчённому войлоку
  const uykTex = canvasTex(64,64,(x,w,h)=>{ x.fillStyle='#1c1511'; x.fillRect(0,0,w,h); x.fillStyle='#93412a'; x.fillRect(26,0,12,h); x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(34,0,3,h); }, 64, 1);
  // текемет на полу: валяный ковёр с «бараньими рогами»
  const rugTex = canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#6a2a1c'; x.fillRect(0,0,w,h); x.strokeStyle='#c9a46a'; x.lineWidth=10; x.strokeRect(14,14,w-28,h-28);
    x.lineWidth=7; for(let i=0;i<3;i++) for(let j=0;j<3;j++){ const cx=58+i*70, cy=58+j*70; x.beginPath(); x.arc(cx-12,cy,12,Math.PI*.1,Math.PI*1.6); x.stroke(); x.beginPath(); x.arc(cx+12,cy,12,Math.PI*1.4,Math.PI*.9,true); x.stroke(); } });
  // полог в двери: выгоревший ситец с мелким цветком
  const clothTex = canvasTex(128,256,(x,w,h)=>{ x.fillStyle='#8b4a33'; x.fillRect(0,0,w,h); x.fillStyle='#c79d6a'; for(let i=0;i<70;i++){ const u=(i*37)%w, v=(i*53)%h; x.beginPath(); x.arc(u,v,3,0,7); x.fill(); }
    x.fillStyle='rgba(40,20,10,.35)'; x.fillRect(0,0,8,h); x.fillRect(w-8,0,8,h); x.fillRect(0,h-14,w,14); });
  // снаружи: тёмный проём, косяки, порог (видны из двора)
  const yurtDoor = new THREE.Group(); scene.add(yurtDoor);
  const doorDark = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W, DOOR_H), new THREE.MeshBasicMaterial({color:0x140d08})); doorDark.rotation.y=Math.PI/2; doorDark.position.set(DX,DOOR_H/2,YC.z);
  const jambM = M(0x6a3a22);
  const j1 = new THREE.Mesh(new THREE.BoxGeometry(.1,DOOR_H+.08,.1), jambM); j1.position.set(DX,DOOR_H/2,YC.z-DOOR_W/2-.05); const j2=j1.clone(); j2.position.z=YC.z+DOOR_W/2+.05;
  const lint = new THREE.Mesh(new THREE.BoxGeometry(.12,.12,DOOR_W+.2), jambM); lint.position.set(DX,DOOR_H+.04,YC.z);
  const sill = new THREE.Mesh(new THREE.BoxGeometry(.14,.1,DOOR_W+.2), jambM); sill.position.set(DX,.05,YC.z);
  yurtDoor.add(doorDark, j1, j2, lint, sill);
  // полог: висит с левого косяка, свободный край ветер гоняет поперёк проёма
  const CL_W=.42, CL_H=1.38;
  const clothGeo = new THREE.PlaneGeometry(CL_W, CL_H, 10, 14); const clothBase = clothGeo.attributes.position.array.slice();
  const cloth = new THREE.Mesh(clothGeo, new THREE.MeshLambertMaterial({map:clothTex, side:THREE.DoubleSide, emissive:0x2a140a}));
  cloth.rotation.y = Math.PI/2; cloth.position.set(DX+.02, DOOR_H-CL_H/2-.02, YC.z-DOOR_W/2+CL_W/2); yurtDoor.add(cloth);
  function clothWind(t){
    const gust = .5+.5*Math.sin(t*.63)*Math.sin(t*.21+1.3), cp = clothGeo.attributes.position;
    for(let i=0;i<cp.count;i++){
      const x0=clothBase[i*3], y0=clothBase[i*3+1], f=(CL_W/2 - x0)/CL_W, h=(CL_H/2 - y0)/CL_H; // f: 0 у косяка → 1 у свободного края; h: 0 сверху → 1 внизу
      const free = f*f*.8 + h*.2;
      cp.setZ(i, (Math.sin(t*2.3+y0*2.6+x0*3)*.07 + Math.sin(t*4.1+y0*5)*.025 + gust*.16) * free * (.35+.65*h));
      cp.setX(i, x0 - (gust*.2 + Math.sin(t*1.7+y0*1.5)*.06) * f*f * (.3+.7*h));
      cp.setY(i, y0 + gust*.08*f*h*h);
    }
    cp.needsUpdate=true; clothGeo.computeVertexNormals();
  }
  // внутри: показываем только в этом кадре
  const yurtIn = new THREE.Group(); yurtIn.visible=false; scene.add(yurtIn);
  const gap = DOOR_W/YR;
  const wallIn = new THREE.Mesh(new THREE.CylinderGeometry(YR-.05,YR-.05,1.7,48,1,true,Math.PI/2+gap/2,Math.PI*2-gap), new THREE.MeshLambertMaterial({map:keregeTex, side:THREE.BackSide, color:0x8a8a8a}));
  wallIn.position.set(YC.x,.85,YC.z);
  const roofIn = new THREE.Mesh(new THREE.ConeGeometry(YR+.12,1.25,44,1,true), new THREE.MeshLambertMaterial({map:uykTex, side:THREE.BackSide, color:0x909090})); roofIn.position.set(YC.x,1.7+.62,YC.z);
  const shanyrak = new THREE.Mesh(new THREE.TorusGeometry(.32,.05,6,18), M(0x7a3a20)); shanyrak.rotation.x=Math.PI/2; shanyrak.position.set(YC.x,2.86,YC.z);
  const overDoor = new THREE.Mesh(new THREE.BoxGeometry(.06,.2,DOOR_W+.1), M(0x6a3a22)); overDoor.position.set(DX-.1,DOOR_H+.12,YC.z);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(YR-.1,40), new THREE.MeshLambertMaterial({map:rugTex})); rug.rotation.x=-Math.PI/2; rug.position.set(YC.x,.02,YC.z);
  // створки двери-сықырлауық распахнуты внутрь
  const leafTex = canvasTex(64,128,(x,w,h)=>{ x.fillStyle='#8a3a22'; x.fillRect(0,0,w,h); x.strokeStyle='#d0a868'; x.lineWidth=4; x.strokeRect(8,8,w-16,h-16); x.beginPath(); x.arc(w/2,h/2,12,0,7); x.stroke(); });
  const leafM = new THREE.MeshLambertMaterial({map:leafTex});
  // створки распахнуты внутрь и прижаты к решётке; β — насколько отведены от оси двери
  const LB=.95, leafL = new THREE.Mesh(new THREE.BoxGeometry(.46,DOOR_H-.04,.04), leafM), leafR = leafL.clone();
  leafL.position.set(DX-.06-Math.cos(LB)*.23, DOOR_H/2, YC.z-DOOR_W/2-.04-Math.sin(LB)*.23); leafL.rotation.y=Math.PI-LB;
  leafR.position.set(DX-.06-Math.cos(LB)*.23, DOOR_H/2, YC.z+DOOR_W/2+.04+Math.sin(LB)*.23); leafR.rotation.y=Math.PI+LB;
  // свет из двери на ковре
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(1.3,DOOR_W), new THREE.MeshBasicMaterial({color:0xfff0d0, transparent:true, opacity:.16, depthWrite:false})); spill.rotation.x=-Math.PI/2; spill.position.set(DX-.75,.03,YC.z);
  // жүк: сундук и стопка одеял у левой стены
  const onWall = (ang, r) => new THREE.Vector3(YC.x+Math.sin(ang)*r, 0, YC.z+Math.cos(ang)*r);
  const juk = new THREE.Group(); const pJ = onWall(Math.PI/2+.85, YR-.42); juk.position.copy(pJ); juk.rotation.y = Math.PI/2+.85;
  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.1,.5,.5), M(0x7a3a1e)); chest.position.y=.25; juk.add(chest);
  [0xb03a2a,0x2a4a6a,0xc9a46a,0x6a8a4a,0x9a2a3a].forEach((c,i)=>{ const q=new THREE.Mesh(new THREE.BoxGeometry(1.05-i*.03,.12,.48), M(c)); q.position.y=.56+i*.12; juk.add(q); });
  // домбра висит на кереге справа
  const dombra = new THREE.Group(); const pD = onWall(Math.PI/2-.62, YR-.12); dombra.position.set(pD.x,1.05,pD.z); dombra.rotation.y = Math.PI/2-.62+Math.PI;
  const dBody = new THREE.Mesh(new THREE.SphereGeometry(.12,10,8), M(0x9a6a36)); dBody.scale.set(1,1.45,.45);
  const dNeck = new THREE.Mesh(new THREE.BoxGeometry(.045,.6,.025), M(0x5a3a1e)); dNeck.position.y=.45;
  dombra.add(dBody,dNeck); dombra.rotation.z=.22;
  // вышитая сумка у двери слева
  const bag = new THREE.Mesh(new THREE.BoxGeometry(.24,.3,.04), M(0x8a2e22)); const pB=onWall(Math.PI/2+.42, YR-.1); bag.position.set(pB.x,1.15,pB.z); bag.rotation.y=Math.PI/2+.42;
  // очаг в центре: свет углей дрожит на решётке
  const stones = new THREE.Group(); for(let i=0;i<7;i++){ const st=new THREE.Mesh(new THREE.DodecahedronGeometry(.09),M(0x3a3632)); st.position.set(Math.cos(i*.9)*.3,.06,Math.sin(i*.9)*.3); stones.add(st); }
  const embers = new THREE.Mesh(new THREE.SphereGeometry(.16,8,4,0,Math.PI*2,0,Math.PI/2), new THREE.MeshBasicMaterial({color:0xd8602a})); embers.scale.y=.3; stones.add(embers); stones.position.set(YC.x,0,YC.z);
  yurtIn.add(wallIn, roofIn, shanyrak, overDoor, rug, leafL, leafR, spill, juk, dombra, bag, stones);
  // утро: мать у очага, чайник, кесе; сквозь шаңырақ падает столб света
  const mother = makePerson({coat:0x4a3226, hat:'scarf', scarf:0xe2dccb}); mother.position.set(YC.x+.15,-.45,YC.z+.8); mother.userData.legL.rotation.x=mother.userData.legR.rotation.x=-1.45; mother.rotation.y=Math.PI*.9;
  const kettle = new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,.2,10), M(0x5a4a3a)); kettle.position.set(YC.x+.32,.1,YC.z+.2);
  const kese = new THREE.Mesh(new THREE.CylinderGeometry(.05,.035,.05,10), M(0xe8e0d0)); kese.position.set(0,-.42,.1); kese.visible=false; mother.userData.armR.add(kese);
  const dastarkhan = new THREE.Mesh(new THREE.CircleGeometry(.55,20), M(0xb83a2a)); dastarkhan.rotation.x=-Math.PI/2; dastarkhan.position.set(YC.x-.1,.025,YC.z-.15);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.9,.12,.8), M(0x2a4a6a)); bed.position.set(YC.x-.3,.06,YC.z-1.55);
  const sunBeam = new THREE.Mesh(new THREE.CylinderGeometry(.3,.75,2.8,14,1,true), new THREE.MeshBasicMaterial({color:0xfff2d0, transparent:true, opacity:.07, depthWrite:false, side:THREE.DoubleSide})); sunBeam.position.set(YC.x+.15,1.45,YC.z-.25); sunBeam.rotation.z=.08;
  yurtIn.add(mother, kettle, dastarkhan, bed, sunBeam);
  const hearth = new THREE.PointLight(0xff8a44, 0, 4.5, 2); hearth.position.set(YC.x,.5,YC.z); scene.add(hearth);

  // люди
  const asan = makePerson({coat:0x6e5a42, hat:'borik'}); asan.position.set(-2,0,1); scene.add(asan);
  const father = makePerson({coat:0x4a3a2a, hat:'tymak', beard:true}); father.position.set(3.2,0,6.3); father.rotation.y = Math.PI; scene.add(father);
  // Күләш всё утро играет в асыки у юрты и видит всё со стороны
  const kulash = makePerson({coat:0x7a6a50, hat:'scarf', scale:.68}); kulash.position.set(-11.3,-.32,.4); kulash.rotation.y=Math.PI/2+.3; scene.add(kulash);
  const asyks=[]; for(let i=0;i<5;i++){ const a=new THREE.Mesh(new THREE.BoxGeometry(.06,.04,.045),M(0xe2d6bc)); a.position.set(-10.7+rand(-.15,.25),.02,.55+rand(-.25,.25)); a.rotation.y=rand(0,3); scene.add(a); asyks.push(a); }
  const rider = new THREE.Group(); // всадник на коне
  const horse = makeHorse();
  const rman = makePerson({coat:0x5c5a3a, hat:'pilotka', scale:.9}); rman.position.y=1.1; rman.userData.legL.rotation.x=-1.2; rman.userData.legR.rotation.x=-1.2;
  // планшет на ремне слева и кобура справа: когда он потянется к поясу, непонятно, за чем
  const mapCase=new THREE.Mesh(new THREE.BoxGeometry(.06,.34,.28),M(0x5a3a22)); mapCase.position.set(-.33,.82,.04); rman.add(mapCase);
  const holster=new THREE.Mesh(new THREE.BoxGeometry(.07,.22,.12),M(0x2a1e14)); holster.position.set(.33,.9,-.06); rman.add(holster);
  rman.userData.carry=true;
  rider.add(horse, rman); scene.add(rider);
  // повестка: лист в руке нарочного, потом — у Асана
  const paperM=new THREE.Mesh(new THREE.PlaneGeometry(.21,.3),new THREE.MeshLambertMaterial({color:0xece4d0,side:THREE.DoubleSide,emissive:0x2a2620}));
  // пыль из-под копыт
  const dustM=[]; for(let i=0;i<26;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color:0xb59a74,transparent:true,depthWrite:false,opacity:0})); sp.userData.life=0; scene.add(sp); dustM.push(sp); }
  let dustI=0, dustT=0;
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
  listen(canvas,'pointerdown', pointerGround);
  // масштаб колесом и щипком
  listen(canvas,'wheel', e=>{ S.zoom = clamp(S.zoom + Math.sign(e.deltaY)*.1, .45, 1.7); }, {passive:true});
  const toggleCam=()=>{ S.cam = S.cam==='obs' ? 'top' : 'obs'; fg.visible = S.cam==='obs'; toast(S.cam==='obs' ? 'Ракурс: из травы' : 'Ракурс: сверху'); };
  let pinch=null;
  listen(canvas,'touchmove', e=>{ if(e.touches.length===2){ const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); if(pinch) S.zoom=clamp(S.zoom*(pinch/d),.45,1.7); pinch=d; } }, {passive:true});
  listen(canvas,'touchend', ()=>pinch=null);

  // крючки, которые сценарий главы вызывает по имени
  const run = makeRunner({
    paper(){ sfx.paper(); },
    showDoc,
    async kulashRuns(){ setShot('kulashRun'); S.look.asan=kulash; S.look.father=kulash; S.kulashGo=true; await until(()=>!S.kulashGo); S.look.kulash=asan; setShot('three'); },
    cut(name){ setShot(name); },
    async sleep(){ mShot('sleep'); await gwait(2.4); },
    async teaOffer(){ mShot('mother'); mother.userData.armR.rotation.x=-1.2; kese.visible=true; sfx.wood && tone({f:520,dur:.1,gain:.03}); await gwait(1.6); },
    async sitTea(){ asan.rotation.set(0,Math.atan2(mother.position.x-(YC.x-.25),mother.position.z-(YC.z-.75)),0); asan.position.set(YC.x-.25,-.45,YC.z-.75); asan.userData.legL.rotation.x=asan.userData.legR.rotation.x=-1.45;
      kese.visible=false; asan.userData.armR.rotation.x=asan.userData.armL.rotation.x=-1.1; mother.userData.armR.rotation.x=0; mShot('tea'); await gwait(2.2); },
    async teaLeft(){ mother.userData.armR.rotation.x=-.4; await gwait(1.4); },
    async doorCall(){ mShot('door'); asan.userData.armR.rotation.x=asan.userData.armL.rotation.x=0; asan.userData.legL.rotation.x=asan.userData.legR.rotation.x=0; await gwait(1.8); },
    // ремарки — показать, а не рассказать
    async holdShot(sec=2.4){ closeDlg(); await gwait(sec); },
    async fatherLooksAway(){ closeDlg(); father.lookAt(40,0,30); await gwait(2.2); },
    fatherWatches(){ S.look && (S.look.father=rman); },
    async signInsert(){ closeDlg(); sfx.paper(); asan.userData.armR.rotation.x=-.9; await signatureInsert(); asan.userData.armR.rotation.x=-.5; },
    async reachBag(){ await reachBag(); },
    sign(){ sfx.paper(); asan.userData.armR.rotation.x=-.9; setTimeout(()=>{ asan.userData.armR.rotation.x=-.5; },900); },
    async riderLeaves(){ await riderLeaves(); },
    async readPaper(){ setShot('paper'); S.look.father=asan; asan.userData.armR.rotation.x=-.95; asan.userData.armL.rotation.x=-.95; await gwait(1.8); }
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
    const sl = slots[S.placed]; if(S.placed<2){ sl.material = railM; shadowAll(sl); } else sl.visible=false; /* последнюю ставят вдвоём — и не успевают */ sfx.wood(); setTimeout(sfx.wood,180);
    S.placed++;
    setObj(CH, fillObj(DAT.objectives.bring,{n:S.placed}));
    if(S.placed===1){ S.busy=true; faceEach(asan,father); await run(DAT.scripts.pole_1); closeDlg(); S.busy=false; }
    if(S.placed===2){ await fatherStory(); }
    if(S.placed===2){ setObj(CH, DAT.objectives.last); }
    if(S.placed===3) await riderArrives();
  }
  async function fatherStory(){
    S.busy=true; faceEach(asan,father); father.lookAt(40,0,30);
    await run(DAT.scripts.father_story);
    closeDlg(); S.busy=false;
  }
  // ================= РЕЖИССЁР: приезд нарочного =================
  // Монтаж по Куросаве: в сцену входим шторкой, внутри сцены — жёсткие склейки, планы держим долго.
  const gwait = sec => { const t0=S.clock; return until(()=>S.clock-t0>=sec); };
  const until = (f, max=120000) => new Promise(r=>{ const t0=performance.now(); const h=setInterval(()=>{ if(f()||performance.now()-t0>max){ clearInterval(h); r(); } },50); });
  const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
  function turnTo(o, x, z, dt, rate=2.5){ const want=Math.atan2(x-o.position.x, z-o.position.z); o.rotation.y += wrapA(want-o.rotation.y)*Math.min(1,dt*rate); }
  const DIR = { shot:null, t:0, fresh:false }; S.dir = DIR;
  function setShot(name){ DIR.shot=name; DIR.t=0; DIR.fresh=true; }
  const RS = { path:[], v:0, vT:0 };              // всадник: точки пути, скорость, нужная скорость
  const H = new THREE.Vector3(6,0,5.75);           // где отец и сын ставят последнюю жердь
  const W1 = new THREE.Vector3(-.4,0,-2.3), W2 = new THREE.Vector3(-.6,0,6.6), STOP = new THREE.Vector3(2.9,0,7.7);
  let beam=null;
  function stageWork(){
    // последняя жердь: отец и сын держат её вдвоём у ближней стороны загона, спиной к нам
    asan.position.set(H.x-.8,0,H.z); father.position.set(H.x+.8,0,H.z); asan.rotation.y=father.rotation.y=Math.PI;
    for(const p of [asan,father]){ p.userData.carry=true; p.userData.armL.rotation.x=p.userData.armR.rotation.x=-1.25; p.userData.legL.rotation.x=p.userData.legR.rotation.x=0; }
    beam = new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2,6), railM); beam.rotation.z=Math.PI/2; beam.position.set(H.x,1.18,H.z-.45); scene.add(shadowAll(beam));
    rider.position.set(6.5,0,-74); rider.rotation.y=Math.PI*0; RS.path=[W1,W2,STOP]; RS.v=RS.vT=2.3;
    S.look={ asan:null, father:null, kulash:null }; S.beamDown=0;
  }
  function hoofLoop(){ const h=setInterval(()=>{ if(!S.seq){ clearInterval(h); return; } if(RS.v>.6) sfx.hooves(); }, 1450); }
  async function riderArrives(){
    S.busy=true; S.target=null; S.seq=true; $('prompt').style.display='none';
    const w = wipe(1400);              // шторка: из игры — в сцену
    stageWork(); setShot('backs'); cine(true);
    await w; hoofLoop();
    await gwait(3.4); S.asanNotice=true;          // сначала замечает сын
    await gwait(1.7); S.fatherNotice=true;        // потом отец
    await gwait(4.6);
    setShot('behind'); RS.vT=4.2; gwait(2.2).then(()=>{ RS.vT=7.2; });
    await until(()=>rider.position.distanceTo(W1)<17 || RS.path[0]!==W1 || DIR.t>10);
    setShot('wide'); S.kulashUp=true; S.look.asan=rider; S.look.father=rider; S.look.kulash=rider;
    await until(()=>!RS.path.length && RS.v<.25); await gwait(.9);
    setShot('fence'); await dismount();
    await run(DAT.scripts.rider);
    closeDlg();
    // вечер наступает шторкой: время прошло
    const w2 = wipe(1600, 'left');
    S.seq=false; DIR.shot=null; S.cut=true; cine(false); S.lookAt=null;
    asan.userData.carry=false; father.userData.carry=false; father.userData.armL.rotation.x=father.userData.armR.rotation.x=0;
    asan.remove(paperM); kulash.position.set(asan.position.x-.9,0,asan.position.z+.7);
    S.evening=.55; S.step=4; setObj(CH, DAT.objectives.evening);
    await w2; S.busy=false;
  }
  async function dismount(){
    const left = new THREE.Vector3(Math.cos(rider.rotation.y),0,-Math.sin(rider.rotation.y)); // левый бок коня
    const from = new THREE.Vector3(); rman.getWorldPosition(from); scene.attach(rman);
    const to = rider.position.clone().addScaledVector(left,.9);
    const T=1.3, t0=S.clock;
    await until(()=>{ const k=Math.min(1,(S.clock-t0)/T), e=k*k*(3-2*k);
      rman.position.set(lerp(from.x,to.x,e), lerp(from.y,0,e)+Math.sin(e*Math.PI)*.18, lerp(from.z,to.z,e));
      if(k>.55){ rman.userData.legL.rotation.x=rman.userData.legR.rotation.x=lerp(-1.2,0,(k-.55)/.45); }
      return k>=1; });
    sfx.step(); S.rmanWalk = new THREE.Vector3().copy(asan.position).lerp(father.position,.25).add(new THREE.Vector3(-1.1,0,1.25));
    await until(()=>!S.rmanWalk); turnToNow(rman, asan);
    S.look.asan=rman; S.look.father=rman; setShot('call'); await gwait(.7);
  }
  function turnToNow(o, b){ o.rotation.y=Math.atan2(b.position.x-o.position.x, b.position.z-o.position.z); }
  async function reachBag(){
    // рука идёт к поясу — к кобуре или к сумке? Отец делает полшага вперёд, заслоняя сына
    setShot('hand'); S.fatherGuard=true;
    const u=rman.userData; const t0=S.clock;
    await until(()=>{ const k=Math.min(1,(S.clock-t0)/1.5); u.armR.rotation.x=lerp(0,-.25,k); u.armR.rotation.z=lerp(0,.55,k); return k>=1; });
    await gwait(.5); sfx.paper(); paperM.position.set(0,-.42,.12); paperM.rotation.set(-.3,0,0); u.armR.add(paperM);
    const t1=S.clock;
    await until(()=>{ const k=Math.min(1,(S.clock-t1)/.7); u.armR.rotation.x=lerp(-.25,-1.25,k); u.armR.rotation.z=lerp(.55,0,k); return k>=1; });
    S.fatherGuard=false; setShot('ots');
  }
  async function riderLeaves(){
    // лист уходит Асану, нарочный садится и уезжает; долгий план вдогонку
    asan.userData.armR.add(paperM); paperM.position.set(0,-.42,.12); rman.userData.armR.rotation.x=0;
    S.rmanWalk = rider.position.clone().add(new THREE.Vector3(Math.cos(rider.rotation.y),0,-Math.sin(rider.rotation.y)).multiplyScalar(.9));
    setShot('leave'); await until(()=>!S.rmanWalk);
    const from=rman.position.clone(), t0=S.clock;
    await until(()=>{ const k=Math.min(1,(S.clock-t0)/.9); rman.position.set(lerp(from.x,rider.position.x,k), lerp(0,1.1,k), lerp(from.z,rider.position.z,k)); rman.userData.legL.rotation.x=rman.userData.legR.rotation.x=-1.2*k; return k>=1; });
    rider.attach(rman); rman.position.set(0,1.1,0); rman.rotation.set(0,0,0);
    RS.path=[new THREE.Vector3(-2.5,0,9.8), new THREE.Vector3(-22,0,14), new THREE.Vector3(-95,0,30)]; RS.vT=3; gwait(1.2).then(()=>{ RS.vT=7; });
    S.look.asan=rider; S.look.father=rider; S.look.kulash=rider;
    await gwait(7); RS.path=[]; RS.v=RS.vT=0; rider.visible=false;
  }
  // планы сцены: каждый ставит камеру сам, dt — время кадра, k — время плана
  const wp = o => o.getWorldPosition(new THREE.Vector3());
  const flat = v => v.setY(0).normalize(), sideOf = d => new THREE.Vector3(d.z,0,-d.x);
  const SHOTS = {
    // спины отца и сына, медленный наезд; вдали между ними — маленький всадник
    backs(k){ const e=Math.min(1,k/14); camera.fov=26; camera.position.set(H.x+Math.sin(k*.2)*.04, 1.55-e*.06, lerp(H.z+4.7, H.z+2.25, e*e*(3-2*e)));
      return tmp.set(lerp(H.x, rider.position.x, .35), 1.25, H.z-30); },
    // за всадником полубоком: впереди юрта, дом, загон и люди — растут с каждым шагом
    behind(k){ const f=new THREE.Vector3(Math.sin(rider.rotation.y),0,Math.cos(rider.rotation.y)), sd=sideOf(f);
      camera.fov=34; tmp.copy(rider.position).addScaledVector(f,-6.5).addScaledVector(sd,-2.6); tmp.y=2.5+Math.sin(k*6)*.03;
      if(DIR.fresh) camera.position.copy(tmp); else camera.position.lerp(tmp, .12); return rider.position.clone().addScaledVector(f,16).setY(1); },
    // общий план из травы: он подлетает к самому загону
    wide(k){ camera.fov=34; camera.position.set(-5.5,1.0,16.5); return rider.position.clone().lerp(H,.45).setY(1.1); },
    // сквозь жерди загона: нарочный слезает с коня
    fence(k){ camera.fov=40; camera.position.set(8.5,1.3,3.7); return wp(rman).lerp(H,.35).setY(1.25); },
    // окрик: из-за спин отца и сына, нарочный во весь рост лицом к нам; голова — в верхней трети, над репликой
    call(k){ const p=wp(rman), mid=asan.position.clone().lerp(father.position,.5), d=flat(mid.clone().sub(p));
      camera.fov=30; camera.position.copy(mid).addScaledVector(d,4.2-Math.min(.4,k*.06)).setY(2.45); return p.setY(.95); },
    // рука к поясу — крупнее, с того же места
    hand(k){ const p=wp(rman), d=flat(asan.position.clone().sub(p)), sd=sideOf(d);
      camera.fov=32; camera.position.copy(p).addScaledVector(d,.8).addScaledVector(sd,2.6).setY(1.15); return p.setY(1.05); },
    // через плечо Асана — на нарочного
    ots(k){ const p=wp(rman), d=flat(asan.position.clone().sub(p)), sd=sideOf(d);
      camera.fov=30; camera.position.copy(asan.position).addScaledVector(d,2.4).addScaledVector(sd,.9).setY(2.0); return p.setY(1.6); },
    // обратная: через плечо нарочного — на отца и сына
    rev(k){ const p=wp(rman), mid=asan.position.clone().lerp(father.position,.4), d=flat(p.clone().sub(mid)), sd=sideOf(d);
      camera.fov=30; camera.position.copy(p).addScaledVector(d,1.6).addScaledVector(sd,-.7).setY(1.9); return mid.setY(1.5); },
    // глазами Күләш: от юрты, из-за её плеча, длинным объективом
    kulash(k){ const mid=asan.position.clone().lerp(wp(rman),.5), d=flat(mid.clone().sub(kulash.position)), sd=sideOf(d);
      camera.fov=24; camera.position.copy(kulash.position).addScaledVector(d,-.9).addScaledVector(sd,-.4).setY(1.15+Math.sin(k*.9)*.01); return mid.setY(1.1); },
    // подпись: сбоку, двое над листом
    sign(k){ const p=wp(rman), mid=p.clone().lerp(asan.position,.5), sd=sideOf(flat(p.clone().sub(asan.position)));
      camera.fov=28; camera.position.copy(mid).addScaledVector(sd,4.6).setY(1.55); return mid.setY(1.25); },
    // уезжает: низко за спинами, длинный объектив, фигура тает в степи
    leave(k){ camera.fov = lerp(30,20,Math.min(1,k/6)); camera.position.set(H.x+3.2,1.45,H.z+1.6); return rider.position.clone().lerp(H,Math.max(0,.4-k*.06)).setY(1.2); },
    // Асан смотрит в лист и не может прочесть
    paper(k){ const d=new THREE.Vector3(Math.sin(asan.rotation.y),0,Math.cos(asan.rotation.y));
      camera.fov=34; camera.position.copy(asan.position).addScaledVector(d,-1.7).addScaledVector(sideOf(d),-.75).setY(2.55); return asan.position.clone().addScaledVector(d,.55).setY(1.0); },
    // Күләш бежит от юрты: из-за спин отца и сына
    kulashRun(k){ const mid=asan.position.clone().lerp(father.position,.5), d=flat(mid.clone().sub(kulash.position));
      camera.fov=30; camera.position.copy(mid).addScaledVector(d,4.2).addScaledVector(sideOf(d),1.2).setY(2.1); return kulash.position.clone().setY(.9); },
    // трое вместе
    three(k){ const c=asan.position.clone().add(father.position).add(kulash.position).multiplyScalar(1/3);
      camera.fov=32; camera.position.set(c.x+1.6, 1.45, c.z+5.2); return c.setY(1.05); }
  };
  function directCamera(dt, t){
    const k = DIR.t; const look = SHOTS[DIR.shot](k, dt);
    camera.updateProjectionMatrix();
    if(DIR.fresh || !S.dirLook){ S.dirLook = look.clone(); DIR.fresh=false; } else S.dirLook.lerp(look, 1-Math.pow(.15,dt));
    camera.lookAt(S.dirLook);
    fg.visible = DIR.shot==='wide' || DIR.shot==='leave' || DIR.shot==='kulash';
    DIR.t += dt;
  }
  function seqUpdate(dt, t){
    // всадник по точкам: разгон, на последней — плавная остановка
    RS.v += clamp(RS.vT-RS.v, -dt*3, dt*2.2);
    if(RS.path.length){ const tg=RS.path[0], dx=tg.x-rider.position.x, dz=tg.z-rider.position.z, dd=Math.hypot(dx,dz);
      const last = RS.path.length===1 && S.seq && DIR.shot!=='leave' && !S.leaving;
      const v = last ? Math.min(RS.v, dd*1.3+.15) : RS.v;
      if(dd < (last?.08:1.2)){ RS.path.shift(); if(!RS.path.length){ RS.v=RS.vT=0; } }
      else { const st=Math.min(dd, v*dt); rider.position.x+=dx/dd*st; rider.position.z+=dz/dd*st; rider.rotation.y += wrapA(Math.atan2(dx,dz)-rider.rotation.y)*Math.min(1,dt*3); }
      S.rv = v; } else S.rv = 0;
    const fq = 3+S.rv*1.15, amp = Math.min(.7,.2+S.rv*.08);
    if(S.rv>.1) horse.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*fq+(i%2?Math.PI:0)+(i>1?1:0))*amp); else horse.userData.legs.forEach(l=>l.rotation.x*=.9);
    rider.position.y = S.rv>3.5 ? Math.abs(Math.sin(t*fq))*.1 : 0;
    // пыль из-под копыт на рыси
    dustT += dt; if(S.rv>2.8 && dustT>.07){ dustT=0; const d=dustM[dustI++%dustM.length]; d.userData.life=1; d.position.set(rider.position.x+rand(-.4,.4), .3, rider.position.z+rand(-.4,.4)); }
    dustM.forEach(d=>{ if(d.userData.life>0){ d.userData.life-=dt*.7; const k=1-d.userData.life; d.position.y+=dt*.5; d.position.x+=dt*1.2; d.scale.setScalar(.6+k*2.6); d.material.opacity=Math.max(0,d.userData.life)*.5; } });
    // отец и сын бьются с жердью, потом замечают всадника и откладывают её
    if(beam){
      if(!S.asanNotice){ beam.position.y = 1.18+Math.sin(t*1.4)*.035; beam.position.z = H.z-.45+Math.sin(t*.9)*.05; beam.rotation.y = Math.sin(t*1.1)*.04; }
      else { S.beamDown=Math.min(1,S.beamDown+dt*(S.fatherNotice?.7:.25)); const b=S.beamDown;
        beam.rotation.y = (S.fatherNotice? 0 : .05); beam.rotation.x = 0; beam.rotation.z = Math.PI/2 + (S.fatherNotice?0:b*.35);
        beam.position.y = S.fatherNotice ? lerp(1.0, .08, Math.max(0,(b-.35)/.65)) : 1.18-b*.25;
        const ua=asan.userData; ua.armL.rotation.x=ua.armR.rotation.x=lerp(ua.armR.rotation.x, paperM.parent===ua.armR?ua.armR.rotation.x:0, dt*2); }
      if(S.fatherNotice){ const fa=father.userData; fa.armL.rotation.x=fa.armR.rotation.x=lerp(fa.armR.rotation.x, S.beamDown>.9?0:-.6, dt*2); }
    }
    for(const [who,o] of [['asan',asan],['father',father],['kulash',kulash]]){ const tg=S.look && S.look[who]; if(tg){ const p=new THREE.Vector3(); tg.getWorldPosition(p); turnTo(o,p.x,p.z,dt,2); } }
    if(S.fatherGuard){ tmp.copy(asan.position).lerp(rman.position,.32); tmp.x+=.35; father.position.lerp(tmp, dt*1.2); }
    // нарочный идёт пешком
    if(S.rmanWalk){ const dx=S.rmanWalk.x-rman.position.x, dz=S.rmanWalk.z-rman.position.z, dd=Math.hypot(dx,dz);
      if(dd<.08){ S.rmanWalk=null; animWalk(rman,0,dt); } else { const st=Math.min(dd,1.3*dt); rman.position.x+=dx/dd*st; rman.position.z+=dz/dd*st; rman.rotation.y=Math.atan2(dx,dz); rman.userData.carry=false; animWalk(rman,1,dt); rman.userData.carry=true; } }
    // Күләш встаёт и замирает
    if(S.kulashUp && kulash.position.y<0) kulash.position.y=Math.min(0,kulash.position.y+dt*.6);
  }
  // вставка крупным планом: строка на повестке, и Асан выводит своё имя латиницей — как учили до новых букв
  function signatureInsert(){
    return signaturePad(renderLang('Получил. Подпись:','ru'), 'Распишись сам: проведи пальцем или мышью по строке. Можно крестик, можно имя.');
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
    // рисованные кадры: дом ночью снаружи → руки матери с иглой → тумар из рук в руки
    father.position.set(-4.6,0,-2.2); father.lookAt(-4.6,0,5); asan.position.set(-3.6,0,-1.4); asan.lookAt(-4.6,0,-2.2);
    const shots = ['img/ch1_1.jpg','img/ch1_2.jpg','img/ch1_3.jpg'];
    const caps = DAT.panels.captions.map(c => c.if ? (evalCond(c.if, memory.flags) ? c.text : c.else) : c.text);
    await fadeTo(1,900);
    const page=$('page'); page.innerHTML='';
    shots.forEach((u,i)=>{ const d=document.createElement('div'); d.className='pn'; d.innerHTML=`<img class="art" src="${u}" alt=""><div class="cap top">${caps[i]}</div>`; page.appendChild(d); });
    $('panels').style.display='flex'; await fadeTo(0,700);
    const clickPanels = () => new Promise(r=>{ const h=()=>{ $('panels').removeEventListener('pointerdown',h); r(); }; $('panels').addEventListener('pointerdown',h); const k=e=>{ if(e.code==='Space'||e.code==='Enter'){ removeEventListener('keydown',k); $('panels').removeEventListener('pointerdown',h); r(); } }; addEventListener('keydown',k); });
    const cells=[...page.children];
    for(let i=0;i<cells.length;i++){ cells[i].classList.add('on'); $('pnNext').textContent = i<cells.length-1 ? 'Нажми, чтобы открыть следующий кадр' : 'Нажми, чтобы перевернуть страницу'; await wait(350); await clickPanels(); }
    await run(DAT.scripts.house_end);
    await wait(900);
    await fadeTo(1,900); $('panels').style.display='none';
    startDeparture(); // дальше в той же главе: проводы, Акмолинск, эшелон
  }
  // утро: Асан спит в юрте, мать будит и зовёт пить чай; снаружи кричит отец
  async function morningYurt(){
    S.morning={shot:'sleep'}; mShot('sleep'); cine(true);
    asan.position.set(YC.x-.3,.2,YC.z-1.55); asan.rotation.set(-Math.PI/2,0,Math.PI/2);
    await fadeTo(0,2600);
    await run(DAT.scripts.morning); closeDlg();
    // встаёт и выходит: силуэт в светлом проёме
    asan.rotation.set(0,Math.PI/2,0); asan.position.set(YC.x-.2,0,YC.z); mShot('door'); mother.userData.armR.rotation.x=0; kese.visible=false;
    const from=asan.position.clone(), to=new THREE.Vector3(DX+.9,0,YC.z), t0=S.clock||0;
    await until(()=>{ const k=Math.min(1,((S.clock||0)-t0)/2.4); asan.position.lerpVectors(from,to,k); animWalk(asan,1,.016); return k>=1; });
    await wipe(1200,'right'); S.morning=null; animWalk(asan,0,.016);
  }
  function faceEach(a,b){ a.lookAt(b.position.x,0,b.position.z); }
  // долгий план в начале главы: горы и далёкий всадник справа, потом взгляд медленно уходит к двору
  // утро в юрте: планы внутри, мягкий свет из шаңырақ и от очага
  const MORNING = {
    sleep(k){ camera.fov=42; camera.position.set(YC.x+.9,1.45-Math.min(.15,k*.02),YC.z-.35); return tmp.set(YC.x-.4,.15,YC.z-1.55); },
    mother(k){ camera.fov=42; camera.position.set(YC.x-.55,.42,YC.z-1.45); return tmp.set(mother.position.x,1.0,mother.position.z); },
    tea(k){ camera.fov=52; camera.position.set(YC.x-1.85,1.1,YC.z+.05); return tmp.set(YC.x-.05,.6,YC.z); },
    door(k){ camera.fov=44; camera.position.set(YC.x-1.7,1.0,YC.z+.15); return tmp.set(DX,.95,YC.z); }
  };
  function morningShot(dt,t){ const M2=S.morning; M2.k=(M2.k||0)+dt; const look=MORNING[M2.shot](M2.k); camera.position.y+=Math.sin(t*.5)*.006; camera.updateProjectionMatrix();
    if(M2.fresh||!M2.look){ M2.look=look.clone(); M2.fresh=false; } else M2.look.lerp(look,1-Math.pow(.2,dt)); camera.lookAt(M2.look); }
  function mShot(n){ S.morning.shot=n; S.morning.k=0; S.morning.fresh=true; }
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
      S.clock=(S.clock||0)+dt;
      // движение
      let mx=0, mz=0;
      if(!S.busy && !dlgOpen){
        [mx, mz] = moveInput();
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
      // всадник: пока идёт работа — шагом к очередной точке вдали; в сцене приезда им правит режиссёр
      if(S.seq) seqUpdate(dt,t);
      else if(rider.visible){ const tgt = RIDER_PATH[Math.min(S.placed,2)];
        const dx=tgt.x-rider.position.x, dz=tgt.z-rider.position.z, dd=Math.hypot(dx,dz);
        if(dd>.3 && S.step>=1){ const st=Math.min(dd, 1.4*dt); rider.position.x+=dx/dd*st; rider.position.z+=dz/dd*st; rider.rotation.y=Math.atan2(dx,dz);
          horse.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*5+(i%2?Math.PI:0)+(i>1?1:0))*.35); }
        else horse.userData.legs.forEach(l=>l.rotation.x*=.9); }
      if(S.kulashGo){ tmp.set(asan.position.x-.9,0,asan.position.z+.7); const dx=tmp.x-kulash.position.x, dz=tmp.z-kulash.position.z, dd=Math.hypot(dx,dz);
        if(dd<.15){ S.kulashGo=false; animWalk(kulash,0,dt); } else { const st=Math.min(dd,3.6*dt); kulash.position.x+=dx/dd*st; kulash.position.z+=dz/dd*st; kulash.position.y=0; kulash.rotation.y=Math.atan2(dx,dz); animWalk(kulash,1.4,dt); } }
      else if(!S.kulashUp){ const k=kulash.userData; k.armR.rotation.x = -.5 - Math.max(0,Math.sin(t*1.6))*1.0; k.armL.rotation.x=-.4; k.legL.rotation.x=k.legR.rotation.x=-1.3; }
      else if(!S.kulashGo && kulash.userData.legL.rotation.x<0){ const k=kulash.userData; k.legL.rotation.x=k.legR.rotation.x=Math.min(0,k.legL.rotation.x+dt*2); k.armR.rotation.x*=.9; k.armL.rotation.x*=.9; }
      // ягнята бродят
      if(S.seq){ lambs[0].position.set(.6,0,2.6); lambs[1].position.set(2.6,0,2.7); }
      lambs.forEach((l,i)=>{ if(S.seq && i<2){ l.rotation.y=-Math.PI/2+i*.5; l.children[1].position.y=.5+Math.sin(t*2+i)*.06; return; } l.position.x=clamp(l.position.x+Math.sin(t*.4+i*2)*dt*.3,-3.4,3.4); l.position.z=clamp(l.position.z+Math.cos(t*.3+i)*dt*.3,-2.4,2.4); l.rotation.y=Math.sin(t*.4+i*2)>0?0:Math.PI; });
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
      // режиссёрский план: пока Асан у штабеля жердей — смотрим на него изнутри юрты, через дверь.
      // Склейка с задержкой, чтобы кадр не дёргался на границе
      const inYurtZone = !S.intro && !S.seq && S.step===2 && asan.position.x<1.2 && asan.position.z<1.5;
      S.zoneT = (inYurtZone === (S.shot==='yurt')) ? 0 : (S.zoneT||0)+dt;
      if(S.zoneT > (inYurtZone ? .35 : .6) || !S.shot){ S.shot = inYurtZone ? 'yurt' : 'obs'; S.cut=true; S.zoneT=0; }
      yurtIn.visible = S.shot==='yurt' && !S.seq; hearth.intensity = yurtIn.visible ? 1.1+Math.sin(t*9)*.12+Math.sin(t*23)*.06 : 0;
      if(S.morning){ yurtIn.visible=true; hearth.intensity=1.1+Math.sin(t*9)*.12+Math.sin(t*23)*.06; fg.visible=false; }
      clothWind(t);
      if(!S.seq || !DIR.shot) fg.visible = S.shot!=='yurt' && !S.morning;
      if(S.morning){ morningShot(dt,t); }
      else if(S.intro){ introShot(dt); }
      else if(S.seq && DIR.shot){ directCamera(dt,t); }
      else if(S.shot==='yurt'){
        camera.position.copy(YURT_SHOT.pos); camera.position.y += Math.sin(t*.4)*.015;
        camera.fov=YURT_SHOT.fov; camera.updateProjectionMatrix();
        tmp.set(lerp(YURT_SHOT.look.x, asan.position.x, .3), .95, lerp(YURT_SHOT.look.z, asan.position.z, .45));
        if(S.cut){ S.yLook=tmp.clone(); S.cut=false; } else S.yLook.lerp(tmp, 1-Math.pow(.1,dt));
        camera.lookAt(S.yLook);
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
    wantsJoy(){ return !S.busy && !S.seq && !S.intro; },
    touchAction(){ return (!S.busy && S.near) ? S.near.label : null; },
    act(){ if(S.near && !S.busy && !dlgOpen) S.near.act(); },
    async begin(){
      setObj(CH,'');
      await showCard(DAT.card.small, DAT.card.big, DAT.card.text, 'Начать');
      await morningYurt();
      S.intro={t:0}; cine(true);
      await fadeTo(0,2600); await wait(7200);
      S.intro=null; S.lookAt=null; cine(false);
      S.busy=false; S.step=1; setObj(CH, DAT.objectives.talk);
    }
  };
  return sc;
}
