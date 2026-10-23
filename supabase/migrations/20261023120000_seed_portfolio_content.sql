insert into public.experiences (
  id, organization, role, date, description, detail, link, contributions
)
values
  (
    '1',
    'BEM FATISDA UNS',
    'Harmonisasi Internal',
    '2026 — Sekarang',
    'Berperan dalam kepanitiaan program kerja Harmonisasi Internal dan kegiatan BEM FATISDA periode 2026.',
    'Berperan dalam kepanitiaan program kerja Harmonisasi Internal dan kegiatan BEM FATISDA periode 2026.',
    '',
    array[
      'Bertanggung jawab mengakrabkan anggota dan menjaga keharmonisan organisasi.',
      'Menjadi penanggung jawab Congratulating Ultah BEM FATISDA 2026.'
    ]::text[]
  ),
  (
    '2',
    'KOMADIKSI SMART UNS',
    'Bidang Pengabdian Masyarakat',
    '2026 — Sekarang',
    'Terlibat dalam kepanitiaan program kerja Pengabdian Masyarakat.',
    'Terlibat dalam kepanitiaan program kerja Pengabdian Masyarakat.',
    '',
    array[
      'Aktif menyampaikan saran dan ide dalam kegiatan.',
      'Menjadi Ketua Tim PPK Ormawa Komadiksi Smart 2026 yang lolos seleksi internal.'
    ]::text[]
  ),
  (
    '3',
    'Koordinator Tingkat Informatika 2025',
    'Koordinator Angkatan',
    '2025 — Sekarang',
    'Bertanggung jawab mengoordinasikan Angkatan Informatika 2025 Universitas Sebelas Maret.',
    'Bertanggung jawab mengoordinasikan Angkatan Informatika 2025 Universitas Sebelas Maret.',
    '',
    array[
      'Mengoordinasikan anggota angkatan.',
      'Menjadi penghubung antara Informatika 2025 dan pihak luar.'
    ]::text[]
  ),
  (
    '4',
    'Dewan Ambalan Jodhipati',
    'Pemangku Adat',
    '2023 — 2024',
    'Bertanggung jawab atas tata tertib, perilaku, dan sikap anggota serta menjadi pengawas dalam Ambalan.',
    'Bertanggung jawab atas tata tertib, perilaku, dan sikap anggota serta menjadi pengawas dalam Ambalan.',
    '',
    array[
      'Menjadi sie acara dalam program kerja Ambalan.',
      'Bertanggung jawab terkait aturan dalam Ambalan.'
    ]::text[]
  ),
  (
    '5',
    'OSIS SMAN 1 Kudus',
    'Bidang Kepribadian Unggul, Wawasan Kebangsaan, dan Bela Negara',
    '2023 — 2024',
    'Terlibat dalam berbagai program kerja OSIS SMAN 1 Kudus.',
    'Terlibat dalam berbagai program kerja OSIS SMAN 1 Kudus.',
    '',
    array[
      'Bertanggung jawab terkait pengiriman Paskibraka Kabupaten Kudus tahun 2024.',
      'Menjadi koordinator sie perlengkapan di beberapa program kerja OSIS.',
      'Menjadi panitia dalam seluruh program kerja OSIS.'
    ]::text[]
  ),
  (
    '6',
    'Garuda Pecinta Alam (GACILA)',
    'Wakil Ketua',
    '2023 — 2024',
    'Bertanggung jawab dalam urusan internal dan eksternal kepengurusan serta mengoordinasikan anggota GACILA.',
    'Bertanggung jawab dalam urusan internal dan eksternal kepengurusan serta mengoordinasikan anggota GACILA.',
    '',
    array[
      'Menjadi ketua pelaksana Kompetisi Panjat Tebing Tingkat Nasional Smasa Summit Attack #5.',
      'Menjadi ketua pelaksana Pelatihan Pendidikan di Alam (PPDA) GACILA tahun 2024.'
    ]::text[]
  ),
  (
    '7',
    'EXPO ORMAWA UNS',
    'Sie Bidang Acara',
    '2026',
    'Berperan dalam pelaksanaan kegiatan EXPO ORMAWA UNS.',
    'Berperan dalam pelaksanaan kegiatan EXPO ORMAWA UNS.',
    '',
    array[
      'Aktif memberikan ide dan saran selama kegiatan.',
      'Menjadi koordinator lapangan luar.',
      'Menjadi pemateri Technical Meeting Fasilitator dan Kelas Fasilitator.'
    ]::text[]
  ),
  (
    '8',
    'Sosialisasi KIPSMARTS UNS',
    'Koordinator Daerah Kudus',
    '2025 — 2026',
    'Mengoordinasikan anggota dan bertanggung jawab atas sosialisasi KIP-Kuliah di kalangan SMA wilayah Kudus.',
    'Mengoordinasikan anggota dan bertanggung jawab atas sosialisasi KIP-Kuliah di kalangan SMA wilayah Kudus.',
    '',
    array[
      'Berhasil menyosialisasikan informasi KIP-Kuliah kepada sekitar 200 orang.'
    ]::text[]
  ),
  (
    '9',
    'One Step Closer Maganger BEM FATISDA UNS',
    'Ketua Pelaksana',
    '2025',
    'Bertanggung jawab atas persiapan dan pelaksanaan kegiatan.',
    'Bertanggung jawab atas persiapan dan pelaksanaan kegiatan.',
    '',
    array[
      'Mengarahkan persiapan dan pelaksanaan kegiatan.'
    ]::text[]
  ),
  (
    '10',
    'Networking BEM FATISDA UNS',
    'Sie Bidang Acara',
    '2025',
    'Mendukung pelaksanaan kegiatan Networking BEM FATISDA UNS.',
    'Mendukung pelaksanaan kegiatan Networking BEM FATISDA UNS.',
    '',
    array[
      'Menjadi master of ceremonies nonformal.',
      'Aktif memberikan ide dan saran selama kegiatan.'
    ]::text[]
  ),
  (
    '11',
    'Kompetisi Panjat Tebing Smasa Summit Attack #5',
    'Ketua Pelaksana',
    '2024',
    'Mengarahkan dan mengoordinasikan seluruh kegiatan kompetisi yang diikuti 220 peserta dari seluruh Indonesia.',
    'Mengarahkan dan mengoordinasikan seluruh kegiatan kompetisi yang diikuti 220 peserta dari seluruh Indonesia.',
    '',
    array[
      'Bertanggung jawab atas setiap rangkaian kegiatan.'
    ]::text[]
  )
