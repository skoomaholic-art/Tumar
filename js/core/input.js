'use strict';
// Клавиатура
// ---------- ввод ----------
const keys = {};
addEventListener('keydown', e=>{
  keys[e.code]=true;
  if(e.code==='KeyN' && (memory.notebook.length||memory.diary.length)){ $('nb').style.display==='flex' ? closeNotebook() : openNotebook(); return; }
  if(e.code==='Escape') closeNotebook();
  if(e.code==='Space'||e.code==='Enter'){ if(dlgOpen) advance(); }
  if(choose.slots && choose.pick){
    const pos = ({ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'bottom',KeyS:'bottom'})[e.code];
    if(pos && choose.slots[pos]!==undefined){ choose.pick(choose.slots[pos]); return; }
  }
  if(active && active.onKey) active.onKey(e.code, true);
});
addEventListener('keyup', e=>{ keys[e.code]=false; if(active && active.onKey) active.onKey(e.code,false); });
