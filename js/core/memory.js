'use strict';
// Память игры: выборы, записи, слова блокнота
// Память персонажей — то, что игра запоминает о выборах игрока
// flags — сюжетные флаги, relations — отношение персонажей к Асану, testimony — показания для допросов
let memory = { diary:[], notebook:[], flags:{}, relations:{}, once:{}, testimony:[], later:[], log:[], knownWords:new Set(['асан','нурбеков']) };
function remember(text){ memory.log.push(text); toast(text); }
// Асан записывает слово так, как слышит, школьной латиницей, и рядом пишет смысл по-казахски
const LAT={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'jo',ж:'ƶ',з:'z',и:'i',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'c',ш:'ş',щ:'ş',ъ:'',ы:'ь',ь:'',э:'e',ю:'ju',я:'ja'};
function toLat(w){ return [...w.toLowerCase()].map(c=>LAT[c]??c).join(''); }
function noteWord(ru, kz, where){
  if(memory.notebook.some(n=>n.ru===ru)) return;
  memory.notebook.push({ru, lat:toLat(ru), kz, where}); memory.knownWords.add(ru);
  $('nbBtn').style.display='block';
}
function diary(text){ memory.diary.push(text); $('nbBtn').style.display='block'; }
// раненый не пишет: эти записи появятся позже, когда будет спокойно
function later(text){ memory.later.push(text); }
function testify(topic, value, where){ addTestimony(memory.testimony, topic, value, where); }
function openNotebook(){
  const byWhere={}; memory.notebook.forEach(n=>{ (byWhere[n.where]=byWhere[n.where]||[]).push(n); });
  let html='';
  if(memory.diary.length) html+='<h2>Записи</h2><div class="diary">'+memory.diary.map(d=>`<div>${escapeHtml(d)}</div>`).join('')+'</div>';
  html+='<h2>Слова, которые я знаю</h2>';
  if(!memory.notebook.length) html+='<div class="empty">Пока ни одного.</div>';
  for(const [where,list] of Object.entries(byWhere)){
    html+=`<div class="src">${escapeHtml(where)}</div><div class="w">`+list.map(n=>`<span class="lat">${escapeHtml(n.lat)}</span><span class="kz">${escapeHtml(n.kz)}</span>`).join('')+'</div>';
  }
  html+='<div class="close">Асан записывает русские слова школьной латиницей, как слышит, а рядом — смысл по-казахски. Нажми, чтобы закрыть.</div>';
  $('nbSheet').innerHTML=html; $('nb').style.display='flex';
}
function closeNotebook(){ $('nb').style.display='none'; }

// Данные глав: тексты и сценарии лежат в data/*.json
const DATA = {};
async function loadData(){
  const ids = { ch1:'data/ch01.json', ch2:'data/ch02.json', ch3:'data/ch03.json', ch4:'data/ch04.json', ch5:'data/ch05.json', ch1b:'data/ch01b.json', ch5b:'data/ch05b.json', chronicle:'data/chronicle.json' };
  for(const [k,url] of Object.entries(ids)){ const r = await fetch(url); if(!r.ok) throw new Error('Не загрузились данные '+url); DATA[k] = await r.json(); }
}
// Сценарий главы, подключённый к интерфейсу; hooks — крючки в код сцены
function makeRunner(hooks){
  return createRunner({ say, choose, close:closeDlg, memory, remember, diary, later, toast, word:noteWord, testify, hooks, wait });
}
function fillObj(tpl, vars){ return String(tpl).replace(/\{(\w+)\}/g, (_,k)=>vars[k]); }
