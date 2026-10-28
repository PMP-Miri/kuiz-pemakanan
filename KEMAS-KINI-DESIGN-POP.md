# NutriArena POP 3.0: tulisan besar, ceria dan lebih jelas

Pakej kemas kini frontend untuk NutriArena 26 Aktiviti yang sedia ada. Bukan pemasangan Supabase baharu. Semua fail runtime frontend disertakan. `config.js` dan SQL sengaja tidak disertakan.

## Apa yang berubah

- Rupa baharu dengan kad putih, ruang lapang, latar lembut dan empat warna jawapan berkontras jelas.
- Fon bulat Nunito untuk soalan, jawapan dan tajuk. Fon dimuatkan melalui Google Fonts; jika disekat atau internet lambat, fon sistem digunakan. Kuiz tidak menunggu font selesai dimuatkan.
- Watak brokoli dan oren berbentuk vektor, disertakan sebagai fail tempatan. Tiada permintaan imej luar untuk maskot.
- Soalan TV pendek pada Full HD sekitar 60 px dan jawapan sekitar 36 px. Saiz berkurang secara responsif pada 720p, apabila ranking dibuka atau teks panjang. Angka bukan jaminan keterbacaan pada semua jarak.
- Butang `Aa · Standard` pada TV menukar kepada tulisan lebih besar. Tetapan ini disimpan pada browser tersebut, bukan dalam kuiz atau Supabase.
- Isi tempat kosong, padanan, susunan, label gambar dan format lain mendapat paparan TV khusus. Ia bukan lagi borang peserta yang dilumpuhkan. Peserta tetap menjawab melalui telefon.
- Borang peserta menggunakan ruang jawapan besar, kad bernombor dan kawalan sentuhan. Pemilih drop-down dan input telefon dikekalkan apabila ia lebih mudah diakses berbanding interaksi seret sahaja.
- Ruang editor, senarai kuiz, semakan respons dan laporan juga dikemaskan.
- Pratonton meliputi semua 26 format, lobi, jawapan + ranking, podium, halaman masuk dan halaman menjawab pada telefon.
- Penunjuk versi `POP 3.0 · CERIA BESAR` ada pada footer halaman utama. Nama tab juga menyebut POP 3.0.

## Tidak berubah

- Sambungan Supabase, log masuk pegawai dan akaun yang telah diberi akses.
- Kod bilik, pengendali jawapan, peraturan pemarkahan, ranking dan padanan pra/pasca.
- Semakan manual, moderasi dan podium yang menunggu semua semakan selesai.
- Pengasingan panel pegawai, TV dan peserta.
- Penyimpanan dan polisi akses data. Tiada SQL baharu, tiada jadual dipadam.

## PENTING: versi asas 26 Aktiviti

Pakej ini berasaskan versi 26 Aktiviti. Jika versi 26 Aktiviti sudah dipasang dan migrasi `002_activities.sql` sudah berjaya, TIDAK PERLU jalankan SQL lagi.

Jika Hafiz masih menggunakan versi Ceria sebelum 26 Aktiviti, migrasi `002_activities.sql` daripada pakej 26 Aktiviti terdahulu masih diperlukan sebelum menggunakan runtime ini. Pakej reka bentuk ini tidak menggantikan langkah tersebut. Jangan jalankan `schema.sql` atau padam jadual.

## Cara kemas kini GitHub

1. Hentikan sesi aktif. Simpan backup repositori atau muat turun ZIP versi semasa. Simpan salinan `config.js` di tempat selamat.
2. Ekstrak ZIP ini.
3. Buka folder hasil ekstrak sampai terus nampak `index.html`, `pegawai.html`, `pratonton.html`, folder `src` dan folder `assets`.
4. Buka halaman UTAMA repositori kuiz Hafiz di GitHub, bukan dalam folder `src` atau `assets`.
5. Pilih **Add file > Upload files**. Seret semua fail dan folder daripada pakej. Seret folder `src` dan `assets` sendiri, jangan keluarkan isi folder ke luar.
6. Sebelum Commit, pastikan laluan dalam senarai upload termasuk:

   ```text
   index.html
   pegawai.html
   pratonton.html
   src/app.js
   src/design.js
   src/stage-activities.js
   assets/pop.css
   assets/mascot-pop.svg
   ```

7. `config.js` TIDAK ADA dalam pakej. Jangan padam atau ubah fail konfigurasi sedia ada. Fail lama yang tidak disebut tidak perlu dipadam.
8. Commit changes, tunggu GitHub Pages selesai menerbitkan, kemudian buka semula laman. Jika masih versi lama, cuba hard refresh atau tetingkap baharu untuk memeriksa aset laman. Jangan guna Incognito untuk menyertai bilik mod DEMO yang dicipta dalam browser biasa.

Susunan yang betul:

