import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, Layers, MapPin, User } from 'lucide-react';
import { HariSekolah, JadwalPelajaran } from '../../types/sias';

interface JadwalPelajaranViewProps {
  jadwalList: JadwalPelajaran[];
}

const HARI_SEKOLAH: HariSekolah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const JadwalPelajaranView: React.FC<JadwalPelajaranViewProps> = ({ jadwalList }) => {
  const [modeTampilan, setModeTampilan] = useState<'harian' | 'mingguan'>('harian');

  // Hari saat ini (Senin) — hanya menampilkan jadwal untuk hari saat itu saja pada mode Per Hari
  const hariIni: HariSekolah = 'Senin';
  const jadwalHariIni = jadwalList.filter((j) => j.hari === hariIni);

  return (
    <div className="space-y-4 pb-6">
      {/* Mode Switcher: Per Hari vs Per Minggu */}
      <div className="rounded-2xl bg-slate-200/80 p-1 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setModeTampilan('harian')}
          className={`min-h-[42px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            modeTampilan === 'harian'
              ? 'bg-white text-[#1E40AF] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Per Hari</span>
        </button>

        <button
          type="button"
          onClick={() => setModeTampilan('mingguan')}
          className={`min-h-[42px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            modeTampilan === 'mingguan'
              ? 'bg-white text-[#1E40AF] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Jadwal Per Minggu</span>
        </button>
      </div>

      {modeTampilan === 'harian' ? (
        <div className="space-y-3.5">
          {/* Header Info Hari Saat Ini Saja */}
          <div className="rounded-2xl bg-[#EFF6FF] border-2 border-blue-300/70 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              <h2 className="text-sm font-extrabold text-[#1E3A8A]">
                Jadwal Hari Ini: {hariIni}
              </h2>
            </div>
            <span className="text-xs font-bold text-[#1E40AF] bg-white px-2.5 py-1 rounded-xl border border-blue-200 tabular-nums">
              {jadwalHariIni.length} Mata Pelajaran
            </span>
          </div>

          {/* Daftar Mata Pelajaran Hari Saat Ini (Setiap Mapel Memiliki Frame/Border) */}
          <div className="space-y-3">
            {jadwalHariIni.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white p-4 border-2 border-slate-300 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs tabular-nums">
                  <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[#1E40AF] bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-blue-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {item.jamMulai} – {item.jamSelesai} WIB
                    </span>
                  </span>
                  <span className="text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    Jam ke-{idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.mataPelajaran.nama}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.namaGuru}</span>
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 gap-2">
                  <span className="flex items-center gap-1 truncate">
                    <BookOpen className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span className="truncate">{item.materiPokok}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0 font-bold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.ruang}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Tampilan Jadwal Per Minggu (Setiap Mata Pelajaran Diberikan Frame/Border) */
        <div className="space-y-4">
          {HARI_SEKOLAH.map((hari) => {
            const mapelHari = jadwalList.filter((j) => j.hari === hari);
            return (
              <div
                key={hari}
                className="rounded-3xl bg-white p-4 border-2 border-slate-300 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                    <span>Hari {hari}</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {mapelHari.length} Mata Pelajaran
                  </span>
                </div>

                <div className="space-y-2.5">
                  {mapelHari.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50/80 border-2 border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.mataPelajaran.nama}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.namaGuru} · {item.ruang}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#1E40AF] bg-[#EFF6FF] border border-blue-200 px-2.5 py-1 rounded-lg shrink-0 tabular-nums">
                        {item.jamMulai}–{item.jamSelesai}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
