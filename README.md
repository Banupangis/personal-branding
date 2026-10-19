# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Admin pengalaman

Panel `/admin` dapat menambah dan mengubah pengalaman, keterangan lengkap, kontribusi, serta subkegiatan. Setiap subkegiatan memiliki nama, keterangan, dan beberapa tautan dokumentasi. Halaman `/detail/:id` menampilkan dokumentasi dalam grid tiga kolom di layar lebar (menyesuaikan pada layar kecil), dengan preview gambar, video YouTube, serta embed tautan dokumen; tautan asli selalu tersedia jika layanan memblokir preview. Kolom `activityDocumentation` pada sheet `SubKegiatan` menyimpan daftar tautan sebagai JSON array; GAS tetap membaca nilai URL tunggal yang tersimpan sebelumnya.

Panel admin dapat menambah, mengedit, dan menghapus proyek. Pilih ikon pensil pada daftar proyek untuk memuat data ke formulir, ubah field yang diperlukan, lalu pilih **Simpan Perubahan**. Formulir proyek juga menerima URL thumbnail opsional. GAS menambahkan kolom `thumbnail` pada sheet `Projects` jika belum ada, dan kartu proyek menggunakan gambar tersebut dengan placeholder jika tautan kosong atau gagal dimuat.

Panel admin juga dapat menambah, mengedit, dan menghapus pencapaian. Data disimpan di sheet `Achievement` dengan kolom `id`, `title`, `date`, dan `description`; GAS membuat sheet beserta header jika belum tersedia. Pencapaian bawaan tetap ditampilkan dan dapat diedit atau dihapus melalui admin.

### Menyiapkan Google Apps Script

1. Buka project Apps Script yang terhubung ke spreadsheet berisi sheet `Projects` dan `SubKegiatan`. Sheet `Achievement` akan dibuat otomatis saat endpoint pencapaian pertama kali dipanggil.
2. Ganti isi script dengan kode di [`gas/Code.gs`](./gas/Code.gs). Sheet `SubKegiatan` yang masih kosong akan diberi header otomatis. Jika header telah dibuat, pastikan kolom-kolom berikut tersedia: `experienceId`, `organization`, `role`, `date`, `description`, `detail`, `contributions`, `activityId`, `activityTitle`, `activityDescription`, dan `activityDocumentation`.
3. Deploy ulang sebagai Web App agar endpoint pencapaian dan aksi CRUD-nya aktif, jalankan sebagai akun pemilik spreadsheet, dan izinkan akses sesuai kebutuhan aplikasi.
4. Pertahankan URL deployment yang dipakai di `src/data/projectsApi.js` atau perbarui `API_URL` jika URL Web App berubah.

Permintaan tanpa parameter tetap mengembalikan data `Projects`; data pengalaman dibaca dari endpoint yang sama dengan parameter `?type=experiences`. Penyimpanan dan penghapusan pengalaman menggunakan aksi `saveExperience` dan `deleteExperience`. Data pengalaman yang dihapus dicatat di Script Properties agar pengalaman bawaan tidak muncul kembali.

Data pengalaman yang sebelumnya hanya tersimpan di `localStorage` browser tidak otomatis dipindahkan ke spreadsheet. Simpan ulang data tersebut melalui panel admin setelah Apps Script diperbarui. Jika kolom dokumentasi sudah berisi teks seperti `[Ljava.lang.Object;@...`, tautan aslinya tidak dapat dipulihkan dari nilai tersebut; pasang GAS terbaru, buka pengalaman terkait di admin, masukkan ulang tautan dokumentasinya, lalu simpan.
