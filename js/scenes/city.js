'use strict';
// Глава 3. Город — заглушка, пока глава собирается
function sceneCity(){
  resetCamera(); scene = new THREE.Scene();
  return { S:{}, update(){}, async begin(){ await showCard('Глава 3','Город','Осень 1942 — март 1943. Сталинград.<br><span class="small">Глава собирается.</span>','Дальше'); endChapter3(); } };
}
