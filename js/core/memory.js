'use strict';
// Память игры: выборы, записи, слова блокнота
// Память персонажей — то, что игра запоминает о выборах игрока
// flags — сюжетные флаги, relations — отношение персонажей к Асану, testimony — показания для допросов
let memory = { diary:[], notebook:[], flags:{}, relations:{}, once:{}, testimony:[], later:[], log:[], knownWords:new Set(['асан','нурбеков']) };
function remember(text){ memory.log.push(text); toast(text); }
// Асан записывает слово так, как слышит, школьной латиницей, и рядом пишет смысл по-казахски
const LAT={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'jo',ж:'ƶ',з:'z',и:'i',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'c',ш:'ş',щ:'ş',ъ:'',ы:'ь',ь:'',э:'e',ю:'ju',я:'ja'};
function toLat(w){ return [...w.toLowerCase()].map(c=>LAT[c]??c).join(''); }
// ярус слова: base — для всех, extra — средний и сложный, deep — только сложный
const WORD_TIER={base:0, extra:1, deep:2}, LEVEL_RANK={easy:0, normal:1, hard:2};
// слова, которые в казахском те же, что в русском: Асан их понимает сразу, учить их незачем
const COGNATES = new Set(['диск','ракета','гвардия','пулемёт','танк','автомат','командир','солдат','взвод','рота','батальон','сержант','лейтенант','капитан','майор','полковник','генерал','радио','машина','вагон','эшелон','партизан','партизаны','фронт','газета','политрук','комиссар','штаб','бомба','граната','мина','снаряд','самолёт','трактор','колхоз','совхоз','райком','телефон','телеграмма','госпиталь','медсанбат','лагерь','пистолет','винтовка','патрон','патроны','окоп']);
async function noteWord(ru, kz, where, tier='base'){
  if(COGNATES.has(String(ru).toLowerCase())){ memory.knownWords.add(ru); return; }
  if(memory.notebook.some(n=>n.ru===ru)) return;
  if((WORD_TIER[tier]||0) > (LEVEL_RANK[memory.difficulty||'normal']||0)) return; // на этом уровне слово остаётся шумом
  // мини-игра: записать слово в блокнот, собрав его по кусочкам
  if(typeof wordWriteGame==='function') await wordWriteGame(ru, kz, where);
  memory.notebook.push({ru, lat:toLat(ru), kz, where}); memory.knownWords.add(ru);
  $('nbBtn').style.display='block';
}
// немецкое слово: собрать его по-немецки; дальше в речи охраны оно читается
async function noteDe(de, ru, kz, where, tier='base'){
  const key=de.toLowerCase();
  if(memory.notebook.some(n=>n.de===key)) return;
  if((WORD_TIER[tier]||0) > (LEVEL_RANK[memory.difficulty||'normal']||0)) return;
  if(!memory.knownWords.has(key) && typeof wordWriteGame==='function') await wordWriteGame(ru, kz, where, {target:de});
  memory.notebook.push({ru:de+' — '+ru, de:key, lat:de, kz, where}); key.split(/\s+/).forEach(w=>memory.knownWords.add(w));
  $('nbBtn').style.display='block';
}
function diary(text){ memory.diary.push(text); $('nbBtn').style.display='block'; }
// раненый не пишет: эти записи появятся позже, когда будет спокойно
function later(text){ memory.later.push(text); }
function testify(topic, value, where){ addTestimony(memory.testimony, topic, value, where); }
// Блокнот листается: обложка, записи вперемешку со всякой всячиной (счёт, рисунки, прописи), потом слова
const NB_JUNK = [
  {after:0, html:`<div class="hand">Курт — 14<br>Баурсак — 9<br>Талқан — бір қап<br><s>Шай — 2</s> шай — 1<br><br>Жүмекеңе — 3 курт</div><div class="doodle">${'<svg viewBox="0 0 160 90" width="160"><path d="M20 70 Q30 40 55 42 Q70 30 90 38 Q120 34 128 50 L140 46 L136 58 Q130 66 120 66 L118 84 M112 66 L110 84 M60 64 L58 84 M48 62 L44 84 M24 66 Q14 70 12 60" fill="none" stroke="#3a3024" stroke-width="2" stroke-linecap="round"/><path d="M128 50 Q134 40 140 46" fill="none" stroke="#3a3024" stroke-width="2"/></svg>'}<div class="sm">Сары — отцовский. Не похож.</div></div>`},
  {after:1, html:`<div class="hand big">А Б В Г Д Е Ж З И Й К<br><s>Л М Н</s> Л М Н О П Р С Т<br>У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я</div><div class="hand">мама мама мама<br>хлеб хлеп хлеб<br>Нурбеков Нурбеков Нурбеков</div>`},
  {after:2, html:`<div class="hand">|||| |||| |||| |||| ||||<br>|||| |||| |||| ||</div><div class="sm">дни. Потом сбился.</div><div class="hand">Ақмола облысы, ауыл…<br>Нұрбеков Сапарға</div>`},
  {after:3, html:`<div class="doodle"><svg viewBox="0 0 160 110" width="150"><path d="M80 10 L30 100 L130 100 Z" fill="none" stroke="#3a3024" stroke-width="2"/><path d="M80 24 L42 92 L118 92 Z" fill="none" stroke="#3a3024" stroke-width="1" stroke-dasharray="3 3"/><circle cx="80" cy="66" r="6" fill="none" stroke="#3a3024"/></svg></div><div class="hand">тумар. апа шила 3 дня.</div><div class="hand"><s>Ертең хат жазам</s></div>`},
  {after:5, ch:5, html:`<div class="hand">eins zwei drei vier<br>fünf sechs sieben acht<br>Brot = нан<br>Wasser = су<br>Schnell = тез</div><div class="sm">Мударис говорит: не учи слишком хорошо — заметят.</div>`}
];
let nbPage=0;
function nbPages(){
  const pages=[];
  pages.push(`<div class="cover"><div class="t">Блокнот</div><div class="hand">Асан Нұрбеков</div><div class="sm">1942</div></div>`);
  const D=memory.diary, chunk=5; let ji=0;
  for(let i=0;i<D.length;i+=chunk){
    pages.push('<h2>Записи</h2><div class="diary">'+D.slice(i,i+chunk).map(d=>`<div>${escapeHtml(d)}</div>`).join('')+'</div>');
    const idx=i/chunk; while(ji<NB_JUNK.length && NB_JUNK[ji].after<=idx){ if((NB_JUNK[ji].ch||0)<=(memory.lastSummary||0)) pages.push(NB_JUNK[ji].html); ji++; }
  }
  if(!D.length) pages.push(NB_JUNK[0].html);
  const byWhere={}; memory.notebook.forEach(n=>{ (byWhere[n.where]=byWhere[n.where]||[]).push(n); });
  let page='<h2>Слова, которые я знаю</h2>', lines=1;
  if(!memory.notebook.length) page+='<div class="empty">Пока ни одного.</div>';
  for(const [where,list] of Object.entries(byWhere)){
    const need=1+Math.ceil(list.length/2);
    if(lines+need>11){ pages.push(page); page='<h2>Слова</h2>'; lines=1; }
    page+=`<div class="src">${escapeHtml(where)}</div><div class="w">`+list.map(n=>`<span class="lat">${escapeHtml(n.lat)}</span><span class="kz">${escapeHtml(n.kz)}</span>`).join('')+'</div>'; lines+=need;
  }
  pages.push(page+'<div class="close">Русские слова Асан пишет школьной латиницей, как слышит, а рядом — смысл по-казахски.</div>');
  return pages;
}
function renderNb(dir){
  const P=nbPages(); nbPage=Math.max(0,Math.min(P.length-1,nbPage));
  const sh=$('nbSheet'); sh.classList.remove('turnL','turnR'); void sh.offsetWidth; if(dir) sh.classList.add(dir>0?'turnL':'turnR');
  sh.innerHTML=`<div class="pg">${P[nbPage]}</div><div class="nbNav"><button type="button" class="nbPrev"${nbPage?'':' disabled'}>‹</button><span>${nbPage+1} / ${P.length}</span><button type="button" class="nbNext"${nbPage<P.length-1?'':' disabled'}>›</button><button type="button" class="nbX">Закрыть</button></div>`;
  sh.querySelector('.nbPrev').onclick=e=>{ e.stopPropagation(); nbFlip(-1); };
  sh.querySelector('.nbNext').onclick=e=>{ e.stopPropagation(); nbFlip(1); };
  sh.querySelector('.nbX').onclick=e=>{ e.stopPropagation(); closeNotebook(); };
}
function nbFlip(d){ const n=nbPages().length; const to=Math.max(0,Math.min(n-1,nbPage+d)); if(to===nbPage) return; nbPage=to; if(typeof sfx!=='undefined' && sfx.paper) sfx.paper(); renderNb(d); }
function openNotebook(){ $('nb').style.display='flex'; renderNb(0); }
function closeNotebook(){ $('nb').style.display='none'; }
if(typeof window!=='undefined' && typeof document!=='undefined'){
  addEventListener('keydown',e=>{ const nb=document.getElementById('nb'); if(!nb || nb.style.display!=='flex') return; if(e.code==='ArrowRight'||e.code==='KeyD'){ e.stopPropagation(); nbFlip(1); } else if(e.code==='ArrowLeft'||e.code==='KeyA'){ e.stopPropagation(); nbFlip(-1); } }, true);
  let sx=null; addEventListener('pointerdown',e=>{ if(e.target.closest && e.target.closest('#nbSheet')) sx=e.clientX; },true);
  addEventListener('pointerup',e=>{ if(sx===null) return; const dx=e.clientX-sx; sx=null; if(Math.abs(dx)>50) nbFlip(dx<0?1:-1); },true);
}

// Данные глав: тексты и сценарии лежат в data/*.json
const DATA = {};
async function loadData(){
  const ids = { ch1:'data/ch01.json', ch2:'data/ch02.json', ch3:'data/ch03.json', ch4:'data/ch04.json', ch5:'data/ch05.json', ch1b:'data/ch01b.json', ch5b:'data/ch05b.json', ch6:'data/ch06.json', ch7:'data/ch07.json', ch8:'data/ch08.json', endings:'data/endings.json', interludes:'data/interludes.json', decisions:'data/decisions.json', chronicle:'data/chronicle.json' };
  for(const [k,url] of Object.entries(ids)){ const r = await fetch(url, {cache:'no-cache'}); if(!r.ok) throw new Error('Не загрузились данные '+url); DATA[k] = await r.json(); }
}
// Сценарий главы, подключённый к интерфейсу; hooks — крючки в код сцены
function makeRunner(hooks){
  return createRunner({ say, choose, close:closeDlg, memory, remember, diary, later, toast, word:noteWord, deWord:noteDe, testify, hooks, wait, think, caption, beat });
}
function fillObj(tpl, vars){ return String(tpl).replace(/\{(\w+)\}/g, (_,k)=>vars[k]); }
