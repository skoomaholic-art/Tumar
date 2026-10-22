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
  if((lang!=='ru' && lang!=='de') || memory.fullDialogs) return escapeHtml(text);
  if(lang==='ru' && ((memory.flags && memory.flags.ruFluent) || (memory.lastSummary||0)>=3)) return escapeHtml(text); // за год на фронте Асан стал понимать по-русски
  return text.split(/(\s+|[.,!?—:])/).map(w => {
    const k = w.toLowerCase();
    if(!/[а-яёa-zäöüß]/i.test(w)) return escapeHtml(w);
    return (memory.knownWords.has(k) || COGNATES.has(k)) ? `<span class="known">${escapeHtml(w)}</span>` : `<span class="noise">${scramble(w)}</span>`;
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
  'Гриша': {bg:'#2e2b20', hat:'<rect x="22" y="15" width="32" height="8" rx="2" fill="#5e5a38"/>', face:'#c29a78'},
  'Волков': {bg:'#262420', hat:'<path d="M18 22 Q38 8 58 22 L58 26 L18 26 Z" fill="#4a4630"/><rect x="16" y="24" width="44" height="4" fill="#222"/><circle cx="38" cy="18" r="2.5" fill="#8e1f1a"/>', face:'#b8927a'},
  'Старшина': {bg:'#2b2820', hat:'<rect x="22" y="14" width="32" height="9" rx="2" fill="#4e4a30"/><circle cx="38" cy="18" r="2.5" fill="#8e1f1a"/>', face:'#a8825e', beard:false},
  'Солдат': {bg:'#2b2820', hat:'<rect x="22" y="15" width="32" height="8" rx="2" fill="#5e5a38"/>', face:'#a8825e'},
  'Семён': {bg:'#2c2820', hat:'<rect x="23" y="14" width="30" height="10" rx="3" fill="#3e3428"/>', face:'#c8a07e'},
  'Сашко': {bg:'#2b2820', hat:'<rect x="22" y="15" width="32" height="8" rx="2" fill="#5e5a38"/>', face:'#c09676'},
  'Мать': {bg:'#30281e', hat:'<path d="M16 34 Q38 0 60 34 L60 46 L16 46 Z" fill="#e2dccb"/>', face:'#9a7656'},
  'Мударис': {bg:'#2a251c', hat:'<path d="M22 20 Q38 8 54 20 Z" fill="#3a5a3a"/>', face:'#8e6c50', beard:true},
  'Синицын': {bg:'#22241f', hat:'<rect x="26" y="30" width="10" height="5" rx="2" fill="none" stroke="#222" stroke-width="1.5"/><rect x="40" y="30" width="10" height="5" rx="2" fill="none" stroke="#222" stroke-width="1.5"/>', face:'#b39072'},
  'Сосед': {bg:'#24211b', hat:'', face:'#8a6a50'},
  'Немец': {bg:'#1f2220', hat:'<path d="M20 24 Q38 6 56 24 L58 28 L18 28 Z" fill="#5a5e54"/><rect x="18" y="26" width="40" height="3" fill="#3a3e36"/>', face:'#c4a084'},
  'Немецкая речь': {bg:'#1f2220', hat:'<path d="M20 24 Q38 6 56 24 L58 28 L18 28 Z" fill="#5a5e54"/><rect x="18" y="26" width="40" height="3" fill="#3a3e36"/>', face:'#c4a084'},
  'Фельдфебель': {bg:'#1f2220', hat:'<path d="M22 22 L28 12 L50 12 L54 22 Z" fill="#6a6e64"/><rect x="20" y="20" width="36" height="4" fill="#4a4e44"/>', face:'#c8a488'},
  'Санитар': {bg:'#1f2220', hat:'<path d="M22 22 L28 12 L50 12 L54 22 Z" fill="#6a6e64"/><rect x="20" y="20" width="36" height="4" fill="#4a4e44"/>', face:'#d0b090'},
  'Охранник': {bg:'#1f2220', hat:'<path d="M20 24 Q38 6 56 24 L58 28 L18 28 Z" fill="#5a5e54"/><rect x="18" y="26" width="40" height="3" fill="#3a3e36"/>', face:'#c4a084'},
  'Конвойный': {bg:'#1f2220', hat:'<path d="M20 24 Q38 6 56 24 L58 28 L18 28 Z" fill="#5a5e54"/><rect x="18" y="26" width="40" height="3" fill="#3a3e36"/>', face:'#c4a084'},
  'Ибрай-ага': {bg:'#2a251c', hat:'<rect x="24" y="14" width="28" height="9" rx="3" fill="#3c3026"/>', face:'#8e6c50', beard:true},
  'Хайдар-бек': {bg:'#1f2220', hat:'<path d="M22 22 L28 12 L50 12 L54 22 Z" fill="#5e6252"/><rect x="20" y="20" width="36" height="4" fill="#3e4236"/>', face:'#9c7a58'},
  'Василий': {bg:'#2b2820', hat:'', face:'#b8927a'},
  'Полицай': {bg:'#1e1c18', hat:'<rect x="22" y="15" width="32" height="8" rx="2" fill="#2e2c28"/>', face:'#a8825e'},
  'Врач': {bg:'#24261f', hat:'', face:'#d0b090'},
  'Кто-то в дыму': {bg:'#121010', hat:'', face:'#1e1914'},
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
    $('who').textContent = who; $('who').dataset.f=factionOf(who); $('por').innerHTML = portrait(who);
    const html = renderLang(text, lang); const el=$('txt');
    // печать по символам для обычного текста; шумный текст выводим сразу
    clearInterval(typing);
    if(lang==='ru'||lang==='de'){ el.innerHTML = html; dlgResolve = res; return; }
    let i=0; el.textContent='';
    typing = setInterval(()=>{ i+=2; el.textContent = text.slice(0,i); if(i%6===0) tone({f:1500+Math.random()*500,dur:.03,type:'triangle',gain:.02,bus:'voice'}); if(i>=text.length){ clearInterval(typing); typing=null; } }, 22);
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
    $('who').textContent=who; $('who').dataset.f=factionOf(who); $('por').innerHTML=portrait(who); $('txt').textContent=text;
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
$('nb').addEventListener('click', e=>{ if(e.target.id==='nb') closeNotebook(); }); // клик мимо листа — закрыть

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
  const b=$('bark'); b.innerHTML=`<span class="bw" data-f="${factionOf(who)}">${escapeHtml(who)}</span> ${renderLang(text, lang)}`; b.classList.add('on');
  clearTimeout(barkT); barkT=setTimeout(()=>b.classList.remove('on'), 2600);
}

// Сколько снизу страницы закрыто панелью браузера/клавиатурой: поднимаем на столько весь нижний интерфейс
(function trackBottomBar(){
  const vv = window.visualViewport; if(!vv) return;
  const upd = ()=>{ const hidden = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); document.documentElement.style.setProperty('--vvb', Math.round(hidden)+'px'); };
  vv.addEventListener('resize', upd); vv.addEventListener('scroll', upd); addEventListener('resize', upd); upd();
})();

