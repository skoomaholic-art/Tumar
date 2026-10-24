'use strict';
// Общая библиотека моделей: животные, юрта, дома, мебель, мост, телега, техника, деревья.
// Всё собрано из простых тел, но с правильными пропорциями и деталями; поверхности берут
// фактуры из tex/ (если файл есть в tex/list.json), иначе — просто цвет.
// Направления: животные и техника смотрят вдоль +z (как прежний makeHorse), если не сказано иное.

const P_ = {
  mesh(geo, mat, x=0, y=0, z=0){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); return m; },
  cyl: (rt, rb, h, seg=8, open=false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open),
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  sph: (r, ws=10, hs=8) => new THREE.SphereGeometry(r, ws, hs),
  rot(m, x=0, y=0, z=0){ m.rotation.set(x,y,z); return m; },
  // палка между двумя точками (жерди, стропила, перила)
  beam(a, b, r, mat){ const d=new THREE.Vector3().subVectors(b,a), L=d.length(); const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,6),mat);
    m.position.copy(a).addScaledVector(d,.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), d.normalize()); return m; },
};
// материалы-заготовки (цвет × фактура)
const MAT = {
  wood: (c=0x6a5038, rep=1) => MT(c,'wood.jpg',rep),
  logs: (c=0x6a5038, rep=1) => MT(c,'logs.jpg',rep),
  adobe:(c=0x9a8466, rep=1) => MT(c,'adobe.jpg',rep),
  plaster:(c=0xd8d0bc, rep=1) => MT(c,'plaster.jpg',rep),
  brick:(c=0x8a4a36, rep=1) => MT(c,'brick.jpg',rep),
  felt: (c=0xd2c6ac, rep=1) => MT(c,'felt.jpg',rep),
  hay:  (c=0xc8a860, rep=1) => MT(c,'hay.jpg',rep),
  metal:(c=0x4a4e44, rep=1) => MT(c,'metal.jpg',rep),
  cloth:(c=0x6a6448, rep=1) => MT(c,'cloth.jpg',rep),
  fur:  (c=0x5a4430, rep=1) => MT(c,'fur.jpg',rep),
};

