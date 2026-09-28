(function(root){
'use strict';
const personal={
工作:['明确一个交付目标和验收标准','避免职责不清就答应额外任务','选一个积压任务，写下负责人、截止时间和第一步','先安排30分钟梳理，再与相关人确认范围','需求或权限不明确时先补信息','检查返工次数、完成情况和实际耗时'],
创作:['把一个想法做成可以观看的小样','避免同时开太多选题，或只修改却不发布验证','选一个主题，写三句话大纲，做一个最小版本','分开安排构思、制作和反馈三个时段','素材授权或表达对象不清楚时先核实','记录完成的作品、具体反馈与下一次修改'],
学习:['围绕一个问题安排学习和练习','避免只收藏资料、不做输出','选一份资料，读完后用自己的话解释一个概念','每次学习后做一道练习或一个小应用','基础概念不理解时回到例子，不急着追进度','检查能否独立解释、应用，并记录仍不理解的地方'],
关系:['把一个真实需求说清楚并听取回应','避免读心、冷处理或用命理标签评价对方','约一次双方方便的交流，只讨论一个问题','按事实、感受、需求、具体请求依次表达','情绪升级时先约定暂停和恢复讨论时间','记录是否形成双方都理解的约定'],
生活安排:['给本月确定一项可持续的小调整','避免为了完成计划持续挤占休息','选一处最影响日常的安排，从十分钟整理开始','设固定时间，减少步骤，并留出缓冲','计划明显超出可用时间时缩小范围','观察实际坚持次数与生活负担是否减少']};
const pair={
伴侣:['协商相处时间、独处时间与共同责任','避免把不同需求解读成不在乎，或以合盘要求对方改变','各写一项希望保留的边界与一项可以调整的安排','约定一周试行，到期双方分别反馈','一方不愿讨论时不强迫承诺，先确认是否愿意另约时间','检查约定是否自愿、清楚、可持续'],
朋友:['确认彼此舒服的联系频率与互助范围','避免默认随时在线、默认借钱或无限帮助','明确一次邀约或一次请求，允许对方拒绝','把时间、事项和是否方便说清楚','对方已表达不方便时停止追问','观察互动是否让双方都感到轻松和被尊重'],
家人:['区分关心、建议与替对方做决定','避免用辈分或命理结论替代沟通','选一件反复争执的小事，说明自己能够承担的部分','只谈当下事项，确认哪些由谁决定','争论转向人格评价时暂停，改约具体议题','检查边界是否被尊重，责任是否更明确'],
工作搭档:['明确交付、责任与资源分配','避免口头默契代替关键约定','先做一个范围小、可退出的共同任务','写下分工、验收、截止时间与变更方式','资源、权限或费用未确认时不扩大投入','复盘交付质量、负担分配和协作成本']};
function put(state,id,item){const next=JSON.parse(JSON.stringify(state));if(!next[id]&&Object.keys(next).length>=3)throw Error('最多保留三项计划，请先移除一项。');next[id]=item;return next;}
function validateBackup(value,mode,identity){
 if(!value||value.version!==1||value.mode!==mode||JSON.stringify(value.identity)!==JSON.stringify(identity))throw Error('备份不属于当前个人月份或双人组合。');
 const data=value.plans,allowed=mode==='pair'?pair:personal;
 if(!data||typeof data!=='object'||Array.isArray(data)||Object.keys(data).length>3)throw Error('备份计划格式无效。');
 for(const [id,v] of Object.entries(data))if(!Object.hasOwn(allowed,id)||!v||typeof v.title!=='string'||v.title.length>300||typeof v.feedback!=='string'||v.feedback.length>3000||!['准备开始','进行中','已完成','不适用'].includes(v.status))throw Error('备份包含无效计划。');
 return JSON.parse(JSON.stringify(data));
}
if(typeof module!=='undefined'&&module.exports){module.exports={personal,pair,put,validateBackup};return;}
const pending=new Map();
root.addEventListener('beforeunload',e=>{if([...pending.values()].some(Boolean)){e.preventDefault();e.returnValue='';}});

root.YPXActions=function(host,mode,identity){
 const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;},button=(text,fn)=>{const b=el('button',text);b.type='button';b.className='btn btn-ghost';b.addEventListener('click',fn);return b;};
 const box=el('section'),select=el('select'),content=el('div'),plans=el('div'),status=el('p');box.className='ypx-action-plan';status.setAttribute('role','status');
 const data=mode==='pair'?pair:personal,key='ypx_action_plan_v1:'+JSON.stringify([mode,identity]);let state={},writable=true;const draftKey=key+':draft';
 try{const raw=JSON.parse(localStorage.getItem(key)||'{}');if(!raw||Array.isArray(raw)||typeof raw!=='object'||Object.keys(raw).length>3||Object.values(raw).some(v=>!v||typeof v.title!=='string'||typeof v.feedback!=='string'||!['准备开始','进行中','已完成','不适用'].includes(v.status)))throw Error();state=raw;}catch(e){writable=false;status.textContent='本机计划无法读取，已阻止覆盖。仍可查看建议。';}
 function save(next){if(!writable)return false;try{localStorage.setItem(key,JSON.stringify(next));state=next;pending.delete(key);try{localStorage.removeItem(draftKey);}catch(e){}status.textContent='已保存到当前浏览器。';return true;}catch(e){status.textContent='保存失败，当前输入仍保留，请复制备份。';return false;}}
 try{const draft=localStorage.getItem(draftKey);if(draft){state=validateBackup(JSON.parse(draft),mode,identity);pending.set(key,true);status.textContent='已恢复上次未提交的草稿，请保存进度与复盘。';}}catch(e){status.textContent='草稿无法读取；已保存的计划仍保留。';}
 const editors=new Map();
 function snapshot(){const next=JSON.parse(JSON.stringify(state));editors.forEach((v,id)=>{if(next[id])next[id]={...next[id],status:v.progress.value,feedback:v.feedback.value};});return next;}
 function draft(){pending.set(key,true);try{localStorage.setItem(draftKey,JSON.stringify({version:1,mode,identity,plans:snapshot()}));status.textContent='草稿已暂存，点击保存可正式更新计划。';}catch(e){status.textContent='草稿暂存失败，请先复制或导出，勿切换月份或重新排盘。';}}
 const file=el('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label','恢复当前计划备份');
 file.addEventListener('change',async()=>{const f=file.files?.[0];if(!f)return;try{if(f.size>100000)throw Error('备份不可超过100KB。');const next=validateBackup(JSON.parse(await f.text()),mode,identity);if(Object.keys(state).length||pending.get(key)){status.textContent='当前已有计划，请先导出并移除现有计划，再恢复备份，避免覆盖。';return;}if(save(next))renderPlans();}catch(e){status.textContent='恢复失败：'+e.message;}finally{file.value='';}});
 box.append(button('导出计划与复盘',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,mode,identity,plans:snapshot()},null,2)],{type:'application/json'})),a=el('a');a.href=url;a.download='私人行动计划.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}),el('p','恢复备份只接受相同个人月份或双人组合；已有计划不会被覆盖。'),file);
 Object.keys(data).forEach(k=>{const o=el('option',k);o.value=k;select.append(o);});select.value=Object.keys(data)[0];select.setAttribute('aria-label',mode==='pair'?'选择双方关系类型':'选择当前关注事项');
 let proposed='';
 function render(){content.replaceChildren();const topic=select.value,custom=el('textarea');custom.rows=3;custom.maxLength=280;custom.setAttribute('aria-label','要保存的具体行动');custom.placeholder='写下你决定验证的步骤、完成条件和回看时间。';custom.value=proposed;custom.addEventListener('input',()=>{proposed=custom.value;});content.append(el('p','只保存你明确选择的行动，不再自动填入通用建议。同一类别已有计划时会保留原计划。'),custom,button('加入我的三项计划',()=>{try{if(!custom.value.trim())throw Error('请先写下具体行动，或从方案比较带入。');if(state[topic])throw Error('这个类别已有计划，已保留原内容；请先复盘或移除原计划，再加入新行动。');const next=put(snapshot(),topic,{title:topic+'：'+custom.value.trim(),status:'准备开始',feedback:''});if(save(next)){proposed='';custom.value='';renderPlans();}}catch(e){status.textContent=e.message;}}));}
 box.receiveDecision=(topic,text)=>{if(!Object.hasOwn(data,topic))topic=mode==='pair'?'伴侣':'生活安排';select.value=topic;proposed=text;render();status.textContent='验证步骤已带入，尚未保存。请核对后加入计划。';};
 function renderPlans(){editors.clear();plans.replaceChildren();plans.append(el('h4',`我的计划（${Object.keys(state).length}/3）`));Object.entries(state).forEach(([id,item])=>{const card=el('article'),progress=el('select'),feedback=el('textarea');['准备开始','进行中','已完成','不适用'].forEach(s=>{const o=el('option',s);o.value=s;progress.append(o);});progress.value=item.status;progress.setAttribute('aria-label',item.title+'状态');feedback.value=item.feedback;feedback.maxLength=3000;feedback.rows=3;editors.set(id,{progress,feedback});progress.addEventListener('change',draft);feedback.addEventListener('input',draft);feedback.placeholder='实际发生了什么？没有发生或建议不适用，也请记录。';feedback.setAttribute('aria-label',item.title+'复盘');card.append(el('p',item.title),progress,feedback,button('保存进度与复盘',()=>{if(save(put(snapshot(),id,{...item,status:progress.value,feedback:feedback.value})))status.textContent='进度和复盘已保存。';}),button('移除计划',()=>{const next=snapshot();delete next[id];if(save(next))renderPlans();}));plans.append(card);});}
 select.addEventListener('change',()=>{proposed='';render();});box.append(el('h3',mode==='pair'?'把合盘转为相处行动':'把解读转为本月行动'),el('p','保存你选择的具体行动，最多三项。进度、复盘和备份仍保留在本机；没有点击保存的输入不会自动保存。'),select,status,content,plans);host.append(box);render();renderPlans();
};
})(typeof globalThis!=='undefined'?globalThis:this);
