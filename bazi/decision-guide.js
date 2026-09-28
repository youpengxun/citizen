(function(root){
'use strict';
const ROUTES={
 '工作／求职':{topic:'工作',scenes:['找工作，投递没有回复','面试或沟通卡住','比较两个岗位或安排','考虑离开当前工作'],measure:'实际回复、明确条件或能验证的岗位匹配',experiment:'针对目标岗位验证一项关键要求，拿到具体反馈再比较',stop:'若岗位条件、职责或试行安排与预期不符，先重新核对方案'},
 '创作／项目':{topic:'创作',scenes:['想开始但没有成品','已有作品但反馈不足','比较两个创作方向','考虑扩大项目投入'],measure:'目标受众能否理解、使用或愿意继续接触作品',experiment:'让目标受众实际看或使用一个版本，记录他们做了什么而非只收集赞美',stop:'如果反馈没有验证主题，先修改最小版本，不因已有投入继续扩大'},
 '关系／沟通':{topic:'关系',scenes:['同一个问题反复出现','准备提出一个请求','比较两种相处安排','需要重新划清边界'],measure:'对方是否自愿回应，双方是否理解同一项约定',experiment:'提出一项可以明确接受、修改或拒绝的请求，等待对方真实回应',stop:'对方不愿意或试行使一方不舒服时，停止单方面推进并重谈边界',consent:true},
 '学习／生活':{topic:'学习',scenes:['备考或技能学习','练习没有明显效果','作息与精力安排','家务或日常任务过载'],measure:'能否独立完成目标任务，或日常负担是否实际减少',experiment:'用一次可观察的实践代替继续收集资料，记录完成情况和实际耗时',stop:'若安排持续超过可用精力，缩小范围或调整节奏，不把中断视为失败'},
 '双人合盘':{topic:'伴侣',scenes:['总是谈不拢','分工让我觉得累','想靠近，也想有空间','钱和投入不好开口','我们下一步怎么走'],measure:'双方是否自愿参与、责任是否清楚、安排是否可持续',experiment:'由双方分别确认一项能接受的试行约定，保留修改和拒绝的空间',stop:'任何一方不同意时，不把合盘当作说服对方的理由',consent:true}
};

const SCENES={
 '找工作，投递没有回复':['比较目标岗位要求与自己提交的材料，先让一位了解岗位的人指出缺少哪项证据','目标岗位匹配反馈，而非仅统计投递数量'],
 '面试或沟通卡住':['回看一次具体问答，补足未说清的经历或条件，并确认下一步由谁跟进','问题是否得到回应、后续步骤是否明确'],
 '比较两个岗位或安排':['分别核实职责、工作方式与评价标准，将仍未确认的条件单独列出','关键条件的确认程度和与你优先事项的匹配'],
 '考虑离开当前工作':['分别验证留下时能改变的条件与新安排是否真实可用，先补证据再做不可逆决定','现有问题是否可改善，以及替代安排是否经过核实'],
 '想开始但没有成品':['用一个能够独立看懂的小样检验主题，先明确交付内容，不扩展制作范围','小样是否完成、受众能否复述主题'],
 '已有作品但反馈不足':['请实际目标受众指出看懂了什么、在哪一步停下，不只询问喜不喜欢','可复述的理解、停留或使用记录'],
 '比较两个创作方向':['在相近制作时间内做两个小样，用同一组问题向相同受众收集反馈','控制制作投入后，两种方向的实际反馈差异'],
 '考虑扩大项目投入':['先复现一次已有成果，核实额外投入是否解决明确瓶颈','成果能否重复，以及新增投入是否对应真实限制'],
 '同一个问题反复出现':['各自描述最近一次发生了什么，核对双方是否在谈同一个问题','是否找到了双方认可的具体争议点'],
 '准备提出一个请求':['说明想改变的一项具体安排，让对方明确接受、修改或拒绝','请求是否清楚，对方是否自愿回应'],
 '比较两种相处安排':['先确定双方都同意试行的最小范围，分别记录舒适与负担','双方各自的反馈，不只是一方满意'],
 '需要重新划清边界':['说明自己能承担和不能承担的部分，不替对方决定反应','边界是否说清，以及实际安排是否尊重它'],
 '备考或技能学习':['完成一道贴近目标的题目或任务，按错误类型决定补哪一项基础','独立完成情况与具体错误变化'],
 '练习没有明显效果':['用同一任务做前后对照，记录哪里仍需要提示，而非只延长练习时间','提示依赖是否减少、关键环节是否改进'],
 '作息与精力安排':['只改变一项日程，连续记录实际可执行性和自身感受','是否能持续执行且没有增加负担'],
 '家务或日常任务过载':['记录一次实际任务耗时，区分必要事项、可删减事项与可协商分工','总耗时和需要反复提醒的负担是否减少'],
 '总是谈不拢':['双方先复述对方想解决的问题，确认理解后只比较这一项安排','是否能说出共同讨论的问题，而非谁说服了谁'],
 '分工让我觉得累':['分别列出执行、提醒、协调和收尾工作，试调一项分工','双方真实耗时与隐形工作负担的变化'],
 '想靠近，也想有空间':['各自给出可接受的联系频率和独处时段，先寻找自愿的交集','双方能否保有空间，又明确何时可联系'],
 '钱和投入不好开口':['只核对一项具体共同投入的用途、各自责任和可拒绝范围，未确认前不扩大','双方是否对投入和责任作出明确同意'],
 '我们下一步怎么走':['分别提出一个愿意共同尝试的小目标，找交集并约定回看时间','双方是否仍自愿继续，而非是否完成预设关系进度']
};

const PRIORITIES={'减少负担':'实际耗时与负担','获得反馈':'可观察的反馈','保留选择':'退出与调整的空间','稳定推进':'可重复执行的条件'};
function analyze(v,cfg){
 const source=ROUTES[cfg.domain];if(!source)throw Error("请选择有效领域。");const route={...source};if(SCENES[v.scene]){route.experiment=SCENES[v.scene][0];route.measure=SCENES[v.scene][1];}if(['作息与精力安排','家务或日常任务过载'].includes(v.scene))route.topic='生活安排';const consent=!!route.consent;
 if(!route||!v.scene||!v.question.trim()||!v.a.trim()||!v.b.trim()||!v.priority||!v.deadline||!v.limit.trim())throw Error('请补齐具体问题、两个方案、优先事项、回看日期和不可接受的代价。');
 if(v.a.trim()===v.b.trim())throw Error('两个方案相同，请说明实际差别后再比较。');if(!Object.hasOwn(PRIORITIES,v.priority))throw Error('请选择有效优先事项。');const cap=Number(v.capacity);if(v.capacity===''||!Number.isFinite(cap)||cap<0||cap>168)throw Error('每周可用时间请填写0—168小时，0表示目前没有新增时间。');
 if(consent&&!v.consent)throw Error('请说明对方是否愿意参与；不确定也可以如实选择。');
 const rows=['a','b'].map(k=>{const cost=Number(v[k+'Hours']);if(v[k+'Hours']===''||!Number.isFinite(cost)||cost<0||cost>168)throw Error('请分别填写两个方案每周预计需要的时间。');if(!v[k+'Evidence']||!v[k+'Exit'])throw Error('请补齐两个方案的验证状态和调整空间。');const evidence=v[k+'Evidence'],exit=v[k+'Exit'];const gaps=[];if(cost>cap)gaps.push(`比可用时间多${+(cost-cap).toFixed(1)}小时/周`);if(evidence==='未验证')gaps.push('效果尚未验证');if(evidence==='反馈不理想')gaps.push('已有反馈未达到预期');if(exit==='难以退出')gaps.push('一旦开始较难调整');return {key:k,name:v[k].trim(),cost,evidence,exit,gaps,within:cost<=cap};});
 let focus,step;
 if(consent&&v.consent!=='双方愿意'){focus=v.consent==='对方不愿意'?'先尊重对方已经表达的拒绝，不能替双方制定共同计划。':'先确认对方是否愿意讨论，当前不能把共同试行视为已获同意。';step='先确认是否愿意讨论“'+v.question.trim()+'”；若不愿意，保留自己的边界，不推进共同方案。';}
 else if(rows.every(x=>!x.within)){focus=`两个方案都超过你填写的每周${cap}小时容量。当前卡点是安排不成立，而非不知道选哪个。`;step=`先把“${rows[0].name}”或“${rows[1].name}”缩到每周${cap}小时以内，或明确要替换掉哪项已有安排。`;}
 else {const eligible=rows.filter(x=>x.within),verified=eligible.filter(x=>x.evidence==='已有正向反馈');let chosen=verified.length===1?verified[0]:null;if(v.priority==='保留选择'){const reversible=eligible.filter(x=>x.exit==='可以小范围试行'&&x.evidence!=='反馈不理想');chosen=reversible.length===1?reversible[0]:null;}
 focus=chosen?`按你填写的条件，“${chosen.name}”已有${chosen.evidence==='已有正向反馈'?'正向反馈':'可试行的空间'}且在时间容量内，可以优先拿来验证；这仍不是最终选择。`:`在“${rows[0].name}”与“${rows[1].name}”之间，目前还缺少能比较${PRIORITIES[v.priority]}的证据，不直接替你选。`;
 step=chosen?`在${v.deadline}前，用“${chosen.name}”验证${PRIORITIES[v.priority]}；${route.experiment}。`:`在${v.deadline}前，为两个方案各补一条关于${PRIORITIES[v.priority]}的实际记录；${route.experiment}。`;
 }
 return {route,rows,focus,step,measure:route.measure,stop:`你设定的底线是“${v.limit.trim()}”。若实际触及它，停止扩大投入并重新比较；${route.stop}。`};
}
root.YPXDecision={analyze,mount};
function el(t,s){const n=document.createElement(t);if(s!==undefined)n.textContent=s;return n;}
function mount(host,cfg){
 const route=ROUTES[cfg.domain];if(!route)return;
 const box=el('section'),form=el('form'),fields={},result=el('div'),message=el('p');box.className='ypx-decision';message.setAttribute('role','status');result.className='decision-result';
 box.append(el('h4','把问题说具体，再比较怎么做'),el('p','这份比较使用你填写的方案、时间、验证状态和底线。文字说明原样列出，不会被AI自动理解；没有依据时不替你做选择。'));
 function input(key,label,options,type='text'){const l=el('label',label),n=el(options?'select':'input');n.setAttribute('aria-label',label);if(options){const o=el('option','请选择');o.value='';n.append(o);options.forEach(text=>{const x=el('option',text);x.value=text;n.append(x);});}else{n.type=type;if(type==='text')n.maxLength=240;if(type==='number'){n.min=0;n.max=168;n.step='0.5';}}n.required=true;fields[key]=n;l.append(n);return l;}
 const scene=input('scene','正在处理的情况',route.scenes);if(cfg.stage&&route.scenes.includes(cfg.stage))fields.scene.value=cfg.stage;form.append(scene,input('question','这次具体要决定什么？'));
 const grid=el('div');grid.className='decision-grid';['a','b'].forEach((k,i)=>{const card=el('fieldset');card.append(el('legend',i?'方案B':'方案A'),input(k,i?'方案B的具体安排':'方案A的具体安排'),input(k+'Hours',(i?'B':'A')+'每周预计需要几小时',null,'number'),input(k+'Evidence',(i?'B':'A')+'目前的验证状态',['未验证','已有正向反馈','反馈不理想']),input(k+'Exit',(i?'B':'A')+'能否先试再调整',['可以小范围试行','难以退出']));grid.append(card);});form.append(grid);
 form.append(input('capacity','每周实际可用时间（小时）',null,'number'),input('priority','这次最优先满足什么',Object.keys(PRIORITIES)),input('limit','不能接受的代价或边界'),input('deadline','准备哪天回看结果',null,'date'));fields.deadline.min=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 if(route.consent)form.append(input('consent','对方是否愿意参与',['双方愿意','尚未确认','对方不愿意']));
 const go=el('button','生成我的方案比较');go.type='submit';form.append(go);box.append(form,message,result);host.append(box);
 let snapshot=null;
 form.addEventListener('input',()=>{if(snapshot){result.replaceChildren();snapshot=null;message.textContent='条件已改变，请重新生成比较，避免沿用旧结论。';}});
 form.addEventListener('submit',e=>{e.preventDefault();result.replaceChildren();try{const v=Object.fromEntries(Object.entries(fields).map(([k,n])=>[k,n.value]));const data=analyze(v,cfg);snapshot={v,data};message.textContent='比较已生成；仅依据本次填写条件，不是命理评分。';
 result.append(el('h4','01 · 你现在真正卡在哪里'),el('p',data.focus),el('p','你的问题：'+v.question+'；目前处于：'+v.scene+(cfg.relation?'；关系：'+cfg.relation:'')+'。'));
 const comparison=el('div');comparison.className='decision-grid';data.rows.forEach(row=>{const c=el('article');c.append(el('h4',(row.key==='a'?'方案A：':'方案B：')+row.name),el('p',`时间：${row.cost}小时/周；你可用${v.capacity}小时/周。`),el('p',`证据：${row.evidence}；调整空间：${row.exit}。`));const ul=el('ul');(row.gaps.length?row.gaps:['在你填写的时间条件内；仍需验证具体效果。']).forEach(s=>ul.append(el('li',s)));c.append(ul);comparison.append(c);});result.append(el('h4','02 · 两个方案各自卡在哪里'),comparison,el('h4','03 · 下一步验证什么'),el('p',data.step),el('p','回看指标：'+data.measure+'。'),el('h4','04 · 什么时候调整'),el('p',data.stop));
 const basis=el('details');basis.append(el('summary','命盘依据与这份建议是什么关系？'),el('p',cfg.basis||'双方命盘的具体十神与关系见下方对照。出生信息不提供对方的意愿。'),el('p','方案比较来自你填写的现实条件。命盘关系没有被换算成方案胜率，也没有替代时间、证据或双方同意。'));result.append(basis);
 const status=el('p');status.setAttribute('role','status');
 const plan=el('button','把验证步骤带到我的计划');plan.type='button';plan.addEventListener('click',()=>{const area=box.closest('#ypx-transits')||box.closest('#compare'),target=area?.querySelector('.ypx-action-plan');if(!target?.receiveDecision){status.textContent='计划区尚未就绪，可先下载比较记录。';return;}target.receiveDecision(cfg.relation||data.route.topic,data.step.slice(0,280));target.closest('details')?.setAttribute('open','');target.scrollIntoView({block:'nearest'});status.textContent='已带入计划草稿，请核对后点击加入保存。';});
 const download=el('button','下载这次比较');download.type='button';download.addEventListener('click',()=>{const text=[v.question,v.scene,data.focus,...data.rows.map(x=>x.name+'：'+x.cost+'小时/周；'+x.evidence+'；'+x.exit+'；'+x.gaps.join('；')),data.step,data.stop,'回看日期：'+v.deadline].join('\n\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=el('a');a.href=url;a.download='我的方案比较.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});result.append(plan,download,status,el('small','输入与比较仅在本次页面保留，切换月份、问题或重新排盘会清除。需要保留时请下载，或带入计划后明确保存。'));
 }catch(err){message.textContent=err.message;}});
}
})(globalThis);