// Подпись своей рукой: игрок сам ведёт пальцем или мышью по строке — крестик или имя; линия ложится карандашом.
// Рисунок сохраняется (memory.signature) и потом встречается на других бумагах.
function signaturePad(head, hint, prev){
  return new Promise(res=>{
    const W=480, H=130;
    $('paper').innerHTML = `<div style="font-size:15px;opacity:.8">${head}</div>
      ${prev?`<div style="font-size:12px;opacity:.6;margin-top:8px">Подпись на повестке, март 1942:</div><img src="${prev}" alt="" style="height:44px;opacity:.75;display:block">`:''}
      <canvas id="sigPad" width="${W}" height="${H}" style="width:100%;max-width:${W}px;height:auto;display:block;margin:8px auto 0;touch-action:none;cursor:crosshair"></canvas>
      <div class="hint" id="sigHint">${hint}</div>
      <button class="btn" id="sigDone" style="visibility:hidden;margin-top:10px;color:#2b241a;border-color:#2b241a">Готово</button>`;
    $('doc').style.display='flex'; $('doc').onclick=null;
    const cv=$('sigPad'), g=cv.getContext('2d');
    g.strokeStyle='#3a3026'; g.lineWidth=1.5; g.beginPath(); g.moveTo(14,H-26); g.lineTo(W-14,H-26); g.stroke();
    let down=false, last=null, ink=0, scratchT=0;
    const pos=e=>{ const r=cv.getBoundingClientRect(); return {x:(e.clientX-r.left)*W/r.width, y:(e.clientY-r.top)*H/r.height}; };
    cv.onpointerdown=e=>{ e.stopPropagation(); e.preventDefault(); down=true; last=pos(e); cv.setPointerCapture(e.pointerId); };
    cv.onpointermove=e=>{ if(!down) return; e.stopPropagation(); const p=pos(e), d=Math.hypot(p.x-last.x,p.y-last.y); if(d<1.2) return;
      // карандаш: тёмно-серый, неровный нажим, лёгкая дрожь
      g.strokeStyle=`rgba(38,36,46,${.72+Math.random()*.25})`; g.lineWidth=1.6+Math.random()*1.3; g.lineCap='round';
      g.beginPath(); g.moveTo(last.x,last.y); g.lineTo(p.x+(Math.random()-.5)*.6, p.y+(Math.random()-.5)*.6); g.stroke();
      ink+=d; last=p;
      const now=performance.now(); if(now-scratchT>90 && typeof noiseBurst==='function' && AC){ scratchT=now; noiseBurst({dur:.08,freq:3200+Math.random()*1200,q:.7,gain:.05,type:'bandpass'}); }
      if(ink>70) $('sigDone').style.visibility='visible'; };
    cv.onpointerup=cv.onpointercancel=e=>{ down=false; };
    $('sigDone').onclick=e=>{ e.stopPropagation();
      const sm=document.createElement('canvas'); sm.width=240; sm.height=65; sm.getContext('2d').drawImage(cv,0,0,240,65);
      try{ memory.signature = sm.toDataURL('image/png'); }catch(_){}
      $('doc').style.display='none'; res(memory.signature); };
  });
}

