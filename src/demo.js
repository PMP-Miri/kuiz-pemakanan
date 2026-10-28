import {uid, demoQuiz, validateQuiz, shuffle, scoreAnswer} from './core.js';
const KEY='nutriarena-demo-v1';
const PLAYER='nutriarena-demo-player';
const now=()=>new Date().toISOString();
const playerUID=()=>{let id=sessionStorage.getItem(PLAYER); if(!id){id=uid();sessionStorage.setItem(PLAYER,id);}return id;};
function read(){const raw=localStorage.getItem(KEY);if(raw)return JSON.parse(raw);const d={quizzes:[demoQuiz()],rooms:[],snapshots:{},players:[],answers:[]};write(d);return d;}
function write(d){localStorage.setItem(KEY,JSON.stringify(d));window.dispatchEvent(new Event('na-change'));}
async function change(fn){const run=()=>{const d=read();const out=fn(d);write(d);return structuredClone(out??{});};return navigator.locks?navigator.locks.request(KEY,run):run();}
const room=(d,code)=>{const r=d.rooms.find(r=>r.code===code.toUpperCase());if(!r)throw Error('Kod bilik tidak ditemui.');return r;};
function mix(qs,st){return (st.shuffleQuestions?shuffle(qs):structuredClone(qs)).map(q=>{if(!st.shuffleOptions)return q;const ord=shuffle(q.options.map((_,i)=>i));return {...q,options:ord.map(i=>q.options[i]),correct:ord.indexOf(q.correct)};});}
export const demo={
 async login(){return true;},async logout(){},async hostSession(){return {user:{email:'pegawai@demo.local'}};},
 async manage(action,p={}){
  if(action==='dashboard'){const d=read();return {quizzes:d.quizzes,rooms:[...d.rooms].reverse()};}
  if(action==='report'){const d=read(),r=room(d,p.code);const report=r=>({room:r,players:d.players.filter(x=>x.room_id===r.id),answers:d.answers.filter(x=>x.room_id===r.id)});return {...report(r),questions:d.snapshots[r.id],pre:r.pre_id?report(d.rooms.find(x=>x.id===r.pre_id)):null};}
  return change(d=>{
   if(action==='save'){const q=structuredClone(p.quiz),e=validateQuiz(q,q.status==='ready');if(e.length)throw Error(e.join('\n'));q.updated_at=now();const i=d.quizzes.findIndex(x=>x.id===q.id);if(i<0)d.quizzes.push(q);else d.quizzes[i]=q;return q;}
   if(action==='delete_quiz'){d.quizzes=d.quizzes.filter(q=>q.id!==p.id);return {};}
   if(action==='delete_room'){if(d.rooms.some(x=>x.pre_id===p.id))throw Error('Padam sesi pasca yang dipautkan dahulu.');d.rooms=d.rooms.filter(x=>x.id!==p.id);delete d.snapshots[p.id];d.players=d.players.filter(x=>x.room_id!==p.id);d.answers=d.answers.filter(x=>x.room_id!==p.id);return {};}
   if(action==='create'){
    const q=d.quizzes.find(x=>x.id===p.quiz_id);if(!q||q.status!=='ready')throw Error('Terbitkan kuiz dahulu.');
    const errors=validateQuiz(q,true);if(errors.length)throw Error(errors.join('\n'));
    const pre=p.phase==='post'?d.rooms.find(x=>x.id===p.pre_id&&x.phase==='pre'&&x.status==='finished'&&x.quiz_id===q.id):null;
    if(p.phase==='post'&&!pre)throw Error('Pilih sesi pra yang sudah tamat bagi kuiz ini.');
    const settings={leaderboard:p.leaderboard,speedBonus:p.speedBonus,shuffleQuestions:p.shuffleQuestions,shuffleOptions:p.shuffleOptions,winners:p.winners};
    if(p.phase==='pre'){settings.leaderboard=false;settings.speedBonus=false;}
    const qs=mix(pre?d.snapshots[pre.id]:q.questions,settings);
    let code;do{code=uid().replaceAll('-','').slice(0,8).toUpperCase();}while(d.rooms.some(x=>x.code===code));
    const r={id:uid(),code,quiz_id:q.id,title:q.title,theme:q.theme,phase:p.phase,pre_id:pre?.id||null,status:'lobby',current_index:-1,total:qs.length,opened_at:null,settings,created_at:now(),revision:0};
    d.rooms.push(r);d.snapshots[r.id]=qs;return {id:r.id,code:r.code};
   }
   throw Error('Tindakan tidak dikenali.');
  });
 },
 async join(code,name,participantCode=''){return change(d=>{
  const r=room(d,code),existing=d.players.find(p=>p.room_id===r.id&&p.user_id===playerUID());if(existing)return existing;
  if(r.status!=='lobby')throw Error('Sesi telah bermula. Tunggu sesi seterusnya.');
  if(!name.trim()||name.trim().length>30)throw Error('Nama perlu 1 hingga 30 aksara.');
  if(d.players.filter(p=>p.room_id===r.id).length>=200)throw Error('Sesi penuh.');
  let pc=uid().replaceAll('-','').slice(0,12).toUpperCase();
  if(r.phase==='post'){const pre=d.players.find(p=>p.room_id===r.pre_id&&p.participant_code===participantCode.trim().toUpperCase());if(!pre)throw Error('Kod peserta pra tidak sah.');if(d.players.some(p=>p.room_id===r.id&&p.participant_code===pre.participant_code))throw Error('Kod peserta sudah digunakan.');pc=pre.participant_code;name=pre.name;}
  const p={id:uid(),room_id:r.id,user_id:playerUID(),name:name.trim(),participant_code:pc,joined_at:now()};d.players.push(p);r.revision++;return p;
 });},
 async control(code,action){return change(d=>{
  const r=room(d,code);
  if(action==='start'&&r.status==='lobby'){if(!d.players.some(x=>x.room_id===r.id))throw Error('Perlu seorang peserta untuk mula.');r.status='question';r.current_index=0;r.opened_at=now();}
  else if(action==='lock'&&r.status==='question')r.status='reveal';
  else if(action==='next'&&r.status==='reveal'){if(r.current_index+1>=r.total)r.status='finished';else{r.current_index++;r.status='question';r.opened_at=now();}}
  else if(action==='end')r.status='finished';else throw Error('Tindakan tidak sesuai dengan status sesi.');
  r.revision++;
 });},
 async answer(code,qid,selected){return change(d=>{
  const r=room(d,code),p=d.players.find(x=>x.room_id===r.id&&x.user_id===playerUID()),q=d.snapshots[r.id][r.current_index];
  if(!p)throw Error('Anda belum menyertai sesi ini.');
  if(r.status!=='question'||!q||q.id!==qid)throw Error('Jawapan dikunci atau soalan telah berubah.');
  const ms=Math.max(0,Date.now()-Date.parse(r.opened_at));if(ms>=q.seconds*1000)throw Error('Masa menjawab tamat.');
  if(!Number.isInteger(selected)||selected<0||selected>=q.options.length)throw Error('Pilihan tidak sah.');
  if(!d.answers.some(a=>a.player_id===p.id&&a.question_id===qid)){const correct=selected===q.correct;d.answers.push({room_id:r.id,player_id:p.id,question_id:qid,selected,correct,points:scoreAnswer(correct,ms,q.seconds,r.settings.speedBonus),elapsed_ms:ms});r.revision++;}
  return {accepted:true};
 });},
 async state(code,host=false){
  let d=read(),r=room(d,code);let q=d.snapshots[r.id][r.current_index];
  if(r.status==='question'&&Date.now()>=Date.parse(r.opened_at)+q.seconds*1000){await change(x=>{const rr=room(x,code);if(rr.status==='question'){rr.status='reveal';rr.revision++;}});d=read();r=room(d,code);q=d.snapshots[r.id][r.current_index];}
  const p=d.players.find(x=>x.room_id===r.id&&x.user_id===playerUID());if(!host&&!p)throw Error('Anda belum menyertai sesi ini.');
  const players=d.players.filter(x=>x.room_id===r.id).map(p=>{const aa=d.answers.filter(x=>x.player_id===p.id);if(host||(r.phase!=='pre'&&r.settings.leaderboard&&['reveal','finished'].includes(r.status)))return {id:p.id,name:p.name,...(host?{participant_code:p.participant_code}:{}),answered:aa.length,correct:aa.filter(a=>a.correct).length,points:aa.reduce((s,a)=>s+a.points,0),ms:aa.reduce((s,a)=>s+a.elapsed_ms,0),answered_current:aa.some(a=>a.question_id===q?.id)};return {id:p.id,name:p.name};});
  let exposed=null;if(['question','reveal'].includes(r.status)){exposed=structuredClone(q);if(r.status!=='reveal'||r.phase==='pre'){delete exposed.correct;delete exposed.explanation;delete exposed.source;delete exposed.sourceLabel;}}
  const mine=p&&d.answers.find(a=>a.player_id===p.id&&a.question_id===q?.id),aa=d.answers.filter(a=>a.room_id===r.id&&a.question_id===q?.id),dist={};if(r.status==='reveal'&&r.phase!=='pre')aa.forEach(a=>dist[a.selected]=(dist[a.selected]||0)+1);
  const own=p?d.answers.filter(a=>a.player_id===p.id):[];const my_stats=p&&r.status==='finished'&&r.phase!=='pre'?{correct:own.filter(a=>a.correct).length,answered:own.length,points:own.reduce((s,a)=>s+a.points,0)}:null;
  return {room:r,question:exposed,players,player:p||null,mine:mine?{selected:mine.selected}:null,answered:aa.length,distribution:dist,my_stats,is_host:host,server_now:now()};
 },
 subscribe(code,host,cb){const fn=()=>cb();window.addEventListener('storage',fn);window.addEventListener('na-change',fn);return ()=>{window.removeEventListener('storage',fn);window.removeEventListener('na-change',fn);};},
 async upload(){throw Error('Mod demo: gunakan pautan HTTPS gambar. Muat naik fail tersedia dalam mod live.');}
};
