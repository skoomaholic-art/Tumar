'use strict';
// Общие мелочи: поиск элемента, математика, ожидание
// ---------- общие утилиты ----------
const $ = id => document.getElementById(id);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp = (a,b,t) => a+(b-a)*t;
const rand = (a,b) => a+Math.random()*(b-a);
const isTouch = matchMedia('(pointer:coarse)').matches;
const wait = ms => new Promise(r => setTimeout(r, ms));
