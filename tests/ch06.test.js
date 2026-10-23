// Глава 6, шталаг: сценарий по веткам без браузера
const test = require('node:test');
const assert = require('node:assert');
const { createRunner } = require('../js/core/script.js');
const D = JSON.parse(require('fs').readFileSync(__dirname+'/../data/ch06.json','utf8'));
async function play(flags, picks){
  const out={ memory:{ flags:{...flags} }, said:[], log:[], testimony:[], calls:[] };
  const api={ memory:out.memory, say:async(w,t)=>out.said.push(w+': '+t), choose:async()=>picks.shift(), close(){}, wait:async()=>{}, think:async()=>{}, caption(){}, beat(){},
    remember:t=>out.log.push(t), diary(){}, later(){}, toast(){}, word(){}, deWord:(de)=>out.calls.push('de:'+de), testify:(k,v)=>out.testimony.push([k,v]),
    hooks:new Proxy({}, { get:(_,n)=>(...a)=>{ out.calls.push(n); } }) };
  const run=createRunner(api);
  for(const k of ['wagon','arrive','rings_intro','trade','rollcall_dead','barrack','informer','letter','night','ibray','recruiter']) await run(D.scripts[k]);
  await run(D.scripts[out.memory.flags.legion==='signed'?'legion_signed':'legion_refused']);
  for(const k of ['gabdulla_dies','gabdulla_hand','selection']) await run(D.scripts[k]);
  return out;
}
test('курт на всех → место у печки; промолчал о Василии; сберёг письмо; выкупил тумар; отказался', async ()=>{
  const m=await play({shareFood:'all', kolLetter:'taken', tumarTaken:true, father:'told'}, [1,0,1,0,1]);
  const f=m.memory.flags;
  assert.strictEqual(f.barrackSpot,'stove'); assert.strictEqual(f.vasily,'kept'); assert.strictEqual(f.kolLetterKept,true);
  assert.strictEqual(f.tumar,'back'); assert.strictEqual(f.legion,'refused'); assert.strictEqual(f.smokeVoice,'semyon');
  assert.ok(m.testimony.some(([k,v])=>k==='legion' && /отказался/.test(v)));
  assert.ok(m.calls.includes('stoneWork'));
});
test('курт своим → у двери; сдал Василия; письма нет; подписал — врач бракует', async ()=>{
  const m=await play({shareFood:'own', tumarTaken:true}, [0,1,1,0]);
  const f=m.memory.flags;
  assert.strictEqual(f.barrackSpot,'door'); assert.strictEqual(f.vasily,'betrayed'); assert.strictEqual(f.kolLetterKept,undefined);
  assert.strictEqual(f.tumar,'lost'); assert.strictEqual(f.legion,'signed');
  assert.ok(m.calls.includes('doctorWalk')); assert.ok(m.said.some(s=>s.startsWith('Врач')));
});
test('голос из дыма: Семён во сне повторяет ту же фразу, что в главе 4', async ()=>{
  const m=await play({grishaPhrase:'qoryqpady'}, [1,1,1,1]);
  assert.ok(m.said.includes('Семён: Ол… корыкпаты…'));
});

test('в плену охрана кричит по-немецки, Мударис объясняет слова', async ()=>{
  const m=await play({}, [1,1,1]);
  ['de:schnell','de:Schwein','de:Arbeit','de:Gefangene'].forEach(w=>assert.ok(m.calls.includes(w), w));
  assert.ok(D.deBarks.some(b=>/Russisches Schwein/.test(b)) && D.deBarks.some(b=>/Untermensch/.test(b)));
});
