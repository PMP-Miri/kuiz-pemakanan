// NutriArena Activities v2. Pure model, shared by demo and tests.
// No eval, HTML from authors, symbolic math, or client-supplied scores.
export const ACTIVITY_VERSION = 2;
export const TYPES = {
 mcq:['Aneka pilihan','Asas','auto'], tf:['Betul / Salah','Asas','auto'],
 multi:['Pilih banyak jawapan','Asas','auto'], fill:['Isi tempat kosong','Asas','auto'],
 open:['Respons terbuka','Respons','manual'],
 match:['Padankan','Interaktif','auto'], hottext:['Pilih teks (Hot Text)','Interaktif','auto'],
 reorder:['Susun mengikut turutan','Interaktif','auto'], category:['Kelaskan kategori','Interaktif','auto'],
 drag:['Seret jawapan ke ruang','Interaktif','auto'], dropdown:['Pilihan drop-down','Interaktif','auto'],
 grid:['Jadual padanan','Interaktif','auto'], label:['Label gambar','Visual','auto'], hotspot:['Klik kawasan gambar','Visual','auto'],
 math:['Jawapan nombor / pecahan','Matematik','auto'], graph:['Plot titik pada graf','Matematik','auto'],
 audio:['Respons audio','Respons','manual'], video_response:['Respons video','Respons','manual'], draw:['Lukis jawapan','Respons','manual'],
 poll:['Undian','Penglibatan','none'], cloud:['Awan kata','Penglibatan','none'], discussion:['Papan idea bermoderasi','Penglibatan','none'],
 passage:['Petikan + soalan','Gabungan','auto'], multipart:['Soalan berbilang bahagian','Gabungan','auto'], video:['Video + hentian soalan','Gabungan','auto'],
 slide:['Slaid penerangan','Penglibatan','none']
};
export const kind=q=>TYPES[q?.type]?.[2]||'auto';
export const assessed=q=>kind(q)!=='none';
export const normalText=s=>String(s??'').trim().toLowerCase().replace(/\s+/g,' ');
export function numberValue(v){
 const s=String(v??'').trim(); if(s.length>80)return NaN;
 if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return Number(s);
 const f=s.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);return f&&Number(f[2])!==0?Number(f[1])/Number(f[2]):NaN;
}
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sameSet=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&[...a].sort().every((v,i)=>v===[...b].sort()[i]);
export function activityDefaults(type='mcq'){
 const base={type,options:[],correct:0,config:{},key:null,rubric:''};
 if(['mcq','tf','multi','poll','hottext'].includes(type)){base.options=type==='tf'?['Betul','Salah']:['Pilihan 1','Pilihan 2','Pilihan 3','Pilihan 4'];base.key=['multi','hottext'].includes(type)?[0,1]:null;}
 if(type==='fill'){base.config={prompts:['Ruang 1']};base.key=[['jawapan','jawapan alternatif']];}
 if(['open','draw','audio','video_response'].includes(type))base.rubric='Tandakan betul jika jawapan memenuhi kehendak soalan.';
 if(['match','drag','dropdown','label','grid'].includes(type)){base.options=['Jawapan A','Jawapan B','Jawapan C'];base.config={prompts:['Item 1','Item 2','Item 3']};base.key=[0,1,2];if(type==='label')base.config.points=[[20,25],[50,50],[80,75]];if(type==='grid')base.key=[[0],[1],[2]];}
 if(type==='category'){base.options=['Kumpulan A','Kumpulan B'];base.config={prompts:['Item 1','Item 2','Item 3']};base.key=[0,1,0];}
 if(type==='reorder'){base.options=['Langkah pertama','Langkah kedua','Langkah ketiga'];base.key=[0,1,2];}
 if(type==='hotspot'){base.config={};base.key=[[20,20,30,30]];}
 if(type==='math'){base.key='1/2';base.config={tolerance:0.001};}
 if(type==='graph'){base.key=[[2,3]];base.config={scale:10};}
 if(['passage','multipart','video'].includes(type)){base.config={context:'Tulis petikan atau konteks di sini.',media:'',parts:[{text:'Bahagian A',options:['Pilihan A','Pilihan B'],at:5},{text:'Bahagian B',options:['Pilihan A','Pilihan B'],at:10}]};base.key=[0,1];}
 if(type==='slide')base.config={context:'Tulis penerangan pendidikan di sini.'};
 return base;
}
export function publicQuestion(q,reveal=false){
 const x=structuredClone(q);delete x.rubric;if(!reveal){for(const f of ['key','correct','explanation','source','sourceLabel'])delete x[f];}return x;
}
export function responseValid(q,r){
 try {
 if(r===undefined||r===null||JSON.stringify(r).length>60000)return false;
 const idx=v=>Number.isInteger(v)&&v>=0&&v<(q.options||[]).length;
 const list=a=>Array.isArray(a)&&a.length>0&&a.length<=(q.options||[]).length&&new Set(a).size===a.length&&a.every(idx);
 const text=(v,max=1000)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 const mapping=()=>Array.isArray(r)&&r.length===q.config?.prompts?.length&&r.every(idx);
 switch(q.type){
 case 'mcq':case 'tf':case 'poll':return idx(r);
 case 'multi':case 'hottext':return list(r);
 case 'fill':return Array.isArray(r)&&r.length===q.config.prompts.length&&r.every(v=>text(v,200));
 case 'open':return text(r);
 case 'cloud':return text(r,80);
 case 'discussion':return text(r,400);
 case 'match':case 'drag':case 'dropdown':case 'label':case 'category':return mapping();
 case 'grid':return Array.isArray(r)&&r.length===q.config.prompts.length&&r.every(list);
 case 'reorder':return list(r)&&r.length===q.options.length;
 case 'math':return typeof r==='string'&&Number.isFinite(numberValue(r));
 case 'graph':return Array.isArray(r)&&r.length>0&&r.length<=20&&r.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isInteger(n)&&Math.abs(n)<=q.config.scale))&&new Set(r.map(JSON.stringify)).size===r.length;
 case 'hotspot':return Array.isArray(r)&&r.length===2&&r.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100);
 case 'audio':case 'video_response':return r&&typeof r==='object'&&text(r.path,500)&&/^[a-zA-Z0-9_./-]+$/.test(r.path)&&!r.path.includes('..');
 case 'draw':return Array.isArray(r)&&r.length>0&&r.length<=100&&r.every(s=>Array.isArray(s)&&s.length>=2&&s.length<=500&&s.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>typeof v==='number'&&v>=0&&v<=100)));
 case 'passage':case 'multipart':case 'video':return Array.isArray(r)&&r.length===q.config.parts.length&&r.every((v,i)=>Number.isInteger(v)&&v>=0&&v<q.config.parts[i].options.length);
 case 'slide':return r===true;
 default:return false;
 }
 } catch { return false; }
}
export function evaluateResponse(q,r){
 if(!responseValid(q,r))throw Error('Jawapan belum lengkap atau format tidak sah.');
 if(kind(q)==='none')return {correct:false,grading_state:'unscored'};
 if(kind(q)==='manual')return {correct:false,grading_state:'pending'};
 let ok=false;
 switch(q.type){
 case 'mcq':case 'tf':ok=r===q.correct;break;
 case 'multi':case 'hottext':ok=sameSet(r,q.key);break;
 case 'fill':ok=r.every((v,i)=>q.key[i].some(a=>normalText(v)===normalText(a)));break;
 case 'math':ok=Math.abs(numberValue(r)-numberValue(q.key))<=q.config.tolerance;break;
 case 'graph':ok=sameSet(r.map(JSON.stringify),q.key.map(JSON.stringify));break;
 case 'grid':ok=r.every((v,i)=>sameSet(v,q.key[i]));break;
 case 'hotspot':ok=q.key.some(([x,y,w,h])=>r[0]>=x&&r[0]<=x+w&&r[1]>=y&&r[1]<=y+h);break;
 default:ok=equal(r,q.key);
 }
 return {correct:ok,grading_state:'graded'};
}
export function mixActivity(q,mixOptions=true,rng=Math.random){
 let x=structuredClone(q);const types=['mcq','tf','multi','hottext','match','drag','dropdown','label','grid','reorder'];
 if(!types.includes(x.type)||(!mixOptions&&!['match','label','reorder'].includes(x.type)))return x;
 const order=x.options.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 x.options=order.map(i=>q.options[i]);const map=v=>order.indexOf(v);
 if(['mcq','tf'].includes(x.type))x.correct=map(q.correct);
 else if(x.type==='grid')x.key=q.key.map(row=>row.map(map));
 else x.key=q.key.map(map);
 return x;
}
export function validateActivity(q,ready=true){
 const errors=[],bad=t=>errors.push(t),t=q.type,c=q.config||{},key=q.key;
 if(!Object.hasOwn(TYPES,t))return ['Jenis aktiviti tidak sah.'];
 if(q.config!==undefined&&(q.config===null||typeof q.config!=='object'||Array.isArray(q.config)))return ['Konfigurasi mesti objek.'];
 if(!Array.isArray(q.options))return ['Pilihan mesti array.'];
 if(!Number.isInteger(q.seconds)||q.seconds<5||q.seconds>900)bad('Masa mesti 5 hingga 900 saat.');
 if(q.options.length>20||q.options.some(s=>typeof s!=='string'||s.length>300)){bad('Format pilihan tidak sah (maksimum 20).');return errors;}
 if(JSON.stringify(c).length>25000||JSON.stringify(key??null).length>15000)bad('Konfigurasi terlalu besar.');
 if(!ready)return errors;
 const opts=q.options||[];
 if(['mcq','tf','multi','poll','hottext','match','category','drag','dropdown','label','grid','reorder'].includes(t)&& (opts.length<2||opts.some(s=>!s.trim())))bad('Isi sekurang-kurangnya dua pilihan.');
 if(t==='tf'&&opts.length!==2)bad('Betul/Salah mesti dua pilihan.');
 if(['mcq','tf'].includes(t)&&!responseValid(q,q.correct))bad('Tandakan jawapan betul.');
 if(['multi','hottext','reorder'].includes(t)&&!responseValid(q,key))bad('Kunci jawapan tidak sah.');
 if(['fill','match','category','drag','dropdown','label','grid'].includes(t)&&(!Array.isArray(c.prompts)||!c.prompts.length||c.prompts.length>20||c.prompts.some(s=>typeof s!=='string'||!s.trim()||s.length>300)))bad('Isi 1 hingga 20 item / ruang.');
 if(t==='fill'&&(!Array.isArray(key)||key.length!==c.prompts?.length||key.some(row=>!Array.isArray(row)||!row.length||row.length>10||row.some(s=>typeof s!=='string'||!s.trim()||s.length>200))))bad('Setiap ruang perlukan jawapan; asingkan alternatif dengan |.');
 if(['match','category','drag','dropdown','label','grid'].includes(t)&&!responseValid(q,key))bad('Tetapkan jawapan bagi setiap item.');
 if(t==='label'&&(!q.image||!Array.isArray(c.points)||c.points.length!==c.prompts?.length||c.points.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v)||v<0||v>100))))bad('Label perlukan gambar dan koordinat 0 hingga 100.');
 if(t==='hotspot'&&(!q.image||!Array.isArray(key)||!key.length||key.length>10||key.some(p=>!Array.isArray(p)||p.length!==4||p.some(v=>!Number.isFinite(v)||v<0||v>100)||p[2]<=0||p[3]<=0||p[0]+p[2]>100||p[1]+p[3]>100)))bad('Hotspot perlukan gambar dan kawasan segi empat dalam 0 hingga 100%.');
 if(t==='math'&&(!Number.isFinite(numberValue(key))||!Number.isFinite(c.tolerance)||c.tolerance<0||c.tolerance>1000))bad('Isi jawapan nombor / pecahan dan toleransi sah.');
 if(t==='graph'&&(![10,20].includes(c.scale)||!responseValid(q,key)))bad('Graf perlukan titik integer dalam skala 10 atau 20.');
 if(['passage','multipart','video'].includes(t)){
  if(!Array.isArray(c.parts)||c.parts.length<2||c.parts.length>5)bad('Perlu 2 hingga 5 bahagian.');
  else if(c.parts.some(p=>typeof p.text!=='string'||!p.text.trim()||p.text.length>1000||!Array.isArray(p.options)||p.options.length<2||p.options.length>5||p.options.some(s=>typeof s!=='string'||!s.trim()||s.length>300)))bad('Lengkapkan soalan dan 2 hingga 5 pilihan setiap bahagian.');
  if(!responseValid(q,key))bad('Tetapkan jawapan setiap bahagian.');
  if(t==='video'&&(!/^https:\/\//.test(c.media||'')||c.parts?.some((p,i)=>!Number.isFinite(p.at)||p.at<0||p.at>=q.seconds||(i&&p.at<=c.parts[i-1].at))))bad('Video perlukan URL MP4/WebM HTTPS dan masa hentian menaik yang kurang daripada tempoh menjawab.');
 }
 if(c.context!==undefined&&(typeof c.context!=='string'||c.context.length>8000))bad('Konteks maksimum 8000 aksara.');
 if(q.rubric!==undefined&&(typeof q.rubric!=='string'||q.rubric.length>2000))bad('Rubrik maksimum 2000 aksara.');
 return errors;
}
export function statsFor(answers,questions){
 const set=new Set(questions.filter(assessed).map(q=>q.id)),aa=answers.filter(a=>set.has(a.question_id));
 return {answered:answers.length,answered_scored:aa.length,correct:aa.filter(a=>a.correct).length,points:aa.reduce((s,a)=>s+a.points,0),ms:aa.reduce((s,a)=>s+a.elapsed_ms,0),pending:aa.filter(a=>a.grading_state==='pending').length};
}