// ---------- животные ----------
// Конь: бочка-корпус, шея с гривой, вытянутая голова, ноги с коленом и копытом. legs — шарниры у корпуса.
function makeHorse(col=0x4a3222){
  const g=new THREE.Group(), m=MT(col,'fur.jpg'), dark=MT(shade(col,.55),'fur.jpg'), hoof=M(0x1e1812);
  const body=P_.mesh(P_.sph(.5,14,10),m,0,1.32,0); body.scale.set(.82,.82,1.75); g.add(body);
  g.add(P_.mesh(P_.sph(.42,12,8),m,0,1.36,.62)); // грудь
  g.add(P_.mesh(P_.sph(.44,12,8),m,0,1.38,-.66)); // круп
  const neck=new THREE.Group(); neck.position.set(0,1.55,.9); neck.rotation.x=.62; g.add(neck);
  const nk=P_.mesh(P_.cyl(.16,.28,.85,10),m,0,.38,0); nk.scale.z=.8; neck.add(nk);
  const mane=P_.mesh(P_.box(.05,.8,.14),dark,0,.42,-.16); neck.add(mane);
  const head=new THREE.Group(); head.position.set(0,.8,0); head.rotation.x=1.75; neck.add(head);
  const hd=P_.mesh(P_.cyl(.1,.16,.58,9),m,0,.22,0); hd.scale.z=.85; head.add(hd);
  head.add(P_.mesh(P_.sph(.105,8,6),dark,0,.5,0)); // морда
  for(const s of [-1,1]){ const e=P_.mesh(new THREE.ConeGeometry(.04,.14,5),m,s*.07,.0,-.1); e.rotation.x=-2.3; head.add(e);
    head.add(P_.mesh(P_.sph(.022,6,4),M(0x0c0a08),s*.11,.12,.05)); }
  const tail=new THREE.Group(); tail.position.set(0,1.5,-1.02); tail.rotation.x=.45; g.add(tail);
  const tl=P_.mesh(P_.cyl(.07,.03,.75,6),dark,0,-.36,0); tail.add(tl);
  const legs=[];
  for(const [x,z,back] of [[-.22,.72,0],[.22,.72,0],[-.22,-.72,1],[.22,-.72,1]]){
    const L=new THREE.Group(); L.position.set(x,1.12,z);
    const up=P_.mesh(P_.cyl(.11,.075,.5,7),m,0,-.25,0); L.add(up);
    const kn=new THREE.Group(); kn.position.y=-.5; if(back) kn.rotation.x=-.12; L.add(kn);
    kn.add(P_.mesh(P_.cyl(.055,.05,.5,6),m,0,-.25,0));
    kn.add(P_.mesh(P_.cyl(.06,.075,.1,7),hoof,0,-.55,0));
    g.add(L); legs.push(L);
  }
  g.userData.legs=legs; g.userData.neck=neck; g.userData.tail=tail;
  return shadowAll(g);
}
// Овца/баран: шерстяной «облаком» корпус, тёмная голова; смотрит вдоль +x. userData: neck (поворот z), legs (поворот z)
function makeSheep(wool=0xe2d6bc, sc=1){
  const g=new THREE.Group(), wm=MAT.felt(wool), hm=M(0x2e2620);
  for(const [x,y,z,r] of [[0,.62,0,.42],[.22,.66,.08,.3],[-.24,.64,-.06,.32],[.05,.78,0,.3],[-.12,.6,.16,.28],[.1,.58,-.16,.28]]){
    const b=P_.mesh(P_.sph(r,9,7),wm,x,y,z); b.scale.set(1.25,.95,.95); g.add(b); }
  const neck=new THREE.Group(); neck.position.set(.5,.74,0); g.add(neck);
  const head=P_.mesh(P_.box(.28,.17,.16),hm,.15,0,0); neck.add(head);
  neck.add(P_.mesh(P_.sph(.1,7,5),wm,.02,.06,0));
  for(const s of [-1,1]){ const e=P_.mesh(P_.box(.05,.03,.12),hm,.05,.03,s*.11); e.rotation.x=s*.4; neck.add(e); }
  const legs=[]; for(const [x,z] of [[.28,.15],[.28,-.15],[-.28,.15],[-.28,-.15]]){ const l=new THREE.Group(); l.position.set(x,.44,z);
    l.add(P_.mesh(P_.cyl(.035,.03,.44,5),hm,0,-.22,0)); g.add(l); legs.push(l); }
  g.scale.setScalar(sc);
  g.userData={neck,legs};
  return shadowAll(g);
}
// Корова: смотрит вдоль +x
function makeCow(col=0x5a4636){
  const g=new THREE.Group(), m=MT(col,'fur.jpg'), d=M(0x2a221a);
  const b=P_.mesh(P_.sph(.5,12,8),m,0,.95,0); b.scale.set(1.6,.85,.75); g.add(b);
  const neck=new THREE.Group(); neck.position.set(.72,1.02,0); neck.rotation.z=-.35; g.add(neck);
  neck.add(P_.rot(P_.mesh(P_.cyl(.18,.24,.4,8),m,.15,0,0),0,0,Math.PI/2));
  const h=P_.mesh(P_.box(.42,.26,.26),m,.42,-.08,0); neck.add(h);
  neck.add(P_.mesh(P_.box(.14,.18,.22),M(0x8a7464),.62,-.14,0));
  for(const s of [-1,1]){ const hn=P_.mesh(new THREE.ConeGeometry(.025,.16,5),M(0xd8ccb4),.32,.1,s*.14); hn.rotation.x=s*-.9; neck.add(hn); }
  for(const [x,z] of [[.5,.2],[.5,-.2],[-.5,.2],[-.5,-.2]]) g.add(P_.mesh(P_.cyl(.07,.055,.62,6),m,x,.31,z));
  g.add(P_.rot(P_.mesh(P_.cyl(.03,.02,.6,4),d,-.8,.75,0),0,0,.25));
  return shadowAll(g);
}

// ---------- юрта ----------
// стенки-кереге, купол из уықов, шаңырақ, дверь с резной рамой, тканые ленты
function makeYurt(r=2.4, opt={}){
  const g=new THREE.Group(), felt=MAT.felt(opt.felt||0xd2c6ac,2), band=MAT.cloth(0x8e2a20), wd=MAT.wood(0x7a5232);
  const H=opt.h||r*.62;
  g.add(P_.mesh(P_.cyl(r,r*1.01,H,24),felt,0,H/2,0));
  // купол — профиль чуть выпуклый
  const prof=[]; for(let i=0;i<=8;i++){ const k=i/8; prof.push(new THREE.Vector2(r*(1-k)*(1+.08*Math.sin(k*Math.PI))+.001+r*.16*k, H+r*.55*Math.pow(k,.85))); }
  const dome=P_.mesh(new THREE.LatheGeometry(prof,24),felt); g.add(dome);
  g.add(P_.mesh(P_.cyl(r*.17,r*.17,.12,16),wd,0,H+r*.56,0)); // шаңырақ
  for(let i=0;i<4;i++){ const b=P_.mesh(P_.box(r*.34,.04,.04),wd,0,H+r*.62,0); b.rotation.y=i*Math.PI/4; g.add(b); }
  for(const y of [H*.55, H*.95]) g.add(P_.mesh(P_.cyl(r*1.012,r*1.012,.12,24,true),band,0,y,0));
  // обвязка купола верёвками
  if(opt.ropes!==false) for(let i=0;i<8;i++){ const a=i*Math.PI/4; g.add(P_.beam(new THREE.Vector3(Math.cos(a)*r*1.02,H+.02,Math.sin(a)*r*1.02), new THREE.Vector3(Math.cos(a)*r*.2,H+r*.55,Math.sin(a)*r*.2), .015, MAT.cloth(0x5a4a34))); }
  // дверь (на +z)
  const dg=new THREE.Group(); dg.position.set(0,0,r*1.0); g.add(dg);
  dg.add(P_.mesh(P_.box(.92,1.5,.08),wd,0,.75,.02));
  dg.add(P_.mesh(P_.box(.74,1.3,.06),MAT.wood(0xa0622e),0,.72,.06));
  dg.add(P_.mesh(P_.box(.62,.12,.02),band,0,1.12,.1));
  g.userData.door=dg;
  return shadowAll(g);
}

