(function(root){
'use strict';
const keys=['year','month','day','hour'],labels=['年柱','月柱','日柱','时柱'];
const gods={
比肩:['同五行、同阴阳','同辈、自主与共同参与','合作时各自负责什么，哪些决定需要共同确认？'],
劫财:['同五行、异阴阳','资源分配、同辈竞争与合作','共享资源的投入、使用和退出规则是否清楚？'],
食神:['日主所生、同阴阳','持续表达、产出与日常节奏','哪些事情适合持续积累，而非一次完成？'],
伤官:['日主所生、异阴阳','表达、改进与规则之间的张力','提出不同意见时，能否同时说明事实与可执行方案？'],
偏财:['日主所克、同阴阳','资源调度、机会与灵活安排','尝试新机会前，投入上限与退出条件是否明确？'],
正财:['日主所克、异阴阳','稳定投入、具体责任与预算','时间、金钱和承诺是否有清楚的安排？'],
七杀:['克日主、同阴阳','压力、约束与行动要求','遇到压力时，哪些任务必须先做，哪些可以协商？'],
正官:['克日主、异阴阳','规范、角色与责任','双方对职责、期限和边界的理解是否一致？'],
偏印:['生日主、同阴阳','研究、独立理解与方法探索','新想法有哪些证据，下一步怎样验证？'],
正印:['生日主、异阴阳','学习、支持与经验吸收','需要什么支持，如何把学到的内容用起来？']};
function counts(p,K){const n={木:0,火:0,土:0,金:0,水:0};keys.forEach(k=>{n[K.STEM_ELEMENT[p[k].stem]]++;n[K.BRANCH_ELEMENT[p[k].branch]]++;});return n;}
function rows(p,day,K){return keys.map((k,i)=>({label:labels[i],gz:p[k].stem+p[k].branch,god:K.getTenGod(day,p[k].stem),hidden:(K.BRANCH_HIDDEN[p[k].branch]||[]).map(h=>h.gan+' '+K.getTenGod(day,h.gan)).join('、')}));}
const api={counts,rows,gods};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
const el=(t,text)=>{const n=document.createElement(t);if(text)n.textContent=text;return n;};
function table(title,headers,data){const section=el('section');section.append(el('h4',title));const wrap=el('div');wrap.style.overflowX='auto';const t=el('table');t.className='ypx-pair-table';const head=el('tr');headers.forEach(x=>head.append(el('th',x)));t.append(head);data.forEach(row=>{const tr=el('tr');row.forEach(x=>tr.append(el('td',String(x))));t.append(tr);});wrap.append(t);section.append(wrap);return section;}
function explain(title,day,stem,K){const god=K.getTenGod(day,stem),g=gods[god],section=el('section');section.append(el('h4',title+'：'+stem+' · '+god));if(g)section.append(el('p',`依据：以${day}为日主，${stem}对应「${g[0]}」，因此归为${god}。`),el('p','传统象征主题：'+g[1]+'。这描述的是关系类别，不是对人的固定判断。'),el('p','观察问题：'+g[2]));return section;}
api.pair=function(out,p,K){
 const block=el('section');block.className='ypx-detailed-reading';block.append(el('h3','逐层合盘解析'),el('p','先看双方本命结构，再看相互参照。以下采用原引擎的十神、藏干与地支关系表。'));
 p.forEach((v,i)=>{const who=i?'乙方':'甲方';block.append(table(who+'本命十神与藏干',['柱位','干支','天干十神（以本人日主）','藏干及十神'],rows(v,v.day.stem,K).map(r=>[r.label,r.gz,r.label==='日柱'?'日主':r.god,r.hidden])));});
 block.append(table('五行明字分布对照',['五行','甲方','乙方'],Object.keys(counts(p[0],K)).map(e=>[e,counts(p[0],K)[e],counts(p[1],K)[e]])),el('p','统计口径：四个天干与四个地支本气各计一次，共8字；不计藏干权重。数量多不等于旺，少或零不等于喜用，也不能推出双方必然互补。'));
 p.forEach((v,i)=>{const other=p[1-i],who=i?'乙方':'甲方',target=i?'甲方':'乙方';block.append(table('以'+who+'日主看'+target+'四柱',['对方柱位','干支','相对十神','对方藏干的相对十神'],rows(other,v.day.stem,K).map(r=>[r.label,r.gz,r.god,r.hidden])),explain(who+'如何参照'+target+'日干',v.day.stem,other.day.stem,K));});
 block.append(el('h4','关系落在哪个柱位，为什么要分开看？'),el('p','传统读法常将年柱联系到早年及外部环境，月柱联系到成长环境与社会角色，日柱联系到自身及亲密相处，时柱联系到后续规划。它们只是观察维度；跨盘年柱相冲与双方日支相冲，不能当作同一条结论。请对照上方逐条配对中的柱位，而非只数合冲数量。'),el('h4','目前可以确认与仍不能确认的部分'),el('p','可确认：输入条件下的四柱、相对十神、藏干、规则命中的配对，以及按所选性别计算的排运方向。尚未综合：月令旺衰、透干通根、合化条件、刑破三合三会、双方同一时刻的岁运触发。不能将这些基础表格转换成婚配总分或确定的婚姻结论。'));
 out.append(block);
};
api.month=function(out,a,r,K){const block=el('section');block.className='ypx-detailed-reading';const day=a.pillars.day.stem;
 block.append(el('h3','本命 × 流年 × 流月：详细依据'),table('你的本命参照',['柱位','干支','天干十神','藏干及十神'],rows(a.pillars,day,K).map(x=>[x.label,x.gz,x.label==='日柱'?'日主':x.god,x.hidden])));
 const layers=[['流年',r.year],['流月',r.month]];if(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/.test(r.run))layers.unshift(['大运',r.run]);
 layers.forEach(([name,gz])=>{block.append(explain(name+'天干',day,gz[0],K),el('p',name+'地支'+gz[1]+'的藏干参照：'+(K.BRANCH_HIDDEN[gz[1]]||[]).map(h=>h.gan+'（'+K.getTenGod(day,h.gan)+'）').join('、')+'。藏干与天干分开列出，不将藏干等同于已经透出。'));});
 block.append(el('h4','把年度背景和月度变化分开'),el('p',`流年${r.year}是所选时刻的年度干支背景；流月${r.month}只覆盖页面列出的交节区间。两者即使出现相同十神，也不能简单累加成吉凶分数。`),el('h4','哪些本命位置被触及？'));
 const hits=r.relations.filter(x=>x.startsWith('流月'));hits.forEach(x=>block.append(el('p',x+'。请先核对对应柱位，再结合该月实际变化作记录；单一合冲害不构成事件判断。')));if(!hits.length)block.append(el('p','本轮三类关系规则没有命中，不等于这个月没有变化。'));
 block.append(el('h4','月初计划 → 月中观察 → 月末复盘'),el('p','月初：写下本月真正要完成的目标，以及已知约束。月中：记录实际沟通、任务变化和自己的应对，不用符号替代事实。月末：对照原计划，区分事实、自己的感受和命理解释，保留与解释不一致的经历。'),el('p','规则边界：这里展开的是可追溯的传统符号解释。尚未纳入完整旺衰、用神与合化判断，不输出升职、疾病、财务得失或关系结局的确定预测。'));out.append(block);
};root.YPXReading=api;
})(typeof globalThis!=='undefined'?globalThis:this);
