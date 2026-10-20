const test = require('node:test');
const assert = require('node:assert');
const { addTestimony, contradictions, applyWitness } = require('../js/core/testimony.js');

test('противоречие находится, свидетель «за» его снимает', ()=>{
  const list = [];
  addTestimony(list, 'captured', 'раненым', 'ch5');
  addTestimony(list, 'captured', 'сдался сам', 'ch8');
  assert.strictEqual(contradictions(list).length, 1);
  const after = applyWitness(list, { topic:'captured', value:'раненым', for:true });
  assert.strictEqual(contradictions(after).length, 0);
});

test('свидетель «против» добавляет противоречие', ()=>{
  const list = addTestimony([], 'legion', 'отказался', 'ch6');
  const after = applyWitness(list, { topic:'legion', value:'подписал', for:false });
  assert.deepStrictEqual(contradictions(after), [{ topic:'legion', values:['отказался','подписал'] }]);
});
