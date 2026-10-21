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

  // --- «Собака»: овчарка, унтер-офицер с флягой, конвоир, свои ноги; кулак с тумаром ---
  // Всё это стоит в мире и каждый кадр ставится относительно камеры — к самой камере ничего не цепляем
  // (камера не входит в сцену поля: во сне сцена подменяется).
  const dog = new THREE.Group(); dog.visible=false; scene.add(dog);
  { const tan=M(0x8a6a42), dark=M(0x2a2018);
    const bd=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.82),tan); bd.position.set(0,.5,0);
    const saddle=new THREE.Mesh(new THREE.BoxGeometry(.32,.12,.58),dark); saddle.position.set(0,.66,-.04);
    const neck=new THREE.Mesh(new THREE.BoxGeometry(.2,.26,.22),tan); neck.position.set(0,.66,.42); neck.rotation.x=-.5;
    const head=new THREE.Group(); head.position.set(0,.78,.55);
    const skull=new THREE.Mesh(new THREE.BoxGeometry(.2,.18,.22),tan);
    const snout=new THREE.Mesh(new THREE.BoxGeometry(.11,.1,.2),dark); snout.position.set(0,-.04,.18);
    const nose=new THREE.Mesh(new THREE.BoxGeometry(.05,.04,.03),M(0x0e0c0a)); nose.position.set(0,-.01,.29);
    const jaw=new THREE.Mesh(new THREE.BoxGeometry(.1,.04,.16),M(0x3a2018)); jaw.position.set(0,-.11,.15);
    const earL=new THREE.Mesh(new THREE.ConeGeometry(.045,.13,4),dark); earL.position.set(-.07,.14,-.03); const earR=earL.clone(); earR.position.x=.07;
    head.add(skull,snout,nose,jaw,earL,earR);
    const tail=new THREE.Mesh(new THREE.CylinderGeometry(.03,.05,.42,5),dark); tail.position.set(0,.55,-.55); tail.rotation.x=-.9;
    const dlegs=[]; for(const [x,z] of [[-.1,.3],[.1,.3],[-.1,-.3],[.1,-.3]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.07,.42,.07),tan); l.geometry.translate(0,-.21,0); l.position.set(x,.42,z); dog.add(l); dlegs.push(l); }
    dog.add(bd,saddle,neck,head,tail); dog.userData={head,jaw,tail,legs:dlegs}; }
  // пожилой унтер-офицер: серо-зелёная форма, каска, седая щетина; фляга в правой руке
  const unter = makePerson({coat:0x464a3e, hat:'helmet'}); unter.visible=false; scene.add(unter);
  const stubble=new THREE.Mesh(new THREE.BoxGeometry(.2,.07,.04),M(0x6e6a60)); stubble.position.set(0,1.69,.14); unter.add(stubble);
  const flask=new THREE.Group(); { const fb=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.2,10),M(0x4a5240)); const cap=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.04,8),M(0x2a2a26)); cap.position.y=.12; flask.add(fb,cap); flask.userData.cap=cap; }
  flask.visible=false; scene.add(flask);
  // второй — конвоир: тень над лицом
  const convoy = makePerson({coat:0x4e5246, hat:'helmet'}); convoy.visible=false; scene.add(convoy);
  // свои ноги: бедро в крови, ремень-жгут выше раны
  const myLegs=new THREE.Group(); myLegs.visible=false; scene.add(myLegs);
  { const khaki=M(0x5c5a3a);
    const lL=new THREE.Mesh(new THREE.BoxGeometry(.17,.15,1.0),khaki); lL.position.set(-.12,.08,.5);
    const lR=lL.clone(); lR.position.x=.12;
    const blood=new THREE.Mesh(new THREE.BoxGeometry(.19,.03,.34),M(0x7a1610)); blood.position.set(.12,.17,.42);
    const belt=new THREE.Mesh(new THREE.BoxGeometry(.21,.04,.06),M(0x2a1e14)); belt.position.set(.12,.17,.16);
    const boots=new THREE.Mesh(new THREE.BoxGeometry(.42,.18,.2),M(0x221a12)); boots.position.set(0,.09,1.05);
    myLegs.add(lL,lR,blood,belt,boots); }
  // своя рука: кулак с тумаром (кожаный треугольник на шнурке)
  const fist=new THREE.Group(); fist.visible=false; scene.add(fist);
  { const skinM=M(0x8e6a4c);
    const palm=new THREE.Mesh(new THREE.BoxGeometry(.09,.075,.11),skinM);
    const fingers=new THREE.Mesh(new THREE.BoxGeometry(.09,.04,.05),M(0x7e5c40)); fingers.position.set(0,.03,.05);
    const sleeve=new THREE.Mesh(new THREE.BoxGeometry(.11,.1,.3),M(0x5c5a3a)); sleeve.position.set(0,-.01,-.2);
    const tri=new THREE.Mesh(new THREE.ConeGeometry(.045,.06,3),M(0xa85a34)); tri.rotation.set(Math.PI/2,0,0); tri.scale.z=.35; tri.position.set(.01,.05,.075);
    const cord=new THREE.Mesh(new THREE.TorusGeometry(.05,.004,4,14,Math.PI*1.2),M(0x3a2a1a)); cord.position.set(0,.06,.02); cord.rotation.x=1.2;
    fist.add(palm,fingers,sleeve,tri,cord); fist.userData={fingers}; }
  // отдельные стебли, которые раздвигает собака и которые хлещут по объективу при волочении
  const looseStalks=[];
  function addStalk(x,z){ const g=new THREE.Group(); const st=new THREE.Mesh(stemGeo,M(0x5e6a34)); st.position.y=.95; const hd=new THREE.Mesh(headGeo,M(0x6a4a1c)); hd.position.set(0,1.88,.12); hd.rotation.x=1.1; const pt=new THREE.Mesh(new THREE.TorusGeometry(.24,.06,4,12),M(0xc8962a)); pt.position.copy(hd.position); pt.rotation.copy(hd.rotation); g.add(st,hd,pt); g.position.set(x,0,z); g.userData={kick:0,ph:rand(0,6),ax:rand(-1,1)}; scene.add(g); looseStalks.push(g); return g; }
  // кадр относительно камеры: вперёд по земле, вправо
  const fwdOf = yaw => new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)), rightOf = yaw => new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  function placeOnCamera(obj, x, y, z){ obj.position.copy(camera.position); obj.quaternion.copy(camera.quaternion); obj.translateX(x); obj.translateY(y); obj.translateZ(z); }

  camera.position.set(0,.32,0); camera.rotation.order='YXZ';
  const F = { yaw:0, pitch:.35, blood:.55, thirst:.25, mind:.8, tourniquet:false, bandage:false, step:0, holding:false, hold:0, crawlT:0, night:0, lidT:0, lidNeed:false, busy:true };

  // взгляд мышью/пальцем
  let drag=null;
  listen(canvas,'pointerdown', e=>{ drag={x:e.clientX,y:e.clientY}; });
  listen(window,'pointerup', ()=>drag=null);
  listen(window,'pointermove', e=>{ if(!drag || F.busy) return; F.yaw -= (e.clientX-drag.x)*.004; F.pitch = clamp(F.pitch-(e.clientY-drag.y)*.004, -.25, 1.1); drag={x:e.clientX,y:e.clientY}; });

  function setBars(){ $('bBlood').style.width=(F.blood*100)+'%'; $('bThirst').style.width=(F.thirst*100)+'%'; $('bMind').style.width=(F.mind*100)+'%'; }
  function lookingAt(p, tol=.5){ const a=Math.atan2(-(p.x-camera.position.x), -(p.z-camera.position.z)); let dd=Math.abs(((a-F.yaw)+Math.PI*3)%(Math.PI*2)-Math.PI); return dd<tol; }
  function dist(p){ return Math.hypot(p.x-camera.position.x, p.z-camera.position.z); }

  const sc = {
    wantsJoy(){ return !F.busy && !F.dream && F.step>=2; },
    update(dt,t){
      F.clock=(F.clock||0)+dt; F.dt=dt;
      if(F.dream){ F.dream.update(dt,t); return; }
      if(!F.busy){
        // кровь уходит, пока не затянут жгут; жажда растёт; сознание падает от потери крови и жажды
        F.blood = clamp(F.blood - dt*(F.tourniquet? (F.bandage?0:.002) : .012), 0, 1);
        F.thirst = clamp(F.thirst + dt*.006, 0, 1);
        F.mind = clamp(F.mind - dt*(.002 + (1-F.blood)*.004 + F.thirst*.003), 0, 1);
        if(F.blood<.12 || F.mind<.02) { lose(); }
        // ползти
        const crawl = keys.KeyW || keys.ArrowUp || F.touchCrawl || (JOY.on && JOY.y < -.35);
        if(crawl){ F.crawlT+=dt; const s=.45*dt; camera.position.x -= Math.sin(F.yaw)*s; camera.position.z -= Math.cos(F.yaw)*s; F.mind-=dt*.004; if(F.crawlT>.7){F.crawlT=0; sfx.step(); noiseBurst({dur:.35,freq:2600,q:.8,gain:.06,type:'bandpass'});} F.roll=Math.sin(t*5)*.03; } else F.roll=(F.roll||0)*.9;
        if(keys.KeyA||keys.ArrowLeft) F.yaw+=dt*1.2; if(keys.KeyD||keys.ArrowRight) F.yaw-=dt*1.2;
        if(JOY.on && Math.abs(JOY.x)>.25) F.yaw -= JOY.x*dt*1.4;
        // жгут — удержание
        if(F.step===1){ $('hold').style.display='block'; if(F.holding||keys.Space){ F.hold=clamp(F.hold+dt*.5,0,1); } else F.hold=clamp(F.hold-dt*.25,0,1); $('bHold').style.width=(F.hold*100)+'%'; if(F.hold>=1){ F.tourniquet=true; $('hold').style.display='none'; F.step=2; setBars(); stepText(); run(DAT.scripts.tourniquet_done); } }
        // веки смыкаются
        if(F.step>=3 && F.step<5){ F.lidT+=dt; if(F.lidT>6){ F.lidNeed=true; } if(F.lidNeed){ F.lid=clamp((F.lid||0)+dt*.35,0,1); if(F.lid>=1){ F.mind-=.12; F.lid=.6; } } else F.lid=clamp((F.lid||0)-dt*2,0,1); $('eyelid').style.opacity=F.lid; }
        // ночь
        if(F.step===4){ F.nightT=(F.nightT||0)+dt; if(F.nightT>22){ dawn(); } if(Math.random()<dt*.15){ flarePop(); } if(Math.random()<dt*.12) sfx.boom(rand(0,.5)); }
      }
      // шаг состояния
      if(F.step===2 && dist(body.position)<1.4 && lookingAt(body.position,.7)){ prompt('Обыскать убитого'); F.can=searchBody; }
      else if(F.drinking){ prompt(isTouch?'Пить':'[Пробел] Пить'); F.can=null; }
      else if(F.step===5 && !F.busy && dist(CRATER)<3.2){ prompt('Пить из воронки'); F.can=drink; }
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
      // стебли: раскачиваются, когда рядом собака или камера
      looseStalks.forEach(g=>{ const near = Math.min(dog.visible?g.position.distanceTo(dog.position):9, Math.hypot(g.position.x-camera.position.x, g.position.z-camera.position.z));
        if(near<.7) g.userData.kick=Math.min(1,g.userData.kick+dt*6); else g.userData.kick*=Math.pow(.25,dt);
        if(g.userData.flat) return; const k=g.userData.kick; g.rotation.z=Math.sin(t*9+g.userData.ph)*.35*k + g.userData.ax*.5*k; g.rotation.x=Math.cos(t*7+g.userData.ph)*.25*k; });
      // собака: дыхание, хвост, лапы на бегу
      if(dog.visible){ const u=dog.userData; u.tail.rotation.z=Math.sin(t*(F.dogRun?14:6))*.5; u.jaw.position.y=-.11 - (F.dogBark>0?.05:0)*Math.abs(Math.sin(t*30)); if(F.dogBark>0) F.dogBark-=dt;
        u.legs.forEach((l,i)=>l.rotation.x = F.dogRun ? Math.sin(t*16+(i%2?Math.PI:0)+(i>1?1.2:0))*.7 : l.rotation.x*.85);
        if(F.dogSniff) u.head.rotation.x = Math.sin(t*11)*.12 + .25; }
      // кулак с тумаром — в нижней части кадра, чуть дрожит
      if(fist.visible){ placeOnCamera(fist, .12+Math.sin(t*23)*.003, -.15+Math.sin(t*1.6)*.006 + (1-(F.fistIn||0))*-.14, -.46); fist.rotateX(-.35); fist.rotateZ(.25);
        fist.userData.fingers.scale.y = F.fistOpen ? 1.6 : 1; }
      // фляга у губ
      if(F.flaskAt){ const a=F.flaskAt; placeOnCamera(flask, a.x, a.y, a.z); flask.rotateX(a.tilt); }
      // покачивание при дыхании
      const breath = Math.sin(t*1.6)*.006*(1.5-F.mind);
      camera.position.y = .32 + breath;
      if(F.pitchTo!=null) F.pitch=lerp(F.pitch, F.pitchTo, 1-Math.pow(.2,dt));
      const sh = F.shake>0 ? (F.shake-=dt, Math.sin(t*40)*(F.shakeAmp||.012)) : 0;
      if(F.yawTo!=null){ F.yaw += (((F.yawTo-F.yaw)+Math.PI*3)%(Math.PI*2)-Math.PI)*(1-Math.pow(.12,dt)); }
      camera.rotation.set(F.pitch + breath*2 + sh, F.yaw + sh*.6, Math.sin(t*.7)*.02*(1-F.mind) + (F.roll||0));
      // виньетка зависит от сознания и крови
      const v = 35 - (1-F.mind)*30;
      $('vig').style.background = `radial-gradient(ellipse at center,transparent ${v}%,rgba(${(1-F.blood)*60|0},0,0,.92) 100%)`;
      setBars();
    },
    F, body,
    onKey(code,down){ if(!down) return; if(code==='KeyE'||code==='Space'){ if(F.drinking){ swallow(); return; } if(F.can && !F.busy && !dlgOpen) F.can(); } },
    act(){ if(F.drinking){ swallow(); return; } if(F.can && !F.busy && !dlgOpen) F.can(); },
    touchAction(){ return F.drinking ? 'Пить' : null; },
    holdStart(){ F.holding=true; }, holdEnd(){ F.holding=false; },
    crawl(on){ F.touchCrawl=on; },
    async begin(){
      $('bars').style.display='block';
      setHelp(isTouch ? 'Слева — джойстик: вперёд ползти, вбок поворот · справа тяни — осмотреться' : 'W — ползти · A/D или мышь — повернуться · Пробел/E — действие');
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
  const gwait = sec => { const t0=F.clock||0; return new Promise(r=>{ const h=setInterval(()=>{ if((F.clock||0)-t0>=sec){ clearInterval(h); r(); } },50); }); };
  const run = makeRunner({
    async holdShot(sec=2.4){ closeDlg(); await gwait(sec); },
    // обрывки боя вспышками: дым, удар, ещё удар
    async flashback(){ for(const [ms,b] of [[0,3.2],[700,2.4],[1500,4]]){ await gwait(ms/1000 - (ms?0:0)); canvas.style.filter=`sepia(.3) brightness(${b}) contrast(1.4)`; sfx.boom(); hitFlash && hitFlash(); await gwait(.12); canvas.style.filter=''; } await gwait(.6); },
    async shakyHands(){ F.shake=1.4; await gwait(1.4); },
    flares(){ flarePop(); setTimeout(flarePop, 1800); },
    async drinkCam(){ const p0=F.pitch; F.pitchTo=1.0; await gwait(2.4); F.pitchTo=null; F.pitch=p0; },
    // ночью: кулак с тумаром входит в кадр снизу, разжимается и снова сжимается
    async tumarFist(){ closeDlg(); fist.visible=true; F.fistIn=0; const t0=F.clock; await untilG(()=>{ F.fistIn=Math.min(1,(F.clock-t0)/1.2); return F.fistIn>=1; });
      await gwait(1.4); F.fistOpen=true; await gwait(.9); F.fistOpen=false; await gwait(1.2);
      const t1=F.clock; await untilG(()=>{ F.fistIn=Math.max(0,1-(F.clock-t1)/1.0); return F.fistIn<=0; }); fist.visible=false; },
    // голоса и лай издалека; стебли впереди качаются
    async germansNear(){ closeDlg(); const fw=fwdOf(F.yaw), rt=rightOf(F.yaw), c=camera.position;
      F.dogStart = c.clone().addScaledVector(fw,6.5).addScaledVector(rt,.3);
      for(let i=0;i<6;i++){ const k=1.4+i*.85; addStalk(c.x+fw.x*k+rt.x*rand(-.6,.6), c.z+fw.z*k+rt.z*rand(-.6,.6)); }
      sfx.bark(0); await gwait(1.6); sfx.bark(0); F.pitchTo=.12; F.yawTo=Math.atan2(-(F.dogStart.x-c.x),-(F.dogStart.z-c.z));
      for(let i=0;i<3;i++){ looseStalks[5-i].userData.kick=1; await gwait(.5); } await gwait(.6); },
    // овчарка продирается сквозь подсолнухи, нюхает, лает прямо в объектив
    async dogBreaks(){ closeDlg(); dog.visible=true; dog.position.copy(F.dogStart); const c=camera.position;
      const target=c.clone().addScaledVector(fwdOf(F.yaw),1.5); target.y=0; F.dogRun=true; dog.lookAt(c.x,0,c.z);
      await untilG(()=>{ const d=target.clone().sub(dog.position); d.y=0; const L=d.length(); if(L<.05) return true; dog.position.addScaledVector(d.normalize(), Math.min(L, 2.6*F.dt)); dog.lookAt(c.x,0,c.z); return false; });
      F.dogRun=false; F.pitchTo=.42; const hd=dog.userData.head; hd.position.set(0,.44,.64); F.dogSniff=true; await gwait(1.4); F.dogSniff=false; hd.rotation.x=0; hd.position.set(0,.6,.6);
      for(let i=0;i<2;i++){ F.dogBark=.35; sfx.bark(0); F.shake=.25; F.shakeAmp=.02; dog.position.addScaledVector(fwdOf(F.yaw),-.1); await gwait(.35); dog.position.addScaledVector(fwdOf(F.yaw),.1); await gwait(.35); } dog.userData.head.position.set(0,.78,.55); },
    // хватает за ворот и тащит рывками: небо, головы подсолнухов, стебли хлещут по объективу
    async dogDrags(){ closeDlg(); const fw=fwdOf(F.yaw), rt=rightOf(F.yaw); const c=camera.position;
      for(let i=0;i<8;i++){ const k=.6+i*.42, side=(i%2?1:-1)*rand(.14,.3); addStalk(c.x+fw.x*k+rt.x*side, c.z+fw.z*k+rt.z*side); }
      dog.position.copy(c).addScaledVector(fw,.6); dog.position.y=0; dog.lookAt(c.x,0,c.z); // пятится и тянет на себя
      fist.visible=true; F.fistIn=1; F.fistOpen=true; F.pitchTo=1.05; // небо, по нижнему краю — пасть и ворот
      for(let j=0;j<6;j++){ const t0=F.clock; const from=camera.position.clone(), to=from.clone().addScaledVector(fw,.5); F.dogRun=true;
        sfx.bark(.05); noiseBurst({dur:.3,freq:2400,q:.7,gain:.12,type:'bandpass'}); F.shake=.3; F.shakeAmp=.03; F.roll=(j%2?1:-1)*.14;
        await untilG(()=>{ const k=Math.min(1,(F.clock-t0)/.38); camera.position.x=lerp(from.x,to.x,k); camera.position.z=lerp(from.z,to.z,k); dog.position.copy(camera.position).addScaledVector(fw,.6); dog.position.y=0; return k>=1; });
        F.dogRun=false; F.fistOpen=(j%2===0); await gwait(.32); }
      fist.visible=false; F.roll=0; F.pitchTo=.2;
      // вытоптанная поляна: стебли вокруг лежат
      looseStalks.forEach(g=>{ if(Math.hypot(g.position.x-camera.position.x,g.position.z-camera.position.z)<2.2){ g.rotation.set(Math.PI/2-.1, rand(0,6), 0); g.userData.kick=0; g.userData.flat=true; } });
      await gwait(.6);
      // собака отходит, садится в стороне
      const sit=camera.position.clone().addScaledVector(fw,2.2).addScaledVector(rt,-1.4); sit.y=0; F.dogRun=true;
      await untilG(()=>{ const d=sit.clone().sub(dog.position); d.y=0; const L=d.length(); if(L<.06) return true; dog.position.addScaledVector(d.normalize(), Math.min(L,2*F.dt)); dog.lookAt(sit.x+d.x*9, 0, sit.z+d.z*9); return false; });
      F.dogRun=false; dog.lookAt(camera.position.x,0,camera.position.z); },
    // сапоги в кадре; пожилой унтер-офицер присаживается рядом
    async sergeantSquats(){ closeDlg(); const fw=fwdOf(F.yaw), rt=rightOf(F.yaw), c=camera.position;
      const spot=c.clone().addScaledVector(fw,1.35).addScaledVector(rt,.85); spot.y=0;
      unter.visible=true; unter.position.copy(c).addScaledVector(fw,4).addScaledVector(rt,2.2); unter.position.y=0;
      F.yawTo=Math.atan2(-(unter.position.x-c.x),-(unter.position.z-c.z)); F.pitchTo=.05;
      for(let i=0;i<4;i++) sfx.step && setTimeout(()=>sfx.step(), i*420);
      await untilG(()=>{ const d=spot.clone().sub(unter.position); d.y=0; const L=d.length(); if(L<.05) return true; unter.position.addScaledVector(d.normalize(), Math.min(L,1.1*F.dt)); unter.lookAt(spot.x+d.x*9,0,spot.z+d.z*9); animWalk(unter,1,F.dt); F.yawTo=Math.atan2(-(unter.position.x-c.x),-(unter.position.z-c.z)); return false; });
      animWalk(unter,0,.016); unter.lookAt(c.x,0,c.z);
      // присел: колени согнуты, корпус ниже
      const t0=F.clock; await untilG(()=>{ const k=Math.min(1,(F.clock-t0)/1.1); unter.position.y=lerp(0,-.55,k); unter.userData.legL.rotation.x=unter.userData.legR.rotation.x=lerp(0,-1.5,k); return k>=1; });
      F.yawTo=Math.atan2(-(unter.position.x-c.x),-(unter.position.z-c.z)); F.pitchTo=.18; await gwait(1.2); },
    // долго смотрит на рану: камера опускается на бедро, потом поднимается к его лицу
    async looksAtWound(){ closeDlg(); const c=camera.position; const yawU=Math.atan2(-(unter.position.x-c.x),-(unter.position.z-c.z));
      const legYaw = yawU + .65; myLegs.visible=true; myLegs.position.set(c.x,0,c.z); myLegs.rotation.y = legYaw + Math.PI; myLegs.translateZ(.42);
      F.yawTo=legYaw; F.pitchTo=-.52; unter.lookAt(myLegs.position.x,0,myLegs.position.z); await gwait(3.0);
      F.yawTo=yawU; F.pitchTo=.22; await gwait(1.2); unter.children.forEach(ch=>{ if(ch.geometry && ch.geometry.type==='SphereGeometry' && ch.position.y>1.7) ch.rotation.x=.35; }); await gwait(2.6); },
    // молча откручивает флягу и поит; игрок глотает, пока не захлебнётся
    async flaskDrink(){ closeDlg(); unter.userData.armR.rotation.x=-1.3; flask.visible=true; F.flaskAt={x:.18,y:-.22,z:-.55,tilt:0};
      await gwait(.9); flask.userData.cap.visible=false; noiseBurst({dur:.08,freq:1800,q:2,gain:.2}); await gwait(.6);
      const t0=F.clock; await untilG(()=>{ const k=Math.min(1,(F.clock-t0)/1); F.flaskAt={x:lerp(.18,.02,k),y:lerp(-.22,-.12,k),z:lerp(-.55,-.24,k),tilt:lerp(0,-1.1,k)}; return k>=1; });
      F.sw=0; F.drinking=true;
      const tStart=F.clock; await untilG(()=>F.sw>=6 || F.clock-tStart>9);
      F.drinking=false;
      // он не убирает флягу — вода идёт дальше, Асан захлёбывается
      F.flaskAt={x:.02,y:-.1,z:-.22,tilt:-1.5}; for(let i=0;i<3;i++){ noiseBurst({dur:.25,freq:500,q:.8,gain:.4,type:'lowpass'}); tone({f:180,dur:.18,type:'sawtooth',gain:.06}); F.shake=.45; F.shakeAmp=.035; hitFlash(); await gwait(.5); }
      F.flaskAt={x:.25,y:-.3,z:-.6,tilt:0}; await gwait(.5); flask.visible=false; F.flaskAt=null; unter.userData.armR.rotation.x=0; F.thirst=.1; F.mind=Math.min(1,F.mind+.15); },
    // встаёт и машет конвоиру; тень второго ложится на лицо
    async waveConvoy(){ closeDlg(); const c=camera.position, t0=F.clock;
      await untilG(()=>{ const k=Math.min(1,(F.clock-t0)/.9); unter.position.y=lerp(-.55,0,k); unter.userData.legL.rotation.x=unter.userData.legR.rotation.x=lerp(-1.5,0,k); return k>=1; });
      F.pitchTo=.55; unter.rotation.y += 1.2; unter.userData.armL.rotation.x=-2.9; await gwait(.5); unter.userData.armL.rotation.x=-2.4; await gwait(.5); unter.userData.armL.rotation.x=-2.9; await gwait(.8); unter.userData.armL.rotation.x=0;
      convoy.visible=true; const fw=fwdOf(F.yaw); convoy.position.copy(c).addScaledVector(fw,3.5); convoy.position.y=0; convoy.lookAt(c.x,0,c.z);
      const end=c.clone().addScaledVector(fw,.45); end.y=0;
      await untilG(()=>{ const d=end.clone().sub(convoy.position); d.y=0; const L=d.length(); if(L<.05) return true; convoy.position.addScaledVector(d.normalize(), Math.min(L,1.3*F.dt)); animWalk(convoy,1,F.dt); return false; });
      animWalk(convoy,0,.016); F.pitchTo=.95; await gwait(1.6); }
  });
  const untilG = f => new Promise(r=>{ const h=setInterval(()=>{ if(f()){ clearInterval(h); r(); } },16); });
  function swallow(){ if(!F.drinking) return; F.sw++; noiseBurst({dur:.14,freq:300,q:1.4,gain:.35,type:'lowpass'}); F.shake=.12; F.shakeAmp=.01; F.thirst=Math.max(0,F.thirst-.06); }
  function hitFlash(){ const h=$('hit'); if(!h) return; h.style.opacity=.8; setTimeout(()=>h.style.opacity=0,120); }
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
    closeDlg(); setHeart(118); setObj(CH,''); cine(true);
    await run(DAT.scripts.dog);
    closeDlg(); setHeart(96); await gwait(.8);
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
