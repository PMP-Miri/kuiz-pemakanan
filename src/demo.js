import {uid,demoQuiz,validateQuiz,shuffle,scoreAnswer} from './core.js?v=pop3';
import {kind,assessed,mixActivity,evaluateResponse,publicQuestion,statsFor} from './activities.js?v=pop3';
const KEY='nutriarena-demo-v1',PLAYER='nutriarena-demo-player',now=()=>new Date().toISOString();
const playerUID=()=>{let id=sessionStorage.getItem(PLAYER);if(!id){id=uid();sessionStorage.setItem(PLAYER,id);}return id;};
function read(){const raw=localStorage.getItem(KEY);if(raw)return JSON.parse(raw);const d={quizzes:[demoQuiz()],rooms:[],snapshots:{},players:[],answers:[]};write(d);return d;}
function write(d){localStorage.setItem(KEY,JSON.stringify(d));window.dispatchEvent(new Event('na-change'));}
async function change(fn){const run=()=>{const d=read(),out=fn(d);write(d);return structuredClone(out??{});};return navigator.locks?navigator.locks.request(KEY,run):run();}
const room=(d,code)=>{const r=d.rooms.find(r=>r.code===code.toUpperCase());if(!r)throw Error('Kod bilik tidak ditemui.');return r;};
function mix(qs,st){return (st.shuffleQuestions?shuffle(qs):structuredClone(qs)).map(q=>mixActivity(q,st.shuffleOptions));}
export const demo={
 async login(){return true;},async logout(){},async hostSession(){return {user:{email:'pegawai@demo.local'}};},
 async manage(action,p={}){
  if(action==='dashboard'){const d=read();return {quizzes:d.quizzes,rooms:[...d.rooms].reverse()};}
  if(action==='report'){const d=read(),r=room(d,p.code);const report=r=>({room:{...r,assessed_total:d.snapshots[r.id].filter(assessed).length},players:d.players.filter(x=>x.room_id===r.id),answers:d.answers.filter(x=>x.room_id===r.id)});return {...report(r),questions:d.snapshots[r.id],pre:r.pre_id?report(d.rooms.find(x=>x.id===r.pre_id)):null};}
  return change(d=>{
   if(action==='save'){const q=structuredClone(p.quiz),e=validateQuiz(q,q.status==='ready');if(e.length)throw Error(e.join('\n'));q.updated_at=now();const i=d.quizzes.findIndex(x=>x.id===q.id);if(i<0)d.quizzes.push(q);else d.quizzes[i]=q;return q;}
   if(action==='delete_quiz'){d.quizzes=d.quizzes.filter(q=>q.id!==p.id);return {};}
   if(action==='delete_room'){if(d.rooms.some(x=>x.pre_id===p.id))throw Error('Padam sesi pasca yang dipautkan dahulu.');d.rooms=d.rooms.filter(x=>x.id!==p.id);delete d.snapshots[p.id];d.players=d.players.filter(x=>x.room_id!==p.id);d.answers=d.answers.filter(x=>x.room_id!==p.id);return {};}
   if(action==='create'){
    const q=d.quizzes.find(x=>x.id===p.quiz_id);if(!q||q.status!=='ready')throw Error('Terbitkan kuiz dahulu.');const errors=validateQuiz(q,true);if(errors.length)throw Error(errors.join('\n'));
    const pre=p.phase==='post'?d.rooms.find(x=>x.id===p.pre_id&&x.phase==='pre'&&x.status==='finished'&&x.quiz_id===q.id):null;if(p.phase==='post'&&!pre)throw Error('Pilih sesi pra yang sudah tamat bagi kuiz ini.');
    const settings={leaderboard:p.leaderboard,speedBonus:p.speedBonus,shuffleQuestions:p.shuffleQuestions,shuffleOptions:p.shuffleOptions,winners:p.winners};if(p.phase==='pre'){settings.leaderboard=false;settings.speedBonus=false;}
    const qs=mix(pre?d.snapshots[pre.id]:q.questions,settings),n=qs.filter(assessed).length;
    if(p.phase!=='normal'&&!n)throw Error('Penilaian pra/pasca memerlukan soalan dinilai.');if(!n){settings.leaderboard=false;settings.speedBonus=false;}
    let code;do{code=uid().replaceAll('-','').slice(0,8).toUpperCase();}while(d.rooms.some(x=>x.code===code));
    const r={id:uid(),code,quiz_id:q.id,title:q.title,theme:q.theme,phase:p.phase,pre_id:pre?.id||null,status:'lobby',current_index:-1,total:qs.length,assessed_total:n,opened_at:null,settings,created_at:now(),revision:0};d.rooms.push(r);d.snapshots[r.id]=qs;return {id:r.id,code:r.code};
   }throw Error('Tindakan tidak dikenali.');
  });
 },
 async join(code,name,participantCode=''){return change(d=>{
  const r=room(d,code),existing=d.players.find(p=>p.room_id===r.id&&p.user_id===playerUID());if(existing)return existing;if(r.status!=='lobby')throw Error('Sesi telah bermula.');if(!name.trim()||name.trim().length>30)throw Error('Nama perlu 1 hingga 30 aksara.');if(d.players.filter(p=>p.room_id===r.id).length>=200)throw Error('Sesi penuh.');let pc=uid().replaceAll('-','').slice(0,12).toUpperCase();
  if(r.phase==='post'){const pre=d.players.find(p=>p.room_id===r.pre_id&&p.participant_code===participantCode.trim().toUpperCase());if(!pre)throw Error('Kod peserta pra tidak sah.');if(d.players.some(p=>p.room_id===r.id&&p.participant_code===pre.participant_code))throw Error('Kod peserta sudah digunakan.');pc=pre.participant_code;name=pre.name;}
  const p={id:uid(),room_id:r.id,user_id:playerUID(),name:name.trim(),participant_code:pc,joined_at:now()};d.players.push(p);r.revision++;return p;
 });},
 async control(code,action){return change(d=>{const r=room(d,code);if(action==='start'&&r.status==='lobby'){if(!d.players.some(x=>x.room_id===r.id))throw Error('Perlu seorang peserta.');r.status='question';r.current_index=0;r.opened_at=now();}else if(action==='lock'&&r.status==='question')r.status='reveal';else if(action==='next'&&r.status==='reveal'){if(r.current_index+1>=r.total)r.status='finished';else{r.current_index++;r.status='question';r.opened_at=now();}}else if(action==='end')r.status='finished';else throw Error('Tindakan tidak sesuai.');r.revision++;});},
 async answer(code,qid,response){return change(d=>{
  const r=room(d,code),p=d.players.find(x=>x.room_id===r.id&&x.user_id===playerUID()),q=d.snapshots[r.id][r.current_index];if(!p)throw Error('Anda belum menyertai sesi ini.');if(r.status!=='question'||!q||q.id!==qid)throw Error('Jawapan dikunci atau soalan berubah.');const ms=Math.max(0,Date.now()-Date.parse(r.opened_at));if(ms>=q.seconds*1000)throw Error('Masa menjawab tamat.');if(['audio','video_response'].includes(q.type))throw Error('Rakaman memerlukan mod live.');
  if(!d.answers.some(a=>a.player_id===p.id&&a.question_id===qid)){const grade=evaluateResponse(q,response);d.answers.push({room_id:r.id,player_id:p.id,question_id:qid,selected:Number.isInteger(response)?response:-1,response,...grade,approved:false,points:scoreAnswer(grade.correct,ms,q.seconds,r.settings.speedBonus),elapsed_ms:assessed(q)?ms:0});r.revision++;}return {accepted:true};
 });},
 async review(code,playerID,qid,decision){return change(d=>{const r=room(d,code),q=d.snapshots[r.id].find(x=>x.id===qid),a=d.answers.find(x=>x.room_id===r.id&&x.player_id===playerID&&x.question_id===qid);if(!a)throw Error('Respons tidak ditemui.');if(kind(q)==='manual'&&typeof decision.correct==='boolean'){a.correct=decision.correct;a.points=a.correct?1000:0;a.grading_state='manual';}else if(['cloud','discussion'].includes(q.type)&&typeof decision.approved==='boolean')a.approved=decision.approved;else throw Error('Keputusan semakan tidak sah.');r.revision++;return {};});},
 async state(code,host=false){
  let d=read(),r=room(d,code),q=d.snapshots[r.id][r.current_index];if(r.status==='question'&&Date.now()>=Date.parse(r.opened_at)+q.seconds*1000){await change(x=>{const rr=room(x,code);if(rr.status==='question'){rr.status='reveal';rr.revision++;}});d=read();r=room(d,code);q=d.snapshots[r.id][r.current_index];}
  const p=d.players.find(x=>x.room_id===r.id&&x.user_id===playerUID());if(!host&&!p)throw Error('Anda belum menyertai sesi ini.');const qs=d.snapshots[r.id],pending=d.answers.filter(a=>a.room_id===r.id&&a.grading_state==='pending').length;
  const players=d.players.filter(x=>x.room_id===r.id).map(p=>{const aa=d.answers.filter(x=>x.player_id===p.id);if(host||(r.phase!=='pre'&&r.settings.leaderboard&&['reveal','finished'].includes(r.status)))return {id:p.id,name:p.name,...(host?{participant_code:p.participant_code}:{}),...statsFor(aa,qs),answered_current:aa.some(a=>a.question_id===q?.id)};return {id:p.id,name:p.name};});
  const exposed=['question','reveal'].includes(r.status)?publicQuestion(q,r.status==='reveal'&&r.phase!=='pre'):null,mine=p&&d.answers.find(a=>a.player_id===p.id&&a.question_id===q?.id),aa=d.answers.filter(a=>a.room_id===r.id&&a.question_id===q?.id),dist={};
  if(r.status==='reveal'&&r.phase!=='pre'){aa.forEach(a=>{const rr=a.response??a.selected;if(Number.isInteger(rr)&&rr>=0)dist[rr]=(dist[rr]||0)+1;if(['multi','hottext'].includes(q.type))rr.forEach(i=>dist[i]=(dist[i]||0)+1);});if(['cloud','discussion'].includes(q.type))dist.approved=aa.filter(a=>a.approved).map(a=>a.response);}
  const own=p?d.answers.filter(a=>a.player_id===p.id):[];return {room:{...r,assessed_total:qs.filter(assessed).length},question:exposed,players,player:p||null,mine:mine?{selected:mine.selected,response:mine.response??mine.selected}:null,answered:aa.length,distribution:dist,my_stats:p&&r.status==='finished'&&r.phase!=='pre'?statsFor(own,qs):null,pending_count:pending,is_host:host,server_now:now()};
 },
 subscribe(code,host,cb){const fn=()=>cb();window.addEventListener('storage',fn);window.addEventListener('na-change',fn);return ()=>{window.removeEventListener('storage',fn);window.removeEventListener('na-change',fn);};},
 async upload(){throw Error('Mod demo: gunakan URL gambar HTTPS.');},async uploadResponse(){throw Error('Respons audio/video memerlukan mod live.');},async mediaURL(){throw Error('Rakaman demo tidak tersedia.');}
};