// ---------- постройки ----------
// зимовка/саманный дом: толстые стены, плоская земляная кровля с напуском, дверь, окно с рамой, труба
function makeAdobeHouse(w=6, d=4.4, opt={}){
  const g=new THREE.Group(), wall=MAT.adobe(opt.wall||0x9a8466,2), roof=MAT.adobe(0x6e5e46,2), wd=MAT.wood(0x4a3828);
  const H=opt.h||2.4;
  const body=P_.mesh(P_.box(w,H,d),wall,0,H/2,0); g.add(body);
  g.add(P_.mesh(P_.box(w+.5,.3,d+.6),roof,0,H+.12,0));
  g.add(P_.mesh(P_.box(w+.3,.18,d+.4),MAT.wood(0x5e4834),0,H-.05,0)); // балки-матица
  for(let i=0;i<Math.round(w/0.7);i++) g.add(P_.rot(P_.mesh(P_.cyl(.06,.06,.4,5),wd,-w/2+.35+i*.7,H-.05,d/2+.22),Math.PI/2));
  const door=P_.mesh(P_.box(.9,1.75,.1),wd,w*.17,.88,d/2+.02); g.add(door);
  g.add(P_.mesh(P_.box(1.08,.12,.14),wd,w*.17,1.8,d/2+.03));
  const win=new THREE.Group(); win.position.set(-w*.27,1.45,d/2+.02); g.add(win);
  win.add(P_.mesh(P_.box(.82,.66,.08),wd)); const glass=P_.mesh(P_.box(.66,.5,.09),M(0x24262a)); win.add(glass);
  win.add(P_.mesh(P_.box(.04,.5,.1),wd)); win.add(P_.mesh(P_.box(.66,.04,.1),wd));
  const ch=P_.mesh(P_.box(.5,.8,.5),MAT.adobe(0x7e6a50),-w*.3,H+.6,-d*.2); g.add(ch);
  g.userData={door,win,glass,chimney:ch};
  return shadowAll(g);
}
// дом австрийского хутора: белёный низ, дощатый верх, крутая двускатная крыша с напуском, окна со ставнями
function makeFarmHouse(w=9, d=6.5, opt={}){
  const g=new THREE.Group(), pl=MAT.plaster(opt.wall||0xd8d0bc,2), wd=MAT.wood(0x5a4430,2), roofM=MT(opt.roof||0x5a3a2a,'shingles.jpg',3);
  const H1=2.6, H2=2.0;
  g.add(P_.mesh(P_.box(w,H1,d),pl,0,H1/2,0));
  g.add(P_.mesh(P_.box(w+.1,H2,d+.1),MAT.logs(0x6a5038,2),0,H1+H2/2,0));
  // крыша: два ската
  const rise=d*.42, slope=Math.hypot(d/2+.7,rise);
  for(const s of [-1,1]){ const r=P_.mesh(P_.box(w+1.4,.16,slope),roofM,0,H1+H2+rise/2,s*(d/4+.17)); r.rotation.x=s*Math.atan2(rise,d/2+.7); g.add(r); }
  const gable=new THREE.Shape(); gable.moveTo(-d/2,0); gable.lineTo(d/2,0); gable.lineTo(0,rise); gable.closePath();
  for(const s of [-1,1]){ const gm=P_.mesh(new THREE.ShapeGeometry(gable),MAT.logs(0x6a5038),s*(w/2+.05),H1+H2,0); gm.rotation.y=s*Math.PI/2; gm.material=MAT.logs(0x6a5038); gm.material.side=THREE.DoubleSide; g.add(gm); }
  // окна со ставнями по длинной стороне (+z)
  const wins=[]; const n=Math.max(2,Math.round(w/2.6));
  for(let i=0;i<n;i++){ const x=-w/2+w*(i+.5)/n; for(const y of [1.5, H1+1.0]){ const wg=new THREE.Group(); wg.position.set(x,y,d/2+.03); g.add(wg);
    wg.add(P_.mesh(P_.box(.9,1.0,.06),MAT.wood(0x3e3024))); const gl=P_.mesh(P_.box(.74,.84,.07),M(0x2a2e30)); wg.add(gl);
    wg.add(P_.mesh(P_.box(.04,.84,.08),MAT.wood(0x3e3024))); wg.add(P_.mesh(P_.box(.74,.04,.08),MAT.wood(0x3e3024)));
    for(const s of [-1,1]) wg.add(P_.mesh(P_.box(.4,1.0,.05),MAT.wood(0x4a5a3a),s*.66,0,.01)); wins.push(gl); } }
  const door=P_.mesh(P_.box(1.1,2.1,.1),MAT.wood(0x4a3424),w*.18+.6,1.05,d/2+.04); g.add(door);
  g.add(P_.mesh(P_.box(1.6,.12,.8),roofM,w*.18+.6,2.35,d/2+.35)); // козырёк
  g.userData={door,wins};
  return shadowAll(g);
}
// деревянный барак лагеря: доски, низкая двускатная крыша толем, маленькие окна
function makeBarrack(w=14, d=6, opt={}){
  const g=new THREE.Group(), wd=MAT.wood(opt.wall||0x5e5040,3), roof=MAT.metal(0x2e2c28,3);
  const H=2.5, rise=1.2, slope=Math.hypot(d/2+.4,rise);
  g.add(P_.mesh(P_.box(w,H,d),wd,0,H/2,0));
  for(const s of [-1,1]){ const r=P_.mesh(P_.box(w+.6,.1,slope),roof,0,H+rise/2,s*(d/4+.1)); r.rotation.x=s*Math.atan2(rise,d/2+.4); g.add(r); }
  const gable=new THREE.Shape(); gable.moveTo(-d/2,0); gable.lineTo(d/2,0); gable.lineTo(0,rise); gable.closePath();
  for(const s of [-1,1]){ const gm=P_.mesh(new THREE.ShapeGeometry(gable),wd,s*(w/2+.01),H,0); gm.rotation.y=s*Math.PI/2; gm.material=MAT.wood(opt.wall||0x5e5040); gm.material.side=THREE.DoubleSide; g.add(gm); }
  for(let i=0;i<Math.floor(w/3);i++){ const x=-w/2+1.5+i*3; for(const s of [-1,1]) g.add(P_.mesh(P_.box(.7,.5,.06),M(0x1e2022),x,1.7,s*(d/2+.02))); }
  g.add(P_.rot(P_.mesh(P_.box(1,1.9,.08),MAT.wood(0x3a3024),w/2+.03,.95,0),0,Math.PI/2));
  g.add(P_.mesh(P_.box(w+.2,.25,d+.2),MAT.wood(0x3a3228),0,.12,0)); // цоколь
  return shadowAll(g);
}
// сарай/амбар: дощатые стены, широкие ворота, двускатная крыша
function makeBarn(w=8, d=6, opt={}){
  const g=new THREE.Group(), wd=MAT.wood(opt.wall||0x6a5038,3), roof=MT(0x4a3426,'shingles.jpg',3);
  const H=opt.h||3.2, rise=d*.38, slope=Math.hypot(d/2+.5,rise);
  g.add(P_.mesh(P_.box(w,H,d),wd,0,H/2,0));
  for(const s of [-1,1]){ const r=P_.mesh(P_.box(w+.8,.14,slope),roof,0,H+rise/2,s*(d/4+.12)); r.rotation.x=s*Math.atan2(rise,d/2+.5); g.add(r); }
  const gable=new THREE.Shape(); gable.moveTo(-d/2,0); gable.lineTo(d/2,0); gable.lineTo(0,rise); gable.closePath();
  for(const s of [-1,1]){ const gm=P_.mesh(new THREE.ShapeGeometry(gable),wd,s*(w/2+.01),H,0); gm.rotation.y=s*Math.PI/2; gm.material=MAT.wood(opt.wall||0x6a5038); gm.material.side=THREE.DoubleSide; g.add(gm); }
  const gate=P_.mesh(P_.box(2.6,2.6,.1),MAT.wood(0x4a3828),0,1.3,d/2+.04); g.add(gate);
  g.add(P_.beam(new THREE.Vector3(-1.25,.05,d/2+.11),new THREE.Vector3(1.25,2.55,d/2+.11),.04,MAT.wood(0x3a2c20)));
  g.userData={gate};
  return shadowAll(g);
}

