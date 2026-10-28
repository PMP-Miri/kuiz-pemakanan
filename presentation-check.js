import {runPresentationTests} from './presentation.js';
import {runDisplayFlowTests} from './display-flow.js';
import {runChromeTests} from './chrome.js';
const el=document.querySelector('#result');
try{
 const presentation=runPresentationTests();let compiled=0,appSource='';
 for(const file of ['app','presentation','audio','core','api','demo','preview']){
  const res=await fetch('../src/'+file+'.js',{cache:'no-store'});if(!res.ok)throw Error('Tidak dapat baca '+file);
  const raw=await res.text();if(file==='app')appSource=raw;
  const source=raw.replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'');new Function(source);compiled++;
 }
 const between=(from,to)=>{const start=appSource.indexOf(from),end=appSource.indexOf(to,start);if(start<0||end<0)throw Error('Sempadan fungsi ujian tidak ditemui');return appSource.slice(start,end);};
 const chrome=runChromeTests(between('function roleChrome(page)','function setupCaptcha()'));
 const flow=await runDisplayFlowTests(between('async function liveView(','function renderLive('));
 el.textContent=JSON.stringify({unitChecks:presentation.checks+chrome.checks+flow.checks,syntaxFiles:compiled,presentation,chrome,flow},null,2);
}catch(err){el.textContent=err.stack||err.message;el.style.color='#a52246';}