// Каше, как в кинорежиме RDR2: в сценах-кино кадр сужается до 2.39:1 на любом экране
(function letterbox(){
  const upd=()=>{ const H=innerHeight, W=innerWidth; const bar=Math.max(H*.035, (H - W/2.39)/2); document.documentElement.style.setProperty('--lbh', Math.round(bar)+'px'); };
  addEventListener('resize', upd); upd();
})();

// ---------- тест по словам в конце главы ----------
// Игра на русском — учим казахский: показываем казахское слово, выбираем русское значение. Игра на казахском — наоборот.
const kzClean = s => String(s).replace(/\s*\(.*?\)/g,'').replace(/\s*—.*$/,'').trim();
const QUIZ_EXTRA = [['вода','су'],['хлеб','нан'],['мать','ана'],['дом','үй'],['конь','ат'],['степь','дала'],['отец','әке'],['утро','таң'],['ночь','түн'],['брат','аға']];
function wordQuiz(words, pool){
  const toKz = SETTINGS.lang==='kz'; // играем на казахском — спрашиваем русские слова
  const uniq=[]; words.forEach(w=>{ if(!uniq.some(u=>u.ru===w.ru)) uniq.push(w); });
  const lvl = memory.difficulty||'normal';
  const qs = uniq.slice(lvl==='easy'?-3 : lvl==='hard'?-10 : -6);
  const all = [...pool.map(w=>[w.ru,kzClean(w.kz)]), ...QUIZ_EXTRA];
  return new Promise(res=>{
    let el=$('quiz'); if(!el){ el=document.createElement('div'); el.id='quiz'; el.className='screen'; document.body.appendChild(el); }
    el.style.display='flex'; let i=0, right=0;
    const ask=()=>{
      if(i>=qs.length){ el.innerHTML=`<p class="small">${toKz?'Орыс сөздері':'Казахские слова'}</p><h1 style="font-size:clamp(26px,5vw,40px)">${right} из ${qs.length}</h1>
        <p>${right===qs.length?'Все слова узнал.':'Ошибки не страшны: слова останутся в блокноте.'}</p><button class="btn" id="qDone">Дальше</button>`;
        $('qDone').onclick=()=>{ el.style.display='none'; memory.quiz=(memory.quiz||[]).concat([{right,total:qs.length}]); res(); }; return; }
      const w=qs[i], ru=w.ru, kz=kzClean(w.kz);
      const q=toKz?ru:kz, ans=toKz?kz:ru;
      const wrong=[...new Set(all.map(p=>toKz?p[1]:p[0]).filter(x=>x && x!==ans))].sort(()=>Math.random()-.5).slice(0,3);
      const opts=[ans,...wrong].sort(()=>Math.random()-.5);
      el.innerHTML=`<p class="small">${toKz?'Сөзді тексер':'Проверь слово'} · ${i+1} / ${qs.length}</p>
        <h1 style="font-size:clamp(28px,6vw,48px);letter-spacing:.04em">${escapeHtml(q)}</h1>
        <p class="small">${toKz?'Қазақша мағынасы?':'Что это значит по-русски?'}</p>
        <div class="qOpts">${opts.map(o=>`<button class="btn qo">${escapeHtml(o)}</button>`).join('')}</div>
        <p class="small" style="opacity:.6">${escapeHtml(w.where||'')}</p>`;
      el.querySelectorAll('.qo').forEach(b=>b.onclick=()=>{ const ok=b.textContent===ans; if(ok) right++;
        // на трудном ошибка возвращает слово в шум — его придётся выучить заново
        else if(lvl==='hard'){ memory.knownWords.delete(ru); }
        el.querySelectorAll('.qo').forEach(x=>{ x.disabled=true; if(x.textContent===ans) x.classList.add('qRight'); else if(x===b) x.classList.add('qWrong'); });
        tone(ok?{f:880,dur:.15,gain:.05,bus:'voice'}:{f:220,dur:.25,type:'triangle',gain:.05,bus:'voice'});
        setTimeout(()=>{ i++; ask(); }, ok?700:1300); });
    };
    ask();
  });
}

