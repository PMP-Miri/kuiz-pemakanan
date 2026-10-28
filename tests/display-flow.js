// Ujian unit aliran liveView dengan API, pemasa dan DOM tiruan. Tiada sambungan live.
export async function runDisplayFlowTests(liveViewSource){
 const passed=[];
 const assert=(ok,msg)=>{if(!ok)throw Error('GAGAL: '+msg);passed.push(msg);};
 const make=()=>{
  const state={epoch:1,cleanup:()=>{},lastState:null,app:{innerHTML:''},timers:new Map(),next:0,unsubscribed:0,calls:[],themes:[]};
  const deps={api:{hostSession:async()=>({user:{id:'host'}}),state:async(code,host)=>{state.calls.push(['state',code,host]);return {room:{theme:'ocean',status:'question',opened_at:new Date().toISOString()},question:{seconds:20},server_now:new Date().toISOString(),private:'secret'};},subscribe:async(code,host,cb)=>{state.calls.push(['subscribe',code,host]);state.callback=cb;return ()=>state.unsubscribed++;}},requireHost:async()=>true,theme:value=>state.themes.push(value),publicStageState:data=>({room:data.room,question:data.question,server_now:data.server_now}),screenMarkup:view=>{state.publicView=view;return 'TV_MARKUP';},questionMarkup:()=>'',leaderboard:()=>'',source:()=>'',joinLink:()=>'',drawQR:()=>{},renderLive:(data,host)=>{state.renderedHost=host;state.app.innerHTML=host?'HOST_MARKUP':'PLAYER_MARKUP';},setScene:v=>state.scene=v,$:()=>null,e:value=>String(value).replaceAll('<','&lt;').replaceAll('>','&gt;'),CONFIG:{pollMs:2500},setInterval:(fn,ms)=>{const id=++state.next;state.timers.set(id,{fn,ms});return id;},clearInterval:id=>state.timers.delete(id)};
  const names=Object.keys(deps);
  const build=new Function('state',...names,`let epoch=state.epoch,cleanup=()=>{},lastState=null;const app=state.app;${liveViewSource};return {open:liveView,close:()=>cleanup(),invalidate:()=>epoch++,getLast:()=>lastState};`);
  return {state,deps,flow:build(state,...Object.values(deps))};
 };
 let x=make();await x.flow.open('ABCD1234',true,true);
 assert(x.state.app.innerHTML==='TV_MARKUP','TV uses screen renderer, not private host renderer');
 assert(!('private' in x.state.publicView),'TV renderer receives filtered model');
 assert(x.state.themes.join()==='ocean','TV applies quiz theme');
 assert(x.state.calls[0][2]===true&&x.state.calls[1][2]===true,'TV fetch and subscription use authenticated host access');
 assert(x.state.timers.size===2&&x.state.scene==='question','Polling and timer established');
 x.flow.close();assert(x.state.timers.size===0&&x.state.unsubscribed===1&&x.flow.getLast()===null,'Closing stops timers, unsubscribes and clears last state');
 await x.state.callback();assert(x.state.calls.length===2,'Late event cannot fetch after cleanup');
 x=make();await x.flow.open('ABCD1234',false,false);assert(x.state.renderedHost===false&&x.state.calls[0][2]===false,'Player uses player access and renderer');x.flow.close();
 x=make();await x.flow.open('ABCD1234',true,false);assert(x.state.renderedHost===true,'Host keeps private renderer');x.flow.close();
 x=make();x.deps.api.hostSession=async()=>null;await x.flow.open('ABCD1234',true,true);assert(x.state.app.innerHTML.includes('Paparan TV belum disambungkan')&&!x.state.calls.length&&!x.state.timers.size,'TV refuses missing host session');
 x=make();let resolve;x.deps.api.state=()=>new Promise(r=>resolve=r);const pending=x.flow.open('ABCD1234',true,true);await Promise.resolve();await Promise.resolve();x.flow.invalidate();x.flow.close();resolve({room:{theme:'sunset'},server_now:new Date().toISOString()});await pending;assert(x.state.app.innerHTML===''&&x.state.themes.length===0,'Late state response cannot overwrite a different route');assert(!x.state.calls.some(c=>c[0]==='subscribe'),'Stale route does not subscribe');
 x=make();x.deps.api.state=async()=>{throw Error('<img onerror=bad()>');};await x.flow.open('ABCD1234',true,true);assert(x.state.app.innerHTML.includes('&lt;img')&&!x.state.app.innerHTML.includes('<img'),'TV error text is escaped');x.flow.close();
 x=make();x.deps.api.subscribe=async()=>{throw Error('Offline');};await x.flow.open('ABCD1234',true,true);assert(x.state.app.innerHTML==='TV_MARKUP'&&x.state.timers.size===2,'Subscription failure retains polling fallback');x.flow.close();
 return {checks:passed.length,names:passed};
}
