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

// простая фигура человека: тело, голова, шапка, ноги — читается сверху
function makePerson({coat=0x6b5440, hat='borik', scale=1, scarf=null, beard=false}={}){
  const g = new THREE.Group();
  const coatM = M(coat), skin = M(0xb08060), boots = M(0x2a2018);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(.18,.7,.2), boots); legL.position.set(-.12,.35,0);
  const legR = legL.clone(); legR.position.x = .12;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.26,.38,1.05,8), coatM); body.position.y = 1.1;
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.08,8), M(0x3a2a1c)); belt.position.y=1.0;
  const armL = new THREE.Mesh(new THREE.BoxGeometry(.14,.75,.16), coatM); armL.position.set(-.37,1.15,0);
  const armR = armL.clone(); armR.position.x=.37;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.2,10,8), skin); head.position.y = 1.82;
  g.add(legL,legR,body,belt,armL,armR,head);
  if(beard){ const b=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,6), M(0xd8d2c4)); b.position.set(0,1.66,.12); b.rotation.x=Math.PI; g.add(b); }
  if(hat==='tymak'){ // меховой тымақ с ушами
    const h=new THREE.Mesh(new THREE.CylinderGeometry(.2,.25,.26,8), M(0x5a4430)); h.position.y=1.98;
    const top=new THREE.Mesh(new THREE.ConeGeometry(.2,.18,8), M(0x7a2a22)); top.position.y=2.19;
    const flap=new THREE.Mesh(new THREE.BoxGeometry(.5,.32,.06), M(0x5a4430)); flap.position.set(0,1.78,-.18);
    g.add(h,top,flap);
  } else if(hat==='borik'){
    const h=new THREE.Mesh(new THREE.CylinderGeometry(.19,.22,.16,10), M(0x3c3026)); h.position.y=1.98; g.add(h);
  } else if(hat==='scarf'){
    const h=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8,0,Math.PI*2,0,Math.PI/1.8), M(scarf||0xb8a888)); h.position.y=1.86; g.add(h);
  } else if(hat==='helmet'){ // немецкая каска
    const h=new THREE.Mesh(new THREE.SphereGeometry(.25,10,6,0,Math.PI*2,0,Math.PI/2), M(0x4a4e44)); h.position.y=1.9; h.scale.set(1,1,1.08);
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(.28,.3,.05,10), M(0x40443a)); rim.position.y=1.9; g.add(h,rim);
  } else if(hat==='pilotka'){
    const h=new THREE.Mesh(new THREE.BoxGeometry(.32,.1,.18), M(0x6a6640)); h.position.y=2.0; g.add(h);
  }
  g.scale.setScalar(scale);
  g.userData = {legL,legR,armL,armR,phase:0};
  return shadowAll(g);
}
function makeHorse(col=0x4a3222){
  const horse=new THREE.Group(), m=M(col), lm=M(0x3a2618);
  const hb=new THREE.Mesh(new THREE.BoxGeometry(.7,.8,2),m); hb.position.y=1.3;
  const hn=new THREE.Mesh(new THREE.BoxGeometry(.4,.9,.45),m); hn.position.set(0,1.85,1.05); hn.rotation.x=-.5;
  const tail=new THREE.Mesh(new THREE.BoxGeometry(.12,.7,.12),lm); tail.position.set(0,1.2,-1.05); tail.rotation.x=.5;
  horse.add(hb,hn,tail); const legs=[];
  for(const [x,z] of [[-.25,.8],[.25,.8],[-.25,-.8],[.25,-.8]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.15,1,.15),lm); l.geometry.translate(0,-.5,0); l.position.set(x,1,z); horse.add(l); legs.push(l); }
  horse.userData.legs=legs; return shadowAll(horse);
}
function animWalk(p, speed, dt){
  const u=p.userData; u.phase += dt*speed*7;
  const s = speed>0.05 ? Math.sin(u.phase)*.5 : 0;
  u.legL.rotation.x = s; u.legR.rotation.x = -s;
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
  clearSceneListeners(); for(const k in keys) keys[k]=false; MoveRef.yaw=null;
  if(camera.parent) camera.parent.remove(camera);
  camera.matrixAutoUpdate=true;
  while(camera.children.length) camera.remove(camera.children[0]);
  camera.fov=45; camera.rotation.order='XYZ'; camera.updateProjectionMatrix();
  cine(false); $('vig').style.background=''; canvas.style.cursor='';
}
