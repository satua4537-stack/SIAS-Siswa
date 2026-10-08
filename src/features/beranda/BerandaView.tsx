import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  QrCode,
} from 'lucide-react';
import {
  JadwalPelajaran,
  PengajuanIzin,
  RiwayatAbsensi,
  Siswa,
} from '../../types/sias';

interface BerandaViewProps {
  siswa: Siswa;
  sudahAbsenHariIni: boolean;
  waktuAbsenHariIni: string | null;
  jadwalHariIni: JadwalPelajaran[];
  riwayatAbsensi: RiwayatAbsensi[];
  izinList: PengajuanIzin[];
  onOpenScanner: () => void;
  onSelectFeature: (tab: 'beranda' | 'absen' | 'izin' | 'jadwal') => void;
}

export const BerandaView: React.FC<BerandaViewProps> = ({
  siswa,
  sudahAbsenHariIni,
  waktuAbsenHariIni,
  jadwalHariIni,
  riwayatAbsensi,
  izinList,
  onOpenScanner,
  onSelectFeature,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Hero Academic Attendance Bar (Deep School Navy #1E3A8A + Royal Blue #2563EB) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white p-3 sm:p-3.5 shadow-sm flex items-center justify-between gap-2">
        {/* Kiri: Status Kehadiran Siswa */}
        <button
          type="button"
          onClick={() => onSelectFeature('absen')}
          className="bg-white text-slate-900 rounded-2xl px-3 py-2 flex-1 min-w-0 text-left shadow-2xs active:scale-[0.99] transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-[11px] font-bold text-slate-500 truncate">Kehadiran Siswa</span>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-[#1E3A8A] tabular-nums mt-0.5">
            {siswa.persentaseKehadiran}%
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 truncate">
            {sudahAbsenHariIni
              ? `Hadir · ${waktuAbsenHariIni || '06:52 WIB'}`
              : 'Belum Absen Hari Ini'}
          </p>
        </button>

        {/* Tengah: Menu Tanggal & Jam Realtime (Menarik, Komplit Tahun, Tanpa Detik) */}
        <div
          onClick={() => onSelectFeature('jadwal')}
          role="button"
          tabIndex={0}
          title="Waktu Realtime & Jadwal Pelajaran"
          className="bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/25 rounded-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer active:scale-95 transition-all select-none shrink-0"
        >
          <div className="flex items-center justify-center gap-1.5 text-amber-300 font-extrabold tabular-nums">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="font-mono text-xs sm:text-[13px] font-bold tracking-tight">
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              WIB
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 text-white text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight">
            <Calendar className="w-3 h-3 text-blue-200 shrink-0" />
            <span>
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Kanan: Tombol Scan QR Paling Kanan */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="flex flex-col items-center justify-center gap-1 text-white active:scale-95 transition-transform cursor-pointer shrink-0 pl-0.5"
          title="Scan QR Code Absensi"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xs border border-amber-300">
            <QrCode className="w-5 h-5 stroke-[2.3]" />
          </div>
          <span className="text-[11px] font-bold text-white whitespace-nowrap">Scan QR</span>
        </button>
      </div>

      {/* 2. 3 Core Feature Menu Icons — Academic Color Palette */}
      <div className="rounded-3xl bg-white p-4 border-2 border-slate-200 shadow-2xs">
        <p className="text-xs font-bold text-slate-500 mb-3.5 px-1">Menu Akademik Siswa</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {/* Fitur 1: QR Code Absen & Riwayat (Academic Royal Blue) */}
          <button
            type="button"
            onClick={() => onSelectFeature('absen')}
            className="group flex flex-col items-center justify-start p-2 rounded-2xl hover:bg-blue-50/60 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-blue-200 text-[#2563EB] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <QrCode className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-slate-900 mt-2 leading-tight">
              Absen QR &amp; Riwayat
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">Scan &amp; Rekap</span>
          </button>

          {/* Fitur 2: Fitur Izin (Scholarly Amber / Orange) */}
          <button
            type="button"
            onClick={() => onSelectFeature('izin')}
            className="group flex flex-col items-center justify-start p-2 rounded-2xl hover:bg-amber-50/60 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-slate-900 mt-2 leading-tight">
              Fitur Izin
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">Sakit &amp; Dispensasi</span>
          </button>

          {/* Fitur 3: Jadwal Pelajaran (Academic Indigo) */}
          <button
            type="button"
            onClick={() => onSelectFeature('jadwal')}
            className="group flex flex-col items-center justify-start p-2 rounded-2xl hover:bg-indigo-50/60 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#4F46E5] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Calendar className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-slate-900 mt-2 leading-tight">
              Jadwal Pelajaran
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">Harian &amp; Mingguan</span>
          </button>
        </div>
      </div>

      {/* 3. Sekilas Jadwal Pelajaran Hari Ini (Senin) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Jadwal Hari Ini (Senin)</h2>
            <p className="text-[11px] text-slate-500">Kelas {siswa.kelas}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectFeature('jadwal')}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {jadwalHariIni.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectFeature('jadwal')}
              className="min-w-[220px] max-w-[240px] text-left rounded-2xl bg-white p-3.5 border-2 border-slate-200 shadow-2xs shrink-0 hover:border-[#2563EB] transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#1E40AF] bg-[#EFF6FF] border border-blue-200 px-2 py-0.5 rounded-md tabular-nums">
                <Clock className="w-3 h-3" />
                <span>
                  {item.jamMulai} – {item.jamSelesai}
                </span>
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 truncate">
                {item.mataPelajaran.nama}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">{item.namaGuru}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-2">{item.ruang}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Riwayat Absensi & Status Izin Terbaru */}
      <div className="rounded-3xl bg-white p-4 border-2 border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Aktivitas Absen &amp; Izin Terbaru</h2>
          <button
            type="button"
            onClick={() => onSelectFeature('absen')}
            className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
          >
            Detail Riwayat
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {riwayatAbsensi.slice(0, 3).map((log) => (
            <div
              key={log.id}
              className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    log.status === 'hadir'
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{log.mataPelajaran}</p>
                  <p className="text-[11px] text-slate-500 truncate">{log.hariLabel}</p>
                </div>
              </div>

              <div className="text-right shrink-0 tabular-nums">
                <span
                  className={`text-[11px] font-bold uppercase ${
                    log.status === 'hadir' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {log.status}
                </span>
                <p className="text-[11px] font-mono text-slate-500">{log.waktuScan || 'Izin'}</p>
              </div>
            </div>
          ))}
        </div>

        {izinList.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Pengajuan izin terakhir ({izinList[0].tanggalMulai}):</span>
            <span className="font-bold uppercase text-[#2563EB]">{izinList[0].status}</span>
          </div>
        )}
      </div>
    </div>
  );
};
