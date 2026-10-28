import {TYPES,validateActivity,activityDefaults} from './activities.js?v=pop3';
export const THEMES = { aurora: 'Aurora Ungu', ocean: 'Ocean Teal', sunset: 'Sunset Coral' };
export const uid = () => crypto.randomUUID();
export const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value) { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } }
export function shuffle(values, rng = Math.random) { const a = [...values]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function validateQuiz(q, ready = true) {
  const errors = [];
  if (!q || typeof q !== 'object' || Array.isArray(q)) return ['Format kuiz tidak sah.'];
  if (typeof q.title !== 'string') return ['Tajuk kuiz mesti teks.'];
  if (!Array.isArray(q.questions)) return ['Senarai soalan mesti array.'];
  if (q.theme && !Object.hasOwn(THEMES,q.theme)) errors.push('Tema tidak sah.');
  if (q.status && !['draft','ready'].includes(q.status)) errors.push('Status kuiz tidak sah.');
  if (q.description !== undefined && (typeof q.description !== 'string' || q.description.length > 1000)) errors.push('Penerangan maksimum 1000 aksara.');
  if (!q.title.trim()) errors.push('Isi tajuk kuiz.');
  if ((q.title || '').length > 120) errors.push('Tajuk maksimum 120 aksara.');
  if (ready && !q.questions?.length) errors.push('Tambah sekurang-kurangnya satu soalan.');
  if ((q.questions || []).length > 50) errors.push('Maksimum 50 soalan setiap kuiz.');
  const ids = new Set();
  (q.questions || []).forEach((x, i) => {
    const n = `Soalan ${i + 1}: `;
    if (!x || typeof x !== 'object' || Array.isArray(x)) { errors.push(n + 'format tidak sah.'); return; }
    if (typeof x.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(x.id) || ids.has(x.id)) errors.push(n + 'ID soalan tidak sah atau berulang.');
    ids.add(x.id);
    for (const [key,max] of [['text',1000],['topic',100],['explanation',2000],['sourceLabel',200],['image',2000],['source',2000]]) {
      if (x[key] !== undefined && (typeof x[key] !== 'string' || x[key].length > max)) errors.push(n + key + ' mesti teks (maksimum ' + max + ' aksara).');
    }
    errors.push(...validateActivity(x,ready).map(s=>n+s));
    if (x.image && !safeURL(x.image)) errors.push(n + 'gambar mesti pautan HTTPS.');
    if (x.source && !safeURL(x.source)) errors.push(n + 'pautan sumber mesti HTTPS.');
    if (ready && (typeof x.text!=='string'||!x.text.trim())) errors.push(n+'teks soalan diperlukan.');
  });
  return errors;
}
export function scoreAnswer(correct, elapsedMs, seconds, speedBonus) {
  if (!correct) return 0;
  const remaining = Math.max(0, Math.min(1, 1 - elapsedMs / (seconds * 1000)));
  return 1000 + (speedBonus ? Math.floor(remaining * 500) : 0);
}
export function rankRows(rows) {
  const sorted = rows.map(r => ({...r})).sort((a,b) => b.points - a.points || b.correct - a.correct || a.ms - b.ms || a.name.localeCompare(b.name));
  let prev = null;
  sorted.forEach((r,i) => { r.rank = prev && r.points === prev.points && r.correct === prev.correct && r.ms === prev.ms ? prev.rank : i + 1; prev = r; });
  return sorted;
}
export function pairedReport(pre, post, total) {
  if (!Number.isFinite(total)||total<=0) return {pairs:[],preMean:null,postMean:null,delta:null,improved:0,same:0,declined:0,unpairedPre:pre.length,unpairedPost:post.length};
  const pm = new Map(pre.map(x => [x.participant_code, x]));
  const pairs = post.filter(x => pm.has(x.participant_code)).map(x => {
    const before = pm.get(x.participant_code);
    return {name:x.name, participant_code:x.participant_code, pre:before.correct / total * 100, post:x.correct / total * 100, delta:(x.correct - before.correct) / total * 100};
  });
  const mean = key => pairs.length ? pairs.reduce((s,p) => s+p[key],0) / pairs.length : null;
  return {pairs, preMean:mean('pre'), postMean:mean('post'), delta:mean('delta'), improved:pairs.filter(p=>p.delta>0).length, same:pairs.filter(p=>p.delta===0).length, declined:pairs.filter(p=>p.delta<0).length, unpairedPre:pre.filter(p=>!post.some(x=>x.participant_code===p.participant_code)).length, unpairedPost:post.filter(p=>!pm.has(p.participant_code)).length};
}
export function csv(rows) { return '\uFEFF' + rows.map(row => row.map(value => { let s=String(value??''); if (/^[\s]*[=+\-@\t\r]/.test(s)) s="'"+s; return '"'+s.replace(/"/g,'""')+'"'; }).join(',')).join('\r\n'); }
export function newQuestion() { return {id:uid(), ...activityDefaults('mcq'),text:'', options:['','','',''],seconds:20,image:'',explanation:'',source:'',sourceLabel:'',topic:'Umum'}; }
export function newQuiz() { return {id:uid(), title:'', description:'', theme:'aurora', status:'draft', questions:[newQuestion()]}; }
export function demoQuiz() {
  const q = newQuiz(); q.title='Jelajah Ilmu: Demo Platform'; q.description='Soalan demonstrasi fungsi sahaja. Gantikan dengan soalan pemakanan yang disemak pegawai.'; q.status='ready';
  q.questions = [
    {text:'Butang manakah digunakan untuk menyertai kuiz?',options:['Sertai Arena','Padam kuiz','Log keluar','Arkib'],correct:0,explanation:'Peserta masuk melalui kod bilik atau pautan daripada pengacara.',topic:'Demo'},
    {text:'Skor pengetahuan perlu dipisahkan daripada bonus kelajuan.',options:['Betul','Salah'],correct:0,explanation:'Dalam platform ini, peratus pengetahuan dikira daripada jawapan betul. Mata permainan boleh mengandungi bonus kelajuan.',topic:'Penilaian',type:'tf'},
    {text:'Apakah yang diperlukan untuk laporan pra/pasca berpasangan?',options:['Nama sama sahaja','Warna avatar sama','Kod peserta yang sama','Telefon model sama'],correct:2,explanation:'Kod peserta memadankan rekod pra dan pasca walaupun nama peserta serupa.',topic:'Penilaian'}
  ].map(x=>({...newQuestion(),...x})); return q;
}

export function activityGallery(imageURL='https://example.org/diagram.svg') {
 const q=newQuiz();q.title='Galeri 26 Jenis Aktiviti';q.description='Templat DEMO fungsi, bukan bahan pendidikan yang disahkan. Sunting sebelum digunakan.';q.status='draft';
 q.questions=Object.keys(TYPES).map(type=>({...newQuestion(),...activityDefaults(type),text:'Demo: '+TYPES[type][0],seconds:['video','audio','video_response','draw','passage','multipart'].includes(type)?180:45,topic:'Demo Aktiviti',...(['label','hotspot'].includes(type)?{image:imageURL}:{})}));
 return q;
}
