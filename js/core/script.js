'use strict';
// Сценарный движок: главы пишутся данными (data/chNN.json), а не кодом.
// Шаг сценария — объект с одним ключом-командой:
//   {say:"Отец", text:"…", lang:"ru"}                     реплика (lang ru/de шифрует незнакомые слова)
//   {choose:"Отец", text:"…", timer:9, silent:2,
//    options:[{text:"…", then:[…шаги…]}, …]}               выбор; silent — вариант «промолчать» по таймеру
//   {set:{father:"told"}}                                 флаги сюжета (memory.flags)
//   {relation:{who:"father", delta:1}}                    отношение персонажа к Асану
//   {if:"father==told", then:[…], else:[…]}               условие по флагам ("a", "!a", "a==b", "a!=b")
//   {remember:"…"} {diary:"…"} {later:"…"} {toast:"…"}    память, записи в блокнот, отложенные записи
//   {word:["явиться","келу","где записал"]}               слово в блокнот Асана
//   {testify:["captured","wounded"], where:"ch5"}         показание для будущих допросов
//   {once:"ключ", then:[…]}                               выполнить один раз за игру
//   {call:"showDoc", args:[true]}                         крючок в код сцены
//   {wait:800} {close:true}
//   {think:"…"}                                           мысль Асана — в кадре, почерком, не в диалоге
//   {caption:"Ночь. Берег Дона."}                         титр места и времени, как в кино
//   {beat:"что происходит", show:"крючок", args:[…]}      ремарка: игроку не видна, сцена ПОКАЗЫВАЕТ это крючком show;
//                                                          без show — только с todo:true (ещё не изображено)

function evalCond(expr, flags){
  expr = String(expr).trim();
  if(expr.startsWith('!')) return !evalCond(expr.slice(1), flags);
  let m = expr.match(/^([\w.]+)\s*(==|!=)\s*(.+)$/);
  if(m){ const v = flags[m[1]]; const want = m[3].trim(); return m[2]==='==' ? String(v)===want : String(v)!==want; }
  return !!flags[expr];
}

function createRunner(api){
  // api: { say(who,text,lang), choose(who,text,options,timer,silent), close(), memory,
  //        remember(t), diary(t), later(t), toast(t), word(ru,kz,where), testify(topic,value,where), hooks:{}, wait(ms) }
  const mem = api.memory;
  mem.flags = mem.flags || {}; mem.relations = mem.relations || {}; mem.once = mem.once || {};
  async function run(steps){
    if(!steps) return;
    for(const st of steps){
      if('say' in st) await api.say(st.say, st.text, st.lang||'kz');
      else if('choose' in st){
        // вариант с полем if показывается только при выполнении условия
        const options = st.options.filter(o=>!o.if || evalCond(o.if, mem.flags));
        const opts = options.map(o=>o.text);
        const sil = (st.silent==null || st.silent<0) ? -1 : options.indexOf(st.options[st.silent]);
        const i = await api.choose(st.choose, st.text||'', opts, st.timer||0, sil);
        const picked = options[i];
        if(picked){ if(picked.set) Object.assign(mem.flags, picked.set); await run(picked.then); }
      }
      else if('set' in st) Object.assign(mem.flags, st.set);
      else if('relation' in st){ const r=st.relation; mem.relations[r.who]=(mem.relations[r.who]||0)+(r.delta||0); }
      else if('if' in st) await run(evalCond(st.if, mem.flags) ? st.then : st.else);
      else if('remember' in st) api.remember(st.remember);
      else if('diary' in st) api.diary(st.diary);
      else if('later' in st) api.later(st.later);
      else if('toast' in st) api.toast(st.toast);
      else if('word' in st) await api.word(...st.word);
      else if('deWord' in st) await api.deWord(...st.deWord);
      else if('testify' in st) api.testify(st.testify[0], st.testify[1], st.where||'');
      else if('once' in st){ if(!mem.once[st.once]){ mem.once[st.once]=true; await run(st.then); } }
      else if('call' in st){ const fn=api.hooks && api.hooks[st.call]; if(!fn) throw new Error('Нет крючка сценария: '+st.call); await fn(...(st.args||[])); }
      else if('think' in st) await api.think(st.think);
      else if('caption' in st) api.caption(st.caption);
      else if('beat' in st){ if(api.beat) api.beat(st.beat); if(st.show){ const fn=api.hooks && api.hooks[st.show]; if(!fn) throw new Error('Нет крючка для ремарки: '+st.show); await fn(...(st.args||[])); } }
      else if('wait' in st) await api.wait(st.wait);
      else if('close' in st) api.close();
      else throw new Error('Неизвестный шаг сценария: '+JSON.stringify(st));
    }
  }
  return run;
}

if(typeof module!=='undefined') module.exports = { createRunner, evalCond };
