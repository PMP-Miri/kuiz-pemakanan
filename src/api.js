import {CONFIG} from '../config.js?v=pop3';
import {demo} from './demo.js?v=pop3';
let modulePromise;
const clients={};
async function client(host=true){
 if(clients[host?'host':'player'])return clients[host?'host':'player'];
 if(!CONFIG.supabaseUrl||!CONFIG.supabasePublishableKey)throw Error('Isi Supabase URL dan publishable key dalam config.js dahulu.');
 modulePromise ||= import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/+esm');
 const {createClient}=await modulePromise;
 const c=createClient(CONFIG.supabaseUrl,CONFIG.supabasePublishableKey,{auth:{storage:host?localStorage:sessionStorage,storageKey:host?'nutriarena-host-auth':'nutriarena-player-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 clients[host?'host':'player']=c;return c;
}
async function rpc(name,args,host=true){const c=await client(host);const {data,error}=await c.rpc(name,args);if(error){if(error.code==='PGRST202'&&['na_answer_v2','na_review'].includes(name))throw Error('Sila jalankan 002_activities.sql dalam SQL Editor Supabase dahulu.');throw Error(error.message);}return data;}
export const api = CONFIG.mode==='demo' ? demo : {
 async login(email,password){const c=await client();const {error}=await c.auth.signInWithPassword({email,password});if(error)throw Error(error.message);await rpc('na_manage',{p_action:'dashboard',p_data:{}});},
 async logout(){const c=await client();const {error}=await c.auth.signOut();if(error)throw Error(error.message);},
 async hostSession(){const c=await client();const {data}=await c.auth.getSession();return data.session;},
 manage(action,data={}){return rpc('na_manage',{p_action:action,p_data:data});},
 async join(code,name,participantCode='',captchaToken=''){
  const c=await client(false),{data}=await c.auth.getSession();
  if(!data.session){const {error}=await c.auth.signInAnonymously({options:captchaToken?{captchaToken}:undefined});if(error)throw Error(error.message);}
  return rpc('na_join',{p_code:code,p_name:name,p_participant_code:participantCode},false);
 },
 state(code,host=false){return rpc('na_state',{p_code:code},host);},
 answer(code,qid,selected){return rpc('na_answer_v2',{p_code:code,p_question_id:qid,p_response:selected},false);},
 review(code,playerID,qid,decision){return rpc('na_review',{p_code:code,p_player_id:playerID,p_question_id:qid,p_decision:decision});},
 async mediaURL(path){const c=await client();const {data,error}=await c.storage.from('nutriarena-responses').createSignedUrl(path,300);if(error)throw Error(error.message);return data.signedUrl;},
 async uploadResponse(file,code,qid){
  const allowed=['audio/webm','audio/ogg','audio/mpeg','audio/mp4','audio/wav','audio/x-wav','video/mp4','video/webm','video/quicktime'];
  const mime=file.type.split(';')[0];if(!allowed.includes(mime)||file.size>10*1024*1024||file.size<1)throw Error('Pilih audio/video disokong, maksimum 10 MB.');
  const state=await this.state(code,false);if(state.room.status!=='question'||state.question?.id!==qid)throw Error('Soalan telah berubah atau dikunci.');
  if(state.question.type==='audio'&&!mime.startsWith('audio/'))throw Error('Soalan ini memerlukan fail audio.');
  if(state.question.type==='video_response'&&!mime.startsWith('video/'))throw Error('Soalan ini memerlukan fail video.');
  const c=await client(false),ext={'audio/webm':'webm','audio/ogg':'ogg','audio/mpeg':'mp3','audio/mp4':'m4a','audio/wav':'wav','audio/x-wav':'wav','video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov'}[mime];
  const path=state.room.id+'/'+state.player.id+'/'+qid+'/'+crypto.randomUUID()+'.'+ext;
  const {error}=await c.storage.from('nutriarena-responses').upload(path,file,{contentType:mime,upsert:false});if(error)throw Error(error.message);return {path};
 },
 control(code,action){return rpc('na_control',{p_code:code,p_action:action});},
 async subscribe(code,host,callback){const c=await client(host);const ch=c.channel('room-'+code+'-'+(host?'host':'player')).on('postgres_changes',{event:'UPDATE',schema:'public',table:'na_rooms',filter:'code=eq.'+code},callback).subscribe();return ()=>{c.removeChannel(ch);};},
 async upload(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Pilih JPEG, PNG atau WebP, maksimum 5 MB.');
  const c=await client(),{data}=await c.auth.getUser();if(!data.user)throw Error('Log masuk dahulu.');
  const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];const path=data.user.id+'/'+crypto.randomUUID()+'.'+ext;
  const {error}=await c.storage.from('nutriarena-media').upload(path,file,{contentType:file.type,upsert:false});if(error)throw Error(error.message);
  return c.storage.from('nutriarena-media').getPublicUrl(path).data.publicUrl;
 }
};
