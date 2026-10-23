'use strict';
// Глава 3. Город. Сталинград, осень 1942 — март 1943.
// Письмо домой (документ + панели в ауле), ночная вылазка за «языком» (сверху, ползком, между ракетами),
// пленные на снегу и выбор с хлебом (живая картинка), гвардейское знамя (живая картинка).
// Вся вылазка снята сверху, поэтому в её конце — приём «глаза птицы»: ворона слетает с печной трубы.

function sceneCity(){
  resetCamera();
  const DAT = DATA.ch3, CH = 'Глава 3 · '+DAT.title, U = DAT.ui;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1117);
  scene.fog = new THREE.Fog(0x0d1117, 18, 85);
  const hemi = new THREE.HemisphereLight(0x66748c, 0x18140f, .34); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0x9aa8c8, .3); moon.position.set(-18,30,12); moon.castShadow = true;
  moon.shadow.mapSize.set(1024,1024); Object.assign(moon.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:90});
  scene.add(moon, moon.target);
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

  // ---------- состояние и игровые часы ----------
  const S = { phase:'intro', busy:true, clock:0, zoom:1, target:null, stepT:0, detect:0, flare:0, flareT:6, count:0,
    camH:15, camBack:9, camFocus:null, alarm:false, shot:null, shotT:0 };
  // вся постановка — во времени игры: на медленном телефоне сцена замедлится целиком, а не разъедется
  const until = (f, max=180000) => new Promise(r=>{ const t0=performance.now(); const h=setInterval(()=>{ if(f()||performance.now()-t0>max){ clearInterval(h); r(); } },50); });
  const gwait = sec => { const t0=S.clock; return until(()=>S.clock-t0>=sec); };

  // ---------- эффекты ----------
  const softTex = (rgba)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'); const gr=x.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,rgba); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); };
  const fireTex = softTex('rgba(255,236,200,1)'), smokeTex = softTex('rgba(70,66,62,.75)'), dustTex = softTex('rgba(90,80,66,.8)'), steamTex = softTex('rgba(235,240,245,.55)');
  const fx = [];
  function puff(p, tex, size, life, vy=1.5, grow=2.5, add=false){
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));
    s.position.copy(p); s.scale.setScalar(size); scene.add(s); fx.push({s,life,max:life,vy,grow,base:size});
  }
  let shake = 0;
  const tracers = [];
  const tracerM = new THREE.LineBasicMaterial({color:0xfff2c8, transparent:true, opacity:.9});
  function tracer(a,b){ const g=new THREE.BufferGeometry().setFromPoints([a.clone(),b.clone()]); const l=new THREE.Line(g,tracerM.clone()); scene.add(l); tracers.push({l,life:.08}); }
  function explode(x,z,big=1){
    puff(new THREE.Vector3(x,.6,z), fireTex, 1.8*big, .25, 1, 1, true);
    for(let i=0;i<6;i++) puff(tmp.set(x+rand(-1,1),.8+rand(0,1.5),z+rand(-1,1)), dustTex, rand(2,3.4)*big, rand(1.2,2.2), rand(2,4), 2.2);
    puff(tmp.set(x,1.5,z), smokeTex, 4*big, 3.5, 1.2, 3);
    const d = Math.hypot(asanW.position.x-x, asanW.position.z-z); shake=Math.max(shake, clamp(1.3-d/22,0,1)*big); sfx.boom();
  }
  function hitFlash(){ const h=$('hit'); h.style.opacity=1; setTimeout(()=>h.style.opacity=0, 220); shake=Math.max(shake,.4); }

  // ---------- люди: лёжа (обёртка держит направление, человек внутри лежит) ----------
  const KHAKI = 0x857a52, FELD = 0x5a5e4a;
  function lying(coat, hat, faceUp=false){
    const w=new THREE.Group(), p=makePerson({coat, hat});
    if(faceUp){ p.rotation.x=-Math.PI/2; p.position.set(0,.3,0); }      // ноги у начала обёртки, голова назад (−z)
    else { p.rotation.x=Math.PI/2; p.position.set(0,.3,-.9); }          // ничком, голова вперёд (+z)
    w.add(p); w.userData.p=p; scene.add(w); return w;
  }
  function crawlAnim(w, moving, t){ const u=w.userData.p.userData, s = moving ? Math.sin(t*7) : 0;
    u.legL.rotation.x=0; u.legR.rotation.x=0; u.legL.rotation.z = .25+s*.3; u.legR.rotation.z = -.25+s*.3;
    u.armL.rotation.x = -2.6 + s*.5; u.armR.rotation.x = -2.6 - s*.5; }

  // ================= МЕСТО 1: развалины (вылазка), в центре мира =================
  const gGeo = new THREE.PlaneGeometry(140,140,70,70); gGeo.rotateX(-Math.PI/2);
  { const col=[], pos=gGeo.attributes.position, c=new THREE.Color();
    for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i); const n=Math.sin(x*.23)*Math.cos(z*.19)+Math.sin(x*.07-z*.13)*.7;
      c.setHex(n>1.05?0x8c8e92:(n>.4?0x3c3732:(n<-.7?0x221f1c:0x2e2a26))); c.offsetHSL(0,0,rand(-.02,.02)); col.push(c.r,c.g,c.b); pos.setY(i, Math.sin(x*.4)*Math.cos(z*.3)*.12); }
    gGeo.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); gGeo.computeVertexNormals(); }
  const ground = new THREE.Mesh(gGeo, new THREE.MeshLambertMaterial({vertexColors:true})); ground.receiveShadow=true; scene.add(ground);
  const brickM = M(0x5e4c40), plasterM = M(0x77706a), rubbleM = M(0x4a443e), sootM = M(0x24201c);
  const walls=[], rubble=[], chimneys=[];
  // разрушенный дом: стены разбиты на куски с рваным верхом, часть кусков выбита
  function ruin(x,z,w,d){
    const segs=[]; const side=(x0,z0,x1,z1)=>{ const len=Math.hypot(x1-x0,z1-z0), n=Math.max(2,Math.round(len/1.6));
      for(let i=0;i<n;i++){ if(Math.random()<.28) continue; const k0=i/n, k1=(i+1)/n, h=rand(.8,4.2);
        const cx=lerp(x0,x1,(k0+k1)/2), cz=lerp(z0,z1,(k0+k1)/2), alongX=Math.abs(x1-x0)>Math.abs(z1-z0), L=len/n*.96;
        const m=new THREE.Mesh(new THREE.BoxGeometry(alongX?L:.35, h, alongX?.35:L), Math.random()<.5?brickM:plasterM); m.position.set(cx,h/2,cz); scene.add(shadowAll(m));
        walls.push({x:cx, z:cz, hw:(alongX?L:.35)/2, hd:(alongX?.35:L)/2}); } };
    side(x-w/2,z-d/2,x+w/2,z-d/2); side(x-w/2,z+d/2,x+w/2,z+d/2); side(x-w/2,z-d/2,x-w/2,z+d/2); side(x+w/2,z-d/2,x+w/2,z+d/2);
    for(let i=0;i<4;i++){ const r=rand(.5,1.1); const b=new THREE.Mesh(new THREE.DodecahedronGeometry(r), rubbleM); b.scale.y=.45; b.position.set(x+rand(-w/2,w/2),.1,z+rand(-d/2,d/2)); scene.add(shadowAll(b)); }
  }
  [[-9,22,7,6],[8,14,6,8],[-7,2,8,6],[10,-8,7,6],[-10,-18,6,7],[10,-25,5,5],[-15,8,5,5],[15,26,6,5]].forEach(a=>ruin(...a));
  // печные трубы сгоревших домов — главный силуэт этого города
  [[3,25],[-2,10],[4,-2],[-3,-12],[6,-19],[-14,-30],[15,2]].forEach(([x,z])=>{ const h=rand(4,6.5); const c=new THREE.Mesh(new THREE.BoxGeometry(.7,h,.7), sootM); c.position.set(x,h/2,z); scene.add(shadowAll(c)); chimneys.push({x,z,h}); });
  [[0,28,1.6],[-2,18,1.4],[3,8,1.8],[-1,-4,1.5],[4,-13,1.6],[-2,-24,1.4],[5.5,-31,1.2],[-4,-31.5,1.3],[1.5,16,1.1],[-4,-8,1.2],[2,-20,1]].forEach(([x,z,r])=>{
    const b=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0), rubbleM); b.scale.set(1.2,.5,1); b.position.set(x,.1,z); b.rotation.y=rand(0,3); scene.add(shadowAll(b)); rubble.push({x,z,r:r*1.2}); });
  // сгоревший танк
  { const tk=new THREE.Group(); const hull=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.1,5.6),sootM); hull.position.y=.75; const tur=new THREE.Mesh(new THREE.CylinderGeometry(1,1.1,.7,8),sootM); tur.position.set(0,1.6,-.3);
    const gun=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3,6),sootM); gun.rotation.x=Math.PI/2-.25; gun.position.set(0,1.75,1.6); tk.add(hull,tur,gun); tk.position.set(-6,0,-5); tk.rotation.y=.6; scene.add(shadowAll(tk)); walls.push({x:-6,z:-5,hw:2.2,hd:2.2}); }
  // свой окоп (юг) и немецкий пост (север)
  const trench=new THREE.Mesh(new THREE.BoxGeometry(60,.06,2.2),M(0x14110e)); trench.position.set(0,.04,36); scene.add(trench);
  for(let i=0;i<30;i++){ const sb=new THREE.Mesh(new THREE.BoxGeometry(.9,.35,.5),M(0x4e463a)); sb.position.set(-28+i*1.95,.18,34.6); scene.add(shadowAll(sb)); }
  const POST = new THREE.Vector3(2,0,-35.5);
  for(let i=0;i<9;i++){ const a=Math.PI*.15+i*Math.PI*.7/8; const sb=new THREE.Mesh(new THREE.BoxGeometry(.9,.45,.5),M(0x4a443a)); sb.position.set(POST.x+Math.cos(a)*2.2,.22,POST.z+Math.sin(a)*2.2); sb.rotation.y=-a; scene.add(shadowAll(sb)); }
  const dug=new THREE.Mesh(new THREE.BoxGeometry(2.4,.9,1.6),M(0x0c0a08)); dug.position.set(POST.x,.45,POST.z-3.4); scene.add(dug);
  for(let i=0;i<10;i++){ const pst=new THREE.Mesh(new THREE.BoxGeometry(.08,1,.08),M(0x3a3026)); pst.position.set(-12+i*2.8,.5,-29+Math.sin(i)*.4); pst.rotation.z=rand(-.2,.2); scene.add(pst); }
  // вылазка: Асан, Колесников, Сашко — ползком; немецкий часовой
  const asanW = lying(KHAKI,'pilotka'), kolW = lying(0x7a7050,'pilotka'), sashW = lying(0x80764e,'pilotka');
  const gerW = new THREE.Group(), ger = makePerson({coat:FELD, hat:'helmet'}); gerW.add(ger); scene.add(gerW); gerW.position.copy(POST);
  const ember = new THREE.Mesh(new THREE.SphereGeometry(.035,6,4), new THREE.MeshBasicMaterial({color:0xff7a30})); ember.position.set(.12,1.7,.26); ger.add(ember);
  // ракета: свет сверху, медленно опускается
  const flareLight = new THREE.PointLight(0xdfe8ff, 0, 75, 1.3); scene.add(flareLight);
  const flareSpr = new THREE.Sprite(new THREE.SpriteMaterial({map:fireTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending})); flareSpr.scale.setScalar(2.2); flareSpr.visible=false; scene.add(flareSpr);
  // ворона на трубе у своих окопов — её глазами мы и смотрели
  const crow = new THREE.Group(); { const b=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),M(0x111010)); b.scale.set(.8,.9,1.5); const bk=new THREE.Mesh(new THREE.ConeGeometry(.04,.12,4),M(0x222)); bk.rotation.x=Math.PI/2; bk.position.z=.24; crow.add(b,bk); }
  crow.position.set(3, chimneys[0].h+.15, 25); scene.add(crow);

  // ================= МЕСТО 2: блиндаж (x = −200) =================
  const DG = new THREE.Vector3(-200,0,0);
  const dugout = new THREE.Group(); dugout.position.copy(DG); scene.add(dugout);
  { const logM=M(0x4a3626), earthM=M(0x2a2018);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(6,6),earthM); floor.rotation.x=-Math.PI/2; dugout.add(floor);
    for(let i=0;i<7;i++){ const lg=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,6,7),logM); lg.rotation.z=Math.PI/2; lg.position.set(0,.15+i*.29,-2.4); dugout.add(lg); }
    for(let i=0;i<7;i++) for(const sx of [-2.6,2.6]){ const lg=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,5,7),logM); lg.rotation.x=Math.PI/2; lg.position.set(sx,.15+i*.29,0); dugout.add(lg); }
    for(let i=0;i<14;i++){ const lg=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,5.4,7),logM); lg.rotation.x=Math.PI/2; lg.position.set(-2.6+i*.4,2.15,0); dugout.add(lg); }
    const table=new THREE.Mesh(new THREE.BoxGeometry(1.5,.08,.75),M(0x5a4430)); table.position.set(0,.78,-1.35); dugout.add(table);
    for(const [lx,lz] of [[-.65,-1.65],[.65,-1.65],[-.65,-1.05],[.65,-1.05]]){ const lgg=new THREE.Mesh(new THREE.BoxGeometry(.06,.78,.06),M(0x3a2c1e)); lgg.position.set(lx,.39,lz); dugout.add(lgg); }
    const bench=new THREE.Mesh(new THREE.BoxGeometry(1.4,.08,.35),M(0x4a3826)); bench.position.set(0,.45,-.55); dugout.add(bench);
    const bunk=new THREE.Mesh(new THREE.BoxGeometry(1,.12,2.2),M(0x4a3826)); bunk.position.set(2,.5,.2); dugout.add(bunk);
    const coat=new THREE.Mesh(new THREE.BoxGeometry(.5,1.1,.12),M(0x5a5238)); coat.position.set(-1.6,1.4,-2.25); dugout.add(coat);
    for(let i=0;i<2;i++){ const rf=new THREE.Mesh(new THREE.BoxGeometry(.06,1.3,.08),M(0x3a2a1a)); rf.position.set(-2.35+i*.18,.65,-1.8); rf.rotation.z=.18; dugout.add(rf); }
    const paper=new THREE.Mesh(new THREE.PlaneGeometry(.22,.3),new THREE.MeshLambertMaterial({color:0xd8ccae})); paper.rotation.x=-Math.PI/2; paper.position.set(.1,.83,-1.2); dugout.add(paper);
  }
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.035,.04,.13,10), M(0xb08a3a)); lamp.position.set(-.45,.88,-1.45); dugout.add(lamp);
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({map:fireTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, color:0xffb060})); flame.scale.set(.12,.22,1); flame.position.set(-.45,1.0,-1.45); dugout.add(flame);
  const lampLight = new THREE.PointLight(0xffa058, 0, 7, 2); lampLight.position.set(DG.x-.45,1.1,DG.z-1.45); scene.add(lampLight);
  const asanSit = makePerson({coat:KHAKI, hat:'pilotka'}); asanSit.position.set(DG.x+.1,-.3,DG.z-.6); asanSit.rotation.y=Math.PI; asanSit.userData.armL.rotation.x=asanSit.userData.armR.rotation.x=-1.1; scene.add(asanSit);
  const kolSleep = new THREE.Group(); { const p=makePerson({coat:0x7a7050, hat:'pilotka'}); p.rotation.x=-Math.PI/2; p.position.y=.62; kolSleep.add(p); kolSleep.userData.p=p; } kolSleep.position.set(DG.x+2,0,DG.z+1.2); scene.add(kolSleep);

  const kolLetterM = (()=>{ const sh=new THREE.Shape(); sh.moveTo(-.07,-.05); sh.lineTo(.07,-.05); sh.lineTo(.07,.05); sh.lineTo(0,.0); sh.lineTo(-.07,.05); sh.closePath();
    const m=new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshLambertMaterial({color:0xd8ccae, side:THREE.DoubleSide, emissive:0x2a2418})); m.scale.setScalar(1.6); return m; })();
  // блокнот политрука на построении
  const politNote = new THREE.Mesh(new THREE.PlaneGeometry(.14,.18), new THREE.MeshLambertMaterial({color:0xe2dccb, side:THREE.DoubleSide}));

  // ================= МЕСТО 3: аул зимой (x = −400), для панелей =================
  const HM = new THREE.Vector3(-400,0,0);
  { const sn=new THREE.Mesh(new THREE.PlaneGeometry(80,80),M(0xd8d6d0)); sn.rotation.x=-Math.PI/2; sn.position.copy(HM); scene.add(sn);
    const hw=new THREE.Mesh(new THREE.BoxGeometry(7,2.8,5),M(0xb39a74)); hw.position.set(HM.x,1.4,HM.z-3); const hr=new THREE.Mesh(new THREE.BoxGeometry(7.6,.4,5.6),M(0xe2e0da)); hr.position.set(HM.x,3,HM.z-3);
    const dr=new THREE.Mesh(new THREE.BoxGeometry(1,1.9,.1),M(0x3a2c1e)); dr.position.set(HM.x+1.2,.95,HM.z-.47); scene.add(shadowAll(hw),hr,dr); }
  const mother = makePerson({coat:0x3a3028, hat:'scarf', scarf:0x8a3a2a, scale:.92}); mother.position.set(HM.x+.4,0,HM.z+.3); scene.add(mother);
  const kulashH = makePerson({coat:0x7a6a50, hat:'scarf', scale:.7}); kulashH.position.set(HM.x+1.3,0,HM.z+.5); kulashH.rotation.y=-.6; scene.add(kulashH);
  // письмо в руках матери: лист с серыми строчками и чёрными полосами цензуры
  function letterTexture(){ const cv=document.createElement('canvas'); cv.width=256; cv.height=340; const x=cv.getContext('2d');
    x.fillStyle='#d8ccae'; x.fillRect(0,0,256,340); x.strokeStyle='rgba(120,100,70,.5)'; x.beginPath(); x.moveTo(0,0); x.lineTo(256,340); x.moveTo(256,0); x.lineTo(0,340); x.stroke();
    x.fillStyle='#4a4236'; for(let i=0;i<9;i++){ const y=36+i*32, w=150+((i*53)%70); x.fillRect(24,y,w,3); x.fillRect(24+w+8,y,30,3); }
    x.fillStyle='#0c0b0a'; x.fillRect(110,36+4*32-8,120,16); if(memory.flags.letterZhum==='told') x.fillRect(40,36+2*32-8,170,16);
    return new THREE.CanvasTexture(cv); }
  const letterMesh = new THREE.Mesh(new THREE.PlaneGeometry(.34,.45), new THREE.MeshLambertMaterial({color:0xffffff, side:THREE.DoubleSide}));
  letterMesh.position.set(HM.x+.4,1.15,HM.z+.72); letterMesh.rotation.x=-.5; scene.add(letterMesh);

  // ================= МЕСТО 4: пленные на снегу (x = +300) =================
  const PR = new THREE.Vector3(300,0,0);
  { const sn=new THREE.Mesh(new THREE.PlaneGeometry(160,120,40,30),M(0xdfe0e2)); sn.rotation.x=-Math.PI/2; sn.position.copy(PR); scene.add(sn); sn.receiveShadow=true;
    // развалины вдали, в морозной дымке
    for(let i=0;i<14;i++){ const h=rand(3,10); const r=new THREE.Mesh(new THREE.BoxGeometry(rand(2,6),h,rand(1,3)),M(0x8a8c8e)); r.position.set(PR.x-40+i*6.5+rand(-2,2),h/2,PR.z-26-rand(0,10)); scene.add(r); }
    for(let i=0;i<5;i++){ const h=rand(4,6); const c=new THREE.Mesh(new THREE.BoxGeometry(.6,h,.6),M(0x6e7072)); c.position.set(PR.x-18+i*9,h/2,PR.z-14-rand(0,4)); scene.add(c); } }
  const column=[];
  for(let i=0;i<24;i++){ const p=makePerson({coat:[0x5a5e4a,0x6a6656,0x4e5244,0x7a7060][i%4], hat: i%3===0?'helmet':'scarf', scarf:[0x8a7a6a,0x6a5a4a,0x9a8a7a][i%3]});
    p.position.set(PR.x-30+(i>>1)*2.6+rand(-.3,.3), 0, PR.z-1.2+(i%2)*1.1); p.rotation.y=Math.PI/2; p.rotation.z=rand(-.06,.06); scene.add(p); column.push({p, v:rand(.5,.7), ph:rand(0,6)}); }
  const escorts=[0,1].map(i=>{ const e=makePerson({coat:0x6e6a4e, hat:'borik'}); const rf=new THREE.Mesh(new THREE.BoxGeometry(.06,1.2,.06),M(0x2a2018)); rf.position.set(.32,1.55,-.1); rf.rotation.x=.3; e.add(rf); e.position.set(PR.x-6+i*16,0,PR.z+.9); e.rotation.y=Math.PI/2; scene.add(e); return e; });
  // мальчишка: ниже всех, без каски, пилотка на уши
  const boy = makePerson({coat:0x6a6c5a, hat:'pilotka', scale:.82}); boy.position.set(PR.x+1.4,0,PR.z+1.0); scene.add(boy);
  const asanPr = makePerson({coat:0x6e6648, hat:'borik'}); asanPr.position.set(PR.x+3.0,0,PR.z+4.4); asanPr.lookAt(boy.position.x,0,boy.position.z); scene.add(asanPr);
  const bread = new THREE.Mesh(new THREE.BoxGeometry(.2,.1,.12),M(0x6a4a2a)); bread.position.set(0,-.4,.14); asanPr.userData.armR.add(bread); asanPr.userData.armR.rotation.x=-.7;
  boy.lookAt(asanPr.position.x,0,asanPr.position.z);
  const politMound = new THREE.Mesh(new THREE.SphereGeometry(1.4,10,6,0,Math.PI*2,0,Math.PI/2),M(0xe8e9ea)); politMound.scale.y=.38; politMound.position.set(PR.x-3,0,PR.z-4.5); scene.add(politMound);
  const politPr = makePerson({coat:0x4e4a36, hat:'pilotka'}); politPr.position.set(PR.x-3,.5,PR.z-4.5); politPr.lookAt(PR.x+1,0,PR.z+1); scene.add(politPr);
  const snowN=900, snowGeo=new THREE.BufferGeometry(), snowPos=new Float32Array(snowN*3);
  for(let i=0;i<snowN;i++){ snowPos[i*3]=PR.x+rand(-25,25); snowPos[i*3+1]=rand(0,12); snowPos[i*3+2]=PR.z+rand(-15,25); }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos,3));
  const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({color:0xffffff, size:.08, transparent:true, opacity:.85, depthWrite:false})); snow.userData.set='prisoners'; scene.add(snow);

  // ================= МЕСТО 5: гвардейское знамя (x = +600) =================
  const GD = new THREE.Vector3(600,0,0);
  { const gg=new THREE.PlaneGeometry(160,120,50,40); gg.rotateX(-Math.PI/2); const col=[], pos=gg.attributes.position, c=new THREE.Color();
    for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i), n=Math.sin(x*.3)*Math.cos(z*.25)+Math.sin(x*.11+z*.07)*.6; c.setHex(n>.3?0xcfcfcc:0x5a4e3e); col.push(c.r,c.g,c.b); }
    gg.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); const g=new THREE.Mesh(gg,new THREE.MeshLambertMaterial({vertexColors:true})); g.position.copy(GD); scene.add(g); }
  // строй: места в шеренгах; заняты единицы
  const rankFill = [1,0,0,1,0,0,0,1,0,1,0,0,0,0,1,0,0,1,0,0, 0,0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1];
  const soldiersG=[]; let asanSlot=null;
  rankFill.forEach((f,i)=>{ const row=i/20|0, col=i%20; const x=GD.x-9.5+col, z=GD.z-row*1.3;
    if(i===7) asanSlot={x,z};
    if(!f) return; const p=makePerson({coat:[0x7a7050,0x6e6648,0x857a52][i%3], hat:'borik'}); p.position.set(x,0,z); scene.add(p); soldiersG.push(p); });
  const asanG = soldiersG.find(p=>Math.abs(p.position.x-asanSlot.x)<.1 && Math.abs(p.position.z-asanSlot.z)<.1);
  const bannerGeo = new THREE.PlaneGeometry(1.9,1.25,14,9); const bannerBase = bannerGeo.attributes.position.array.slice();
  const bannerTex = (()=>{ const cv=document.createElement('canvas'); cv.width=256; cv.height=170; const x=cv.getContext('2d'); x.fillStyle='#8e1c16'; x.fillRect(0,0,256,170);
    x.strokeStyle='#c9a046'; x.lineWidth=8; x.strokeRect(6,6,244,158); x.fillStyle='#c9a046'; x.font='bold 26px serif'; x.textAlign='center'; x.fillText('ГВАРДИЯ',128,100);
    x.beginPath(); for(let i=0;i<5;i++){ const a=-Math.PI/2+i*Math.PI*4/5; x.lineTo(128+Math.cos(a)*18, 50+Math.sin(a)*18); } x.closePath(); x.fill(); return new THREE.CanvasTexture(cv); })();
  const banner = new THREE.Mesh(bannerGeo, new THREE.MeshLambertMaterial({map:bannerTex, side:THREE.DoubleSide})); banner.position.set(GD.x+.97,3.1,GD.z+5);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,4,6),M(0x3a2a1a)); pole.position.set(GD.x,2,GD.z+5); scene.add(banner, pole);
  const bearer = makePerson({coat:0x7a7050, hat:'borik'}); bearer.position.set(GD.x-.32,0,GD.z+5.1); bearer.userData.armR.rotation.x=-1; scene.add(bearer);
  const commissar = makePerson({coat:0x4e4a36, hat:'pilotka'}); commissar.position.set(GD.x+4,0,GD.z+6.5); commissar.rotation.y=Math.PI*.8; scene.add(commissar);
  function bannerWave(t){ const p=bannerGeo.attributes.position; for(let i=0;i<p.count;i++){ const x0=bannerBase[i*3], y0=bannerBase[i*3+1], k=(x0+.95)/1.9;
      p.setZ(i, Math.sin(t*3.2 - x0*3.4 + y0*.8)*.16*k + Math.sin(t*5.1 - x0*6)*.04*k); p.setY(i, y0 - k*k*.06); } p.needsUpdate=true; bannerGeo.computeVertexNormals(); }

  // ---------- места: рисуем только то, где идёт действие (остальные скрыты, их видимость запоминается) ----------
  const setOf = o => { if(o.userData.set) return o.userData.set; const x=o.position.x; return x<-300?'home':x<-100?'dugout':x<150?'raid':x<450?'prisoners':'guards'; };
  function showSet(...names){ for(const o of scene.children){ if(o.isLight || o.isCamera || o===moon.target) continue; const on=names.includes(setOf(o));
      if(!on && !o.userData.setHidden){ o.userData.setVis=o.visible; o.visible=false; o.userData.setHidden=true; }
      else if(on && o.userData.setHidden){ o.visible=o.userData.setVis; o.userData.setHidden=false; } } }

  // ---------- интерфейс вылазки: счёт и «тебя видят» (свои элементы, убираются в конце) ----------
  const countEl = document.createElement('div'); countEl.style.cssText='position:fixed;left:18px;bottom:64px;z-index:6;color:#d8ccae;font:italic 22px Georgia,serif;letter-spacing:.06em;text-shadow:0 1px 6px #000;pointer-events:none;opacity:0;transition:opacity .3s';
  const seenEl = document.createElement('div'); seenEl.style.cssText='position:fixed;left:50%;top:58px;transform:translateX(-50%);z-index:6;width:min(220px,40vw);height:6px;background:rgba(0,0,0,.5);border:1px solid #5e5444;pointer-events:none;opacity:0;transition:opacity .3s';
  seenEl.innerHTML='<div style="height:100%;width:0;background:#b8402a"></div><div style="position:absolute;top:9px;left:0;right:0;text-align:center;font:12px Georgia,serif;color:#d8ccae">'+escapeHtml(U.seen)+'</div>';
  document.body.append(countEl, seenEl);
  function cleanup(){ countEl.remove(); seenEl.remove(); $('prompt').style.display='none'; flareLight.intensity=0; }

  // ---------- ввод: касание/клик по земле — ползти туда ----------
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), groundPlane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
  function screenToGround(ev, out){ const r=canvas.getBoundingClientRect(); mouse.set(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1); ray.setFromCamera(mouse, camera); return ray.ray.intersectPlane(groundPlane, out); }
  const crawlPhase = () => S.phase==='raid' || S.phase==='drag' || S.phase==='back';
  listen(canvas,'pointerdown', ev=>{ if(dlgOpen || S.busy || !crawlPhase()) return; const p=screenToGround(ev, tmp2); if(p) S.target={x:p.x, z:p.z}; });
  listen(canvas,'wheel', e=>{ S.zoom=clamp(S.zoom+Math.sign(e.deltaY)*.1,.6,1.5); }, {passive:true});

  // ---------- сценарий ----------
  // письмо домой: лист лежит в кадре, строки проступают почерком, в пропуски игрок выбирает слова
  function letterEl(){ let el=$('letterLive'); if(!el){ el=document.createElement('div'); el.id='letterLive'; document.body.appendChild(el); } el.style.display='block'; return el; }
  async function writeRow(text){ const el=letterEl(), p=document.createElement('div'); el.appendChild(p);
    for(let i=1;i<=text.length;i++){ p.textContent=text.slice(0,i); if(i%3===0) noiseBurst({dur:.05,freq:3000,q:.7,gain:.03,type:'bandpass',bus:'voice'}); await wait(30); } }
  const letterHooks = {
    letterLine(k){ return writeRow(k==='head' ? DAT.letter.head : DAT.letter.lines[k]); },
    letterBlank(slot){ const el=letterEl(), p=document.createElement('div'); p.className='blankRow'; p.innerHTML=escapeHtml(DAT.letter.blanks[slot]).replace(/_{3,}/,'<span class="blank">&nbsp;</span>'); el.appendChild(p); sfx.paper(); },
    async letterFill(k){ const el=letterEl(), b=el.querySelector('.blankRow:last-of-type'); if(b) b.remove(); if(k && k!=='none' && DAT.letter.lines[k]) await writeRow(DAT.letter.lines[k]); },
    async letterClose(){ await wait(1100); const el=$('letterLive'); if(el){ el.style.display='none'; el.innerHTML=''; } }
  };
  const run = makeRunner({
    ...letterHooks,
    // блиндаж
    async boom(){ S.boomT=0; await gwait(1.4); },
    async writing(){ S.shot='dugHand'; S.shotT=0; S.writing=true; await gwait(3.2); S.writing=false; S.shot='dugout'; S.shotT=0; },
    // письмо Колесникова: протягивает треугольник; Асан берёт и прячет за голенище — или нет
    async kolOffersLetter(){ const p=kolSleep.userData.p; S.shot='dugLetter'; S.shotT=0;
      p.userData.armR.add(kolLetterM); kolLetterM.position.set(0,-.42,.1); kolLetterM.rotation.set(-Math.PI/2,0,0);
      const t0=S.clock; await until(()=>{ const k=Math.min(1,(S.clock-t0)/1.2); p.userData.armR.rotation.x=lerp(0,-1.25,k); return k>=1; }); await gwait(.6); },
    async letterToBoot(){ const a=asanSit.userData.armR, p=kolSleep.userData.p; let t0=S.clock;
      await until(()=>{ const k=Math.min(1,(S.clock-t0)/.8); a.rotation.x=lerp(-1.1,-1.35,k); return k>=1; });
      a.attach(kolLetterM); sfx.paper(); t0=S.clock;
      await until(()=>{ const k=Math.min(1,(S.clock-t0)/1.2); p.userData.armR.rotation.x=lerp(-1.25,0,k); a.rotation.x=lerp(-1.35,.35,k); return k>=1; });
      asanSit.attach(kolLetterM); kolLetterM.position.set(.3,1.22,.18); kolLetterM.rotation.set(0,-Math.PI/2,.15); await gwait(1.6); a.rotation.x=-1.1; S.shot='dugout2'; S.shotT=0; },
    async letterBack(){ const p=kolSleep.userData.p; await gwait(.5); let t0=S.clock;
      await until(()=>{ const k=Math.min(1,(S.clock-t0)/1.3); p.userData.armR.rotation.x=lerp(-1.25,-.6,k); return k>=1; });
      p.attach(kolLetterM); kolLetterM.position.set(.14,1.3,.27); kolLetterM.rotation.set(0,0,.2); p.userData.armR.rotation.x=0; await gwait(1.4); S.shot='dugout2'; S.shotT=0; },
    async kolWakes(){ S.shot='dugout2'; S.shotT=0; const p=kolSleep.userData.p, t0=S.clock;
      await until(()=>{ const k=Math.min(1,(S.clock-t0)/1.6), e=k*k*(3-2*k); p.rotation.x=lerp(-Math.PI/2,0,e); p.position.y=lerp(.62,0,e);
        kolSleep.position.set(lerp(DG.x+2,DG.x+1.4,e),0,lerp(DG.z+1.2,DG.z+.3,e)); kolSleep.rotation.y=lerp(0,-2.3,e); return k>=1; }); },
    // вылазка
    async noose(){ S.camFocus=gerW; S.camH=7.5; S.camBack=4.5; noiseBurst({dur:.5,freq:400,q:.8,gain:.15}); ger.position.x=0;
      const t0=S.clock; await until(()=>{ const k=Math.min(1,(S.clock-t0)/1.1); ger.rotation.x=-Math.PI/2*k; ger.position.y=.3*k; ember.visible=k<.3; ger.rotation.z=Math.sin(k*20)*.1*(1-k); return k>=1; }); },
    async playDead(){ S.camH=4; S.camBack=1.8; await gwait(1.2); ger.rotation.z=.05; await gwait(.3); ger.rotation.z=0; await gwait(.8); },
    async kolTakesCover(){ S.camFocus=kolW; S.camH=9; S.camBack=5;
      const near = rubble.reduce((b,r)=>Math.hypot(r.x-kolW.position.x,r.z-kolW.position.z)<Math.hypot(b.x-kolW.position.x,b.z-kolW.position.z)?r:b, rubble[0]);
      S.kolSpot = new THREE.Vector3(near.x, 0, near.z+near.r+.4); S.kolHold=true;
      await until(()=>kolW.position.distanceTo(S.kolSpot)<.08, 8000); kolW.position.copy(S.kolSpot); kolW.rotation.y=Math.PI; },
    async kolShove(){ const a=kolW.userData.p.userData.armR; a.rotation.x=-1.2; await gwait(.25); asanW.position.z+=.5; a.rotation.x=-2.6; await gwait(.6); },
    async pullPin(){ S.camH=6; S.camBack=2.6; const a=kolW.userData.p.userData.armR; a.rotation.x=-1.4; await gwait(.5); tone({f:1800,dur:.05,type:'square',gain:.06}); noiseBurst({dur:.08,freq:2400,gain:.06}); a.rotation.x=-.6; await gwait(1.2); },
    async sashkoHands(){ sashW.position.set(1.6,0,36.2); sashW.rotation.y=0; const p=sashW.userData.p; p.rotation.x=0; p.position.set(0,-.55,0); p.userData.armL.rotation.x=p.userData.armR.rotation.x=-1.3; p.userData.legL.rotation.z=p.userData.legR.rotation.z=0;
      S.camFocus=sashW; S.camH=5.5; S.camBack=3; await gwait(3); S.camFocus=null; S.camH=15; S.camBack=9; },
    // пленные
    async prisonerFalls(){ const c=column.reduce((b,c)=>Math.abs(c.p.position.x-(PR.x-3))<Math.abs(b.p.position.x-(PR.x-3))?c:b, column[0]); c.fallen=true; await gwait(3.5); },
    async boyStops(){ S.shot='prClose'; S.shotT=0; S.boyStops=true; await gwait(2); },
    async escortLooks(){ const e=escorts[0]; e.position.set(PR.x-1.6,0,PR.z+1.4); S.escortLook=true; await gwait(1.6); },
    async giveBread(){ S.bread='give'; await gwait(1.8); },
    async keepBread(){ S.bread='keep'; await gwait(1.2); },
    // политрук на той стороне дороги видел хлеб
    async politrukWatches(){ S.shot='prPolit'; S.shotT=0; politPr.lookAt(asanPr.position.x,0,asanPr.position.z); await gwait(2.6); S.shot='prClose'; S.shotT=0; },
    async boyPushed(){ const a=escorts[0].userData.armR; a.rotation.x=-1.3; S.boyStops=false; S.escortLook=false; await gwait(.4); a.rotation.x=0; await gwait(1.8); },
    // гвардия
    // политрук идёт вдоль строя; у Асана — кивок или запись в блокнот (пулемёт на Дону)
    async politrukWalks(){ S.shot='gPolitWalk'; S.shotT=0; const to=new THREE.Vector3(asanSlot.x, 0, asanSlot.z+1.1); S.politTo=to;
      await until(()=>!S.politTo); commissar.lookAt(asanSlot.x,0,asanSlot.z); await gwait(.6); },
    async politrukNods(){ S.shot='gPolitFace'; S.shotT=0; const t0=S.clock; await until(()=>{ const k=Math.min(1,(S.clock-t0)/.9); commissar.rotation.x=Math.sin(k*Math.PI)*.12; return k>=1; }); await gwait(1.2); },
    async politrukWrites(){ commissar.userData.armL.add(politNote); politNote.position.set(.05,-.4,.16); politNote.rotation.set(-1.0,0,0);
      commissar.userData.armL.rotation.x=-1.1; S.shot='gPolitFace'; S.shotT=0; S.writingP=true; noiseBurst({dur:1.6,freq:3200,q:.7,gain:.04,type:'bandpass'}); await gwait(1.6);
      await politNotePage(); S.writingP=false;
      commissar.userData.armL.rotation.x=0; commissar.userData.armR.rotation.x=0; politNote.visible=false; S.shot='gAsan'; S.shotT=0; await gwait(1.2); },
    async gapsInLine(){ S.shot='gTrack'; S.shotT=0; await gwait(7); S.shot='gAsan'; S.shotT=0; await gwait(1.5); }
  });

  // ---------- вылазка: правила ----------
  const inCover = p => rubble.some(r=>Math.hypot(p.x-r.x,p.z-r.z)<r.r+.7) || chimneys.some(c=>Math.hypot(p.x-c.x,p.z-c.z)<1.1)
    || walls.some(w=>Math.abs(p.x-w.x)<w.hw+.9 && Math.abs(p.z-w.z)<w.hd+.9);
  function collide(p){ for(const w of walls){ const hx=w.hw+.35, hz=w.hd+.35, dx=p.x-w.x, dz=p.z-w.z;
      if(Math.abs(dx)<hx && Math.abs(dz)<hz){ if(hx-Math.abs(dx) < hz-Math.abs(dz)) p.x=w.x+Math.sign(dx)*hx; else p.z=w.z+Math.sign(dz)*hz; } }
    p.x=clamp(p.x,-26,26); p.z=clamp(p.z,-38,37); }
  const trail=[]; let lastTrail=new THREE.Vector3(0,0,36);
  function followers(dt, t, list){ list.forEach(([w,lag])=>{ let acc=0, tgt=trail.length?trail[trail.length-1]:asanW.position;
      for(let i=trail.length-1;i>0;i--){ acc+=trail[i].distanceTo(trail[i-1]); if(acc>=lag){ tgt=trail[i-1]; break; } }
      const dx=tgt.x-w.position.x, dz=tgt.z-w.position.z, d=Math.hypot(dx,dz), lit=S.flare>0;
      const mv = !lit && d>.25; if(mv){ const st=Math.min(d,2.2*dt); w.position.x+=dx/d*st; w.position.z+=dz/d*st; w.rotation.y=Math.atan2(dx,dz); }
      crawlAnim(w, mv, t+lag); }); }
  function launchFlare(){ S.flare=6.5; S.count=0; flareSpr.visible=true; flareSpr.position.set(asanW.position.x+rand(-14,14), 34, asanW.position.z+rand(-20,-6)); sfx.flare(); }
  async function caught(){
    if(S.busy) return; S.busy=true; S.target=null;
    for(let i=0;i<14;i++) tracer(tmp.copy(POST).setY(1.2).add(new THREE.Vector3(rand(-.5,.5),0,0)), tmp2.copy(asanW.position).add(new THREE.Vector3(rand(-1.5,1.5),.3,rand(-1.5,1.5))));
    noiseBurst({dur:1.2,freq:900,q:.5,gain:.2}); hitFlash(); toast(U.caughtToast);
    await gwait(.8); await fadeTo(1,600);
    asanW.position.copy(S.cp); trail.length=0; lastTrail.copy(S.cp);
    kolW.position.copy(S.cp).add(new THREE.Vector3(-.9,0,1.6)); sashW.position.copy(S.cp).add(new THREE.Vector3(.9,0,2.6));
    if(S.phase==='drag'||S.phase==='back') placeGer();
    S.detect=0; S.flare=0; S.flareT=7; flareSpr.visible=false; flareLight.intensity=0;
    await fadeTo(0,700); S.busy=false;
  }
  function placeGer(){ const dir=tmp.set(Math.sin(asanW.rotation.y),0,Math.cos(asanW.rotation.y)); gerW.position.copy(asanW.position).addScaledVector(dir,-1.15); gerW.rotation.y=asanW.rotation.y; }

  async function phaseDugout(){
    S.phase='dugout'; showSet('dugout'); scene.background.setHex(0x060504); scene.fog.color.setHex(0x060504); scene.fog.near=8; scene.fog.far=30; hemi.intensity=.12; moon.intensity=0; lampLight.intensity=1.6;
    S.shot='dugout'; S.shotT=0; cine(true); setObj(CH, DAT.objectives.letter);
    await fadeTo(0,1800); await gwait(2.5);
    await run(DAT.scripts.dugout);
    await run(DAT.scripts.letter); closeDlg();
    await showLetter();
    await homePanels();
    // та же ночь в блиндаже: Колесников проснулся
    S.shot='dugout'; S.shotT=0;
    await fadeTo(0,900);
    await run(DAT.scripts.raid_brief); closeDlg();
    await prepRaid();
    cine(false);
    const w=wipe(1300); setupRaid(); await w;
    S.busy=false;
  }
  // страница блокнота политрука крупно: строки по-русски — шум, читается только фамилия
  function politNotePage(){
    return new Promise(res=>{
      const N=DAT.politNote;
      $('paper').innerHTML = `<div style="font-family:Caveat,cursive;font-size:26px;line-height:1.35;color:#1d2a4a">${N.lines.map(l=>renderLang(l,'ru')).join('<br>')}</div><div class="hint">${escapeHtml(N.hint)}</div>`;
      $('doc').style.display='flex'; sfx.paper();
      let done=false; const fin=()=>{ if(done) return; done=true; $('doc').style.display='none'; $('doc').onclick=null; res(); };
      $('doc').onclick=fin; gwait(4.5).then(fin);
    });
  }
  // письмо как документ: сначала строки, потом цензор кладёт чёрные полосы и штамп
  function showLetter(){
    return new Promise(res=>{
      const L=DAT.letter.lines, f=memory.flags, rows=[DAT.letter.head, f.letterSelf==='truth'?L.truth:L.fine];
      if(f.letterZhum==='told') rows.push(L.zhum_told); else if(f.letterZhum==='lied') rows.push(L.zhum_lied);
      rows.push(L.city); rows.push(f.letterEnd==='kulash'?L.kulash:L.pen); rows.push(L.end);
      const strike = s => { let h=escapeHtml(s); DAT.letter.struck.forEach(w=>{ h=h.replace(escapeHtml(w), `<span class="cs" style="position:relative;display:inline-block">${escapeHtml(w)}<i style="position:absolute;left:-2px;top:3px;bottom:2px;width:0;background:#0d0c0b;transition:width .6s ease-out"></i></span>`); }); return h; };
      $('paper').innerHTML = rows.map(strike).join('<br>') + `<div class="stamp" style="opacity:0;transition:opacity .5s;display:flex;align-items:center;justify-content:center;text-align:center;font:9px/1.2 Georgia,serif;color:rgba(110,30,25,.75);padding:6px">${escapeHtml(U.censorStamp)}</div><div class="hint">${escapeHtml(U.letterHint)}</div>`;
      $('doc').style.display='flex'; sfx.paper();
      // лист — это интерфейс, не постановка: цензор работает по обычным часам
      wait(1600).then(()=>{ $('paper').querySelectorAll('.cs i').forEach(i=>i.style.width='calc(100% + 4px)'); noiseBurst({dur:.4,freq:500,q:.6,gain:.08}); return wait(900); })
        .then(()=>{ const st=$('paper').querySelector('.stamp'); if(st) st.style.opacity=1; tone({f:120,dur:.08,type:'square',gain:.08}); });
      $('doc').onclick=()=>{ $('doc').style.display='none'; $('doc').onclick=null; res(); };
    });
  }
  async function homePanels(){
    // рисованные кадры: треугольник в ауле → цензорская полоса → кто читает (Күләш или никто)
    const f=memory.flags, shots=['img/ch3h_1.jpg','img/ch3h_2.jpg', f.sharedWithKulash?'img/ch3h_3a.jpg':'img/ch3h_3b.jpg'];
    const caps = DAT.panels.captions.map(c => c.if ? (evalCond(c.if, memory.flags) ? c.text : c.else) : c.text);
    showSet('dugout');
    await fadeTo(1,800);
    const page=$('page'); page.innerHTML=''; page.classList.remove('four'); page.classList.add('artpage');
    shots.forEach((u,i)=>{ const d=document.createElement('div'); d.className='pn art'; d.innerHTML=`<img class="art" src="${u}" alt=""><div class="cap">${escapeHtml(caps[i])}</div>`; page.appendChild(d); });
    $('panels').style.display='flex'; fitArtPage(page); await fadeTo(0,700);
    const clickPanels = () => new Promise(r=>{ const h=()=>{ $('panels').removeEventListener('pointerdown',h); removeEventListener('keydown',kk); r(); }; const kk=e=>{ if(e.code==='Space'||e.code==='Enter') h(); }; $('panels').addEventListener('pointerdown',h); addEventListener('keydown',kk); });
    const cells=[...page.children];
    for(let i=0;i<cells.length;i++){ cells[i].classList.add('on'); $('pnNext').textContent = i<cells.length-1 ? 'Нажми, чтобы открыть следующий кадр' : 'Нажми, чтобы перевернуть страницу'; await wait(350); await clickPanels(); }
    await fadeTo(1,800); $('panels').style.display='none'; page.classList.remove('artpage','row'); page.style.width='';
  }

  // сборы перед вылазкой: тёмные плащ-палатки, ничего звенящего, ракеты над нейтралкой — считать
  const capeM = M(0x17191b);
  function putCape(w){ const p=w.userData.p; const c=new THREE.Mesh(new THREE.CylinderGeometry(.46,.6,1.3,9,1,true), capeM); c.geometry.translate(0,-.65,0); c.material.side=THREE.DoubleSide; c.position.y=1.72; c.scale.y=.05; p.add(c);
    const hood=new THREE.Mesh(new THREE.SphereGeometry(.25,10,8,0,Math.PI*2,0,Math.PI*.62), capeM); hood.position.set(0,1.84,-.03); hood.visible=false; p.add(hood);
    const t0=performance.now(); (function grow(){ const k=Math.min(1,(performance.now()-t0)/900); c.scale.y=.05+k*.95; if(k<1) requestAnimationFrame(grow); else hood.visible=true; })(); sfx.paper && sfx.paper(); }
  function stand(w,x,z,ry){ const p=w.userData.p; p.rotation.x=0; p.position.set(0,0,0); w.position.set(x,0,z); w.rotation.y=ry; }
  function lie(w){ const p=w.userData.p; p.rotation.x=Math.PI/2; p.position.set(0,.3,-.9); }
  async function prepRaid(){
    const P=DAT.prep;
    await fadeTo(1,700);
    S.phase='prep'; showSet('raid'); lampLight.intensity=0;
    scene.background.setHex(0x0d1117); scene.fog.color.setHex(0x0d1117); scene.fog.near=18; scene.fog.far=85; hemi.intensity=.34; moon.intensity=.3;
    stand(kolW,-1,36.3,Math.PI/2+.4); stand(sashW,1.05,36.4,-Math.PI/2-.4); stand(asanW,0,35.5,0);
    S.flareT=999; S.shot='prepGroup'; S.shotT=0;
    await fadeTo(0,900);
    caption(P.caption); await gwait(1.6);
    bark('Колесников',P.kol,'ru'); await gwait(.8); putCape(kolW); await gwait(1.2); think(P.think1); await gwait(1.8);
    putCape(sashW); bark('Сашко',P.sash,'ru'); await gwait(2.4);
    putCape(asanW); await gwait(.6); think(P.think); await gwait(3);
    kolW.rotation.y=sashW.rotation.y=asanW.rotation.y=Math.PI; // все трое к нейтралке
    S.shot='prepFlare'; S.shotT=0; bark('Колесников',P.kol2,'ru'); await gwait(1.4);
    launchFlare(); await gwait(7);
    think(P.count); await gwait(4.5);
    launchFlare(); bark('Колесников',P.kolCount,'ru'); await gwait(4);
    S.shot='prepGroup'; S.shotT=0; bark('Колесников',P.go,'ru'); await gwait(1.6);
    lie(kolW); lie(sashW); lie(asanW); S.shot=null; S.flare=0; flareSpr.visible=false; flareLight.intensity=0;
  }
  function setupRaid(){
    S.phase='raid'; showSet('raid'); S.shot=null; lampLight.intensity=0;
    scene.background.setHex(0x0d1117); scene.fog.color.setHex(0x0d1117); scene.fog.near=18; scene.fog.far=85; hemi.intensity=.34; moon.intensity=.3;
    asanW.position.set(0,0,34.5); asanW.rotation.y=Math.PI; kolW.position.set(-1.2,0,36); kolW.rotation.y=Math.PI; sashW.position.set(1.1,0,37); sashW.rotation.y=Math.PI;
    lastTrail.copy(asanW.position); trail.length=0; S.cp=asanW.position.clone(); S.flareT=5; S.count=0; S.detect=0;
    camera.position.set(0,15,44); camera.lookAt(0,0,34); camera.fov=45; camera.updateProjectionMatrix();
    setObj(CH, isTouch ? DAT.objectives.raidTouch : DAT.objectives.raid);
    countEl.style.opacity=1; setHeart(70);
  }
  async function grabSentry(){
    if(S.busy || S.phase!=='raid') return;
    S.busy=true; S.phase='grabbing'; S.target=null; $('prompt').style.display='none';
    await run(DAT.scripts.grab); closeDlg();
    S.phase='drag'; S.camFocus=null; S.camH=15; S.camBack=9; placeGer(); S.cp=asanW.position.clone();
    setObj(CH, DAT.objectives.drag); S.busy=false;
  }
  async function kolesnikovStays(){
    S.busy=true; S.alarmDone=true; S.alarm=true; S.target=null;
    bark('Немец','Alarm! Iwan! Da hinten!','de'); S.flareT=.5;
    await run(DAT.scripts.kolesnikov); closeDlg();
    S.phase='back'; S.camFocus=null; S.camH=15; S.camBack=9; setObj(CH, DAT.objectives.back); S.busy=false;
    // граната: несколько секунд он держит их на себе, потом один разрыв — и тишина
    gwait(9).then(()=>{ explode(S.kolSpot.x, S.kolSpot.z-.8, 1.1); kolW.visible=false; S.alarm=false; setRing(true); gwait(3).then(()=>setRing(false)); });
  }
  async function raidEnd(){
    S.busy=true; S.phase='dawn'; S.target=null; S.alarm=false; countEl.style.opacity=0; seenEl.style.opacity=0; setHeart(0);
    if(kolW.visible){ explode(S.kolSpot?S.kolSpot.x:0, S.kolSpot?S.kolSpot.z-.8:-12, 1.1); kolW.visible=false; }
    S.dawn=0.001; setObj(CH,'');
    await gwait(2.5);
    await run(DAT.scripts.raid_end); closeDlg();
    // вся вылазка шла сверху — оказывается, это ворона смотрела с трубы. Она слетает.
    crow.visible=false;
    await birdReveal(new THREE.Vector3(.3,0,-1), asanW.position.clone());
    phasePrisoners();
  }

  async function phasePrisoners(){
    S.phase='prisoners'; showSet('prisoners'); S.busy=true; cleanupRaidLights();
    scene.background.setHex(0xd2d4d6); scene.fog.color.setHex(0xd2d4d6); scene.fog.near=12; scene.fog.far=70; hemi.intensity=.85; hemi.color.setHex(0xe6eaf0); moon.intensity=.35; moon.color.setHex(0xdde4ee);
    moon.position.set(PR.x-15,25,PR.z+10); moon.target.position.copy(PR);
    S.shot='prWide'; S.shotT=0; cine(true); setObj(CH,'');
    await fadeTo(0,2200); await gwait(3);
    // реплики идут, план держится; на мальчишке — жёсткая склейка через плечо Асана
    S.prisonersPlay=true;
    await run(DAT.scripts.prisoners); closeDlg();
    await gwait(1.5);
    S.shot='prWide'; S.shotT=0; S.boyStops=false;
    await gwait(5);
    const w=wipe(1500); phaseGuards(); await w;
  }
  function cleanupRaidLights(){ flareLight.intensity=0; flareSpr.visible=false; S.flare=0; }
  async function phaseGuards(){
    S.phase='guards'; showSet('guards','prisoners'); S.busy=true; S.prisonersPlay=false;
    scene.background.setHex(0xb8b6b0); scene.fog.color.setHex(0xb8b6b0); scene.fog.near=14; scene.fog.far=90; hemi.intensity=.8; moon.position.set(GD.x-15,22,GD.z+14); moon.target.position.copy(GD);
    S.shot='gWide'; S.shotT=0; cine(true); gwait(1.6).then(()=>showSet('guards'));
    await gwait(7);
    await run(DAT.scripts.guards); closeDlg();
    await gwait(2.5);
    await fadeTo(1,1800); cine(false); cleanup();
    endChapter3();
  }

  // ---------- кадр ----------
  function camFollow(dt, target){ const z=S.zoom; tmp2.set(target.x, S.camH*z, target.z + S.camBack*z);
    camera.position.lerp(tmp2, 1-Math.pow(.03,dt)); camera.lookAt(target.x, 0, target.z-2); }
  // постановочные планы — неподвижная камера, живут ветер, снег, дыхание
  const SHOTS = {
    prepGroup(k){ camera.fov=30; camera.position.set(5.8-k*.05, 2.1, 42.8); return tmp.set(0, 1.1, 36); },
    prepFlare(k){ camera.fov=44; camera.position.set(2.4, 2.6, 39.2); return tmp.set(-.5, 3+Math.min(k,8)*.2, 14); },
    dugout(k){ camera.fov=40; camera.position.set(DG.x-2.05, 1.2, DG.z-2.0); return tmp.set(DG.x-.1, 1.0, DG.z-.85); },
    dugHand(k){ camera.fov=34; camera.position.set(DG.x-.35, 1.65, DG.z-1.75); return tmp.set(DG.x+.08, .82, DG.z-1.2); },
    gTrack(k){ const e=Math.min(1,k/7); camera.fov=30; camera.position.set(GD.x-11+e*8.5, 1.65, GD.z+4.2); return tmp.set(GD.x-11+e*8.5+1.2, 1.5, GD.z-.3); },
    dugout2(k){ camera.fov=38; camera.position.set(DG.x-1.7, 1.5, DG.z-1.9); return tmp.set(DG.x+.9, 1.0, DG.z-.1); },
    prWide(k){ camera.fov=30; camera.position.set(PR.x+1+k*.05, 3.2, PR.z+21); return tmp.set(PR.x, 1.0, PR.z-1); },
    prClose(k){ camera.fov=26; camera.position.set(PR.x+6.2, 1.75, PR.z+6.6); return tmp.set(PR.x+1.6, 1.25, PR.z+1.0); },
    gWide(k){ camera.fov=32; camera.position.set(GD.x+3, 1.6, GD.z+22-k*.12); return tmp.set(GD.x, 1.8, GD.z); },
    dugLetter(k){ camera.fov=40; camera.position.set(DG.x-1.3, 1.35, DG.z-.1); return tmp.set(DG.x+.8, 1.0, DG.z-.15); },
    prPolit(k){ camera.fov=18; camera.position.set(PR.x+3.63, 2.6, PR.z+4.7); return tmp.set(PR.x-3, 1.9, PR.z-4.5); },
    gPolitWalk(k){ camera.fov=34; camera.position.set(asanSlot.x+3, 1.8, asanSlot.z+8.5); return tmp.copy(commissar.position).setY(1.5).lerp(tmp2.set(asanSlot.x,1.5,asanSlot.z),.5); },
    gPolitFace(k){ camera.fov=30; camera.position.set(asanSlot.x+.5, 1.72, asanSlot.z-.75); return tmp.set(commissar.position.x, 1.62, commissar.position.z); }, // из-за плеча Асана — лицо политрука и блокнот
    gAsan(k){ camera.fov=24; camera.position.set(asanSlot.x+7.5, 1.7, asanSlot.z+2.2); return tmp.set(asanSlot.x, 1.55, asanSlot.z); }
  };

  const sc = {
    S,
    update(dt,t){
      S.clock+=dt;
      if(BIRD.active){ BIRD.update(dt); return; }
      for(let i=fx.length-1;i>=0;i--){ const f=fx[i]; f.life-=dt; const k=1-f.life/f.max; f.s.position.y+=f.vy*dt; f.s.scale.setScalar(f.base*(1+k*f.grow)); f.s.material.opacity=Math.max(0,1-k); if(f.life<=0){ scene.remove(f.s); f.s.material.dispose(); fx.splice(i,1);} }
      for(let i=tracers.length-1;i>=0;i--){ const tr=tracers[i]; tr.life-=dt; tr.l.material.opacity=tr.life/.08; if(tr.life<=0){ scene.remove(tr.l); tr.l.geometry.dispose(); tracers.splice(i,1);} }
      // блиндаж: коптилка дрожит, с потолка сыплется земля от далёких разрывов
      if(S.phase==='dugout'||S.phase==='intro'){ lampLight.intensity = lampLight.intensity>0 ? 1.5+Math.sin(t*13)*.18+Math.sin(t*31)*.1 : 0; flame.scale.set(.12+Math.sin(t*17)*.015,.22+Math.sin(t*11)*.03,1);
        if(S.writing){ const a=asanSit.userData.armR; a.rotation.x=-1.15+Math.sin(t*9)*.07; a.rotation.z=Math.sin(t*3.7)*.06; }
        S.boomT=(S.boomT||4)-dt; if(S.boomT<=0){ S.boomT=rand(5,9); noiseBurst({dur:1.2,freq:70,q:.5,gain:.35,type:'lowpass'}); shake=.25; for(let i=0;i<5;i++) puff(tmp.set(DG.x+rand(-1.5,1.5),2,DG.z+rand(-2,1)), dustTex, .25, 1.6, -.9, .8); } }
      if(crawlPhase() || S.phase==='grabbing'){ raidUpdate(dt,t); }
      else if(S.phase==='prep' && S.flare>0){ S.flare-=dt; const age=6.5-S.flare; flareSpr.position.y-=dt*2.4; flareLight.position.copy(flareSpr.position);
        flareLight.intensity=(age<.5?age/.5:1)*clamp(S.flare/4,0,1)*2.4; flareSpr.scale.setScalar(1.6+Math.sin(t*30)*.2); if(S.flare<=0){ flareSpr.visible=false; flareLight.intensity=0; } }
      else if(S.phase==='dawn'){ S.dawn=Math.min(1,S.dawn+dt*.12); const e=S.dawn; scene.background.setRGB(lerp(.05,.42,e),lerp(.07,.38,e),lerp(.09,.38,e)); scene.fog.color.copy(scene.background); hemi.intensity=lerp(.34,.6,e);
        flareLight.intensity=Math.max(0,flareLight.intensity-dt); camFollow(dt, asanW.position); }
      if(S.prisonersPlay || S.phase==='prisoners'){ prisonersUpdate(dt,t); }
      if(S.phase==='guards' && S.politTo){ const dx=S.politTo.x-commissar.position.x, dz=S.politTo.z-commissar.position.z, d=Math.hypot(dx,dz);
        if(d<.06){ S.politTo=null; animWalk(commissar,0,dt); } else { const st=Math.min(d,1.3*dt); commissar.position.x+=dx/d*st; commissar.position.z+=dz/d*st; commissar.rotation.y=Math.atan2(dx,dz); animWalk(commissar,1,dt); } }
      if(S.writingP){ const a=commissar.userData.armR; a.rotation.x=-1.0+Math.sin(t*10)*.08; a.rotation.z=-.35+Math.sin(t*4)*.05; }
      if(S.phase==='guards'){ bannerWave(t); soldiersG.forEach((p,i)=>{ p.rotation.z=Math.sin(t*.7+i)*.01; }); }
      if(S.shot && SHOTS[S.shot]){ S.shotT+=dt; const look=SHOTS[S.shot](S.shotT); camera.updateProjectionMatrix(); camera.lookAt(look); }
      if(shake>0){ camera.position.x+=rand(-1,1)*shake*.3; camera.position.y+=rand(-1,1)*shake*.2; shake=Math.max(0,shake-dt*2.5); }
    },
    onKey(code,down){ if(down && code==='KeyE' && S.canGrab) grabSentry(); },
    act(){ if(S.canGrab) grabSentry(); },
    wantsJoy(){ return crawlPhase() && !S.busy; },
    touchAction(){ return S.canGrab ? U.grabTouch : null; },
    holdStart(){}, holdEnd(){},
    async begin(){
      setObj(CH,''); scene.background.setHex(0x060504);
      await showCard(DAT.card.small, DAT.card.big, DAT.card.text, 'Начать');
      phaseDugout();
    },
    // для автопроверки
    debug:{ asanW, gerW, kolW, POST, prepRaid, phaseDugout, phasePrisoners, phaseGuards }
  };

  function raidUpdate(dt,t){
    // ракеты: тёмный промежуток — Асан считает; светло — все замирают
    if(S.flare>0){ S.flare-=dt; const age=6.5-S.flare; flareSpr.position.y-=dt*2.4; flareLight.position.copy(flareSpr.position);
      flareLight.intensity = (age<.5 ? age/.5 : 1) * clamp(S.flare/4,0,1) * 2.4; flareSpr.scale.setScalar(1.6+Math.sin(t*30)*.2);
      if(S.flare<=0){ flareSpr.visible=false; flareLight.intensity=0; S.flareT = S.alarm ? rand(1.5,3) : rand(6,10); } }
    else if(!S.busy){ S.flareT-=dt; S.count+=dt; if(S.flareT<=0) launchFlare(); }
    const lit = S.flare>0 && flareLight.intensity>.6;
    const cnt = U.count[Math.min(U.count.length-1, Math.floor(S.count))];
    countEl.textContent = lit ? '' : cnt+'…';
    const ob = lit ? DAT.objectives.flare : S.phase==='raid' ? (isTouch?DAT.objectives.raidTouch:DAT.objectives.raid) : S.phase==='drag' ? DAT.objectives.drag : S.phase==='back' ? DAT.objectives.back : '';
    if(ob!==S.objText){ S.objText=ob; setObj(CH, ob); }
    // движение Асана
    let mx=0, mz=0;
    if(!S.busy && !dlgOpen){
      [mx,mz] = moveInput();
      if(mx||mz) S.target=null;
      if(S.target){ const dx=S.target.x-asanW.position.x, dz=S.target.z-asanW.position.z, d=Math.hypot(dx,dz); if(d<.3) S.target=null; else { mx=dx/d; mz=dz/d; } }
    }
    const len=Math.hypot(mx,mz), speed = S.phase==='drag' ? 1.05 : 1.75;
    if(len){ mx/=len; mz/=len; asanW.position.x+=mx*speed*dt; asanW.position.z+=mz*speed*dt; collide(asanW.position); asanW.rotation.y=Math.atan2(mx,mz);
      S.stepT+=dt; if(S.stepT>.5){ S.stepT=0; noiseBurst({dur:.12,freq:500,q:.6,gain:.03,type:'lowpass'}); } }
    crawlAnim(asanW, len>0, t);
    if(asanW.position.distanceTo(lastTrail)>.3){ trail.push(asanW.position.clone()); lastTrail.copy(asanW.position); if(trail.length>80) trail.shift(); }
    followers(dt, t, S.kolHold ? [[sashW,2.4]] : [[kolW,2.4],[sashW,4.6]]);
    if(S.kolHold && kolW.visible){ const d=kolW.position.distanceTo(S.kolSpot); if(d>.05){ const dx=S.kolSpot.x-kolW.position.x, dz=S.kolSpot.z-kolW.position.z; const st=Math.min(d,1.8*dt); kolW.position.x+=dx/d*st; kolW.position.z+=dz/d*st; kolW.rotation.y=Math.atan2(dx,dz); crawlAnim(kolW,true,t); } else { kolW.rotation.y=Math.PI; crawlAnim(kolW,false,t); } }
    if(S.phase==='drag'||S.phase==='back'){ placeGer(); ger.rotation.x=-Math.PI/2; ger.position.y=.3; }
    // часовой курит и переминается
    if(S.phase==='raid'){ ger.position.x=Math.sin(t*.3)*.6; gerW.rotation.y = Math.sin(t*.13)*.5; ember.material.color.setHex(Math.sin(t*1.3)>.6?0xffb050:0xff5a20); }
    // обнаружение
    const cover = inCover(asanW.position);
    if(!S.busy){
      let gain = 0;
      if(lit && len>0 && !cover) gain += .9;
      if(S.phase==='raid'){ const fwd=tmp.set(Math.sin(gerW.rotation.y),0,Math.cos(gerW.rotation.y)), to=tmp2.copy(asanW.position).sub(gerW.position).setY(0), d=to.length(); to.normalize();
        if(fwd.dot(to)>.45 && d<(lit?15:4.5) && (len>0 || d<2.2)) gain += 1.6; }
      S.detect = clamp(S.detect + (gain>0 ? gain*dt : -.3*dt), 0, 1);
      if(S.detect>=1) caught();
      if(cover && !lit && S.detect<.2) S.cp = asanW.position.clone();
    }
    seenEl.style.opacity = S.detect>.02 ? 1 : 0; seenEl.firstChild.style.width=(S.detect*100)+'%';
    // часовой: подобраться сзади или сбоку
    S.canGrab=false;
    if(S.phase==='raid' && !S.busy){ const to=tmp2.copy(asanW.position).sub(gerW.position).setY(0), d=to.length(); to.normalize(); const fwd=tmp.set(Math.sin(gerW.rotation.y),0,Math.cos(gerW.rotation.y));
      if(d<2.1 && fwd.dot(to)<.4 && !lit) S.canGrab=true; }
    const pr=$('prompt');
    if(S.canGrab){ tmp.copy(gerW.position); tmp.y=1.9; tmp.project(camera); pr.style.display='block'; pr.style.left=((tmp.x+1)/2*innerWidth)+'px'; pr.style.top=((1-tmp.y)/2*innerHeight)+'px'; pr.textContent=(isTouch?'':'[E] ')+U.grabPrompt; }
    else if(S.phase==='raid' && !S.busy && asanW.position.z<-22 && !lit){ tmp.copy(gerW.position); tmp.y=2.4; tmp.project(camera); pr.style.display='block'; pr.style.left=((tmp.x+1)/2*innerWidth)+'px'; pr.style.top=((1-tmp.y)/2*innerHeight)+'px'; pr.textContent=DAT.objectives.grab; }
    else pr.style.display='none';
    // тревога: немецкий пулемёт ищет их по развалинам
    if(S.alarm){ S.mgT=(S.mgT||0)-dt; if(S.mgT<=0){ S.mgT=rand(.05,.12); const tx=rand(-10,10), tz=rand(-14,4); tracer(tmp.copy(POST).setY(1.1), tmp2.set(tx,.3,tz)); if(Math.random()<.2) puff(tmp2.set(tx,.3,tz), dustTex, .5, .4, 1, 1.4); if(Math.random()<.3) noiseBurst({dur:.06,freq:1300,gain:.05}); } }
    // точки сюжета
    if(!S.busy && S.phase==='drag' && !S.alarmDone && asanW.position.z>-12) kolesnikovStays();
    if(!S.busy && (S.phase==='back'||S.phase==='drag') && asanW.position.z>33.2) raidEnd();
    camFollow(dt, S.camFocus ? S.camFocus.position : asanW.position);
  }

  function prisonersUpdate(dt,t){
    // колонна идёт без конца; мальчишка стоит, пока на него смотрят
    column.forEach((c,i)=>{ const p=c.p;
      if(c.fallen){ p.rotation.x=lerp(p.rotation.x,-Math.PI/2,dt*3); p.position.y=lerp(p.position.y,.25,dt*3); animWalk(p,0,dt); return; }
      p.position.x+=c.v*dt; if(p.position.x>PR.x+32) p.position.x-=62; animWalk(p,.45,dt); p.rotation.z=Math.sin(t*1.4+c.ph)*.04;
      if(Math.random()<dt*.5) puff(tmp.copy(p.position).add(new THREE.Vector3(.3,1.75,0)), steamTex, .25, 1.4, .3, 2.2); });
    escorts.forEach(e=>{ if(S.escortLook && e===escorts[0]){ e.lookAt(asanPr.position.x,0,asanPr.position.z); animWalk(e,0,dt); return; } e.rotation.y=Math.PI/2; e.position.x+=.6*dt; if(e.position.x>PR.x+32) e.position.x-=62; animWalk(e,.45,dt); });
    if(S.boyStops){ boy.lookAt(asanPr.position.x,0,asanPr.position.z); animWalk(boy,0,dt);
      if(Math.random()<dt*.7) puff(tmp.copy(boy.position).add(new THREE.Vector3(0,1.62,.25)), steamTex, .2, 1.3, .3, 2);
      if(Math.random()<dt*.7) puff(tmp.copy(asanPr.position).add(new THREE.Vector3(-.15,1.8,-.2)), steamTex, .2, 1.3, .3, 2); }
    else if(S.phase==='prisoners' && S.bread){ boy.rotation.y=Math.PI/2; boy.position.x+=.55*dt; boy.position.z=lerp(boy.position.z, PR.z-.1, dt*.4); animWalk(boy,.45,dt); }
    // хлеб: из руки Асана — в руку мальчишке, или за пазуху
    if(S.bread==='give'){ const a=asanPr.userData.armR; a.rotation.x=lerp(a.rotation.x,-1.45,dt*2); boy.userData.armR.rotation.x=lerp(boy.userData.armR.rotation.x,-1.2,dt*2);
      if(a.rotation.x<-1.3 && bread.parent===a){ boy.userData.armR.attach(bread); } if(bread.parent!==a){ bread.position.lerp(tmp.set(0,-.4,.12), dt*3); } }
    if(S.bread==='keep'){ const a=asanPr.userData.armR; a.rotation.x=lerp(a.rotation.x,-.2,dt*2); bread.position.lerp(tmp.set(-.1,0,.25), dt*2); }
    // снег
    const sp=snowGeo.attributes.position.array; for(let i=0;i<snowN;i++){ sp[i*3+1]-=dt*(.9+(i%5)*.15); sp[i*3]+=dt*(.6+Math.sin(t+i)*.2); if(sp[i*3+1]<0){ sp[i*3+1]=12; sp[i*3]=PR.x+rand(-25,25); } }
    snowGeo.attributes.position.needsUpdate=true;
  }

  return sc;
}
