# NutriArena Live Quiz Studio

Platform kuiz berbahasa Melayu untuk booth dan program pendidikan. Frontend statik sesuai untuk GitHub Pages, tanpa bundler. Mod live menggunakan Supabase. Ini versi asas berfungsi yang perlu menjalani ujian penerimaan dengan peranti sebenar sebelum acara.

**Mulakan dengan `MULA-DI-SINI.md` untuk langkah ringkas GitHub, ranking dan pra/pasca.** Keputusan semakan yang benar-benar dijalankan direkodkan dalam `VERIFICATION.md`.

## Yang disediakan

- Studio pegawai dengan akaun tersendiri, kuiz milik sendiri, draf dan penerbitan.
- Editor aneka pilihan 4 jawapan dan Betul/Salah, pilihan jawapan betul, gambar HTTPS atau muat naik JPEG/PNG/WebP (5 MB), masa, topik, penerangan dan pautan sumber.
- Pratonton seiring menaip, seret susunan soalan dan butang naik/turun, pendua, bank soalan daripada kuiz milik sendiri, import/eksport JSON.
- Tiga tema: Aurora Ungu, Ocean Teal dan Sunset Coral.
- Lobi dengan nama peserta, kod dan QR; skrin pengacara; skrin jawapan telefon.
- Pergerakan serentak dikawal pengacara. Satu jawapan setiap peserta bagi setiap soalan. Masa dan skor dikira pelayan dalam mod live.
- Muzik instrumental sintesis dalam browser, kawalan hidup/mati dan skrin penuh. Klik muzik untuk mengaktifkannya. Tiada lagu komersial disertakan.
- Ranking awam pilihan, bilangan tempat pemenang 1 hingga 10, podium dan pengendalian seri.
- Monitor pegawai menunjukkan nama, jumlah dijawab, betul, ketepatan semasa dan status menjawab soalan terkini.
- Paparan pentas menyembunyikan monitor peribadi. Laporan terperinci tidak dimaksudkan untuk projektor awam.
- Pra/pasca dengan kod peserta 12 aksara, salinan soalan yang sama, susunan soalan/pilihan boleh rawak. Pra tidak mendedahkan jawapan, penerangan, ranking awam atau bonus kelajuan.
- Laporan individu, analisis setiap soalan, laporan pasangan lengkap, pengiktirafan Lonjakan Ilmu, CSV UTF-8 dengan BOM dan perlindungan asas formula CSV, serta cetak ke PDF melalui browser.
- Sesi menyimpan snapshot. Edit kuiz asal tidak mengubah sesi aktif. Pasca menyalin snapshot pra, bukan kandungan kuiz yang mungkin sudah berubah.
- Realtime metadata bilik, dengan semakan semula automatik setiap 2.5 saat sebagai sandaran. Ini bukan jaminan masa sebenar tanpa kelewatan.

## Susunan fail

```text
index.html
config.js
assets/style.css
src/app.js       # paparan dan aliran
src/core.js      # validasi, skor, ranking, pasangan dan CSV
src/demo.js      # data browser sahaja
src/api.js       # penyambung Supabase
src/audio.js     # muzik sintesis
supabase/schema.sql
supabase/acceptance-tests.md
tests/check.mjs
tests/scenarios.js
tests/browser.html  # ujian tanpa Node, buka melalui pelayan HTTP/Pages
MULA-DI-SINI.md
VERIFICATION.md
package.json
.nojekyll
```

## 1. Cuba demo dahulu

`config.js` datang dengan `mode: 'demo'`. Demo tidak memerlukan Supabase.

1. Ekstrak kandungan folder ini sebagai akar repositori GitHub.
2. Di repositori: Settings > Pages. Pilih kaedah penerbitan daripada branch, kemudian branch utama dan folder root. Nama menu mungkin berbeza mengikut versi GitHub.
3. Buka alamat Pages yang GitHub berikan. Jangan buka `index.html` terus melalui `file://` kerana modul JavaScript perlu dilayan melalui HTTP/HTTPS.
4. Klik **Studio Pegawai**. Mod demo tidak meminta log masuk dan ada kuiz demonstrasi platform, bukan fakta pemakanan yang disahkan.
5. Sunting atau cipta kuiz, terbitkan, kemudian buka sesi.
6. Pada lobi, klik **Uji peserta** untuk membuka tab berasingan dalam browser/profil yang SAMA. Jawab menggunakan tab itu dan kawal soalan pada tab pengacara.

