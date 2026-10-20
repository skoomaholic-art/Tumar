'use strict';
// Сон: степь, эшелон, отец верхом
// ======================================================================
// СОН. Степь в сумерках, эшелон, отец скачет рядом с вагоном
// ======================================================================
function buildDream(){
  const sc=new THREE.Scene();
  sc.background=new THREE.Color(0xb3906a); sc.fog=new THREE.Fog(0xb3906a,25,110);
  sc.add(new THREE.HemisphereLight(0xffe2c0,0x5a4632,.75));
  const sun=new THREE.DirectionalLight(0xffb070,.9); sun.position.set(-40,12,-20); sc.add(sun);
  const g=new THREE.PlaneGeometry(400,120,100,30); g.rotateX(-Math.PI/2);
  const col=[], c=new THREE.Color(), pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i); c.setHex((Math.sin(x*.13)*Math.cos(z*.21)>.5)?0xb8a27a:0x8f7a52); c.offsetHSL(0,0,rand(-.04,.04)); col.push(c.r,c.g,c.b); }
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  sc.add(new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true})));
  const bed=new THREE.Mesh(new THREE.BoxGeometry(400,.4,3.2),M(0x6e5e46)); bed.position.y=.2; sc.add(bed);
  for(const z of [-.75,.75]){ const r=new THREE.Mesh(new THREE.BoxGeometry(400,.12,.1),M(0x3a3632)); r.position.set(0,.46,z); sc.add(r); }
  const sl=new THREE.InstancedMesh(new THREE.BoxGeometry(.25,.08,2.2),M(0x3e3022),300), o=new THREE.Object3D();
  for(let i=0;i<300;i++){ o.position.set(-200+i*1.33,.42,0); o.updateMatrix(); sl.setMatrixAt(i,o.matrix);} sc.add(sl);
  const train=new THREE.Group(); sc.add(train);
  const loco=new THREE.Group();
  const boiler=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,4.2,14),M(0x262422)); boiler.rotation.z=Math.PI/2; boiler.position.set(1.2,1.9,0);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(2,2.4,2.4),M(0x2c2a26)); cab.position.set(-1.6,2.1,0);
  const chim=new THREE.Mesh(new THREE.CylinderGeometry(.25,.32,1,10),M(0x1e1c1a)); chim.position.set(2.6,3.1,0);
  const star=new THREE.Mesh(new THREE.CircleGeometry(.3,5),new THREE.MeshLambertMaterial({color:0x8e1f1a,emissive:0x2a0604})); star.position.set(3.32,1.9,0); star.rotation.y=Math.PI/2;
  loco.add(boiler,cab,chim,star); loco.position.x=12; train.add(shadowAll(loco));
  const wagonM=M(0x5a3426), roofM=M(0x3e3a34);
  for(let i=0;i<6;i++){ const w=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(5.2,2.4,2.6),wagonM); b.position.y=2; const r=new THREE.Mesh(new THREE.BoxGeometry(5.4,.2,2.8),roofM); r.position.y=3.3; w.add(b,r); w.position.x=6.5-i*5.8;
    if(i===1){ const door=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.9,.05),M(0x0e0c0a)); door.position.set(0,1.95,1.31); w.add(door); const a=makePerson({coat:0x6e5a42,hat:'borik',scale:.8}); a.position.set(0,.85,1.05); w.add(a); }
    train.add(shadowAll(w)); }
  const rider=new THREE.Group(); const horse=makeHorse(0x3e2a1c); horse.rotation.y=Math.PI/2;
  const father=makePerson({coat:0x4a3a2a,hat:'tymak',beard:true,scale:.95}); father.position.y=1.15; father.rotation.y=Math.PI/2; father.userData.legL.rotation.x=father.userData.legR.rotation.x=-1.2;
  rider.add(horse,father); rider.position.set(5.5,0,3.6); sc.add(rider);
  const tex=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'); const gr=x.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,'rgba(235,228,214,.7)'); gr.addColorStop(1,'rgba(235,228,214,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); })();
  const steam=[]; for(let i=0;i<22;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false})); sp.userData.t=i/22; sc.add(sp); steam.push(sp); }
  let x=0, chuff=0;
  return { scene:sc, update(dt,t){
    const v=5.2; x+=v*dt; train.position.x=x; rider.position.x=x+5.5-Math.sin(t*.35)*1.6;
    rider.position.y=Math.abs(Math.sin(t*5))*.18;
    horse.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*5+(i%2?Math.PI:0)+(i>1?1:0))*.7);
    father.userData.armR.rotation.x=-2.4+Math.sin(t*2.5)*.4;
    const cx=train.position.x+12+2.6;
    steam.forEach(sp=>{ sp.userData.t+=dt*.35; if(sp.userData.t>1) sp.userData.t-=1; const k=sp.userData.t; sp.position.set(cx-k*9,3.6+k*4,-k*1.5); sp.scale.setScalar(1+k*5); sp.material.opacity=(1-k)*.45; });
    chuff+=dt; if(chuff>.42){ chuff=0; noiseBurst({dur:.22,freq:900,q:.7,gain:.07,type:'bandpass'}); }
    camera.position.set(rider.position.x-16, 1.6, 30); camera.lookAt(rider.position.x+2, 2.0, 0);
  }};
}
