'use strict';
// Глава 4. Северский Донец — заглушка, пока глава собирается
function sceneDonets(){
  resetCamera(); scene = new THREE.Scene();
  return { S:{}, update(){}, async begin(){ await showCard('Глава 4','Северский Донец','5–6 июля 1943.<br><span class="small">Глава собирается.</span>','Дальше'); endChapter4(); } };
}
