'use strict';
// Плёночное зерно поверх кадра
// ---------- зерно плёнки ----------
const grain = $('grain'), gctx = grain.getContext('2d');
function sizeGrain(){ grain.width = innerWidth/3|0; grain.height = innerHeight/3|0; }
sizeGrain();
function drawGrain(){
  const w=grain.width,h=grain.height,img=gctx.createImageData(w,h),d=img.data;
  for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}
  gctx.putImageData(img,0,0);
}