// ---------- мебель и утварь ----------
function makeTable(w=1.6, d=.8, h=.76, opt={}){
  const g=new THREE.Group(), wd=MAT.wood(opt.col||0x6a5038);
  g.add(P_.mesh(P_.box(w,.05,d),wd,0,h-.025,0));
  g.add(P_.mesh(P_.box(w-.12,.1,d-.12),wd,0,h-.1,0)); // царга
  for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(P_.mesh(P_.box(.06,h-.05,.06),wd,sx*(w/2-.08),(h-.05)/2,sz*(d/2-.08)));
  return shadowAll(g);
}
// низкий казахский стол (дастархан-үстел)
function makeLowTable(r=.6){
  const g=new THREE.Group(), wd=MAT.wood(0x7a5232);
  g.add(P_.mesh(P_.cyl(r,r,.05,20),wd,0,.32,0));
  for(let i=0;i<4;i++){ const a=i*Math.PI/2+Math.PI/4; g.add(P_.mesh(P_.box(.06,.3,.06),wd,Math.cos(a)*r*.7,.15,Math.sin(a)*r*.7)); }
  return shadowAll(g);
}
function makeBench(w=1.8, h=.45, opt={}){
  const g=new THREE.Group(), wd=MAT.wood(opt.col||0x6a5038);
  g.add(P_.mesh(P_.box(w,.05,.32),wd,0,h,0));
  for(const s of [-1,1]){ g.add(P_.mesh(P_.box(.05,h,.28),wd,s*(w/2-.15),h/2,0)); }
  g.add(P_.mesh(P_.box(w-.4,.04,.04),wd,0,h*.35,0));
  return shadowAll(g);
}
function makeStool(h=.45){
  const g=new THREE.Group(), wd=MAT.wood(0x6a5038);
  g.add(P_.mesh(P_.cyl(.17,.17,.05,10),wd,0,h,0));
  for(let i=0;i<3;i++){ const a=i*Math.PI*2/3; const l=P_.mesh(P_.cyl(.02,.025,h,5),wd,Math.cos(a)*.11,h/2,Math.sin(a)*.11); l.rotation.z=Math.cos(a)*.12; l.rotation.x=-Math.sin(a)*.12; g.add(l); }
  return shadowAll(g);
}
function makeChair(){
  const g=makeStool(.46);
  g.add(P_.mesh(P_.box(.04,.5,.04),MAT.wood(0x6a5038),-.12,.7,-.14)); g.add(P_.mesh(P_.box(.04,.5,.04),MAT.wood(0x6a5038),.12,.7,-.14));
  g.add(P_.mesh(P_.box(.3,.1,.03),MAT.wood(0x6a5038),0,.86,-.14));
  return shadowAll(g);
}
function makeCrate(s=.6, col=0x7a6040){ const g=new THREE.Group(), wd=MAT.wood(col); g.add(P_.mesh(P_.box(s,s*.7,s*.7),wd,0,s*.35,0));
  for(const x of [-1,1]) g.add(P_.mesh(P_.box(.04,s*.72,s*.72),MAT.wood(shade(col,.7)),x*s*.45,s*.35,0)); return shadowAll(g); }
