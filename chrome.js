// Ujian roleChrome sebenar dengan DOM minimum, bukan render browser.
export function runChromeTests(roleSource){
 const nodes={};const $=s=>nodes[s]??=({hidden:false,textContent:'',href:'',setAttribute(k,v){this[k]=v;}});
 let silenceCalls=0;const silence=()=>silenceCalls++;const CONFIG={mode:'live'};const hostLink={hidden:false};const document={body:{dataset:{}},querySelectorAll:()=>[hostLink]};const location={hash:'#/screen/ABCD1234'};
 const roleChrome=new Function('document','$','CONFIG','silence','location',roleSource+';return roleChrome;')(document,$,CONFIG,silence,location);
 const names=[];const check=(ok,label)=>{if(!ok)throw Error('GAGAL: '+label);names.push(label);};
 for(const page of ['', 'join','play']){roleChrome(page);check(document.body.dataset.role==='player'&&hostLink.hidden&&$('#sound').hidden,'Player '+(page||'home')+' hides host navigation and audio');}
 for(const page of ['dashboard','editor','launch','host','report']){roleChrome(page);check(document.body.dataset.role==='host'&&!hostLink.hidden&&$('#sound').hidden,'Host '+page+' retains host navigation without music');}
 roleChrome('screen');check(document.body.dataset.role==='screen'&&hostLink.hidden&&!$('#sound').hidden,'TV hides studio, allows music');check($('#brand-link').href==='#/screen/ABCD1234','TV brand keeps same screen, not host dashboard');check(silenceCalls===9,'Every role transition silences previous audio');
 return {checks:names.length,names};
}