on conflict (id) do update set
  organization = excluded.organization,
  role = excluded.role,
  date = excluded.date,
  description = excluded.description,
  detail = excluded.detail,
  link = excluded.link,
  contributions = excluded.contributions,
  updated_at = now();

insert into public.achievements (
  id, title, date, description, detail, thumbnail, documentation
)
values
  (
    'achievement-1',
    'Juara 3 — Infografis EXVORA UNS',
    '2026',
    'Berkontribusi dalam ide, masukan, dan desain infografis.',
    'Berkontribusi dalam ide, masukan, dan desain infografis.',
    '',
    array[]::text[]
  ),
  (
    'achievement-2',
    'Juara 1 — Lomba Lintas Alam Karang Taruna Kabupaten Kudus',
    '2024',
    'Berperan sebagai koordinator tim dan mengoordinasikan anggota selama kegiatan.',
    'Berperan sebagai koordinator tim dan mengoordinasikan anggota selama kegiatan.',
    '',
    array[]::text[]
  ),
  (
    'achievement-3',
    'Juara 2 — Lomba Lintas Alam Karang Taruna Kabupaten Kudus',
    '2023',
    'Berperan sebagai koordinator tim dan mengoordinasikan anggota selama kegiatan.',
    'Berperan sebagai koordinator tim dan mengoordinasikan anggota selama kegiatan.',
    '',
    array[]::text[]
  )
on conflict (id) do update set
  title = excluded.title,
  date = excluded.date,
  description = excluded.description,
  detail = excluded.detail,
  thumbnail = excluded.thumbnail,
  documentation = excluded.documentation,
  updated_at = now();
