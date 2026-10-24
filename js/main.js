'use strict';
// Порядок глав, сохранения, финал, главный цикл и запуск

let CUR_CH = '';
const CHAPTERS = { ch1: startAul, ch1b: startDeparture, ch2: startDon, ch3: startCity, ch4: startDonets, ch5: startField, ch5b: startCamp, ch6: startStalag, ch7: startFarm, ch8: startFiltration };

async function endChapter1(){ await chapterSummary(1,'ch2'); startDon(); }

// итог главы: только решения этой главы (если предыдущая глава кончилась без итога — и её тоже)
async function chapterSummary(n, next){
  const from = memory.logMark||0, first = (memory.lastSummary||0)+1;
  const items = memory.log.slice(from).filter((x,i,a)=>a.findIndex(y=>JSON.stringify(y)===JSON.stringify(x))===i); // повтор после «Попробовать снова» не дублируем
  const words = memory.notebook.slice(memory.wordMark||0);
  memory.logMark = memory.log.length; memory.lastSummary = n; memory.wordMark = memory.notebook.length;
  // короткий тест по словам этой главы: учим казахский (игра на русском) или русский (игра на казахском)
  if(words.length>=2) await wordQuiz(words, memory.notebook);
  if(next!=='end') saveGame(next);
  const lines = items.length ? items.map(l=>'· '+escapeHtml(l)).join('<br>') : '<span class="small">В этой главе никто ничего не запомнил.</span>';
  return showCard(first<n ? `Конец глав ${first}–${n}` : 'Конец главы '+n, 'Что запомнили', `<span style="text-align:left;display:inline-block">${lines}</span>${next!=='end'?'<br><br><span class="small">Игра сохранена.</span>':''}`, 'Дальше');
}
async function endChapter2(){ await chapterSummary(2,'ch3'); startCity(); }
async function endChapter3(){ await chapterSummary(3,'ch4'); startDonets(); }
// глава 4 кончается ранением — в поле переходим без итоговой карточки, прямо из темноты; её решения войдут в итог главы 5
async function endChapter4(){ saveGame('ch5'); startField(); }
async function endChapter5(){ await chapterSummary(5,'ch6'); startStalag(); }
async function endChapter6(){ await chapterSummary(6,'ch7'); startFarm(); }
async function endChapter7(){
  // остался на Западе — восьмой главы нет, сразу концовка «Чужой берег»
  if(memory.flags.goHome===false){ await chapterSummary(7,'end'); await playEnding('C'); finale(); return; }
  await chapterSummary(7,'ch8'); startFiltration();
}
async function endChapter8(){ await chapterSummary(8,'end'); await playEnding(endingKind()); finale(); }

// все решения за игру: «Когда …, вы …». Доля игроков — когда будет сервер со статистикой (Cloud.stats)
function decisionLines(){
  const D = (DATA.decisions && DATA.decisions.list) || [];
  return D.map(d=>{
    const v = memory.flags[d.flag];
    const what = v===undefined ? d.unset : d.values[String(v)];
    if(!what) return null;
    const n = window.Cloud && Cloud.choiceCount ? Cloud.choiceCount(d.flag, String(v)) : null;
    return `<div class="dec"><span class="decCh">Глава ${d.chapter}</span>${escapeHtml(d.when)}, вы${n!=null?` и ещё ${n} игроков`:''} ${escapeHtml(what)}.</div>`;
  }).filter(Boolean).join('');
}

async function finale(){
  $('bars').style.display='none'; $('touch').style.display='none'; setObj('','');
  const lines = decisionLines();
  const later = memory.later.length ? `<br><br><span class="small">Весной 1945-го, на хуторе, он запишет в блокнот:</span><br><span style="text-align:left;display:inline-block;font-family:'Courier New',monospace;font-size:14px">${memory.later.map(l=>'· '+escapeHtml(l)).join('<br>')}</span>` : '';
  try{ localStorage.setItem('tumar-unlock-full','1'); }catch(_){}
  await showCard('Конец прототипа','TUMAR',
    `Дальше — хутор в Австрии, освобождение и фильтрация.<div class="decs">${lines}</div>${later}<br><br><span class="small">История и персонажи вымышлены. Сцены написаны по мотивам опубликованных воспоминаний фронтовиков и бывших военнопленных.</span>`,
    'Сыграть снова');
  deleteSave();
  location.reload();
}

