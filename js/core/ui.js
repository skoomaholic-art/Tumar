'use strict';
// Интерфейс: задачи, тосты, язык, портреты, диалоги и выборы
// ---------- интерфейс: подсказки, тосты, задачи ----------
function cine(on){ document.body.classList.toggle('cine', on); if(!on && objPending) setTimeout(popObj, 450); }
// Задача всплывает слева сверху: выезжает с меткой «Новая задача» и короткой подсветкой.
// Если сейчас идёт сцена (полосы кино), всплывёт, когда сцена кончится.
let objText='', objPending=false;
function setObj(chap, text){
  $('chap').textContent = chap;
  if(text===objText) return; objText=text;
  const o=$('obj'); o.innerHTML = text ? `<span class="objNew">Новая задача</span><span class="objText">${escapeHtml(text)}</span>` : '';
  o.style.display = text ? '' : 'none';
  if(!text) return;
  if(document.body.classList.contains('cine')){ objPending=true; return; }
  popObj();
}
function popObj(){ const o=$('obj'); objPending=false; o.classList.remove('pop'); void o.offsetWidth; o.classList.add('pop'); if(typeof tone==='function' && AC) tone({f:660,dur:.18,gain:.035}); }
let toastT=null;
function toast(text){ const t=$('toast'); t.textContent=text; t.classList.add('on'); sfx.memory(); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),3400); }
// Шторка, как у Куросавы: прошлый кадр уходит за жёсткую вертикальную линию и открывает новый.
// Вызов снимает текущий кадр сразу; новый план ставится сразу после вызова, до следующей отрисовки.
function wipe(ms=1100, dir='right'){
  if(scene) renderer.render(scene,camera);
  const w=$('wipe'); w.style.backgroundImage=`url(${canvas.toDataURL('image/jpeg',.88)})`;
  w.style.transition='none'; w.style.clipPath='inset(0 0 0 0)'; w.style.display='block';
  return new Promise(res=>{ requestAnimationFrame(()=>requestAnimationFrame(()=>{
    w.style.transition=`clip-path ${ms}ms linear`; w.style.clipPath = dir==='right' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
    setTimeout(()=>{ w.style.display='none'; res(); }, ms+40); })); });
}
// Мысли Асана: не в диалоге, а в кадре — почерком из блокнота, слово за словом; края темнеют, звук тише.
// Гаснут сами; касание или пробел — дальше.
let thinkSkip=null;
function think(text){
  return new Promise(res=>{
    const el=$('think'); el.innerHTML = text.split(/\s+/).map((w,i)=>`<span style="animation-delay:${(i*.11).toFixed(2)}s">${escapeHtml(w)}</span>`).join(' ');
    el.classList.add('on'); document.body.classList.add('thinking');
    if(master && AC) master.gain.setTargetAtTime(.45, AC.currentTime, .3);
    const hold = 1800 + text.length*55; let done=false;
    const finish=()=>{ if(done) return; done=true; thinkSkip=null; clearTimeout(tm); el.classList.remove('on'); document.body.classList.remove('thinking');
      if(master && AC) master.gain.setTargetAtTime(.8, AC.currentTime, .4); setTimeout(res, 450); };
    const tm=setTimeout(finish, hold); setTimeout(()=>{ thinkSkip=finish; }, 350);
  });
}
// Титр места и времени — как в кино, внизу слева, без плашки. Не останавливает сцену.
let capT=null;
function caption(text){ const c=$('caption'); c.textContent=text; c.classList.remove('on'); void c.offsetWidth; c.classList.add('on'); clearTimeout(capT); capT=setTimeout(()=>c.classList.remove('on'), 3600); }
// Ремарка — задание сцене, что показать. Игроку не видна; с ?dev в адресе — мелко в углу, для проверки.
const DEV = /[?&]dev\b/.test(location.search);
function beat(text){ if(!DEV) return; const b=$('beatDev'); b.textContent='ремарка: '+text; b.style.opacity=1; clearTimeout(beat.t); beat.t=setTimeout(()=>b.style.opacity=0, 3500); }
function fadeTo(v, ms=1200){ const f=$('fade'); f.style.transitionDuration=ms+'ms'; f.style.opacity=v; return wait(ms); }
function setHelp(t){ $('help').textContent=t; }
setHelp(isTouch ? 'Слева — джойстик · касание — идти · кнопка справа — действие' : 'Клик или WASD — идти · E — действие · колесо — масштаб');

