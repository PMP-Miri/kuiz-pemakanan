// TV-only renderer. Receives the same public, sanitised question as participants.
// No inputs, answer submission, author rubrics or individual participant responses.
import {escapeHTML as e,safeURL} from './core.js?v=pop3';
import {TYPES,kind} from './activities.js?v=pop3';
import {solutionText,approvedMarkup} from './activity-ui.js?v=pop3';
const icons={multi:'✓',fill:'✎',open:'✎',match:'↔',hottext:'Aa',reorder:'↕',category:'▦',drag:'↗',dropdown:'▾',grid:'▦',label:'⌖',hotspot:'⌖',math:'½',graph:'⊞',audio:'♫',video_response:'▶',draw:'✎',poll:'☑',cloud:'☁',discussion:'✦',passage:'▤',multipart:'▤',video:'▶',slide:'✦'};
const instructions={multi:'Pilih semua jawapan yang betul pada telefon.',fill:'Lengkapkan ruang jawapan pada telefon.',open:'Tulis jawapan menggunakan perkataan sendiri.',match:'Padankan setiap item dengan jawapan pada telefon.',hottext:'Pilih semua segmen teks yang betul.',reorder:'Susun kad mengikut turutan yang betul pada telefon.',category:'Pilih kategori bagi setiap item pada telefon.',drag:'Seret kad atau pilih jawapan pada telefon.',dropdown:'Pilih jawapan untuk setiap ruang pada telefon.',grid:'Tandakan padanan dalam jadual pada telefon.',label:'Kenal pasti label bernombor pada gambar.',hotspot:'Sentuh kawasan jawapan pada gambar di telefon.',math:'Masukkan nombor atau pecahan pada telefon.',graph:'Plot titik pada graf menggunakan telefon.',audio:'Rakam atau pilih audio menggunakan telefon.',video_response:'Rakam atau pilih video menggunakan telefon.',draw:'Lukis jawapan pada ruang lukisan di telefon.',poll:'Pilih pendapat anda. Tiada jawapan salah.',cloud:'Kongsi satu idea ringkas pada telefon.',discussion:'Kongsi idea anda pada telefon.',passage:'Baca petikan dan jawab setiap bahagian pada telefon.',multipart:'Jawab semua bahagian pada telefon.',video:'Tonton video dan jawab pada hentian soalan di telefon.',slide:'Baca bersama. Tekan Sudah baca pada telefon.'};
const card=(text,i)=>`<div class="stage-choice"><i aria-hidden="true">${i<26?String.fromCharCode(65+i):i+1}</i><span>${e(text)}</span></div>`;
const options=items=>`<div class="stage-options">${items.map(card).join('')}</div>`;
const slots=(items,blank=true)=>`<div class="stage-slots">${items.map((text,i)=>`<div class="stage-slot"><i aria-hidden="true">${i+1}</i><strong>${e(text)}</strong>${blank?'<span class="stage-blank" aria-label="Ruang jawapan"></span>':''}</div>`).join('')}</div>`;
const action=(icon,title,text)=>`<div class="stage-action"><span aria-hidden="true">${icon}</span><h3>${e(title)}</h3><p>${e(text)}</p></div>`;
export function stageActivityMarkup(q,{reveal=false,distribution={}}={}){
 const t=q.type||'mcq',c=q.config||{},opts=q.options||[],prompts=c.prompts||[];
 let body='';
 if(['mcq','tf','multi','hottext','poll'].includes(t))body=`<div class="stage-options">${opts.map((text,i)=>card(text,i).replace('</div>',`${reveal?`<small class="stage-votes">${Number(distribution[i])||0} jawapan</small>`:''}</div>`)).join('')}</div>`;
 else if(t==='fill')body=slots(prompts);
 else if(['match','drag','dropdown','category','grid'].includes(t))body=`<div class="stage-columns"><div><h3>${t==='category'?'Item untuk dikelaskan':'Item soalan'}</h3>${slots(prompts,false)}</div><div><h3>${t==='category'?'Kategori pilihan':'Pilihan jawapan'}</h3>${options(opts)}</div></div>`;
 else if(t==='reorder')body=slots(opts,false); // server has already mixed the question; never use q.key here.
 else if(['label','hotspot'].includes(t)){
  const image=safeURL(q.image);
  const pins=t==='label'?(c.points||[]).map(([x,y],i)=>`<span class="label-pin" style="left:${Number(x)}%;top:${Number(y)}%">${i+1}</span>`).join(''):'';
  // Keep the image's natural aspect ratio so marker percentages stay accurate.
  body=`<div class="stage-visual"><div class="label-image">${image?`<img src="${e(image)}" alt="Gambar soalan" referrerpolicy="no-referrer">${pins}`:'<p class="stage-media-note">Gambar tidak tersedia.</p>'}</div><div>${t==='label'?options(opts):action('⌖','Cari kawasan yang betul','Pilih satu titik pada gambar di telefon masing-masing.')}</div></div>`;
 }
 else if(['passage','multipart'].includes(t))body=(c.context?`<article class="reading-context">${e(c.context)}</article>`:'')+(c.parts||[]).map((p,i)=>`<section class="stage-part"><h3>${i+1}. ${e(p.text)}</h3>${options(p.options||[])}</section>`).join('');
 else if(t==='video')body=action('▶','Video interaktif pada telefon','Mainkan video dan jawab pada setiap hentian. Video tidak dimainkan serentak pada TV.')+(c.context?`<article class="reading-context">${e(c.context)}</article>`:'');
 else if(t==='slide')body=`<article class="reading-context slide-content">${e(c.context||'')}</article>`;
 else if(t==='math')body=slots(['Jawapan nombor / pecahan']);
 else if(t==='graph'){const n=Number(c.scale)||10;const grid=Array.from({length:n*2+1},(_,i)=>`<path d="M${20+i*360/(n*2)} 20V380M20 ${20+i*360/(n*2)}H380"/>`).join('');body=`<div class="stage-visual"><svg class="stage-graph" viewBox="0 0 400 400" role="img" aria-label="Graf kosong dengan skala ${n}"><rect width="400" height="400" rx="22" fill="white"/><g stroke="#ddd3ee" stroke-width="1" fill="none">${grid}</g><path d="M20 200H380M200 20V380" stroke="#674a91" stroke-width="3"/><g fill="#58426f" font-family="sans-serif" font-size="15"><text x="370" y="193">x</text><text x="210" y="30">y</text><text x="206" y="218">0</text><text x="355" y="218">${n}</text><text x="24" y="218">−${n}</text><text x="208" y="48">${n}</text><text x="208" y="375">−${n}</text></g></svg>${action('⊞','Cari koordinat yang tepat',`Plot titik integer pada graf di telefon. Skala paksi: ${n}.`)}</div>`;}
 else if(t==='open')body=action('✎','Idea anda, jawapan anda','Tulis pada telefon. Pegawai akan menyemak jawapan sebelum keputusan dimuktamadkan.');
 else if(t==='draw')body=action('✎','Masa untuk melukis!','Gunakan jari atau stylus pada telefon. Lukisan hanya dilihat oleh pegawai.');
 else if(t==='audio')body=action('♫','Beri jawapan dengan suara','Gunakan telefon untuk merakam atau memilih fail audio. Rakaman tidak ditayangkan kepada umum.');
 else if(t==='video_response')body=action('▶','Ceritakan melalui video','Gunakan telefon untuk merakam atau memilih fail video. Rakaman hanya untuk semakan pegawai.');
 else if(['cloud','discussion'].includes(t))body=action(t==='cloud'?'☁':'✦',t==='cloud'?'Satu idea, banyak inspirasi':'Jom kongsi idea!',reveal?'Hanya respons yang diluluskan pegawai dipaparkan di sini.':'Hantar melalui telefon. Pegawai menyemak respons sebelum ditayangkan.');
 const correct=reveal&&kind(q)==='auto'?`<div class="activity-solution"><strong>✓ Jawapan / skema</strong><p>${e(solutionText(q))}</p></div>`:'';
 const approved=reveal&&['cloud','discussion'].includes(t)?`<div class="approved-responses ${t==='cloud'?'word-cloud':''}">${approvedMarkup(t,distribution.approved||[])||'<p class="stage-media-note">Menunggu respons yang diluluskan pegawai.</p>'}</div>`:'';
 return `<section class="stage-activity" data-kind="${e(t)}" data-count="${Math.max(opts.length,prompts.length)>6?'many':'few'}" aria-label="${e(TYPES[t]?.[0]||'Aktiviti')}"><p class="stage-instruction"><b aria-hidden="true">${icons[t]||'✦'}</b><span>${e(instructions[t]||'Jawab pada telefon masing-masing.')}</span></p>${body}${correct}${approved}</section>`;
}
