import {escapeHTML as e, rankRows} from './core.js?v=pop3';

// Paparan sahaja, bukan endpoint awam. Buka dari laptop pegawai yang sudah log masuk.
// Gunakan senarai medan yang dibenarkan; jangan salin rekod pegawai/peserta mentah ke DOM TV.
export function publicStageState(data) {
  const r=data.room;
  const canRank=!!r.settings.leaderboard && r.phase!=='pre' && ['reveal','finished'].includes(r.status);
  const room={code:r.code,title:r.title,theme:r.theme,phase:r.phase,status:r.status,
    current_index:r.current_index,total:r.total,assessed_total:r.assessed_total??r.total,pending_count:data.pending_count||0,opened_at:r.opened_at,
    settings:{leaderboard:!!r.settings.leaderboard,winners:r.settings.winners}};
  const players=(data.players||[]).map(p=>({name:p.name,...(canRank?{
    answered:p.answered,answered_scored:p.answered_scored,pending:p.pending,correct:p.correct,points:p.points,ms:p.ms}: {})}));
  let question=null;
  if(data.question && ['question','reveal'].includes(r.status)) {
    const q=data.question;
    question={id:q.id,type:q.type||'mcq',config:structuredClone(q.config||{}),text:q.text,options:[...(q.options||[])],image:q.image,topic:q.topic,seconds:q.seconds};
    if(r.status==='reveal'&&r.phase!=='pre')Object.assign(question,{
      key:q.key,correct:q.correct,explanation:q.explanation,source:q.source,sourceLabel:q.sourceLabel});
  }
  return {room,players,question,answered:data.answered,
    distribution:r.status==='reveal'&&r.phase!=='pre'?(data.distribution||{}):{},
    server_now:data.server_now};
}

export function participantHome(code='',nickname='',participantCode='',isDemo=false) {
  return `<section class="play-home">
    <div class="welcome-banner"><span class="eyebrow">ILMU + AKSI + SEDIKIT PERSAINGAN</span>
      <h1>Jom main.<br><span>Jom jadi juara!</span></h1>
      <p>Cabaran pemakanan bermula di sini. Jawab cabaran, kongsi idea dan raikan ilmu baharu.</p>
      <img class="arena-mascots" src="./assets/mascot-pop.svg" alt="Watak brokoli dan buah oren meraikan kuiz" width="640" height="400">
      <div class="play-perks"><span>✦ Jawab & belajar</span><span>★ Naik kedudukan</span><span>♥ Cabar diri sendiri</span></div>
    </div>
    <div class="join-card glass"><div class="join-tag">TIKET ANDA KE ARENA</div><h2>Sedia? Masuk sini.</h2>
      <p class="muted">Gunakan kod bilik pada skrin utama.</p><form data-form="join">
      <label>Kod bilik<input name="code" class="code-input" placeholder="A1B2C3D4" maxlength="8" pattern="[A-Fa-f0-9]{8}" value="${e(code)}" required autocomplete="off" autocapitalize="characters" spellcheck="false"></label>
      <label>Nama panggilan<input name="name" placeholder="Contoh: Hafiz Hebat" maxlength="30" required autocomplete="nickname" value="${e(nickname)}"></label>
      <details class="pre-code" ${participantCode?'open':''}><summary>Ada kod peserta pra-kuiz?</summary><label>Kod peserta (pasca sahaja)<input name="participant" placeholder="12 aksara daripada sesi pra" maxlength="12" value="${e(participantCode)}" autocomplete="off" autocapitalize="characters"></label></details>
      <div id="captcha"></div><button class="btn primary wide" type="submit">Jom masuk arena <span>➜</span></button>
      <p class="small muted">Nama panggilan boleh muncul di TV. Jangan masukkan nombor kad pengenalan atau maklumat kesihatan peribadi.</p></form>
    </div>
  </section>${isDemo?'<div class="notice">MOD DEMO: bilik hanya dikongsi antara tab dalam browser dan profil yang sama. Telefon berasingan memerlukan mod live.</div>':''}`;
}

