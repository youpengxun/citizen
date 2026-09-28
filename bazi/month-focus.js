(function(root){
'use strict';
function focus(a,r,K){
 const day=a.pillars.day,month=a.pillars.month,matches=r.relations.filter(x=>x.startsWith('流月'));
 // Presentation order only; never a measure of astrological strength.
 const ordered=[...matches.filter(x=>x.includes('本命日柱')),...matches.filter(x=>x.includes('本命月柱')),...matches.filter(x=>!x.includes('本命日柱')&&!x.includes('本命月柱'))];
 const repetitions=['year','month','day','hour'].filter(k=>a.pillars[k].stem===r.month[0]).map(k=>({year:'年干',month:'月干',day:'日干',hour:'时干'}[k]));
 return {main:ordered[0]||`本月天干${r.month[0]}，相对日主${day.stem}为${K.getTenGod(day.stem,r.month[0])}`,others:ordered.slice(1),repetitions,monthBase:month.stem+month.branch};
}
const routes={
'工作／求职':[
'先定位卡点，再决定要增加投入还是改变做法。',
'投递没有回复','先选一个岗位，将最相关的项目写成“问题、你的行动、可核对的结果”；请一位了解岗位的人只检查匹配度。',
'沟通或面试后没有进展','回看对方问过但你没有讲清的问题，补一个具体案例，并检查双方对职责和条件的理解是否一致。',
'避免同时重写全部材料、盲目增加投递量，或在范围未确认时承诺额外工作。',
'本周只验证一处修改，记录采用了什么版本、得到什么实际反馈；不要把暂时无回复当成个人价值的判断。'],
'创作／项目':[
'先完成一个能被反馈的版本，再决定是否扩大。',
'一直准备还没开始','缩小成一个画面、一段文字或一个演示，先明确它要回答什么问题。',
'做了很多却没有反馈','找两位目标观看者，问他们看懂了什么、在哪停住；不要只问“好不好”。',
'避免同时开新题、反复改细节而没有验证主题，或为了完成数量持续压缩休息。',
'给最小版本一个明确截止点；反馈后只改一个关键问题，再比较效果。'],
'关系／沟通':[
'先把一个具体需求说清楚，不急着给整段关系下结论。',
'同一个问题反复争论','各自写出发生的事实、自己的需求和愿意调整的一件事；一次只谈一个议题。',
'还没有认真讨论过','先询问对方何时方便，再提出一项可以被明确回应的请求，不把沉默当作答案。',
'避免用合冲或十神给对方贴标签，也不要把一次不顺扩大成“总是”“从来”。',
'形成一个双方自愿的短期约定，到期分别说清哪些有用、哪些不舒服；情绪升级时先约定暂停与恢复时间。'],
'学习／生活':[
'先恢复一个可持续的节奏，而不是一次安排满整个月。',
'计划太多执行不下去','选一项最影响当下的问题，把第一步缩小到十分钟，并删除一项非必要安排。',
'持续投入却不清楚有没有用','留下一次小练习或一条实际记录，检查能否独立完成，而不是只看投入时长。',
'避免把每一次中断当成失败，或用更满的日程惩罚自己。',
'一周后检查实际可用时间和负担；如果计划一直超出容量，就缩小目标而不是继续加码。']};
if(typeof module!=='undefined'&&module.exports){module.exports={focus,routes};return;}
root.YPXFocus=function(host,a,r,K,previous){
 const el=(tag,t)=>{const n=document.createElement(tag);if(t)n.textContent=t;return n;},box=el('section'),result=el('div'),select=el('select'),situation=el('select'),context=el('textarea'),f=focus(a,r,K);
 box.className='ypx-focus';
 const badge=(text)=>{const x=el('span',text);x.className='mf-badge';return x;};
 function card(number,title,kind){const x=el('section');x.className='mf-card '+(kind||'');const head=el('div');head.className='mf-card-head';head.append(badge(number),el('h4',title));x.append(head);return x;}
 const overview=card('速读','先看与你有关的三件事','mf-primary');
 const summary=el('ol');
 summary.append(el('li',`你的本命日主是${a.pillars.day.stem}；本月${r.month}天干相对它为${r.monthGod}。十神描述生克关系，不是给你贴性格标签。`),el('li',f.main+'。这是本轮优先展示的关系，不是最强或最吉凶的一项。'),el('li',`大运：${r.run}；流年：${r.year}。下面区分长期背景与本月变化，不把每条线索都变成任务。`));overview.append(summary);box.append(overview);
 const change=el('details');change.className='mf-explanation';change.append(el('summary','与上一流月相比，具体变了什么？'));
 if(previous){const norm=x=>x.replace(/^流月. · /,'');const old=previous.relations.filter(x=>x.startsWith('流月')).map(norm),now=r.relations.filter(x=>x.startsWith('流月')).map(norm);const added=now.filter(x=>!old.includes(x)),removed=old.filter(x=>!now.includes(x));change.append(el('p',`上一流月 ${previous.month}（${previous.monthGod}） → 当前 ${r.month}（${r.monthGod}）。对照的是本流月交节前一秒，不是公历上个月的同一天。`),el('p','新增关系：'+(added.join('；')||'本轮六合、六冲、六害没有新增关系。')),el('p','不再出现的关系：'+(removed.join('；')||'本轮没有移除的关系。')),el('p',`本命四柱不变。流年${previous.year===r.year?'仍为'+r.year:previous.year+' → '+r.year}；大运${previous.run===r.run?'仍为'+r.run:previous.run+' → '+r.run}。关系变化不等于现实事件一定变化。`));}else change.append(el('p','上一流月超出可比较范围，或早于出生时间，暂不展示对照。'));box.append(change);
 const balance=el('details');balance.className='mf-explanation';balance.append(el('summary','既有合，也有冲，该怎么理解？'),el('p','它们可能来自不同柱位，也可能属于流年与流月两个层次，不能互相抵消后算出一个吉凶分数。先展开依据，核对每条关系连到哪里，再回到你正在处理的具体事情。'),el('p','合不等于对方同意，冲不等于必然争执。尚未综合旺衰、格局、用神与合化条件，因此这里不判断“这个月一定适合辞职、投资或确定关系”。'));box.append(balance);
 box.append(el('h3','这个月，你最想理清什么？'),el('p','不用先读懂命盘。选一件正在处理的事，我们从这里开始。'));
 const sections=[];
 const one=card('依据','为什么这样提示');one.append(badge('命盘依据'),el('p',f.main));
 const guide=f.main.includes('六冲')?'先核对已有变化，再商量怎么调整。':f.main.includes('六合')?'先把协作条件讲清楚，不把相合当作默契。':f.main.includes('六害')?'先核对沟通中的误解，不据此怀疑别人。':'先观察，不为这个月强行安排一个故事。';
 const lead=el('p',guide);lead.className='mf-lead';one.append(lead);const scope=el('details');scope.append(el('summary','为什么先看这一条？'),el('p','阅读顺序优先列出与本命日柱、月柱有关的已检出关系，再列其他位置。这不是吉凶强弱排序，也不表示某件事一定发生。'));one.append(scope);
 const two=card('时间','这次解读覆盖的时间');const stats=el('div');stats.className='mf-stats';[['本命月柱',f.monthBase],['流年',r.year],['当前流月',r.month]].forEach(([t,v])=>{const x=el('div');x.append(el('span',t),el('strong',v));stats.append(x);});two.append(stats);
 const more=el('details');more.append(el('summary','展开重复天干与其他关系'),el('p',f.repetitions.length?'本月天干也出现在本命'+f.repetitions.join('、')+'。字面重复不等于力量翻倍。':'本月天干与本命天干没有同字重复。'));const list=el('ul');f.others.forEach(t=>list.append(el('li',t)));more.append(list,el('p','次要线索可以保留，不必每条都安排一个行动。'));two.append(more);
 const range=el('div');range.className='mf-range';range.append(el('span','本流月开始'),el('strong',r.start),el('span','下一流月开始（本段不含）'),el('strong',r.end));two.append(range);
 const three=el('section');three.className='mf-customer-start';
 const placeholder=el('option','请选择你关心的事');placeholder.value='';select.append(placeholder);Object.keys(routes).forEach(v=>{const o=el('option',v);o.value=v;select.append(o);});select.value='';select.setAttribute('aria-label','本月最关注的事情');situation.setAttribute('aria-label','当前进展');
 const fields=el('div');fields.className='mf-fields';[['这件事与什么有关？',select]].forEach(([t,input])=>{const l=el('label',t);l.append(input);fields.append(l);});
 context.rows=3;context.maxLength=1000;context.setAttribute('aria-label','我的近况');context.placeholder='可选：写一件最近想解决的事，仅在本次页面对照，不会保存。';const contextBox=el('details');contextBox.append(el('summary','补充我的近况（可选）'),context,el('p','写下来，方便你对照自己的处境。这段文字不会保存，也不会自动影响下面的建议。'));
 function options(){render();}
 function render(){result.replaceChildren();if(!select.value){result.append(el('p','先选择领域，再填写正在考虑的两个方案。'));return;}root.YPXDecision?.mount(result,{domain:select.value,basis:`所选流月${r.month}，大运${r.run}；${f.main}。这些是命盘关系，不是现实条件的证明。`});}
 select.addEventListener('change',options);situation.addEventListener('change',render);three.append(fields,result);
 const explanation=el('details');explanation.className='mf-explanation';explanation.append(el('summary','为什么这样解读？查看命盘与时间依据'),el('p','命盘提供传统文化的观察角度；上面的行动来自你选择的现实场景，不表示这个月一定发生相应事件。'),one,two);box.append(three,explanation);host.append(box);options();
};
})(typeof globalThis!=='undefined'?globalThis:this);