function makeBarrel(r=.3, h=.8){ const g=new THREE.Group(); const prof=[[r*.85,0],[r,h*.5],[r*.85,h]].map(([a,b])=>new THREE.Vector2(a,b));
  g.add(P_.mesh(new THREE.LatheGeometry(prof,14),MAT.wood(0x6a4a30)));
  for(const y of [.12,.5,.88]) g.add(P_.mesh(P_.cyl(r*(y===.5?1.01:.9),r*(y===.5?1.01:.9),.04,14,true),M(0x2a2a2a),0,h*y,0));
  g.add(P_.mesh(P_.cyl(r*.84,r*.84,.02,14),MAT.wood(0x5a3e28),0,h,0)); return shadowAll(g); }
function makeHaystack(r=1.4){ const g=new THREE.Group(), h=MAT.hay(0xc8a860,2);
  const prof=[]; for(let i=0;i<=8;i++){ const k=i/8; prof.push(new THREE.Vector2(r*Math.sin((1-k)*Math.PI/2+.05)*(1+.06*Math.sin(k*9)), r*1.2*k)); }
  g.add(P_.mesh(new THREE.LatheGeometry(prof,16),h)); g.add(P_.mesh(P_.cyl(.04,.04,.6,4),MAT.wood(),0,r*1.25,0)); return shadowAll(g); }

// ---------- ограды, мосты, дороги ----------
// жердевая ограда из точек [[x,z],...]: столбы и 2–3 жерди
function makeFence(pts, opt={}){
  const g=new THREE.Group(), post=MAT.wood(opt.post||0x5e4430), rail=MAT.wood(opt.rail||0x7a5a3a), rails=opt.rails||[.4,.95];
  for(let i=0;i<pts.length;i++){ const [x,z]=pts[i]; const p=P_.mesh(P_.cyl(.07,.09,(opt.h||1.2),6),post,x,(opt.h||1.2)/2,z); p.rotation.z=(Math.sin(i*7.3)*.04); g.add(p);
    if(i){ const [x0,z0]=pts[i-1]; for(const y of rails) g.add(P_.beam(new THREE.Vector3(x0,y+Math.sin(i*3.1)*.03,z0),new THREE.Vector3(x,y,z),.045,rail)); } }
  return shadowAll(g);
}
// деревянный мост: настил поперёк, прогоны, сваи, перила. Длина вдоль x.
function makeBridge(len=20, w=4, h=1.6, opt={}){
  const g=new THREE.Group(), deck=MAT.wood(opt.col||0x5a4a38,2), pile=MAT.wood(0x3e3226);
  const n=Math.round(len/.45);
  for(let i=0;i<n;i++){ const p=P_.mesh(P_.box(.4,.08,w),deck,-len/2+.225+i*len/n,h,0); p.rotation.y=Math.sin(i*2.7)*.015; g.add(p); }
  for(const s of [-1,1]) g.add(P_.mesh(P_.box(len,.22,.22),pile,0,h-.15,s*(w/2-.3)));
  const sp=opt.span||5;
  for(let x=-len/2; x<=len/2+.01; x+=sp){ for(const s of [-1,1]){ g.add(P_.mesh(P_.cyl(.14,.16,h+1.4,7),pile,x,(h-1.4)/2,s*(w/2-.3)));
      if(opt.rail!==false) g.add(P_.mesh(P_.box(.12,1.0,.12),pile,x,h+.5,s*(w/2-.05))); } }
  if(opt.rail!==false) for(const s of [-1,1]) g.add(P_.mesh(P_.box(len,.1,.1),MAT.wood(0x4e4030),0,h+.95,s*(w/2-.05)));
  return shadowAll(g);
}

