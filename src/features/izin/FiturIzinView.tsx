import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  ShieldCheck,
  ChevronDown,
  Check,
} from 'lucide-react';
import { PengajuanIzin } from '../../types/sias';
import { CompressedImageResult } from '../../lib/imageCompressor';

interface FiturIzinViewProps {
  izinList: PengajuanIzin[];
  onOpenDirectCamera: (onComplete: (res: CompressedImageResult) => void) => void;
  onSubmitIzin: (newIzin: Omit<PengajuanIzin, 'id' | 'status' | 'catatanGuru' | 'createdAt'>) => void;
}

const KATEGORI_OPTIONS = [
  {
    id: 'sakit' as const,
    label: 'Sakit',
    badge: 'Medis',
    desc: 'Istirahat karena sakit atau pemeriksaan kesehatan',
  },
  {
    id: 'izin_keluarga' as const,
    label: 'Izin Keluarga',
    badge: 'Pribadi',
    desc: 'Urusan atau keperluan mendesak keluarga',
  },
  {
    id: 'dinas_sekolah' as const,
    label: 'Dispensasi / Dinas Sekolah',
    badge: 'Dinas',
    desc: 'Kegiatan lomba, olimpiade, atau perwakilan sekolah',
  },
];

export const FiturIzinView: React.FC<FiturIzinViewProps> = ({
  izinList,
  onOpenDirectCamera,
  onSubmitIzin,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const [jenisIzin, setJenisIzin] = useState<'sakit' | 'izin_keluarga' | 'dinas_sekolah'>('sakit');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [tanggalMulai, setTanggalMulai] = useState(todayIso);
  const [tanggalSelesai, setTanggalSelesai] = useState(todayIso);
  const [keterangan, setKeterangan] = useState('');
  const [opsiSurat, setOpsiSurat] = useState<'tanpa_surat' | 'ada_surat'>('ada_surat');
  const [capturedPhoto, setCapturedPhoto] = useState<CompressedImageResult | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const selectedCategory = KATEGORI_OPTIONS.find((opt) => opt.id === jenisIzin) || KATEGORI_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const isSubmitDisabled = opsiSurat === 'ada_surat' && !capturedPhoto;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);

    if (jenisIzin === 'sakit' && tanggalMulai > todayIso) {
      setFormMessage({
        type: 'error',
        text: 'Untuk izin sakit, tanggal mulai tidak boleh di masa depan.',
      });
      return;
    }

    if (tanggalSelesai < tanggalMulai) {
      setFormMessage({
        type: 'error',
        text: 'Tanggal selesai harus sama atau setelah tanggal mulai.',
      });
      return;
    }

    if (keterangan.trim().length < 10) {
      setFormMessage({
        type: 'error',
        text: 'Keterangan wajib diisi minimal 10 karakter.',
      });
      return;
    }

    if (opsiSurat === 'ada_surat' && !capturedPhoto) {
      setFormMessage({
        type: 'error',
        text: 'Wajib mengambil foto surat keterangan terlebih dahulu sebelum mengirim.',
      });
      return;
    }

    onSubmitIzin({
      tanggalMulai,
      tanggalSelesai,
      jenis: jenisIzin,
      keterangan: keterangan.trim(),
      urlBukti: opsiSurat === 'ada_surat' && capturedPhoto ? capturedPhoto.dataUrl : null,
      ukuranAsliKb: opsiSurat === 'ada_surat' ? capturedPhoto?.originalSizeKb : undefined,
      ukuranKompresiKb: opsiSurat === 'ada_surat' ? capturedPhoto?.compressedSizeKb : undefined,
      exifStripped: opsiSurat === 'ada_surat',
      tandaTanganOrtu: null,
    });

    setKeterangan('');
    setCapturedPhoto(null);
    setFormMessage({
      type: 'success',
      text: 'Pengajuan izin berhasil dikirim! Menunggu persetujuan Guru Wali Kelas.',
    });
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Form Pengajuan Izin (Academic Blue & Amber Theme) */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-5 border-2 border-slate-200 shadow-2xs space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ajukan Izin / Sakit</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Isi form singkat &amp; lampirkan foto surat via kamera langsung
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {formMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium border ${
              formMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {formMessage.text}
          </div>
        )}

        {/* Pilihan Jenis Izin (Model Dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Pilih Kategori Izin *
          </label>

          {/* Kolom / Field Dropdown yang Menampilkan Kategori Terpilih */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            className={`w-full min-h-[46px] rounded-2xl border px-3.5 py-2.5 bg-white text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
              isDropdownOpen
                ? 'border-[#2563EB] ring-2 ring-blue-100 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {selectedCategory.label}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
                    {selectedCategory.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {selectedCategory.desc}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-[#2563EB]' : ''
              }`}
            />
          </button>

          {/* Menu Pilihan Dropdown yang Muncul saat Diklik */}
          {isDropdownOpen && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100"
            >
              {KATEGORI_OPTIONS.map((item) => {
                const isSelected = jenisIzin === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setJenisIzin(item.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full p-3 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFF6FF] text-[#1E40AF]'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {item.label}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-blue-100 text-[#1E40AF]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tanggal Mulai & Selesai */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mulai Tanggal</label>
            <input
              type="date"
              value={tanggalMulai}
              max={jenisIzin === 'sakit' ? todayIso : undefined}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full min-h-[44px] rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 tabular-nums focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={tanggalSelesai}
              min={tanggalMulai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full min-h-[44px] rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 tabular-nums focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Alasan / Keterangan</label>
            <span className="text-[11px] text-slate-400 tabular-nums">{keterangan.length}/500</span>
          </div>
          <textarea
            rows={3}
            maxLength={500}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Demam dan flu, disarankan istirahat oleh dokter..."
            className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Kamera Bukti Surat Dokter (2 Opsi: Tanpa Surat vs Ada Surat) */}
        <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Lampiran Surat Keterangan</p>
              <p className="text-[11px] text-slate-500">
                Pilih apakah izin disertai surat keterangan atau tidak
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0" />
          </div>

          {/* 2 Opsi: Tanpa Surat Keterangan & Ada Surat Keterangan */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOpsiSurat('tanpa_surat')}
              className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                opsiSurat === 'tanpa_surat'
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tanpa Surat Keterangan
            </button>
            <button
              type="button"
              onClick={() => setOpsiSurat('ada_surat')}
              className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                opsiSurat === 'ada_surat'
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Ada Surat Keterangan
            </button>
          </div>

          {opsiSurat === 'tanpa_surat' ? (
            <div className="rounded-xl bg-white p-3 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Izin diajukan tanpa lampiran surat. Tombol kirim langsung aktif.</span>
            </div>
          ) : !capturedPhoto ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onOpenDirectCamera((res) => setCapturedPhoto(res))}
                className="w-full min-h-[46px] rounded-2xl bg-white border-2 border-[#2563EB] hover:bg-[#EFF6FF] text-[#1E40AF] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#2563EB]" />
                <span>Ambil Foto Surat Sekarang</span>
              </button>
              <p className="text-[11px] text-amber-700 font-medium text-center">
                * Silakan ambil foto surat keterangan terlebih dahulu untuk mengaktifkan tombol kirim.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-blue-200">
              <img
                src={capturedPhoto.dataUrl}
                alt="Surat Dokter"
                referrerPolicy="no-referrer"
                className="w-12 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-bold text-[#1E40AF] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Foto Terlampir ({capturedPhoto.compressedSizeKb} KB)</span>
                </p>
                <p className="text-[11px] text-slate-500 tabular-nums mt-0.5">
                  Hemat {capturedPhoto.compressionRatioPercent}% dari {capturedPhoto.originalSizeKb} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenDirectCamera((res) => setCapturedPhoto(res))}
                className="min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-bold text-[#2563EB] hover:bg-[#EFF6FF] cursor-pointer"
              >
                Ubah
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`w-full min-h-[48px] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isSubmitDisabled
              ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm active:scale-[0.99] cursor-pointer'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>
            {isSubmitDisabled
              ? 'Ambil Foto Surat Dulu untuk Mengirim'
              : 'Kirim Pengajuan Izin'}
          </span>
        </button>
      </form>

      {/* Riwayat Status Pengajuan Izin */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-900 px-1">Riwayat Pengajuan Izin</h3>
        {izinList.map((izin) => (
          <div
            key={izin.id}
            className="rounded-2xl bg-white p-4 border-2 border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 capitalize">
                Izin {izin.jenis.replace('_', ' ')}
              </span>
              <span
                className={`inline-flex items-center gap-1 font-bold uppercase text-[11px] ${
                  izin.status === 'disetujui'
                    ? 'text-emerald-600'
                    : izin.status === 'ditolak'
                    ? 'text-rose-600'
                    : 'text-amber-600'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{izin.status}</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{izin.keterangan}</p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 tabular-nums">
              <span>Tanggal: {izin.tanggalMulai}</span>
              <span>{izin.createdAt}</span>
            </div>

            {izin.catatanGuru && (
              <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-xs text-slate-700 border border-blue-100">
                <strong>Catatan Wali Kelas:</strong> {izin.catatanGuru}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
