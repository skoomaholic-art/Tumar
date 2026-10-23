// «Синемаграф»: рисованный кадр стоит, но в нём живут отдельные элементы — дым, огонёк лампы, пар, пыль, снег —
// и есть тихий звук. Плюс очень медленный наезд на сам кадр. Координаты — доли ширины/высоты картинки.
const ART_FX = {
  'ch1_1': { fx:[{t:'glow',x:.55,y:.62,r:.06},{t:'smoke',x:.47,y:.53,n:1},{t:'snow',n:60}], snd:'wind' },
  'ch1_2': { fx:[{t:'flame',x:.07,y:.12,r:.16}] },
  'ch1_3': { fx:[{t:'flame',x:.08,y:.12,r:.16}] },
  'ch2_1': { fx:[{t:'smoke',x:.63,y:.2,n:2,dark:1,wind:-1}], snd:'train' },
  'ch2_2': { fx:[{t:'snow',n:40},{t:'dust',n:16}], snd:'distant' },
  'ch2_3': { fx:[{t:'flame',x:.1,y:.45,r:.14}] },
  'ch2_4': { fx:[{t:'dust',n:20}] },
  'ch2k_1':{ fx:[{t:'smoke',x:.58,y:.12,n:1},{t:'dust',n:14}] },
  'ch2k_2':{ fx:[{t:'steam',x:.28,y:.44},{t:'steam',x:.78,y:.8}] },
  'ch2k_3':{ fx:[{t:'steam',x:.2,y:.38},{t:'steam',x:.48,y:.42},{t:'steam',x:.8,y:.42}] },
  'ch3_1': { fx:[{t:'smoke',x:.3,y:.12,n:2,dark:1,wind:1},{t:'embers',x:.35,y:.2,n:22},{t:'shimmer',y:.45}], snd:'fire' },
  'ch3_2': { fx:[{t:'flame',x:.4,y:.67,r:.14}] },
  'ch3_3': { fx:[{t:'flame',x:.05,y:.6,r:.16}] },
  'ch3h_1':{ fx:[{t:'leaves',n:14},{t:'dust',n:10}], snd:'wind' },
  'ch3h_2':{ fx:[{t:'steam',x:.38,y:.17},{t:'dust',n:12}] },
  'ch3h_3a':{ fx:[{t:'flame',x:.08,y:.56,r:.2}] },
  'ch3h_3b':{ fx:[{t:'dust',n:14}], snd:'wind' },
  'ch4_1': { fx:[{t:'snow',n:50}], snd:'wind' },
  'ch4_2': { fx:[{t:'smoke',x:.72,y:.42,n:2,dark:1,wind:-1}], snd:'train' },
  'ch4_3': { fx:[{t:'dust',n:22}] },
  'ch5p_1':{ fx:[{t:'dust',n:20}] },
  'ch5p_2':{ fx:[{t:'dust',n:14}] },
  'ch5p_3':{ fx:[{t:'dust',n:18}] },
  'ch5p_4a':{ fx:[{t:'dust',n:14}] },
  'ch5p_4b':{ fx:[{t:'dust',n:14}] },
  'ch5p_5':{ fx:[{t:'dust',n:24},{t:'shimmer',y:.42}], snd:'wind' },
  'end_a1':{ fx:[{t:'dust',n:30},{t:'shimmer',y:.42}], snd:'wind' },
  'end_a2':{ fx:[{t:'dust',n:16}], snd:'wind' },
  'end_a3':{ fx:[{t:'smoke',x:.17,y:.17,n:1,wind:-1},{t:'dust',n:12}], snd:'wind' },
  'end_a4a':{ fx:[{t:'flame',x:.11,y:.42,r:.14}] },
  'end_a4b':{ fx:[{t:'glow',x:.07,y:.37,r:.06},{t:'dust',n:10}], snd:'wind' },
  'end_b1':{ fx:[{t:'dust',n:22},{t:'shimmer',y:.6}] },
  'end_b2':{ fx:[{t:'smoke',x:.86,y:.18,n:2,dark:1,wind:1},{t:'snow',n:60}], snd:'wind' },
  'end_b3':{ fx:[{t:'flame',x:.08,y:.55,r:.12},{t:'snow',n:14}] },
  'end_b4a':{ fx:[{t:'dust',n:14}], snd:'wind' },
  'end_b4b':{ fx:[{t:'dust',n:18}], snd:'wind' },
  'end_c1':{ fx:[{t:'smoke',x:.66,y:.2,n:1,wind:1},{t:'dust',n:10}] },
  'end_c2a':{ fx:[{t:'snow',n:80},{t:'glow',x:.89,y:.71,r:.05}], snd:'wind' },
  'end_c2b':{ fx:[{t:'snow',n:80}], snd:'wind' },
  'end_c3':{ fx:[{t:'smoke',x:.13,y:.47,n:1},{t:'glow',x:.73,y:.05,r:.04}] },
  'end_c4':{ fx:[{t:'steam',x:.68,y:.67},{t:'dust',n:10}] },
};
const ArtFx = (()=>{
  let raf=0, items=[], sndT=null, last=0, startedAt=0;
  const key = src => (src.split('/').pop()||'').replace(/\.\w+$/,'');
  const R = (a,b)=>a+Math.random()*(b-a);
  function spawn(e){
    const P=[];
    if(e.t==='snow') for(let i=0;i<(e.n||40);i++) P.push({x:Math.random(),y:Math.random(),s:R(.9,2.4),v:R(.025,.07),ph:R(0,6)});
    if(e.t==='dust') for(let i=0;i<(e.n||16);i++) P.push({x:Math.random(),y:Math.random(),s:R(.6,1.5),vx:R(-.006,.01),vy:R(-.008,.004),ph:R(0,6)});
    if(e.t==='leaves') for(let i=0;i<(e.n||12);i++) P.push({x:Math.random(),y:R(0,.7),s:R(2,4),vx:R(.08,.18),vy:R(-.02,.03),rot:R(0,6),vr:R(-4,4)});
    if(e.t==='embers') for(let i=0;i<(e.n||16);i++) P.push({x:e.x+R(-.15,.15),y:e.y+R(-.05,.2),s:R(.6,1.4),vy:R(-.05,-.015),vx:R(-.01,.02),life:R(0,1)});
    return P;
  }
  function attach(img){
    if(img.dataset.fx) return; img.dataset.fx='1';
    const k=key(img.getAttribute('src')||''), D=ART_FX[k]; const pn=img.closest('.pn');
    if(!pn) return;
    // рамка (обрезает) → слой с медленным наездом (у каждого кадра своя точка) → картинка и холст эффектов
    const box=document.createElement('div'); box.className='artbox'; const kb=document.createElement('div'); kb.className='kb';
    kb.style.transformOrigin=`${R(30,70)|0}% ${R(30,60)|0}%`;
    img.parentNode.insertBefore(box,img); box.appendChild(kb); kb.appendChild(img);
    if(!D) return;
    const cv=document.createElement('canvas'); cv.className='artfx'; kb.appendChild(cv);
    items.push({img, cv, pn, fx:D.fx.map(e=>({...e, P:spawn(e), puffs:[], acc:0})), snd:D.snd, t:R(0,10)});
  }
  function puff(e, dark){ return {x:e.x+R(-.01,.01), y:e.y, r:R(.022,.034), vx:(e.wind||0)*R(.012,.035)+R(-.006,.006), vy:R(-.05,-.03), a:dark?.42:.26, life:0, max:R(4,7)}; }
  function draw(it, dt){
    const {cv,img}=it; const bw=img.clientWidth, bh=img.clientHeight; if(!bw||!bh||!img.naturalWidth) return;
    const dpr=Math.min(devicePixelRatio||1,1.5); if(cv.width!==Math.round(bw*dpr) || cv.height!==Math.round(bh*dpr)){ cv.width=Math.round(bw*dpr); cv.height=Math.round(bh*dpr); }
    const g=cv.getContext('2d'); g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,cv.width,cv.height); it.t+=dt;
    // если картинка обрезана (телефон боком, object-fit:cover), координаты эффектов следуют за видимой частью
    const nw=img.naturalWidth, nh=img.naturalHeight, cover=getComputedStyle(img).objectFit==='cover';
    const sc = cover ? Math.max(bw/nw, bh/nh) : bw/nw; const w=nw*sc, h=nh*sc, ox=(bw-w)*.5, oy=(bh-h)*(cover?.35:0);
    g.setTransform(dpr,0,0,dpr,dpr*ox,dpr*oy);
    for(const e of it.fx){
      if(e.t==='flame' || e.t==='glow'){ // огонёк: свет дышит неровно
        const fl = .78 + .14*Math.sin(it.t*9.3+e.x*40) + .08*Math.sin(it.t*23.7) + (Math.random()<.04?-.2:0);
        const r=(e.r||.12)*Math.max(w,h); const gr=g.createRadialGradient(e.x*w,e.y*h,0,e.x*w,e.y*h,r);
        gr.addColorStop(0,`rgba(255,196,110,${.42*fl})`); gr.addColorStop(.35,`rgba(255,160,70,${.16*fl})`); gr.addColorStop(1,'rgba(255,140,60,0)');
        g.globalCompositeOperation='lighter'; g.fillStyle=gr; g.fillRect(0,0,w,h); g.globalCompositeOperation='source-over';
        // по комнате чуть «плывёт» тень — свет то ярче, то тусклее
        if(e.t==='flame'){ g.fillStyle=`rgba(10,6,2,${.10*(1-fl)})`; g.fillRect(0,0,w,h); }
      }
      if(e.t==='smoke' || e.t==='steam'){
        e.acc+=dt; const every = e.t==='steam' ? .5 : .55/(e.n||1);
        while(e.acc>every){ e.acc-=every; e.puffs.push(e.t==='steam' ? {x:e.x+R(-.015,.015), y:e.y, r:R(.01,.016), vx:R(-.006,.006), vy:R(-.035,-.02), a:.22, life:0, max:R(2.2,3.4)} : puff(e, e.dark)); }
        for(let i=e.puffs.length-1;i>=0;i--){ const p=e.puffs[i]; p.life+=dt; if(p.life>p.max){ e.puffs.splice(i,1); continue; }
          p.x+=p.vx*dt + Math.sin(p.life*1.3+i)*.0015; p.y+=p.vy*dt; p.r+=dt*(e.t==='steam'?.012:.02);
          const k=p.life/p.max, a=p.a*Math.sin(Math.PI*Math.min(1,k*1.15)); const R0=p.r*Math.max(w,h);
          const gr=g.createRadialGradient(p.x*w,p.y*h,0,p.x*w,p.y*h,R0);
          const c = e.t==='steam' ? '236,228,210' : (e.dark ? '52,46,40' : '170,160,145');
          gr.addColorStop(0,`rgba(${c},${a})`); gr.addColorStop(1,`rgba(${c},0)`); g.fillStyle=gr; g.beginPath(); g.arc(p.x*w,p.y*h,R0,0,7); g.fill(); }
      }
      if(e.t==='snow'){ g.fillStyle='rgba(240,236,226,.8)';
        for(const p of e.P){ p.y+=p.v*dt; p.x+=Math.sin(it.t*.8+p.ph)*.004*dt*10*.1; if(p.y>1.02){ p.y=-.02; p.x=Math.random(); } g.globalAlpha=.75; g.beginPath(); g.arc(p.x*w,p.y*h,p.s,0,7); g.fill(); } g.globalAlpha=1; }
      if(e.t==='dust'){ for(const p of e.P){ p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.x<0)p.x+=1; if(p.x>1)p.x-=1; if(p.y<0)p.y+=1; if(p.y>1)p.y-=1;
          const a=.35+.3*Math.sin(it.t*1.7+p.ph); g.fillStyle=`rgba(255,238,200,${a})`; g.beginPath(); g.arc(p.x*w,p.y*h,p.s,0,7); g.fill(); } }
      if(e.t==='leaves'){ g.fillStyle='rgba(70,48,28,.8)';
        for(const p of e.P){ p.x+=p.vx*dt; p.y+=p.vy*dt+Math.sin(it.t*3+p.rot)*.002; p.rot+=p.vr*dt; if(p.x>1.05){ p.x=-.05; p.y=R(0,.7); }
          g.save(); g.translate(p.x*w,p.y*h); g.rotate(p.rot); g.beginPath(); g.ellipse(0,0,p.s,p.s*.45,0,0,7); g.fill(); g.restore(); } }
      if(e.t==='embers'){ for(const p of e.P){ p.life+=dt*.35; p.y+=p.vy*dt; p.x+=p.vx*dt+Math.sin(it.t*2+p.s*9)*.0008; if(p.life>1){ p.life=0; p.x=e.x+R(-.15,.15); p.y=e.y+R(0,.2); }
          const a=Math.sin(Math.PI*p.life)*(.6+.4*Math.random()); g.fillStyle=`rgba(255,${120+Math.random()*60|0},40,${a})`; g.beginPath(); g.arc(p.x*w,p.y*h,p.s,0,7); g.fill(); } }
      if(e.t==='shimmer'){ // марево/блики: тонкие светлые полосы, медленно ползут
        for(let i=0;i<5;i++){ const yy=(e.y+i*.06+Math.sin(it.t*.6+i)*.01)*h; const a=.05+.04*Math.sin(it.t*2.1+i*1.7);
          g.fillStyle=`rgba(255,235,200,${a})`; g.fillRect(0,yy,w,1.2); } }
    }
  }
  // тихий фон-звук кадра: поезд, ветер, огонь, далёкая канонада
  function sound(kind){
    if(typeof AC==='undefined' || !AC) return;
    if(kind==='train'){ noiseBurst({dur:.18,freq:180,q:.9,gain:.05,type:'lowpass'}); noiseBurst({dur:.12,freq:240,q:1,gain:.035,type:'lowpass',delay:.28}); }
    if(kind==='wind'){ noiseBurst({dur:1.6,freq:R(380,700),q:.5,gain:.03,type:'bandpass'}); }
    if(kind==='fire'){ for(let i=0;i<3;i++) noiseBurst({dur:.04,freq:R(1800,3200),q:2,gain:.025,delay:R(0,.6)}); noiseBurst({dur:1.2,freq:160,q:.6,gain:.02,type:'lowpass'}); }
    if(kind==='distant'){ if(Math.random()<.35) noiseBurst({dur:1.4,freq:70,q:.5,gain:.12,type:'lowpass'}); }
  }
  function loop(now){
    const panels=document.getElementById('panels'); const vis = panels && panels.style.display==='flex';
    if(!vis && now-startedAt>1500){ items=[]; raf=0; clearInterval(sndT); sndT=null; return; }
    const dt=Math.min(.05,(now-(last||now))/1000); last=now;
    if(!(typeof PAUSED!=='undefined' && PAUSED)) for(const it of items) if(it.pn.classList.contains('on')) draw(it, dt);
    raf=requestAnimationFrame(loop);
  }
  function start(page){
    page.querySelectorAll('img.art').forEach(attach);
    startedAt=performance.now(); if(!raf){ last=0; raf=requestAnimationFrame(loop); }
    if(!sndT) sndT=setInterval(()=>{ // звук того кадра, что открыт последним
      const on=items.filter(it=>it.pn.classList.contains('on') && it.snd); if(on.length) sound(on[on.length-1].snd); }, 650);
  }
  return { start };
})();
