(function(root){
'use strict';
function articleId(cat,title){return cat+'::'+title;}
function toggle(state,field,id){const next=JSON.parse(JSON.stringify(state)),list=new Set(next[field]||[]);list.has(id)?list.delete(id):list.add(id);next[field]=[...list];return next;}
if(typeof module!=='undefined'&&module.exports){module.exports={articleId,toggle};return;}
document.addEventListener('DOMContentLoaded',()=>{
 const KB=root.KnowledgeBase,bar=document.getElementById('learnBar'),body=document.getElementById('kbBody');if(!KB||!bar||!body)return;
 const make=(tag,text)=>{const x=document.createElement(tag);if(text)x.textContent=text;return x;};
 const button=(text,fn)=>{const x=make('button',text);x.type='button';x.className='btn btn-ghost';x.addEventListener('click',fn);return x;};
 const all=KB.CATEGORIES.flatMap(c=>(KB[c.key]||[]).map((a,index)=>({cat:c.key,index,title:a.title,id:articleId(c.key,a.title),label:c.label})));
 const storageKey='ypx_learning_v1';let state={favorites:[],completed:[],last:null},available=true,current=null;
 const box=make('section');box.className='ypx-learning-paths';const status=make('p');status.setAttribute('role','status');
 try{const raw=JSON.parse(localStorage.getItem(storageKey)||'null');if(raw){if(!Array.isArray(raw.favorites)||!Array.isArray(raw.completed)||!raw.favorites.every(x=>typeof x==='string')||!raw.completed.every(x=>typeof x==='string'))throw Error();state=raw;}}catch(e){available=false;status.textContent='学习记录无法读取，本轮不覆盖旧数据。仍可阅读文章。';}
 function save(next){if(!available){status.textContent='本机学习记录不可用，未保存。';return false;}try{localStorage.setItem(storageKey,JSON.stringify(next));state=next;status.textContent='已保存到当前浏览器。';return true;}catch(e){status.textContent='保存失败，请检查浏览器存储空间。';return false;}}
 const content=make('div');box.append(make('h3','从这里开始学习'),make('p','从基础概念到命盘阅读，按自己的节奏继续。打开文章不等于读完，进度由你手动标记；记录只保存在当前浏览器。'),status,content);bar.before(box);
 const tools=make('div');tools.className='ypx-article-actions';body.before(tools);
 function open(a){root.dispatchEvent(new CustomEvent('ypx:open-article',{detail:a}));}
 function render(){content.replaceChildren();const done=all.filter(a=>state.completed.includes(a.id));content.append(make('p',`已读 ${done.length} / ${all.length} 篇`));const last=all.find(a=>a.id===state.last);if(last)content.append(button('继续阅读：'+last.title,()=>open(last)));
 const paths=[['01 基础入门',['BASICS']],['02 十干与十神',['TEN_STEMS_DETAIL','TEN_GODS_DETAIL']],['03 辅助知识与典籍',['NAYIN','SHENSHA','CLASSICAL_TEXTS']]];
 const grid=make('div');grid.className='ypx-path-grid';paths.forEach(([title,categories])=>{const articles=all.filter(a=>categories.includes(a.cat)),first=articles.find(a=>!state.completed.includes(a.id))||articles[0],card=make('article');card.append(make('h4',title),make('p',`${articles.filter(a=>state.completed.includes(a.id)).length} / ${articles.length} 篇已读`));if(first)card.append(button('阅读：'+first.title,()=>open(first)));grid.append(card);});content.append(grid);
 const favorites=make('details');favorites.append(make('summary','我的收藏'));const saved=all.filter(a=>state.favorites.includes(a.id));if(!saved.length)favorites.append(make('p','打开文章后，可以在正文上方收藏。'));saved.forEach(a=>favorites.append(button(a.title,()=>open(a))));content.append(favorites);
 const index=make('details');index.append(make('summary','全部学习索引'));all.forEach(a=>index.append(button((state.completed.includes(a.id)?'✓ ':'')+a.label+' · '+a.title,()=>open(a))));content.append(index);
 }
 function toolbar(){tools.replaceChildren();if(!current)return;const fav=state.favorites.includes(current.id),done=state.completed.includes(current.id);tools.append(button(fav?'取消收藏':'收藏文章',()=>{if(save(toggle(state,'favorites',current.id))){toolbar();render();}}),button(done?'撤销已读':'标记已读',()=>{if(save(toggle(state,'completed',current.id))){toolbar();render();}}));}
 root.addEventListener('ypx:article-opened',e=>{current=all.find(a=>a.cat===e.detail.cat&&a.index===e.detail.index);if(!current)return;save({...state,last:current.id});toolbar();render();});
 render();
});
})(typeof globalThis!=='undefined'?globalThis:this);
