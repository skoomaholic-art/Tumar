'use strict';
// Глава 1, вторая половина: проводы, Акмолинск, отец у поезда — заглушка, пока собирается
function sceneDeparture(){
  resetCamera(); scene = new THREE.Scene();
  return { S:{}, update(){}, async begin(){ endChapter1(); } };
}
