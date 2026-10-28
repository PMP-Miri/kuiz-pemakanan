// Presentation enhancement only. No quiz state, submissions or Supabase access.
export function textSizeClass(text){const n=String(text||'').trim().length;return n>210?'xlong':n>120?'long':'normal';}
export function applyReading(mode,body=document.body){const next=mode==='large'?'large':'standard';if(body.dataset.reading!==next)body.dataset.reading=next;return next;}
export function enhancePresentation(root=document){
 root.querySelectorAll('.question-title').forEach(el=>{const v=textSizeClass(el.textContent);if(el.dataset.length!==v)el.dataset.length=v;});
 root.querySelectorAll('.answer').forEach(el=>{const content=el.querySelector('span:nth-child(2)');const v=(content?.textContent||'').length>100?'long':'normal';if(el.dataset.length!==v)el.dataset.length=v;});
}
function boot(){
 const app=document.querySelector('#app');if(!app)return;
 document.querySelector('[data-skip-main]')?.addEventListener('click',()=>{app.focus();app.scrollIntoView({block:'start'});});
 let saved='standard';try{saved=localStorage.getItem('na-pop-reading')||'standard';}catch{/* browser storage can be disabled */}
 applyReading(saved);
 const button=document.querySelector('#readability');
 const sync=()=>{enhancePresentation(app);if(button){button.hidden=document.body.dataset.role!=='screen';button.textContent=document.body.dataset.reading==='large'?'Aa · Lebih besar':'Aa · Standard';button.setAttribute('aria-pressed',String(document.body.dataset.reading==='large'));}};
 if(button)button.addEventListener('click',()=>{const value=applyReading(document.body.dataset.reading==='large'?'standard':'large');try{localStorage.setItem('na-pop-reading',value);}catch{}sync();});
 let queued=false;const update=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync();});};
 new MutationObserver(update).observe(app,{subtree:true,childList:true});
 new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['data-role']});
 sync();
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();}