// ---------- уровень сложности: сколько слов Асан знает с начала и сколько нужно выучить ----------
const EASY_WORDS=['да','нет','давай','иди','стой','сюда','назад','вперёд','тихо','хлеб','вода','живой','немцы','немец','ложись','огонь','пулемёт','товарищ','ну','кто','что','где','вот','здесь','ладно','быстро','свои','война','мама','спасибо'];
function chooseDifficulty(){
  return new Promise(res=>{
    let el=$('diff'); if(!el){ el=document.createElement('div'); el.id='diff'; el.className='screen'; document.body.appendChild(el); }
    el.innerHTML=`<p class="small">Уровень сложности</p><h1 style="font-size:clamp(26px,5vw,40px)">Сколько Асан понимает</h1>
      <div class="dOpts">
        <button class="btn" data-l="easy"><b>Лёгкий</b><span>Асан с начала знает 30 частых русских слов. За игру — около 64 новых слов, в тесте главы три слова.</span></button>
        <button class="btn" data-l="normal"><b>Обычный</b><span>Асан почти не знает русского. За игру — около 120 новых слов, в тесте главы шесть.</span></button>
        <button class="btn" data-l="hard"><b>Трудный</b><span>За игру — около 200 новых слов. В тесте все слова главы, ошибка возвращает слово в шум.</span></button>
      </div>`;
    el.style.display='flex';
    el.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ const l=b.dataset.l; memory.difficulty=l;
      if(l==='easy') EASY_WORDS.forEach(w=>memory.knownWords.add(w));
      el.style.display='none'; res(l); });
  });
}

