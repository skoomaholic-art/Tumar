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
    think: async t=>{ out.said.push('мысль: '+t); }, caption: t=>out.log.push('титр:'+t), beat: ()=>{},
    remember: t=>out.log.push(t), diary: t=>out.diary.push(t), later: t=>out.later.push(t), toast: t=>out.log.push('toast:'+t),
    word: (ru)=>out.words.push(ru), testify: (topic,value)=>out.testimony.push([topic,value]),
    // любой крючок сцены записывается по имени; cut и показ ремарок — тоже
    hooks: new Proxy({}, { get:(_,name)=> (...a)=>{ out.calls.push(name==='showDoc' ? 'showDoc:'+a[0] : name==='cut' ? 'cut:'+a[0] : ({kulashRuns:'kulash', riderLeaves:'leave', readPaper:'read'})[name] || name); } }),
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
  assert.deepStrictEqual(m.calls.filter(c=>!c.startsWith('cut:') && !['fatherWatches','holdShot'].includes(c)), ['reachBag','paper','signInsert','leave','read','showDoc:false','kulash','showDoc:true']);
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

test('вариант с if показывается только при условии; индекс [молчать] сдвигается вместе с ним', async ()=>{
  const seen=[]; const m=mockApi([0]);
  m.api.choose = async (who,text,opts,timer,silent)=>{ seen.push({opts,silent}); return 0; };
  const run=createRunner(m.api);
  const st=[{choose:'А', options:[{if:'x==1',text:'один',set:{p:'a'}},{text:'два',set:{p:'b'}},{text:'[Молчать]',set:{p:'c'}}], silent:2}];
  await run(st);
  assert.deepStrictEqual(seen[0].opts,['два','[Молчать]']); assert.strictEqual(seen[0].silent,1); assert.strictEqual(m.memory.flags.p,'b');
  m.memory.flags.x=1; await run(st);
  assert.deepStrictEqual(seen[1].opts,['один','два','[Молчать]']); assert.strictEqual(seen[1].silent,2); assert.strictEqual(m.memory.flags.p,'a');
});

test('глава 8: Гриша живой — свидетель за; Дубровин пойман — свидетель против; письмо Жумабая зависит от воды', async ()=>{
  const ch8=JSON.parse(fs.readFileSync(__dirname+'/../data/ch08.json','utf8'));
  const a=mockApi([]); a.memory.flags={grishaAlive:true, dubrovinCaught:true, water:'kept'};
  a.api.hooks=new Proxy({}, {get:(_,n)=>(...x)=>a.calls.push(n+':'+x.join(','))});
  const run=createRunner(a.api); await run(ch8.scripts.interrogation3); await run(ch8.scripts.zhumabai);
  assert.ok(a.calls.includes('witness:1')); assert.ok(a.calls.includes('witness:-1'));
  assert.ok(a.said.some(s=>/воды не дал/.test(s)));
  assert.ok(a.said.some(s=>/На повестке я тоже не знал/.test(s)));
});
