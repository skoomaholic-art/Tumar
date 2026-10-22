// Глава 4: выборы Гриши, приказ под танком, ранение — что запоминается для допросов главы 8
const test = require('node:test');
const assert = require('node:assert');
const { createRunner } = require('../js/core/script.js');
const fs = require('fs');
const ch4 = JSON.parse(fs.readFileSync(__dirname+'/../data/ch04.json','utf8'));

function mock(picks, flags={}){
  const out = { said:[], memory:{flags:{...flags}}, log:[], diary:[], words:[], testimony:[], shows:[], relations:{} };
  out.memory.relations = out.relations;
  out.api = {
    memory: out.memory,
    say: async (who,text)=>{ out.said.push(who+': '+text); },
    choose: async ()=> picks.shift(),
    close: ()=>{}, wait: async ()=>{},
    think: async t=>{ out.said.push('мысль: '+t); }, caption: t=>out.log.push('титр:'+t), beat: ()=>{},
    remember: t=>out.log.push(t), diary: t=>out.diary.push(t), later: ()=>{}, toast: ()=>{},
    word: (ru)=>out.words.push(ru), testify: (topic,value)=>out.testimony.push([topic,value]),
    hooks: new Proxy({}, { get:(_,name)=> async ()=>{ out.shows.push(name); } }),
  };
  return out;
}

test('глава 4 описана в covers', ()=>{
  assert.deepStrictEqual(ch4.covers, ['Ночь перед боем','Рассвет 5 июля','Воронка','Окружение']);
});

test('ночь: Гриша учит две фразы, Асан — одно слово в ответ', async ()=>{
  const m = mock([1, 0], {father:'told'});
  await createRunner(m.api)(ch4.scripts.night_open);
  await createRunner(m.api)(ch4.scripts.night_talk);
  assert.strictEqual(m.memory.flags.grishaPhrase, 'qoryqpady');
  assert.strictEqual(m.memory.flags.grishaPhrase2, 'nan');
  assert.ok(m.words.includes('он не боялся') && m.words.includes('хлеб не ронял') && m.words.includes('держись'));
  assert.ok(m.said.some(s=>s.includes('с тридцать второго')), 'отец рассказал про 32-й — Асан вспоминает');
  assert.ok(m.shows.includes('lookBalloon'));
  assert.ok(m.diary[0].startsWith('4 июля 1943'));
});

test('под танком: «лежать» спасает Гришу, иначе он пропадает', async ()=>{
  for(const [pick, order] of [[0,'disks'],[1,'stay'],[2,'none']]){
    const m = mock([pick]);
    await createRunner(m.api)(ch4.scripts.iron_choice);
    assert.strictEqual(m.memory.flags.grishaOrder, order);
    await createRunner(m.api)(ch4.scripts.crater_find);
    if(order==='stay'){ assert.strictEqual(m.memory.flags.grishaAlive, true); assert.ok(!m.memory.flags.grishaLost); assert.ok(m.shows.includes('lookHand')); continue; }
    assert.strictEqual(m.memory.flags.grishaLost, true);
    assert.ok(m.shows.includes(order==='disks' ? 'lookCommTrench' : 'lookCap'));
  }
});

test('ранение показано в кадре и попадает в показания', async ()=>{
  const m = mock([], {grishaPhrase:'sagyndy', father:'told'});
  await createRunner(m.api)(ch4.scripts.fall);
  assert.deepStrictEqual(m.shows, ['burstHit','seeLeg','hitChest']);
  // голос в дыму коверкает слова так же, как Семён ночью — улика к главе 6
  assert.ok(m.said.includes('Кто-то в дыму: Ол… сыздерды… сагында…'));
  const w = m.testimony.find(t=>t[0]==='wounded_1943');
  assert.ok(w && /перелом/.test(w[1]) && /грудь/.test(w[1]) && /6 июля 1943/.test(w[1]));
});

test('командир в окружении зависит от переправы во 2-й главе', ()=>{
  assert.ok(ch4.scripts.officer_wounded.some(s=>s.say==='Волков' && /Дона/.test(s.text)));
  assert.ok(ch4.scripts.encircle_order_wounded.some(s=>s.say==='Волков' && /за спиной/.test(s.text)));
});