```text
index.html
pegawai.html
pratonton.html
config.js                 # SEDIA ADA, KEKALKAN
.nojekyll
src/
  app.js
  design.js
  stage-activities.js
  ...modul lain
assets/
  pop.css
  mascot-pop.svg
  ...gaya dan imej lain
tests/
```

Jangan jadi `nama-folder-projek/index.html` di dalam repositori.

## Cuba reka bentuk tanpa membuka sesi

Buka `pratonton.html` pada laman GitHub Pages yang sama. Gunakan pilihan:

- TV: lobi
- TV: soalan
- TV: jawapan & ranking
- TV: podium
- Telefon: masuk kuiz
- Telefon: jawab soalan

Untuk soalan atau telefon menjawab, pilih jenis aktiviti melalui menu **Aktiviti**. Pilih tema ungu, mint atau peach. Nama, skor dan soalan semuanya CONTOH, bukan data peserta sebenar. Pratonton tidak log masuk, tidak memanggil Supabase dan tidak memuat naik rakaman.

Pilihan URL pratonton: `pratonton.html?scene=question&type=fill` atau `pratonton.html?scene=phone&type=reorder`.

## Tayangan sebenar

1. Pegawai buka `pegawai.html` pada laptop dan log masuk.
2. Pilih kuiz dan buka sesi.
3. Tekan **Buka TV**. Pindahkan tetingkap TV ke skrin kedua dalam mod **Extend**, bukan Mirror.
4. Di TV, pilih skrin penuh dan cuba butang `Aa` jika tulisan perlu lebih besar.
5. Muzik kekal pada tetingkap TV sahaja. Panel kawalan dan prestasi individu kekal pada laptop.
6. Peserta mengimbas QR untuk masuk. Halaman peserta tidak mempunyai butang Studio Pegawai.

## Kandungan panjang dan media

Teks tidak dipotong semata-mata untuk memenuhi satu skrin. Petikan panjang, terlalu banyak item atau tulisan besar boleh memerlukan scroll. Untuk tayangan dari jauh, gunakan soalan ringkas, maksimum 4 pilihan pendek jika sesuai, dan pecahkan petikan kepada beberapa aktiviti. Cuba setiap kuiz melalui pratonton/semasa latihan dahulu.

Video dengan hentian soalan dimainkan pada telefon, bukan disegerakkan pada TV. Paparan TV menerangkan arahan aktiviti. Rakaman respons audio/video dan lukisan individu tidak dipamerkan kepada umum. Label gambar mengekalkan nisbah gambar asal supaya koordinat penanda tidak tersasar.

## Semakan yang dibuat dalam persekitaran ini

- 181 semakan model dan markup sedia ada: lulus.
- 128 semakan reka bentuk/paparan awam: lulus, termasuk semua 26 format, penapisan jawapan, markup tanpa borang TV dan moderasi.
- 11 modul JavaScript dikompilasi dalam harness terasing: lulus.
- Jumlah 320 semakan kod. Harness menggunakan kod sebenar dengan import ES ditukar kepada pemuat modul tempatan. Aplikasi penuh dengan backend tidak dijalankan.
- Still paparan contoh TV Full HD, TV 720p, isi tempat kosong, jawapan + ranking, podium, telefon masuk dan telefon menjawab dirender untuk semakan visual. Data contoh sahaja. Animasi dihentikan dalam fixture semakan bagi memastikan keadaan akhir jelas.
- Integriti ZIP, hash fail, laluan import dan simulasi overlay tanpa menimpa `config.js` diperiksa semasa pembungkusan.

Keputusan angka ini bukan ujian pada laman yang sedang diterbitkan oleh Hafiz. Halaman `tests/design.html` menjalankan 309 semakan model dan reka bentuk tanpa Supabase. Baki 11 ialah semakan sintaks berasingan dalam harness pembinaan.

## Semakan yang masih perlu dibuat oleh pegawai

- Cuba pada TV/projektor sebenar dari tempat penonton paling jauh. Periksa zoom browser dan resolusi output.
- Cuba satu laptop dan dua telefon dalam mod live, termasuk submit, reconnect, kunci soalan, ranking dan laporan.
- Cuba semula audio, sentuhan/seret, upload media dan pop-up TV pada peranti sebenar.
- Cuba soalan panjang dan gambar sendiri. Semakan visual dibuat pada senario contoh, bukan semua gabungan teks, tema dan peranti.
- Pastikan ranking dihidupkan hanya apabila diperlukan. Uji semakan manual sebelum pertandingan berhadiah.

## Rollback

Jika frontend bermasalah, upload semula fail frontend daripada backup sebelum kemas kini dan kekalkan `config.js`. Tiada rollback SQL diperlukan untuk perubahan reka bentuk ini kerana ia tidak mengubah pangkalan data. Jangan gunakan versi sebelum 26 Aktiviti untuk membuka kuiz yang mengandungi jenis aktiviti baharu.
