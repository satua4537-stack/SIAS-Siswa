export type HariSekolah = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export type PrioritasLevel = 'P0' | 'P1' | 'P2' | 'P3';

export interface SubTugas {
  id: string;
  judul: string;
  selesai: boolean;
}

export interface TugasPrioritas {
  id: string;
  judul: string;
  mataPelajaran: string;
  namaGuru: string;
  prioritas: PrioritasLevel; // P0: Kritis/Mendesak, P1: Tinggi, P2: Terjadwal, P3: Mandiri
  tenggat: string; // ISO date string
  jamTenggat: string; // "23:59" or "07:00"
  bobotNilai: number; // Percentage weight e.g. 25%
  estimasiMenit: number; // e.g., 45 mins
  catatan: string;
  status: 'belum_mulai' | 'sedang_dikerjakan' | 'selesai';
  subTugas: SubTugas[];
  skorPrioritas: number; // Calculated priority index 1-99
}

export interface Siswa {
  id: string;
  nis: string;
  nama: string;
  panggilan: string;
  kelas: string;
  sekolah: string;
  avatar: string;
  persentaseKehadiran: number;
  totalHadir: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpha: number;
  streakHadirHari: number;
  orangTuaNama: string;
  orangTuaTerhubung: boolean;
}

export interface MataPelajaran {
  id: string;
  nama: string;
  kode: string;
  warna: string;
  iconName: string;
}

export interface JadwalPelajaran {
  id: string;
  hari: HariSekolah;
  jamMulai: string;
  jamSelesai: string;
  mataPelajaran: MataPelajaran;
  namaGuru: string;
  ruang: string;
  materiPokok: string;
}

export interface RiwayatAbsensi {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hariLabel: string;
  mataPelajaran: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpha' | 'terlambat';
  waktuScan: string | null;
  catatan: string | null;
  jarakGpsMeter?: number;
}

export interface PengajuanIzin {
  id: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jenis: 'sakit' | 'izin_keluarga' | 'dinas_sekolah';
  keterangan: string;
  urlBukti: string | null;
  ukuranAsliKb?: number;
  ukuranKompresiKb?: number;
  exifStripped?: boolean;
  tandaTanganOrtu?: string | null;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  catatanGuru: string | null;
  createdAt: string;
}

export interface NilaiAkademik {
  id: string;
  mataPelajaran: string;
  kategori: 'Tugas Prioritas' | 'Ujian Tengah Semester' | 'Praktikum' | 'Kuis Harian';
  judulPenilaian: string;
  nilai: number;
  kkm: number;
  tanggal: string;
  komentarGuru: string;
}

export interface PengumumanSekolah {
  id: string;
  judul: string;
  kategori: string;
  tanggal: string;
  isi: string;
  penting: boolean;
}
