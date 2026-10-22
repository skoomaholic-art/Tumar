// Финальный экран: каждое решение из сценария описано фразой, и наоборот
const test=require('node:test'), assert=require('node:assert'), fs=require('fs'), root=__dirname+'/../data/';
const D=JSON.parse(fs.readFileSync(root+'decisions.json','utf8')).list;
const sets={};
function walk(x){ if(Array.isArray(x)) return x.forEach(walk); if(x && typeof x==='object'){ if(x.set) for(const [k,v] of Object.entries(x.set)) (sets[k]=sets[k]||new Set()).add(String(v)); Object.values(x).forEach(walk); } }
fs.readdirSync(root).filter(f=>/^ch\d/.test(f)).forEach(f=>walk(JSON.parse(fs.readFileSync(root+f,'utf8'))));
test('у каждого решения в финале есть фраза на каждый исход', ()=>{
  for(const d of D){ assert.ok(sets[d.flag], `флаг ${d.flag} нигде не ставится`);
    for(const v of sets[d.flag]) assert.ok(d.values[v], `${d.flag}=${v}: нет фразы для финала`); }
});