// ---------- транспорт и техника ----------
// телега: кузов из досок, оглобли, колёса со спицами. Смотрит вдоль +z.
function makeWheel(r=.55, w=.1, col=0x4a3828){ const g=new THREE.Group(), m=MAT.wood(col);
  const rim=P_.mesh(new THREE.TorusGeometry(r,.045,6,18),m); g.add(rim);
  g.add(P_.rot(P_.mesh(P_.cyl(.1,.1,w+.08,8),m),Math.PI/2));
  for(let i=0;i<8;i++){ const s=P_.mesh(P_.box(.035,r*1.9,.035),m); s.rotation.z=i*Math.PI/8; g.add(s); }
  g.rotation.y=Math.PI/2; return g; }
function makeCart(opt={}){
  const g=new THREE.Group(), wd=MAT.wood(opt.col||0x6a5038,2);
  g.add(P_.mesh(P_.box(1.3,.08,2.6),wd,0,.85,0));
  for(const s of [-1,1]) g.add(P_.mesh(P_.box(.06,.45,2.6),wd,s*.65,1.08,0));
  for(const s of [-1,1]) g.add(P_.mesh(P_.box(1.3,.45,.06),wd,0,1.08,s*1.3));
  const wheels=[]; for(const [x,z,r] of [[-.75,.85,.5],[.75,.85,.5],[-.75,-.85,.55],[.75,-.85,.55]]){ const w=makeWheel(r); w.position.set(x,r,z); g.add(w); wheels.push(w); }
  for(const s of [-1,1]) g.add(P_.beam(new THREE.Vector3(s*.45,.85,1.2),new THREE.Vector3(s*.42,.95,3.4),.045,MAT.wood(0x5a4430)));
  g.userData.wheels=wheels;
  return shadowAll(g);
}
// грузовик-полуторка: кабина, капот, крылья, кузов с бортами. Смотрит вдоль +z.
function makeTruck(opt={}){
  const g=new THREE.Group(), body=MAT.metal(opt.col||0x4e5236), dark=M(0x1a1a18), wd=MAT.wood(0x6a5a40,2);
  g.add(P_.mesh(P_.box(1.0,.14,5.2),dark,0,.62,0)); // рама
  const hood=P_.mesh(P_.box(.9,.7,1.3),body,0,1.05,1.9); g.add(hood);
  g.add(P_.mesh(P_.box(.92,.6,.06),M(0x2a2a26),0,1.05,2.56)); // радиатор
  for(const s of [-1,1]){ const f=P_.mesh(P_.cyl(.48,.48,.32,12,false),body,s*.62,.82,1.95); f.rotation.z=Math.PI/2; f.scale.set(1,1,1); g.add(f);
    g.add(P_.mesh(P_.sph(.1,8,6),M(0xd8d0b0),s*.36,1.3,2.58)); }
  const cab=P_.mesh(P_.box(1.6,1.2,1.15),body,0,1.4,.75); g.add(cab);
  g.add(P_.mesh(P_.box(1.5,.45,.05),M(0x22262a),0,1.65,1.33)); // лобовое
  g.add(P_.mesh(P_.box(1.68,.06,1.2),body,0,2.02,.75));
  const bedY=1.05; g.add(P_.mesh(P_.box(2.0,.1,2.8),wd,0,bedY,-1.2));
  for(const s of [-1,1]) g.add(P_.mesh(P_.box(.06,.55,2.8),wd,s*1.0,bedY+.3,-1.2));
  g.add(P_.mesh(P_.box(2.0,.55,.06),wd,0,bedY+.3,-2.6)); g.add(P_.mesh(P_.box(2.0,.55,.06),wd,0,bedY+.3,.2));
  const wheels=[]; for(const [x,z] of [[-.8,1.95],[.8,1.95],[-.85,-1.6],[.85,-1.6]]){ const w=new THREE.Group(); w.position.set(x,.45,z);
    const t=P_.mesh(P_.cyl(.45,.45,.24,14),dark); t.rotation.z=Math.PI/2; w.add(t); const hub=P_.mesh(P_.cyl(.18,.18,.26,8),body); hub.rotation.z=Math.PI/2; w.add(hub); g.add(w); wheels.push(w); }
  g.userData.wheels=wheels;
  return shadowAll(g);
}
// танк: корпус со скосами, катки, гусеницы, башня с пушкой. kind: 'sherman' (белая звезда) | 't34' | 'pz'. Смотрит вдоль +z.
function makeTank(kind='t34', opt={}){
  const g=new THREE.Group(), col=opt.col||({sherman:0x5a5e3e, t34:0x4a5236, pz:0x55564e})[kind]||0x4a5236;
  const arm=MAT.metal(col,2), dark=M(0x1e1e1c);
  const pr=new THREE.Shape(); [[-2.7,.62],[2.1,.62],[2.95,1.0],[2.25,1.45],[-2.45,1.45],[-2.75,1.15]].forEach(([z,y],i)=>pr[i?'lineTo':'moveTo'](z,y)); pr.closePath();
  const hg=new THREE.ExtrudeGeometry(pr,{depth:2.3,bevelEnabled:false}); hg.translate(0,0,-1.15); hg.rotateY(-Math.PI/2);
  const hull=new THREE.Mesh(hg,arm); g.add(hull);
  for(const s of [-1,1]){ const track=P_.mesh(P_.box(.55,.85,5.8),dark,s*1.42,.5,0); g.add(track);
    for(let i=0;i<5;i++) { const w=P_.mesh(P_.cyl(.34,.34,.5,12),M(0x2e302a),s*1.42,.42,-2.1+i*1.05); w.rotation.z=Math.PI/2; g.add(w); }
    g.add(P_.mesh(P_.box(.62,.06,5.4),arm,s*1.42,.96,0)); }
  const turret=new THREE.Group(); turret.position.set(0,1.45,kind==='t34'?.5:0); g.add(turret);
  const tb=P_.mesh(kind==='sherman'?P_.cyl(.95,1.05,.75,14):P_.box(1.7,.7,2.0),arm,0,.37,0); turret.add(tb);
  const gun=P_.mesh(P_.cyl(.07,.08,kind==='sherman'?2.6:3.0,8),arm,0,.4,1.0+(kind==='sherman'?1.3:1.5)); gun.rotation.x=Math.PI/2; turret.add(gun);
  turret.add(P_.mesh(P_.cyl(.3,.3,.15,10),arm,-.35,.8,-.3));
  if(kind==='sherman'){ const st=new THREE.Shape(); for(let i=0;i<10;i++){ const r=i%2?.16:.4, a=i*Math.PI/5+Math.PI/2; st[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r); } st.closePath();
    for(const s of [-1,1]){ const sm=P_.mesh(new THREE.ShapeGeometry(st),M(0xe8e4d8),s*1.22,1.1,0); sm.rotation.y=s*Math.PI/2; g.add(sm); } }
  if(kind==='t34'){ for(const s of [-1,1]) turret.add(P_.mesh(P_.box(.02,.2,.5),M(0xe8e4d8),s*.86,.4,0)); }
  g.userData.turret=turret;
  return shadowAll(g);
}

