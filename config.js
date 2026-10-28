// Tetapan awam sahaja. JANGAN letak service_role / secret key di sini.
export const CONFIG = Object.freeze({
  mode: 'live', // 'demo' untuk satu browser; 'live' untuk telefon/peranti berbeza
  supabaseUrl: 'https://ijarnkbwibpgnrkpkgvy.supabase.co',
  supabasePublishableKey: 'sb_publishable_zS8AapZz4_mZJM8NrHCDBw_zEw_3o1y', // publishable key atau legacy anon key
  turnstileSiteKey: '', // wajib diisi jika CAPTCHA Turnstile diaktifkan dalam Supabase
  brand: 'NutriArena',
  organisation: 'Pameran Pendidikan Pemakanan',
  pollMs: 2500,
});
