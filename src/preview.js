// Design preview only. Never imports CONFIG, Auth, API or real participant records.
import {participantHome,publicStageState,screenMarkup} from './presentation.js?v=pop3';
import {escapeHTML as e} from './core.js?v=pop3';
import {TYPES,activityDefaults,publicQuestion} from './activities.js?v=pop3';
import {activityAnswer,activateActivity,installActivityEvents,setActivityHooks} from './activity-ui.js?v=pop3';
import {stageActivityMarkup} from './stage-activities.js?v=pop3';
import {enhancePresentation} from './design.js?v=pop3';
const app=document.querySelector('#app'),scene=document.querySelector('#scene'),type=document.querySelector('#activity'),theme=document.querySelector('#theme');
const names=['Nadia','Amir','Josephine','Hafiz','Aina','Daniel','Siti','Farah','Adam','Mei Ling','Irfan','Sara'];
const prompts={mcq:'Antara berikut, yang manakah buah?',tf:'Ini contoh soalan Betul atau Salah.',multi:'Pilih semua buah dalam senarai ini.',fill:'Lengkapkan nama buah berdasarkan petunjuk.',open:'Apakah satu perkara baharu yang anda pelajari?',match:'Padankan buah dengan warnanya.',hottext:'Pilih perkataan yang merupakan nama buah.',reorder:'Susun langkah ini mengikut turutan.',category:'Kelaskan makanan mengikut kumpulannya.',drag:'Padankan buah dengan warna yang sesuai.',dropdown:'Pilih warna yang sesuai bagi setiap buah.',grid:'Tandakan padanan warna yang sesuai.',label:'Kenal pasti bentuk bernombor pada gambar.',hotspot:'Pilih bulatan pada gambar.',math:'Berapakah separuh daripada 10?',graph:'Plot titik (2, 3) pada graf.',audio:'Kongsikan satu idea melalui suara.',video_response:'Ceritakan idea anda dalam video ringkas.',draw:'Lukis buah kegemaran anda!',poll:'Buah manakah pilihan anda hari ini?',cloud:'Sebut satu perkataan tentang makanan.',discussion:'Apa idea anda untuk booth pemakanan?',passage:'Baca cerita, kemudian jawab soalan.',multipart:'Mari cuba dua cabaran ringkas.',video:'Tonton klip pada telefon dan jawab soalan.',slide:'Selamat datang ke misi pemakanan!'};
function sample(t){
 const q={...activityDefaults(t),id:'preview-'+t,text:prompts[t],seconds:30,topic:TYPES[t][0],image:'',explanation:'Ini kandungan contoh untuk menilai reka bentuk sahaja. Pegawai perlu menyediakan dan menyemak soalan sebenar.'};
 if(['mcq','multi','hottext','poll'].includes(t)){q.options=['Epal','Lobak merah','Roti',t==='mcq'?'Ikan':'Oren'];q.correct=0;q.key=['multi','hottext'].includes(t)?[0,3]:null;}
 if(t==='fill'){q.config.prompts=['Buah berwarna oren','Buah berwarna merah'];q.key=[['oren'],['epal']];}
 if(['match','drag','dropdown','category','grid'].includes(t)){q.options=t==='category'?['Buah','Bijirin']:['Merah','Kuning','Oren'];q.config.prompts=t==='category'?['Epal','Roti','Oren']:['Epal','Pisang','Oren'];q.key=t==='grid'?[[0],[1],[2]]:t==='category'?[0,1,0]:[0,1,2];}
 if(t==='reorder'){q.options=['Masukkan buah ke dalam bekas','Ambil bekas bersih','Tutup bekas'];q.key=[1,0,2];}
 if(['label','hotspot'].includes(t))q.image=new URL('./assets/activity-diagram.svg',location.href).href;
 if(t==='math'){q.key='5';}
 if(['passage','multipart','video'].includes(t)){q.config.context='Aina membawa epal dan air kosong ke aktiviti sekolah. Daniel membawa pisang. Mereka berkongsi cerita tentang pilihan makanan masing-masing.';q.config.parts=[{text:'Apakah buah yang Aina bawa?',options:['Epal','Pisang'],at:5},{text:'Siapakah yang membawa pisang?',options:['Aina','Daniel'],at:10}];q.key=[0,1];}
 if(t==='slide')q.config.context='Jom belajar sambil bermain.\n\nBaca soalan dengan teliti. Jawab menggunakan telefon masing-masing.\n\nYang penting: cuba, belajar dan raikan usaha bersama!';
 return q;
}
function questionMarkup(q,{reveal=false,distribution={},audience=false}={}){
 if(audience&&!['mcq','tf'].includes(q.type))return `<h2 class="question-title">${e(q.text)}</h2>${stageActivityMarkup(q,{reveal,distribution})}`;
 if(audience)return `<h2 class="question-title">${e(q.text)}</h2><div class="answer-grid">${q.options.map((o,i)=>`<button disabled class="answer ans-${i} ${reveal&&q.correct===i?'correct':''}"><span class="answer-letter">${'ABCD'[i]}</span><span>${e(o)}</span>${reveal?`<span class="answer-count">${distribution[i]||0} undi ${q.correct===i?'✓':''}</span>`:''}</button>`).join('')}</div>`;
 return `<h2 class="question-title">${e(q.text)}</h2>${activityAnswer(q,{answerable:true})}`;
}
function leaderboard(rows,limit){return `<div class="rank-list">${rows.slice(0,limit).map((p,i)=>`<div class="rank-row ${i<3?'top-rank':''}"><span class="rank-number">${p.rank}</span><span class="avatar" style="--hue:${190+i*47}">${e(p.name[0])}</span><strong>${e(p.name)}</strong><span class="rank-score">${p.points.toLocaleString()} <small>mata</small></span></div>`).join('')}</div>`;}
function render(){
 const status=scene.value,t=type.value||'mcq',q=sample(t);document.documentElement.dataset.theme=theme.value;document.body.dataset.role=['participant','phone'].includes(status)?'player':'screen';document.querySelector('#type-control').hidden=!['question','reveal','phone'].includes(status);
 if(status==='participant'){app.innerHTML='<div class="preview-player">'+participantHome('A1B2C3D4','','',false)+'</div>';enhancePresentation(app);return;}
 if(status==='phone'){const p=publicQuestion(q);activateActivity(p);app.innerHTML=`<div class="preview-phone" style="max-width:580px;margin:auto"><p class="preview-note" role="status">PRATONTON SAHAJA. Tiada jawapan dihantar atau disimpan.</p><div class="question-stage glass"><div class="question-meta"><span>SOALAN 3 / 8</span><strong>18s</strong></div><div class="timer-track"><span style="width:65%"></span></div>${questionMarkup(p)}</div></div>`;enhancePresentation(app);return;}
 const data={room:{code:'A1B2C3D4',title:'Misi Pemakanan Ceria',theme:theme.value,phase:'normal',status,current_index:2,total:8,assessed_total:8,opened_at:new Date().toISOString(),settings:{leaderboard:true,winners:3}},players:names.map((name,i)=>({name,answered:8,answered_scored:8,correct:Math.max(1,8-Math.floor(i/3)),points:6500-i*350,ms:8500+i*320})),question:publicQuestion(q,status==='reveal'),answered:9,distribution:{0:5,1:2,2:1,3:1,approved:['Ceria','Belajar','Buah','Ceria','Pilihan sihat']},server_now:new Date().toISOString()};
 app.innerHTML=screenMarkup(publicStageState(data),{questionMarkup,leaderboard,source:()=>'',joinLink:()=>new URL('./index.html',location.href).href});
 const timer=document.querySelector('#timer-value');if(status==='question'&&timer)timer.textContent='18s';
 const qr=document.querySelector('#qr');if(qr){const p=document.createElement('div');p.style.cssText='width:170px;height:170px;flex:none;background:#f6efff;border:3px dashed #c5ade8;border-radius:20px;display:grid;place-items:center;font-weight:1000;color:#6941d9;text-align:center;font-size:16px';p.textContent='RUANG QR\nPRATONTON';qr.replaceWith(p);}
 const hint=document.querySelector('#qr-hint');if(hint)hint.textContent='QR sebenar dijana apabila pegawai membuka bilik.';
 enhancePresentation(app);
}
for(const [id,item]of Object.entries(TYPES)){const o=document.createElement('option');o.value=id;o.textContent=item[0];type.append(o);}
const params=new URLSearchParams(location.search);if(['lobby','question','reveal','finished','participant','phone'].includes(params.get('scene')))scene.value=params.get('scene');if(TYPES[params.get('type')])type.value=params.get('type');if(['aurora','ocean','sunset'].includes(params.get('theme')))theme.value=params.get('theme');
setActivityHooks({redraw:render,upload:async()=>{throw Error('Pratonton tidak memuat naik rakaman. Gunakan sesi sebenar untuk ujian media.');}});installActivityEvents();
scene.addEventListener('change',render);type.addEventListener('change',render);theme.addEventListener('change',render);
document.addEventListener('submit',ev=>ev.preventDefault());document.addEventListener('click',ev=>{const button=ev.target.closest('[data-action="activity-submit"]');if(button){ev.preventDefault();document.querySelector('.preview-note').textContent='PRATONTON SAHAJA. Ini contoh butang hantar, bukan jawapan sesi sebenar.';}});render();