// ---------- деревья и растения ----------
// tree kind: 'birch' | 'poplar' | 'oak' | 'pine' | 'dead'
function makeTree(kind='oak', h=6){
  const g=new THREE.Group();
  const barkC={birch:0xd8d4c8, poplar:0x6a6250, oak:0x4a3c2e, pine:0x5a4030, dead:0x4a4038}[kind], leafC={birch:0x8a9a52, poplar:0x6a7a44, oak:0x5a6a3a, pine:0x3a4a30}[kind];
  const trunk=P_.mesh(P_.cyl(h*.025,h*.045,h*.62,7),MAT.wood(barkC),0,h*.31,0); g.add(trunk);
  if(kind==='birch') for(let i=0;i<5;i++) g.add(P_.mesh(P_.cyl(h*.031,h*.036,.06,7),M(0x2a2622),0,h*(.1+i*.11),0));
  if(kind==='dead'){ for(let i=0;i<4;i++){ const a=i*1.7; g.add(P_.beam(new THREE.Vector3(0,h*(.4+i*.08),0),new THREE.Vector3(Math.cos(a)*h*.22,h*(.62+i*.07),Math.sin(a)*h*.22),h*.012,MAT.wood(barkC))); } return shadowAll(g); }
  const lm=MT(leafC,'leaves.jpg');
  if(kind==='pine'){ for(let i=0;i<4;i++) g.add(P_.mesh(new THREE.ConeGeometry(h*(.26-i*.05),h*.32,8),lm,0,h*(.42+i*.15),0)); }
  else if(kind==='poplar'){ const c=P_.mesh(P_.sph(h*.16,10,8),lm,0,h*.66,0); c.scale.set(1,2.2,1); g.add(c); }
  else { for(const [x,y,z,r] of [[0,.72,0,.26],[.14,.64,.08,.2],[-.13,.66,-.06,.21],[.04,.84,-.1,.18],[-.06,.6,.15,.17]]){ const c=P_.mesh(P_.sph(h*r,9,7),lm,h*x,h*y,h*z); c.scale.y=.85; g.add(c); } }
  return shadowAll(g);
}
// подсолнух (поле главы 5): стебель, листья, тяжёлая шляпка
function makeSunflower(h=1.9, dry=false){
  const g=new THREE.Group(), st=M(dry?0x6a5a36:0x5a6a32);
  g.add(P_.mesh(P_.cyl(.018,.026,h,5),st,0,h/2,0));
  for(let i=0;i<3;i++){ const l=P_.mesh(P_.box(.22,.01,.12),st,.1,h*(.35+i*.18),0); l.rotation.set(0,i*2.1,-.35); g.add(l); }
  const head=new THREE.Group(); head.position.set(0,h,.06); head.rotation.x=dry?1.1:.6; g.add(head);
  head.add(P_.mesh(P_.cyl(.15,.15,.05,12),M(dry?0x3a2e1e:0x4a3420)));
  head.add(P_.mesh(P_.cyl(.2,.2,.02,12),M(dry?0x8a6a2a:0xd8a828),0,-.02,0));
  return g;
}

