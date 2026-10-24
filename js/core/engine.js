'use strict';
// three.js: рендер, камера, общие модели людей и коня
// ---------- three.js ----------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
let scene, camera, active = null; // active = текущая сцена-объект {update, onKey...}
camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, .1, 400);
addEventListener('resize',()=>{ renderer.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); sizeGrain(); });

const M = (color, o={}) => new THREE.MeshLambertMaterial(Object.assign({color}, o));
function shadowAll(g){ g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); return g; }

// ---------- текстуры: только те, что перечислены в tex/list.json (иначе — просто цвет) ----------
const TEX_LIST = new Set(), TEX_CACHE = {};
function TEX(name, rep=1){
  if(!name || !TEX_LIST.has(name)) return null;
  const key=name+'@'+rep; if(TEX_CACHE[key]) return TEX_CACHE[key];
  const [rx,ry]=Array.isArray(rep)?rep:[rep,rep];
  // фактура: картинку переводим в серую и выравниваем яркость (среднее ≈ .82), чтобы цвет задавал материал,
  // а фактура давала только рисунок — тогда и цветные, и серые картинки ложатся одинаково и не темнят сцену
  const t=new THREE.Texture(TEX_WHITE); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); t.anisotropy=4;
  const base=TEX_IMG[name] || (TEX_IMG[name]=new Promise(res=>{ const im=new Image(); im.onload=()=>{
      const s=Math.min(1024,im.width), cv=document.createElement('canvas'); cv.width=cv.height=s; const x=cv.getContext('2d'); x.drawImage(im,0,0,s,s);
      const d=x.getImageData(0,0,s,s), a=d.data; let sum=0; for(let i=0;i<a.length;i+=4){ const l=.3*a[i]+.59*a[i+1]+.11*a[i+2]; a[i]=l; sum+=l; }
      const mean=sum/(a.length/4)||1, k=209/mean; for(let i=0;i<a.length;i+=4){ const l=Math.min(255,a[i]*k); a[i]=a[i+1]=a[i+2]=l; }
      x.putImageData(d,0,0); res(cv); }; im.onerror=()=>res(null); im.src='tex/'+name; }));
  base.then(cv=>{ if(cv){ t.image=cv; t.needsUpdate=true; } });
  return TEX_CACHE[key]=t;
}
const TEX_IMG={};
const TEX_WHITE=(()=>{ const c=document.createElement('canvas'); c.width=c.height=2; const x=c.getContext('2d'); x.fillStyle='#d1d1d1'; x.fillRect(0,0,2,2); return c; })();
// материал с текстурой-фактурой (серой), которая умножается на цвет: одна ткань — разные цвета
const MT = (color, tex, rep=1, o={}) => { const map=TEX(tex,rep); return new THREE.MeshLambertMaterial(Object.assign({color}, map?{map}:{}, o)); };
const shade = (hex, k) => { const c=new THREE.Color(hex); c.multiplyScalar(k); return c.getHex(); };

