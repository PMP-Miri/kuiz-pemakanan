# Status semakan NutriArena v1

## Dilaksanakan dan lulus

### 59 semakan logik

`tests/scenarios.js` dijalankan menggunakan enjin JavaScript dalam sandbox Python. Hanya pernyataan import/export statik dibuang untuk menggabungkan modul bagi harness. Fungsi async dan await dikekalkan. URL, crypto, Promise dan structuredClone menggunakan primitif JavaScript sebenar; localStorage, sessionStorage, EventTarget window dan Web Locks diwakili storan/penyambung dalam memori.

Semakan merangkumi:

- Formula mata, bonus kelajuan, seri dan pemenang yang berkongsi tempat.
- Peratus pra/pasca, rekod tanpa pasangan dan tiada pasangan.
- CSV BOM, petikan dan perlindungan asas formula.
- Escape HTML dan penolakan URL tidak dibenarkan.
- Validasi kuiz, draf, import tidak sah, ID berulang dan jenis medan.
- Kod bilik, peserta, join semula dan sekatan penyertaan selepas mula.
- Kerahsiaan jawapan, penerangan, mata serta kod peserta pada fasa awam yang berkaitan.
- Jawapan pendua, soalan lama, jawapan selepas dikunci dan tamat masa.
- Monitor prestasi, mod ranking OFF dan statistik akhir individu.
- Snapshot pasca daripada pra, bukan kuiz asal yang sudah disunting.
- Kod pra salah/berulang dan perlindungan padam pra yang masih dirujuk.
- Satu pasangan lengkap dengan soalan/pilihan rawak: pra 1/3, pasca 3/3, perubahan 66.6667 mata peratusan.

### 12 semakan markup UI dengan DOM tiruan

Kod pembina paparan aplikasi dijalankan dengan objek DOM minimum. Markup yang terhasil disemak bagi halaman sertai, Studio, editor, escape teks/atribut, tetapan ranking, lobi, monitor, paparan pentas, penerangan, ranking antara soalan, podium akhir dan laporan pra/pasca. Ini BUKAN render visual browser.

### Sintaks dan struktur

- JavaScript aplikasi, core, demo, audio, API, konfigurasi dan skrip ujian berjaya dikompilasi dengan Function constructor selepas import/export statik dikeluarkan.
- Skrip ujian browser berjaya dikompilasi. Halaman ujian itu sendiri tidak dibuka dalam browser.
- Fail modul tempatan dan rujukan CSS/JavaScript dalam index.html wujud.
- Tindakan butang literal mempunyai pengendali.
- Kelas CSS literal disemak. Kelas dinamik untuk jawapan dan tempat pertama hingga ketiga mempunyai gaya; tema aurora menggunakan gaya asas kad, ocean/sunset mempunyai override.
- Skema SQL disemak secara bacaan untuk RLS, akses fungsi, pengiraan mata pelayan dan pemisahan snapshot/jawapan daripada SELECT peserta. Ini bukan ujian SQL yang telah dilaksanakan atau audit keselamatan bebas.

## Belum dilaksanakan

- `node --test tests/check.mjs` melalui Node. Tiada proses Node dijalankan; senario yang sama dijalankan melalui harness sandbox di atas.
- Menjalankan skema pada PostgreSQL/Supabase sebenar.
- Ujian polisi RLS, Auth, Storage, CAPTCHA, Realtime dan pengasingan akaun terhadap backend sebenar.
- Ujian telefon berasingan, kod QR kamera dan sambung semula rangkaian.
- Render visual browser, ukuran susun atur sebenar, kebolehbacaan TV dan ujian aksesibiliti lengkap.
- Main balik audio atau kawalan fullscreen pada peranti sebenar.
- Penerbitan ke repositori atau GitHub Pages pengguna.
- Ujian beban atau kapasiti 200 peserta. Nombor ini ialah had kod, bukan jaminan.

## Sebelum acara

Ikut `supabase/acceptance-tests.md`, uji pada WiFi sebenar dan sekurang-kurangnya dua telefon. Semak soalan/fakta dengan Pegawai Sains Pemakanan. Jalankan pertandingan percubaan dan eksport laporan sebelum memberikan hadiah sebenar.
