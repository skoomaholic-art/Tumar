'use strict';
// Сверка со сценарием: каждая сцена собранной главы должна быть отмечена в covers её файлов данных.
// Так пропущенная сцена не проходит незаметно.
const test = require('node:test'), assert = require('node:assert'), fs = require('fs');
const root = __dirname + '/../';
const outline = JSON.parse(fs.readFileSync(root+'data/outline.json','utf8'));
const allScenes = new Set(outline.chapters.flatMap(c=>c.scenes));
for(const ch of outline.chapters){
  if(ch.status==='planned') continue;
  test(`${ch.title}: собраны все сцены сценария`, ()=>{
    const covered = new Set();
    for(const p of ch.data){ const d = JSON.parse(fs.readFileSync(root+p,'utf8')); (d.covers||[]).forEach(s=>covered.add(s)); }
    const missing = ch.scenes.filter(s=>!covered.has(s));
    assert.deepStrictEqual(missing, [], 'не собраны сцены: '+missing.join(', '));
  });
}
test('в covers нет сцен, которых нет в сценарии', ()=>{
  const files = fs.readdirSync(root+'data').filter(f=>f.endsWith('.json') && f!=='outline.json');
  for(const f of files){ const d = JSON.parse(fs.readFileSync(root+'data/'+f,'utf8'));
    for(const s of (d.covers||[])) assert.ok(allScenes.has(s), `${f}: «${s}» нет в сценарии`); }
});
