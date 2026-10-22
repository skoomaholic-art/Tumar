'use strict';
// Хроника между главами: карта на старой бумаге, линия пути Асана от аула, линия фронта на дату,
// и несколько сухих строк — где мы, когда и как сюда попали. Данные — data/chronicle.json.

// Проекция: долгота 34…52°, широта 46…56,5°, сжатие по долготе cos(51°) — карта 1000×930.
// Акмолинск далеко за правым краем: путь из него входит в карту с края, с подписью.
// две карты: восток (Россия, 34…52° в.д.) и запад (Европа, 10…24° в.д.) — та же бумага, своя проекция
const PROJ = { east:{lon0:34, lat0:56.5, kx:55.6, ky:88.2}, west:{lon0:10, lat0:54.5, kx:71.4, ky:111} };
let P = PROJ.east;
const MAPX = lon => (lon-P.lon0)*P.kx, MAPY = lat => (P.lat0-lat)*P.ky, MAP_W=1000, MAP_H=930;
// [широта, долгота, подпись, сдвиг подписи x, y, выравнивание]
const PLACES = {
  akmolinsk:[51.17,71.43,'Акмолинск'], orenburg:[51.77,55.10,'Оренбург'], kuibyshev:[53.20,50.15,'Куйбышев',12,-10],
  tula:[54.20,37.62,'Тула',12,-10], moscow:[55.75,37.62,'Москва',12,-10], voronezh:[51.67,39.20,'Воронеж',14,6],
  kalach:[48.69,43.53,'Калач',-28,-14,'end'], stalingrad:[48.71,44.51,'Сталинград',14,8], kursk:[51.73,36.19,'Курск',-12,-10,'end'],
  belgorod:[50.60,36.59,'Белгород',-12,-8,'end'], shebekino:[50.41,36.90,'Шебекино',12,22], rostov:[47.23,39.72,'Ростов',12,-10],
  // запад
  stalag:[51.20,19.10,'шталаг',12,-10], krakow:[50.06,19.94,'Краков',12,22], berlin:[52.52,13.40,'Берлин',12,-10], wien:[48.21,16.37,'Вена',12,22],
  linz:[48.31,14.29,'Линц',-12,22,'end'], muhl:[48.50,14.50,'Мюльфиртель',12,-12], enns:[48.21,14.48,'мост на Энсе',12,26], plattling:[48.78,12.87,'Платтлинг',-12,-10,'end'], munich:[48.14,11.58,'Мюнхен',-12,22,'end']
};
const RIVERS = [
  ['Волга', [[56.3,44.0],[55.8,49.1],[54.3,48.4],[53.2,50.1],[52.0,47.8],[51.5,46.0],[50.1,45.4],[48.7,44.5],[47.5,46.5],[46.35,48.0],[45.8,47.9]], 6],
  ['Дон', [[53.9,38.1],[53.0,38.9],[52.0,39.2],[51.0,39.4],[50.4,40.4],[49.7,41.6],[49.4,43.0],[48.7,43.5],[48.0,42.4],[47.6,41.0],[47.2,39.7],[47.1,39.2]], 5],
  ['Сев. Донец', [[51.0,36.5],[50.4,36.9],[49.8,37.3],[49.2,37.6],[48.9,38.5],[48.6,39.8],[48.0,40.5],[47.6,40.9]], 3],
  ['Урал', [[51.2,58.6],[51.6,55.0],[51.3,51.4],[49.5,51.9],[47.1,51.9]], 2]
];
const RIVERS_W = [
  ['Дунай', [[48.0,10.0],[48.4,11.0],[48.9,11.9],[48.8,12.9],[48.6,13.5],[48.3,14.3],[48.2,15.2],[48.2,16.4],[47.9,17.4],[47.7,18.8],[47.5,19.1]], 5],
  ['Висла', [[49.6,19.0],[50.0,19.9],[50.4,21.2],[51.4,21.9],[52.2,21.0],[52.6,19.5],[53.1,18.5],[54.3,18.9]], 4],
  ['Эльба', [[50.6,14.0],[51.0,13.6],[51.8,12.2],[52.6,11.9],[53.5,10.0]], 3]
];
const CASPIAN = [[47.0,47.5],[46.6,49.4],[46.9,51.5],[46.3,53.2],[45.0,53.0],[45.0,47.6],[45.9,47.0]];
const FRONTS = {
  jul42: [[52.6,37.6],[51.7,39.0],[50.9,39.6],[50.1,40.0],[49.4,40.9],[48.6,41.5],[47.8,40.6],[47.3,39.4]],
  nov42: [[52.2,37.9],[51.7,39.1],[50.6,40.3],[49.9,41.6],[49.5,43.0],[48.9,44.3],[48.6,44.6],[48.0,44.7],[47.4,44.3],[46.6,44.8]],
  jul43: [[53.2,34.6],[52.4,35.3],[52.2,36.6],[51.6,37.7],[51.0,37.5],[50.6,36.7],[50.3,36.95],[49.6,37.3],[48.8,38.0],[47.4,38.9]]
};
const pt = ([la,lo]) => `${MAPX(lo).toFixed(1)},${MAPY(la).toFixed(1)}`;
const placePt = k => pt(PLACES[k]);

