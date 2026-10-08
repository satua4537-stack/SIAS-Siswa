import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import { RiwayatAbsensi, Siswa } from '../../types/sias';

interface AbsenDanRiwayatViewProps {
  siswa: Siswa;
  riwayatAbsensi: RiwayatAbsensi[];
  sudahAbsenHariIni: boolean;
  waktuAbsenHariIni: string | null;
  activeQrToken: string;
  qrSecondsRemaining: number;
  onOpenScanner: () => void;
}

export const AbsenDanRiwayatView: React.FC<AbsenDanRiwayatViewProps> = ({
  siswa,
  riwayatAbsensi,
  sudahAbsenHariIni,
  waktuAbsenHariIni,
  activeQrToken,
  qrSecondsRemaining,
  onOpenScanner,
}) => {
  const [filterStatus, setFilterStatus] = useState<'semua' | 'hadir' | 'izin_sakit'>('semua');

  const filteredRiwayat = riwayatAbsensi.filter((item) => {
    if (filterStatus === 'semua') return true;
    if (filterStatus === 'hadir') return item.status === 'hadir';
    return item.status === 'sakit' || item.status === 'izin';
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Main Action Card: Scan QR Absensi (Academic Navy & Royal Blue) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white p-5 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/20 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Absensi QR Code Kelas</span>
            </span>
            <h2 className="text-lg font-bold mt-2">
              {sudahAbsenHariIni ? 'Sudah Tercatat Hadir' : 'Belum Absen Hari Ini'}
            </h2>
            <p className="text-xs text-blue-100 mt-0.5 tabular-nums">
              {sudahAbsenHariIni
                ? `Scan terakhir pukul ${waktuAbsenHariIni || '06:52 WIB'} · Radius GPS Valid`
                : 'Arahkan kamera ke QR proyektor guru untuk mencatat kehadiran.'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <QrCode className="w-7 h-7 text-white" />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenScanner}
          className="mt-4 w-full min-h-[48px] rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
        >
          <ScanLine className="w-4 h-4" />
          <span>Buka Kamera &amp; Scan QR Sekarang</span>
        </button>

        <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-100 tabular-nums">
          <span>Token Aktif: {activeQrToken}</span>
          <span>Rotasi {qrSecondsRemaining} detik</span>
        </div>
      </div>

      {/* Ringkasan Kehadiran Bulanan */}
      <div className="rounded-2xl bg-white p-4 border-2 border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800">Ringkasan Kehadiran Bulan Ini</h3>
          <span className="text-xs font-bold text-[#2563EB] tabular-nums">
            {siswa.persentaseKehadiran}% Kehadiran
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-xl bg-[#EFF6FF] p-2.5 border border-blue-200">
            <p className="text-[11px] text-slate-600">Hadir</p>
            <p className="text-base font-bold text-[#1E40AF] tabular-nums mt-0.5">
              {siswa.totalHadir} Hari
            </p>
          </div>
          <div className="rounded-xl bg-amber-50/80 p-2.5 border border-amber-200">
            <p className="text-[11px] text-slate-600">Sakit / Izin</p>
            <p className="text-base font-bold text-amber-700 tabular-nums mt-0.5">
              {siswa.totalSakit + siswa.totalIzin} Hari
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
            <p className="text-[11px] text-slate-600">Alpha</p>
            <p className="text-base font-bold text-slate-800 tabular-nums mt-0.5">
              {siswa.totalAlpha} Hari
            </p>
          </div>
        </div>
      </div>

      {/* Riwayat Absensi Lengkap + Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Riwayat Absensi Siswa</span>
          </h3>
          <span className="text-xs text-slate-500 tabular-nums">{filteredRiwayat.length} Catatan</span>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          {(
            [
              { id: 'semua', label: 'Semua Riwayat' },
              { id: 'hadir', label: 'Hadir QR' },
              { id: 'izin_sakit', label: 'Sakit / Izin' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Riwayat */}
        <div className="space-y-2.5">
          {filteredRiwayat.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl bg-white p-4 border-2 border-slate-200 shadow-2xs flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    log.status === 'hadir'
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {log.status === 'hadir' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{log.mataPelajaran}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{log.hariLabel}</p>
                  {log.catatan && (
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{log.catatan}</p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0 tabular-nums">
                <span
                  className={`inline-block text-[11px] font-bold uppercase ${
                    log.status === 'hadir' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {log.status}
                </span>
                <p className="font-mono text-xs font-semibold text-slate-800 mt-0.5">
                  {log.waktuScan || 'Surat Izin'}
                </p>
                {log.jarakGpsMeter !== undefined && (
                  <p className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{log.jarakGpsMeter}m</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
