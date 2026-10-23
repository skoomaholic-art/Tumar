'use strict';
// Концовки: «Загон» (A), «Забой» (B), «Чужой берег» (C). Комикс-страница, финальный кадр — загон с тумаром из меню.
// A — дома: пометок мало, о легионе правда (или не подписывал), о Жумабае правда.
// C — остался на Западе в главе 7. Иначе — B.
function endingKind(){
  const f=memory.flags;
  if(f.goHome===false) return 'C';
  const marks=f.marks||0, legionOk = f.legion!=='signed' || f.legionConfessed;
  return (marks<=2 && legionOk && f.zhumAns==='truth') ? 'A' : 'B';
}
async function playEnding(kind){
  const E=DATA.endings[kind], fl=memory.flags;
  fl.lislTogether = !!(fl.lislNear && !fl.lislFar); // «вместе» — если брал Лизль за руку и не отдалился
  const pick=x=> x.if ? (evalCond(x.if, fl) ? x.text : x.else) : x.text;
  setObj('',''); $('fade').style.transitionDuration='0ms'; $('fade').style.opacity=1;
  await showCard('Концовка', E.title, '', 'Дальше');
  const pickImg=x=> x.if && !evalCond(x.if, fl) ? (x.elseImg||x.img) : x.img;
  await showComic(E.panels.map(p=>({art:p.art, text:pick(p), img:pickImg(p)})).filter(p=>p.text));
  // последний кадр — загон: жердь, тумар на ветру, барашки (в C — тоже: тумар туда вернулся письмом)
  active=sceneMenu(); active.begin && active.begin();
  await fadeTo(0,1600);
  await showCard('', E.title, E.final.map(pick).filter(Boolean).map(t=>`<span style="display:block;margin:6px 0">${escapeHtml(t)}</span>`).join(''), 'Дальше');
  $('card').classList.add('ded');
  await showCard('', 'TUMAR', `<span style="display:block;max-width:560px;margin:0 auto;font-size:18px;line-height:1.6">${escapeHtml(DATA.endings.dedication)}</span>`, 'Дальше', DATA.endings.dedicationImg);
  $('card').classList.remove('ded');
  memory.flags.ending=kind;
}