function chronicleSVG(c){
  P = PROJ[c.region||'east']; const RV = c.region==='west' ? RIVERS_W : RIVERS;
  const rivers = RV.map(([n,pts,w])=>`<polyline points="${pts.map(pt).join(' ')}" fill="none" stroke="#4d5a62" stroke-width="${w*.9}" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>`).join('');
  const riverLabels = RV.filter(r=>r[0]!=='Урал').map(([n,pts])=>{ const p=pts[Math.floor(pts.length/2)]; return `<text x="${MAPX(p[1])+14}" y="${MAPY(p[0])}" class="ch-river">${n}</text>`; }).join('');
  const sea = c.region==='west' ? '' : `<polygon points="${CASPIAN.map(pt).join(' ')}" fill="#9fb0b4" opacity=".35" stroke="#4d5a62" stroke-width="1.2"/><text x="${MAPX(47.6)}" y="${MAPY(46.25)}" class="ch-river">Каспийское море</text>`;
  const front = c.front && FRONTS[c.front] ? `<polyline class="ch-front" points="${FRONTS[c.front].map(pt).join(' ')}"/><text x="${MAPX(FRONTS[c.front][0][1])+10}" y="${MAPY(FRONTS[c.front][0][0])+4}" class="ch-frontlbl">линия фронта</text>` : '';
  const towns = (c.towns||[]).map(k=>{ const [la,lo,n]=PLACES[k]; const x=MAPX(lo), y=MAPY(la);
    const [,,,dx=12,dy=-10,an='start']=PLACES[k];
    return `<circle cx="${x}" cy="${y}" r="6" fill="#2b241c"/><text x="${x+dx}" y="${y+dy}" text-anchor="${an}" class="ch-town">${n}</text>`; }).join('');
  // путь начинается за краем карты — подпись у края
  const far = [...(c.past||[]), ...c.route].includes('akmolinsk') ? `<text x="${MAP_W-14}" y="368" text-anchor="end" class="ch-far">в Акмолинск →</text><text x="${MAP_W-14}" y="394" text-anchor="end" class="ch-far">2 600 км</text>` : '';
  const done = (c.past||[]).length>1 ? `<polyline class="ch-past" points="${c.past.map(placePt).join(' ')}"/>` : '';
  const leg = `<polyline class="ch-leg" id="chLeg" points="${c.route.map(placePt).join(' ')}"/>`;
  const end = PLACES[c.route[c.route.length-1]];
  const here = `<g id="chHere" opacity="0"><circle cx="${MAPX(end[1])}" cy="${MAPY(end[0])}" r="16" fill="none" stroke="#8e1f1a" stroke-width="4"><animate attributeName="r" values="12;24;12" dur="2.2s" repeatCount="indefinite"/></circle></g>`;
  return `<svg viewBox="0 0 ${MAP_W} ${MAP_H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><pattern id="chHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#2b241c" stroke-width="1"/></pattern></defs>
    ${sea}${rivers}${riverLabels}${front}${done}${leg}${towns}${far}${here}
    <line x1="20" y1="${MAP_H-24}" x2="${20+MAPX(34+200/70)-MAPX(34)}" y2="${MAP_H-24}" stroke="#2b241c" stroke-width="3"/><text x="20" y="${MAP_H-36}" class="ch-scale">200 км</text>
  </svg>`;
}

function showChronicle(key){
  const c = DATA.chronicle && DATA.chronicle[key];
  if(!c) return Promise.resolve();
  return new Promise(res=>{
    let el=$('chron'); if(!el){ el=document.createElement('div'); el.id='chron'; document.body.appendChild(el); }
    el.innerHTML = `<div class="ch-map">${chronicleSVG(c)}</div>
      <div class="ch-text"><div class="ch-date">${escapeHtml(c.date)}</div><div class="ch-place">${escapeHtml(c.place)}</div>
      <div class="ch-lines">${c.lines.map(l=>`<p>${escapeHtml(l)}</p>`).join('')}</div>
      <button class="btn ch-next" style="visibility:hidden">Дальше</button></div>`;
    el.style.display='flex'; requestAnimationFrame(()=>el.classList.add('on'));
    const leg = el.querySelector('#chLeg'), len = leg.getTotalLength ? leg.getTotalLength() : 600;
    leg.style.strokeDasharray = `${len}`; leg.style.strokeDashoffset = `${len}`;
    const ps=[...el.querySelectorAll('.ch-lines p')], btn=el.querySelector('.ch-next');
    let t0=null, done=false; const T=Math.max(2.6, len/220);
    // линия пути рисуется, затем по одной проступают строки; любое нажатие — показать всё сразу
    function frame(now){ if(done) return; if(t0===null) t0=now; const k=(now-t0)/1000;
      leg.style.strokeDashoffset = `${len*(1-Math.min(1,k/T))}`;
      if(k>T) el.querySelector('#chHere').setAttribute('opacity','1');
      ps.forEach((p,i)=>{ if(k>.8+i*1.5) p.classList.add('on'); });
      if(k>.8+ps.length*1.5){ finishAnim(); return; }
      requestAnimationFrame(frame); }
    function finishAnim(){ done=true; leg.style.strokeDashoffset='0'; el.querySelector('#chHere').setAttribute('opacity','1'); ps.forEach(p=>p.classList.add('on')); btn.style.visibility='visible'; }
    function close(){ removeEventListener('keydown',onKey); el.classList.remove('on'); setTimeout(()=>{ el.style.display='none'; res(); }, 650); }
    function onKey(e){ if(e.code==='Space'||e.code==='Enter'){ e.preventDefault(); if(!done) finishAnim(); else close(); } }
    el.onpointerdown = e=>{ if(e.target===btn) return; if(!done) finishAnim(); };
    btn.onclick = close; addEventListener('keydown',onKey);
    requestAnimationFrame(frame);
  });
}
