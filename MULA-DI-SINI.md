# Mula di sini, Hafiz

## A. Cuba UI tanpa pangkalan data

1. Ekstrak ZIP. Gunakan kandungan folder `nutriarena` sebagai akar repositori GitHub.
2. Pastikan `index.html`, `config.js`, `.nojekyll`, `src/` dan `assets/` berada di akar repositori, bukan dalam satu lagi folder bertingkat.
3. Aktifkan GitHub Pages melalui Settings > Pages, penerbitan daripada branch utama dan folder root.
4. Untuk pegawai, buka `pegawai.html` pada alamat GitHub Pages yang sama. Halaman utama `index.html` khusus untuk peserta dan tidak memaparkan butang Studio Pegawai.
5. Cipta kuiz atau gunakan contoh. Isi soalan, jawapan, penerangan, gambar dan sumber. Klik **Terbitkan kuiz**.
6. Klik **Buka sesi**, kemudian cipta bilik.
7. Klik **Uji peserta** untuk tab peserta. Daftar nama di tab itu. Kembali ke tab pengacara dan mulakan kuiz.

**Demo hanya berkongsi data antara tab dalam browser/profil yang sama. Telefon lain tidak akan tersambung.** QR ke telefon memerlukan mod live di bawah. Tiada peserta palsu ditambah secara automatik.

Untuk cuba di komputer sendiri, jalankan `python -m http.server 8000` dalam folder projek jika Python tersedia, kemudian buka `http://localhost:8000`. Jangan buka fail menggunakan `file://`.

## B. Sambungan telefon sebenar

GitHub Pages menyajikan UI. Supabase menjadi pangkalan data dan penyambung sesi. Akaun pegawai, jawapan serta laporan disimpan pada projek Supabase anda.

1. Cipta projek Supabase berasingan.
2. Jalankan `supabase/schema.sql` sekali dalam SQL Editor.
3. Cipta akaun pegawai di Authentication > Users.
4. Salin UUID pegawai dan jalankan:

```sql
insert into public.na_hosts(user_id) values ('UUID-PEGAWAI');
```

5. Hidupkan Anonymous Sign-ins untuk peserta. Untuk acara awam, sediakan CAPTCHA dan semak had permintaan Auth.
6. Dalam `config.js`, ubah `mode` kepada `live`, isi URL projek dan **publishable key awam**. Jangan guna `service_role` atau secret key.
7. Muat naik konfigurasi ke GitHub, tunggu Pages diterbitkan dan buka semula aplikasi.
8. Log masuk Studio. Uji satu pengacara dan sekurang-kurangnya dua telefon pada rangkaian booth.

Panduan terperinci, privasi, rollback serta batas kapasiti ada dalam `README.md`. Semak `supabase/acceptance-tests.md` sebelum acara. Tiada jaminan kapasiti atau keselamatan hanya berdasarkan ujian demo.

## C. Ranking dan pemenang

Semasa **Buka sesi**, pegawai boleh:

- Hidupkan atau sembunyikan ranking awam.
- Pilih 1 hingga 10 tempat pemenang.
- Hidupkan atau matikan bonus kelajuan.
- Rawakkan soalan dan pilihan jawapan.

Ranking awam dipaparkan antara soalan dan pada keputusan akhir. Monitor pegawai dikemas kini semasa peserta menjawab. Ia menunjukkan nama, jumlah dijawab, bilangan betul dan status jawapan semasa. Klik **Buka TV ↗** untuk tetingkap penonton yang berasingan. Panel pegawai kekal pada laptop; seret tetingkap TV ke paparan kedua menggunakan **Extend**, bukan Mirror. Muzik dihidupkan pada tetingkap TV sahaja. Rajah aliran dan langkah kemas kini ada dalam `KEMAS-KINI-CERIA.md`.

Betul = 1000 mata. Bonus kelajuan pilihan = sehingga 500 mata. Peratus pengetahuan tidak menggunakan bonus. Seri ditentukan dengan mata, bilangan betul dan masa terkumpul; jika semuanya sama, tempat dikongsi. Had tempat pemenang merangkumi semua peserta seri pada tempat terakhir. Peraturan perlu dimaklumkan sebelum pertandingan.

## D. Pra/pasca

1. Buka sesi **Pra-kuiz**. Ranking dan bonus kelajuan dimatikan automatik, jawapan tidak didedahkan.
2. Peserta simpan kod peserta 12 aksara pada telefon masing-masing.
3. Jalankan aktiviti pendidikan.
4. Buka sesi **Pasca-kuiz**, pilih sesi pra yang sudah tamat.
5. Peserta masukkan kod pra. Nama dan padanan diambil daripada rekod pra.
6. Buka laporan pasca. Lihat purata pra, pasca, perubahan mata peratusan dan pengiktirafan **Lonjakan Ilmu**.

Hanya pasangan yang menjawab semua soalan bagi kedua-dua fasa dimasukkan dalam purata berpasangan. Rekod tidak lengkap diasingkan. Pasca menggunakan salinan soalan pra walaupun kuiz asal disunting.

## E. Skop versi ini

Disediakan: kuiz dikawal pengacara, editor, bank soalan sendiri, tiga tema, muzik sintesis, QR, ranking, podium, monitor, pra/pasca, JSON, CSV dan cetak PDF.

Belum disediakan: mod booth kendiri, integrasi terus dengan game kamera, akaun pemulihan peserta, pelayan LAN/offline, penjanaan soalan AI, analisis topik berasingan, hadiah rawak atau lagu MP3 tersuai. Fakta pemakanan mesti ditulis dan disemak pegawai. Kuiz contoh mengajar fungsi platform sahaja.

Cadangan fasa berikut: mod booth kendiri dan penapis bank soalan mengikut topik. Mulakan dengan ujian sesi kecil dahulu sebelum pertandingan berhadiah.
