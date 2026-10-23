'use strict';
// Глава 8. Фильтрация. Май — август 1945.
// Мост через Энс (идти в колонне, кино у шлагбаума) → проволока снова (живая картинка) →
// три допроса у Ракитина (кино + протокол с подписью; каждое враньё против записанного — пометка) →
// Жумабай (панели) → вопрос о друге. Пометки и ответы решают концовку.
function sceneFiltration(){
  resetCamera();
  const DAT = DATA.ch8, CH = 'Глава 8 · Фильтрация';
  scene = new THREE.Scene();
  const SKY = 0xc6c2b2; scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 30, 150);
  const hemi = new THREE.HemisphereLight(0xe6e0cc, 0x46423a, .7); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2d8, .8); sun.position.set(-12,26,14); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:100});
  scene.add(sun, sun.target);
  const tmp=new THREE.Vector3(), tmp2=new THREE.Vector3();
  const pick=a=>a[Math.random()*a.length|0];
  const S = { busy:true, clock:0, phase:'intro' };
  const DIR = { shot:null, t:0, fresh:false };
  const until = (f, max=180000) => new Promise(r=>{ const t0=performance.now(); const h=setInterval(()=>{ if(f()||performance.now()-t0>max){ clearInterval(h); r(); } },50); });
  const gwait = sec => { const t0=S.clock; return until(()=>S.clock-t0>=sec); };
  function setShot(n){ DIR.shot=n; DIR.t=0; DIR.fresh=true; }
  const hooks={}, run=makeRunner(hooks);
  const box=(w,h,d,c,x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c)); m.position.set(x,y,z); scene.add(shadowAll(m)); return m; };
  memory.flags.marks = memory.flags.marks || 0;
  memory.flags.ruFluent = true; // речь понимает; читать по-русски так и не научился

  // ---------- мост через Энс (вдоль оси x, река по z) ----------
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),M(0x8a8858)); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  const river=new THREE.Mesh(new THREE.PlaneGeometry(26,400),M(0x5e6e74)); river.rotation.x=-Math.PI/2; river.position.set(0,.03,0); scene.add(river);
  const deck=box(40,.4,4,0x6a6256,0,1.6,0);
  for(const z of [-2.1,2.1]){ box(40,.5,.15,0x4a443c,0,2.1,z); for(let i=0;i<9;i++) box(.18,1.6,.18,0x4a443c,-16+i*4,.8,z); }
  const bar1=box(.15,1.2,.15,0x3a3630,0,2.4,-1.9), barArm=box(.12,.12,3.6,0xc8382e,0,2.9,0);
  for(let i=0;i<5;i++) box(.13,.13,.6,0xf0ece0,0,2.9,-1.5+i*.75);
  const truck=new THREE.Group(); { const c=new THREE.Mesh(new THREE.BoxGeometry(2.4,2,2.4),M(0x4e5638)); c.position.set(1.2,1.4,0); const bed=new THREE.Mesh(new THREE.BoxGeometry(4,1.2,2.4),M(0x5a6240)); bed.position.set(-2,1,0); truck.add(c,bed);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.7),new THREE.MeshLambertMaterial({color:0xb02a22,side:THREE.DoubleSide})); flag.position.set(1.2,3.2,.6); truck.add(flag); truck.userData.flag=flag;
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.4,4),M(0x2a2018)); pole.position.set(.7,2.9,.6); truck.add(pole); }
  truck.position.set(26,0,4); scene.add(shadowAll(truck));
  const asan=makePerson({coat:0x5c5a3a, hat:'none'}); asan.position.set(-18,1.8,.4); asan.rotation.y=Math.PI/2; scene.add(shadowAll(asan));
  const column=[]; for(let i=0;i<14;i++){ const p=makePerson({coat:[0x5c5a3a,0x4e4c34,0x6a6244,0x55503a][i%4], hat:i%3?'none':'pilotka'}); p.position.set(-22+ (i/2|0)*-1.6, 1.8, i%2?-.8:.9); p.rotation.y=Math.PI/2; scene.add(shadowAll(p)); column.push(p); }
  const usGuard=makePerson({coat:0x6a6a48, hat:'helmet'}); usGuard.position.set(-1.2,1.8,-1.5); usGuard.rotation.y=Math.PI/2; scene.add(usGuard);
  const lieut=makePerson({coat:0x7a7148, hat:'pilotka'}); lieut.position.set(1.4,1.8,-1.4); lieut.rotation.y=-Math.PI/2; scene.add(shadowAll(lieut));
  const sov=makePerson({coat:0x7a7148, hat:'pilotka'}); sov.position.set(1.6,1.8,1.5); sov.rotation.y=-Math.PI/2; scene.add(sov);

  // ---------- лагерь проверки: справа от моста ----------
  const CX=80;
  const yard=new THREE.Mesh(new THREE.PlaneGeometry(40,26),M(0x6e6a58)); yard.rotation.x=-Math.PI/2; yard.position.set(CX,.02,0); scene.add(yard);
  for(const z of [-12,12]){ for(let i=0;i<11;i++) box(.12,2.6,.12,0x3a3028,CX-20+i*4,1.3,z); for(const y of [.6,1.2,1.8,2.4]) box(40,.03,.03,0x2a2622,CX,y,z); }
  for(const x of [-18,18]){ const t=new THREE.Group(); for(const [a,b] of [[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.14,5.4,.14),M(0x3a2e24)); l.position.set(a,2.7,b); t.add(l); } const pl=new THREE.Mesh(new THREE.BoxGeometry(2.2,.9,2.2),M(0x3a2e24)); pl.position.y=5.8; t.add(pl); t.position.set(CX+x,0,-13); scene.add(shadowAll(t)); }
  for(const [x,z] of [[-8,-5],[8,-5],[-8,6],[8,6]]) box(10,2.6,4.2,0x5e564a,CX+x,1.3,z);
  const redFlag=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1),new THREE.MeshLambertMaterial({color:0xb02a22,side:THREE.DoubleSide})); redFlag.position.set(CX,6,-12.5); scene.add(redFlag); box(.08,6,.08,0x2a2018,CX-.85,3,-12.5);
  const camp=[]; for(let i=0;i<20;i++){ const p=makePerson({coat:[0x5c5a3a,0x4e4c34,0x6a6244,0x55503a,0x4a4e52][i%5], hat:i%4?'none':'pilotka'}); p.position.set(CX+rand(-14,14),0,rand(-2,3)); p.rotation.y=rand(0,6); scene.add(p); camp.push(p); if(i%3===0){ p.position.y=-.45; p.userData.legL.rotation.x=p.userData.legR.rotation.x=-1.45; } }
  const sparkL=new THREE.PointLight(0xbfe0ff,0,6,2); sparkL.position.set(CX-20,2.4,12); scene.add(sparkL);
  const sentry=makePerson({coat:0x7a7148, hat:'pilotka'}); sentry.position.set(CX+4,0,9.5); scene.add(sentry);

  // ---------- комната допросов: слева ----------
  const RX=-80;
  box(7,.1,6,0x5a4a3a,RX,.05,0); box(7,3,.15,0xb8b0a0,RX,1.5,-3); box(.15,3,6,0xb8b0a0,RX-3.5,1.5,0);
  const desk=box(2,.08,1.1,0x4a3628,RX,.82,0); for(const [x,z] of [[-.9,-.45],[.9,-.45],[-.9,.45],[.9,.45]]) box(.07,.8,.07,0x3a2a1e,RX+x,.4,z);
  const lamp=new THREE.PointLight(0xffe2b0,0,7,1.5); lamp.position.set(RX+.4,1.5,-.2); scene.add(lamp);
  const lampHead=box(.26,.14,.26,0x2a2a26,RX+.4,1.25,-.25);
  const rak=makePerson({coat:0x6a6448, hat:'none'}); rak.position.set(RX,-.4,-.95); rak.userData.legL.rotation.x=rak.userData.legR.rotation.x=-1.45; scene.add(shadowAll(rak));
  const capR=new THREE.Mesh(new THREE.CylinderGeometry(.22,.2,.12,10),M(0x3c4a34)); capR.position.set(0,2.02,0); const band=new THREE.Mesh(new THREE.CylinderGeometry(.205,.205,.05,10),M(0x2a4a7a)); band.position.y=1.96; rak.add(capR,band);
  const asanR=makePerson({coat:0x5c5a3a, hat:'none'}); asanR.position.set(RX,-.4,.95); asanR.rotation.y=Math.PI; asanR.userData.legL.rotation.x=asanR.userData.legR.rotation.x=-1.45; scene.add(shadowAll(asanR));
  const folders=[]; for(let i=0;i<2;i++) folders.push(box(.36,.04,.5,0x8a7a5e,RX-.4+i*.45,.88,-.15));
  const sheets=[]; for(let i=0;i<5;i++){ const sh=box(.3,.005,.42,0xc8bea8,RX-.6+i*.3,.87,.2); sh.visible=false; sheets.push(sh); }
  const card=box(.24,.005,.16,0xd8c8a0,RX+.1,.875,.35); card.visible=false;

  // ---------- камера ----------
  const SHOTS = {
    follow(){ camera.fov=40; const a=asan.position; camera.position.set(a.x-4,a.y+9,a.z+9); return tmp.set(a.x+3,a.y,a.z); },
    bridgeWide(k){ camera.fov=34; camera.position.set(-8+Math.min(k,12)*.3,6,22); return tmp.set(2,2,0); },
    officer(){ camera.fov=28; camera.position.set(asan.position.x-1.6,3.4,asan.position.z+2.6); return tmp.set(lieut.position.x,3.2,lieut.position.z); },
    wireWide(k){ camera.fov=36; const e=Math.min(1,k/12); camera.position.set(CX-6,lerp(22,14,e),lerp(26,20,e)); return tmp.set(CX,0,-2); },
    barrack(){ camera.fov=30; camera.position.set(CX+2,2,16); return tmp.set(CX,1.2,6); },
    room(k){ camera.fov=40; camera.position.set(RX+2.6,2.1,2.4); return tmp.set(RX,1,0); },
    rak(){ camera.fov=28; camera.position.set(RX+.5,1.55,1.75); return tmp.set(RX,1.35,-.8); },
    asan(){ camera.fov=28; camera.position.set(RX-.5,1.6,-1.6); return tmp.set(RX,1.25,.85); },
    desk(){ camera.fov=34; camera.position.set(RX+.9,2.6,1.9); return tmp.set(RX,.85,0); }
  };

  // ---------- крючки ----------
  const walkTo=(o,tgt,v,dt)=>{ const dx=tgt.x-o.position.x, dz=tgt.z-o.position.z, d=Math.hypot(dx,dz); if(d<.06){ animWalk(o,0,dt); return true; } const s=Math.min(d,v*dt); o.position.x+=dx/d*s; o.position.z+=dz/d*s; o.rotation.y=Math.atan2(dx,dz); animWalk(o,1,dt); return false; };
  Object.assign(hooks, {
    async bridgeWide(){ setShot('bridgeWide'); await gwait(3.2); },
    async bridgeOfficer(){ setShot('officer'); lieut.lookAt(asan.position.x,lieut.position.y,asan.position.z); await gwait(1); },
    async wireWide(){ setShot('wireWide'); await gwait(4); },
    async spark(){ setShot('wireWide'); for(let i=0;i<4;i++){ sparkL.intensity=3; noiseBurst({dur:.08,freq:4000,q:2,gain:.12,type:'highpass'}); await gwait(.12); sparkL.intensity=0; await gwait(.5); } },
    async barrackQuiet(){ setShot('barrack'); await gwait(3); },
    async roomWide(){ lamp.intensity=.9; setShot('room'); await gwait(2); setShot('rak'); },
    async showScar(){ setShot('asan'); asanR.userData.legR.rotation.x=-1.0; await gwait(2.2); asanR.userData.legR.rotation.x=-1.45; setShot('rak'); },
    async papers(){ setShot('desk'); for(const s of sheets){ s.visible=true; sfx.paper&&sfx.paper(); await gwait(.35); } await gwait(.8); setShot('rak'); },
    async legionCard(){ card.visible=true; setShot('desk'); tone({f:120,dur:.3,type:'sine',gain:.05}); await gwait(2.6); setShot('rak'); },
    async zhumPanels(){ closeDlg(); await fadeTo(1,700); await showComic(DAT.panels.zhumabai); setShot('barrack'); await fadeTo(0,700); },
    // пометка: всё, что противоречит записанному раньше
    async mark(n=1){ memory.flags.marks=(memory.flags.marks||0)+n; noiseBurst({dur:.5,freq:2600,q:.5,gain:.06,type:'highpass'}); setShot('desk'); await gwait(.9); think(DAT.texts.mark); await gwait(1.6); setShot('rak'); },
    async witness(d){ if(d>0) memory.flags.marks=Math.max(0,(memory.flags.marks||0)-1); else memory.flags.marks=(memory.flags.marks||0)+1;
      memory.flags.witnessFor=(memory.flags.witnessFor||0)+(d>0?1:0); setShot('desk'); await gwait(.8); think(d>0?DAT.texts.witnessFor:DAT.texts.witnessAgainst); await gwait(1.8); setShot('rak'); },
    // протокол: восемь листов — всё, что записано за войну, и подпись
    // протокол на восемь листов: по-русски, Асан не может прочесть ни строчки — только расписывается на каждом
    async protocol(){
      closeDlg(); setShot('desk');
      const T=memory.testimony.map(t=>t.value), per=Math.max(1,Math.ceil(T.length/7));
      for(let pg=1; pg<=7; pg++){
        const rows=T.slice((pg-1)*per, pg*per); while(rows.length<3) rows.push('Вопрос: ……………… Ответ: ………………………');
        const lines=rows.map(v=>`<div style="margin:3px 0">${escapeHtml(scramble(v))}</div>`).join('');
        const sig=memory.signature ? `<img src="${memory.signature}" alt="" style="height:30px;opacity:.85">` : '<span style="font-family:Caveat,cursive;font-size:22px">Nurbekov</span>';
        await new Promise(res=>{
          $('paper').innerHTML=`<div style="font-size:13px;opacity:.7">${escapeHtml(scramble('Протокол допроса'))} · ${pg} / 8</div><div style="font-family:'Courier New',monospace;font-size:13px;line-height:1.5;color:#3a3430">${lines}</div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:8px"><span style="font-size:12px;opacity:.6">${escapeHtml(scramble('Подпись'))}:</span><span id="pSig" style="min-width:120px;border-bottom:1px solid #3a3026;height:32px"></span></div>
            <div class="hint">${pg===1?escapeHtml(memory.flags.ibrayLetters?DAT.texts.protocolReadLetters:DAT.texts.protocolRead)+' ':''}Нажми, чтобы расписаться.</div>`;
          $('doc').style.display='flex'; sfx.paper&&sfx.paper();
          const go=()=>{ $('doc').onclick=null; removeEventListener('keydown',kd); $('pSig').innerHTML=sig; noiseBurst({dur:.25,freq:3400,q:.7,gain:.05,type:'bandpass'}); setTimeout(res,450); };
          const kd=e=>{ if(e.code==='Space'||e.code==='Enter'){ e.preventDefault(); go(); } };
          $('doc').onclick=go; addEventListener('keydown',kd);
        });
      }
      await signaturePad(escapeHtml(scramble('С моих слов записано верно, мною прочитано'))+' · 8 / 8', DAT.texts.protocolHint, memory.signature);
      $('doc').style.display='none'; await gwait(.6); setShot('rak');
    }
  });

  // ---------- 1. Мост: идти в колонне ----------
  async function bridgePart(){
    setShot('follow'); await fadeTo(0,1400);
    S.phase='walk'; S.busy=false; cine(false); setObj(CH, isTouch?DAT.objectives.bridgeTouch:DAT.objectives.bridge);
    setHelp(isTouch?'Джойстик — идти':'WASD — идти');
    await until(()=>asan.position.x>-2.6, 1e9);
    S.busy=true; S.phase='intro'; setObj(CH,''); cine(true);
    await run(DAT.scripts.bridge); closeDlg();
    barArm.rotation.x=0; S.colGo=true; await gwait(2.5);
  }
  async function wirePart(){
    await fadeTo(1,1000); scene.background.setHex(0xb8b4a6); scene.fog.color.setHex(0xb8b4a6); await fadeTo(0,1100);
    await run(DAT.scripts.wire); closeDlg();
  }
  async function interrogations(){
    for(const k of ['interrogation1','interrogation2','interrogation3']){
      await fadeTo(1,900); lamp.intensity=.9; setShot('room'); await fadeTo(0,900);
      await run(DAT.scripts[k]); closeDlg();
    }
  }
  async function zhumPart(){
    await fadeTo(1,900); setShot('barrack'); await fadeTo(0,700);
    await run(DAT.scripts.zhumabai); closeDlg();
    await fadeTo(1,900); setShot('rak'); await fadeTo(0,900);
    await run(DAT.scripts.friend); closeDlg();
  }

  const sc = {
    S,
    update(dt,t){
      S.clock+=dt;
      truck.userData.flag.rotation.y=Math.sin(t*2)*.3; redFlag.rotation.y=Math.sin(t*1.7)*.25;
      // колонна идёт по мосту вместе с Асаном
      if(S.phase==='walk' && !S.busy && !dlgOpen){
        const [mx]=moveInput(); const v=memory.flags.limpBad?1.0:1.35;
        if(mx>0){ asan.position.x+=mx*v*dt; animWalk(asan,1,dt); asan.rotation.z=Math.sin(S.clock*6)*.07; } else { animWalk(asan,0,dt); asan.rotation.z=0; }
        column.forEach((p,i)=>{ const tx=asan.position.x-1.2-(i/2|0)*1.6; if(p.position.x<tx){ p.position.x=Math.min(tx,p.position.x+v*dt); animWalk(p,1,dt); } else animWalk(p,0,dt); });
        S.barkT=(S.barkT??3)-dt; if(S.barkT<=0){ S.barkT=rand(6,10); bark(pick(['Конвойный','Сержант']), pick(DAT.ruBarks), 'ru'); }
      }
      if(S.colGo){ column.forEach(p=>{ p.position.x+=dt*1.2; animWalk(p,1,dt); }); asan.position.x+=dt*1.2; animWalk(asan,1,dt); }
      camp.forEach((p,i)=>{ if(p.position.y===0 && i%4===1){ p.rotation.y+=Math.sin(t*.3+i)*dt*.2; } });
      if(DIR.shot){ const look=SHOTS[DIR.shot](DIR.t,dt); camera.updateProjectionMatrix();
        if(DIR.fresh||!S.dirLook){ S.dirLook=look.clone(); DIR.fresh=false; } else S.dirLook.lerp(look,1-Math.pow(.12,dt));
        camera.lookAt(S.dirLook); DIR.t+=dt; }
      sun.target.position.copy(camera.position).setY(0); sun.position.set(camera.position.x-12,26,camera.position.z+14);
    },
    onKey(){}, act(){},
    wantsJoy(){ return S.phase==='walk' && !S.busy; },
    touchAction(){ return null; },
    holdStart(){}, holdEnd(){},
    async begin(){
      $('bars').style.display='none'; $('hold').style.display='none'; $('eyelid').style.opacity=0; $('compass').style.display='none';
      setHeart(0); setRing(false); setObj(CH,'');
      await showCard(DAT.card.small, DAT.card.big, DAT.card.text, 'Дальше');
      cine(true);
      await bridgePart();
      await wirePart();
      await interrogations();
      await zhumPart();
      cine(false); setHelp('');
      endChapter8();
    }
  };
  return sc;
}