Demo bukan multiplayer telefon. Semua data demo dalam localStorage browser berkenaan. Identiti peserta demo dalam sessionStorage setiap tab; buka tab melalui butang Uji peserta (noopener), bukan Duplicate Tab yang boleh menyalin sessionStorage. Menutup tab peserta membuang identiti demo itu. Membuka banyak browser atau telefon tidak akan berkongsi data demo. Jangan gunakan demo untuk merekod peserta acara sebenar.

Untuk pelayan tempatan, jika Python tersedia:

```text
python -m http.server 8000
```

Jalankan dalam folder projek dan buka `http://localhost:8000`. Tiada langkah build.

## 2. Aktifkan live sebenar

### A. Pangkalan data

1. Cipta projek Supabase khusus untuk aplikasi ini. Jangan mulakan dengan projek yang mempunyai data penting tanpa sandaran.
2. Buka SQL Editor dan jalankan `supabase/schema.sql` sekali. Fail menggunakan transaksi, jadual awalan `na_`, RLS dan fungsi RPC. Menjalankannya semula tanpa migrasi akan menemui objek yang telah wujud. Jangan cuba menyelesaikannya dengan memadam pangkalan data produksi.
3. Dalam Authentication > Users, cipta akaun pegawai menggunakan e-mel dan kata laluan yang kuat. Sahkan e-mel mengikut kaedah pentadbir projek. Salin UUID akaun.
4. Jalankan SQL berasingan untuk setiap pegawai:

```sql
insert into public.na_hosts(user_id)
values ('GANTI-DENGAN-UUID-AKAUN-PEGAWAI');
```

5. Aktifkan **Anonymous Sign-ins** untuk peserta. Jangan menganggap akaun anonymous ialah akaun pegawai. Hanya UUID dalam `na_hosts` yang boleh menggunakan fungsi pengurusan.
6. Semak tetapan had permintaan / anonymous sign-ins untuk jumlah peserta booth. Ramai telefon menggunakan WiFi dengan IP awam sama boleh terkena had pengesahan. Jangan hanya menguji satu telefon.
7. Untuk acara terbuka, gunakan CAPTCHA Turnstile yang disokong tetapan Auth Supabase. Isi secret CAPTCHA HANYA pada Supabase, dan site key awam pada config. Pastikan hos GitHub Pages didaftarkan pada Turnstile. Semak semula konfigurasi keselamatan semasa pada dokumentasi rasmi.
8. Skrip menambah `na_rooms` kepada publication `supabase_realtime`. Pastikan publication ini tersedia. Jika Realtime terputus, polling masih mencuba.
9. Skrip juga mencipta bucket awam `nutriarena-media`. Nama fail diasingkan mengikut UUID pegawai. Hanya pegawai boleh muat naik. Gambar yang dimuat naik boleh dilihat sesiapa yang memiliki pautannya.

### B. Konfigurasi frontend

Sunting `config.js`:

```js
export const CONFIG = Object.freeze({
  mode: 'live',
  supabaseUrl: 'https://PROJEK.supabase.co',
  supabasePublishableKey: 'PUBLISHABLE-KEY-ANDA',
  turnstileSiteKey: '',
  brand: 'NutriArena',
  organisation: 'Nama organisasi / program',
  pollMs: 2500,
});
```

Gunakan publishable key atau legacy anon key yang memang untuk frontend. **Jangan sesekali letak service_role key, secret key, kata laluan pangkalan data, kata laluan pegawai atau CAPTCHA secret dalam GitHub.** Public key bukan pengganti kawalan akses. RLS dan pemeriksaan fungsi pelayan mesti dikekalkan.

Muat naik perubahan ke repositori. Apabila Pages selesai diterbitkan, muat semula halaman dan pastikan label **LIVE · berbilang peranti** muncul. Log masuk Studio, cipta kuiz, buka sesi dan uji dengan sekurang-kurangnya dua telefon berasingan.

## 3. Cara pegawai menjalankan pertandingan

