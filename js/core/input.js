'use strict';
// Клавиатура
// ---------- ввод ----------
const keys = {};
addEventListener('keydown', e=>{
  keys[e.code]=true;
  // автоповтор зажатой клавиши не должен листать реплики и выбирать варианты
  if(e.repeat){ if(active && active.onKey) active.onKey(e.code, true); return; }
  if(e.code==='KeyN' && (memory.notebook.length||memory.diary.length)){ $('nb').style.display==='flex' ? closeNotebook() : openNotebook(); return; }
  if(e.code==='Escape') closeNotebook();
  if(e.code==='Space'||e.code==='Enter'){ if(dlgOpen) advance(); }
  if(choose.slots && choose.pick && performance.now()-(choose.shownAt||0) > 450){
    const pos = ({ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'bottom',KeyS:'bottom'})[e.code];
    if(pos && choose.slots[pos]!==undefined){ choose.pick(choose.slots[pos]); return; }
  }
  if(active && active.onKey) active.onKey(e.code, true);
});
addEventListener('keyup', e=>{ keys[e.code]=false; if(active && active.onKey) active.onKey(e.code,false); });
// окно потеряло фокус — все клавиши считаем отпущенными, иначе герой уходит сам
addEventListener('blur', ()=>{ for(const k in keys) if(keys[k]){ keys[k]=false; if(active && active.onKey) active.onKey(k,false); } });
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) for(const k in keys) keys[k]=false; });

// Движение от камеры: W — «от зрителя», D — «вправо по экрану». Направление берётся с камеры в момент,
// когда игрок начал идти, и держится, пока клавиши зажаты: после склейки на другой ракурс герой
// не разворачивается сам. Отпустил и нажал снова — направление уже от нового кадра.
const MoveRef = { yaw:null, combo:'' };
function moveInput(){
  let ix=0, iz=0;
  if(keys.KeyW||keys.ArrowUp) iz-=1; if(keys.KeyS||keys.ArrowDown) iz+=1;
  if(keys.KeyA||keys.ArrowLeft) ix-=1; if(keys.KeyD||keys.ArrowRight) ix+=1;
  if(typeof JOY!=='undefined' && JOY.on){ ix=JOY.x; iz=JOY.y; } // джойстик на телефоне: вверх — от зрителя
  if(!ix && !iz){ MoveRef.yaw=null; return [0,0]; }
  if(MoveRef.yaw===null){ const d=new THREE.Vector3(); camera.getWorldDirection(d); MoveRef.yaw = Math.hypot(d.x,d.z)>.05 ? Math.atan2(d.x,d.z) : Math.PI; }
  const fx=Math.sin(MoveRef.yaw), fz=Math.cos(MoveRef.yaw); // вперёд по земле; вправо = (-fz, fx)
  let mx = fx*(-iz) + (-fz)*ix, mz = fz*(-iz) + fx*ix; const l=Math.hypot(mx,mz)||1;
  return [mx/l, mz/l];
}
