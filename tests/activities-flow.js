import {newQuiz,newQuestion,validateQuiz} from '../src/core.js?v=pop3';
import {TYPES,activityDefaults,kind,statsFor} from '../src/activities.js?v=pop3';
export async function runActivityFlow(demo,env){
 const names=[],check=(x,n)=>{if(!x)throw Error(n);names.push(n);};
 const quiz=newQuiz();quiz.title='Ujian 26 Aktiviti';quiz.status='ready';quiz.questions=Object.keys(TYPES).map(type=>{const x={...newQuestion(),...activityDefaults(type),text:'Demo '+type,seconds:180};if(['label','hotspot'].includes(type))x.image='https://example.org/picture.svg';if(type==='video')x.config.media='https://example.org/clip.mp4';return x;});
 check(validateQuiz(quiz,true).length===0,'26 jenis sah untuk simpan');await demo.manage('save',{quiz});
 const cfg={quiz_id:quiz.id,phase:'normal',leaderboard:true,speedBonus:true,shuffleQuestions:true,shuffleOptions:true,winners:3};
 env.participant('activities-player');const r=await demo.manage('create',cfg),player=await demo.join(r.code,'Hafiz');await demo.control(r.code,'start');
 for(let i=0;i<quiz.questions.length;i++){
  const s=await demo.state(r.code),d=await demo.manage('report',{code:r.code}),q=d.questions.find(x=>x.id===s.question.id);
  check(!Object.hasOwn(s.question,'key')&&!Object.hasOwn(s.question,'correct')&&!Object.hasOwn(s.question,'rubric'),q.type+': kunci dirahsiakan');
  let response;if(['mcq','tf'].includes(q.type))response=q.correct;else if(q.type==='fill')response=q.key.map(a=>a[0]);else if(q.type==='hotspot')response=[25,25];else if(q.type==='open')response='respons manual';else if(q.type==='draw')response=[[[5,5],[20,30],[80,90]]];else if(q.type==='poll')response=0;else if(['cloud','discussion'].includes(q.type))response='Ilmu baharu';else if(q.type==='slide')response=true;else response=q.key;
  if(['audio','video_response'].includes(q.type)){let rejected=false;try{await demo.answer(r.code,q.id,{path:'room/player/q/clip.webm'});}catch{rejected=true;}check(rejected,q.type+': demo menolak muat naik, bukan kejayaan palsu');}
  else{await demo.answer(r.code,q.id,response);await demo.answer(r.code,q.id,response);check((await demo.manage('report',{code:r.code})).answers.filter(a=>a.question_id===q.id).length===1,q.type+': tepat satu respons');}
  await demo.control(r.code,'lock');const reveal=await demo.state(r.code);
  check(!Object.hasOwn(reveal.question,'rubric'),q.type+': rubrik kekal peribadi');
  if(['cloud','discussion'].includes(q.type)){check(reveal.distribution.approved.length===0,q.type+': belum ditayang sebelum moderasi');await demo.review(r.code,player.id,q.id,{approved:true});check((await demo.state(r.code)).distribution.approved[0]==='Ilmu baharu',q.type+': ditayang selepas diluluskan');await demo.review(r.code,player.id,q.id,{approved:false});check((await demo.state(r.code)).distribution.approved.length===0,q.type+': boleh ditarik balik');}
  await demo.control(r.code,'next');
 }
 let final=await demo.state(r.code);check(final.room.status==='finished','26 aktiviti tamat');check(final.room.assessed_total===22,'Denominator hanya 22 aktiviti dinilai');check(final.pending_count===2,'Dua respons manual menunggu semakan');
 const report=await demo.manage('report',{code:r.code});for(const a of report.answers.filter(a=>a.grading_state==='pending'))await demo.review(r.code,player.id,a.question_id,{correct:true});
 final=await demo.state(r.code);check(final.pending_count===0,'Semua semakan selesai');check(final.my_stats.correct===20,'18 auto dan 2 manual betul, 2 rakaman tidak dijawab');
 const reviewed=await demo.manage('report',{code:r.code}),stats=statsFor(reviewed.answers,reviewed.questions);check(stats.answered===24&&stats.answered_scored===20,'4 aktiviti tanpa markah dikecualikan daripada penilaian');
 for(const a of reviewed.answers.filter(a=>a.grading_state==='manual'))check(a.points===1000,'Semakan manual tiada bonus kelajuan');
 const allPolls={...newQuiz(),title:'Undian sahaja',status:'ready',questions:[{...newQuestion(),...activityDefaults('poll'),text:'Pendapat anda?'}]};await demo.manage('save',{quiz:allPolls});const pollRoom=await demo.manage('create',{...cfg,quiz_id:allPolls.id});await demo.join(pollRoom.code,'Pengundi');const ps=await demo.state(pollRoom.code);check(ps.room.assessed_total===0&&!ps.room.settings.leaderboard,'Sesi undian sahaja tiada ranking');let rejected=false;try{await demo.manage('create',{...cfg,quiz_id:allPolls.id,phase:'pre'});}catch{rejected=true;}check(rejected,'Pra tanpa soalan dinilai ditolak');
 const pq={...newQuiz(),title:'Pra pasca campuran',status:'ready',questions:['fill','open','poll'].map(type=>({...newQuestion(),...activityDefaults(type),text:'Ujian '+type,seconds:120}))};await demo.manage('save',{quiz:pq});
 env.participant('pre-mixed');const pre=await demo.manage('create',{...cfg,quiz_id:pq.id,phase:'pre',shuffleQuestions:false}),pp=await demo.join(pre.code,'Peserta berpasangan');await demo.control(pre.code,'start');
 for(let i=0;i<3;i++){const st=await demo.state(pre.code),q=st.question;await demo.answer(pre.code,q.id,q.type==='fill'?['jawapan']:q.type==='open'?'manual':0);await demo.control(pre.code,'lock');const rr=await demo.state(pre.code);check(!Object.hasOwn(rr.question,'key')&&!Object.hasOwn(rr.question,'correct')&&!Object.hasOwn(rr.question,'rubric'),'Pra '+q.type+': tiada pendedahan skema');await demo.control(pre.code,'next');}
 const pr=await demo.manage('report',{code:pre.code}),pa=pr.answers.find(a=>a.grading_state==='pending');await demo.review(pre.code,pp.id,pa.question_id,{correct:true});
 env.participant('post-mixed');const post=await demo.manage('create',{...cfg,quiz_id:pq.id,phase:'post',pre_id:pre.id,shuffleQuestions:false}),sp=await demo.join(post.code,'Nama lain',pp.participant_code);check(sp.participant_code===pp.participant_code,'Kod pra/pasca campuran dipadankan');await demo.control(post.code,'start');
 for(let i=0;i<3;i++){const st=await demo.state(post.code),q=st.question;await demo.answer(post.code,q.id,q.type==='fill'?['jawapan']:q.type==='open'?'manual':0);await demo.control(post.code,'lock');await demo.control(post.code,'next');}
 const po=await demo.manage('report',{code:post.code}),pending=po.answers.find(a=>a.grading_state==='pending');await demo.review(post.code,sp.id,pending.question_id,{correct:true});const fin=await demo.state(post.code);check(fin.room.assessed_total===2&&fin.my_stats.correct===2&&fin.pending_count===0,'Pasca campuran: 2/2, undian tidak termasuk');
 return {checks:names.length,names};
}
