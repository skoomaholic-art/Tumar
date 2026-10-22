'use strict';
// Общие мелочи: поиск элемента, математика, ожидание
// ---------- общие утилиты ----------
const $ = id => document.getElementById(id);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp = (a,b,t) => a+(b-a)*t;
const rand = (a,b) => a+Math.random()*(b-a);
const isTouch = matchMedia('(pointer:coarse)').matches;
// пауза: пока открыто меню настроек, стоит всё — сцена, катсцены, таймеры, звук
let PAUSED=false;
if(typeof window!=='undefined' && !window.__pauseTimers){
  window.__pauseTimers=true;
  const _setT=window.setTimeout.bind(window), _clrT=window.clearTimeout.bind(window), _setI=window.setInterval.bind(window);
  const PT=new Map(); let ptId=1e7;
  window.setTimeout=function(fn,ms=0,...args){
    if(typeof fn!=='function') return _setT(fn,ms);
    const id=ptId++; let left=+ms||0, last=performance.now();
    const tick=()=>{ const now=performance.now(); if(!PAUSED) left-=now-last; last=now;
      if(left<=1){ PT.delete(id); fn(...args); } else PT.set(id,_setT(tick, PAUSED?120:Math.min(left,120))); };
    PT.set(id,_setT(tick, Math.min(left,120))); return id; };
  window.clearTimeout=function(id){ if(PT.has(id)){ _clrT(PT.get(id)); PT.delete(id); } else _clrT(id); };
  window.setInterval=function(fn,ms,...args){ return typeof fn==='function' ? _setI(()=>{ if(!PAUSED) fn(...args); },ms) : _setI(fn,ms); };
}
function setPaused(on){
  PAUSED=!!on;
  if(typeof document!=='undefined') document.body.classList.toggle('paused',PAUSED);
  try{ if(typeof AC!=='undefined' && AC){ PAUSED ? AC.suspend() : AC.resume(); } }catch(e){}
}
const wait = ms => new Promise(r => setTimeout(r, ms));
