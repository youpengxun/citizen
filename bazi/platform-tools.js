(function(root){
'use strict';
const keys=['year','month','day','hour'],labels=['年柱','月柱','日柱','时柱'];
function yun(info,gender,Solar){
 if(!Solar)throw Error('起运历法未加载，请刷新页面。');
 if(!['男','女','male','female'].includes(gender))throw Error('请选择排运所用性别。');
 const solar=Solar.fromYmdHms(info.year,info.month,info.day,info.bjHour??info.hour,info.bjMinute??info.minute??0,0);
 const y=solar.getLunar().getEightChar().getYun(gender==='男'||gender==='male'?1:0,2);
 const start=y.getStartSolar(),years=y.getStartYear(),months=y.getStartMonth(),days=y.getStartDay(),hours=y.getStartHour();
 const runs=y.getDaYun(9).slice(1).map((r,i)=>{const gz=r.getGanZhi();return {order:i+1,stem:gz[0],branch:gz[1],gz,age:years+i*10,start_date:start.nextYear(i*10).toYmdHms(),end_date:start.nextYear((i+1)*10).toYmdHms()};});
 return {forward:y.isForward(),start_age:years,start_label:`${years}年${months}个月${days}天${hours}小时`,start_date:start.toYmdHms(),rule:'lunar-javascript 1.7.5 · 起运流派2（分钟折算）· UTC+8标准出生时间，与真太阳时日时柱设置独立',runs};
}
function pairs(a,b,K){const out=[];for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(const [label,map]of [['六合',K.BRANCH_LIUHE],['六冲',K.BRANCH_CHONG],['六害',K.BRANCH_HAI]])if(map[a[keys[i]].branch]===b[keys[j]].branch)out.push(`甲方${labels[i]} ${a[keys[i]].branch} — ${label} — 乙方${labels[j]} ${b[keys[j]].branch}`);return out;}
function search(KB,q){const query=q.trim().toLowerCase();return (KB.CATEGORIES||[]).flatMap(c=>(KB[c.key]||[]).map((a,i)=>({cat:c.key,index:i,title:a.title,category:c.label,content:a.content||''}))).filter(a=>!query||(a.title+' '+a.category+' '+a.content).toLowerCase().includes(query));}
function importCases(data,existing){
 const items=Array.isArray(data)?data:[data];if(items.length>200)throw Error('每次最多导入200条案例。');
 const result=structuredClone(existing),ids=new Set(existing.map(r=>r.id));let added=0,skipped=0;
 for(const r of items){
  if(!r||r.version!==1||typeof r.id!=='string'||r.id.length>100||!r.input||!r.analysis||!r.analysis.pillars)throw Error('文件不是本站案例备份，未导入任何记录。');
  const p=r.input;if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date||'')||!/^\d{2}:\d{2}$/.test(p.time||'')||!['男','女'].includes(p.gender))throw Error('案例日期、时间或性别格式无效。');
  const [y,m,d]=p.date.split('-').map(Number),[h,min]=p.time.split(':').map(Number),dt=new Date(Date.UTC(y,m-1,d));
  if(y<1940||y>2030||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d||h>23||min>59)throw Error('案例时间不在支持范围内。');
  if(typeof r.title!=='string'||r.title.length>80||typeof r.note!=='string'||r.note.length>10000)throw Error('标题或笔记格式无效。');
  if(p.options?.longitude!=null&&(!Number.isFinite(p.options.longitude)||Math.abs(p.options.longitude)>180))throw Error('案例经度无效。');
  if(ids.has(r.id)){skipped++;continue;} ids.add(r.id);result.push(structuredClone(r));added++;
 }
 return {records:result,added,skipped};
}
const api={yun,pairs,search,importCases};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}root.YPXTools=api;
document.addEventListener('DOMContentLoaded',()=>{
 const K=root.KnowledgeBazi,$=s=>document.querySelector(s);
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const btn=(text,fn)=>{const b=el('button',text,'btn btn-ghost');b.type='button';b.addEventListener('click',fn);return b;};
 const message=el('p','','ypx-local-message');message.setAttribute('role','status');
 const box=el('div','','ask-panel glass ypx-local-tools'),recordList=el('div');
 const casePanel=$('#cases .ask-panel');if(casePanel)casePanel.replaceWith(box);
 box.append(el('h3','本机案例与笔记'),el('p','仅在点击保存后存入当前浏览器。不会上传或同步；清除浏览器数据可能丢失，请导出备份。'),message,recordList);
 const storageKey='ypx_private_cases_v1';let records=[],latest=null,storageReadable=true;
 try{const raw=JSON.parse(localStorage.getItem(storageKey)||'[]');if(!Array.isArray(raw)||raw.some(r=>!r||!r.input||!r.analysis||!r.analysis.pillars))throw Error();records=raw;}catch(e){storageReadable=false;message.textContent='本机存储不可用或记录格式异常；已有数据未覆盖。';}
 function write(next){if(!storageReadable){message.textContent="无法读取现有存档，已阻止覆盖，请先导出本次结果。";return false;}try{localStorage.setItem(storageKey,JSON.stringify(next));records=next;return true;}catch(e){message.textContent='保存失败，可能未允许本机存储或空间不足。请导出本次结果。';return false;}}
 function download(data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=el('a');a.href=url;a.download='有朋迅-私人案例.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const query=el('input');query.type='search';query.placeholder='搜索案例标题、日期、笔记';query.setAttribute('aria-label','搜索本机案例');query.addEventListener('input',renderRecords);
 const file=el('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label','导入本站JSON案例备份');
 file.addEventListener('change',async()=>{const selected=file.files?.[0];if(!selected)return;try{if(selected.size>5*1024*1024)throw Error('备份文件不可超过5MB。');const merged=importCases(JSON.parse(await selected.text()),records);if(write(merged.records)){message.textContent=`导入${merged.added}条，跳过${merged.skipped}条重复案例。`;renderRecords();}}catch(e){message.textContent='导入失败：'+e.message;}finally{file.value='';}});
 box.append(query,el('p','导入本站导出的JSON备份；重复ID保留本机版本。'),file,btn('导出全部案例（含回收区）',()=>download(records)));box.append(recordList);
 function loadCase(r){try{const cal=$('#uf-cal');if(!cal)throw Error('排盘表单尚未就绪。');cal.value='solar';cal.dispatchEvent(new Event('change',{bubbles:true}));$('#uf-date').value=r.input.date;$('#uf-time').value=r.input.time;$('#uf-gender').value=r.input.gender;$('#uf-name').value=r.title;$('#uf-q').value='';const place=$('#uf-place'),lon=r.input.options?.longitude;place.value=lon!=null?'__custom__':'';place.dispatchEvent(new Event('change',{bubbles:true}));$('#uf-lon').value=lon!=null?String(lon):'';const report=$('#unified-report');if(report)report.replaceChildren();latest=null;location.hash='ask';message.textContent='已按存档中的公历时间和经度载入；点击排盘将使用当前引擎重新计算，原快照保留。';}catch(e){message.textContent=e.message;}}
 function renderRecords(){recordList.replaceChildren();if(!records.length)recordList.append(el('p','尚无本机案例。完成一次排盘后，点击“保存到本机案例”。'));const term=(query.value||'').trim().toLowerCase();let shown=0;records.forEach((r,i)=>{if(term&&!`${r.title} ${r.note} ${r.input.date}`.toLowerCase().includes(term))return;shown++;const card=el('article','','ypx-case-entry');card.append(el('h4',r.title||'未命名案例'));if(r.deleted){card.append(el('p','已移入回收区'),btn('恢复',()=>{const next=structuredClone(records);delete next[i].deleted;if(write(next))renderRecords();}));recordList.append(card);return;}
 card.append(el('p',`${r.input.date} ${r.input.time} · ${r.input.gender} · ${r.saved}`));
 const title=el('input');title.value=r.title||'';title.maxLength=80;title.setAttribute('aria-label','案例标题');
 const note=el('textarea');note.value=r.note||'';note.maxLength=10000;note.setAttribute('aria-label','案例笔记');
 card.append(title,note,btn('载入排盘表单',()=>loadCase(r)),btn('保存标题与笔记',()=>{const next=structuredClone(records);next[i].title=title.value;next[i].note=note.value;if(write(next)){message.textContent='笔记已保存到本机。';renderRecords();}}),btn('查看存档',()=>{const pre=el('pre',JSON.stringify(r.analysis.pillars,null,2));pre.className='ypx-snapshot';card.append(pre);}),btn('导出此案例',()=>download(r)),btn('移入回收区',()=>{const next=structuredClone(records);next[i].deleted=true;if(write(next))renderRecords();}));recordList.append(card);});if(records.length&&!shown)recordList.append(el('p','没有匹配的案例。'));}
 renderRecords();
 root.addEventListener('ypx:chart-ready',event=>{latest=event.detail;const report=$('#unified-report');if(!report)return;const actions=el('div','','ypx-local-actions');actions.append(btn('保存到本机案例',()=>{const record={version:1,id:Date.now().toString(36),title:latest.name||'我的排盘记录',note:'',saved:new Date().toLocaleString(),input:latest.input,analysis:latest.analysis};if(write([...records,record])){renderRecords();message.textContent='已保存，可添加标题与笔记。';location.hash='cases';}}),btn('导出本次排盘',()=>download(latest)));report.prepend(actions);});
 // 双人排盘明确使用标准时间，复用原有引擎及表格。
 const compare=$('#compare .ask-panel');if(compare){compare.replaceChildren();compare.append(el('h3','双人八字对照'),el('p','采用公历、UTC+8标准时间与午夜换日。分别计算双方四柱；此版展示十神与六合、六冲、六害，不生成婚配评分或关系预测。'));
 const f=el('form','','ypx-pair-form');const inputs=[];
 ['甲方','乙方'].forEach(label=>{const field=el('fieldset');field.append(el('legend',label));const date=el('input');date.type='date';date.required=true;date.min='1940-01-01';date.max='2030-12-31';date.setAttribute('aria-label',label+'公历日期');const time=el('input');time.type='time';time.required=true;time.setAttribute('aria-label',label+'时间');const gender=el('select');gender.required=true;gender.setAttribute('aria-label',label+'排运性别');[['','请选择排运性别'],['男','男'],['女','女']].forEach(([value,text])=>{const o=el('option',text);o.value=value;gender.append(o);});field.append(date,time,gender);inputs.push({date,time,gender});f.append(field);});const submit=el('button','生成双人对照','btn btn-primary');submit.type='submit';f.append(submit);const output=el('div');output.setAttribute('aria-live','polite');compare.append(f,output);
 f.addEventListener('input',()=>output.replaceChildren());f.addEventListener('submit',e=>{e.preventDefault();output.replaceChildren();try{const evidence=el('details');evidence.append(el('summary','为什么这样对照？查看双方命盘'));if(inputs.some(v=>!['男','女'].includes(v.gender.value)))throw Error('请选择双方排运性别。');const p=inputs.map(v=>{const [h,m]=v.time.value.split(':').map(Number);return K.calcBazi(v.date.value,h,{minute:m});});const table=el('table','','ypx-pair-table');const header=el('tr');['柱位','甲方','乙方'].forEach(t=>header.append(el('th',t)));table.append(header);keys.forEach((key,i)=>{const row=el('tr');row.append(el('th',labels[i]),...p.map(v=>el('td',v[key].stem+v[key].branch)));table.append(row);});evidence.append(el('p',`甲方：${inputs[0].gender.value} · 乙方：${inputs[1].gender.value}。性别用于传统排运顺逆，不改变同一出生时间的四柱，也不直接决定两人的关系。`),table,el('p',`以甲方日主为参照，乙方日干为${K.getTenGod(p[0].day.stem,p[1].day.stem)}；以乙方日主为参照，甲方日干为${K.getTenGod(p[1].day.stem,p[0].day.stem)}。`));const matches=pairs(p[0],p[1],K);evidence.append(el('h4','跨命盘地支配对'));if(!matches.length)evidence.append(el('p','未匹配到这三类配对，不代表不存在其他关系。'));matches.forEach(t=>evidence.append(el('p',t)));
 root.YPXReading?.pair(evidence,p,K);
 evidence.append(el('h4','双方排运与起运'));
 p.forEach((v,i)=>{const run=yun(v.birthInfo,inputs[i].gender.value,root.Solar);evidence.append(el('p',`${i===0?'甲方':'乙方'}：${run.forward?'顺排':'逆排'}，${run.start_label}起运，首次交运 ${run.start_date}。`),el('p','大运次序：'+run.runs.map(r=>r.gz+'（'+r.start_date.slice(0,10)+'起）').join(' → ')));});
 evidence.append(el('h4','如何理解这份对照'),el('p','十神是相对日主的五行生克与阴阳关系。同一个人，在对方命盘中的十神称呼可能不同；它不是对方固定的性格标签。'),el('p','六合：传统规则中的相合配对，可作为共同点与协作方式的讨论入口；出现相合不等于关系必然融洽，也不等于已经合化。'),el('p','六冲：传统规则中的相对配对，可用于观察节奏与选择上的差异；不能据此断定分手或冲突。'),el('p','六害：传统规则中的另一组配对，可作为沟通与边界的复盘线索；不能据此判断谁会伤害谁。'));
 const dayPair=pairs({year:p[0].day,month:p[0].day,day:p[0].day,hour:p[0].day},{year:p[1].day,month:p[1].day,day:p[1].day,hour:p[1].day},K);
 evidence.append(el('h4','日支重点对照'),el('p',`甲方日支${p[0].day.branch}，乙方日支${p[1].day.branch}。`+(dayPair.length?'这两个日支存在上述三类配对之一，请结合跨命盘配对列表查看。':'未检出六合、六冲、六害。')+' 日支在传统命理中常用于讨论亲密关系，但单一柱位不足以判断关系结果。'),el('h4','可以一起讨论的问题'),el('p','双方如何安排独处与相处时间？遇到分歧时如何表达需求？财务、家务与承诺如何分工？请以真实经历记录答案，再回看这些符号是否对理解彼此有帮助。'));
root.YPXPairGuide?.(output);output.append(evidence);const plans=el('details');plans.append(el('summary','留下一个共同计划'));root.YPXActions?.(plans,'pair',inputs.map(v=>[v.date.value,v.time.value,v.gender.value]));output.append(plans);
}catch(err){output.append(el('p',err.message));}});}
 // 全文检索现有知识库，复用原弹窗。
 const bar=$('#learnBar');if(bar){const searchBox=el('div','','ypx-learning-search'),input=el('input');input.type='search';input.placeholder='搜索标题、术语或正文';input.setAttribute('aria-label','学习知识全文搜索');const hits=el('div'),count=el('p');count.setAttribute('role','status');searchBox.append(input,count,hits);bar.before(searchBox);function update(){const results=search(root.KnowledgeBase,input.value);count.textContent=`共 ${results.length} 篇匹配文章（本站整理，出处仍需逐篇核验）`;hits.replaceChildren();results.forEach(a=>hits.append(btn(a.category+' · '+a.title,()=>root.dispatchEvent(new CustomEvent('ypx:open-article',{detail:a})))));}input.addEventListener('input',update);update();}
});
})(typeof globalThis!=='undefined'?globalThis:this);