1. **Cipta kuiz**. Isi tajuk, soalan, jawapan betul, masa, fakta dan sumber. Semak fakta/saiz hidangan secara manual. Tiada bank fakta gula yang dianggap disahkan secara automatik.
2. **Simpan draf** atau **Terbitkan kuiz**. Draf tidak boleh membuka sesi.
3. **Buka sesi**, pilih Pertandingan, tentukan ranking, bonus kelajuan dan tempat pemenang.
4. Paparkan kod atau QR. Peserta masuk dengan nama panggilan.
5. Hidupkan muzik jika dikehendaki. Klik **Paparan pentas** sebelum memaparkan pada TV awam jika tidak mahu monitor prestasi individu kelihatan.
6. Klik **Mulakan kuiz**. Peserta menjawab pada telefon. Pengacara boleh mengunci awal. Selepas masa tamat, lawatan state seterusnya mengunci soalan walaupun tab pengacara terbiar.
7. Klik **Soalan seterusnya**, dan **Tamat & keputusan** selepas soalan terakhir.
8. Podium dan ranking muncul jika diaktifkan. Pegawai membuka laporan untuk rekod dan eksport.

### Mata dan pemenang

- Betul: 1000 mata. Salah: 0.
- Jika bonus kelajuan hidup, tambah `floor(baki masa / masa asal × 500)`.
- Skor pengetahuan: jumlah betul / semua soalan × 100. Tidak dipengaruhi bonus.
- Seri diputuskan mengikut mata, kemudian bilangan betul, kemudian masa jawapan terkumpul lebih rendah. Jika semuanya sama, tempat dikongsi (contoh 1, 1, 3). Nama hanya menyusun paparan bagi seri, bukan menentukan pemenang.
- Pemilihan N tempat merangkumi semua yang berkongsi tempat pada had tersebut. Contohnya 3 tempat boleh menghasilkan lebih 3 pemenang apabila seri.
- Peserta perlu menjawab sekurang-kurangnya satu soalan untuk tersenarai sebagai pemenang. Minimum ini bukan syarat kelayakan pertandingan formal; pegawai boleh menilai semula laporan.
- Untuk hadiah, umumkan peraturan sebelum mula. Untuk penilaian ilmu yang adil tanpa kesan kelajuan rangkaian, matikan bonus kelajuan.
- Tiada mod soalan individu yang bergerak sendiri, soalan pelbagai jawapan betul, atau tetapan pemenang rawak dalam versi ini.

## 4. Pra dan pasca

1. Buka sesi **Pra-kuiz** dan jalankan sehingga tamat. Jawapan, huraian dan ranking awam tidak didedahkan.
2. Minta setiap peserta simpan **kod peserta 12 aksara** yang dipaparkan pada telefon. Kod ini ialah token padanan. Jangan paparkan kod pada TV, kongsi dengan peserta lain atau jadikannya nombor pengenalan rasmi.
3. Jalankan aktiviti pendidikan berasingan, contohnya penerangan pegawai atau Pinggan Sihat. Game lain tidak disambungkan secara automatik ke projek ini.
4. Buka sesi baharu **Pasca-kuiz**, pilih sesi pra yang sudah tamat bagi kuiz yang sama.
5. Peserta masukkan kod peserta pra semasa menyertai. Nama diambil daripada rekod pra. Setiap kod hanya boleh didaftarkan sekali dalam sesi pasca.
6. Buka laporan sesi pasca untuk perbandingan. Hanya peserta dengan jawapan bagi SEMUA soalan dalam kedua-dua fasa dimasukkan dalam purata berpasangan. Rekod tidak lengkap/tidak berpasangan disenaraikan berasingan secara bilangan.
7. Perubahan ditunjukkan dalam **mata peratusan**. Contoh 40% ke 80% ialah +40 mata peratusan, bukan +40% relatif.

Pasca menyalin item dan jawapan daripada snapshot pra. Susunan boleh berbeza. Tiada ujian kesetaraan psikometrik; gunakan kandungan dan interpretasi yang sesuai dengan tujuan program. Menggunakan item sama mempunyai kemungkinan kesan ingatan. Kuiz ini bukan alat diagnosis klinikal.

## 5. Keselamatan, privasi dan operasi booth