// ---------- железная дорога ----------
// колёсная пара/тележка под вагоном (вдоль x), y — низ рамы
function makeBogie(x=0){ const g=new THREE.Group(), dark=M(0x1c1a18);
  for(const dx of [-.7,.7]) for(const s of [-1,1]){ const w=P_.mesh(P_.cyl(.45,.45,.1,14),dark,x+dx,.45,s*.72); w.rotation.x=Math.PI/2; g.add(w); }
  g.add(P_.mesh(P_.box(2.0,.2,1.5),dark,x,.62,0)); return g; }
// теплушка: дощатый товарный вагон с покатой крышей, рамой, колёсами и сдвижной дверью (+z). Длина вдоль x, низ пола на y=.8
function makeBoxcar(len=6.8, opt={}){
  const g=new THREE.Group(), wd=MAT.wood(opt.col||0x5a3426,2), dark=M(0x1c1a18);
  g.add(P_.mesh(P_.box(len,2.6,2.8),wd,0,2.1,0));
  const roof=P_.mesh(new THREE.CylinderGeometry(2.4,2.4,len+.2,18,1,true,.92,Math.PI-1.84),MAT.metal(0x2e2a26),0,1.49,0); roof.rotation.z=Math.PI/2; roof.scale.set(1,1,1); roof.material.side=THREE.DoubleSide; g.add(roof);
  g.add(P_.mesh(P_.box(len+.1,.25,2.9),dark,0,.75,0));
  for(const s of [-1,1]) g.add(P_.mesh(P_.box(len,.08,2.84),MAT.wood(shade(opt.col||0x5a3426,.7)),0,2.1+s*.9,0));
  g.add(P_.mesh(P_.box(1.6,1.9,.06),MAT.wood(0x3a2218),0,1.9,1.44));
  g.add(P_.mesh(P_.box(1.9,.06,.1),dark,0,2.88,1.46));
  g.add(P_.mesh(P_.box(.5,.3,.05),M(0x1a1612),-len*.3,2.8,1.43)); // окошко
  g.add(makeBogie(-len/2+1.3)); g.add(makeBogie(len/2-1.3));
  for(const s of [-1,1]) g.add(P_.rot(P_.mesh(P_.cyl(.14,.14,.25,8),dark,s*(len/2+.15),1.1,0),0,0,Math.PI/2)); // буфера
  return shadowAll(g);
}
// паровоз: котёл, дымовая труба, будка машиниста, тендер, колёса с дышлами. Нос — к −x.
function makeLoco(opt={}){
  const g=new THREE.Group(), blk=MAT.metal(0x22201e), red=M(0x5a1e18);
  const boiler=P_.mesh(P_.cyl(.9,.9,5.2,16),blk,-1,2.1,0); boiler.rotation.z=Math.PI/2; g.add(boiler);
  const smoke=P_.mesh(P_.cyl(.95,.95,.3,16),blk,-3.55,2.1,0); smoke.rotation.z=Math.PI/2; g.add(smoke);
  g.add(P_.mesh(P_.cyl(.28,.36,1.2,10),blk,-2.9,3.4,0));
  g.add(P_.mesh(P_.cyl(.35,.4,.5,10),blk,-.4,3.1,0)); // сухопарник
  g.add(P_.mesh(P_.sph(.12,6,4),M(0xd8d0b0),-3.72,2.6,0)); // фонарь
  g.add(P_.mesh(P_.box(2.3,2.7,2.7),blk,2.5,2.35,0)); g.add(P_.mesh(P_.box(2.6,.12,3.0),blk,2.5,3.75,0));
  for(const s of [-1,1]) g.add(P_.mesh(P_.box(.7,.6,.05),M(0x1a1a18),2.5,2.9,s*1.36));
  g.add(P_.mesh(P_.box(7.6,.3,2.5),red,0,.95,0)); // рама — красная
  for(let i=0;i<4;i++) for(const s of [-1,1]){ const w=P_.mesh(P_.cyl(.62,.62,.12,16),blk,-2.6+i*1.45,.65,s*1.0); w.rotation.x=Math.PI/2; g.add(w); }
  for(const s of [-1,1]) g.add(P_.mesh(P_.box(4.6,.1,.06),M(0x6a6a64),-.4,.75,s*1.08));
  const tender=new THREE.Group(); tender.position.set(5.3,0,0); g.add(tender);
  tender.add(P_.mesh(P_.box(3.4,2.0,2.6),blk,0,1.9,0)); tender.add(P_.mesh(P_.box(3.2,.4,2.4),M(0x121110),0,3.0,0));
  tender.add(makeBogie(0));
  return shadowAll(g);
}
