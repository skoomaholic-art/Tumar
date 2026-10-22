'use strict';
// Главное меню: на жерди загона на шнурке висит треугольный тумар и покачивается на ветру.
// За ним, в загоне, бродят барашки и щиплют сено; дальше — степь и горы в утренней дымке.
function sceneMenu(){
  resetCamera();
  scene = new THREE.Scene();
  const SKY = 0xd9c9a3; scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 60, 720);
  scene.add(new THREE.HemisphereLight(0xf2e2c0, 0x6a5a40, .75));
  const sun = new THREE.DirectionalLight(0xffdcaa, 1.0); sun.position.set(-30,16,-20); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:90}); scene.add(sun, sun.target);

  // степь
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800,800), M(0xb59a64)); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  const tuftM=[M(0x9a8450),M(0x8a7a48),M(0xc2a86c)];
  for(let i=0;i<260;i++){ const t=new THREE.Mesh(new THREE.ConeGeometry(rand(.05,.12),rand(.2,.5),4), tuftM[i%3]); const r=rand(2,70), a=rand(0,Math.PI*2); t.position.set(Math.cos(a)*r, .12, Math.sin(a)*r-10); scene.add(t); }
  // горы на горизонте: синеватые, со снегом на вершинах
  const mtM=new THREE.MeshLambertMaterial({color:0x6e7480}), snowM=new THREE.MeshLambertMaterial({color:0xece8e0});
  for(let i=0;i<9;i++){ const h=rand(30,48), r=h*rand(1.4,2.0), x=-300+i*60+rand(-15,15), z=-340-rand(0,60);
    const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,6), mtM); m.position.set(x,h/2-2,z); m.rotation.y=rand(0,3); scene.add(m);
    const c=new THREE.Mesh(new THREE.ConeGeometry(r*.28,h*.28,6), snowM); c.position.set(x,h-2-h*.14+.4,z); c.rotation.y=m.rotation.y; scene.add(c); }

  // загон: столбы и три жерди
  const wood=M(0x7a5a3a), woodD=M(0x5e4430);
  const PEN={x0:-6,x1:2,z0:-9,z1:-1};
  function post(x,z){ const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,1.8,6),woodD); p.position.set(x,.9,z); p.rotation.z=rand(-.04,.04); scene.add(shadowAll(p)); }
  function rail(x0,z0,x1,z1,y){ const L=Math.hypot(x1-x0,z1-z0); const r=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,L+.3,6),wood); r.rotation.z=Math.PI/2; r.rotation.y=-Math.atan2(z1-z0,x1-x0); r.position.set((x0+x1)/2,y,(z0+z1)/2); scene.add(shadowAll(r)); }
  for(const [x0,z0,x1,z1] of [[PEN.x0,PEN.z1,PEN.x1,PEN.z1],[PEN.x0,PEN.z0,PEN.x1,PEN.z0],[PEN.x0,PEN.z0,PEN.x0,PEN.z1],[PEN.x1,PEN.z0,PEN.x1,PEN.z1]]){
    const n=Math.round(Math.hypot(x1-x0,z1-z0)/2); for(let i=0;i<=n;i++) post(lerp(x0,x1,i/n),lerp(z0,z1,i/n));
    for(const y of [.32,.66,1.52]) rail(x0,z0,x1,z1,y+rand(-.03,.03)); }
  // сено
  const hay=new THREE.Mesh(new THREE.SphereGeometry(1.1,12,6,0,Math.PI*2,0,Math.PI/2), M(0xd2b464)); hay.scale.set(1.3,.55,1); hay.position.set(-3.4,0,-6.2); scene.add(shadowAll(hay));
  for(let i=0;i<30;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(rand(.2,.5),.02,.03),M(0xd8bc6a)); s.position.set(-3.4+rand(-1.8,1.8),.02,-6.2+rand(-1.3,1.3)); s.rotation.y=rand(0,3); scene.add(s); }

  // барашки
  const woolM=[M(0xe8dcc4),M(0xd8ccb0),M(0xc8b896)], headM=M(0x2e2620);
  const sheep=[];
  for(let i=0;i<6;i++){
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(.42,10,8), woolM[i%3]); body.scale.set(1.35,.95,.95); body.position.y=.62; g.add(body);
    const fluff=new THREE.Mesh(new THREE.SphereGeometry(.3,8,6), woolM[(i+1)%3]); fluff.position.set(0,.8,0); fluff.scale.set(1.5,.6,1); g.add(fluff);
    const neck=new THREE.Group(); neck.position.set(.48,.72,0); g.add(neck);
    const head=new THREE.Mesh(new THREE.BoxGeometry(.3,.2,.18), headM); head.position.set(.14,0,0); neck.add(head);
    const earL=new THREE.Mesh(new THREE.BoxGeometry(.05,.03,.14),headM); earL.position.set(.06,.04,.12); const earR=earL.clone(); earR.position.z=-.12; neck.add(earL,earR);
    const legs=[]; for(const [x,z] of [[.28,.16],[.28,-.16],[-.28,.16],[-.28,-.16]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.07,.42,.07),headM); l.geometry.translate(0,-.21,0); l.position.set(x,.42,z); g.add(l); legs.push(l); }
    g.position.set(rand(PEN.x0+1,PEN.x1-1),0,rand(PEN.z0+1,PEN.z1-1.5)); g.rotation.y=rand(0,6);
    g.userData={neck,legs,to:null,graze:rand(1,4),ph:rand(0,6)}; scene.add(shadowAll(g)); sheep.push(g);
  }

  // тумар на шнурке под верхней жердью, на переднем плане
  const pivot=new THREE.Group(); pivot.position.set(1.6,1.52,-1); scene.add(pivot);
  const cord=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.22,4), M(0x2a1c12)); cord.position.y=-.11; pivot.add(cord);
  const tri=new THREE.Shape(); tri.moveTo(0,0); tri.lineTo(-.085,-.16); tri.lineTo(.085,-.16); tri.closePath();
  const tumar=new THREE.Mesh(new THREE.ExtrudeGeometry(tri,{depth:.025,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:1}), new THREE.MeshLambertMaterial({color:0x7a3a22}));
  tumar.position.set(0,-.22,-.0125); pivot.add(shadowAll(tumar));
  // строчка по краю — светлая нить
  const stitch=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-.02,.033),new THREE.Vector3(-.068,-.145,.033),new THREE.Vector3(.068,-.145,.033)]), new THREE.LineBasicMaterial({color:0xd8b878})); tumar.add(stitch);
  const knot=new THREE.Mesh(new THREE.SphereGeometry(.02,6,5),M(0x2a1c12)); knot.position.y=-.22; pivot.add(knot);

  let gust=0;
  const sc={
    update(dt,t){
      // ветер: порывы, тумар качается и чуть поворачивается
      gust=lerp(gust, .5+.5*Math.sin(t*.37)*Math.sin(t*.13+1), dt*.8);
      pivot.rotation.z = Math.sin(t*1.25)*(.05+.12*gust) + .05*gust;
      pivot.rotation.x = Math.sin(t*.9+1)*.04*gust;
      tumar.rotation.y = Math.sin(t*.7)*.5*gust;
      // барашки: бредут, останавливаются у сена, щиплют
      sheep.forEach(s=>{ const u=s.userData;
        if(u.graze>0){ u.graze-=dt; u.neck.rotation.z=lerp(u.neck.rotation.z,-1.0+Math.sin(t*3+u.ph)*.12,dt*3); u.legs.forEach(l=>l.rotation.z=0);
          if(u.graze<=0){ const toHay=Math.random()<.55; u.to=toHay? new THREE.Vector3(-3.4+rand(-1.6,1.6),0,-6.2+rand(-1.3,1.3)) : new THREE.Vector3(rand(PEN.x0+.8,PEN.x1-.8),0,rand(PEN.z0+.8,PEN.z1-1.4)); } }
        else if(u.to){ const dx=u.to.x-s.position.x, dz=u.to.z-s.position.z, d=Math.hypot(dx,dz);
          u.neck.rotation.z=lerp(u.neck.rotation.z,.15,dt*3);
          if(d<.1){ u.to=null; u.graze=rand(3,8); }
          else { const st=Math.min(d,.45*dt); s.position.x+=dx/d*st; s.position.z+=dz/d*st; const ry=Math.atan2(-dz,dx); s.rotation.y+= (((ry-s.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI)*Math.min(1,dt*3);
            u.legs.forEach((l,i)=>l.rotation.z=Math.sin(t*8+u.ph+(i%2?Math.PI:0))*.35); } } });
      // камера: у самого тумара, медленно дышит
      camera.fov=40; camera.position.set(1.0+Math.sin(t*.11)*.05, 1.25+Math.sin(t*.17)*.03, 1.2); camera.updateProjectionMatrix();
      camera.lookAt(-.6, 1.0, -8);
    },
    begin(){ $('help').style.visibility='hidden'; $('hud').style.visibility='hidden'; }
  };
  return sc;
}
