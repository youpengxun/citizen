(function(root){
'use strict';
const topics={
'总是谈不拢':['先确认你们在讨论同一件事。','各自用一句话说：我希望这次讨论解决什么。先复述对方的意思，让对方确认，再说自己的看法。','不要一次翻出所有旧问题，也不要把不同意当作不在乎。','先谈一个双方都能描述的具体场景。若情绪升高，约定暂停多久、什么时候继续。','我们对问题的理解一致了吗？有没有留下一条双方自愿的约定？'],
'分工让我觉得累':['先把负担看清楚，再谈怎么分。','各写下本周实际承担的事项，包括提醒、协调和收尾；一起选一项重新分配。','不要只比较任务数量，忽略耗时、难度或对方的实际能力。','给新分工一个短期试行，明确负责人和完成标准，保留调整机会。','谁的负担减少了？有没有出现新的隐形工作？'],
'想靠近，也想有空间':['亲近和独处都可以被认真对待。','分别说出舒服的联系频率、需要安静的时段，以及紧急事情如何联系。','不要用秒回、随时见面或公开隐私来证明感情。','先约一个双方都舒服的相处安排；拒绝某次邀约不等于拒绝整段关系。','这次安排是否让双方都更自在？哪些边界需要再说明？'],
'钱和投入不好开口':['把数字与期待讲明白，比猜测更有用。','只讨论一笔具体支出或一次投入，确认金额、用途、各自承担和变更方式。','不要默认对方同意借贷、共同负担或无限追加投入。','不清楚的条件先写下来；未确认前缩小共同支出的范围。','双方对承担的金额与责任理解一致吗？有没有人只是不好意思拒绝？'],
'我们下一步怎么走':['先讨论一个可以共同尝试的小目标。','各自写一件想一起完成的事，以及自己愿意投入的时间；找一个交集。','不要因为命盘有合就急着承诺，也不要因为有冲就放弃沟通。','把目标缩成可完成、可回顾的一步；到期再决定是否继续。','我们愿意继续吗？如果答案不同，能否尊重彼此的选择？']};
if(typeof module!=='undefined'&&module.exports){module.exports={topics};return;}
root.YPXPairGuide=function(host){
 const el=(t,s)=>{const n=document.createElement(t);if(s)n.textContent=s;return n;},box=el('section'),relation=el('select'),question=el('select'),result=el('div');box.className='ypx-focus';
 const relations=['伴侣','朋友','家人','工作搭档'];[['', '请选择你们的关系'],...relations.map(x=>[x,x])].forEach(([v,t])=>{const o=el('option',t);o.value=v;relation.append(o);});relation.value='';[['','请选择最想解决的问题'],...Object.keys(topics).map(x=>[x,x])].forEach(([v,t])=>{const o=el('option',t);o.value=v;question.append(o);});question.value='';
 relation.setAttribute('aria-label','你们的关系');question.setAttribute('aria-label','你们想解决的问题');const fields=el('div');fields.className='mf-fields';[['你们的关系',relation],['这次最想聊什么？',question]].forEach(([t,input])=>{const label=el('label',t);label.append(input);fields.append(label);});
 function render(){result.replaceChildren();if(!relation.value||!question.value){result.append(el('p','先选择关系和问题，再比较双方正在考虑的安排。'));return;}root.YPXDecision?.mount(result,{domain:'双人合盘',relation:relation.value,stage:question.value});}
 relation.addEventListener('change',render);question.addEventListener('change',render);box.append(el('h3','你们想一起理清什么？'),fields,result);host.append(box);render();
};
})(typeof globalThis!=='undefined'?globalThis:this);
