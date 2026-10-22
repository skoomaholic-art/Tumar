'use strict';
// Сохранения: только локально (localStorage), формат с версией.
// Сохраняемся в начале и в конце главы, не посреди сцен.
const SAVE_KEY = 'tumar-save';
const SAVE_VERSION = 1;

function serializeMemory(m){
  return Object.assign({}, m, { knownWords:[...m.knownWords] });
}
function deserializeMemory(o){
  const base = { diary:[], notebook:[], flags:{}, relations:{}, once:{}, testimony:[], later:[], log:[], knownWords:['асан','нурбеков'] };
  const m = Object.assign(base, o||{});
  m.knownWords = new Set(m.knownWords);
  return m;
}
// кроме последнего сохранения — снимок начала каждой пройденной главы: можно начать с любой
const CH_KEY = 'tumar-chapters';
function saveGame(chapter){
  try{
    const snap = { v:SAVE_VERSION, chapter, at:Date.now(), memory:serializeMemory(memory) };
    localStorage.setItem(SAVE_KEY, JSON.stringify(snap));
    let all={}; try{ all=JSON.parse(localStorage.getItem(CH_KEY)||'{}')||{}; }catch(_){}
    all[chapter]=snap; localStorage.setItem(CH_KEY, JSON.stringify(all));
    return true;
  }catch(e){ return false; }
}
function loadChapters(){
  const out={};
  try{ const all=JSON.parse(localStorage.getItem(CH_KEY)||'{}')||{}; for(const [k,s] of Object.entries(all)) if(s && s.memory) out[k]={ chapter:k, at:s.at, memory:deserializeMemory(s.memory) }; }catch(_){}
  const last=loadGame(); if(last && !out[last.chapter]) out[last.chapter]=last;
  return out;
}
function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY); if(!raw) return null;
    const s = JSON.parse(raw); if(!s || !s.chapter) return null;
    // старые версии дополняются значениями по умолчанию в deserializeMemory
    return { chapter:s.chapter, memory:deserializeMemory(s.memory) };
  }catch(e){ return null; }
}
function deleteSave(){ try{ localStorage.removeItem(SAVE_KEY); localStorage.removeItem(CH_KEY); }catch(e){} }
