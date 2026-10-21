'use strict';
// Глава 5. Подсолнухи
// ======================================================================
// СЦЕНА 2. ПОДСОЛНУХИ — от первого лица, раненый на поле
// ======================================================================
function sceneField(){
  resetCamera();
  const DAT = DATA.ch5, CH = 'Глава 5 · '+DAT.title;
  scene = new THREE.Scene();
  const skyCol = new THREE.Color(0xd9c9a4);
  scene.background = skyCol.clone(); scene.fog = new THREE.FogExp2(0xcbb68e, .045);
  const hemi = new THREE.HemisphereLight(0xf0e2c0, 0x4a3a28, .8); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe0a0, .9); sun.position.set(-10,20,-6); scene.add(sun);
  const flare = new THREE.PointLight(0xfff0e0, 0, 60); flare.position.set(8,14,-20); scene.add(flare);

  const gGeo = new THREE.PlaneGeometry(120,120,60,60); gGeo.rotateX(-Math.PI/2);
  const col=[], pos=gGeo.attributes.position, c=new THREE.Color();
  for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i); c.setHex(0x5a4a30); c.offsetHSL(0,0,rand(-.05,.04)); col.push(c.r,c.g,c.b);
    const dc=Math.hypot(x-0,z+9); if(dc<2.6) pos.setY(i,-(2.6-dc)*.45); }
  gGeo.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); gGeo.computeVertexNormals();
  const ground=new THREE.Mesh(gGeo,new THREE.MeshLambertMaterial({vertexColors:true})); scene.add(ground);
  // лужа на дне воронки
  const puddle=new THREE.Mesh(new THREE.CircleGeometry(.9,16), new THREE.MeshPhongMaterial({color:0x5c4a32,shininess:80})); puddle.rotation.x=-Math.PI/2; puddle.position.set(0,-1.1,-9); scene.add(puddle);
  // вал выброшенной земли — виден поверх травы, даже когда лежишь
  const rim=new THREE.Mesh(new THREE.TorusGeometry(2.7,.45,6,22),M(0x4a3a26)); rim.rotation.x=Math.PI/2; rim.position.set(0,.05,-9); rim.scale.z=.6; scene.add(rim);
  const clods=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.18,0),M(0x3e3020),40); const cd=new THREE.Object3D();
  for(let i=0;i<40;i++){ const a=rand(0,6.28), r=rand(2.6,4.2); cd.position.set(Math.cos(a)*r,.08,-9+Math.sin(a)*r); cd.rotation.set(rand(0,3),rand(0,3),0); cd.scale.setScalar(rand(.6,1.6)); cd.updateMatrix(); clods.setMatrixAt(i,cd.matrix); } scene.add(clods);
  // блик воды на дне — мигает, когда героя мучает жажда
  const glintTex=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'); const gr=x.createRadialGradient(32,32,0,32,32,30); gr.addColorStop(0,'rgba(255,250,230,1)'); gr.addColorStop(.25,'rgba(255,240,200,.5)'); gr.addColorStop(1,'rgba(255,240,200,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); })();
  const glint=new THREE.Sprite(new THREE.SpriteMaterial({map:glintTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0})); glint.position.set(0,-.5,-9); glint.scale.setScalar(1.6); scene.add(glint);
  const CRATER={x:0,z:-9};

  // подсолнухи: стебли и головы, часть сломана
  const N=900, stemGeo=new THREE.CylinderGeometry(.03,.04,1.9,5), headGeo=new THREE.CylinderGeometry(.22,.22,.08,10), leafGeo=new THREE.PlaneGeometry(.35,.2);
  const stems=new THREE.InstancedMesh(stemGeo,M(0x5e6a34),N), heads=new THREE.InstancedMesh(headGeo,M(0x6a4a1c),N), leaves=new THREE.InstancedMesh(leafGeo,M(0x6e7a3a,{side:THREE.DoubleSide}),N);
  const petals=new THREE.InstancedMesh(new THREE.TorusGeometry(.24,.06,4,12),M(0xc8962a),N);
  const d=new THREE.Object3D(); let k=0;
  for(let i=0;i<N*3 && k<N;i++){
    const x=rand(-30,30), z=rand(-34,12);
    if(Math.hypot(x,z)<1.6 || Math.hypot(x,z+9)<3.2 || Math.hypot(x-2.2,z+1.6)<1.2 || (Math.abs(x)<.7 && z<0 && z>-7)) continue;
    const broken = Math.random()<.18, h=broken?rand(.4,1):rand(1.6,2.1), lean=broken?rand(.6,1.3):rand(-.08,.08);
    d.position.set(x,h/2,z); d.rotation.set(lean,rand(0,6),0); d.scale.set(1,h/1.9,1); d.updateMatrix(); stems.setMatrixAt(k,d.matrix);
    d.scale.set(1,1,1); d.position.set(x+Math.sin(lean)*.3,h,z); d.rotation.set(1.1+lean,rand(-.3,.3)+Math.PI,0); d.updateMatrix(); heads.setMatrixAt(k,d.matrix); petals.setMatrixAt(k,d.matrix);
    d.position.set(x+.15,h*.5,z); d.rotation.set(rand(-1,1),rand(0,6),.6); d.updateMatrix(); leaves.setMatrixAt(k,d.matrix);
    k++;
  }
  stems.count=heads.count=petals.count=leaves.count=k; scene.add(stems,heads,petals,leaves);
  const grassUni={uTime:{value:0}};
  const bladeGeo=new THREE.PlaneGeometry(.022,1,1,3); bladeGeo.translate(0,.5,0);
  const grassM=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
  grassM.onBeforeCompile=sh=>{ sh.uniforms.uTime=grassUni.uTime; sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n  #ifdef USE_INSTANCING\n  float ph=instanceMatrix[3].x*.7+instanceMatrix[3].z*.53;\n  transformed.x+=sin(uTime*1.4+ph)*.09*position.y*position.y;\n  transformed.z+=cos(uTime*1.1+ph)*.05*position.y;\n  #endif'); };
  const GN=5000, grass=new THREE.InstancedMesh(bladeGeo,grassM,GN), gc=new THREE.Color(); let gi=0;
  for(let i=0;i<GN*2 && gi<GN;i++){
    // гуще вдоль пути героя (от места ранения к убитому и к воронке), реже по краям
    const near=i%3!==0, x= near?rand(-6,6):rand(-26,26), z= near?rand(-13,4):rand(-30,10);
    if(Math.hypot(x,z)<.6 || Math.hypot(x,z+9)<2.3) continue;
    const h=rand(.25,1.0);
    d.position.set(x,0,z); d.rotation.set(rand(-.25,.25),rand(0,6.28),rand(-.25,.25)); d.scale.set(rand(.8,1.6),h,1); d.updateMatrix(); grass.setMatrixAt(gi,d.matrix);
    gc.setHex([0x6e6a3a,0x857a46,0x9a8a52,0x5a5a30,0xa08e5a][Math.random()*5|0]); grass.setColorAt(gi,gc); gi++;
  }
  grass.count=gi; scene.add(grass);

  // убитый рядом (тёмный силуэт в шинели), разбитый пулемёт, каска
  const body=new THREE.Group();
  const torso=new THREE.Mesh(new THREE.BoxGeometry(.5,.25,1.2),M(0x4c4a34)); torso.position.y=.13;
  const legs=new THREE.Mesh(new THREE.BoxGeometry(.45,.2,.9),M(0x3a3828)); legs.position.set(.05,.1,.95);
  const helmet=new THREE.Mesh(new THREE.SphereGeometry(.2,10,6,0,Math.PI*2,0,Math.PI/2),M(0x4a5236)); helmet.position.set(-.1,.15,-.75);
  body.add(torso,legs,helmet); body.position.set(2.2,0,-1.6); body.rotation.y=.6; scene.add(body);
  const dp=new THREE.Group(); const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.2,6),M(0x222222)); barrel.rotation.z=Math.PI/2; const disk=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.06,14),M(0x2a2a26)); disk.position.set(-.2,.06,0); dp.add(barrel,disk); dp.position.set(-1.2,.08,-2.4); dp.rotation.y=.9; scene.add(dp);

  // столбы дыма на горизонте
  const smokeTex = (()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'); const gr=x.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,'rgba(60,52,44,.6)'); gr.addColorStop(1,'rgba(60,52,44,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); })();
  const smokes=[]; for(const sx of [-18,6,22]) for(let i=0;i<12;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false})); s.userData={t:i/12,x:sx,z:-40}; scene.add(s); smokes.push(s); }

  camera.position.set(0,.32,0); camera.rotation.order='YXZ';
  const F = { yaw:0, pitch:.35, blood:.55, thirst:.25, mind:.8, tourniquet:false, bandage:false, step:0, holding:false, hold:0, crawlT:0, night:0, lidT:0, lidNeed:false, busy:true };

  // взгляд мышью/пальцем
  let drag=null;
  canvas.addEventListener('pointerdown', e=>{ drag={x:e.clientX,y:e.clientY}; });
  addEventListener('pointerup', ()=>drag=null);
  addEventListener('pointermove', e=>{ if(!drag || F.busy) return; F.yaw -= (e.clientX-drag.x)*.004; F.pitch = clamp(F.pitch-(e.clientY-drag.y)*.004, -.25, 1.1); drag={x:e.clientX,y:e.clientY}; });

  function setBars(){ $('bBlood').style.width=(F.blood*100)+'%'; $('bThirst').style.width=(F.thirst*100)+'%'; $('bMind').style.width=(F.mind*100)+'%'; }
  function lookingAt(p, tol=.5){ const a=Math.atan2(-(p.x-camera.position.x), -(p.z-camera.position.z)); let dd=Math.abs(((a-F.yaw)+Math.PI*3)%(Math.PI*2)-Math.PI); return dd<tol; }
  function dist(p){ return Math.hypot(p.x-camera.position.x, p.z-camera.position.z); }

  const sc = {
    update(dt,t){
      if(F.dream){ F.dream.update(dt,t); return; }
      if(!F.busy){
        // кровь уходит, пока не затянут жгут; жажда растёт; сознание падает от потери крови и жажды
        F.blood = clamp(F.blood - dt*(F.tourniquet? (F.bandage?0:.002) : .012), 0, 1);
        F.thirst = clamp(F.thirst + dt*.006, 0, 1);
        F.mind = clamp(F.mind - dt*(.002 + (1-F.blood)*.004 + F.thirst*.003), 0, 1);
        if(F.blood<.12 || F.mind<.02) { lose(); }
        // ползти
        const crawl = keys.KeyW || keys.ArrowUp || F.touchCrawl;
        if(crawl){ F.crawlT+=dt; const s=.45*dt; camera.position.x -= Math.sin(F.yaw)*s; camera.position.z -= Math.cos(F.yaw)*s; F.mind-=dt*.004; if(F.crawlT>.7){F.crawlT=0; sfx.step(); noiseBurst({dur:.35,freq:2600,q:.8,gain:.06,type:'bandpass'});} F.roll=Math.sin(t*5)*.03; } else F.roll=(F.roll||0)*.9;
        if(keys.KeyA||keys.ArrowLeft) F.yaw+=dt*1.2; if(keys.KeyD||keys.ArrowRight) F.yaw-=dt*1.2;
        // жгут — удержание
        if(F.step===1){ $('hold').style.display='block'; if(F.holding||keys.Space){ F.hold=clamp(F.hold+dt*.5,0,1); } else F.hold=clamp(F.hold-dt*.25,0,1); $('bHold').style.width=(F.hold*100)+'%'; if(F.hold>=1){ F.tourniquet=true; $('hold').style.display='none'; F.step=2; setBars(); stepText(); run(DAT.scripts.tourniquet_done); } }
        // веки смыкаются
        if(F.step>=3 && F.step<5){ F.lidT+=dt; if(F.lidT>6){ F.lidNeed=true; } if(F.lidNeed){ F.lid=clamp((F.lid||0)+dt*.35,0,1); if(F.lid>=1){ F.mind-=.12; F.lid=.6; } } else F.lid=clamp((F.lid||0)-dt*2,0,1); $('eyelid').style.opacity=F.lid; }
        // ночь
        if(F.step===4){ F.nightT=(F.nightT||0)+dt; if(F.nightT>22){ dawn(); } if(Math.random()<dt*.15){ flarePop(); } if(Math.random()<dt*.12) sfx.boom(rand(0,.5)); }
      }
      // шаг состояния
      if(F.step===2 && dist(body.position)<1.4 && lookingAt(body.position,.7)){ prompt('Обыскать убитого'); F.can=searchBody; }
      else if(F.step===5 && dist(CRATER)<3.2){ prompt('Пить из воронки'); F.can=drink; }
      else if(F.lidNeed){ prompt(isTouch?'Не спать!':'[Пробел] Не спать!'); F.can=openEyes; }
      else { $('prompt').style.display='none'; F.can=null; }
      grassUni.uTime.value=t;
      if(F.step!==1) $('hold').style.display='none';
      // блик и компас к воде на втором дне
      glint.material.opacity = F.step===5 ? .55+.45*Math.sin(t*4) : 0;
      const cp=$('compass');
      if(F.step===5 && !F.busy){ const a=Math.atan2(-(CRATER.x-camera.position.x),-(CRATER.z-camera.position.z)); const dd=((a-F.yaw)+Math.PI*3)%(Math.PI*2)-Math.PI;
        cp.style.display='block'; cp.textContent = Math.abs(dd)<.35 ? '▲ вода впереди · '+Math.max(0,dist(CRATER)-2.4).toFixed(0)+' м' : (dd>0 ? '◀ вода левее' : 'вода правее ▶'); }
      else cp.style.display='none';
      // дым на горизонте и вспышки
      smokes.forEach(s=>{ s.userData.t+=dt*.05; if(s.userData.t>1)s.userData.t-=1; const k=s.userData.t; s.position.set(s.userData.x+k*5,2+k*14,s.userData.z); s.scale.setScalar(3+k*8); s.material.opacity=(1-k)*.7; });
      flare.intensity = Math.max(0, flare.intensity - dt*.8);
      // покачивание при дыхании
      const breath = Math.sin(t*1.6)*.006*(1.5-F.mind);
      camera.position.y = .32 + breath;
      camera.rotation.set(F.pitch + breath*2, F.yaw, Math.sin(t*.7)*.02*(1-F.mind) + (F.roll||0));
      // виньетка зависит от сознания и крови
      const v = 35 - (1-F.mind)*30;
      $('vig').style.background = `radial-gradient(ellipse at center,transparent ${v}%,rgba(${(1-F.blood)*60|0},0,0,.92) 100%)`;
      setBars();
    },
    F, body,
    onKey(code,down){ if(!down) return; if(code==='KeyE'||code==='Space'){ if(F.can && !F.busy && !dlgOpen) F.can(); } },
    act(){ if(F.can && !F.busy && !dlgOpen) F.can(); },
    holdStart(){ F.holding=true; }, holdEnd(){ F.holding=false; },
    crawl(on){ F.touchCrawl=on; },
    async begin(){
      $('bars').style.display='block';
      setHelp(isTouch ? 'Тяни пальцем — осмотреться' : 'W — ползти · A/D или мышь — повернуться · Пробел/E — действие');
      setObj(CH,'');
      await showCard(DAT.card.small, DAT.card.big, DAT.card.text, 'Дальше');
      // чёрный экран, звон в ушах, сердце
      setRing(true); setHeart(96);
      await wait(2600);
      await fadeTo(0,3500);
      await run(DAT.scripts.wake);
      closeDlg(); F.busy=false; F.step=1; stepText();
      if(isTouch){ $('touch').style.display='flex'; $('tAct').textContent='Тянуть'; }
    }
  };
  const run = makeRunner({ dogs(){ sfx.bark(0); sfx.bark(1.4); } });
  function prompt(text){ const pr=$('prompt'); pr.style.display='block'; pr.style.left='50%'; pr.style.top='66%'; pr.textContent=text; }
  function stepText(){
    const t = DAT.objectives[(F.step===1 && isTouch) ? '1touch' : String(F.step)] || '';
    setObj(CH, t);
    if(isTouch) $('tAct').textContent = F.step===1?'Тянуть':'Действие';
  }
  async function searchBody(){
    F.busy=true;
    await run(DAT.scripts.search_body);
    closeDlg(); F.bandage=true; F.blood=Math.min(1,F.blood+.08); F.step=3; stepText();
    await wait(1800); await firstSleep(); nightfall();
  }
  // первый сон после перевязки: веки смыкаются, отец скачет рядом с поездом
  async function firstSleep(){
    F.busy=true; setObj(CH,'');
    const lid=$('eyelid'); lid.style.transition='opacity 2.5s'; lid.style.opacity=1; setHeart(58);
    await wait(2800);
    // сцена сна: выцветшая, размытая, в замедлении
    const fieldScene=scene, savedPos=camera.position.clone(), savedRot=camera.rotation.clone(), savedVig=$('vig').style.background;
    F.dream=buildDream(); scene=F.dream.scene; $('bars').style.visibility='hidden'; $('hud').style.visibility='hidden';
    const oldFilter=canvas.style.filter; canvas.style.filter='sepia(.5) saturate(.55) contrast(1.05) blur(.9px)'; cine(true); camera.fov=22; camera.updateProjectionMatrix();
    $('vig').style.background='radial-gradient(ellipse at center,transparent 38%,rgba(240,230,210,.85) 100%)';
    lid.style.opacity=0;
    const hoof=setInterval(()=>sfx.hooves(),1450); sfx.hooves();
    tone({f:220,dur:2.2,type:'triangle',gain:.06}); tone({f:196,dur:2,type:'triangle',gain:.05,delay:.3});
    await wait(3600);
    await run(DAT.scripts.dream);
    closeDlg();
    await wait(1200);
    lid.style.opacity=1; await wait(2600);
    clearInterval(hoof); F.dream=null; cine(false); camera.fov=45; camera.updateProjectionMatrix(); scene=fieldScene; camera.position.copy(savedPos); camera.rotation.copy(savedRot); canvas.style.filter=oldFilter; $('vig').style.background=savedVig;
    $('bars').style.visibility='visible'; $('hud').style.visibility='visible';
    await wait(600);
  }
  async function nightfall(){
    F.busy=true; const lid=$('eyelid'); await fadeTo(.85,1200); lid.style.opacity=0; lid.style.transition='';
    scene.background.setHex(0x14161c); scene.fog.color.setHex(0x14161c); scene.fog.density=.07; hemi.intensity=.12; sun.intensity=.05;
    await fadeTo(0,2500);
    setHeart(78); F.busy=false; F.step=4; F.lidT=0; stepText();
    await run(DAT.scripts.night); closeDlg();
  }
  function flarePop(){ flare.position.set(rand(-20,20),14,rand(-30,-10)); flare.intensity=2.2; sfx.flare(); }
  function openEyes(){ F.lidNeed=false; F.lidT=0; F.mind=Math.min(1,F.mind+.08); }
  async function dawn(){
    F.busy=true; F.lidNeed=false; $('eyelid').style.opacity=0; await fadeTo(.9,2000);
    scene.background.setHex(0xe0cfa6); scene.fog.color.setHex(0xd8c49a); scene.fog.density=.04; hemi.intensity=.9; sun.intensity=1.1; sun.color.setHex(0xfff0c8);
    F.thirst=.85; F.mind=Math.max(F.mind,.5); await fadeTo(0,2000);
    await run(DAT.scripts.dawn);
    closeDlg(); F.yaw=Math.atan2(-(CRATER.x-camera.position.x),-(CRATER.z-camera.position.z)); F.pitch=.12; F.busy=false; F.step=5; stepText();
  }
  async function drink(){
    F.busy=true; $('compass').style.display='none'; F.thirst=.35; F.mind=Math.min(1,F.mind+.2); 
    await run(DAT.scripts.drink);
    closeDlg(); sfx.bark(.2);
    setHeart(130); await wait(2200);
    await fadeTo(1,1800); setHeart(0); setRing(false);
    startCamp(); // дальше в той же главе: сборный пункт и палатка умирающих
  }
  async function lose(){
    if(F.lost) return; F.lost=true; F.busy=true; setHeart(0);
    await fadeTo(1,2500);
    await showCard('','Асан не дожил до утра','Затяни жгут быстрее и не давай глазам закрыться.','Попробовать снова');
    startField();
  }
  return sc;
}
