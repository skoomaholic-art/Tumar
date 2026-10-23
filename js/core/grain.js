'use strict';
// Плёночное зерно поверх кадра
// ---------- зерно плёнки ----------
const grain = $('grain'), gctx = grain.getContext('2d');
function sizeGrain(){ const k=Math.max(1.5, innerWidth/900); grain.width = innerWidth/k|0; grain.height = innerHeight/k|0; } // мелкое зерно, а не «телевизионный шум»
sizeGrain();
function drawGrain(){
  const w=grain.width,h=grain.height,img=gctx.createImageData(w,h),d=img.data;
  for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}
  gctx.putImageData(img,0,0);
}
