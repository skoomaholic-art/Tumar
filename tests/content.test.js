'use strict';
// Правила подачи: в диалоге — только реплики вслух. Мысли — think, место и время — caption,
// описания действий — beat с крючком show (сцена это показывает). Ремарка без показа — только с todo.
const test = require('node:test'), assert = require('node:assert'), fs = require('fs');
const dir = __dirname + '/../data/';
function* steps(list){ for(const s of list||[]){ if(!s || typeof s!=='object') continue; yield s;
  yield* steps(s.then); yield* steps(s.else); for(const o of s.options||[]) yield* steps(o.then); } }
const files = fs.readdirSync(dir).filter(f=>/^ch\d+\w*\.json$/.test(f));
for(const f of files){
  const d = JSON.parse(fs.readFileSync(dir+f,'utf8'));
  test(`${f}: в диалоге нет закадрового «Голоса» и ремарок в скобках`, ()=>{
    const bad=[];
    for(const [name,list] of Object.entries(d.scripts||{})) for(const s of steps(list)){
      if(s.say==='Голос') bad.push(`${name}: Голос — «${s.text}»`);
      if(typeof s.text==='string' && /^\s*\(/.test(s.text)) bad.push(`${name}: текст в скобках — «${s.text}»`);
    }
    assert.deepStrictEqual(bad, []);
  });
  test(`${f}: каждая ремарка показана в кадре`, ()=>{
    const todo=[], bad=[];
    for(const [name,list] of Object.entries(d.scripts||{})) for(const s of steps(list)) if('beat' in s){
      if(!s.show && !s.todo) bad.push(`${name}: «${s.beat}»`); if(!s.show && s.todo) todo.push(`${name}: «${s.beat}»`); }
    if(todo.length) console.log(`  ${f}: ещё не изображено ${todo.length}:\n   `+todo.join('\n    '));
    assert.deepStrictEqual(bad, []);
  });
}
