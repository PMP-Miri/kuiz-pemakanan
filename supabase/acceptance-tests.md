# Ujian penerimaan live (perlu dijalankan sendiri)

Gunakan projek ujian dan nama panggilan rekaan. Senarai ini bukan keputusan ujian yang sudah lulus.

## Akses

- Pegawai A boleh menyimpan/membaca kuiznya. Pegawai B tidak boleh menyunting UUID kuiz A melalui RPC atau akses terus jadual.
- Pengguna email yang tidak dalam `na_hosts`, serta pengguna anonymous, tidak boleh `na_manage` atau `na_control`.
- Tanpa autentikasi: tidak boleh membaca jadual atau memanggil RPC live.
- Peserta belum join tidak boleh membaca `na_rooms` sesi sasaran atau memanggil `na_state` sesi itu.
- Selepas join, peserta tidak boleh SELECT `na_snapshots`, `na_answers`, `na_players` atau kuiz pegawai.
- INSERT/UPDATE/DELETE terus jadual `na_*` melalui public key mesti ditolak untuk peserta dan host. Mutasi aplikasi melalui RPC sahaja.
- Sebelum reveal, payload `na_state` peserta tidak mengandungi `correct`, `explanation`, `source`, jawapan individu lain atau mata terkini yang membocorkan betul/salah.
- Fasa pra kekal tidak mendedahkan jawapan walaupun reveal/finished. Host boleh mendapatkan laporan sebagai pemilik sahaja.
- Cubaan upload fail melebihi 5 MB / MIME tidak dibenarkan / folder UUID orang lain mesti gagal.

## Satu sesi normal dengan 3 telefon

- Setiap nama muncul pada lobi pengacara. QR menuju alamat Pages sebenar termasuk subfolder repositori.
- Peserta pada WiFi sama boleh sign in anonymous. Uji CAPTCHA jika dikonfigurasi.
- Peserta tidak boleh join baharu selepas kuiz bermula, tetapi peserta sedia ada boleh reload dan sambung semula pada tab sama.
- Soalan dan pilihan diselaraskan antara skrin dan telefon, termasuk susunan rawak.
- Jawapan pendua tidak menambah mata. Jawapan qid lama ditolak. Jawapan selepas masa pelayan tamat ditolak.
- Pengacara boleh kunci awal. Apabila masa tamat, soalan terkunci walaupun tab host tidak aktif.
- Cabut internet satu telefon. UI menunjukkan sambungan perlahan, tidak menganggap jawapan offline disimpan. Sambung semula dan semak state.
- Monitor pegawai menunjukkan jumlah betul/jumlah dijawab. Paparan pentas menyembunyikan monitor.
- Ranking OFF tidak menunjukkan mata/ranking individu awam tetapi peserta boleh melihat skor pengetahuan sendiri pada akhir sesi normal/pasca.
- Ranking ON: semak seri, tempat dikongsi, dan pemenang selepas soalan akhir. Semak peraturan sebelum pemberian hadiah.
- Muzik hanya berbunyi selepas klik. Cuba mute, skrin penuh, portrait telefon, 650 px, 1182×613 dan TV 1920×1080. Semak gambar tinggi dan soalan panjang.

## Pra/pasca

- Tamatkan pra. Simpan kod peserta setiap telefon. Edit kuiz asal. Buka pasca daripada sesi pra tersebut.
- Pasca mesti menggunakan isi snapshot pra, bukan soalan baharu.
- Kod peserta salah/berulang ditolak. Kod sah mendapat nama dan padanan pra yang betul.
- Semak contoh 2/5 ke 4/5: 40% ke 80%, +40 mata peratusan.
- Rekod tidak lengkap tidak dimasukkan dalam purata pasangan lengkap.
- Jika tiada pasangan, paparan menyebut Tiada, bukan purata 0% palsu.
- Dua peserta yang sama peningkatan maksimum mendapat pengiktirafan Lonjakan Ilmu bersama.

## Eksport dan penghapusan

- CSV dibuka dalam Excel dengan emoji/aksara Melayu. Nama bermula dengan `=`, `+`, `-`, `@` tidak dijalankan sebagai formula.
- PDF dicetak dengan nama dan jadual terbaca, tanpa butang dan panel navigasi.
- Padam sesi hanya oleh pemilik. Sesi pra yang dirujuk pasca tidak boleh dipadam sebelum pasca.
- Snapshot sesi lama kekal selepas kuiz asal dipadam.
- Semak tiada service_role key atau rahsia dalam fail yang dimuat naik ke GitHub.

## Kapasiti sasaran

Jalankan percubaan dengan bilangan peranti/peserta sasaran dan WiFi dewan sebenar. Ukur latensi jawapan, trafik RPC, had Auth, penggunaan Realtime, masa muat CDN dan akses CAPTCHA. Had 200 peserta dalam kod bukan bukti 200 peserta telah diuji.
