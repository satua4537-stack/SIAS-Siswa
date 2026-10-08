import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  FileText,
  Home,
  QrCode,
  WifiOff,
} from 'lucide-react';
import {
  initialPengajuanIzin,
  initialRiwayatAbsensi,
  initialSiswa,
  mockJadwalMingguan,
} from './mocks/siasData';
import { PengajuanIzin, RiwayatAbsensi } from './types/sias';
import { BerandaView } from './features/beranda/BerandaView';
import { AbsenDanRiwayatView } from './features/absensi/AbsenDanRiwayatView';
import { FiturIzinView } from './features/izin/FiturIzinView';
import { JadwalPelajaranView } from './features/jadwal/JadwalPelajaranView';
import { QRScannerModal } from './components/scanner/QRScannerModal';
import { DirectCameraModal } from './components/camera/DirectCameraModal';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { CompressedImageResult } from './lib/imageCompressor';

type ActiveMenuTab = 'beranda' | 'absen' | 'izin' | 'jadwal';

const STORAGE_KEYS = {
  ABSENSI: 'sias_go_absensi_v2',
  IZIN: 'sias_go_izin_v2',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveMenuTab>('beranda');
  const [siswa, setSiswa] = useState(initialSiswa);

  // 1. State Riwayat Absensi (Persisted in localStorage)
  const [riwayatAbsensi, setRiwayatAbsensi] = useState<RiwayatAbsensi[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ABSENSI);
      return saved ? JSON.parse(saved) : initialRiwayatAbsensi;
    } catch {
      return initialRiwayatAbsensi;
    }
  });

  // 2. State Pengajuan Izin (Persisted in localStorage)
  const [izinList, setIzinList] = useState<PengajuanIzin[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IZIN);
      return saved ? JSON.parse(saved) : initialPengajuanIzin;
    } catch {
      return initialPengajuanIzin;
    }
  });

  // Modals State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDirectCameraOpen, setIsDirectCameraOpen] = useState(false);
  const [cameraCallback, setCameraCallback] = useState<((res: CompressedImageResult) => void) | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Offline Detector
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // Rotating 15-Second QR Token
  const [qrSecondsRemaining, setQrSecondsRemaining] = useState(15);
  const [activeQrToken, setActiveQrToken] = useState('SIAS-QR-XI-IPA1-8942A');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(riwayatAbsensi));
    } catch {
      // Ignore storage quota errors
    }
  }, [riwayatAbsensi]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IZIN, JSON.stringify(izinList));
    } catch {
      // Ignore storage quota errors
    }
  }, [izinList]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setQrSecondsRemaining((prev) => {
        if (prev <= 1) {
          const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
          setActiveQrToken(`SIAS-QR-XI-IPA1-${randomSuffix}`);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Handler Scan QR Berhasil
  const handleSuccessQrScan = (token: string, mapel: string, distanceMeters: number) => {
    const nowTime =
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const newRecord: RiwayatAbsensi = {
      id: `abs-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      hariLabel: 'Hari Ini · Sesi Kelas Aktif',
      mataPelajaran: mapel,
      status: 'hadir',
      waktuScan: nowTime,
      catatan: `Token ${token} terverifikasi · Radius ${distanceMeters}m`,
      jarakGpsMeter: distanceMeters,
    };
    setRiwayatAbsensi((prev) => [newRecord, ...prev]);
    setSiswa((prev) => ({
      ...prev,
      totalHadir: prev.totalHadir + 1,
      persentaseKehadiran: Math.min(100, Number((prev.persentaseKehadiran + 0.2).toFixed(1))),
    }));
    setIsScannerOpen(false);
    setActiveTab('absen');
    showToast(`Absensi ${mapel} berhasil pukul ${nowTime}!`);
  };

  // Handler Submit Izin
  const handleSubmitIzin = (
    payload: Omit<PengajuanIzin, 'id' | 'status' | 'catatanGuru' | 'createdAt'>
  ) => {
    const nowTime =
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const created: PengajuanIzin = {
      ...payload,
      id: `izin-${Date.now()}`,
      status: 'menunggu',
      catatanGuru: null,
      createdAt: `Hari Ini · ${nowTime}`,
    };
    setIzinList((prev) => [created, ...prev]);
    showToast('Pengajuan izin berhasil dikirim!');
  };

  const sudahAbsenHariIni = riwayatAbsensi.length > 0 && riwayatAbsensi[0].status === 'hadir';
  const waktuAbsenHariIni = riwayatAbsensi[0]?.waktuScan || '06:52 WIB';
  const jadwalHariIni = mockJadwalMingguan.filter((j) => j.hari === 'Senin');

  return (
    <div className="min-h-screen bg-[#E2E8F0] text-slate-900 flex flex-col justify-between sm:py-6">
      {/* Mobile-First Super-App Container with Academic Blue Palette */}
      <div className="w-full max-w-[460px] mx-auto bg-[#F8FAFC] sm:rounded-[32px] sm:border sm:border-slate-300 sm:shadow-xl overflow-hidden flex flex-col min-h-screen sm:min-h-[820px] relative">
        {/* Top Header Bar — Academic Royal Blue (#1E40AF -> #2563EB) */}
        <header className="sticky top-0 z-20 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white px-4 pt-3.5 pb-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            {/* Student Identity */}
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={siswa.avatar}
                alt={siswa.nama}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border-2 border-amber-300 shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-sm font-extrabold tracking-tight truncate">
                  Hai, {siswa.panggilan}!
                </h1>
                <p className="text-[11px] text-blue-100 truncate tabular-nums">
                  {siswa.kelas} · {siswa.sekolah}
                </p>
              </div>
            </div>

            {/* Install App Button */}
            <PWAInstallButton compact />
          </div>

          {/* Top Pill Bar — Hanya Button Beranda */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('beranda')}
              className={`min-h-[34px] px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'beranda'
                  ? 'bg-white text-[#1E40AF] shadow-2xs'
                  : 'bg-blue-950/40 text-blue-100 hover:bg-blue-900/60'
              }`}
            >
              Beranda
            </button>
          </div>
        </header>

        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Mode Offline Aktif — Jadwal &amp; Riwayat tetap dapat diakses.</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
          {activeTab === 'beranda' && (
            <BerandaView
              siswa={siswa}
              sudahAbsenHariIni={sudahAbsenHariIni}
              waktuAbsenHariIni={waktuAbsenHariIni}
              jadwalHariIni={jadwalHariIni}
              riwayatAbsensi={riwayatAbsensi}
              izinList={izinList}
              onOpenScanner={() => setIsScannerOpen(true)}
              onSelectFeature={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'absen' && (
            <AbsenDanRiwayatView
              siswa={siswa}
              riwayatAbsensi={riwayatAbsensi}
              sudahAbsenHariIni={sudahAbsenHariIni}
              waktuAbsenHariIni={waktuAbsenHariIni}
              activeQrToken={activeQrToken}
              qrSecondsRemaining={qrSecondsRemaining}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {activeTab === 'izin' && (
            <FiturIzinView
              izinList={izinList}
              onOpenDirectCamera={(cb) => {
                setCameraCallback(() => cb);
                setIsDirectCameraOpen(true);
              }}
              onSubmitIzin={handleSubmitIzin}
            />
          )}

          {activeTab === 'jadwal' && (
            <JadwalPelajaranView jadwalList={mockJadwalMingguan} />
          )}
        </main>

        {/* Bottom Navigation Bar — Academic Blue Active State */}
        <nav
          aria-label="Navigasi Utama Siswa"
          className="fixed sm:sticky bottom-0 left-0 right-0 z-20 h-[64px] bg-white border-t border-slate-200/90 px-3 grid grid-cols-4 items-center max-w-[460px] mx-auto"
        >
          <button
            type="button"
            onClick={() => setActiveTab('beranda')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-2xl transition-colors cursor-pointer ${
              activeTab === 'beranda' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-0.5">Beranda</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('absen')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-2xl transition-colors cursor-pointer ${
              activeTab === 'absen' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-0.5">Absen QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('izin')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-2xl transition-colors cursor-pointer ${
              activeTab === 'izin' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-0.5">Fitur Izin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jadwal')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-2xl transition-colors cursor-pointer ${
              activeTab === 'jadwal' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-0.5">Jadwal</span>
          </button>
        </nav>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-xs w-[90%] rounded-2xl bg-[#1E3A8A] text-white px-4 py-3 shadow-xl flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* Modal 1: Pemindai QR Code Absensi */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        activeQrToken={activeQrToken}
        qrSecondsRemaining={qrSecondsRemaining}
        isWithinSchoolRadius={true}
        schoolDistanceMeters={14}
        isOffline={isOffline}
        onSuccessScan={handleSuccessQrScan}
      />

      {/* Modal 2: Kamera Langsung Surat Dokter */}
      <DirectCameraModal
        isOpen={isDirectCameraOpen}
        onClose={() => setIsDirectCameraOpen(false)}
        studentName={siswa.nama}
        studentClass={siswa.kelas}
        onCaptureComplete={(res) => {
          if (cameraCallback) {
            cameraCallback(res);
          }
        }}
      />
    </div>
  );
}