// ---------- главный цикл ----------
let last=performance.now(), gT=0;
function loop(now){
  const dt=Math.min((now-last)/1000,.05); last=now; if(!PAUSED) gT+=dt;
  if(active && !PAUSED) active.update(dt,gT);
  if(typeof updatePeople==='function') updatePeople();
  renderFrame(gT);
  if((gT*12|0)%2===0) drawGrain();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

async function startAul(){ CUR_CH='ch1'; CAST_SET='aul'; saveGame('ch1'); active=sceneAul(); active.sketch=true; await active.begin(); }
async function startDon(){ CUR_CH='ch2'; CAST_SET='army'; $('fade').style.opacity=1; await showChronicle('ch2'); await showInterlude('ch2'); active=sceneDon(); await active.begin(); }
async function startDeparture(){ CUR_CH='ch1b'; CAST_SET='aul'; saveGame('ch1b'); $('fade').style.opacity=1; active=sceneDeparture(); await active.begin(); }
async function startStalag(){ CUR_CH='ch6'; CAST_SET='pow'; saveGame('ch6'); $('fade').style.opacity=1; await showChronicle('ch6'); await showInterlude('ch6'); active=sceneStalag(); await active.begin(); }
async function startFarm(){ CUR_CH='ch7'; CAST_SET='farm'; saveGame('ch7'); $('fade').style.opacity=1; await showChronicle('ch7'); await showInterlude('ch7'); active=sceneFarm(); await active.begin(); }
async function startFiltration(){ CUR_CH='ch8'; CAST_SET='filtr'; saveGame('ch8'); $('fade').style.opacity=1; await showChronicle('ch8'); await showInterlude('ch8'); active=sceneFiltration(); await active.begin(); }
async function startCamp(){ CUR_CH='ch5b'; CAST_SET='pow'; saveGame('ch5b'); $('fade').style.opacity=1; active=sceneCamp(); await active.begin(); }
async function startCity(){ CUR_CH='ch3'; CAST_SET='army'; $('fade').style.opacity=1; await showChronicle('ch3'); await showInterlude('ch3'); active=sceneCity(); await active.begin(); }
async function startDonets(){ CUR_CH='ch4'; CAST_SET='army'; $('fade').style.opacity=1; await showChronicle('ch4'); await showInterlude('ch4'); active=sceneDonets(); await active.begin(); }
async function startField(){ CUR_CH='ch5'; CAST_SET='pow'; $('fade').style.opacity=1; camera.position.set(0,.32,0); active=sceneField(); await active.begin(); }

// на телефоне — полный экран и горизонтальная ориентация, если браузер позволяет
function lockLandscape(){
  if(!isTouch) return;
  const el=document.documentElement;
  Promise.resolve(el.requestFullscreen ? el.requestFullscreen({navigationUI:'hide'}) : null)
    .then(()=> screen.orientation && screen.orientation.lock ? screen.orientation.lock('landscape') : null)
    .catch(()=>{});
}
// ---------- титульный экран: новая игра или продолжение ----------
(async function boot(){
  try{ await loadData(); }
  catch(e){ $('start').disabled=true; $('bootErr').textContent='Не удалось загрузить данные игры. Обновите страницу.'; return; }
  // меню — живая сцена: тумар на жерди загона, барашки, степь
  active=sceneMenu(); active.begin(); fadeTo(0,1800);
  // перед новой игрой — один раз: вымысел, источники, предупреждение
  const disclaimer=()=>showCard('', '', `<span style="display:block;max-width:560px;margin:0 auto;font-size:18px;line-height:1.6;color:var(--ink)">Художественный вымысел по мотивам воспоминаний ветеранов и бывших военнопленных из открытых источников. Все совпадения имён и судеб случайны.</span><br><span class="small">Игра содержит сцены жестокости, смерти и голода. 18+. Звук рекомендуется.</span>`, 'Понятно');
  const newGame=async(full)=>{ initAudio(); lockLandscape(); $('title').style.display='none'; await disclaimer(); if(full===true) memory.fullDialogs=true; else await chooseDifficulty(); toGame(); startAul(); };
  // режим без шифровок открывается после прохождения
  let unlocked=false; try{ unlocked = localStorage.getItem('tumar-unlock-full')==='1'; }catch(_){}
  if(unlocked){ $('fullStart').hidden=false; $('fullStart').onclick=()=>{ deleteSave(); newGame(true); }; }
  const toGame=()=>{ $('gearBtn').style.display='block'; $('help').style.visibility=''; $('hud').style.visibility=''; const f=$('fade'); f.style.transitionDuration='0ms'; f.style.opacity=1; };
  // для быстрых тестов: любая глава или концовка с чистой памятью
  $('chapTest').onclick=()=>{
    let el=$('chapSel'); if(!el){ el=document.createElement('div'); el.id='chapSel'; el.className='screen'; document.body.appendChild(el); }
    const EXTRA={ch1b:'Глава 1 · Эшелон', ch5b:'Глава 5 · Сборный пункт'}; const name=k=>{ const c=DATA[k]&&DATA[k].card; return EXTRA[k] || (c ? `${c.small} · ${c.big}` : k); };
    const ends=[['A','Концовка А · Загон'],['B','Концовка Б · Забой'],['C','Концовка В · Чужой берег']];
    el.innerHTML=`<h2>Выбор главы</h2><div class="dOpts">${Object.keys(CHAPTERS).map(k=>`<button class="btn" data-k="${k}" type="button"><b>${escapeHtml(name(k))}</b></button>`).join('')}${ends.map(([k,n])=>`<button class="btn" data-e="${k}" type="button"><b>${n}</b></button>`).join('')}</div><button class="btn back" type="button">Назад</button>`;
    el.style.display='flex';
    const begin=()=>{ el.style.display='none'; initAudio(); lockLandscape(); $('title').style.display='none'; toGame(); };
    el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ begin(); CHAPTERS[b.dataset.k](); });
    el.querySelectorAll('[data-e]').forEach(b=>b.onclick=async()=>{ begin(); if(b.dataset.e==='C') memory.flags.goHome=false; await playEnding(b.dataset.e); });
    el.querySelector('.back').onclick=()=>{ el.style.display='none'; };
  };
  const saved = loadGame();
  if(saved && CHAPTERS[saved.chapter]){
    $('continue').hidden=false; $('continue').disabled=false;
    const go=(sv)=>{ initAudio(); lockLandscape(); memory=sv.memory; if(memory.notebook.length||memory.diary.length) $('nbBtn').style.display='block'; $('title').style.display='none'; toGame(); CHAPTERS[sv.chapter](); };
    // «Продолжить» — выбор: любая из пройденных глав, последняя отмечена
    $('continue').onclick=()=>{
      const all=loadChapters(), order=Object.keys(CHAPTERS).filter(k=>all[k]);
      if(order.length<2){ go(saved); return; }
      let el=$('chapSel'); if(!el){ el=document.createElement('div'); el.id='chapSel'; el.className='screen'; document.body.appendChild(el); }
      const EXTRA={ch1b:'Глава 1 · Эшелон', ch5b:'Глава 5 · Сборный пункт'}; const name=k=>{ const c=DATA[k]&&DATA[k].card; return EXTRA[k] || (c ? `${c.small} · ${c.big}` : k); };
      el.innerHTML=`<h2>Откуда продолжить</h2><div class="dOpts">${order.map(k=>`<button class="btn${k===saved.chapter?' last':''}" data-k="${k}" type="button"><b>${escapeHtml(name(k))}</b><span>${k===saved.chapter?'последнее сохранение':'начало главы'}</span></button>`).join('')}</div><button class="btn back" type="button">Назад</button>`;
      el.style.display='flex';
      el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ el.style.display='none'; go(all[b.dataset.k]); });
      el.querySelector('.back').onclick=()=>{ el.style.display='none'; };
    };
    $('start').textContent='К истории';
    // новая игра поверх сохранения — только со второго нажатия
    let armed=false;
    $('start').onclick=()=>{ if(!armed){ armed=true; $('start').textContent='Сохранение сотрётся. Нажми ещё раз'; return; } deleteSave(); newGame(); };
  } else {
    $('start').onclick=()=>newGame();
  }
})();

