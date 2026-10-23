'use strict';
// Аул вокруг двора Нурбековых: зимовки соседей с сараями и стогами, юрты, кошара, колодец-журавль,
// контора колхоза с красным флагом, телеграфные столбы, коровы, конь, соседи, мазар на бугре.
// Общий для главы 1 (двор) и проводов (утро ухода): аул один и тот же.
// clear(x,z) — можно ли ставить постройку в этой точке (не загораживать коридоры камеры и дорогу).
function buildAulVillage(sc, clear){
  const n0=sc.children.length;
  const adobe=M(0x9a8466), adobeD=M(0x7e6a50), roofM=M(0x6e5e46), felt=M(0xcfc4ac), woodM=M(0x5e4834), hayM=M(0xb8a060);
    const smokeT=(()=>{ const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'); const gr=g.createRadialGradient(16,16,1,16,16,15); gr.addColorStop(0,'rgba(200,196,186,.55)'); gr.addColorStop(1,'rgba(200,196,186,0)'); g.fillStyle=gr; g.fillRect(0,0,32,32); return new THREE.CanvasTexture(c); })();
    const smoke=(x,y,z)=>{ for(let i=0;i<4;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeT,transparent:true,depthWrite:false,opacity:.7-i*.14})); sp.position.set(x-i*.9,y+i*1.1,z+i*.3); sp.scale.setScalar(1.2+i*.9); sc.add(sp); } };
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
      g.position.set(x,0,z); g.rotation.y=ry; sc.add(shadowAll(g));
      const cw=new THREE.Vector3(-2,3.6,-.8).applyAxisAngle(new THREE.Vector3(0,1,0),ry).add(g.position); smoke(cw.x,cw.y,cw.z); };
    const yurt2=(x,z)=>{ const g=new THREE.Group(); const yw=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,1.5,16),felt); yw.position.y=.75; const yr=new THREE.Mesh(new THREE.ConeGeometry(2.6,1.3,16),felt); yr.position.y=2.1; const bd=new THREE.Mesh(new THREE.CylinderGeometry(2.42,2.42,.16,16),M(0x8e2a20)); bd.position.y=1.3; g.add(yw,yr,bd); g.position.set(x,0,z); sc.add(shadowAll(g)); };
    const spots=[[-38,-14,.3,1],[-52,6,-.2,0],[-30,28,1.2,0],[-62,-30,.1,0],[34,30,-.8,1],[48,8,-1.4,0],[-20,46,2.6,0],[38,-34,-1.2,0],[60,-12,-1.6,0],[-44,-46,.5,0]];
    spots.forEach(([x,z,r,b])=>{ if(clear(x,z)) zimovka(x,z,r,b); });
    [[-46,-2],[-24,36],[42,20],[-58,-20],[52,-26]].forEach(([x,z])=>{ if(clear(x,z)) yurt2(x,z); });
    // кошара колхоза: длинный низкий сарай
    const ksh=new THREE.Mesh(new THREE.BoxGeometry(22,2,6),adobeD); ksh.position.set(-70,1,24); ksh.rotation.y=.2; sc.add(shadowAll(ksh));
    const kshr=new THREE.Mesh(new THREE.BoxGeometry(22.6,.4,6.8),roofM); kshr.position.set(-70,2.15,24); kshr.rotation.y=.2; sc.add(shadowAll(kshr));
    // колодец-журавль у зимовки Жумабаевых
    const well=new THREE.Group(); const ring=new THREE.Mesh(new THREE.CylinderGeometry(.7,.75,.8,10,1,true),M(0x6a5a44)); ring.material.side=THREE.DoubleSide; ring.position.y=.4; well.add(ring);
    const fork=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,3.2,6),woodM); fork.position.set(1.6,1.6,0); well.add(fork);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,7,6),woodM); beam.position.set(1.6,3.1,0); beam.rotation.z=1.2; well.add(beam);
    const rope=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,2.4,4),woodM); rope.position.set(-1.2,2.5,0); well.add(rope);
    well.position.set(-30,0,-24); sc.add(shadowAll(well));
    // контора колхоза с красным флагом — единственное красное вдали, кроме полосы на юртах
    const kont=new THREE.Group(); const kw=new THREE.Mesh(new THREE.BoxGeometry(9,3,5),M(0xb0a084)); kw.position.y=1.5; const kr=new THREE.Mesh(new THREE.CylinderGeometry(.01,5.6,2,4,1),roofM); kr.rotation.y=Math.PI/4; kr.scale.set(1.25,1,.75); kr.position.y=4; kont.add(kw,kr);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,4.5,5),woodM); pole.position.set(4.8,2.25,2.8); const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.9),new THREE.MeshLambertMaterial({color:0xa8281e,side:THREE.DoubleSide})); flag.position.set(5.5,4.1,2.8); kont.add(pole,flag);
    kont.position.set(44,0,-52); kont.rotation.y=-.5; sc.add(shadowAll(kont));
    // телеграфные столбы вдоль дороги на Акмолинск
    for(let i=0;i<14;i++){ const x=-20-i*16, z=-60+i*3; const tp=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,5,5),woodM); tp.position.set(x,2.5,z); const cr=new THREE.Mesh(new THREE.BoxGeometry(1.2,.08,.08),woodM); cr.position.set(x,4.6,z); sc.add(tp,cr); }
    // жизнь аула: коровы на выпасе, конь у коновязи, соседи у своих зимовок
    const cowM=[M(0x5a4636),M(0x7a6a58),M(0x3a3028)];
    for(let i=0;i<5;i++){ const c=new THREE.Group(); const bd=new THREE.Mesh(new THREE.BoxGeometry(1.5,.75,.6),cowM[i%3]); bd.position.y=.85; const hd=new THREE.Mesh(new THREE.BoxGeometry(.45,.4,.35),cowM[i%3]); hd.position.set(.9,.75,0); c.add(bd,hd);
      for(const [lx,lz] of [[.55,.22],[.55,-.22],[-.55,.22],[-.55,-.22]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.5,.12),cowM[2]); l.position.set(lx,.25,lz); c.add(l); }
      c.position.set(-60+rand(-12,12),0,40+rand(-8,8)); c.rotation.y=rand(0,6); sc.add(shadowAll(c)); }
    if(typeof makeHorse==='function'){ const hz=makeHorse(0x5a3a26); hz.position.set(-36,0,-9); hz.rotation.y=1.2; sc.add(shadowAll(hz)); const hp=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,1.3,5),woodM); hp.position.set(-34.6,.65,-8.2); sc.add(hp); }
    for(const [x,z,ry,coat,hat] of [[-34,-11,1.6,0x4a3a2a,'tymak'],[-49,9,2.4,0x5a4636,'scarf'],[31,27,-1,0x4e4030,'borik']]){ const v=makePerson({coat,hat}); v.position.set(x,0,z); v.rotation.y=ry; sc.add(shadowAll(v)); }
    // кладбище-мазар на дальнем бугре
    const maz=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2,2.4,8),M(0x9a8a6c)); maz.position.set(-90,1.2,-70); const mazd=new THREE.Mesh(new THREE.SphereGeometry(1.6,10,6,0,Math.PI*2,0,Math.PI/2),M(0x8a7a5e)); mazd.position.set(-90,2.4,-70); sc.add(maz,mazd);
  
  // дальний план без своих теней: на телефоне это заметно дешевле, а на 25+ метрах тень всё равно не читается
  sc.children.slice(n0).forEach(o=>o.traverse(m=>{ if(m.isMesh) m.castShadow=false; }));
}
