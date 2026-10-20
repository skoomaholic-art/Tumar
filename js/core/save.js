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
function saveGame(chapter){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v:SAVE_VERSION, chapter, at:Date.now(), memory:serializeMemory(memory) }));
    return true;
  }catch(e){ return false; }
}
function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY); if(!raw) return null;
    const s = JSON.parse(raw); if(!s || !s.chapter) return null;
    // старые версии дополняются значениями по умолчанию в deserializeMemory
    return { chapter:s.chapter, memory:deserializeMemory(s.memory) };
  }catch(e){ return null; }
}
function deleteSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