function confetti(){return `<div class="celebration" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--i:${i};--x:${(i*37)%100}%;--c:${['#ffb82e','#ff6c9b','#30bea5','#8060f5'][i%4]}"></i>`).join('')}</div>`;}

export function screenMarkup(data,{questionMarkup,leaderboard,source,joinLink}) {
  const {room:r,players,question:q}=data;
  const showRank=!!r.settings.leaderboard&&r.phase!=='pre';
  const canRank=showRank&&['reveal','finished'].includes(r.status)&&!(r.status==='finished'&&r.pending_count);
  const ranked=canRank?rankRows(players.filter(p=>(p.answered_scored??p.answered)>0)):[];
  const phase={normal:'ARENA LIVE',pre:'PRA-KUIZ',post:'PASCA-KUIZ'}[r.phase]||'ARENA LIVE';
  const header=`<div class="screen-heading"><div><span class="eyebrow">${phase} · PAPARAN PENONTON</span><h1>${e(r.title)}</h1></div><div class="screen-code">KOD BILIK <b>${e(r.code)}</b><span>${players.length} peserta</span></div></div>`;
  let body='';
  if(r.status==='lobby') {
    body=`<section class="screen-lobby"><div class="screen-invite glass"><span class="join-tag">SEMUA BOLEH JOIN!</span><h2>Telefon dah sedia?<br><span>Imbas. Masuk. Main!</span></h2><div class="big-join-code">${e(r.code)}</div><div class="screen-qr"><canvas id="qr" aria-label="QR untuk sertai kuiz"></canvas><div><strong>Imbas dengan kamera telefon</strong><p id="qr-hint">Atau buka alamat di bawah dan masukkan kod bilik.</p><p class="join-address">${e(joinLink(''))}</p></div></div><div class="waiting-pulse"><i></i> Menunggu pengacara memulakan kuiz</div></div><aside class="screen-players glass"><div class="section-title"><h2>Skuad dah sampai! ✨</h2><span class="pill">${players.length} ORANG</span></div><div class="player-cloud">${players.map((p,i)=>`<span class="player-chip" style="--delay:${Math.min(i,12)*35}ms;--chip:${i%4}"><span class="mini-avatar">${['★','✿','◆','♥'][i%4]}</span>${e(p.name)}</span>`).join('')||'<div class="lobby-empty"><span>👋</span><h3>Jadi yang pertama!</h3><p>Nama anda muncul di sini selepas masuk.</p></div>'}</div><img class="lobby-mascot" src="./assets/mascot-pop.svg" alt="" width="640" height="400"></aside></section>`;
  } else if(['question','reveal'].includes(r.status)&&q) {
    const reveal=r.status==='reveal'&&r.phase!=='pre';
    const pct=players.length?Math.round(data.answered/players.length*100):0;
    body=`<section class="screen-game ${canRank?'has-ranking':''}"><div class="question-stage glass"><div class="question-meta"><span class="question-step">SOALAN ${r.current_index+1} / ${r.total}</span><span>${e(q.topic||'Pemakanan')}</span><strong id="timer-value">${r.status==='question'?'…':'DIKUNCI'}</strong></div><div class="timer-track"><span id="timer-bar" style="width:${r.status==='question'?'100':'0'}%"></span></div>${questionMarkup(q,{reveal,distribution:data.distribution,audience:true})}<div class="audience-progress"><span><b>${data.answered}</b> / ${players.length} sudah menjawab</span><div><i style="width:${pct}%"></i></div><span>${pct===100&&players.length?'Semua dah jawab! ✨':'Jawab di telefon masing-masing'}</span></div>${r.status==='reveal'?`<div class="explanation">${reveal?`<strong>💡 Tahukah anda?</strong><p>${e(q.explanation||'Jom dengar penerangan pengacara.')}</p>${source(q)}`:'<strong>Jawapan disimpan!</strong><p>Jawapan pra-kuiz tidak didedahkan. Teruskan dengan cabaran seterusnya.</p>'}</div>`:''}</div>${canRank?`<aside class="glass screen-ranking"><span class="eyebrow">PERSAINGAN MESRA</span><h2>Siapa di depan? 🏆</h2>${leaderboard(ranked,5)}<p class="small muted">${r.pending_count?'Ranking sementara, semakan pegawai belum selesai.':'Kedudukan dikemas kini selepas soalan dikunci.'}</p></aside>`:''}</section>`;
  } else if(r.status==='finished') {
    const winners=ranked.filter(p=>p.rank<=r.settings.winners);
    body=`${confetti()}<section class="glass result-hero screen-result"><span class="join-tag">${r.pending_count?'MENUNGGU SEMAKAN PEGAWAI':showRank?'MASANYA RAIKAN JUARA!':'CABARAN SELESAI!'}</span><h2>${r.pending_count?'Keputusan belum dimuktamadkan.':showRank?'Hebat usaha. Hebat ilmu.':'Ilmu baharu, pilihan lebih sihat.'}</h2><p>${r.phase==='pre'?'Simpan kod peserta pada telefon untuk sesi pasca-kuiz.':'Terima kasih kepada semua yang menyertai!'}</p>${winners.length?`<div class="podium">${winners.map(p=>`<article class="podium-card place-${p.rank}"><div class="trophy">${p.rank===1?'🏆':p.rank===2?'🥈':p.rank===3?'🥉':'⭐'}</div><span class="eyebrow">TEMPAT ${p.rank}</span><h3>${e(p.name)}</h3><strong>${p.points.toLocaleString()} <small>mata</small></strong><p>${p.correct}/${r.assessed_total??r.total} betul</p></article>`).join('')}</div>`:`<img class="end-mascots" src="./assets/mascot-pop.svg" alt="" width="640" height="400"><p>${r.pending_count?'Pegawai sedang menyemak respons. Podium akan muncul selepas selesai.':showRank?'Belum ada peserta yang menjawab untuk disenaraikan sebagai pemenang.':'Tiada ranking awam untuk sesi ini. Semua usaha diraikan.'}</p>`}${showRank?'<p class="small muted">Keputusan seri sepenuhnya berkongsi tempat. Skor permainan bukan skor pengetahuan pra/pasca.</p>':''}</section>${canRank&&ranked.length?`<section class="glass live-leaderboard"><h2>Papan bintang ⭐</h2>${leaderboard(ranked,10)}</section>`:''}`;
  }
  return `${header}${body}<div class="connection-line"><span id="connection">● Bersambung</span><span>SKRIN PENONTON · kawalan dan prestasi peribadi berada pada peranti pegawai</span></div>`;
}

export function hostDisplayNotice() {
  return `<section class="host-display-notice" aria-label="Panduan paparan"><span class="display-icon" aria-hidden="true">▣</span><div><strong>Ini panel pegawai. Tayangkan tetingkap TV, bukan panel ini.</strong><p>Tekan <b>Buka TV ↗</b> di atas, kemudian pindahkan tetingkap itu ke TV dalam mod <b>Extend</b>. Prestasi individu kekal di sini.</p></div><button class="btn ghost small-btn" data-action="display-help">Panduan tayangan</button></section>`;
}

export function projectionGuide() {
  return `<ol class="display-steps"><li>Sambungkan laptop kepada TV atau projektor.</li><li>Pilih <b>Extend / Paparan dilanjutkan</b>, bukan Duplicate / Mirror.</li><li>Tekan <b>Buka TV ↗</b> pada panel sesi. Tetingkap penonton berasingan akan dibuka.</li><li>Seret tetingkap itu ke TV. Tekan butang <b>⛶</b> dalam tetingkap TV untuk skrin penuh.</li><li>Kekalkan panel pegawai di laptop. Soalan pada TV berubah apabila pegawai memulakan, mengunci atau meneruskan soalan.</li></ol><p><b>Windows:</b> tekan Windows + P dan pilih Extend.<br><b>Mac:</b> System Settings → Displays → pilih TV → Use as → Extended display.</p><div class="notice">Jika TV hanya menyokong Mirror, semua kandungan laptop akan disalin. Pilihan lain: buka panel pegawai pada telefon anda, log masuk dengan akaun pegawai, dan gunakan laptop yang disambung TV untuk paparan penonton sahaja. Mod ini memerlukan sambungan live.</div><p class="small muted">Pautan TV bukan pautan peserta. Ia menggunakan sesi log masuk pegawai pada laptop yang sama. Tiada jawapan individu, kod peserta atau laporan dipaparkan pada TV.</p>`;
}