// сенсорные кнопки
const tAct=$('tAct'), tCrawl=$('tCrawl');
tAct.addEventListener('pointerdown',e=>{ e.stopPropagation(); if(active.holdStart) active.holdStart(); if(active.act) active.act(); });
tAct.addEventListener('pointerup',()=>{ if(active.holdEnd) active.holdEnd(); });
tCrawl.addEventListener('pointerdown',e=>{ e.stopPropagation(); active.crawl && active.crawl(true); });
tCrawl.addEventListener('pointerup',()=>{ active.crawl && active.crawl(false); });
// в первой сцене касание по подсказке тоже работает
$('prompt').style.pointerEvents='auto';
$('prompt').addEventListener('pointerdown',e=>{ e.stopPropagation(); active && active.act && active.act(); });
window.__dbg = { get memory(){ return memory; }, DATA, get active(){ return active; } };

// ---------- настройки ----------
(function settingsUI(){
  const map=[['sMusic','vMusic','music',v=>Math.round(v*100)+'%'],['sSfx','vSfx','sfx',v=>Math.round(v*100)+'%'],['sVoice','vVoice','voice',v=>Math.round(v*100)+'%'],['sGamma','vGamma','gamma',v=>(+v).toFixed(2)]];
  for(const [inp,out,key,fmt] of map){ const el=$(inp); el.value=SETTINGS[key]; $(out).textContent=fmt(SETTINGS[key]);
    el.oninput=()=>{ SETTINGS[key]=+el.value; $(out).textContent=fmt(el.value); saveSettings(); if(key==='voice') tone({f:1700,dur:.03,type:'triangle',gain:.02,bus:'voice'}); if(key==='sfx') sfx.wood(); }; }
  const langMark=()=>{ $('langRu').classList.toggle('on',SETTINGS.lang!=='kz'); $('langKz').classList.toggle('on',SETTINGS.lang==='kz'); };
  $('langRu').onclick=e=>{ e.stopPropagation(); SETTINGS.lang='ru'; saveSettings(); langMark(); };
  $('langKz').onclick=e=>{ e.stopPropagation(); SETTINGS.lang='kz'; saveSettings(); langMark(); };
  langMark();
  const fsLabel=()=>{ $('fsBtn').textContent = document.fullscreenElement ? 'Выйти из полного экрана' : 'Полный экран'; };
  $('fsBtn').onclick=e=>{ e.stopPropagation(); const d=document; (d.fullscreenElement ? d.exitFullscreen() : d.documentElement.requestFullscreen({navigationUI:'hide'})).catch(()=>{}).finally(()=>setTimeout(fsLabel,200)); };
  document.addEventListener('fullscreenchange', fsLabel);
  const inGame=()=>$('title').style.display==='none';
  const open=e=>{ if(e) e.stopPropagation(); initAudio(); fsLabel(); $('settings').style.display='flex'; const g=inGame(); $('setHead').textContent = g ? 'Пауза' : 'Настройки'; $('gameRow').style.display = g ? '' : 'none'; $('setClose').textContent = g ? 'Вернуться в игру' : 'Готово'; $('saveNote').textContent=''; if(g) setPaused(true); };
  // сохранение — контрольная точка: начало текущей главы (посреди сцены состояние не сохранить)
  const chapName=()=>{ const s=loadGame(); if(!s) return ''; const c=DATA[s.chapter]&&DATA[s.chapter].card; return c?`${c.small} · ${c.big}`:''; };
  $('setSave').onclick=e=>{ e.stopPropagation(); const ok=!!loadGame(); $('saveNote').textContent = ok ? `Сохранено: ${chapName()||'текущая глава'}, с начала главы` : 'Не удалось сохранить'; };
  $('setMenu').onclick=e=>{ e.stopPropagation(); $('saveNote').textContent='Сохраняю…'; setPaused(false); location.reload(); };
  const close=()=>{ $('settings').style.display='none'; setPaused(false); };
  $('setBtn').onclick=open; $('gearBtn').onclick=open;
  $('setClose').onclick=e=>{ e.stopPropagation(); close(); };
  $('settings').onclick=e=>{ if(e.target.id==='settings') close(); };
  addEventListener('keydown',e=>{ if(e.code==='Escape' || (e.code==='KeyP' && inGame())){ if($('settings').style.display==='flex') close(); else if(inGame()) open(); } });
  addEventListener('blur',()=>{ if(inGame() && $('settings').style.display!=='flex') open(); }); // ушёл из вкладки — пауза
})();
