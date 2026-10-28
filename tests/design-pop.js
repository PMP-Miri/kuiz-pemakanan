import {TYPES,activityDefaults,publicQuestion} from '../src/activities.js?v=pop3';
import {stageActivityMarkup} from '../src/stage-activities.js?v=pop3';
import {participantHome,publicStageState,screenMarkup} from '../src/presentation.js?v=pop3';
import {textSizeClass,applyReading} from '../src/design.js?v=pop3';
export function runDesignChecks(){
 const checks=[];
 const test=(name,fn)=>{try{if(fn()===false)throw Error('Assertion failed');checks.push({name,pass:true});}catch(err){checks.push({name,pass:false,error:err.message});}};
 const assert=x=>{if(!x)throw Error('Assertion failed');};
 const make=type=>({...activityDefaults(type),id:'test-'+type,text:'Soalan <b>bukan HTML</b>',seconds:30,image:'https://example.org/question.png',topic:'Topik',rubric:'PRIVATE_RUBRIC_SENTINEL',explanation:'EXPLANATION_SENTINEL'});
 for(const t of Object.keys(TYPES)){
  const q=make(t);
  test(t+': TV markup generated from public question',()=>{const s=stageActivityMarkup(publicQuestion(q));assert(s.includes('stage-activity')&&!s.includes('undefined'));});
  test(t+': TV contains no form controls or answer submission',()=>{const s=stageActivityMarkup(publicQuestion(q));assert(!/<(?:input|select|textarea|form)\b/i.test(s)&&!s.includes('activity-submit')&&!s.includes('data-action="answer"'));});
  test(t+': no rubric or solution before reveal',()=>{const s=stageActivityMarkup(q);assert(!s.includes('PRIVATE_RUBRIC_SENTINEL')&&!s.includes('activity-solution')&&!s.includes('EXPLANATION_SENTINEL'));});
  test(t+': reveal markup does not expose author rubric',()=>assert(!stageActivityMarkup(publicQuestion(q,true),{reveal:true}).includes('PRIVATE_RUBRIC_SENTINEL')));
 }
 test('fill answer aliases are not exposed in waiting slots',()=>{const q=make('fill');q.key=[['SECRET_ALIAS_SENTINEL']];assert(!stageActivityMarkup(q).includes('SECRET_ALIAS_SENTINEL'));});
 test('fill accepted answer is shown only after reveal',()=>{const q=make('fill');q.key=[['SECRET_ALIAS_SENTINEL']];assert(stageActivityMarkup(q,{reveal:true}).includes('SECRET_ALIAS_SENTINEL'));});
 test('prompts escape author HTML',()=>{const q=make('fill');q.config.prompts=['<img src=x onerror=alert(1)>'];const s=stageActivityMarkup(q);assert(!s.includes('<img src=x')&&s.includes('&lt;img'));});
 test('options escape author HTML',()=>{const q=make('multi');q.options=['<script>alert(1)</script>','B'];const s=stageActivityMarkup(q);assert(!s.includes('<script>')&&s.includes('&lt;script&gt;'));});
 test('approved TV responses escape HTML',()=>{const q=make('cloud');const s=stageActivityMarkup(q,{reveal:true,distribution:{approved:['<img src=x>']}});assert(s.includes('&lt;img')&&!s.includes('<img src=x>'));});
 test('cloud hides approved payload until reveal',()=>assert(!stageActivityMarkup(make('cloud'),{distribution:{approved:['RESPONSE_SENTINEL']}}).includes('RESPONSE_SENTINEL')));
 test('poll shows response counts after reveal',()=>assert(stageActivityMarkup(make('poll'),{reveal:true,distribution:{0:17}}).includes('17 jawapan')));
 test('unsafe image URL does not become an image',()=>{const q=make('label');q.image='javascript:alert(1)';assert(!stageActivityMarkup(q).includes('src="javascript:'));});
 test('reorder stage uses public mixed options, not answer-key order',()=>{const q=make('reorder');q.options=['Visible A','Visible B','Visible C'];q.key=[2,0,1];const s=stageActivityMarkup(q);assert(s.indexOf('Visible A')<s.indexOf('Visible B')&&s.indexOf('Visible B')<s.indexOf('Visible C'));});
 test('graph stage contains axes but no correct point markers',()=>{const s=stageActivityMarkup(make('graph'));assert(s.includes('stage-graph')&&!s.includes('<circle'));});
 test('video stage states phone-only playback honestly',()=>assert(stageActivityMarkup(make('video')).includes('Video tidak dimainkan serentak pada TV')));
 test('participant page has no host entry point',()=>{const s=participantHome();assert(!s.includes('pegawai.html')&&!s.includes('#/dashboard')&&!s.includes('Studio Pegawai'));});
 test('participant names and codes are escaped',()=>{const s=participantHome('"<x>','<script>','<img>');assert(!s.includes('<script>')&&s.includes('&lt;script&gt;'));});
 test('short title uses normal size',()=>textSizeClass('Contoh soalan')==='normal');
 test('long title uses long size',()=>textSizeClass('x'.repeat(121))==='long');
 test('very long title uses xlong size',()=>textSizeClass('x'.repeat(211))==='xlong');
 test('reading mode accepts large',()=>{const b={dataset:{}};assert(applyReading('large',b)==='large'&&b.dataset.reading==='large');});
 test('reading mode rejects arbitrary values',()=>{const b={dataset:{}};assert(applyReading('invalid',b)==='standard'&&b.dataset.reading==='standard');});
 const room={code:'A1B2C3D4',title:'Test',theme:'aurora',phase:'normal',status:'question',current_index:0,total:1,opened_at:new Date().toISOString(),settings:{leaderboard:true,winners:3}};
 const data={room,players:[{name:'Nadia',id:'PRIVATE_USER_ID',participant_code:'PRIVATE_PARTICIPANT_CODE',answered:1,points:1000,correct:1,ms:1000}],question:make('fill'),answered:1,distribution:{},server_now:new Date().toISOString()};
 test('TV public state removes individual identity codes',()=>{const s=JSON.stringify(publicStageState(data));assert(!s.includes('PRIVATE_USER_ID')&&!s.includes('PRIVATE_PARTICIPANT_CODE'));});
 test('TV public state removes correctness before reveal',()=>{const d=publicStageState(data);assert(!Object.hasOwn(d.question,'key')&&!Object.hasOwn(d.players[0],'correct'));});
 test('TV callback receives audience flag',()=>{let flag=false;screenMarkup(publicStageState(data),{questionMarkup:(q,o)=>{flag=o.audience;return '';},leaderboard:()=>'',source:()=>'',joinLink:()=>''});assert(flag===true);});
 test('TV has no private monitor or host controls',()=>{const s=screenMarkup(publicStageState(data),{questionMarkup:()=>'',leaderboard:()=>'',source:()=>'',joinLink:()=>''});assert(!s.includes('data-control=')&&!s.includes('class="monitor"')&&!s.includes('PRIVATE_PARTICIPANT_CODE'));});
 test('pre-assessment hides solution despite reveal status',()=>{const x=structuredClone(data);x.room.phase='pre';x.room.status='reveal';const d=publicStageState(x);assert(!Object.hasOwn(d.question,'key')&&!Object.hasOwn(d.question,'correct'));});
 test('manual pending state delays public podium',()=>{const x=structuredClone(data);x.room.status='finished';x.pending_count=1;const s=screenMarkup(publicStageState(x),{questionMarkup:()=>'',leaderboard:()=>'',source:()=>'',joinLink:()=>''});assert(!s.includes('class="podium"')&&s.includes('Keputusan belum dimuktamadkan'));});
 return {total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass),checks};
}
