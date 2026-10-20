// Проверка сценарного движка без браузера: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const { createRunner, evalCond } = require('../js/core/script.js');
const fs = require('fs');

function mockApi(picks){
  const out = { said:[], memory:{}, log:[], diary:[], later:[], words:[], testimony:[], calls:[] };
  out.api = {
    memory: out.memory,
    say: async (who,text)=>{ out.said.push(who+': '+text); },
    choose: async ()=> picks.shift(),
    close: ()=>{}, wait: async ()=>{},
    remember: t=>out.log.push(t), diary: t=>out.diary.push(t), later: t=>out.later.push(t), toast: t=>out.log.push('toast:'+t),
    word: (ru)=>out.words.push(ru), testify: (topic,value)=>out.testimony.push([topic,value]),
    hooks: { paper(){ out.calls.push('paper'); }, showDoc(k){ out.calls.push('showDoc:'+k); }, kulashRuns(){ out.calls.push('kulash'); }, riderLeaves(){ out.calls.push('leave'); }, cut(n){ out.calls.push('cut:'+n); }, reachBag(){ out.calls.push('reachBag'); }, sign(){ out.calls.push('sign'); }, readPaper(){ out.calls.push('read'); }, dogs(){ out.calls.push('dogs'); } }
  };
  return out;
}

test('условия по флагам', ()=>{
  assert.strictEqual(evalCond('father==told', {father:'told'}), true);
  assert.strictEqual(evalCond('father!=told', {father:'told'}), false);
  assert.strictEqual(evalCond('!tookLetter', {}), true);
  assert.strictEqual(evalCond('tookLetter', {tookLetter:true}), true);
});

test('глава 1: рассказ отца ставит флаг и меняет отношение', async ()=>{
  const ch1 = JSON.parse(fs.readFileSync(__dirname+'/../data/ch01.json','utf8'));
  const m = mockApi([0]);
  await createRunner(m.api)(ch1.scripts.father_story);
  assert.strictEqual(m.memory.flags.father, 'told');
  assert.strictEqual(m.memory.relations.father, 1);
  assert.ok(m.said.some(s=>s.includes('Хлеб не роняют')));
});

test('глава 1: молчание по таймеру — третий путь', async ()=>{
  const ch1 = JSON.parse(fs.readFileSync(__dirname+'/../data/ch01.json','utf8'));
  const m = mockApi([2]);
  await createRunner(m.api)(ch1.scripts.father_story);
  assert.strictEqual(m.memory.flags.father, 'silent');
  assert.strictEqual(m.memory.relations.father, -1);
});

test('глава 1: повестка и Күләш — слова в блокноте и запись в дневнике зависят от выбора', async ()=>{
  const ch1 = JSON.parse(fs.readFileSync(__dirname+'/../data/ch01.json','utf8'));
  const m = mockApi([0]); m.memory.flags = {father:'told'};
  await createRunner(m.api)(ch1.scripts.rider);
  assert.deepStrictEqual(m.words, ['явиться','завтра','военкомат','повестка']);
  assert.ok(m.diary.some(d=>d.includes('Про сестру')));
  // порядок сцены: рука к поясу → лист → подпись → уезжает → Асан не может прочесть → бежит Күләш
  assert.deepStrictEqual(m.calls.filter(c=>!c.startsWith('cut:')), ['reachBag','paper','sign','leave','read','showDoc:false','kulash','showDoc:true']);
  assert.ok(m.calls.includes('cut:kulash'), 'есть план глазами Күләш');
  assert.deepStrictEqual(m.testimony[0], ['name','Нурбеков Асан Нурбекович']);
});

test('once выполняется один раз', async ()=>{
  const m = mockApi([]);
  const run = createRunner(m.api);
  const steps = [{ once:'x', then:[{ toast:'раз' }] }];
  await run(steps); await run(steps);
  assert.strictEqual(m.log.filter(l=>l==='toast:раз').length, 1);
});

test('неизвестный шаг — ошибка, а не тихий пропуск', async ()=>{
  const m = mockApi([]);
  await assert.rejects(createRunner(m.api)([{ fly:true }]));
});
