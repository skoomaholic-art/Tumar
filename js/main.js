'use strict';
// Порядок глав, сохранения, финал, главный цикл и запуск

const CHAPTERS = { ch1: startAul, ch1b: startDeparture, ch2: startDon, ch3: startCity, ch4: startDonets, ch5: startField, ch5b: startCamp, ch6: startStalag };

async function endChapter1(){ await chapterSummary(1,'ch2'); startDon(); }

// итог главы: только решения этой главы (если предыдущая глава кончилась без итога — и её тоже)
function chapterSummary(n, next){
  const from = memory.logMark||0, first = (memory.lastSummary||0)+1;
  const items = memory.log.slice(from);
  memory.logMark = memory.log.length; memory.lastSummary = n;
  saveGame(next);
  const lines = items.length ? items.map(l=>'· '+escapeHtml(l)).join('<br>') : '<span class="small">В этой главе никто ничего не запомнил.</span>';
  return showCard(first<n ? `Конец глав ${first}–${n}` : 'Конец главы '+n, 'Что запомнили', `<span style="text-align:left;display:inline-block">${lines}</span><br><br><span class="small">Игра сохранена.</span>`, 'Дальше');
}
async function endChapter2(){ await chapterSummary(2,'ch3'); startCity(); }
async function endChapter3(){ await chapterSummary(3,'ch4'); startDonets(); }
// глава 4 кончается ранением — в поле переходим без итоговой карточки, прямо из темноты; её решения войдут в итог главы 5
async function endChapter4(){ saveGame('ch5'); startField(); }
async function endChapter5(){ await chapterSummary(5,'ch6'); startStalag(); }
async function endChapter6(){ await chapterSummary(6,'ch6'); finale(); }

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
  await showCard('Конец прототипа','TUMAR',
    `Дальше — хутор в Австрии, освобождение и фильтрация.<div class="decs">${lines}</div>${later}<br><br><span class="small">История и персонажи вымышлены. Сцены написаны по мотивам опубликованных воспоминаний фронтовиков и бывших военнопленных.</span>`,
    'Сыграть снова');
  deleteSave();
  location.reload();
}

// ---------- главный цикл ----------
let last=performance.now(), gT=0;
function loop(now){
  const dt=Math.min((now-last)/1000,.05); last=now; gT+=dt;
  if(active) active.update(dt,gT);
  if(scene) renderer.render(scene,camera);
  if((gT*12|0)%2===0) drawGrain();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

async function startAul(){ saveGame('ch1'); active=sceneAul(); await active.begin(); }
async function startDon(){ $('fade').style.opacity=1; await showChronicle('ch2'); active=sceneDon(); await active.begin(); }
async function startDeparture(){ saveGame('ch1b'); $('fade').style.opacity=1; active=sceneDeparture(); await active.begin(); }
async function startStalag(){ saveGame('ch6'); $('fade').style.opacity=1; active=sceneStalag(); await active.begin(); }
async function startCamp(){ saveGame('ch5b'); $('fade').style.opacity=1; active=sceneCamp(); await active.begin(); }
async function startCity(){ $('fade').style.opacity=1; await showChronicle('ch3'); active=sceneCity(); await active.begin(); }
async function startDonets(){ $('fade').style.opacity=1; await showChronicle('ch4'); active=sceneDonets(); await active.begin(); }
async function startField(){ $('fade').style.opacity=1; camera.position.set(0,.32,0); active=sceneField(); await active.begin(); }

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
  const saved = loadGame();
  if(saved && CHAPTERS[saved.chapter]){
    $('continue').hidden=false;
    $('continue').onclick=()=>{ initAudio(); lockLandscape(); memory=saved.memory; if(memory.notebook.length||memory.diary.length) $('nbBtn').style.display='block'; $('title').style.display='none'; CHAPTERS[saved.chapter](); };
    $('start').textContent='Новая игра';
    // новая игра поверх сохранения — только со второго нажатия
    let armed=false;
    $('start').onclick=()=>{ if(!armed){ armed=true; $('start').textContent='Сохранение сотрётся. Нажми ещё раз'; return; } deleteSave(); initAudio(); lockLandscape(); $('title').style.display='none'; startAul(); };
  } else {
    $('start').onclick=()=>{ initAudio(); lockLandscape(); $('title').style.display='none'; startAul(); };
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
