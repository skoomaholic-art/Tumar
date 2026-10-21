'use strict';
// Глава 5, вторая половина: сборный пункт и палатка умирающих — заглушка, пока собирается
function sceneCamp(){
  resetCamera(); scene = new THREE.Scene();
  return { S:{}, update(){}, async begin(){ finale(); } };
}
