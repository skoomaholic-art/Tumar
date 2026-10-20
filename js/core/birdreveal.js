'use strict';
// Приём «глаза птицы»: для сцен, целиком снятых сверху. В самом конце такой сцены
// камера дёргается, слышны крылья, и взгляд улетает — мы смотрели глазами птицы.
// Сцена в своём update вызывает: if(BIRD.active){ BIRD.update(dt); return; }
const BIRD = { active:false, t:0, from:null, dir:null, look:null, resolve:null,
  update(dt){
    this.t+=dt; const k=this.t;
    if(k<.5){ camera.position.copy(this.from).add(new THREE.Vector3(rand(-.15,.15),rand(-.1,.1),rand(-.15,.15))); camera.lookAt(this.look); return; }
    const f=k-.5;
    camera.position.set(this.from.x + this.dir.x*f*9, this.from.y + f*3.4 + Math.sin(f*10)*.25, this.from.z + this.dir.z*f*9);
    camera.lookAt(camera.position.x + this.dir.x*30, Math.max(0, camera.position.y - 6 - f*2), camera.position.z + this.dir.z*30);
    camera.rotateZ(Math.sin(f*1.7)*.18);
    if(k>4.6 && this.resolve){ const r=this.resolve; this.resolve=null; r(); }
  }
};
// dir — куда улетает птица (по земле), look — на что она смотрела
function birdReveal(dir, look){
  return new Promise(res=>{
    Object.assign(BIRD, { active:true, t:0, from:camera.position.clone(), dir:new THREE.Vector3(dir.x,0,dir.z).normalize(), look:look.clone(), resolve:async ()=>{
      await fadeTo(1,500); $('wings').style.display='none'; BIRD.active=false; cine(false); res();
    }});
    cine(true); sfx.caw(); sfx.caw(.45); for(let i=0;i<14;i++) sfx.flap(.5+i*.3);
    setTimeout(()=>{ $('wings').style.display='block'; }, 450);
  });
}