// ---------- человек: пропорции ~7 голов, суставы (плечо—локоть, бедро—колено) ----------
// Совместимость со сценами: userData.armL/armR/legL/legR — шарниры в плече и бедре; предметы,
// которые сцены вешают на руку (armR.add), попадают в кисть-«якорь», как раньше на середину руки.
// Сидит (ноги вперёд) — тело само опускается, чтобы таз оставался на прежней высоте.
const PEOPLE = [];
const HIP = .92;
const _cyl = (rt, rb, h, seg=9) => new THREE.CylinderGeometry(rt, rb, h, seg);
function jointGroup(anchorY){
  const g=new THREE.Group(), anchor=new THREE.Group(); anchor.position.y=anchorY;
  g.userData.anchor=anchor;
  return g;
}
function finishJoint(g){
  const add0=THREE.Group.prototype.add; add0.call(g, g.userData.anchor);
  g.add=function(...o){ g.userData.anchor.add(...o); return g; };
  Object.defineProperty(g,'material',{ configurable:true,
    get(){ let m=null; g.traverse(o=>{ if(!m && o.isMesh) m=o.material; }); return m; },
    set(m){ g.traverse(o=>{ if(o.isMesh && !o.userData.keep) o.material=m; }); } });
  return g;
}
function makePerson({coat=0x6b5440, hat='borik', scale=1, scarf=null, beard=false, pants=null, long=null}={}){
  const g=new THREE.Group(), root=new THREE.Group(); g.add(root);
  const female = hat==='scarf', elder = beard || hat==='tymak';
  const isLong = long!==null ? long : (female || elder);
  const coatM=MT(coat,'cloth.jpg',2), pantsM=MT(pants!=null?pants:shade(coat,.78),'cloth.jpg',2);
  const skinM=MT(0xa8754f,'skin.jpg'), bootM=MT(0x241a12,'leather.jpg'), beltM=MT(0x3a2a1c,'leather.jpg');
  const hairM=M(0x15110d);
  const mesh=(geo,mat,x=0,y=0,z=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); return m; };

  // ноги: бедро → колено → сапог
  const leg=(side)=>{
    const L=jointGroup(-.4); L.position.set(side*.095,HIP,0);
    L.add(mesh(_cyl(.085,.064,.46),pantsM,0,-.23,0));
    const knee=new THREE.Group(); knee.position.y=-.45; L.add(knee);
    knee.add(mesh(_cyl(.064,.055,.4),bootM,0,-.2,0));
    const foot=mesh(new THREE.BoxGeometry(.1,.07,.25),bootM,0,-.435,.05); knee.add(foot);
    L.userData.knee=knee; return finishJoint(L);
  };
  const legL=leg(-1), legR=leg(1); root.add(legL,legR);

  // таз, торс (по профилю: талия → грудь → плечи), подол, ремень
  root.add(mesh(_cyl(.17,.165,.18,10),pantsM,0,HIP+.02,0));
  const prof=[[.155,0],[.17,.1],[.19,.26],[.205,.4],[.19,.48],[.12,.535],[.06,.55]].map(([r,y])=>new THREE.Vector2(r,y));
  const torso=mesh(new THREE.LatheGeometry(prof,12),coatM,0,HIP+.06,0); torso.scale.z=.66; root.add(torso);
  if(isLong){ // чапан, шинель, платье — длинный подол
    const sk=mesh(_cyl(.18,female?.27:.25,female?.78:.62,12),coatM,0,HIP+.08-(female?.39:.31),0); sk.scale.z=.8; root.add(sk);
  } else {
    const sk=mesh(_cyl(.172,.19,.2,12),coatM,0,HIP,0); sk.scale.z=.72; root.add(sk);
  }
  const belt=mesh(_cyl(.178,.178,.05,12),beltM,0,HIP+.11,0); belt.scale.z=.7; root.add(belt);

  // руки: плечо → локоть → кисть
  const SH=HIP+.51;
  const arm=(side)=>{
    const A=jointGroup(-.3); A.position.set(side*.215,SH,0);
    A.add(mesh(new THREE.SphereGeometry(.054,8,6),coatM,0,-.01,0));
    A.add(mesh(_cyl(.056,.047,.31),coatM,0,-.155,0));
    const elbow=new THREE.Group(); elbow.position.y=-.3; elbow.rotation.x=-.12; A.add(elbow);
    elbow.add(mesh(_cyl(.047,.04,.27),coatM,0,-.135,0));
    elbow.add(mesh(new THREE.BoxGeometry(.055,.1,.035),skinM,0,-.32,.005));
    A.rotation.z=side*.05; A.userData.elbow=elbow; return finishJoint(A);
  };
  const armL=arm(-1), armR=arm(1); root.add(armL,armR);

  // шея и голова (группа с шарниром в шее — можно кивать)
  root.add(mesh(_cyl(.048,.055,.1,8),skinM,0,SH+.06,0));
  const headG=new THREE.Group(); headG.position.y=SH+.1; root.add(headG);
  const HY=.13;
  const skull=mesh(new THREE.SphereGeometry(.105,14,12),skinM,0,HY,0); skull.scale.set(.95,1.16,1.05); headG.add(skull);
  const jaw=mesh(new THREE.SphereGeometry(.078,10,8),skinM,0,HY-.06,.005); jaw.scale.set(.92,.75,.92); headG.add(jaw);
  headG.add(mesh(new THREE.BoxGeometry(.028,.045,.04),skinM,0,HY-.005,.105));
  for(const s of [-1,1]){ const e=mesh(new THREE.SphereGeometry(.024,6,5),skinM,s*.1,HY,0); e.scale.set(.5,1,.8); headG.add(e);
    headG.add(mesh(new THREE.BoxGeometry(.03,.012,.01),hairM,s*.038,HY+.03,.098)); // брови
    headG.add(mesh(new THREE.SphereGeometry(.011,6,4),hairM,s*.036,HY+.008,.097)); } // глаза
  if(hat==='none' || hat==='pilotka' || hat==='borik'){ const hr=mesh(new THREE.SphereGeometry(.11,12,8,0,Math.PI*2,0,Math.PI*.42),hairM,0,HY+.012,-.008); hr.scale.set(.97,1.12,1.06); headG.add(hr); }
  if(beard){ const b=mesh(new THREE.ConeGeometry(.06,.15,8),M(0xb8b2a4),0,HY-.15,.055); b.rotation.x=Math.PI+.35; headG.add(b);
    const mu=mesh(new THREE.BoxGeometry(.07,.014,.015),M(0xb8b2a4),0,HY-.05,.1); headG.add(mu); }
  const TOP=HY+.122;
  if(hat==='tymak'){ // меховой тымақ: тулья, красный верх, уши и назатыльник
    const fur=MT(0x5a4430,'fur.jpg');
    headG.add(mesh(_cyl(.118,.13,.13,12),fur,0,TOP-.02,0));
    headG.add(mesh(new THREE.ConeGeometry(.118,.11,12),MT(0x7a2a22,'cloth.jpg'),0,TOP+.1,0));
    const back=mesh(new THREE.BoxGeometry(.26,.2,.04),fur,0,HY-.03,-.11); back.rotation.x=.15; headG.add(back);
    for(const s of [-1,1]){ const f=mesh(new THREE.BoxGeometry(.04,.16,.12),fur,s*.12,HY-.03,-.01); headG.add(f); }
  } else if(hat==='borik'){
    headG.add(mesh(_cyl(.11,.118,.08,12),MT(0x3c3026,'cloth.jpg'),0,TOP-.005,0));
    headG.add(mesh(_cyl(.122,.124,.04,12),MT(0x2c2218,'fur.jpg'),0,TOP-.045,0));
  } else if(hat==='scarf'){ // платок: обтягивает голову, узел и концы сзади
    const sm=MT(scarf||0xb8a888,'cloth.jpg');
    const s=mesh(new THREE.SphereGeometry(.122,14,10,0,Math.PI*2,0,Math.PI*.62),sm,0,HY+.005,-.006); s.scale.set(.98,1.12,1.06); headG.add(s);
    const tail=mesh(new THREE.ConeGeometry(.07,.2,6),sm,0,HY-.12,-.09); tail.rotation.x=-.2; headG.add(tail);
  } else if(hat==='helmet'){ // немецкая каска М35: купол с напуском на уши и шею
    const hm=MT(0x4a4e44,'metal.jpg');
    const d=mesh(new THREE.SphereGeometry(.14,14,8,0,Math.PI*2,0,Math.PI/2),hm,0,HY+.02,0); d.scale.set(1,.92,1.1); headG.add(d);
    const sk=mesh(new THREE.CylinderGeometry(.142,.165,.07,14,1,true),hm,0,HY-.01,-.005); sk.material=MT(0x4a4e44,'metal.jpg',1,{side:THREE.DoubleSide}); sk.scale.z=1.08; headG.add(sk);
  } else if(hat==='ssh'){ // советская каска СШ-40: круглый купол, короткий поля по кругу
    const hm=MT(0x4a5236,'metal.jpg');
    const d=mesh(new THREE.SphereGeometry(.135,14,8,0,Math.PI*2,0,Math.PI/2),hm,0,HY+.025,0); d.scale.set(1,.95,1.05); headG.add(d);
    headG.add(mesh(new THREE.CylinderGeometry(.14,.152,.035,14,1,true),MT(0x4a5236,'metal.jpg',1,{side:THREE.DoubleSide}),0,HY+.01,0));
  } else if(hat==='pilotka'){ // пилотка набок
    const pm=MT(0x6a6640,'cloth.jpg');
    const p=mesh(new THREE.BoxGeometry(.2,.06,.12),pm,.012,TOP-.035,0); p.rotation.z=.14; headG.add(p);
    const r=mesh(new THREE.BoxGeometry(.215,.03,.13),pm,.012,TOP-.07,0); r.rotation.z=.14; headG.add(r);
    headG.add(mesh(new THREE.BoxGeometry(.018,.018,.005),M(0x8a2018),.01,TOP-.045,.063)); // звёздочка
  }
  g.add=function(...o){ // старые сцены ставили предметы по прежней, более толстой фигуре — придвигаем их к телу
    for(const it of o){ const q=it.position; if(q.y>.45 && q.y<1.7){ if(Math.abs(q.x)>.22 && Math.abs(q.x)<.5) q.x*=.62; if(Math.abs(q.z)>.14 && Math.abs(q.z)<.45) q.z*=.6; } }
    root.add(...o); return g; }; // то, что сцены вешают на фигуру (сумка, винтовка за спиной), садится вместе с телом
  g.scale.setScalar(scale);
  g.userData={legL,legR,armL,armR,head:headG,root,phase:0, kneeL:legL.userData.knee, kneeR:legR.userData.knee, elbowL:armL.userData.elbow, elbowR:armR.userData.elbow};
  PEOPLE.push(g);
  return shadowAll(g);
}
// каждый кадр: сидит — опустить тело и согнуть колени; иначе колени по шагу
function updatePeople(){
  for(const p of PEOPLE){
    const u=p.userData; if(!u.root) continue;
    const lift=-(u.legL.rotation.x+u.legR.rotation.x)/2;
    const k=Math.min(1,Math.max(0,(lift-.7)/.6));
    u.root.position.y=-.24*k;
    if(k>0){ u.kneeL.rotation.x=u.kneeR.rotation.x=1.35*k; }
    else if(!u.walking){ u.kneeL.rotation.x=Math.max(0,u.legL.rotation.x)*.9; u.kneeR.rotation.x=Math.max(0,u.legR.rotation.x)*.9; }
    u.walking=false;
  }
}
function animWalk(p, speed, dt){
  const u=p.userData; u.phase += dt*speed*7;
  const s = speed>0.05 ? Math.sin(u.phase)*.5 : 0;
  u.legL.rotation.x = s; u.legR.rotation.x = -s;
  if(u.kneeL){ u.walking=true; const c=speed>0.05?Math.cos(u.phase):0; u.kneeL.rotation.x=Math.max(0,c)*.7+(s>0?s*.4:0); u.kneeR.rotation.x=Math.max(0,-c)*.7+(s<0?-s*.4:0); }
  if(!u.carry){ u.armL.rotation.x = -s*.6; u.armR.rotation.x = s*.6; }
}

