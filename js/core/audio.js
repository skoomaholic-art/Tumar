'use strict';
// Звук: всё синтезируется, файлов нет
// ---------- звук (синтез, без файлов) ----------
let AC=null, master=null, BUS={}, windGain=null, heartTimer=null, ringOsc=null, ringGain=null;
function initAudio(){
  if(AC) return;
  AC = new (window.AudioContext||window.webkitAudioContext)();
  master = AC.createGain(); master.gain.value = .8; master.connect(AC.destination);
  // три канала: музыка, эффекты, диалоги — громкость каждого в настройках
  for(const k of ['music','sfx','voice']){ BUS[k]=AC.createGain(); BUS[k].connect(master); }
  applySettings();
  // ветер: шум через полосовой фильтр с медленной модуляцией
  const len = AC.sampleRate*3, buf = AC.createBuffer(1,len,AC.sampleRate), ch = buf.getChannelData(0);
  let last=0; for(let i=0;i<len;i++){ last = (last + (Math.random()*2-1)*0.02)/1.02; ch[i]=last*3.5; }
  const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = AC.createBiquadFilter(); bp.type='lowpass'; bp.frequency.value = 600;
  windGain = AC.createGain(); windGain.gain.value = .35;
  const lfo = AC.createOscillator(), lfoG = AC.createGain(); lfo.frequency.value=.13; lfoG.gain.value=250;
  lfo.connect(lfoG); lfoG.connect(bp.frequency); lfo.start();
  src.connect(bp); bp.connect(windGain); windGain.connect(BUS.sfx); src.start();
}
function noiseBurst({dur=.3,freq=800,q=1,gain=.5,type='bandpass',delay=0,bus='sfx'}){
  if(!AC) return;
  const t=AC.currentTime+delay, len=AC.sampleRate*dur, buf=AC.createBuffer(1,len,AC.sampleRate), ch=buf.getChannelData(0);
  for(let i=0;i<len;i++) ch[i]=(Math.random()*2-1);
  const s=AC.createBufferSource(); s.buffer=buf;
  const f=AC.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=q;
  const g=AC.createGain(); g.gain.setValueAtTime(gain,t); g.gain.exponentialRampToValueAtTime(.001,t+dur);
  s.connect(f); f.connect(g); g.connect(BUS[bus]||master); s.start(t);
}
function tone({f=440,dur=.2,type='sine',gain=.2,delay=0,slide=0,bus='sfx'}){
  if(!AC) return;
  const t=AC.currentTime+delay, o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.linearRampToValueAtTime(f+slide,t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(gain,t+.02); g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g); g.connect(BUS[bus]||master); o.start(t); o.stop(t+dur+.05);
}
const sfx = {
  caw(d=0){ tone({f:620,dur:.28,type:'sawtooth',gain:.09,delay:d,slide:-260}); noiseBurst({dur:.25,freq:1400,q:3,gain:.12,delay:d}); },
  flap(d=0){ noiseBurst({dur:.12,freq:260,q:.8,gain:.35,type:'lowpass',delay:d}); },
  step(){ noiseBurst({dur:.08,freq:300,q:.7,gain:.06,type:'lowpass'}); },
  wood(){ tone({f:180,dur:.12,type:'triangle',gain:.25}); noiseBurst({dur:.06,freq:1200,gain:.15}); },
  hooves(){ for(let i=0;i<8;i++){ noiseBurst({dur:.07,freq:220,q:2,gain:.35,delay:i*.18}); noiseBurst({dur:.06,freq:260,q:2,gain:.25,delay:i*.18+.07}); } },
  paper(){ noiseBurst({dur:.25,freq:3000,q:.6,gain:.12,type:'highpass'}); },
  boom(d=0){ noiseBurst({dur:1.6,freq:90,q:.5,gain:.7,type:'lowpass',delay:d}); },
  flare(){ tone({f:900,dur:1.2,type:'sine',gain:.05,slide:-500}); },
  bark(d=0){ for(let i=0;i<2;i++){ noiseBurst({dur:.12,freq:700,q:4,gain:.5,delay:d+i*.22}); tone({f:380,dur:.1,type:'sawtooth',gain:.08,delay:d+i*.22,slide:-120}); } },
  memory(){ tone({f:523,dur:.6,gain:.06}); tone({f:784,dur:.9,gain:.04,delay:.12}); },
  heart(){ tone({f:52,dur:.16,type:'sine',gain:.5}); tone({f:46,dur:.18,type:'sine',gain:.35,delay:.22}); }
};
function setHeart(bpm){ clearInterval(heartTimer); if(bpm>0) heartTimer=setInterval(sfx.heart, 60000/bpm); }
function setRing(on){
  if(!AC) return;
  if(on && !ringOsc){ ringOsc=AC.createOscillator(); ringGain=AC.createGain(); ringOsc.frequency.value=4100; ringGain.gain.value=0; ringOsc.connect(ringGain); ringGain.connect(BUS.sfx); ringOsc.start(); ringGain.gain.linearRampToValueAtTime(.05,AC.currentTime+.3); ringGain.gain.linearRampToValueAtTime(.0,AC.currentTime+6); }
  if(!on && ringOsc){ ringOsc.stop(); ringOsc=null; }
}

// ---------- настройки: звук по каналам, гамма; хранятся в браузере ----------
const SETTINGS = Object.assign({ music:.7, sfx:.8, voice:.8, gamma:1 }, (()=>{ try{ return JSON.parse(localStorage.getItem('tumar-settings')||'{}'); }catch(_){ return {}; } })());
function applySettings(){
  if(AC) for(const k of ['music','sfx','voice']) BUS[k] && BUS[k].gain.setTargetAtTime(SETTINGS[k], AC.currentTime, .05);
  document.documentElement.style.setProperty('--gam', SETTINGS.gamma);
}
function saveSettings(){ try{ localStorage.setItem('tumar-settings', JSON.stringify(SETTINGS)); }catch(_){} applySettings(); }
applySettings();
// мотив в меню: редкие щипки, как на домбре (пентатоника); канал «музыка»
let tuneT=0, tuneI=0;
const TUNE=[[220,.9],[262,.45],[294,.45],[330,1.2],[294,.6],[262,.6],[220,1.6],[196,.8],[220,2.4]];
function playTune(dt){ if(!AC) return; tuneT-=dt; if(tuneT>0) return; const [f,d]=TUNE[tuneI%TUNE.length]; tuneI++;
  tone({f, dur:1.4, type:'triangle', gain:.07, bus:'music'}); tone({f:f*2, dur:.5, type:'sine', gain:.02, bus:'music'});
  tuneT = d + (tuneI%TUNE.length===0 ? 4 : 0); }