- Ini bukan sistem identiti atau peperiksaan berisiko tinggi. Nama panggilan boleh sama, kod peserta boleh disalin, dan peserta boleh berkongsi jawapan.
- Ranking awam mendedahkan nama panggilan dan mata jika diaktifkan. Maklumkan peserta terlebih dahulu. Elakkan nama penuh kanak-kanak pada skrin awam.
- Dashboard/CSV mengandungi rekod individu. Hadkan akses, buat sandaran, tentukan tempoh penyimpanan dan padam rekod selepas tidak lagi diperlukan. Tiada auto-retention dalam v1.
- Tindakan padam sesi memadam jawapannya dan tidak boleh dibatalkan dari UI. Eksport CSV dahulu. Jika sesi pra dipautkan oleh pasca, padam pasca terlebih dahulu.
- Padam kuiz tidak memadam snapshot sesi lama. Padam kuiz/gambar tidak membersihkan fail media yatim secara automatik. Semak bucket dengan berhati-hati; fail lama mungkin masih dirujuk snapshot sesi.
- Anonymous Auth boleh mengumpul pengguna anonymous lama. Rancang pembersihan mengikut polisi projek dan buat sandaran sebelum memadam. Memadam pengguna Auth yang dirujuk rekod boleh gagal atau memadam identiti mengikut hubungan jadual.
- Kata laluan pegawai disimpan oleh Supabase Auth, bukan dalam kod ini. Token host berada dalam localStorage; jangan gunakan komputer awam tanpa log keluar. Peranti yang terjejas masih berisiko.
- Identiti peserta live disimpan dalam sessionStorage. Muat semula tab boleh sambung semula. Menutup tab/memadam data browser boleh menghilangkan akses kepada identiti anonymous tersebut. Versi ini tidak mempunyai pemulihan akaun peserta. Gunakan kod peserta pra untuk padanan pasca, bukan pemulihan sesi pra.
- Tiada sokongan offline live atau pelayan LAN dalam versi ini. Internet diperlukan untuk Supabase dan library CDN. Sediakan hotspot sandaran.
- Skrin ada kawalan saiz responsif dan reduced-motion. Tiada audio daripada telefon melainkan peserta menghidupkan muzik sendiri; pengacara disarankan memainkan muzik pada TV sahaja.
- Had aplikasi ialah 50 soalan dan 200 penyertaan satu bilik. Ini had validasi, BUKAN keputusan ujian beban atau jaminan kapasiti. Uji bilangan peserta sasaran sebenar.
- Polling 2.5 saat boleh menghasilkan beban pangkalan data apabila ramai peserta. Ukur dahulu sebelum acara besar. Semak kos/kuota pada penyedia, bukan andaikan percuma tanpa had.
- Pemasangan bergantung pada CDN Supabase JS `2.57.4`, QR `1.5.4` dan Turnstile jika digunakan. Versi dipinkan untuk kebolehulangan, bukan dakwaan versi terkini. Tiada service worker/cache offline.
- Semak kadar trafik dan penyalahgunaan sebelum membuka kepada umum. RLS, pengiraan skor pelayan dan token peserta tidak menghalang segala bentuk bot atau penipuan. Tambah rate limit khusus RPC / perlindungan tambahan jika acara berskala besar.

## 6. Semakan dan ujian

Fail `tests/check.mjs` menyediakan ujian core dan simulasi demo menggunakan Node 20+ tanpa dependencies:

```text
node --test tests/check.mjs
```

Atau `npm test` jika Node/npm tersedia. Frontend tidak memerlukan npm untuk dijalankan.

Tanpa Node: buka `tests/browser.html` melalui pelayan HTTP tempatan atau GitHub Pages, kemudian klik **Jalankan semakan**. Ia menggunakan storan tiruan, bukan rekod sebenar dalam localStorage aplikasi. Halaman itu menjalankan senario logik dan kompilasi sintaks sahaja, bukan semakan susun atur atau sambungan live.

Semak `supabase/acceptance-tests.md` sebelum penggunaan live. SQL, Auth, Storage, Realtime, kamera QR dan browser sebenar perlu diuji dalam projek anda. Jangan menganggap ujian logik demo membuktikan keselamatan pangkalan data atau operasi peranti sebenar.

## 7. Pemulihan dan rollback

Sebelum kemas kini: eksport kuiz JSON, CSV sesi, sandaran pangkalan data dan rekod versi konfigurasi tanpa rahsia. Untuk rollback frontend, pulihkan fail versi sebelumnya dalam GitHub. Jangan rollback skema dengan DROP TABLE pada data acara. V1 tidak menyediakan migrasi automatik atau alat pulih sandaran; uji pemulihan menggunakan salinan projek berasingan.

## Rujukan pemasangan

- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- Anonymous Auth: https://supabase.com/docs/guides/auth/auth-anonymous
- RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Functions/security: https://supabase.com/docs/guides/database/functions
- Realtime: https://supabase.com/docs/guides/realtime/postgres-changes
- CAPTCHA: https://supabase.com/docs/guides/auth/auth-captcha

Semak dokumentasi rasmi semasa memasang kerana menu, had dan polisi penyedia boleh berubah.
