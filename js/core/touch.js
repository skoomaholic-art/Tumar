'use strict';
// Сенсорное управление.
// · Левая часть экрана: плавающий джойстик — где коснулся, там и центр. Ведёт героя от камеры (как WASD).
//   Короткое касание без сдвига уходит в игру как обычное «иди сюда / сделай».
// · Правая часть: касание — идти туда или действовать; в поле — тянуть пальцем, чтобы осмотреться.
// · Кнопка действия справа внизу появляется сама, когда рядом есть что сделать, и подписана.
// · Пока открыт диалог — касание в любом месте листает реплику.
// Сцена включает джойстик, отдавая wantsJoy() === true; подпись кнопки — touchAction() → строка или null.
const JOY = { on:false, x:0, y:0, id:null, cx:0, cy:0, t0:0, moved:false };
(function setupTouch(){
  if(!isTouch) return;
  const zone = document.createElement('div'); zone.id='joyZone';
  const base = document.createElement('div'); base.id='joyBase';
  const knob = document.createElement('div'); knob.id='joyKnob'; base.appendChild(knob);
  document.body.append(zone, base);
  const R = 52; // радиус хода ручки, px
  zone.addEventListener('pointerdown', e=>{
    if(JOY.id!==null) return;
    JOY.id=e.pointerId; JOY.cx=e.clientX; JOY.cy=e.clientY; JOY.t0=performance.now(); JOY.moved=false; JOY.x=JOY.y=0;
    zone.setPointerCapture(e.pointerId);
    base.style.left=(e.clientX-R-14)+'px'; base.style.top=(e.clientY-R-14)+'px'; base.style.display='block'; knob.style.transform='translate(0,0)';
    e.preventDefault();
  });
  zone.addEventListener('pointermove', e=>{
    if(e.pointerId!==JOY.id) return;
    let dx=e.clientX-JOY.cx, dy=e.clientY-JOY.cy; const d=Math.hypot(dx,dy);
    if(d>10) JOY.moved=true;
    if(d>R){ dx*=R/d; dy*=R/d; }
    knob.style.transform=`translate(${dx}px,${dy}px)`;
    const m=Math.min(1,d/R); JOY.on = JOY.moved && m>.18; JOY.x=dx/R; JOY.y=dy/R;
  });
  const end = e=>{
    if(e.pointerId!==JOY.id) return;
    const tap = !JOY.moved && performance.now()-JOY.t0 < 300;
    JOY.id=null; JOY.on=false; JOY.x=JOY.y=0; base.style.display='none';
    // короткое касание — в игру, как будто коснулись самого кадра
    if(tap){ if(dlgOpen){ advance(); return; } canvas.dispatchEvent(new PointerEvent('pointerdown',{clientX:e.clientX, clientY:e.clientY, pointerId:e.pointerId, bubbles:true, pointerType:'touch'})); canvas.dispatchEvent(new PointerEvent('pointerup',{clientX:e.clientX, clientY:e.clientY, pointerId:e.pointerId, bubbles:true, pointerType:'touch'})); }
  };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);

  // диалог: касание по кадру листает реплику
  canvas.addEventListener('pointerdown', ()=>{ if(dlgOpen) advance(); }, true);

  // показывать джойстик и кнопку действия, когда сцена этого хочет
  const act = $('tAct');
  (function poll(){
    const want = !!(active && active.wantsJoy && active.wantsJoy()) && !dlgOpen;
    zone.style.display = want ? 'block' : 'none';
    if(!want && JOY.id!==null){ JOY.id=null; JOY.on=false; base.style.display='none'; }
    if(active && active.touchAction){
      const label = dlgOpen ? null : active.touchAction();
      if(label){ act.textContent=label; act.classList.add('ctx'); $('touch').style.display='flex'; act.style.display=''; $('tCrawl').style.display='none'; }
      else if(act.classList.contains('ctx')){ act.classList.remove('ctx'); $('touch').style.display='none'; }
    }
    requestAnimationFrame(poll);
  })();
})();