// Обработчики мыши/касаний/клавиш, которые ставит сцена: снимаются при переходе к следующей,
// иначе старая сцена продолжает ловить нажатия в новой
const SCENE_LISTENERS = [];
function listen(target, type, fn, opts){ target.addEventListener(type, fn, opts); SCENE_LISTENERS.push([target, type, fn, opts]); }
function clearSceneListeners(){ while(SCENE_LISTENERS.length){ const [t,ty,f,o]=SCENE_LISTENERS.pop(); t.removeEventListener(ty,f,o); } }

// Перед каждой сценой: снять с камеры всё, что к ней прикрепила прошлая сцена (трава переднего плана),
// и вернуть обычный объектив
function resetCamera(){
  // камера, добавленная в прошлую сцену, остаётся её ребёнком: рендерер тогда не обновляет её матрицу,
  // и новая сцена снимается со старой точки. Поэтому отвязываем её.
  PEOPLE.length=0; clearSceneListeners(); for(const k in keys) keys[k]=false; MoveRef.yaw=null;
  if(camera.parent) camera.parent.remove(camera);
  camera.matrixAutoUpdate=true;
  while(camera.children.length) camera.remove(camera.children[0]);
  camera.fov=45; camera.rotation.order='XYZ'; camera.updateProjectionMatrix();
  cine(false); $('vig').style.background=''; canvas.style.cursor='';
}