// Язык: незнакомые русские слова превращаются в шум, известные — читаются
function scramble(word){ return word.replace(/[а-яёa-zäöüß]/gi, ch => '▒░▓'[Math.random()*3|0]).replace(/[▒░▓]{2,}/g, m => m.slice(0, Math.max(2, m.length))); }
function renderLang(text, lang){
  if(lang!=='ru' && lang!=='de') return escapeHtml(text);
  return text.split(/(\s+|[.,!?—:])/).map(w => {
    const k = w.toLowerCase();
    if(!/[а-яёa-zäöüß]/i.test(w)) return escapeHtml(w);
    return memory.knownWords.has(k) ? `<span class="known">${escapeHtml(w)}</span>` : `<span class="noise">${scramble(w)}</span>`;
  }).join('');
}
function escapeHtml(s){ return s.replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

// Портреты-заглушки: силуэт в шапке. Позже — рисованные портреты.
const PORTRAITS = {
  'Асан':  {bg:'#3b3226', hat:'<rect x="24" y="14" width="28" height="10" rx="3" fill="#2a2018"/>', face:'#9c7352'},
  'Отец':  {bg:'#2f2a22', hat:'<path d="M20 26 L38 6 L56 26 Z" fill="#5a4430"/><rect x="18" y="22" width="40" height="8" fill="#4a3826"/><circle cx="38" cy="6" r="3" fill="#7a2a22"/>', face:'#8f6a4c', beard:true},
  'Күләш': {bg:'#33291f', hat:'<path d="M18 30 Q38 4 58 30 L58 40 L18 40 Z" fill="#b8a888"/>', face:'#a7805e'},
  'Всадник':{bg:'#262620', hat:'<rect x="22" y="14" width="32" height="9" rx="2" fill="#4e4a30"/><circle cx="38" cy="18" r="2.5" fill="#8e1f1a"/>', face:'#9a7a5c'},
  'Жумабай':{bg:'#35301f', hat:'<rect x="22" y="15" width="32" height="8" rx="2" fill="#5e5a38"/>', face:'#a07a56'},
  'Колесников':{bg:'#2b2a22', hat:'<rect x="22" y="14" width="32" height="9" rx="2" fill="#4e4a30"/><circle cx="38" cy="18" r="2.5" fill="#8e1f1a"/>', face:'#b08a6a'},
  'Политрук':{bg:'#262420', hat:'<path d="M18 22 Q38 8 58 22 L58 26 L18 26 Z" fill="#3e3c2c"/><rect x="16" y="24" width="44" height="4" fill="#222"/><circle cx="38" cy="18" r="2.5" fill="#8e1f1a"/>', face:'#b39072'},
  'Голос': {bg:'#1a1612', hat:'', face:'#2a231b'},
};
function portrait(who){
  const p = PORTRAITS[who] || PORTRAITS['Голос'];
  return `<svg viewBox="0 0 76 76" width="76" height="76"><rect width="76" height="76" fill="${p.bg}"/><path d="M8 76 Q38 46 68 76 Z" fill="#1c1712"/><ellipse cx="38" cy="34" rx="14" ry="17" fill="${p.face}"/>${p.beard?'<path d="M28 40 Q38 62 48 40 Z" fill="#d8d2c4"/>':''}${p.hat}</svg>`;
}

// Диалоги: очередь реплик + выбор с таймером (молчание — тоже ответ)
let dlgResolve=null, typing=null, dlgOpen=false;
function say(who, text, lang='kz'){
  return new Promise(res=>{
    dlgOpen=true; $('help').style.visibility='hidden'; $('dlg').style.display='block'; $('choices').innerHTML=''; $('more').style.display='block';
    $('who').textContent = who; $('por').innerHTML = portrait(who);
    const html = renderLang(text, lang); const el=$('txt');
    // печать по символам для обычного текста; шумный текст выводим сразу
    clearInterval(typing);
    if(lang==='ru'||lang==='de'){ el.innerHTML = html; dlgResolve = res; return; }
    let i=0; el.textContent='';
    typing = setInterval(()=>{ i+=2; el.textContent = text.slice(0,i); if(i>=text.length){ clearInterval(typing); typing=null; } }, 22);
    dlgResolve = () => { if(typing){ clearInterval(typing); typing=null; el.textContent=text; return false; } res(); return true; };
  });
}
function advance(){
  if(!dlgOpen || !dlgResolve || $('choices').children.length) return;
  const r = dlgResolve(); if(r===false) return;
  dlgResolve=null;
}
function closeDlg(){ dlgOpen=false; $('dlg').style.display='none'; $('help').style.visibility='visible'; }
function choose(who, text, options, seconds=0, silentIndex=-1){
  return new Promise(res=>{
    dlgOpen=true; $('help').style.visibility='hidden'; $('dlg').style.display='block'; $('more').style.display='none';
    $('who').textContent=who; $('por').innerHTML=portrait(who); $('txt').textContent=text;
    const box=$('choices'); box.innerHTML='';
    let done=false; const finish=i=>{ if(done) return; done=true; box.innerHTML=''; choose.slots=null; res(i); };
    // варианты расходятся влево и вправо, стороны каждый раз случайны: нет «верхнего правильного»
    const main=options.map((o,i)=>i).filter(i=>i!==silentIndex);
    if(Math.random()<.5) main.reverse();
    const slots={};
    const mk=(i,pos,key)=>{ const b=document.createElement('button'); b.className='opt-'+pos; b.innerHTML=`<span class="key">${key}</span>${escapeHtml(options[i])}`; b.onclick=e=>{e.stopPropagation();finish(i);}; box.appendChild(b); slots[pos]=i; };
    if(main[0]!==undefined) mk(main[0],'left', isTouch?'◀':'◀ A');
    if(main[1]!==undefined) mk(main[1],'right', isTouch?'▶':'D ▶');
    if(silentIndex>=0 && options[silentIndex]!==undefined) mk(silentIndex,'bottom', isTouch?'▼':'▼ S');
    choose.slots=slots; choose.shownAt=performance.now();
    if(seconds){
      box.classList.add('timed');
      // песочные часы между вариантами; вокруг них фитиль, который догорает
      const R=30, C=2*Math.PI*R;
      const hg=document.createElement('div'); hg.className='hg';
      hg.innerHTML=`<svg viewBox="-36 -36 72 72" aria-hidden="true">
        <circle r="${R}" fill="none" stroke="#3a3126" stroke-width="2"/>
        <circle id="fuse" r="${R}" fill="none" stroke="#c9a46a" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="0" transform="rotate(-90)"/>
        <circle id="spark" r="3.2" fill="#ffd27a"/>
        <g id="glass">
          <path d="M-11 -17 H11 M-11 17 H11" stroke="#b9ab8e" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M-9 -16 C-9 -6 -2 -3 -2 0 C-2 3 -9 6 -9 16 H9 C9 6 2 3 2 0 C2 -3 9 -6 9 -16 Z" fill="rgba(233,223,201,.08)" stroke="#b9ab8e" stroke-width="1.4"/>
          <clipPath id="hgTop"><rect id="sandTopR" x="-9" y="-15" width="18" height="15"/></clipPath>
          <clipPath id="hgBot"><rect id="sandBotR" x="-9" y="15" width="18" height="0"/></clipPath>
          <path clip-path="url(#hgTop)" d="M-8 -15 C-8 -6 -1.5 -3 -1.5 0 H1.5 C1.5 -3 8 -6 8 -15 Z" fill="#c9a46a"/>
          <path clip-path="url(#hgBot)" d="M-8 15 C-8 6 -1.5 3 -1.5 0 H1.5 C1.5 3 8 6 8 15 Z" fill="#c9a46a"/>
          <line id="stream" x1="0" y1="0" x2="0" y2="14" stroke="#c9a46a" stroke-width="1" stroke-dasharray="1.5 2"/>
        </g></svg>`;
      box.insertBefore(hg, box.querySelector('.opt-right'));
      const fuse=hg.querySelector('#fuse'), spark=hg.querySelector('#spark'), glass=hg.querySelector('#glass'), topR=hg.querySelector('#sandTopR'), botR=hg.querySelector('#sandBotR'), stream=hg.querySelector('#stream');
      const t0=performance.now();
      (function tick(now){ if(done) return; const e=(performance.now()-t0)/(seconds*1000), k=Math.max(0,1-e);
        fuse.setAttribute('stroke-dashoffset', C*e);
        const a=-Math.PI/2 - 2*Math.PI*e; spark.setAttribute('cx', Math.cos(a)*R); spark.setAttribute('cy', Math.sin(a)*R); spark.setAttribute('r', 2.6+Math.random()*1.4);
        topR.setAttribute('y', -15 + 15*e); topR.setAttribute('height', 15*k);
        botR.setAttribute('y', 15 - 15*e); botR.setAttribute('height', 15*e);
        stream.setAttribute('stroke-dashoffset', -performance.now()/40);
        glass.setAttribute('transform', `rotate(${Math.sin(performance.now()/260)*(4+e*10)})`);
        if(k<=0) finish(silentIndex); else requestAnimationFrame(tick); })();
      if(AC) noiseBurst({dur:.5,freq:2200,q:.6,gain:.03,type:'highpass'});
    }
    choose.pick = finish;
  });
}
$('dlg').addEventListener('click', advance);
$('nbBtn').addEventListener('click', e=>{ e.stopPropagation(); openNotebook(); });
$('nb').addEventListener('click', closeNotebook);

function showCard(small, big, text, btn='Дальше'){
  return new Promise(res=>{
    $('cardSmall').textContent=small; $('cardBig').textContent=big; $('cardText').innerHTML=text; $('cardBtn').textContent=btn;
    $('card').style.display='flex';
    $('cardBtn').onclick=()=>{ $('card').style.display='none'; res(); };
  });
}

// Короткие реплики в бою: не останавливают игру, висят пару секунд
let barkT=null;
function bark(who, text, lang='kz'){
  const b=$('bark'); b.innerHTML=`<span class="bw">${escapeHtml(who)}</span> ${renderLang(text, lang)}`; b.classList.add('on');
  clearTimeout(barkT); barkT=setTimeout(()=>b.classList.remove('on'), 2600);
}
