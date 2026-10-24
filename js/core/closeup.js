'use strict';
// Крупные планы в диалогах, как у Telltale: говорящий появляется рисованным портретом по пояс,
// Асан справа (смотрит влево), собеседник слева (смотрит вправо) — «восьмёрка» из кино.
// Картинки: img/por/<герой>_<одежда>_<эмоция>.webp (прозрачный фон). Пока картинки нет — портрет не показывается.
const CAST_KEY = { 'Асан':'asan', 'Отец':'father', 'Мать':'mother', 'Күләш':'kulash', 'Жумабай':'zhumabai',
  'Колесников':'kolesnikov', 'Семён':'semyon', 'Гриша':'grisha', 'Мударис':'mudaris', 'Ибрай-ага':'ibray',
  'Хайдар-бек':'haidar', 'Марта':'marta', 'Лизль':'lisl', 'Дубровин':'dubrovin', 'Ракитин':'rakitin', 'Синицын':'sinitsyn',
  'Политрук':'politruk', 'Волков':'volkov', 'Сашко':'sashko', 'Всадник':'rider' };
// одежда по главам: у Асана и Жумабая она меняется, у остальных одна
let CAST_SET = 'aul';
const COSTUME = { asan:{aul:'aul', army:'army', pow:'pow', farm:'farm', filtr:'pow'}, zhumabai:{aul:'aul', army:'army', filtr:'filtr'} };
const PORTRAIT_ART = new Set(); // имена файлов, которые реально есть (img/por/list.json)
let closeupSide = null;
fetch('img/por/list.json',{cache:'no-cache'}).then(r=>r.ok?r.json():[]).then(a=>a.forEach(n=>PORTRAIT_ART.add(n))).catch(()=>{});
function portraitFile(who, emo){
  const k=CAST_KEY[who]; if(!k) return null;
  const c = COSTUME[k] ? (COSTUME[k][CAST_SET] || Object.values(COSTUME[k])[0]) : null;
  const base = c ? `${k}_${c}` : k;
  for(const e of [emo||'neutral','neutral','sad','think','smile','angry']){ /* нет нужной эмоции — ближайшая из нарисованных */ const n=`${base}_${e}`; if(PORTRAIT_ART.has(n)) return `img/por/${n}.webp`; }
  return null;
}
function showCloseup(who, emo){
  const el=$('closeup'); if(!el) return false;
  if(emo==='off'){ hideCloseup(); return false; } // голос из-за кадра — без портрета
  const src = SETTINGS.closeups===false ? null : portraitFile(who, emo);
  // у говорящего портрета пока нет: на экране остаётся слушающий (в тени), а не мигает пустота
  if(!src){ if(closeupSide) el.querySelectorAll('img').forEach(i=>i.classList.remove('talk')); return false; }
  const side = who==='Асан' ? 'right' : 'left';
  const img = el.querySelector('img.'+side), other = el.querySelector('img.'+(side==='left'?'right':'left'));
  img.dataset.k = CAST_KEY[who]||''; // дети ниже ростом: Күләш стоит ниже в кадре
  if(img.getAttribute('src')!==src){ img.classList.remove('on'); img.src=src; void img.offsetWidth; }
  img.classList.add('on','talk'); other.classList.remove('talk'); // молчащий собеседник остаётся в кадре, но в тени
  el.classList.add('on'); closeupSide=side; document.body.classList.add('closeup');
  return true;
}
function hideCloseup(){ const el=$('closeup'); if(!el) return; el.classList.remove('on'); el.querySelectorAll('img').forEach(i=>i.classList.remove('on','talk')); closeupSide=null; document.body.classList.remove('closeup'); }
