'use strict';
// Показания для допросов главы 8. Всё, что Асан говорит немцам, американцам и своим,
// записывается как {тема, значение, где}. Противоречие — одна тема с разными значениями.

function addTestimony(list, topic, value, where){
  list.push({topic, value:String(value), where:where||''});
  return list;
}
function contradictions(list){
  const byTopic = {};
  for(const t of list){ (byTopic[t.topic] = byTopic[t.topic] || new Set()).add(t.value); }
  return Object.entries(byTopic).filter(([,vals])=>vals.size>1).map(([topic,vals])=>({topic, values:[...vals]}));
}
// Свидетель закрывает одно противоречие по своей теме (или добавляет новое, если он «против»)
function applyWitness(list, witness){
  // witness: {topic, value, for:true|false, where}
  if(witness.for) return list.filter(t=>t.topic!==witness.topic).concat([{topic:witness.topic, value:String(witness.value), where:witness.where||'свидетель'}]);
  return list.concat([{topic:witness.topic, value:String(witness.value), where:witness.where||'свидетель'}]);
}

if(typeof module!=='undefined') module.exports = { addTestimony, contradictions, applyWitness };
