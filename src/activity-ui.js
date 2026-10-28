import {escapeHTML as e,safeURL} from './core.js?v=pop3';
import {TYPES,activityDefaults,kind,responseValid,normalText} from './activities.js?v=pop3';
let drafts=new Map(),rerender=()=>{},uploader=null,uploading=false,dragValue=null;
export function resetActivityDrafts(){drafts.clear();}
const get=q=>drafts.has(q.id)?drafts.get(q.id):q.type==='reorder'?q.options.map((_,i)=>i):q.type==='draw'?[]:null;
export const responseDraft=q=>get(q);
export function setActivityHooks({redraw,upload}){rerender=redraw;uploader=upload;}
const lines=v=>Array.isArray(v)?v.join('\n'):'';
const field=(label,name,value,help='',rows=4)=>`<label>${e(label)}<textarea data-af="${name}" rows="${rows}" maxlength="12000">${e(value??'')}</textarea>${help?`<small class="muted">${e(help)}</small>`:''}</label>`;
export function typeOptions(selected){return [...new Set(Object.values(TYPES).map(x=>x[1]))].map(group=>`<optgroup label="${e(group)}">${Object.entries(TYPES).filter(([,x])=>x[1]===group).map(([id,x])=>`<option value="${id}" ${id===selected?'selected':''}>${e(x[0])}${x[2]==='manual'?' · Semakan pegawai':x[2]==='none'?' · Tanpa markah':''}</option>`).join('')}</optgroup>`).join('');}
export function switchType(q,type){const keep={id:q.id,text:q.text,seconds:q.seconds,image:q.image,explanation:q.explanation,source:q.source,sourceLabel:q.sourceLabel,topic:q.topic};Object.assign(q,activityDefaults(type),keep);if(['audio','video_response','video','passage','multipart','draw'].includes(type))q.seconds=Math.max(120,q.seconds);}
export function activityEditor(q){
 const t=q.type,c=q.config||{},key=q.key;let body='';
 if(['multi','hottext'].includes(t))body=field(t==='hottext'?'Segmen teks (satu segmen setiap baris)':'Pilihan jawapan','options',lines(q.options),'Setiap baris menjadi satu pilihan / segmen.')+field('Nombor semua jawapan betul','set',(key||[]).map(i=>i+1).join(', '),'Contoh: 1, 3. Semua pilihan mesti tepat untuk mendapat markah.',1);
 if(t==='poll')body=field('Pilihan undian','options',lines(q.options),'Undian tidak menambah mata atau denominator pengetahuan.');
 if(t==='reorder')body=field('Item dalam susunan yang BETUL','ordered',lines(q.options),'Sistem merawakkan item sebelum tayangan. Peserta boleh seret atau guna ↑ ↓.');
 if(t==='fill')body=field('Ruang dan jawapan diterima','blanks',c.prompts.map((s,i)=>`${s} :: ${(key[i]||[]).join(' | ')}`).join('\n'),'Satu ruang setiap baris. Contoh: Nama bijirin :: beras | nasi. Huruf besar/kecil dan ruang berlebihan diabaikan; bukan padanan kabur.');
 if(['match','drag','dropdown','category','label','grid'].includes(t)){
  body+=field(t==='category'?'Nama kategori':'Bank pilihan jawapan','options',lines(q.options),'Satu pilihan setiap baris.');
  body+=field(t==='label'?'Label nombor pada gambar dan jawapan':'Item dan nombor jawapan betul','mapping',c.prompts.map((p,i)=>`${p} :: ${Array.isArray(key[i])?key[i].map(x=>x+1).join(','):key[i]+1}`).join('\n'),'Contoh: Item pertama :: 2. Untuk jadual boleh pilih banyak: Item :: 1,3.');
  if(t==='label')body+=field('Koordinat setiap penanda: x,y (%)','points',c.points.map(p=>p.join(',')).join('\n'),'Urutan sama dengan item. 0,0 ialah penjuru kiri atas; 100,100 penjuru kanan bawah. Penanda tidak mendedahkan label betul.');
 }
 if(t==='hotspot')body=field('Kawasan betul: x,y,lebar,tinggi (%)','rectangles',(key||[]).map(p=>p.join(',')).join('\n'),'Contoh 20,20,30,30. Lebih daripada satu kawasan boleh diterima, tetapi peserta memilih satu titik.');
 if(t==='math')body=field('Jawapan nombor atau pecahan','number',key,'Contoh: 0.5 atau 1/2. Bukan enjin algebra simbolik.',1)+field('Toleransi mutlak','tolerance',c.tolerance,'Contoh 0.001. Gunakan titik perpuluhan.',1);
 if(t==='graph')body=field('Titik betul: x,y','graphPoints',(key||[]).map(p=>p.join(',')).join('\n'),'Satu titik integer setiap baris. Klik graf untuk tambah/buang titik. Bukan plot persamaan atau lengkung.')+`<label>Skala graf<select data-af="scale"><option ${c.scale===10?'selected':''}>10</option><option ${c.scale===20?'selected':''}>20</option></select></label>`;
 if(kind(q)==='manual')body+=field('Rubrik semakan pegawai (tidak ditunjuk sebelum semakan)','rubric',q.rubric,'Jawapan tidak diberi markah automatik. Pemenang ditangguhkan sehingga selesai semakan.');
 if(['cloud','discussion'].includes(t))body+='<p class="activity-note">Respons teks hanya dilihat pegawai sehingga diluluskan untuk TV. Jangan minta maklumat peribadi atau sensitif.</p>';
 if(['audio','video_response'].includes(t))body+='<p class="activity-note">Peserta boleh merakam melalui kamera/mikrofon telefon atau memilih fail. Fail disimpan dalam bucket PERIBADI (maksimum 10 MB). Mod demo tidak memuat naik rakaman.</p>';
 if(['passage','multipart','video'].includes(t)){
  body+=field(t==='passage'?'Petikan':'Konteks / arahan','context',c.context,'Maksimum 8000 aksara.',5);
  if(t==='video')body+=field('URL video HTTPS terus (MP4 / WebM)','media',c.media,'Bukan pautan halaman YouTube. Pastikan hak penggunaan, akses video dan tempoh menjawab mencukupi.',2);
  body+=field('Bahagian soalan','parts',c.parts.map((p,i)=>`${p.at||0} :: ${p.text} :: ${p.options.join(' | ')} :: ${(key?.[i]??0)+1}`).join('\n'),'Satu bahagian setiap baris: saat :: soalan :: pilihan A | pilihan B :: nombor betul. 2 hingga 5 bahagian; semua mesti tepat untuk markah. Hentian video mesti menaik.');
 }
 if(t==='slide')body=field('Isi slaid','context',c.context,'Slaid penerangan tidak dikira sebagai soalan pengetahuan.',7);
 return `<div class="activity-editor"><div class="activity-type-note"><span>${e(TYPES[t]?.[0]||t)}</span><small>${kind(q)==='manual'?'✍ Semakan pegawai':kind(q)==='none'?'◉ Tanpa markah':'⚡ Markah automatik, padanan tepat'}</small></div>${body}</div>`;
}
const splitLines=s=>s.split(/\r?\n/).filter(v=>v.trim()).map(v=>v.trim());
const nums=s=>s.split(',').map(v=>Number(v.trim())-1);
export function applyActivityField(q,name,value){
 q.config||={};const c=q.config;
 if(name==='options')q.options=splitLines(value);
 if(name==='ordered'){q.options=splitLines(value);q.key=q.options.map((_,i)=>i);}
 if(name==='set')q.key=nums(value);
 if(name==='blanks'){const rows=splitLines(value).map(s=>s.split('::'));c.prompts=rows.map(a=>a[0].trim());q.key=rows.map(a=>(a[1]||'').split('|').map(s=>s.trim()).filter(Boolean));}
 if(name==='mapping'){const rows=splitLines(value).map(s=>s.split('::'));c.prompts=rows.map(a=>a[0].trim());q.key=rows.map(a=>q.type==='grid'?nums(a[1]||''):Number((a[1]||'').trim())-1);}
 if(['points','rectangles','graphPoints'].includes(name)){const rows=splitLines(value).map(s=>s.split(',').map(Number));if(name==='points')c.points=rows;else q.key=rows;}
 if(name==='number')q.key=value.trim();
 if(['tolerance','scale'].includes(name))c[name]=Number(value);
 if(['context','media'].includes(name))c[name]=value;
 if(name==='rubric')q.rubric=value;
 if(name==='parts'){const rows=splitLines(value).map(s=>s.split('::').map(s=>s.trim()));c.parts=rows.map(a=>({at:Number(a[0]),text:a[1]||'',options:(a[2]||'').split('|').map(s=>s.trim())}));q.key=rows.map(a=>Number(a[3])-1);}
}
const svgLines=strokes=>(strokes||[]).map(s=>`<polyline points="${s.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#4f46e5" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
export function drawPreview(strokes){return `<svg class="drawing-preview" viewBox="0 0 100 100" aria-label="Lukisan peserta">${svgLines(strokes)}</svg>`;}
const svgGraph=(q,r,interactive)=>{const n=q.config.scale,span=n*2,grid=Array.from({length:span+1},(_,i)=>{const p=i/span*100;return `<path d="M${p} 0V100M0 ${p}H100"/>`;}).join('');return `<div class="plot"><svg viewBox="0 0 100 100" ${interactive?'data-na="plot" tabindex="0" role="img" aria-label="Graf: klik titik integer. Gunakan input koordinat untuk papan kekunci."':''}><g fill="none" stroke="#cbd5e1" stroke-width=".2">${grid}</g><path d="M50 0V100M0 50H100" fill="none" stroke="#475569" stroke-width=".6"/>${(r||[]).map(([x,y])=>`<circle cx="${(x+n)/span*100}" cy="${(n-y)/span*100}" r="1.4" fill="#7c3aed"/>`).join('')}</svg><div class="plot-scale">x,y: −${n} hingga ${n} · titik integer sahaja</div></div>`;};
export function approvedMarkup(type,responses){
 if(type!=='cloud')return responses.map(s=>`<span>${e(s)}</span>`).join('');
 const counts=new Map();for(const value of responses){const key=normalText(value),old=counts.get(key);counts.set(key,{text:old?.text||String(value).trim(),count:(old?.count||0)+1});}
 return [...counts.values()].sort((a,b)=>b.count-a.count||a.text.localeCompare(b.text)).map(x=>`<span data-count="${x.count}" style="font-size:${Math.min(2.8,1+x.count*.25)}em">${e(x.text)} <small>×${x.count}</small></span>`).join('');
}
export function activityAnswer(q,{answerable=false,mine=null,reveal=false,distribution={}}={}){
 const t=q.type,c=q.config||{},r=mine?.response??mine?.selected??get(q),live=answerable&&!mine,disabled=live?'':'disabled',val=v=>e(v??''),selected=r??[];let body='';
 const choice=(o,i,multi=false)=>`<button type="button" class="answer ans-${i%4} ${multi?selected.includes?.(i)?'selected':'':r===i?'selected':''}" data-na="${multi?'toggle':'single'}" data-value="${i}" ${disabled}><span class="answer-letter">${i+1}</span><span>${e(o)}</span>${reveal?`<small>${distribution[i]||0} jawapan</small>`:''}</button>`;
 if(['multi','hottext','poll','mcq','tf'].includes(t))body=`<p class="activity-hint">${t==='poll'?'Pilih satu pendapat. Tiada jawapan salah.':['mcq','tf'].includes(t)?'Pilih satu jawapan.':t==='hottext'?'Pilih semua segmen teks yang betul.':'Pilih SEMUA jawapan yang betul.'}</p><div class="answer-grid ${t==='hottext'?'hot-text':''}">${q.options.map((o,i)=>choice(o,i,['multi','hottext'].includes(t))).join('')}</div>`;
 if(['fill','open','cloud','discussion','math'].includes(t)){
  const max=t==='cloud'?80:t==='discussion'?400:1000;
  body=t==='fill'?c.prompts.map((p,i)=>`<label>${e(p)}<input data-na-input="blank" data-index="${i}" maxlength="200" autocomplete="off" value="${val(r?.[i])}" ${disabled}></label>`).join(''):
  `<label>${t==='math'?'Jawapan nombor / pecahan':'Jawapan anda'}<textarea data-na-input="text" maxlength="${max}" rows="${t==='math'?1:4}" ${disabled}>${val(typeof r==='string'?r:'')}</textarea></label>`;
 }
 if(['match','drag','dropdown','label','category','grid'].includes(t)){
  const options=(i)=>`<option value="">Pilih jawapan</option>${q.options.map((o,j)=>`<option value="${j}" ${r?.[i]===j?'selected':''}>${e(o)}</option>`).join('')}`;
  if(t==='label')body+=`<div class="label-image"><img src="${e(safeURL(q.image))}" alt="Gambar untuk dilabel">${c.points.map(([x,y],i)=>`<span class="label-pin" style="left:${x}%;top:${y}%">${i+1}</span>`).join('')}</div>`;
  if(t==='drag')body+=`<div class="drag-bank">${q.options.map((o,i)=>`<button type="button" draggable="${live}" data-na-drag="${i}" class="drag-chip">${e(o)}</button>`).join('')}</div><p class="small muted">Seret ke ruang atau pilih melalui menu. Kedua-duanya diterima.</p>`;
  body+=t==='grid'?`<div class="table-wrap"><table class="match-grid"><thead><tr><th>Item</th>${q.options.map(s=>`<th>${e(s)}</th>`).join('')}</tr></thead><tbody>${c.prompts.map((p,i)=>`<tr><th>${e(p)}</th>${q.options.map((s,j)=>`<td><input type="checkbox" aria-label="${e(p+' / '+s)}" data-na-input="grid" data-index="${i}" data-value="${j}" ${r?.[i]?.includes(j)?'checked':''} ${disabled}></td>`).join('')}</tr>`).join('')}</tbody></table></div>`:
  `<div class="mapping-rows">${c.prompts.map((p,i)=>`<label class="mapping-row" data-na-drop="${i}"><span>${t==='label'?`${i+1}. `:''}${e(p)}</span><select data-na-input="mapping" data-index="${i}" ${disabled}>${options(i)}</select></label>`).join('')}</div>`;
 }
 if(t==='reorder')body=`<p class="activity-hint">Susun turutan. Seret kad atau tekan ↑ ↓.</p><div class="order-list">${(r||q.options.map((_,i)=>i)).map((v,i)=>`<div class="order-item" draggable="${live}" data-na-order="${i}"><b>${i+1}</b><span>${e(q.options[v])}</span><button type="button" data-na="up" data-value="${i}" aria-label="Naik" ${disabled}>↑</button><button type="button" data-na="down" data-value="${i}" aria-label="Turun" ${disabled}>↓</button></div>`).join('')}</div>`;
 if(t==='hotspot')body=`<p class="activity-hint">Klik satu titik pada kawasan jawapan.</p><div class="hotspot-image" data-na="hotspot" tabindex="0"><img src="${e(safeURL(q.image))}" alt="Klik kawasan jawapan">${Array.isArray(r)?`<span class="hotspot-pin" style="left:${r[0]}%;top:${r[1]}%">✚</span>`:''}</div><div class="two-fields"><label>X (%)<input data-na-coordinate="0" type="number" min="0" max="100" value="${val(r?.[0])}" ${disabled}></label><label>Y (%)<input data-na-coordinate="1" type="number" min="0" max="100" value="${val(r?.[1])}" ${disabled}></label></div>`;
 if(t==='graph')body=svgGraph(q,r,live)+`<div class="two-fields"><label>X<input id="plot-x" type="number" min="-${c.scale}" max="${c.scale}" value="0" ${disabled}></label><label>Y<input id="plot-y" type="number" min="-${c.scale}" max="${c.scale}" value="0" ${disabled}></label></div><button type="button" class="btn ghost" data-na="add-point" ${disabled}>Tambah / buang titik</button><p>${e(JSON.stringify(r||[]))}</p>`;
 if(t==='draw')body=`<p class="activity-hint">Lukis dengan jari, tetikus atau stylus. Hantar untuk semakan pegawai.</p><svg class="drawing-board" viewBox="0 0 100 100" data-na-draw="${live?'yes':'no'}" aria-label="Ruang lukisan">${svgLines(r||[])}</svg><button class="btn ghost" type="button" data-na="clear" ${disabled}>Padam lukisan</button>`;
 if(['audio','video_response'].includes(t))body=`<p class="activity-note">Rakaman memerlukan izin mikrofon/kamera. Jangan rakam orang lain tanpa izin. Maksimum fail 10 MB; semakan pegawai, bukan transkripsi automatik.</p><label>${t==='audio'?'Rakam / pilih audio':'Rakam / pilih video'}<input type="file" data-na-file="${t}" accept="${t==='audio'?'audio/*':'video/*'}" capture="${t==='audio'?'user':'environment'}" ${disabled||uploading?'disabled':''}></label><p class="small">${uploading?'Sedang memuat naik…':r?.path?'✓ Fail dimuat naik. Tekan Hantar jawapan.':'Sesetengah browser desktop membuka pemilih fail, bukan perakam.'}</p>`;
 if(['passage','multipart','video'].includes(t)){
  body=c.context?`<article class="reading-context">${e(c.context)}</article>`:'';
  if(t==='video')body+=`<video class="activity-video" controls playsinline preload="metadata" data-na-video="yes" src="${e(safeURL(c.media))}"></video><p class="small muted">Video berhenti pada masa soalan. Pilih jawapan dan sambung video. Semua bahagian dihantar bersama.</p>`;
  body+=c.parts.map((p,i)=>`<fieldset class="part-question" ${t==='video'?'data-checkpoint="'+p.at+'" hidden':''}><legend>${i+1}. ${e(p.text)}</legend>${p.options.map((o,j)=>`<label class="check"><input type="radio" name="part-${e(q.id)}-${i}" data-na-input="part" data-index="${i}" value="${j}" ${r?.[i]===j?'checked':''} ${disabled}> ${e(o)}</label>`).join('')}</fieldset>`).join('');
 }
 if(t==='slide')body=`<article class="reading-context slide-content">${e(c.context||'')}</article><p class="muted">${mine?'✓ Slaid sudah dibaca':'Baca penerangan, kemudian tekan Sudah baca.'}</p>`;
 const correct=reveal&&kind(q)==='auto'?`<div class="activity-solution"><strong>Jawapan / skema</strong><p>${e(solutionText(q))}</p>${t==='graph'?svgGraph(q,q.key,false):''}</div>`:'';
 const moderation=reveal&&['cloud','discussion'].includes(t)?`<div class="approved-responses ${t==='cloud'?'word-cloud':''}">${approvedMarkup(t,distribution.approved||[])||'<small>Respons yang diluluskan pegawai akan muncul di sini.</small>'}</div>`:'';
 return `<div class="activity-answer" data-kind="${e(t)}" data-q="${e(q.id)}" data-live="${live}">${body}${live?`<button type="button" class="btn primary wide activity-submit" data-action="activity-submit">${t==='slide'?'Sudah baca ✓':'Hantar jawapan →'}</button>`:mine?'<p class="saved-answer">✓ Respons disimpan</p>':'<p class="muted">Jawab pada telefon peserta.</p>'}${correct}${moderation}<p class="activity-feedback" role="status"></p></div>`;
}
export function solutionText(q){
 if(['mcq','tf'].includes(q.type))return q.options[q.correct]||'';
 if(['multi','hottext','reorder'].includes(q.type))return (q.key||[]).map(i=>q.options[i]).join(q.type==='reorder'?' → ':', ');
 if(q.type==='fill')return q.config.prompts.map((p,i)=>p+': '+q.key[i].join(' / ')).join('; ');
 if(['match','drag','dropdown','category','label','grid'].includes(q.type))return q.config.prompts.map((p,i)=>p+': '+(Array.isArray(q.key[i])?q.key[i].map(j=>q.options[j]).join(', '):q.options[q.key[i]])).join('; ');
 if(['passage','multipart','video'].includes(q.type))return q.key.map((v,i)=>(i+1)+': '+q.config.parts[i].options[v]).join('; ');
 if(q.type==='hotspot')return q.key.map(([x,y,w,h])=>`Kawasan x=${x}%, y=${y}%, lebar=${w}%, tinggi=${h}%`).join('; ');
 return typeof q.key==='string'?q.key:JSON.stringify(q.key||'');
}
let currentQuestion=null;
export function activateActivity(q){currentQuestion=q;}
function set(value,draw=true){if(!currentQuestion)return;drafts.set(currentQuestion.id,value);if(draw)rerender();}
const root=el=>el.closest('.activity-answer[data-live="true"]');
function feedback(text){const el=document.querySelector('.activity-feedback');if(el)el.textContent=text;}
function point(ev,el){const r=el.getBoundingClientRect();return [Math.max(0,Math.min(100,(ev.clientX-r.left)/r.width*100)),Math.max(0,Math.min(100,(ev.clientY-r.top)/r.height*100))].map(v=>Math.round(v*100)/100);}
export function installActivityEvents(){
 document.addEventListener('click',ev=>{const b=ev.target.closest('[data-na]');if(!b||!root(b)||b.disabled||!currentQuestion)return;const q=currentQuestion,a=get(q);const v=Number(b.dataset.value),name=b.dataset.na;
  if(name==='single')set(v);
  if(name==='toggle')set((Array.isArray(a)?a:[]).includes(v)?a.filter(x=>x!==v):[...(a||[]),v]);
  if(['up','down'].includes(name)){const list=[...(a||q.options.map((_,i)=>i))],to=v+(name==='up'?-1:1);if(to>=0&&to<list.length){[list[v],list[to]]=[list[to],list[v]];set(list);}}
  if(name==='clear')set([]);
  if(name==='hotspot')set(point(ev,b));
  if(name==='plot'||name==='add-point'){let p;if(name==='plot'){const [x,y]=point(ev,b);p=[Math.round((x/100*2-1)*q.config.scale),Math.round((1-y/100*2)*q.config.scale)];}else p=[Number(document.querySelector('#plot-x').value),Number(document.querySelector('#plot-y').value)];const arr=Array.isArray(a)?a:[],id=JSON.stringify(p);if(p.every(n=>Number.isInteger(n)&&Math.abs(n)<=q.config.scale))set(arr.some(x=>JSON.stringify(x)===id)?arr.filter(x=>JSON.stringify(x)!==id):arr.length<20?[...arr,p]:arr);}
 });
 document.addEventListener('input',ev=>{const x=ev.target;if(!root(x)||!currentQuestion)return;const q=currentQuestion,a=get(q);const name=x.dataset.naInput,i=Number(x.dataset.index);
  if(name==='text')set(x.value,false);
  if(name==='blank'){const v=Array.isArray(a)?[...a]:q.config.prompts.map(()=> '');v[i]=x.value;set(v,false);}
  if(['mapping','part'].includes(name)){const v=Array.isArray(a)?[...a]:(name==='part'?q.config.parts:q.config.prompts).map(()=>null);v[i]=x.value===''?null:Number(x.value);set(v,false);}
  if(name==='grid'){const v=Array.isArray(a)?a.map(r=>[...r]):q.config.prompts.map(()=>[]),j=Number(x.dataset.value);v[i]=x.checked?[...new Set([...v[i],j])]:v[i].filter(n=>n!==j);set(v,false);}
  if(x.dataset.naCoordinate!==undefined){const p=Array.isArray(a)?[...a]:[null,null];p[Number(x.dataset.naCoordinate)]=x.value===''?null:Number(x.value);set(p,false);}
 });
 document.addEventListener('dragstart',ev=>{const b=ev.target.closest('[data-na-drag],[data-na-order]');if(!b||!root(b))return;dragValue={type:b.hasAttribute('data-na-order')?'order':'bank',value:Number(b.dataset.naOrder??b.dataset.naDrag)};ev.dataTransfer.setData('text/plain',String(dragValue.value));});
 document.addEventListener('dragover',ev=>{if(root(ev.target)&&ev.target.closest('[data-na-drop],[data-na-order]'))ev.preventDefault();});
 document.addEventListener('drop',ev=>{const b=ev.target.closest('[data-na-drop],[data-na-order]');if(!b||!root(b)||!dragValue)return;ev.preventDefault();const q=currentQuestion,a=get(q);if(dragValue.type==='bank'&&b.dataset.naDrop!==undefined){const v=a||q.config.prompts.map(()=>null);v[Number(b.dataset.naDrop)]=dragValue.value;set([...v]);}if(dragValue.type==='order'&&b.dataset.naOrder!==undefined){const v=[...(a||q.options.map((_,i)=>i))],[item]=v.splice(dragValue.value,1);v.splice(Number(b.dataset.naOrder),0,item);set(v);}dragValue=null;});
 document.addEventListener('dragend',()=>dragValue=null);
 let stroke=null,board=null;
 document.addEventListener('pointerdown',ev=>{const el=ev.target.closest('[data-na-draw="yes"]');if(!el||!root(el))return;ev.preventDefault();if((get(currentQuestion)||[]).length>=100)return feedback('Maksimum 100 sapuan.');board=el;stroke=[point(ev,el)];el.setPointerCapture(ev.pointerId);});
 document.addEventListener('pointermove',ev=>{if(!stroke||!board)return;ev.preventDefault();if(stroke.length<500)stroke.push(point(ev,board));board.innerHTML=svgLines([...(get(currentQuestion)||[]),stroke]);});
 const end=()=>{if(stroke&&stroke.length>=2)set([...(get(currentQuestion)||[]),stroke],false);stroke=null;board=null;};document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
 document.addEventListener('change',async ev=>{const x=ev.target;if(!x.dataset.naFile||!root(x)||!x.files?.[0]||!currentQuestion)return;const questionID=currentQuestion.id;let message='';try{uploading=true;x.disabled=true;feedback('Memuat naik rakaman…');const out=await uploader(x.files[0],questionID);drafts.set(questionID,out);message='Fail dimuat naik. Tekan Hantar jawapan.';}catch(err){message=err.message;}finally{uploading=false;if(currentQuestion?.id===questionID){rerender();feedback(message);}else if(x.isConnected)x.disabled=false;}});
 document.addEventListener('timeupdate',ev=>{const video=ev.target;if(video.tagName!=='VIDEO'||!video.dataset.naVideo)return;const boxes=video.parentElement.querySelectorAll('[data-checkpoint]');for(const box of boxes){if(Number(box.dataset.checkpoint)<=video.currentTime&&box.hidden){box.hidden=false;if(!box.querySelector('input:checked')){video.pause();break;}}}},true);
}
