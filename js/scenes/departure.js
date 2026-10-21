'use strict';
// Глава 1, вторая половина: проводы → Акмолинск (первые слова, ночной марш) → отец у эшелона.
// Сцена сама переключает три маленьких мира (свой THREE.Scene на каждый), всё время считается во времени игры.
function sceneDeparture(){
  resetCamera();
  const DAT = DATA.ch1b, CH = 'Глава 1 · Аул';
  const S = { clock:0, phase:'', shot:null, shotT:0, fresh:false, walk:false, hold:false };
  const tmp = new THREE.Vector3();
  const until = (f, max=180000) => new Promise(r=>{ const t0=performance.now(); const h=setInterval(()=>{ if(f()||performance.now()-t0>max){ clearInterval(h); r(); } },50); });
  const gwait = sec => { const t0=S.clock; return until(()=>S.clock-t0>=sec); };
  // плавные движения, которые идут в кадре вместе с игрой: tween(сек, k=>…) ждёт окончания
  const tweens=[];
  function tween(sec, fn){ return new Promise(res=>tweens.push({t:0, sec, fn, res})); }
  const ease = k => k*k*(3-2*k);
  const run = makeRunner(Object.assign({ cut(n){ setShot(n); } }, beatHooks()));
  function setShot(n){ S.shot=n; S.shotT=0; S.fresh=true; }
  let world = null;               // текущий мир: {update(dt,t), shots:{}}
  const extraDom = [];            // кнопки и полоски, которые сцена добавила сама
  function cleanupDom(){ extraDom.forEach(e=>e.remove()); extraDom.length=0; }

  // ---------- общее ----------
  const smokeTex = (()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'); const g=x.createRadialGradient(32,32,2,32,32,30); g.addColorStop(0,'rgba(225,218,204,.6)'); g.addColorStop(1,'rgba(225,218,204,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); })();
  function makeGround(sc, size, cols, seed=0){
    const g = new THREE.PlaneGeometry(size,size,120,120); g.rotateX(-Math.PI/2);
    const col=[], pos=g.attributes.position, c=new THREE.Color();
    for(let i=0;i<pos.count;i++){ const x=pos.getX(i)+seed, z=pos.getZ(i);
      const n=Math.sin(x*.19)*Math.cos(z*.15)+Math.sin(x*.06+z*.09)*.8+Math.sin(x*.45-z*.37)*.25;
      pos.setY(i, Math.sin(x*.04)*Math.cos(z*.035)*.3);
      c.setHex(n>.9?cols[0]:n>.3?cols[1]:n<-.8?cols[3]:cols[2]); c.offsetHSL(0,0,rand(-.025,.025)); col.push(c.r,c.g,c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({vertexColors:true})); m.receiveShadow=true; sc.add(m); return m;
  }
  // ковыль: тонкие стебли, ветер качает их волнами
  function grassField(sc, n, x0,x1,z0,z1, color, h0, h1, avoid){
    const geo = new THREE.ConeGeometry(.03,1,3); geo.translate(0,.5,0); geo.scale(1,1,.3);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({color, side:THREE.DoubleSide}), n);
    const items=[], dm=new THREE.Object3D(), ZAX=new THREE.Vector3(0,0,1);
    for(let i=0;i<n;i++){ let x,z; do{ x=rand(x0,x1); z=rand(z0,z1); } while(avoid && avoid(x,z)); items.push({x,z,h:rand(h0,h1),ry:rand(0,6),ph:x*.35+z*.2}); }
    sc.add(mesh);
    return { mesh, update(t, wind=1){ items.forEach((it,i)=>{ dm.position.set(it.x,0,it.z); dm.rotation.set(0,it.ry,0); dm.rotateOnWorldAxis(ZAX, -(.12+Math.sin(t*1.6-it.ph)*.16)*wind); dm.scale.set(1,it.h,1); dm.updateMatrix(); mesh.setMatrixAt(i,dm.matrix); }); mesh.instanceMatrix.needsUpdate=true; } };
  }
  function smokeColumn(sc, src, n=14, drift=new THREE.Vector3(5,5,-1)){
    const ps=[]; for(let i=0;i<n;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false})); s.userData.t=i/n; sc.add(s); ps.push(s); }
    return { update(dt){ ps.forEach(s=>{ s.userData.t+=dt*.1; if(s.userData.t>1) s.userData.t-=1; const k=s.userData.t; s.position.set(src.x+drift.x*k+Math.sin(k*6)*.3, src.y+drift.y*k, src.z+drift.z*k); s.scale.setScalar(.7+k*3); s.material.opacity=(1-k)*.75; }); } };
  }
  function lights(sc, sky, ground, hemiI, sunCol, sunI, sunPos){
    const hemi=new THREE.HemisphereLight(sky, ground, hemiI); sc.add(hemi);
    const sun=new THREE.DirectionalLight(sunCol, sunI); sun.position.copy(sunPos); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
    Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:120}); sc.add(sun); sc.add(sun.target); return {hemi,sun};
  }
  function bow(p, k){ p.rotation.x = k; }             // наклон вперёд — смотрит в землю
  function prone(p, k){ p.rotation.x = Math.PI/2*k; p.position.y = .18*k; }
  function sitPose(p){ p.userData.legL.rotation.x=p.userData.legR.rotation.x=-1.45; p.position.y=-.38*(p.scale.y||1); }
  function wp(o){ return o.getWorldPosition(new THREE.Vector3()); }
  function directCamera(dt){
    if(!world || !S.shot || !world.shots[S.shot]) return;
    const look = world.shots[S.shot](S.shotT, dt);
    camera.updateProjectionMatrix();
    if(S.fresh || !S.look){ S.look = look.clone(); S.fresh=false; } else S.look.lerp(look, 1-Math.pow(.12,dt));
    camera.lookAt(S.look); S.shotT += dt;
  }
  function trainClack(){ try{ noiseBurst({dur:.06,freq:240,q:2,gain:.22}); noiseBurst({dur:.05,freq:300,q:2,gain:.16,delay:.11}); }catch(e){} }

  // ======================================================================
  // 1. ПРОВОДЫ — живая картинка: долгий план длинным объективом, ветер в ковыле, дым над трубой
  // ======================================================================
  function buildFarewell(){
    scene = new THREE.Scene(); const sc=scene;
    sc.background = new THREE.Color(0xb7ab96); sc.fog = new THREE.Fog(0xb7ab96, 60, 420);
    lights(sc, 0xd8cfbe, 0x4a3c2c, .55, 0xffc890, .85, new THREE.Vector3(40,12,30)); // низкое солнце на рассвете
    makeGround(sc, 900, [0xc9c2ae,0x9c906e,0x83704e,0x5e4c34]);
    const house=new THREE.Group();
    const walls=new THREE.Mesh(new THREE.BoxGeometry(7,2.8,5),M(0xb39a74)); walls.position.y=1.4;
    const roof=new THREE.Mesh(new THREE.BoxGeometry(7.6,.35,5.6),M(0x6a5a44)); roof.position.y=2.95;
    const door=new THREE.Mesh(new THREE.BoxGeometry(1,1.9,.1),M(0x3a2c1e)); door.position.set(1.2,.95,2.52);
    const win=new THREE.Mesh(new THREE.BoxGeometry(.9,.7,.1),M(0x2a2a28)); win.position.set(-1.6,1.6,2.52);
    const chim=new THREE.Mesh(new THREE.BoxGeometry(.6,1,.6),M(0x8e7a5c)); chim.position.set(-2.4,3.4,-1);
    house.add(walls,roof,door,win,chim); house.position.set(0,0,-2.5); sc.add(shadowAll(house));
    const yurt=new THREE.Group(); const yw=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,1.7,16),M(0xd8cfba)); yw.position.y=.85; const yr=new THREE.Mesh(new THREE.ConeGeometry(2.6,1.3,16),M(0xcfc4ac)); yr.position.y=2.35;
    yurt.add(yw,yr); yurt.position.set(-9,0,-1); sc.add(shadowAll(yurt));
    const smoke = smokeColumn(sc, new THREE.Vector3(-2.4,3.9,-3.5));
    // дорога в степь: от двора — прочь, к горизонту
    const RD = new THREE.Vector3(.35,0,1).normalize(), R0 = new THREE.Vector3(1.6,0,5.2);
    const road=new THREE.Mesh(new THREE.PlaneGeometry(2.2,320), new THREE.MeshLambertMaterial({color:0xa8987a})); road.rotation.x=-Math.PI/2; road.rotation.z=-Math.atan2(RD.x,RD.z);
    road.position.copy(R0).addScaledVector(RD,160).setY(.02); road.receiveShadow=true; sc.add(road);
    const grass = grassField(sc, 900, -40, 60, -20, 80, 0xcfc6ae, .35, .8, (x,z)=> (x>-5&&x<5&&z>-6&&z<6) || Math.abs((x-R0.x)*RD.z-(z-R0.z)*RD.x)<1.6);
    // передний план у объектива бокового плана: высокий ковыль подглядывает в кадр
    const SIDE_CAM = new THREE.Vector3(23,.85,12.5);
    const fgGrass = grassField(sc, 70, SIDE_CAM.x-2.6, SIDE_CAM.x-1.0, SIDE_CAM.z-2.6, SIDE_CAM.z-.6, 0x8a7c58, .9, 1.5);
    // люди
    const asan = makePerson({coat:0x6e5a42, hat:'borik'}); asan.position.set(.4,0,4.2); asan.rotation.y=Math.PI;
    const bundle=new THREE.Mesh(new THREE.SphereGeometry(.24,8,6),M(0x8a7a5a)); bundle.scale.set(1.2,.9,.9); bundle.position.set(.42,.74,.02); asan.add(bundle);
    const zhum = makePerson({coat:0x5e5a38, hat:'borik'}); zhum.position.set(1.9,0,4.7); zhum.rotation.y=Math.PI+.3;
    const zb=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),M(0x7a6a4a)); zb.position.set(-.1,1.2,-.32); zhum.add(zb);
    const father = makePerson({coat:0x4a3a2a, hat:'tymak', beard:true}); father.position.set(-.9,0,1.4);
    const mother = makePerson({coat:0x5a4636, hat:'scarf', scarf:0xd8d0c0, scale:.94}); mother.position.set(.25,0,1.3);
    const kulash = makePerson({coat:0x7a6a50, hat:'scarf', scale:.68}); kulash.position.set(1.15,0,1.7);
    sc.add(asan,zhum,father,mother,kulash); bow(father,.16);
    const W = { asan, zhum, father, mother, kulash, bundle, RD, R0, walkD:0,
      update(dt,t){
        grass.update(t); fgGrass.update(t,1.3); smoke.update(dt);
        door.visible = win.visible = S.shot!=='family'; // камера этого плана стоит в доме — дверь изнутри не нужна
        if(S.walk){ W.walkD += dt*1.25; const p=R0.clone().addScaledVector(RD, W.walkD);
          asan.position.copy(p).addScaledVector(new THREE.Vector3(RD.z,0,-RD.x), -.5); zhum.position.copy(p).addScaledVector(new THREE.Vector3(RD.z,0,-RD.x), .55);
          asan.rotation.y = zhum.rotation.y = Math.atan2(RD.x,RD.z); animWalk(asan,1,dt); animWalk(zhum,1,dt);
          zhum.userData.armR.rotation.x = -.6+Math.sin(t*3)*.5; // машет рукой — рассказывает
          if(S.kulashRun){ const tg=R0.clone().addScaledVector(RD, 3.2); const d=tg.clone().sub(kulash.position); const L=d.length();
            if(L>.1){ kulash.position.addScaledVector(d.normalize(), Math.min(L, dt*3)); kulash.rotation.y=Math.atan2(d.x,d.z); animWalk(kulash,1.4,dt); }
            else { animWalk(kulash,0,dt); kulash.userData.armR.rotation.x = -2.6+Math.sin(t*6)*.35; } }
        } else { animWalk(asan,0,dt); animWalk(zhum,0,dt); }
        mother.userData.armL.rotation.x = Math.sin(t*.7)*.05; // почти неподвижны — живая картинка
      },
      shots:{
        est(k){ camera.fov=22; camera.position.set(44-k*.25,5.5,48); return new THREE.Vector3(-1,1.4,0); },
        side(k){ camera.fov=19; camera.position.copy(SIDE_CAM); camera.position.y += Math.sin(k*.4)*.01; return new THREE.Vector3(.4,1.15,3.1); },
        father(k){ camera.fov=30; camera.position.set(2.0,1.2,4.9); return new THREE.Vector3(-.75,1.45,1.5); },
        family(k){ camera.fov=40; camera.position.set(-.2,1.5,-1.3); return new THREE.Vector3(R0.x+RD.x*40, .9, R0.z+RD.z*40); }
      } };
    return W;
  }

  // ======================================================================
  // 2. АКМОЛИНСК — сверху: строй, сержант, три первых слова; потом ночной марш с «максимом»
  // ======================================================================
  function buildDrill(){
    scene = new THREE.Scene(); const sc=scene;
    sc.background = new THREE.Color(0x9a9a92); sc.fog = new THREE.Fog(0x9a9a92, 40, 220);
    lights(sc, 0xc8c8c0, 0x4a4438, .7, 0xe8e2d4, .55, new THREE.Vector3(-14,22,10));
    makeGround(sc, 400, [0x9e9682,0x837a62,0x6e6450,0x56503e], 50);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(26,3.2,6),M(0x7a6a52)); bar.position.set(0,1.6,-10); sc.add(shadowAll(bar));
    const barRoof = new THREE.Mesh(new THREE.BoxGeometry(27,.4,7),M(0x4e4438)); barRoof.position.set(0,3.4,-10); sc.add(shadowAll(barRoof));
    for(let i=0;i<6;i++){ const w=new THREE.Mesh(new THREE.BoxGeometry(1.2,1,.1),M(0x2a2824)); w.position.set(-10+i*4,1.9,-6.95); sc.add(w); }
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.6,7,10),M(0x6e6658)); tower.position.set(16,3.5,-14); sc.add(shadowAll(tower));
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,7,6),M(0x3a3028)); flagPole.position.set(-8,3.5,2); sc.add(flagPole);
    const flagGeo = new THREE.PlaneGeometry(1.6,1,8,4); const flagBase=flagGeo.attributes.position.array.slice();
    const flag = new THREE.Mesh(flagGeo, new THREE.MeshLambertMaterial({color:0x8e1f1a, side:THREE.DoubleSide})); flag.position.set(-7.2,6.4,2); sc.add(flag);
    // строй: призывники ещё в своей одежде, форму выдадут позже
    const coats=[0x6a5844,0x5a4a3a,0x7a6a50,0x4e4436,0x665a48,0x5c5040,0x706048];
    const hats=['borik','tymak','none','borik','none','tymak','borik'];
    const line=[]; for(let i=0;i<7;i++){ const p=makePerson({coat:coats[i], hat:hats[i]}); p.position.set(-4.5+i*1.5,0,0); sc.add(p); line.push(p); }
    const asan = makePerson({coat:0x6e5a42, hat:'borik'}); asan.position.set(.75,0,0); sc.add(asan);
    line[3].position.x = 2.25; line[4].position.x=3.75; line[5].position.x=5.25; line[6].visible=false;
    const zhum = line[2]; zhum.position.x = -.75; // Жумабай — сосед слева
    const kol = makePerson({coat:0x5c5a3a, hat:'pilotka'}); kol.position.set(0,0,5); kol.rotation.y=Math.PI; sc.add(kol);
    const W = { asan, zhum, kol, line, pose:{}, update(dt,t){
        const fp=flagGeo.attributes.position; for(let i=0;i<fp.count;i++){ const x=flagBase[i*3]; fp.setZ(i, Math.sin(t*4+x*3)*.12*(x+.8)); } fp.needsUpdate=true;
        // позы: лечь / целиться / подать диск — плавно
        for(const p of [...line, asan]){ const want=W.pose[p.id]||'stand'; const u=p.userData; u.k=u.k||{prone:0,aim:0,disk:0};
          for(const key of ['prone','aim','disk']) u.k[key]=lerp(u.k[key], want===key?1:0, 1-Math.pow(.002,dt));
          prone(p,u.k.prone); u.armR.rotation.x = -1.5*u.k.aim - .9*u.k.disk; u.armL.rotation.x = -1.4*u.k.aim - 1.6*u.k.disk; u.armL.rotation.z = .5*u.k.disk; }
        kol.userData.armR.rotation.x = W.shout ? -2.2 : lerp(kol.userData.armR.rotation.x, 0, dt*3);
      },
      shots:{
        top(k){ camera.fov=38; camera.position.set(1,10.5,13.5); return new THREE.Vector3(.5,.4,1.6); },
        kol(k){ camera.fov=28; camera.position.set(.9,1.75,1.2); return new THREE.Vector3(0,1.7,5); },
        line(k){ camera.fov=30; camera.position.set(-1.2,1.7,4.2); return new THREE.Vector3(.2,1.5,0); }
      } };
    return W;
  }
  function buildMarch(){
    scene = new THREE.Scene(); const sc=scene;
    sc.background = new THREE.Color(0x1c2230); sc.fog = new THREE.Fog(0x1c2230, 14, 70);
    lights(sc, 0x5a6a88, 0x14120e, .5, 0x9ab0d8, .45, new THREE.Vector3(-20,30,-10));
    makeGround(sc, 900, [0x5a5a58,0x4a463c,0x3c382e,0x2c2a24], 120);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(4,16,12), new THREE.MeshBasicMaterial({color:0xe8e4d4, fog:false})); moon.position.set(-60,40,-160); sc.add(moon);
    const tufts = grassField(sc, 700, -25, 25, -260, 20, 0x5e5a48, .25, .6);
    const col=[]; for(let i=0;i<10;i++){ const p=makePerson({coat:0x5e5a3e, hat:i%3?'pilotka':'borik'}); p.position.set(rand(-.15,.15),0,-i*1.7); sc.add(p); col.push(p); }
    const asan = makePerson({coat:0x6e5a42, hat:'borik'}); asan.position.set(0,0,-10*1.7+.1); sc.add(asan);
    const maxim = new THREE.Mesh(new THREE.BoxGeometry(.24,.28,1.0),M(0x2a2a26)); maxim.position.set(.22,1.78,0); asan.add(maxim);
    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.5,8),M(0x3a3a34)); jacket.rotation.x=Math.PI/2; jacket.position.set(.22,1.8,.45); asan.add(jacket);
    asan.userData.carry=true; asan.userData.armR.rotation.x=-2.8; asan.userData.armL.rotation.x=-.3;
    const zhum = makePerson({coat:0x5e5a38, hat:'borik'}); sc.add(zhum);
    const cart = new THREE.Group(); const cw1=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.06,10),M(0x2a2620)); cw1.rotation.z=Math.PI/2; cw1.position.set(-.3,.22,0); const cw2=cw1.clone(); cw2.position.x=.3;
    const cb=new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.8),M(0x3a3830)); cb.position.y=.35; cart.add(cw1,cw2,cb); sc.add(cart);
    const starshina = makePerson({coat:0x4e4a34, hat:'pilotka'}); starshina.visible=false; sc.add(starshina);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.16,.11,.1,12),M(0x6a6a62)); bowl.position.set(0,1.05,.42); bowl.visible=false; asan.add(bowl);
    const porridge = new THREE.Mesh(new THREE.SphereGeometry(.15,10,6,0,Math.PI*2,0,Math.PI/2),M(0xd8c8a0)); porridge.position.y=.05; porridge.scale.y=.3; bowl.add(porridge);
    const W = { asan, zhum, col, cart, starshina, bowl, porridge, stamina:1, colV:1.55, lag:0, lagT:0, update(dt,t){
        tufts.update(t,.5);
        if(W.halted){ for(const p of [...col, asan, zhum]) animWalk(p,0,dt); return; }
        for(const p of col){ p.position.z -= W.colV*dt; animWalk(p, 1, dt); }
        const ahead = col[col.length-1];
        const v = S.hold && W.stamina>0 ? 2.05 : (W.stamina<=0 ? 1.0 : 1.12);
        if(S.hold && W.stamina>0) W.stamina=Math.max(0, W.stamina-dt/9); else W.stamina=Math.min(1, W.stamina+dt/6.5);
        asan.position.z -= v*dt; if(asan.position.z < ahead.position.z+1.5) asan.position.z = ahead.position.z+1.5;
        animWalk(asan, 1, dt);
        W.gap = asan.position.z - ahead.position.z - 1.7;
        // отстал совсем — колонна сбавляет шаг, Жумабай подталкивает: провалить марш нельзя, но тяжесть чувствуется
        W.colV = W.gap>7 ? .9 : 1.55;
        if(W.gap>3.5) W.lagT += dt;
        zhum.position.set(-.35,0,asan.position.z+1.4+Math.min(W.gap,2)*.2); animWalk(zhum,1,dt); zhum.userData.carry=true; zhum.userData.armL.rotation.x=zhum.userData.armR.rotation.x=.4;
        cart.position.set(-.35,0,zhum.position.z+.9);
        moon.position.z = asan.position.z-160;
        const bar=$('dpStam'); if(bar) bar.style.width=(W.stamina*100)+'%';
      },
      shots:{
        maxim(k){ camera.fov=28; const p=asan.position; camera.position.set(p.x+3.2, 1.5, p.z+.4); return new THREE.Vector3(p.x,1.5,p.z-.3); },
        halt(k){ camera.fov=30; const p=asan.position; camera.position.set(p.x+3.8, 1.6, p.z+2.4); return new THREE.Vector3(p.x+.5,1.45,p.z-.3); },
        follow(k){ camera.fov=40; tmp.set(asan.position.x+3.2, 9.5, asan.position.z+8.5); if(S.fresh) camera.position.copy(tmp); else camera.position.lerp(tmp,.08); return asan.position.clone().add(new THREE.Vector3(0,.6,-2.5)); }
      } };
    return W;
  }

  // ======================================================================
  // 3. ОТЕЦ У ЭШЕЛОНА — кино. Эшелон стоит в своей системе отсчёта, степь едет мимо.
  // ======================================================================
  function buildTrain(){
    scene = new THREE.Scene(); const sc=scene;
    sc.background = new THREE.Color(0xc4b898); sc.fog = new THREE.Fog(0xc4b898, 50, 380);
    const L = lights(sc, 0xe0d6c0, 0x4a3c2c, .6, 0xffe2b0, .8, new THREE.Vector3(-30,30,40));
    // степь — текстура едет
    const stepTex = (()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=256; const x=cv.getContext('2d'); x.fillStyle='#8c7a56'; x.fillRect(0,0,256,256);
      for(let i=0;i<900;i++){ x.fillStyle=['#a39068','#7a6a4a','#9a8a62','#6e5e40'][i%4]; x.fillRect(Math.random()*256,Math.random()*256,rand(2,9),rand(1,3)); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(60,60); return t; })();
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(1200,1200), new THREE.MeshLambertMaterial({map:stepTex})); gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; sc.add(gnd);
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1200,.4,4),M(0x6e5e46)); bed.position.y=.2; sc.add(bed);
    // стебли и телеграфные столбы уносит назад
    const tuftGeo=new THREE.ConeGeometry(.12,.6,4); const tufts=new THREE.InstancedMesh(tuftGeo, M(0xa38c5c), 600); const tf=[]; const dm=new THREE.Object3D();
    for(let i=0;i<600;i++){ let z; do{ z=rand(-90,120); }while(Math.abs(z)<3.5); tf.push({x:rand(-200,200), z, s:rand(.6,1.6)}); } sc.add(tufts);
    const poles=[]; for(let i=0;i<14;i++){ const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,6,6),M(0x4a3a2a)); p.position.set(-200+i*30,3,-9); const bar=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,1.2),M(0x4a3a2a)); bar.position.y=2.7; p.add(bar); sc.add(shadowAll(p)); poles.push(p); }
    const hut = new THREE.Group(); const hw=new THREE.Mesh(new THREE.BoxGeometry(4,2.6,3),M(0xa8946e)); hw.position.y=1.3; const hr=new THREE.Mesh(new THREE.BoxGeometry(4.4,.3,3.4),M(0x5a4a38)); hr.position.y=2.75; hut.add(hw,hr); hut.position.set(-70,0,-9); sc.add(shadowAll(hut));
    // эшелон: паровоз и теплушки; у вагона Асана дверь открыта, внутри — люди
    const train = new THREE.Group(); sc.add(train);
    const loco=new THREE.Group(); const boiler=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,5,14),M(0x262422)); boiler.rotation.z=Math.PI/2; boiler.position.set(-1,2.1,0);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.6,2.6),M(0x2c2a26)); cab.position.set(2.4,2.3,0); const stack=new THREE.Mesh(new THREE.CylinderGeometry(.3,.35,1.2,10),M(0x1e1c1a)); stack.position.set(-2.8,3.4,0);
    loco.add(boiler,cab,stack); loco.position.x=-30; train.add(shadowAll(loco));
    const locoSmoke = smokeColumn(sc, new THREE.Vector3(-32.8,4.2,0), 18, new THREE.Vector3(26,3,-2));
    const WX = -6.4; // вагон Асана
    const wallM = M(0x5a3426), inM = new THREE.MeshLambertMaterial({color:0x2a1c14, side:THREE.DoubleSide});
    for(let i=0;i<7;i++){ const x=-21+i*7.3; if(Math.abs(x-WX)<.1) continue; const w=new THREE.Mesh(new THREE.BoxGeometry(6.8,2.6,2.8),wallM); w.position.set(x,2.1,0); train.add(shadowAll(w)); const dd=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.9,.05),M(0x3a2218)); dd.position.set(x,1.9,1.43); train.add(dd); }
    { // вагон Асана: стены с дверным проёмом, потолок, пол
      const g=new THREE.Group(); g.position.set(WX,0,0);
      const fl=new THREE.Mesh(new THREE.BoxGeometry(6.8,.1,2.8),inM); fl.position.y=.8; const rf=new THREE.Mesh(new THREE.BoxGeometry(6.8,.1,2.8),wallM); rf.position.y=3.4;
      const back=new THREE.Mesh(new THREE.BoxGeometry(6.8,2.6,.08),inM); back.position.set(0,2.1,-1.4);
      const e1=new THREE.Mesh(new THREE.BoxGeometry(.08,2.6,2.8),inM); e1.position.set(-3.4,2.1,0); const e2=e1.clone(); e2.position.x=3.4;
      const f1=new THREE.Mesh(new THREE.BoxGeometry(2.5,2.6,.08),inM); f1.position.set(-2.15,2.1,1.4); const f2=f1.clone(); f2.position.x=2.15;
      const lint=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,.08),inM); lint.position.set(0,3.15,1.4);
      const outer=new THREE.Mesh(new THREE.BoxGeometry(6.84,2.64,.04),wallM); // наружная обшивка, кроме проёма — проём режут два куска
      const o1=new THREE.Mesh(new THREE.BoxGeometry(2.5,2.6,.04),wallM); o1.position.set(-2.15,2.1,1.45); const o2=o1.clone(); o2.position.x=2.15; const o3=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,.04),wallM); o3.position.set(0,3.15,1.45);
      const ob=new THREE.Mesh(new THREE.BoxGeometry(6.8,2.6,.04),wallM); ob.position.set(0,2.1,-1.45);
      g.add(fl,rf,back,e1,e2,f1,f2,lint,o1,o2,o3,ob); train.add(g);
      const lamp=new THREE.PointLight(0xffd8a0,.5,7,2); lamp.position.set(0,2.6,0); g.add(lamp);
    }
    const sitters=[]; for(let i=0;i<5;i++){ const p=makePerson({coat:[0x5e5a3e,0x6a5844,0x4e4436,0x5c5040,0x706048][i], hat:i%2?'pilotka':'borik'}); sitPose(p); p.position.set(WX-2.6+i*1.1,.85-.38,-1.0); p.rotation.y=0; train.add(p); sitters.push(p); }
    const asan = makePerson({coat:0x6e5a42, hat:'borik'}); asan.position.set(WX+.75,.85,.95); asan.rotation.y=-.4; train.add(asan);
    const zhum = makePerson({coat:0x5e5a38, hat:'borik'}); zhum.position.set(WX-.85,.85,.7); zhum.rotation.y=.5; train.add(zhum);
    // отец на рыжем коне
    const rider = new THREE.Group(); const horse = makeHorse(0x8a4a24);
    const father = makePerson({coat:0x4a3a2a, hat:'tymak', beard:true}); father.position.y=1.1; father.userData.legL.rotation.x=father.userData.legR.rotation.x=-1.2;
    rider.add(horse, father); sc.add(rider);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(.12,.07,.04),M(0x1a1008)); mouth.position.set(0,1.72,.19); mouth.visible=false; father.add(mouth);
    const pouch = new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),M(0xd8c8a0)); pouch.scale.set(1,.8,1); pouch.visible=false; sc.add(pouch);
    const W = { train, asan, zhum, rider, father, horse, pouch, mouth, sitters, WX, loud:0, vT:5.5, rel:new THREE.Vector3(WX+75,0,48), relV:new THREE.Vector3(), mode:'wait', clackT:0, update(dt,t){
        // степь едет назад со скоростью эшелона
        stepTex.offset.x += W.vT*dt/20; const sh = W.vT*dt;
        tf.forEach((it,i)=>{ it.x += sh; if(it.x>200) it.x-=400; dm.position.set(it.x,.3,it.z); dm.scale.setScalar(it.s); dm.rotation.set(0,i,0); dm.updateMatrix(); tufts.setMatrixAt(i,dm.matrix); }); tufts.instanceMatrix.needsUpdate=true;
        poles.forEach(p=>{ p.position.x += sh; if(p.position.x>220) p.position.x-=420; });
        hut.position.x += sh;
        locoSmoke.update(dt);
        W.clackT += dt*W.vT/7.3; if(W.clackT>1){ W.clackT-=1; trainClack(); }
        train.position.y = Math.sin(t*W.vT*2.1)*.012 + (W.loud? Math.sin(t*60)*.01:0);
        // конь — в системе эшелона: пока догоняет, потом рядом, потом отстаёт
        const door = new THREE.Vector3(WX+.3,0,3.4);
        if(W.mode==='approach'){ const d=door.clone().sub(W.rel); const L=d.length(); const sp=Math.min(8.5, L*.9+1.5); W.relV.copy(d.normalize().multiplyScalar(sp)); if(L<.4) W.mode='along'; }
        else if(W.mode==='along'){ W.relV.set((door.x+Math.sin(t*1.3)*.25-W.rel.x)*2, 0, (door.z+Math.sin(t*.9)*.15-W.rel.z)*2); }
        else if(W.mode==='fall'){ W.relV.x = Math.min(W.relV.x + dt*1.6, W.vT*.75); W.relV.z = .6; }
        if(W.mode!=='wait'){ W.rel.addScaledVector(W.relV, dt); }
        rider.position.copy(W.rel);
        const worldV = new THREE.Vector3(W.relV.x - W.vT, 0, W.relV.z); const hs = worldV.length();
        if(hs>.5) rider.rotation.y = Math.atan2(worldV.x, worldV.z);
        const fq = 4+hs*.9, amp=Math.min(.75,.2+hs*.06);
        horse.userData.legs.forEach((l,i)=>l.rotation.x = hs>.5 ? Math.sin(t*fq+(i%2?Math.PI:0)+(i>1?1:0))*amp : l.rotation.x*.9);
        rider.position.y = hs>4 ? Math.abs(Math.sin(t*fq))*.12 : 0;
        if(W.throwT!==undefined){ W.throwT += dt; const k=Math.min(1,W.throwT/.75); const a=W.throwFrom, b=new THREE.Vector3(WX+.2,.95,.2);
          pouch.position.set(lerp(a.x,b.x,k), lerp(a.y,b.y,k)+Math.sin(k*Math.PI)*.8, lerp(a.z,b.z,k)); if(k>=1){ W.throwT=undefined; try{ noiseBurst({dur:.12,freq:500,q:1,gain:.3}); }catch(e){} } }
      },
      shots:{
        wide(k){ camera.fov=16; camera.position.set(WX-28,2.6,74); return new THREE.Vector3(WX-6,1.8,0); },
        door(k){ camera.fov=50; camera.position.set(WX-.3,1.85,-.5+Math.sin(k*12)*.004); return new THREE.Vector3(WX+.9,1.45,6); },
        track(k){ camera.fov=34; tmp.set(W.rel.x+6.5, 1.8, W.rel.z+7.5); if(S.fresh) camera.position.copy(tmp); else camera.position.lerp(tmp,.1); return W.rel.clone().setY(1.6).lerp(new THREE.Vector3(WX,2,1.4),.25); },
        meet(k){ camera.fov=36; camera.position.set(WX-.35,1.65,-1.0+Math.sin(k*12)*.004); return wp(father).setY(2.0); },
        behind(k){ camera.fov=lerp(30,22,Math.min(1,k/7)); camera.position.set(WX+.15,1.75,1.75); return W.rel.clone().setY(1.6); },
        asanDoor(k){ camera.fov=34; camera.position.set(WX+3.2,2.0,4.6); return new THREE.Vector3(WX+.7,1.9,1.1); },
        inside(k){ camera.fov=46; camera.position.set(WX-3.05,2.05,1.0); return new THREE.Vector3(WX-.3,1.0,-.5); }
      } };
    return W;
  }

  // ---------- ремарки: каждую сцена показывает сама ----------
  function beatHooks(){ return {
    // проводы
    async motherBread(){ const W=world, m=W.mother, from=m.position.clone(), to=W.asan.position.clone().add(new THREE.Vector3(-.25,0,-.55));
      setShot('side');
      await tween(1.4, k=>{ m.position.lerpVectors(from,to,ease(k)); m.lookAt(W.asan.position.x,0,W.asan.position.z); animWalk(m, k<1?1:0, 1/60); });
      await tween(.9, k=>{ m.userData.armR.rotation.x = -1.3*Math.sin(k*Math.PI); W.bundle.scale.set(1.2+.25*k,.9+.15*k,.9+.1*k); });
      await tween(1.4, k=>{ m.position.lerpVectors(to,from,ease(k)); animWalk(m, k<1?1:0, 1/60); });
      m.rotation.y=0; },
    async kulashSteps(){ const W=world, q=W.kulash, from=q.position.clone(), to=W.asan.position.clone().add(new THREE.Vector3(-.6,0,-.55));
      await tween(1.6, k=>{ q.position.lerpVectors(from,to,ease(k)); q.lookAt(W.asan.position.x,0,W.asan.position.z); animWalk(q,k<1?1.4:0,1/60); }); },
    async kulashHides(){ const W=world, q=W.kulash, from=q.position.clone(), to=W.mother.position.clone().add(new THREE.Vector3(.25,0,-.55));
      await tween(1.3, k=>{ q.position.lerpVectors(from,to,ease(k)); animWalk(q,k<1?1:0,1/60); }); q.rotation.y=0; await gwait(.8); },
    async fatherLooksDown(){ setShot('father'); const f=world.father; await tween(1.6, k=>bow(f, lerp(.16,.32,ease(k)))); await gwait(1.2); },
    // марш
    async showMaxim(){ setShot('maxim'); await gwait(2.6); setShot('follow'); },
    async zhumShoulder(){ setShot('halt'); const z=world.zhum, a=world.asan; await tween(1.2, k=>{ z.position.x=lerp(z.position.x, a.position.x-.42, k); z.position.z=lerp(z.position.z, a.position.z+.1, k); z.userData.armR.rotation.x=-1.0*k; z.userData.armR.rotation.z=-.6*k; }); await gwait(1.2); },
    async doubleBowl(){ setShot('halt'); const W=world; W.bowl.visible=true; W.asan.userData.armL.rotation.x=W.asan.userData.armR.rotation.x=-1.1; W.starshina.userData.armR.rotation.x=-1.3;
      await tween(1.4, k=>{ W.porridge.scale.y = .3+1.2*ease(k); W.porridge.position.y = .05+.06*k; }); await gwait(.8); W.starshina.userData.armR.rotation.x=0; },
    // эшелон
    async fatherShouts(){ setShot('meet'); const f=world.father; f.userData.armR.rotation.x=-2.9; world.mouth.visible=true; world.loud=1;
      for(let i=0;i<6;i++){ trainClack(); try{ noiseBurst({dur:.35,freq:180,q:.6,gain:.35}); }catch(e){} await gwait(.35); }
      world.loud=0; },
    async asanShouts(){ setShot('asanDoor'); const a=world.asan; a.userData.armR.rotation.x=-2.6; await tween(.8, k=>{ a.position.z=lerp(.95,1.25,k); }); await gwait(1.4); a.userData.armR.rotation.x=-.4; },
    async wagonLooks(){ setShot('inside'); world.pouch.position.set(world.WX+.2,.95,.2); world.pouch.visible=true;
      await tween(1.3, k=>world.sitters.forEach((p,i)=>{ p.rotation.y = lerp(0, Math.atan2(world.WX+.2-p.position.x, .2-p.position.z), ease(Math.min(1,k*1.4-i*.08))); })); await gwait(.6); },
    async shareAll(){ const W=world, path=[new THREE.Vector3(W.WX+.2,1.2,.3), ...W.sitters.map(p=>p.position.clone().setY(1.25)).reverse()];
      for(let i=0;i<path.length-1;i++){ const a=path[i], b=path[i+1]; const who=W.sitters[W.sitters.length-1-i];
        await tween(.55, k=>{ W.pouch.position.lerpVectors(a,b,k); W.pouch.position.y += Math.sin(k*Math.PI)*.25; if(who) who.userData.armR.rotation.x=-1.4*Math.sin(k*Math.PI); }); } },
    async turnAway(){ const W=world; await tween(1.4, k=>W.sitters.forEach(p=>{ p.rotation.y = lerp(p.rotation.y, Math.PI*.9, k*.25); })); await gwait(.6); }
  }; }

  // ---------- ввод ----------
  function responseButtons(){
    const box=document.createElement('div'); box.id='dpResp';
    box.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom,0px));display:flex;gap:10px;z-index:14';
    // на телефоне «Лечь» — это контекстная кнопка действия справа, здесь — остальные две
    [['ложись','1'],['огонь','2'],['диск','3']].filter(([w])=>!(isTouch && w==='ложись')).forEach(([w,k])=>{ const b=document.createElement('button'); b.dataset.w=w;
      b.innerHTML = `${isTouch?'':'<span style="opacity:.6;margin-right:6px">'+k+'</span>'}${escapeHtml(DAT.actions[w])}`;
      b.style.cssText='font:inherit;font-size:15px;min-width:118px;padding:12px 14px;background:rgba(20,17,13,.88);color:#e9dfc9;border:1px solid #8a7c62;cursor:pointer';
      b.addEventListener('pointerdown', e=>{ e.stopPropagation(); respond(w); }); box.appendChild(b); });
    document.body.appendChild(box); extraDom.push(box); return box;
  }
  function staminaBar(){
    const box=document.createElement('div'); box.style.cssText='position:fixed;right:calc(16px + env(safe-area-inset-right,0px));top:calc(16px + env(safe-area-inset-top,0px));width:170px;z-index:6;font-size:13px;color:#e9dfc9';
    box.innerHTML='Силы<div style="height:6px;background:rgba(255,255,255,.15);margin-top:4px"><div id="dpStam" style="height:100%;width:100%;background:#c9a46a"></div></div>';
    document.body.appendChild(box); extraDom.push(box);
  }
  let drill=null;      // текущий раунд строевой
  function respond(w){
    if(!drill || drill.answered) return;
    drill.answered=true; const ok = w===drill.cmd;
    world.pose[world.asan.id] = w==='ложись'?'prone':w==='огонь'?'aim':'disk';
    drill.result = ok ? (S.clock-drill.t0<=drill.window ? 'ok':'late') : 'wrong';
  }

  // ======================================================================
  // сценарий части
  // ======================================================================
  async function partFarewell(){
    world = buildFarewell(); S.phase='farewell';
    cine(true); setShot('est'); await fadeTo(0,2200);
    await gwait(5.5);
    setShot('side'); await gwait(4.5);
    await run(DAT.scripts.farewell);
    setShot('side');
    // уйти — игрок сам делает первый шаг
    cine(false); setObj(CH, isTouch?DAT.objectives.leaveTouch:DAT.objectives.leave);
    S.wantWalk=true; await until(()=>S.walk); S.wantWalk=false; setObj(CH,'');
    cine(true); setShot('family'); if(memory.flags.sharedWithKulash) S.kulashRun=true;
    let j=0; const jokes=DAT.jokes;
    while(world.walkD<38){ await gwait(3.6); if(j<jokes.length && world.walkD<30) bark('Жумабай', jokes[j++]); }
    await run(DAT.scripts.farewell_end);
  }
  async function partDrill(){
    const w = wipe(1300); world = buildDrill(); S.phase='drill'; setShot('top'); cine(true); await w;
    await gwait(1.5); setShot('kol'); await run(DAT.scripts.drill_intro); setShot('top'); cine(false);
    setObj(CH, isTouch?DAT.objectives.drillTouch:DAT.objectives.drill); responseButtons();
    const seq=['ложись','ложись','огонь','ложись','огонь','диск','огонь','диск','ложись','диск','огонь','ложись'];
    const right={ложись:0,огонь:0,диск:0}, learned={};
    for(const cmd of seq){
      world.line.forEach(p=>world.pose[p.id]='stand'); world.pose[world.asan.id]='stand';
      await gwait(1.3);
      const known = memory.knownWords.has(cmd);
      drill = { cmd, t0:S.clock, window:3.2, answered:false, result:null }; S.drill=drill;
      world.shout=true; bark('Колесников', DAT.commands[cmd], 'ru'); try{ tone({f:190,dur:.25,type:'sawtooth',gain:.06}); }catch(e){}
      // соседи повторяют за сержантом: пока слово незнакомо — сразу, потом — медленнее, Асан успевает первым
      const delay = known ? 1.7 : .65;
      await until(()=>S.clock-drill.t0>=delay || drill.answered);
      world.shout=false;
      const pose = cmd==='ложись'?'prone':cmd==='огонь'?'aim':'disk';
      world.line.forEach((p,i)=>{ if(p.visible) world.pose[p.id]=pose; });
      await until(()=>drill.answered || S.clock-drill.t0>drill.window+1.2);
      if(!drill.answered){ drill.result='late'; world.pose[world.asan.id]=pose; }
      if(drill.result==='ok'){ right[cmd]++; try{ sfx.wood(); }catch(e){} }
      else { bark('Колесников', drill.result==='late'?DAT.drillBarks.late:DAT.drillBarks.wrong, 'ru'); }
      if(right[cmd]>=2 && !learned[cmd]){ learned[cmd]=true; await run(DAT.scripts['learn_'+cmd]); }
      await gwait(1.5);
    }
    drill=null; S.drill=null;
    for(const cmd of ['ложись','огонь','диск']) if(!learned[cmd]) await run(DAT.scripts['learn_'+cmd]); // к концу дня слова всё равно выучены
    world.line.forEach(p=>world.pose[p.id]='stand'); world.pose[world.asan.id]='stand';
    cleanupDom(); setObj(CH,''); cine(true); setShot('line'); await gwait(1.2);
    await run(DAT.scripts.drill_end);
  }
  async function partMarch(){
    const w = wipe(1500); world = buildMarch(); S.phase='march'; setShot('follow'); cine(true); await w;
    await run(DAT.scripts.march_intro); cine(false);
    setObj(CH, isTouch?DAT.objectives.marchTouch:DAT.objectives.march); staminaBar();
    S.marching=true;
    listen(canvas,'pointerdown', ()=>{ S.pHold=true; }); listen(canvas,'pointerup', ()=>{ S.pHold=false; }); listen(canvas,'pointerleave', ()=>{ S.pHold=false; });
    let barkCD=0; const t0=S.clock;
    while(S.clock-t0 < 42){ await gwait(.5); barkCD-=.5;
      if(world.gap>7 && barkCD<=0){ bark('Жумабай', DAT.marchBarks.help); barkCD=6; }
      else if(world.gap>3.5 && barkCD<=0){ bark('Колесников', DAT.marchBarks.lag, 'ru'); barkCD=6; } }
    S.marching=false; S.tHold=S.pHold=false; memory.flags.marchLagged = world.lagT > 12;
    cleanupDom(); S.hold=false; setObj(CH,'');
    // рассвет на привале
    cine(true); await fadeTo(1,900); scene.background.setHex(0x8a8070); scene.fog.color.setHex(0x8a8070);
    world.halted=true; const a=world.asan.position; world.starshina.position.set(a.x+1.15,0,a.z-.55); world.starshina.visible=true; world.starshina.lookAt(a.x,0,a.z);
    world.asan.rotation.y = Math.atan2(world.starshina.position.x-a.x, world.starshina.position.z-a.z);
    world.asan.userData.armR.rotation.x=0; world.asan.children.forEach(c=>{ if(c.geometry && c.geometry.parameters && c.geometry.parameters.depth===1.0) c.visible=false; });
    setShot('halt'); await fadeTo(0,900);
    await run(DAT.scripts.march_end);
  }
  async function partTrain(){
    const w = wipe(1500); world = buildTrain(); S.phase='train'; setShot('wide'); cine(true); setObj(CH, ''); await w;
    await gwait(2.5); await run(DAT.scripts.train_intro);
    await gwait(2.5);
    setShot('door'); world.vT=5.2; await gwait(3.5);
    world.mode='approach';
    await gwait(2.2); await run(DAT.scripts.train_rider);
    setShot('track'); await until(()=>world.mode==='along');
    await gwait(2.4);
    setShot('meet'); await gwait(1.6);
    world.throwFrom = wp(world.father).setY(2.2); world.pouch.visible=true; world.throwT=0; world.father.userData.armR.rotation.x=-2.4;
    await gwait(1.0); world.father.userData.armR.rotation.x=-2.9;
    await run(DAT.scripts.train_shout);
    world.mode='fall'; world.vT=6.5; setShot('behind');
    const tf=S.clock; while(S.clock-tf<7.5){ world.vT=Math.min(10, world.vT+.6*.5); world.father.userData.armR.rotation.x=-2.9; await gwait(.5); }
    setShot('inside'); world.rider.visible=false; await gwait(1.2);
    await run(DAT.scripts.train_after);
  }

  return {
    S,
    update(dt, t){
      S.clock += dt;
      const mv = moveInput();
      if(S.wantWalk && (mv[0]||mv[1])) S.walk=true;
      S.hold = !!(mv[0]||mv[1]||keys.Space||S.tHold||S.pHold);
      for(let i=tweens.length-1;i>=0;i--){ const tw=tweens[i]; tw.t+=dt; const k=Math.min(1,tw.t/tw.sec); tw.fn(k); if(k>=1){ tweens.splice(i,1); tw.res(); } }
      if(world){ world.update(dt,t); directCamera(dt); }
    },
    onKey(code, down){
      if(!down) return;
      if(S.wantWalk && (code==='KeyE'||code==='Space'||code==='Enter')) S.walk=true;
      if(drill){ const m={Digit1:'ложись',KeyC:'ложись',Digit2:'огонь',KeyF:'огонь',Digit3:'диск',KeyR:'диск',Numpad1:'ложись',Numpad2:'огонь',Numpad3:'диск'}[code]; if(m) respond(m); }
    },
    act(){ if(S.wantWalk) S.walk=true; else if(drill) respond('ложись'); },
    wantsJoy(){ return !!S.wantWalk; },
    touchAction(){ if(S.wantWalk) return 'Идти'; if(drill) return DAT.actions['ложись']; if(S.marching) return 'Держать шаг'; return null; },
    holdStart(){ S.tHold=true; }, holdEnd(){ S.tHold=false; },
    async begin(){
      $('bars').style.display='none'; setObj(CH,'');
      listen(canvas,'pointerdown', ()=>{ if(S.wantWalk) S.walk=true; });
      // для проверки: ?part=drill|march|train в адресе начинает сразу с нужной части
      const from = (location.search.match(/[?&]part=(\w+)/)||[])[1] || 'farewell';
      const order = ['farewell','drill','march','train'], parts={farewell:partFarewell, drill:partDrill, march:partMarch, train:partTrain};
      for(const k of order.slice(Math.max(0,order.indexOf(from)))) await parts[k]();
      cleanupDom(); closeDlg(); cine(false);
      await fadeTo(1,1200);
      endChapter1();
    }
  };
}