// ---------- мини-игра «запиши слово»: собрать слово из кусочков по порядку ----------
// Играем на русском — учим казахский: по русскому смыслу собираем казахское слово.
// Играем на казахском — учим русский: по казахскому смыслу собираем русское слово латиницей, как писал Асан.
// кто говорит: свои и доброжелатели — зелёным, враги — красным, остальные — белым
const ALLIES=new Set(['Отец','Мать','Күләш','Ибрай-ага','Колесников','Жумабай','Гриша','Семён','Сашко','Волков','Старшина','Мударис','Синицын','Василий','Тадеуш','Лизль','Марта','Дубровин','Ковальски','Американец','Пожилой немец','Солдат']);
const ENEMIES=new Set(['Немец','Немецкая речь','Охранник','Фельдфебель','Эсэсовец','Штайнер','Молодой немец','Санитар','Полицай','Хайдар-бек','Врач']);
function factionOf(who){ return ALLIES.has(who)?'ally' : ENEMIES.has(who)?'enemy' : 'neutral'; }
function wordWriteGame(ru, kz, where, opt){
  return new Promise(res=>{
    const toKz = SETTINGS.lang!=='kz';
    const target = opt&&opt.target ? opt.target : toKz ? kzClean(kz) : toLat(ru), hint = toKz ? ru : kzClean(kz);
    const lvl = memory.difficulty||'normal';
    let size = lvl==='easy'?3 : lvl==='hard'?1 : 2; const letters=[...target];
    while(Math.ceil(letters.length/size)>9) size++;
    const parts=[]; for(let i=0;i<letters.length;i+=size) parts.push(letters.slice(i,i+size).join(''));
    const pool=parts.map((p,i)=>({p,i}));
    if(lvl==='hard'){ const abc=opt&&opt.target?'aeinrstl':toKz?'аеіоұүқғңәө':'aeiouksnrt'; for(let k=0;k<2;k++) pool.push({p:abc[Math.random()*abc.length|0],i:-1}); }
    pool.sort(()=>Math.random()-.5);
    let el=$('wgame'); if(!el){ el=document.createElement('div'); el.id='wgame'; document.body.appendChild(el); }
    el.innerHTML=`<div class="sheet"><div class="wg-src">Позже Асан запишет новое слово в блокнот</div>
      <div class="wg-q">${opt&&opt.target ? (toKz?'Как это по-немецки':'Немісше қалай') : toKz?'Как это по-казахски':'Как это звучит по-русски'}: <b>«${escapeHtml(hint)}»</b></div>
      <div class="wg-line" id="wgLine"></div>
      <div class="wg-tiles">${pool.map((t,k)=>`<button class="wg-t" data-k="${k}">${escapeHtml(t.p)}</button>`).join('')}</div>
      <button class="wg-skip" id="wgSkip">Пропустить</button></div>`;
    el.style.display='flex';
    let next=0; const line=$('wgLine');
    const finish=()=>{ el.querySelector('.wg-tiles').style.visibility='hidden'; $('wgSkip').style.display='none'; line.textContent=target; line.classList.add('done');
      const w=el.querySelector('.sheet'); w.insertAdjacentHTML('beforeend',`<div class="wg-ok">${toKz?'':escapeHtml(ru)+' — '}записал в блокнот</div>`);
      tone({f:660,dur:.12,gain:.04,bus:'voice'}); tone({f:990,dur:.2,gain:.03,delay:.1,bus:'voice'});
      setTimeout(()=>{ el.style.display='none'; res(); }, 1300); };
    el.querySelectorAll('.wg-t').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const t=pool[+b.dataset.k];
      if(t.i===next || (t.i>=0 && parts[t.i]===parts[next])){ b.disabled=true; b.classList.add('used'); line.textContent+=parts[next]; next++;
        noiseBurst({dur:.07,freq:3200,q:.7,gain:.05,type:'bandpass',bus:'voice'}); if(next>=parts.length) finish(); }
      else { b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad'); tone({f:180,dur:.15,type:'triangle',gain:.04,bus:'voice'}); } });
    $('wgSkip').onclick=e=>{ e.stopPropagation(); finish(); };
  });
}

// ---------- комиксные вставки между главами ----------
// Заполняют месяцы между главами: новости, письма, и как Асан учится понимать чужую речь.
// Рисунки — чернилами по бумаге, простые силуэты (позже заменим рисованными).
const INK='#2b241c', PAPER='#e2d5b6';
const ART = {
  train: ()=>`<rect width="400" height="260" fill="${PAPER}"/><line x1="0" y1="200" x2="400" y2="200" stroke="${INK}" stroke-width="3"/>
    ${[40,140,240,340].map(x=>`<line x1="${x}" y1="200" x2="${x}" y2="120" stroke="${INK}" stroke-width="3"/><line x1="${x-14}" y1="128" x2="${x+14}" y2="128" stroke="${INK}" stroke-width="2"/>`).join('')}
    <path d="M0 140 Q200 130 400 142" fill="none" stroke="${INK}" stroke-width="1"/>
    ${[20,130,240].map(x=>`<rect x="${x}" y="150" width="100" height="44" fill="${INK}"/><rect x="${x+36}" y="160" width="26" height="22" fill="${PAPER}" opacity=".35"/><circle cx="${x+20}" cy="198" r="7" fill="${INK}"/><circle cx="${x+80}" cy="198" r="7" fill="${INK}"/>`).join('')}
    <rect x="345" y="140" width="55" height="54" fill="${INK}"/><path d="M370 140 q-10 -30 20 -50 q30 -20 10 -60" fill="none" stroke="${INK}" stroke-width="10" opacity=".35" stroke-linecap="round"/>`,
  drill: ()=>`<rect width="400" height="260" fill="${PAPER}"/><line x1="0" y1="210" x2="400" y2="210" stroke="${INK}" stroke-width="2"/>
    ${[0,1,2,3,4,5,6].map(i=>{const x=40+i*50; return `<circle cx="${x}" cy="120" r="11" fill="${INK}"/><rect x="${x-11}" y="132" width="22" height="50" fill="${INK}"/><rect x="${x-9}" y="182" width="7" height="28" fill="${INK}"/><rect x="${x+2}" y="182" width="7" height="28" fill="${INK}"/><line x1="${x+14}" y1="100" x2="${x+14}" y2="185" stroke="${INK}" stroke-width="3"/>`;}).join('')}`,
  notebook: (words)=>`<rect width="400" height="260" fill="#3a3026"/><g transform="rotate(-3 200 130)"><rect x="50" y="22" width="300" height="220" fill="#d9cdb0"/>
    ${[0,1,2,3,4,5,6].map(i=>`<line x1="60" y1="${58+i*26}" x2="340" y2="${58+i*26}" stroke="#7a8aa0" stroke-width="1" opacity=".5"/>`).join('')}
    <line x1="88" y1="22" x2="88" y2="242" stroke="#a0382a" stroke-width="1.5" opacity=".6"/>
    ${(words||[]).slice(0,6).map((w,i)=>`<text x="96" y="${54+i*26}" font-family="Caveat,'Courier New',cursive" font-size="20" fill="#1d2a4a">${escapeHtml(w[0])} — ${escapeHtml(w[1])}</text>`).join('')}</g>`,
  letter: ()=>`<rect width="400" height="260" fill="${PAPER}"/><g transform="translate(200 130) rotate(-12)"><path d="M-80 -50 L80 -50 L0 60 Z" fill="#efe6d0" stroke="${INK}" stroke-width="3"/><path d="M-80 -50 L0 10 L80 -50" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="-40" y="-26" font-family="Caveat,cursive" font-size="16" fill="${INK}">полевая почта</text></g>
    <path d="M20 250 q40 -60 90 -70 l30 10" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`,
  river: ()=>`<rect width="400" height="260" fill="${PAPER}"/><rect x="0" y="170" width="400" height="90" fill="#8e8a7a"/>
    ${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${10+i*48}" y="${100+(i*37)%40}" width="34" height="${70-(i*37)%40}" fill="${INK}"/>`).join('')}
    ${[60,180,300].map(x=>`<path d="M${x} 110 q-20 -40 10 -70 q20 -20 -5 -40" fill="none" stroke="${INK}" stroke-width="16" opacity=".3" stroke-linecap="round"/>`).join('')}
    ${[0,1,2,3].map(i=>`<line x1="${20+i*100}" y1="${200+i%2*12}" x2="${80+i*100}" y2="${200+i%2*12}" stroke="${PAPER}" stroke-width="2" opacity=".6"/>`).join('')}`,
  banner: ()=>`<rect width="400" height="260" fill="${PAPER}"/><line x1="120" y1="40" x2="120" y2="240" stroke="${INK}" stroke-width="5"/><path d="M122 44 q60 -10 120 10 q50 16 100 0 l0 70 q-50 16 -100 0 q-60 -20 -120 -10 Z" fill="#8e1f1a"/>
    ${[0,1,2,3,4].map(i=>`<circle cx="${40+i*80}" cy="208" r="9" fill="${INK}"/><rect x="${31+i*80}" y="218" width="18" height="42" fill="${INK}"/>`).join('')}`,
  hospital: ()=>`<rect width="400" height="260" fill="#cfc2a2"/>${[0,1,2].map(i=>`<rect x="${20+i*130}" y="150" width="110" height="18" fill="${INK}"/><rect x="${24+i*130}" y="168" width="6" height="40" fill="${INK}"/><rect x="${120+i*130}" y="168" width="6" height="40" fill="${INK}"/>`).join('')}
    <circle cx="200" cy="80" r="12" fill="${INK}"/><rect x="190" y="92" width="20" height="50" fill="${INK}"/><rect x="186" y="142" width="8" height="40" fill="${INK}"/><rect x="204" y="142" width="8" height="40" fill="${INK}" transform="rotate(14 208 142)"/><line x1="228" y1="96" x2="240" y2="186" stroke="${INK}" stroke-width="4"/>`,
  // телега: раненые вповалку, лошадь, конвоир сбоку
  cart: ()=>`<rect width="400" height="260" fill="#d2c6a6"/><line x1="0" y1="214" x2="400" y2="214" stroke="${INK}" stroke-width="2"/>
    <rect x="120" y="140" width="190" height="34" fill="${INK}"/><circle cx="150" cy="196" r="22" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="280" cy="196" r="22" fill="none" stroke="${INK}" stroke-width="5"/>
    ${[0,1,2,3].map(i=>`<ellipse cx="${150+i*42}" cy="${132-(i%2)*6}" rx="26" ry="9" fill="${INK}"/><circle cx="${126+i*42}" cy="${128-(i%2)*6}" r="8" fill="${INK}"/>`).join('')}
    <path d="M120 160 L60 150 M60 150 Q40 130 48 112 Q60 100 74 108 L86 150 L80 196 M52 150 L44 196" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="350" cy="96" r="10" fill="${INK}"/><path d="M340 92 Q350 78 360 92" fill="${INK}"/><rect x="342" y="106" width="16" height="50" fill="${INK}"/><line x1="346" y1="156" x2="342" y2="210" stroke="${INK}" stroke-width="6"/><line x1="356" y1="156" x2="360" y2="210" stroke="${INK}" stroke-width="6"/><line x1="364" y1="70" x2="372" y2="160" stroke="${INK}" stroke-width="3"/>`,
  // построение: ряд фигур, у одного костыль, вдоль строя — сапоги и каска
  lineup: ()=>`<rect width="400" height="260" fill="#cbc2ac"/><line x1="0" y1="222" x2="400" y2="222" stroke="${INK}" stroke-width="2"/>
    ${[0,1,2,3,4,5,6].map(i=>{ const x=30+i*44, h=i===2?8:0; return `<circle cx="${x}" cy="${96+h}" r="11" fill="${INK}"/><rect x="${x-10}" y="${108+h}" width="20" height="56" fill="${INK}"/><rect x="${x-9}" y="${164+h}" width="7" height="${56-h}" fill="${INK}"/><rect x="${x+2}" y="${164+h}" width="7" height="${56-h}" fill="${INK}"/>`+(i===2?`<line x1="${x+16}" y1="122" x2="${x+20}" y2="222" stroke="${INK}" stroke-width="3"/>`:''); }).join('')}
    <path d="M350 92 Q362 76 374 92 Z" fill="${INK}"/><circle cx="362" cy="98" r="10" fill="${INK}"/><rect x="351" y="108" width="22" height="60" fill="${INK}"/><rect x="352" y="168" width="8" height="54" fill="${INK}"/><rect x="364" y="168" width="8" height="54" fill="${INK}"/><line x1="351" y1="118" x2="326" y2="134" stroke="${INK}" stroke-width="5"/>`,
  wire: ()=>`<rect width="400" height="260" fill="#c9c6bc"/>${[30,130,230,330].map(x=>`<line x1="${x}" y1="70" x2="${x}" y2="240" stroke="${INK}" stroke-width="5"/>`).join('')}
    ${[90,120,150,180,210].map(y=>`<path d="M0 ${y} ${Array.from({length:20},(_,k)=>`L${k*20+10} ${y+(k%2?4:-4)}`).join(' ')}" fill="none" stroke="${INK}" stroke-width="1.5"/>`).join('')}
    <rect x="300" y="10" width="60" height="30" fill="${INK}"/><line x1="310" y1="40" x2="305" y2="240" stroke="${INK}" stroke-width="4"/><line x1="350" y1="40" x2="355" y2="240" stroke="${INK}" stroke-width="4"/>`
};
async function showInterlude(key){
  const D = DATA.interludes && DATA.interludes[key]; if(!D) return;
  // что Асан выучил за эти месяцы: на лёгком — всё, на среднем — две трети, на сложном — треть
  const lvl = memory.difficulty||'normal', share = lvl==='easy'?1 : lvl==='hard'?.34 : .67;
  const learnt = (D.learn||[]).slice(0, Math.max(1, Math.round((D.learn||[]).length*share)));
  learnt.forEach(([ru,kz])=>{ const base=ru.replace(/\s*\(.*\)/,''); memory.knownWords.add(base); if(!memory.notebook.some(n=>n.ru===ru)) memory.notebook.push({ru, lat:toLat(base), kz, where:D.title}); });
  (D.learnDe||[]).slice(0, Math.max(1, Math.round((D.learnDe||[]).length*share))).forEach(w=>memory.knownWords.add(w));
  if(D.ruFluent) memory.flags.ruFluent=true;
  const page=$('page'); page.innerHTML='';
  D.panels.forEach(p=>{ const d=document.createElement('div'); d.className='pn';
    const words = p.art==='notebook' ? learnt : null;
    d.innerHTML=`<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block;filter:sepia(.35) contrast(1.1)">${ART[p.art] ? ART[p.art](words) : ''}</svg><div class="cap${p.art==='notebook'?'':' top'}">${escapeHtml(p.text)}</div>`;
    page.appendChild(d); });
  page.classList.toggle('four', D.panels.length>=4);
  $('panels').style.display='flex'; $('fade').style.transitionDuration='600ms'; $('fade').style.opacity=0;
  const click=()=>new Promise(r=>{ const h=()=>{ $('panels').removeEventListener('pointerdown',h); removeEventListener('keydown',kk); r(); }; const kk=e=>{ if(e.code==='Space'||e.code==='Enter') h(); }; $('panels').addEventListener('pointerdown',h); addEventListener('keydown',kk); });
  const cells=[...page.children];
  for(let i=0;i<cells.length;i++){ cells[i].classList.add('on'); sfx.paper(); $('pnNext').textContent = i<cells.length-1 ? 'Нажми, чтобы открыть следующий кадр' : 'Нажми, чтобы перевернуть страницу'; await wait(350); await click(); }
  await fadeTo(1,600); $('panels').style.display='none'; page.classList.remove('four');
}

