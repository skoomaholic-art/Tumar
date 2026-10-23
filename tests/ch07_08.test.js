// Главы 7–8: развилки хутора, допросы, пометки Ракитина, выбор концовки
const test = require('node:test');
const assert = require('node:assert');
const { createRunner } = require('../js/core/script.js');
const fs = require('fs');
const ch7 = JSON.parse(fs.readFileSync(__dirname+'/../data/ch07.json','utf8'));
const ch8 = JSON.parse(fs.readFileSync(__dirname+'/../data/ch08.json','utf8'));
const END = JSON.parse(fs.readFileSync(__dirname+'/../data/endings.json','utf8'));

function mock(picks, flags={}){
  const out = { said:[], memory:{flags:{...flags}, relations:{}}, log:[], testimony:[], shows:[], calls:[] };
  out.api = {
    memory: out.memory,
    say: async (who,text)=>{ out.said.push(who+': '+text); },
    choose: async ()=> picks.shift(),
    close: ()=>{}, wait: async ()=>{},
    think: async t=>{ out.said.push('мысль: '+t); }, caption: ()=>{}, beat: ()=>{},
    remember: t=>out.log.push(t), diary: ()=>{}, later: ()=>{}, toast: ()=>{},
    word: ()=>{}, deWord: ()=>{}, testify: (topic,value)=>out.testimony.push([topic,value]),
    hooks: new Proxy({}, { get:(_,name)=> async (...a)=>{ out.shows.push(name); if(name==='mark') out.memory.flags.marks=(out.memory.flags.marks||0)+(a[0]||1); } }),
  };
  return out;
}

test('глава 7: Дубровин благодарит и даёт показания, только если его спрятали', async ()=>{
  for(const [dub, thanks] of [['hid',true],['forest',false],['shut',false]]){
    const m = mock([0], {dubrovin:dub});
    await createRunner(m.api)(ch7.scripts.search);
    assert.strictEqual(m.said.some(s=>s.startsWith('Дубровин: Спасибо')), thanks, dub);
    assert.strictEqual(m.testimony.some(t=>t[0]==='dubrovin'), thanks, dub);
  }
});

test('глава 7: выбор «отдалиться от Лизль» — только если брал её за руку', async ()=>{
  const near = mock([0], {lislNear:true}); await createRunner(near.api)(ch7.scripts.execution);
  assert.strictEqual(near.memory.flags.lislFar, true);
  const far = mock([0], {}); await createRunner(far.api)(ch7.scripts.execution);
  assert.ok(!far.memory.flags.lislFar);
});

test('глава 8: враньё против записанного — пометка, правда — без пометок', async ()=>{
  const honest = mock([0,0], {raft:'wounded'}); await createRunner(honest.api)(ch8.scripts.interrogation1);
  assert.ok(!honest.memory.flags.marks);
  const liar = mock([1,1], {raft:'wounded'}); await createRunner(liar.api)(ch8.scripts.interrogation1);
  assert.strictEqual(liar.memory.flags.marks, 2);
});

test('глава 8: подписанная анкета без признания всплывает карточкой на третьем допросе', async ()=>{
  const hid = mock([], {legion:'signed'}); await createRunner(hid.api)(ch8.scripts.interrogation3);
  assert.ok(hid.shows.includes('legionCard')); assert.strictEqual(hid.memory.flags.marks, 2);
  const conf = mock([], {legion:'signed', legionConfessed:true}); await createRunner(conf.api)(ch8.scripts.interrogation3);
  assert.ok(!conf.shows.includes('legionCard'));
  assert.ok(conf.shows.includes('protocol'));
});

test('глава 8: свидетели по флагам', async ()=>{
  const m = mock([], {raft:'wounded', dubrovin:'hid', vasily:'betrayed'}); await createRunner(m.api)(ch8.scripts.interrogation3);
  assert.strictEqual(m.shows.filter(s=>s==='witness').length, 3);
});

test('концовки: у каждой есть страницы и финал', ()=>{
  for(const k of ['A','B','C']){ assert.ok(END[k].panels.length>=3, k); assert.ok(END[k].final.length>=1, k); }
});
