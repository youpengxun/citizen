/* Local iztro data presentation. No invented placements or automatic geju verdicts. */
(function(root){
'use strict';
const HUA=['禄','权','科','忌'];
const DOMAINS={
 '命宫':['自我与选择','如何看待自己、习惯怎样作决定','选一件最近的决定，分别记录自己的意愿与外界期待。','不要凭一颗星把自己定性。'],
 '兄弟':['同辈与支持','与同辈之间的协作、支持与边界','列清可以互相帮忙的事项，确认帮助是否出于自愿。','不能据此判断手足人数或关系好坏。'],
 '夫妻':['亲密与约定','亲密关系中的相处期待与协商方式','用一个具体相处场景，和对方核对需要及边界。','星曜不能代替对方表达，也不决定婚姻结局。'],
 '子女':['照顾与延续','传统子女议题，以及照顾和持续投入的经验','区分自己愿意承担的照顾与外界要求，给长期投入留出容量。','不推断生育能力、子女性别或数量。'],
 '财帛':['资源与使用','资源取得、管理与使用的观察角度','核对现实收支、风险承受与可动用资源，再做决定。','不能从禄忌推断收益或投资时机。'],
 '疾厄':['身心与负荷','传统身心议题及生活负担的观察角度','记录休息、工作量与真实感受，有不适时寻求合适的医疗帮助。','星名、庙陷与神煞不是疾病诊断。'],
 '迁移':['外部环境','离开熟悉环境时的应对与适应','比较新环境的真实条件、支持资源与转变成本。','不能据此认定搬家、出行必然吉凶。'],
 '仆役':['伙伴与网络','合作对象、团队和往来的边界','把角色、责任、交付及退出方式讲清楚。','不以命盘判断别人是否可信。'],
 '官禄':['工作与实践','做事方式、职责与职业实践','用实际项目检视擅长的环节、卡点与可补足的能力。','不据此指定唯一职业或承诺升迁。'],
 '田宅':['居所与根基','居住、家庭空间与长期安顿','优先确认使用需要、负担能力和家人的实际意愿。','不推断房产数量或买卖涨跌。'],
 '福德':['内在与恢复','满足感、独处与恢复精力的方式','观察什么活动能让自己恢复，而非只是暂时分心。','不能据此判断心理疾病或一个人是否有福。'],
 '父母':['来处与支持','长辈、照顾关系与制度支持','区分可以沟通的期待、需要保留的边界及可获得的实际支持。','不以此推断长辈健康、寿命或品行。']
};
const STAR={紫微:'统筹与主导',天机:'思考与调整',太阳:'表达与承担',武曲:'执行与资源管理',天同:'安适与协调',廉贞:'原则与边界',天府:'积累与承载',太阴:'细察与储备',贪狼:'探索与交往',巨门:'辨析与言语',天相:'协调与规则',天梁:'支持与责任',七杀:'决断与改变',破军:'拆解与重建',文昌:'条理与书面表达',文曲:'表达与审美',左辅:'协助与配合',右弼:'协助与配合',天魁:'支持与机会',天钺:'支持与机会',禄存:'积累与资源',天马:'移动与调整',擎羊:'直接与张力',陀罗:'迟滞与反复',火星:'急切与突发',铃星:'紧绷与积压',地空:'落差与留白',地劫:'变动与损耗'};
const HUA_TEXT={禄:'传统上观察资源、吸引与投入；不是收入保证。',权:'传统上观察推动、责任与掌控；也要核对负担。',科:'传统上观察表达、名声与秩序；不是成功保证。',忌:'传统上观察牵挂、阻滞与反复；不等于灾难。'};


const SOLUTIONS={
 命宫:['总在别人的期待和自己的想法之间摇摆',['把正在决定的事写成一句话，只保留两个真实选项。','分别写清：自己想获得什么、别人希望什么。划掉仅为避免别人失望而增加的要求。','选一个可以撤回的小步骤，先做一次，再根据结果决定是否扩大。'],'我愿意承担的是……；这部分我暂时不答应。我会在……之后给你明确回复。','是否能用自己的理由解释选择，而不是只说“别人都这么说”？','如果两个选项仍无法区分，先补一条关键事实，不增加第三个选项。'],
 兄弟:['互相帮忙逐渐变成默认由你承担',['列出最近一次帮忙的具体内容、耗时和谁提出的请求。','划清一次性协助与长期责任；长期责任必须重新确认。','下一次请求到来时先说明可做的范围，再由对方决定是否接受。'],'这次我能帮你完成……，但后续……需要你自己负责。','下一次分工是否仍需要你补位？是否有人默认你的时间可以无限使用？','若约定后仍持续转嫁责任，缩小帮助范围，而不是再次默默接手。'],
 夫妻:['同一件事反复争论，却没有形成新的相处安排',['只选最近一次具体事件，各自说清发生了什么，先不讨论谁的性格有问题。','各提出一个可以执行的请求，由对方明确接受、修改或拒绝。','把双方同意的做法试一次，再分别反馈；没有同意的部分不算约定。'],'上次……让我感到……。下次我希望……。这个安排你愿意吗？你想改哪一部分？','双方能否复述同一项约定？是否都自愿，而非一方为了结束争论勉强答应？','若一方不愿意，先停止推行共同方案；明确自己的边界，不用合盘要求对方改变。'],
 子女:['照顾或长期投入占满时间，自己的需要被挤掉',['把必要照顾、可协商事项和自己额外加上的标准分开。','将一项可协商事项交给合适的人，明确做到什么程度；不只交任务，也交决定空间。','在日程中保留一段自己的恢复时间，检查是否因临时加码再次被占用。'],'我会负责……；……需要一起分担。我们先按这个范围做，不额外增加要求。','必要需求是否得到照顾，同时你的负担有没有实际减少？','如果无法分担，先降低非必要标准并寻找现实支持，不靠持续透支维持全部安排。'],
 财帛:['想增加投入，却说不清投入解决哪个问题',['列出已确定的收入、必要支出和这次投入的具体用途，未知数字单独标记。','写清这笔投入要验证什么，以及没有达到预期时怎样停止。','先核实成本与责任，再决定是否投入；不把命盘四化当作收益证据。'],'这次投入具体解决……；总成本和责任还需要确认……，确认之前我不追加。','投入用途、成本和退出条件是否都能说清？是否仍有用乐观估计填补的空白？','关键数字或责任没有核实，就保留决定，不用“运势好”填补证据缺口。'],
 疾厄:['任务安排让休息持续让位，负担越来越重',['记录一周实际任务和休息安排，找出反复侵占恢复时间的那一项。','先减少或重新分配这项任务，不同时增加新的改善目标。','观察安排是否更可持续；具体身体不适按真实症状寻求医疗帮助，不用星曜解释。'],'我当前能完成……，再增加……会挤占必要休息，需要调整范围或时间。','实际任务是否减少？休息时间是否真正保留下来？','若调整后负担仍无变化，重新协商任务；身体问题交由医疗专业人员评估。'],
 迁移:['新环境看起来有机会，却不知道值不值得改变',['把新环境的实际条件、需要付出的成本和能得到的支持列清楚。','先用短期接触、访谈或小范围体验核实最不确定的一项条件。','将核实结果与现在的安排比较，再决定是否做更难撤回的改变。'],'我最需要确认的是……，可以先让我了解或试行……，再决定后续吗？','吸引你的条件是否真实存在？改变成本是否比原先想象更高？','如果关键条件没有兑现，修改或放弃该选项，不因已经期待很久就继续推进。'],
 仆役:['合作靠口头默契，出了问题却没人负责',['把交付、负责人、截止时间和修改范围写在同一份记录里。','请每个人明确确认自己负责哪一项，未确认的内容不算已分配。','先完成一个小交付，观察协作是否按约定发生，再扩大合作。'],'这次由我负责……，你负责……；新增需求我们先确认时间和责任，再开始。','是否减少了返工和临时补位？双方是否对完成标准理解一致？','如果反复不履约，先缩小合作范围并明确处理方式，不再用私人交情代替约定。'],
 官禄:['做了很多事，却不知道怎样才能被认可',['明确当前角色最重要的一项成果，以及谁来验收。','选一个现有任务，核对它是否直接支持这项成果；无关任务先协商优先级。','提交一次可检查的进展，请评价者指出差距，再决定下一轮投入。'],'这阶段最重要的交付是不是……？如果是，我优先完成……，其他事项需要顺延或重新分配。','验收标准是否清楚？反馈是否针对成果，而不只是要求“再努力一点”？','如果目标持续变化，先重新确认范围和资源，不靠无限加班追赶不确定标准。'],
 田宅:['家和居住安排让人不安，却一直没有讨论具体需求',['分别列出安全、日常使用、安静空间等真实需要，不先讨论理想样子。','与共同生活的人确认一项最影响日常的安排，以及谁能决定或改变它。','先调整一个可逆的空间或规则，实际使用后再决定是否继续改变。'],'我最受影响的是……，希望先调整……。这会影响你什么，我们一起确认。','调整是否解决了具体使用问题？是否把不便转移给另一个人？','若一项调整牺牲了另一人的基本需要，重谈方案；资产决策另外核实成本和权利责任。'],
 福德:['空下来仍停不下自我要求，休息也像在完成任务',['区分真正需要完成的事项和只是担心落后而增加的事项。','拿掉一项没有明确用途的安排，留出不需要展示成果的时间。','试过之后记录自己是否更有余力，而不是给休息质量打分。'],'这段时间我不安排额外交付，先保留给自己；其他事可以在……再讨论。','休息后是否更能处理日常事务？是否又给恢复安排增加了新的考核？','如果休息也变成压力，继续简化安排，而不是寻找更复杂的自我提升计划。'],
 父母:['长辈的关心与自己的选择发生冲突',['先分清对方提供的是信息、帮助，还是希望替你决定。','说明自己会采纳哪部分支持，以及最终由谁承担和决定。','对反复出现的话题使用同一条清晰边界，减少每次都重新辩论。'],'你的担心我听到了，……对我有帮助；最终……由我决定，相应责任也由我承担。','支持是否还能保留？决定权和责任是否清楚，而不是一方决定、另一方承担？','若讨论一直回到同一处，先结束重复争论，只更新必要信息，不承诺自己不愿意做的事。']
};

const PLAIN={
 命宫:'这一宫讲的是：面对选择时，你如何建立自己的立场。',
 兄弟:'这一宫讲的是：你与同辈之间，怎样既互相支持，也保留各自的边界。',
 夫妻:'这一宫讲的是：亲密关系里，你如何表达需要、分担责任和处理差异。',
 子女:'这一宫讲的是：面对照顾与延续，你如何投入心力，又怎样给彼此空间。',
 财帛:'这一宫讲的是：你怎样看待资源、投入与回报，以及如何安排实际收支。',
 疾厄:'这一宫提供身心负荷的传统观察角度；现实中更值得关注的是你的实际感受和恢复条件。',
 迁移:'这一宫讲的是：面对陌生环境、新机会或变化，你怎样找到适合自己的位置。',
 仆役:'这一宫讲的是：与朋友、团队或合作方往来时，你怎样建立信任与清晰的分工。',
 官禄:'这一宫讲的是：你怎样把想法做成事情，在职责、能力与成就感之间找到位置。',
 田宅:'这一宫讲的是：怎样建立能让自己安顿下来的居所、生活空间与长期安排。',
 福德:'这一宫讲的是：除了完成外界要求，什么让你真正放松、满足并恢复精力。',
 父母:'这一宫讲的是：面对长辈、照顾者或制度的期待，你如何接受支持并保留自己的选择。'
};
const STAR_PLAIN={
 紫微:['把分散的事情组织起来，明确方向与责任','不要把统筹变成所有事情都由自己决定'],
 天机:['多比较几种路径，随反馈调整方法','避免一直推演可能性，却迟迟不选一个小步骤'],
 太阳:['把想法说清楚，主动承担愿意承担的部分','留意付出是否超过自己的容量，不以被需要证明价值'],
 武曲:['把目标拆成资源、步骤与完成标准','不要只看效率与结果，也给感受和沟通留位置'],
 天同:['先营造可以安心合作或投入的条件','别因为想维持舒服，就让真正的问题一直搁置'],
 廉贞:['先确认自己的原则、角色和可接受范围','标准可以清楚，但不必把每一次分歧都变成对错'],
 天府:['先守住已有基础，给安排留出余量','稳定有价值，也要定期检查旧做法是否仍然适合'],
 太阴:['细看需求与细节，让准备和积累逐步发挥作用','需要可以说出来，不必靠独自承担让别人猜到'],
 贪狼:['通过尝试和交流找到真正感兴趣的方向','机会多时先排序，避免每件事都答应'],
 巨门:['把疑问问明白，用事实澄清理解上的差异','讨论是为了弄清问题，不必把每句话都变成辩论'],
 天相:['协调各方需要，建立彼此都理解的规则','照顾公平时也要表达自己的需要，不必一直做调停者'],
 天梁:['用经验提供支持，建立可依靠的处理方式','帮助别人前先确认对方需要，也确认自己愿意承担多少'],
 七杀:['需要选择时明确优先级，并承担自己决定的部分','行动前留一个核对条件的步骤，别把果断变成仓促'],
 破军:['检视哪些旧安排已经失效，再有步骤地调整','改变前先保留可回退的空间，不必一次推翻全部']
};
function palaceStatus(a,p){
 const supportive=['左辅','右弼','天魁','天钺','文昌','文曲'],tough=['擎羊','陀罗','火星','铃星','地空','地劫'];
 const own=stars(p),sup=own.filter(s=>supportive.includes(s.name)),pressure=own.filter(s=>tough.includes(s.name)),hua=own.filter(s=>s.mutagen),sur=around(a,p.index).slice(1);
 const title=p.majorStars.length?p.majorStars.map(s=>s.name).join('、')+'坐守':'空宫 · 无主星坐守';
 const brightness=p.majorStars.map(s=>s.name+'：'+(s.brightness||'未提供亮度'));
 const mixed=sup.length&&pressure.length?'辅助与煞曜同宫，属于支持与张力并存的配置。':sup.length?'本宫有辅助星曜配置；这只说明星曜结构，不等于事情必然顺利。':pressure.length?'本宫有煞曜配置，结构中带有张力；不等于现实中必然发生损失。':'本宫未见此处列出的六辅或六煞，不能因此判定平顺或无力。';
 const flags=hua.map(s=>s.name+'化'+s.mutagen);
 const external=sur.map(q=>{const hs=stars(q).filter(s=>s.mutagen||supportive.includes(s.name)||tough.includes(s.name));return {palace:name(q),items:hs.map(s=>s.name+(s.mutagen?'化'+s.mutagen:''))};});
 return {title,brightness,sup:sup.map(s=>s.name),pressure:pressure.map(s=>s.name),flags,mixed,external};
}

function plainReading(a,p){
 const direct=!!p.majorStars.length,ref=direct?p:a.palaces[(p.index+6)%12],ss=ref.majorStars,names=ss.map(s=>s.name),themes=names.map(n=>STAR[n]).filter(Boolean);
 const basis=direct?`本宫坐${ss.map(starText).join('、')}。`:`本宫无主星，对宫${name(ref)}坐${ss.map(starText).join('、')||'无主星'}。以下主星组合含义来自对宫会照，不是本宫坐星。`;
 let meaning=themes.length?`这一组星曜在${DOMAINS[p.name]?.[0]||name(p)}方面，呈现“${themes.join('与')}”并存的结构。`: '本宫与对宫都没有主星，现有主星规则不足以给出组合定性，保留辅杂曜与四化资料。';
 let tension=names.map(n=>STAR_PLAIN[n]?.[1]).filter(Boolean).join('；')+'。';
 let action=names.map(n=>STAR_PLAIN[n]?.[0]).filter(Boolean).join('；')+'。';
 if(names.includes('天同')&&names.includes('天梁')){meaning='这组组合的核心，是舒适与责任之间的取舍。天同重安适与协调，天梁重原则与照顾：维持和气与坚持标准，是同一组结构中的两种要求。';tension='和气不等于无条件承担，原则也不等于替别人决定。需要处理的张力，是维持关系与守住责任边界之间的平衡。';action='让责任与决定权相匹配：接下一件事之前，明确负责范围、可决定的事项与配合条件；只有责任却没有相应权限时，先协商条件，不直接承诺结果。';}
 const mutations=stars(p).filter(s=>s.mutagen).map(s=>`${s.name}生年化${s.mutagen}，在${name(p)}突出`+({禄:'资源吸引与投入意愿。资源怎样进入、投入是否过量，是这一标记的两面。',权:'推动与承担。掌握决定权与承担责任需要相称，不能只增加负担。',科:'表达、秩序与认可。重视说明与规范，同时要区分真实内容和表面评价。',忌:'牵挂、阻滞与反复。它标记需要反复处理的关系，不等于灾难或必然损失。'}[s.mutagen]||'该四化的传统主题。'));
 const connections=around(a,p.index).slice(1).map((q,i)=>{const main=q.majorStars.map(starText).join('、')||'无主星',hua=stars(q).filter(s=>s.mutagen).map(s=>s.name+'化'+s.mutagen).join('、');return `${i===2?'对宫':'三合宫'}${name(q)}（${q.earthlyBranch}）坐${main}${hua?'；四化为'+hua:''}。它与本宫形成${i===2?'对照':'会照'}，连接的是“${DOMAINS[q.name]?.[0]||q.name}”与“${DOMAINS[p.name]?.[0]||p.name}”两个领域。`;});
 return {lead:`${name(p)} · ${DOMAINS[p.name]?.[0]||p.name}`,basis,meaning,tension,mutations,connections,connection:connections.join('\n'),action};
}
function timeIndex(hour){const n=Number(hour);if(hour==null||hour===''||!Number.isInteger(n)||n<0||n>23)throw Error('紫微需要有效出生小时。');return Math.floor((n+1)/2);}
function stars(p){return [...p.majorStars,...p.minorStars,...p.adjectiveStars];}
function around(a,i){return [i,(i+4)%12,(i+8)%12,(i+6)%12].map(n=>a.palaces[n]);}
function name(p){return p.name==='命宫'?p.name:(p.name==='仆役'?'交友（仆役）宫':p.name+'宫');}
function transformations(a,list){return list.map((s,i)=>({star:s,hua:HUA[i],palace:a.palaces.find(p=>stars(p).some(x=>x.name===s))}));}
function cast(opts){
 if(!['男','女'].includes(opts.gender))throw Error('请选择排盘性别。');
 const lib=root.YPXIztro;if(!lib?.astro)throw Error('紫微引擎未加载，请刷新页面。');
 const ti=timeIndex(opts.hour),a=opts.calendar==='lunar'?lib.astro.byLunar(opts.birth,ti,opts.gender,!!opts.leap,true,'zh-CN'):lib.astro.bySolar(opts.birth,ti,opts.gender,true,'zh-CN');
 if(a.palaces?.length!==12)throw Error('紫微十二宫数据不完整。');
 return {astrolabe:a,timeIndex:ti,input:{...opts},config:lib.astro.getConfig()};
}
root.ypxCastZiwei=async opts=>cast(opts);
root.YPXZiwei={timeIndex,around,transformations,cast,mount,plainReading,palaceStatus};
function node(t,s,cls){const n=document.createElement(t);if(s!==undefined)n.textContent=String(s);if(cls)n.className=cls;return n;}
function paragraph(host,s){host.append(node('p',s));}
function detail(title,open=false){const d=node('details',undefined,'zwf-detail');d.open=open;d.append(node('summary',title));return d;}
function list(host,items){const ul=node('ul');items.forEach(x=>ul.append(node('li',x)));host.append(ul);}
function starText(s){return s.name+(s.brightness?'〔'+s.brightness+'〕':'')+(s.mutagen?' · 生年化'+s.mutagen:'');}
function huaList(host,items){
 const grid=node('div',undefined,'zwf-huas');
 items.forEach(x=>{const c=node('div',undefined,'zwf-hua');c.append(node('strong','化'+x.hua+' · '+x.star));paragraph(c,x.palace?name(x.palace)+' · '+x.palace.heavenlyStem+x.palace.earthlyBranch:'未定位到落宫');paragraph(c,HUA_TEXT[x.hua]);grid.append(c);});host.append(grid);
}
function facts(p){return ['主星：'+(p.majorStars.map(starText).join('、')||'无主星（空宫）'),'辅曜：'+(p.minorStars.map(starText).join('、')||'无'),'杂曜：'+(p.adjectiveStars.map(starText).join('、')||'无')];}
function mount(host,sum){
 if(!host)return;host.replaceChildren();
 if(!sum?.astrolabe){paragraph(host,'紫微命盘尚未生成。请确认出生信息和本地引擎加载后重试；不会显示示例盘代替你的命盘。');return;}
 const a=sum.astrolabe;host.classList.add('zwf');
 host.append(node('h3','紫微斗数 · 本命全盘'));
 const intro=node('div',undefined,'zwf-overview');list(intro,[`公历 ${a.solarDate} · 农历 ${a.lunarDate} · ${a.time}（${a.timeRange}） · ${a.gender}`,`命宫在${a.earthlyBranchOfSoulPalace}，身宫在${a.earthlyBranchOfBodyPalace}；命主${a.soul}，身主${a.body}；${a.fiveElementsClass}。`]);paragraph(intro,'这里显示本次输入计算的盘面。先读命身与四化，再逐宫展开；盘面信息、传统象义与现实建议分开呈现。');host.append(intro);
 const settings=detail('排盘口径与阅读说明');
 paragraph(settings,'紫微按输入的北京时间与时辰排盘，早子时为0、晚子时为12；采用引擎默认晚子时换日规则。八字中的经度与均时差校正不自动套用到此盘，临界时辰请分别核对。');
 paragraph(settings,'闰月采用前半月按本月、后半月按下一月的调整方式。本命年界、运限年/月界及虚岁依本地引擎默认规则，不能直接套用八字的立春和交节月界。');
 paragraph(settings,'庙、旺、得、利、平、不、陷为传统亮度标注；不代表人格评分。未返回亮度时不补造。空宫只表示没有主星，不是没有辅星或没有作用。');
 paragraph(settings,'以下是本次实盘的传统象义解读。组合含义与生活事实分开：出生信息不能证明某件事已经发生；尚未验证的格局与事件不写成确定结论。');
 const raw=detail('查看引擎配置');raw.append(node('pre',JSON.stringify(sum.config,null,2)));settings.append(raw);
 const source=node('a','查看 iztro 排盘字段说明');source.href='https://docs.iztro.com/posts/astrolabe';source.target='_blank';source.rel='noopener noreferrer';settings.append(source);host.append(settings);
 const natal=[];a.palaces.forEach(p=>stars(p).filter(s=>s.mutagen).forEach(s=>natal.push({star:s.name,hua:s.mutagen,palace:p})));natal.sort((x,y)=>HUA.indexOf(x.hua)-HUA.indexOf(y.hua));
 const four=detail('生年四化 · 禄、权、科、忌落在哪里',true);if(natal.length)huaList(four,natal);else paragraph(four,'本次引擎未返回生年四化，不能据此判断“四化平和”。');host.append(four);
 const board=node('div',undefined,'zwf-board');const positions={巳:[1,1],午:[1,2],未:[1,3],申:[1,4],辰:[2,1],酉:[2,4],卯:[3,1],戌:[3,4],寅:[4,1],丑:[4,2],子:[4,3],亥:[4,4]};
 a.palaces.forEach(p=>{const tile=node('a',undefined,'zwf-tile');tile.href='#zwf-palace-'+p.index;const pos=positions[p.earthlyBranch];tile.style.gridArea=pos.join(' / ');tile.append(node('strong',name(p)+(p.isBodyPalace?' · 身宫':'')),node('span',p.heavenlyStem+p.earthlyBranch),node('span',p.majorStars.map(starText).join('、')||'无主星'));tile.addEventListener('click',()=>{const d=document.getElementById('zwf-palace-'+p.index);if(d)d.open=true;});board.append(tile);});const center=node('div',undefined,'zwf-center');center.append(node('strong',a.fiveElementsClass),node('p','命主 '+a.soul+' · 身主 '+a.body),node('p','点击宫位，展开详细资料'));board.append(center);host.append(board);
 const nav=node('nav',undefined,'zwf-nav');nav.setAttribute('aria-label','紫微十二宫导航');const sections=[];
 const all=node('button','收起十二宫');all.type='button';all.addEventListener('click',()=>{const open=sections.some(d=>!d.open);sections.forEach(d=>d.open=open);all.textContent=open?'收起十二宫':'展开十二宫';});host.append(all,nav);
 const ordered=['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','仆役','官禄','田宅','福德','父母'];
 ordered.forEach(key=>{
  const p=a.palaces.find(p=>p.name===key);if(!p)return;
  const domain=DOMAINS[key],d=detail(name(p)+' · '+p.heavenlyStem+p.earthlyBranch+(p.isBodyPalace?' · 身宫':'')+(p.isOriginalPalace?' · 来因宫':''),true);d.classList.add('zwf-palace');d.dataset.index=p.index;d.id='zwf-palace-'+p.index;sections.push(d);
  const link=node('a',name(p));link.href='#'+d.id;link.addEventListener('click',()=>{d.open=true;});nav.append(link);
  const plain=plainReading(a,p),message=node('section',undefined,'zwf-message');const state=palaceStatus(a,p),status=node('section',undefined,'zwf-data zwf-status');status.append(node('h4',name(p)+' · 本宫状态'),node('strong',state.title));paragraph(status,state.brightness.length?'主星亮度：'+state.brightness.join('；')+'。':'本宫无主星亮度可评，不能将空宫直接判弱；对宫资料在下方单列。');paragraph(status,'生年四化：'+(state.flags.join('、')||'本宫没有生年四化标记')+'。');paragraph(status,'本宫辅助星：'+(state.sup.join('、')||'未见所列六辅')+'；本宫煞曜：'+(state.pressure.join('、')||'未见所列六煞')+'。');paragraph(status,state.mixed);const incoming=node('ul');state.external.forEach(x=>incoming.append(node('li',x.palace+'会照：'+(x.items.join('、')||'未见所列辅煞及生年四化标记'))));status.append(node('h4','会照到本宫的具体配置'),incoming);paragraph(status,'状态口径：本栏列本命盘配置；所选大限、流年与流月状态在本宫下方单列。庙旺、四化、辅煞分别列出，不相加成吉凶总分；未完成综合强弱判断的部分不补造结论。');message.append(status);message.append(node('h4','本宫解读'));paragraph(message,plain.basis);paragraph(message,plain.meaning);message.append(node('h4','这组结构的张力'));paragraph(message,plain.tension);if(plain.mutations.length){message.append(node('h4','生年四化的作用'));plain.mutations.forEach(s=>paragraph(message,s));}message.append(node('h4','三方四正对本宫的联系'));plain.connections.forEach(s=>paragraph(message,s));message.append(node('h4','对应的处理原则'));paragraph(message,plain.action);const transit=node('section',undefined,'zwf-data zwf-palace-transit');transit.dataset.palace=p.index;message.append(transit);d.append(message);
  const evidence=detail('查看这一宫的星曜与三方四正依据');const data=node('div',undefined,'zwf-data');list(data,facts(p));evidence.append(data);
  const read=node('section',undefined,'zwf-reading');read.append(node('h4','星曜象义明细'));
  if(p.majorStars.length){list(read,p.majorStars.map(s=>`${starText(s)}：传统象义侧重${STAR[s.name]||'该星的传统主题'}；本次落在${name(p)}，对应${domain[0]}这一宫位主题。`));}else{const opp=a.palaces[(p.index+6)%12];paragraph(read,`本宫无主星，先保留辅杂曜资料，再参考对宫${name(opp)}的${opp.majorStars.map(s=>s.name).join('、')||'无主星状态'}。对宫星曜仍在对宫，不能当作已经迁入本宫。`);}
  const extra=p.minorStars.filter(s=>STAR[s.name]);if(extra.length)paragraph(read,'辅曜观察：'+extra.map(s=>s.name+'—'+STAR[s.name]).join('；')+'。这些是传统象义，不单凭辅曜判吉凶。');
  const sur=around(a,p.index);read.append(node('h4','三方四正 · 本宫、两三合宫与对宫'));
  const surround=node('div',undefined,'zwf-surround');sur.forEach((q,i)=>{const cell=node('article');cell.append(node('strong',['本宫','三合之一','三合之二','对宫'][i]+' · '+name(q)+' '+q.earthlyBranch));list(cell,facts(q));const hs=stars(q).filter(s=>s.mutagen);paragraph(cell,'生年四化：'+(hs.map(s=>s.name+'化'+s.mutagen).join('、')||'此宫无生年四化标记'));surround.append(cell);});read.append(surround);
  paragraph(read,`先读${name(p)}的本宫星曜，再结合${name(sur[1])}、${name(sur[2])}的会照，以及${name(sur[3])}的对照。四个位置的星曜不能混成一组后直接判格局；同一颗星出现在不同宫位，讨论的生活范围也不同。`);
  const flags=sur.flatMap(q=>stars(q).filter(s=>s.mutagen).map(s=>name(q)+'的'+s.name+'化'+s.mutagen));paragraph(read,'本宫三方四正中的生年四化：'+(flags.join('；')||'没有标记，仍需看其他星曜关系')+'。');evidence.append(read);d.append(evidence);
  const flies=detail('本宫宫干四化 · 与生年四化分开看');const fm=transformations(a,root.YPXIztro.util.getMutagensByHeavenlyStem(p.heavenlyStem));paragraph(flies,`从${name(p)}宫干${p.heavenlyStem}起四化，以下箭头指向星曜原本所在宫位。不是九宫飞星，也不是生年四化的重复标记。`);list(flies,fm.map(x=>`${name(p)}（${p.heavenlyStem}） → ${x.star}化${x.hua} → ${x.palace?name(x.palace):'落点未定位'}${x.palace?.index===p.index?'〔落回本宫〕':''}`));paragraph(flies,'落回本宫仅说明这一规则下的落点；不同流派的自化、飞入飞出和串联解释不在此自动判定。');d.append(flies);
  const additional=detail('大限年龄、小限与神煞原始资料');list(additional,[`本宫大限：${p.decadal?.range?.join('—')||'未返回'}虚岁 · ${p.decadal?.heavenlyStem||''}${p.decadal?.earthlyBranch||''}`,`小限年龄（虚岁）：${p.ages?.join('、')||'未返回'}`,`长生十二神：${p.changsheng12||'未返回'}`,`博士十二神：${p.boshi12||'未返回'}`,`将前十二神：${p.jiangqian12||'未返回'}`,`岁前十二神：${p.suiqian12||'未返回'}`]);paragraph(additional,'神煞名称原样保留用于核对，不把“病”“死”等名称解释为现实疾病或寿命。');d.append(additional);
  const advice=node('div',undefined,'zwf-advice');advice.append(node('h4','这一宫不能替你判断的事'));paragraph(advice,domain[3]);d.append(advice);host.append(d);
 });
 function updatePalaceLuck(h,date,error){
  host.querySelectorAll('.zwf-palace-transit').forEach(box=>{
   box.replaceChildren();box.append(node('h4','所选时期 · 大限、流年与流月状态'));
   if(error){paragraph(box,error+' 当前不显示运限结论。');return;}
   const p=a.palaces[Number(box.dataset.palace)],area=DOMAINS[p.name]?.[0]||name(p);
   paragraph(box,date+' · 对照本命'+name(p));
   const hits=[['decadal','大限'],['yearly','流年'],['monthly','流月']].flatMap(([key,title])=>transformations(a,h[key]?.mutagen||[]).filter(x=>x.palace?.index===p.index).map(x=>({title,...x})));
   const summary=node('div',undefined,'zwf-period-summary');summary.append(node('strong','本宫阶段重点'));
   paragraph(summary,hits.length?hits.map(x=>x.title+x.star+'化'+x.hua).join('；')+'。以上为直接入宫标记，下方分别解释，跨层作用不合并成一个吉凶结论。':'所选大限、流年、流月均无四化直接入宫；本宫的会照与叠宫资料仍在下方列出。');box.append(summary);
   const natal=stars(p).filter(s=>s.mutagen);
   for(const [key,title] of [['decadal','大限'],['yearly','流年'],['monthly','流月']]){
    const scope=h[key],card=node('article',undefined,'zwf-period-state');
    card.append(node('strong',title));
    if(!scope){paragraph(card,'该时期未返回此层资料。');box.append(card);continue;}
    const role=scope.palaceNames?.[p.index];
    paragraph(card,role?title+role+'叠在本命'+name(p)+'：这一层的“'+(DOMAINS[role]?.[0]||role)+'”主题，与本命的“'+area+'”发生叠宫联系。':'此层宫名未返回，不能补造叠宫解释。');
    const all=transformations(a,scope.mutagen||[]),direct=all.filter(x=>x.palace?.index===p.index);
    if(direct.length)direct.forEach(x=>{
      paragraph(card,title+x.star+'化'+x.hua+'直接落入本宫：'+({禄:'此层在'+area+'上标记资源与投入的牵引；投入增加与实际收益需要区分。',权:'此层在'+area+'上突出推动、主导与责任，关键张力是决定权与承担是否相称。',科:'此层在'+area+'上突出表达、规范与认可，呈现方式与实际内容需要一致。',忌:'此层在'+area+'上标记牵挂、反复与阻力，是需要处理的结点，不等于确定损失。'}[x.hua]||''));
      const same=natal.filter(n=>n.name===x.star);same.forEach(n=>paragraph(card,n.mutagen===x.hua?'与生年'+x.star+'化'+n.mutagen+'同星同化：同一传统主题在本命与此层重复出现，不作强度倍增计算。':'与生年'+x.star+'化'+n.mutagen+'同星异化：本命化'+n.mutagen+'与'+title+'化'+x.hua+'同时保留，不能相互抵消。'));
    });else paragraph(card,'本层四化没有直接落入本宫；不据此判定平稳。');
    const neighbors=around(a,p.index).slice(1),incoming=all.filter(x=>neighbors.some(q=>q.index===x.palace?.index));
    if(incoming.length)list(card,incoming.map(x=>title+x.star+'化'+x.hua+'在'+name(x.palace)+'，以'+(x.palace.index===(p.index+6)%12?'对宫':'三合宫')+'会照本宫；关联领域为'+(DOMAINS[x.palace.name]?.[0]||name(x.palace))+'。'));
    else paragraph(card,'本层四化未落入本宫的其余三方四正位置。');
    box.append(card);
   }
   paragraph(box,'这里将运限落宫与四化叠回本命，未将不同标记加总成吉凶分数，也不据此认定现实事件已经发生。');
  });
 }
 const luck=detail('运限叠盘 · 大限、小限、流年、流月、流日、流时');const label=node('label','查看紫微运限时间（北京时间）'),when=node('input');when.type='datetime-local';when.min='1940-01-01T00:00';when.max='2100-12-31T23:59';when.value=new Date(Date.now()+8*3600000).toISOString().slice(0,16);when.setAttribute('aria-label','紫微运限时间');label.append(when);const output=node('div');output.setAttribute('aria-live','polite');
 function showLuck(){output.replaceChildren();try{const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(when.value);if(!m||!when.validity.valid)throw Error('请填写1940—2100年的有效时间。');const birth=a.solarDate.split('-').map(Number),at=m.slice(1).map(Number);if(Date.UTC(at[0],at[1]-1,at[2],at[3],at[4])<Date.UTC(birth[0],birth[1]-1,birth[2],Number(sum.input.hour),Number(sum.input.minute||0)))throw Error('请选择出生之后的日期时间。');const h=a.horoscope(when.value.slice(0,10),timeIndex(at[3]));updatePalaceLuck(h,when.value.replace('T',' '));paragraph(output,'所选日期：'+h.solarDate+' · '+h.lunarDate+'。以下落宫均对照本命十二宫；运限层不能替代本命。');
  [['decadal','大限'],['age','小限'],['yearly','流年'],['monthly','流月'],['daily','流日'],['hourly','流时']].forEach(([key,title])=>{const scope=h[key],s=detail(title);s.classList.add('zwf-scope');if(!scope){paragraph(s,'该时间没有返回此层数据。');output.append(s);return;}const index=scope.index,target=a.palaces[index];paragraph(s,`${title} ${scope.heavenlyStem||''}${scope.earthlyBranch||''} · 命宫叠在本命${target?name(target):'未定位'}`+(key==='age'?` · ${scope.nominalAge}虚岁`:''));if(key==='age')paragraph(s,'小限仅显示宫位和虚岁；不把宫干四化冒充小限另有一套独立四化。');else if(scope.mutagen?.length)huaList(s,transformations(a,scope.mutagen));if(target){const branches=around(a,index);paragraph(s,'本层命宫的三方四正，按本命位置核对：'+branches.map(q=>name(q)+' '+q.earthlyBranch).join('、'));}
   const mapping=detail('展开本层十二宫、流曜与神煞');a.palaces.forEach((p,i)=>{const row=node('div',undefined,'zwf-mapping');row.append(node('strong',`${scope.palaceNames?.[i]||'未返回'} → 本命${name(p)} ${p.earthlyBranch}`));paragraph(row,'流曜：'+(scope.stars?.[i]?.map(starText).join('、')||'此层此宫未返回流曜'));if(scope.yearlyDecStar)paragraph(row,`流年岁前：${scope.yearlyDecStar.suiqian12?.[i]||'未返回'}；流年将前：${scope.yearlyDecStar.jiangqian12?.[i]||'未返回'}`);mapping.append(row);});s.append(mapping);output.append(s);});
 }catch(e){paragraph(output,e.message);updatePalaceLuck(null,'',e.message);}}
 when.addEventListener('change',showLuck);luck.append(label,output);host.insertBefore(luck,board);showLuck();
 const exportBtn=node('button','下载本次紫微盘面资料');exportBtn.type='button';exportBtn.addEventListener('click',()=>{const data={version:'2026-09-21',input:sum.input,config:sum.config,solarDate:a.solarDate,lunarDate:a.lunarDate,time:a.time,timeRange:a.timeRange,soul:a.soul,body:a.body,fiveElementsClass:a.fiveElementsClass,palaces:a.palaces.map(p=>({index:p.index,name:p.name,heavenlyStem:p.heavenlyStem,earthlyBranch:p.earthlyBranch,isBodyPalace:p.isBodyPalace,isOriginalPalace:p.isOriginalPalace,majorStars:p.majorStars,minorStars:p.minorStars,adjectiveStars:p.adjectiveStars,changsheng12:p.changsheng12,boshi12:p.boshi12,jiangqian12:p.jiangqian12,suiqian12:p.suiqian12,decadal:p.decadal,ages:p.ages}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=node('a');link.href=url;link.download='紫微本命盘面.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});host.append(exportBtn);paragraph(host,'下载资料包含出生信息，请自行保管；本次排盘与运限查询均在本机执行。');
}
})(globalThis);
