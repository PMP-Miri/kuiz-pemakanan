# Kemas kini Ceria: tiga paparan, tiga peranan

## Untuk Hafiz yang sudah sambungkan Supabase

Gunakan ZIP **nutriarena-kemas-kini-ceria.zip**. ZIP kemas kini ini sengaja TIDAK mengandungi `config.js` atau `supabase/schema.sql`. Sambungan live yang sudah diisi di GitHub tidak akan diganti dengan konfigurasi demo, dan tiada perubahan pangkalan data diperlukan.

1. Muat turun satu salinan repositori semasa melalui GitHub, Code > Download ZIP. Simpan sebagai sandaran.
2. Ekstrak ZIP kemas kini. Anda terus nampak `index.html`, `pegawai.html`, `src/` dan `assets/`, bukan satu lagi folder projek di dalamnya.
3. Di akar repositori GitHub yang SAMA, pilih Add file > Upload files. Seret semua kandungan ZIP kemas kini. Folder `src/` dan `assets/` kekal sebagai folder.
4. Semak perubahan sebelum Commit changes. Jangan padam atau ubah `config.js`. Fail SQL tidak perlu dijalankan lagi.
5. Tunggu penerbitan Pages selesai, tutup tab lama dan buka semula laman. Jika masih rupa lama, gunakan hard refresh: Windows Ctrl + Shift + R, Mac Command + Shift + R.
6. Buka `pratonton.html` pada alamat Pages untuk melihat contoh lobi, soalan, ranking dan podium. SEMUA nama/skor di halaman itu ialah contoh, bukan peserta sebenar.

## Siapa nampak apa?

| Paparan | Dibuka melalui | Kandungan |
| --- | --- | --- |
| Pegawai | `pegawai.html` | Editor, kawalan sesi, prestasi nama individu, laporan |
| Penonton / TV | Butang **Buka TV ↗** pada sesi pegawai | Kod, QR, lobi, soalan, jumlah dijawab, jawapan selepas dikunci, ranking/podium jika diaktifkan |
| Peserta | QR/pautan sertai atau `index.html` | Borang masuk, soalan dan butang menjawab, keputusan/kod peserta sendiri |

Peserta tidak mendapat pautan Studio Pegawai. Ini perubahan paparan, bukan pengganti keselamatan: seseorang masih boleh menaip alamat Studio, tetapi fungsi pengurusan live tetap memerlukan log masuk pegawai dan pemeriksaan pelayan.

## Laptop kawal, TV tayang

```text
LAPTOP PEGAWAI                       TV / PROJEKTOR
Kawalan + monitor individu    →      Tetingkap TV sahaja
Mulakan / kunci / seterusnya         Soalan / jawapan / ranking
Laporan peribadi                     Tiada butang pegawai

                   TELEFON PESERTA
                   Jawab kuiz sendiri
```

1. Sambungkan laptop ke TV atau projektor.
2. Pilih **Extend / Paparan dilanjutkan**, BUKAN Duplicate / Mirror.
   - Windows: tekan Windows + P, pilih Extend.
   - Mac: buka System Settings > Displays, pilih TV dan tetapkan sebagai paparan lanjutan. Nama pilihan boleh berbeza mengikut macOS.
3. Buka `pegawai.html`, log masuk dan buka sesi.
4. Tekan **Buka TV ↗**. Benarkan pop-up laman jika disekat.
5. Seret tetingkap baharu ke TV. Pada tetingkap itu, tekan **⛶** untuk skrin penuh.
6. Hidupkan **♫ Muzik ON** pada tetingkap TV jika mahu. Muzik memerlukan klik pengguna. Telefon peserta dan panel pegawai tidak memainkan muzik.
7. Kekalkan panel pegawai di laptop. Kawal sesi dari situ. Jangan tarik panel itu ke TV.

Jika laptop dan TV menunjukkan benda yang sama, sistem komputer masih dalam mod Mirror. Kod laman tidak boleh menukar mod paparan komputer secara automatik.

**Alternatif tanpa Extend:** laptop menayangkan tetingkap TV sahaja, pegawai menggunakan telefon sendiri untuk log masuk Studio dan mengawal bilik yang sama. Ini memerlukan mod live. Log masuk pada laptop diperlukan untuk membuka TV; tutup panel pegawai pada laptop selepas TV dibuka dan jangan log keluar sehingga sesi selesai.

Paparan TV menggunakan sesi pegawai. Jangan hantar pautan TV kepada orang awam atau membuka sesi pegawai pada komputer yang tidak dipercayai. Whitelist paparan membuang kod peserta dan data individu daripada model TV; ia bukan endpoint awam bebas akses.

## Ranking dan pemenang

Ranking muncul apabila soalan dikunci serta pada keputusan akhir, jika pegawai mengaktifkannya semasa membuka sesi. Ia tidak muncul semasa menjawab atau untuk pra-kuiz. Pilihan 1 hingga 10 tempat pemenang dikekalkan; seri sepenuhnya berkongsi tempat. Monitor semasa menjawab berada pada panel pegawai sahaja.

## Ujian sebelum acara

- [ ] Halaman utama pada telefon tidak menunjukkan Studio Pegawai.
- [ ] Pegawai boleh log masuk dari `pegawai.html` dan membuka sesi sedia ada.
- [ ] Butang Buka TV membuka tetingkap lain. Semasa klik laporan di laptop, TV kekal pada sesi, bukan laporan.
- [ ] Dalam Extend, jadual prestasi individu tidak muncul di TV.
- [ ] Sekurang-kurangnya dua telefon boleh masuk melalui QR dan menjawab.
- [ ] Jumlah dijawab berubah, soalan bergerak, reveal dan podium sepadan pada TV dan telefon.
- [ ] Ranking OFF menyembunyikan ranking dan podium. Pra tidak mendedahkan jawapan.
- [ ] Muzik hanya keluar daripada tetingkap TV dan boleh dimatikan.
- [ ] Uji soalan paling panjang, gambar dan nama panjang pada TV sebenar. Teks arbitrari sangat panjang mungkin memerlukan skrol; tiada jaminan satu skrin bagi semua kandungan.
- [ ] Eksport laporan dan semak padanan pra/pasca sebelum pertandingan berhadiah.

## Jika mahu kembali ke versi lama

Pulihkan fail frontend daripada ZIP sandaran atau gunakan revert commit kemas kini di GitHub. Kekalkan `config.js` live. Kemas kini ini tidak mengubah SQL atau data Supabase; jangan padam jadual untuk rollback rupa paparan.

## Status semakan

Lihat `VERIFICATION.md` untuk semakan kod yang benar-benar dijalankan dan batas yang belum diuji. Pratonton bukan bukti sambungan live atau render pada TV sebenar.
