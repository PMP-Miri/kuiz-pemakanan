// Tetapan awam sahaja. JANGAN letak service_role / secret key di sini.
export const CONFIG = Object.freeze({
  mode: 'demo', // 'demo' untuk satu browser; 'live' untuk telefon/peranti berbeza
  supabaseUrl: '',
  supabasePublishableKey: '', // publishable key atau legacy anon key
  turnstileSiteKey: '', // wajib diisi jika CAPTCHA Turnstile diaktifkan dalam Supabase
  brand: 'NutriArena',
  organisation: 'Pameran Pendidikan Pemakanan',
  pollMs: 2500,
});
