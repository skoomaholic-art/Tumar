// Глава 5, вторая половина: сборный пункт и палатка — проверка сценария без браузера
const test = require('node:test');
const assert = require('node:assert');
const { createRunner } = require('../js/core/script.js');
const fs = require('fs');
const D = JSON.parse(fs.readFileSync(__dirname+'/../data/ch05b.json','utf8'));

function mock(picks){
  const out = { memory:{}, said:[], later:[], log:[], testimony:[], calls:[] };
  out.api = { memory: out.memory,
    say: async (who,text)=>{ out.said.push(who+': '+text); }, choose: async ()=>picks.shift(),
    close: ()=>{}, wait: async ()=>{}, think: async ()=>{}, caption: ()=>{}, beat: ()=>{},
    remember: t=>out.log.push(t), diary: ()=>{}, later: t=>out.later.push(t), toast: ()=>{}, word: ()=>{}, deWord: ()=>{},
    testify: (topic,value)=>out.testimony.push([topic,value]),
    hooks: new Proxy({}, { get:(_,name)=> (...a)=>{ out.calls.push(name+(a.length?':'+a[0]:'')); } }) };
  return out;
}
async function playAll(picks){
  const m = mock(picks), run = createRunner(m.api);
  for(const k of ['point_intro','point_order','point_choice','tent_intro','tent_bread','surgeon','op_start','op_end_brave','op_after','search']) await run(D.scripts[k]);
  return m;
}

test('сборный пункт: сказал сам — флаг self, старик +1', async ()=>{
  const m = await playAll([0]);
  assert.strictEqual(m.memory.flags.mussulman, 'self');
  assert.strictEqual(m.memory.relations.tatar, 1);
  assert.ok(m.calls.includes('crossArms:self'));
});

test('сборный пункт: молчал — старик говорит за него, +2', async ()=>{
  const m = await playAll([1]);
  assert.strictEqual(m.memory.flags.mussulman, 'tatar');
  assert.strictEqual(m.memory.relations.tatar, 2);
  assert.ok(m.calls.includes('crossArms:tatar'));
});

test('палатка: хромота, тумар удержан в кулаке, раненый не пишет — только later', async ()=>{
  const m = await playAll([0]);
  assert.strictEqual(m.memory.flags.limp, true);
  assert.strictEqual(m.memory.flags.tumarKept, true);
  assert.ok(!m.memory.flags.tumarTaken);
  assert.strictEqual(m.later.length, 3);
  assert.deepStrictEqual(m.testimony[0], ['told_germans','назвался мусульманином на сборном пункте']);
  // каждое описанное действие сцена показывает своим крючком, по порядку
  assert.deepStrictEqual(m.calls.filter(c=>!c.startsWith('crossArms')), ['dragIn','feldWalk','beltsDown','neighbourDrip','bread','sinKneel','guardWalk','fistTumar','guardStoops']);
});

test('немецкая речь — шумом, а слово «Jude» понятно: его переводит Мударис', ()=>{
  const de = [];
  for(const list of Object.values(D.scripts)) for(const s of list) if(['Фельдфебель','Санитар','Охранник'].includes(s.say)) de.push(s.lang);
  assert.ok(de.length>=4 && de.every(l=>l==='de'));
  assert.ok(D.panels.point.some(p=>/Jude.*еврей/.test(p.text)));
  assert.ok(D.scripts.point_choice.some(s=>s.say==='Мударис' && /еврей/.test(s.text)));
});
