// Глава 3: письмо Колесникова, запись политрука, хлеб при свидетеле — проверка сценария без браузера
const test = require('node:test');
const assert = require('node:assert');
const { createRunner } = require('../js/core/script.js');
const fs = require('fs');
const D = JSON.parse(fs.readFileSync(__dirname+'/../data/ch03.json','utf8'));

function mock(picks, flags={}){
  const out = { memory:{flags:{...flags}}, said:[], thoughts:[], log:[], calls:[] };
  out.api = { memory: out.memory,
    say: async (who,text)=>{ out.said.push(who+': '+text); }, choose: async ()=>picks.shift(),
    close: ()=>{}, wait: async ()=>{}, think: async t=>{ out.thoughts.push(t); }, caption: ()=>{}, beat: ()=>{},
    remember: t=>out.log.push(t), diary: ()=>{}, later: ()=>{}, toast: ()=>{}, word: ()=>{}, testify: ()=>{},
    hooks: new Proxy({}, { get:(_,name)=> ()=>{ out.calls.push(name); } }) };
  return out;
}

test('письмо Колесникова: взял — за голенищем, после вылазки мысль про адрес', async ()=>{
  const m = mock([0]), run = createRunner(m.api);
  await run(D.scripts.raid_brief); await run(D.scripts.raid_end);
  assert.strictEqual(m.memory.flags.kolLetter, 'taken');
  assert.ok(m.calls.includes('letterToBoot'));
  assert.ok(m.thoughts.some(t=>t.includes('адрес')));
});

test('письмо Колесникова: не взял — письмо у него в кармане', async ()=>{
  const m = mock([1]), run = createRunner(m.api);
  await run(D.scripts.raid_brief); await run(D.scripts.raid_end);
  assert.strictEqual(m.memory.flags.kolLetter, 'refused');
  assert.ok(m.calls.includes('letterBack'));
  assert.ok(m.thoughts.some(t=>t.includes('в кармане')));
});

test('гвардия: пулемёт брошен на Дону — политрук записывает', async ()=>{
  for(const raft of ['wounded','none']){
    const m = mock([], {raft}), run = createRunner(m.api);
    await run(D.scripts.guards);
    assert.strictEqual(m.memory.flags.politrukReport, true, raft);
    assert.ok(m.calls.includes('politrukWrites'));
  }
});

test('гвардия: пулемёт вынес — политрук только кивает', async ()=>{
  const m = mock([], {raft:'gun'}), run = createRunner(m.api);
  await run(D.scripts.guards);
  assert.ok(!m.memory.flags.politrukReport);
  assert.ok(m.calls.includes('politrukNods'));
});

test('хлеб мальчишке: политрук видел', async ()=>{
  const m = mock([0]), run = createRunner(m.api);
  await run(D.scripts.prisoners);
  assert.strictEqual(m.memory.flags.gaveBread, true);
  assert.strictEqual(m.memory.flags.breadSeen, true);
  assert.ok(m.calls.includes('politrukWatches'));
});