// кнопка «Копать»: рывками, мышью/пальцем или Пробелом/E. Возвращает промис после n нажатий (n=0 — без счёта, onPress сам решает)
function digPrompt(n, label='Копать', onPress=null){
  return new Promise(res=>{
    const el=document.createElement('div'); el.className='digOnly';
    el.innerHTML=`<button type="button">${escapeHtml(label)}</button><div class="bBar"><i></i></div><div class="bHint">жми быстро · Пробел или E</div>`;
    document.body.appendChild(el); let k=0, done=false;
    const fin=()=>{ if(done) return; done=true; removeEventListener('keydown',kd,true); el.classList.remove('on'); setTimeout(()=>el.remove(),300); res(); };
    const press=()=>{ if(done) return; k++; if(onPress && onPress()===true) return fin(); if(n){ el.querySelector('.bBar i').style.width=Math.min(100,k/n*100)+'%'; noiseBurst({dur:.14,freq:300+Math.random()*200,q:.6,gain:.25,type:'lowpass'}); if(k>=n) fin(); } };
    const kd=e=>{ if(PAUSED) return; if(e.code==='Space'||e.code==='KeyE'){ e.preventDefault(); e.stopPropagation(); if(!e.repeat) press(); } };
    el.querySelector('button').addEventListener('pointerdown',e=>{ e.stopPropagation(); e.preventDefault(); press(); });
    addEventListener('keydown',kd,true); requestAnimationFrame(()=>el.classList.add('on'));
    digPrompt.close=fin;
  });
}
