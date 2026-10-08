import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Flashlight,
  MapPin,
  X,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  RefreshCw,
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeQrToken: string;
  qrSecondsRemaining: number;
  isWithinSchoolRadius: boolean;
  schoolDistanceMeters: number;
  isOffline: boolean;
  onSuccessScan: (token: string, mapel: string, distanceMeters: number) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  activeQrToken,
  qrSecondsRemaining,
  isWithinSchoolRadius,
  schoolDistanceMeters,
  isOffline,
  onSuccessScan,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanState, setScanState] = useState<'scanning' | 'verifying' | 'success' | 'error_expired'>('scanning');
  const [selectedClassSubject, setSelectedClassSubject] = useState('Matematika Lanjut · Pak Ahmad Fauzi');
  const [scanTimestamp, setScanTimestamp] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setScanState('scanning');
      setFlashOn(false);
      return;
    }

    let stream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
          stream = mediaStream;
          setCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch(() => {
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerValidScan = () => {
    if (isOffline) return;
    setScanState('verifying');
    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      setScanTimestamp(nowStr);
      setScanState('success');
      setTimeout(() => {
        onSuccessScan(activeQrToken, selectedClassSubject.split(' · ')[0], schoolDistanceMeters);
      }, 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Tutup Pemindai QR"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold tracking-tight">Scan QR Absensi Kelas</h2>
          <p className="text-[11px] text-slate-300 tabular-nums">
            Token aktif ({qrSecondsRemaining} detik)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFlashOn((prev) => !prev)}
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl transition-colors cursor-pointer ${
            flashOn ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-200 hover:bg-white/20'
          }`}
          title="Nyalakan / Matikan Senter"
        >
          <Flashlight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Camera Viewfinder */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-5 overflow-hidden">
        {flashOn && (
          <div className="pointer-events-none absolute inset-0 bg-amber-100/15 transition-opacity" />
        )}

        {/* Geofencing Status Bar */}
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-200 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-full border border-white/15">
          <MapPin className={`w-4 h-4 shrink-0 ${isWithinSchoolRadius ? 'text-amber-400' : 'text-rose-400'}`} />
          <span className="tabular-nums">
            Radius Sekolah Valid · {schoolDistanceMeters}m dari ruang kelas
          </span>
        </div>

        {/* Viewfinder Box */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 border-white/30 bg-slate-900 shadow-2xl flex items-center justify-center">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <QrCode className="w-20 h-20 text-[#3B82F6] mb-3" />
              <p className="text-xs font-medium text-slate-200">
                Arahkan kamera ke QR Code di Proyektor Guru
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1 tabular-nums">
                {activeQrToken}
              </p>
            </div>
          )}

          {/* Corner Framing Brackets */}
          <div className="pointer-events-none absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
          <div className="pointer-events-none absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
          <div className="pointer-events-none absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
          <div className="pointer-events-none absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

          {/* Moving Scanline */}
          {scanState === 'scanning' && (
            <div className="pointer-events-none absolute top-5 left-5 right-5 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#FBBF24] animate-scanline" />
          )}

          {/* Verifying State Overlay */}
          {scanState === 'verifying' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4">
              <RefreshCw className="w-10 h-10 text-[#3B82F6] animate-spin mb-2" />
              <p className="text-xs font-semibold">Memvalidasi QR Code Absensi...</p>
            </div>
          )}

          {/* Success State Overlay */}
          {scanState === 'success' && (
            <div className="absolute inset-0 bg-[#1E3A8A]/95 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center">
              <CheckCircle2 className="w-14 h-14 text-amber-400 mb-2" />
              <h3 className="text-base font-bold text-white">Absensi Berhasil!</h3>
              <p className="text-xs text-blue-100 mt-1 tabular-nums">
                Tercatat Hadir pukul {scanTimestamp}
              </p>
              <p className="text-[11px] text-blue-200 mt-1">{selectedClassSubject}</p>
            </div>
          )}

          {/* Expired QR Error State */}
          {scanState === 'error_expired' && (
            <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center">
              <AlertTriangle className="w-12 h-12 text-rose-500 mb-2" />
              <h3 className="text-sm font-bold text-white">QR Code Tidak Valid</h3>
              <p className="text-xs text-rose-200 mt-1">
                Pastikan QR proyektor masih aktif dan coba lagi.
              </p>
              <button
                type="button"
                onClick={() => setScanState('scanning')}
                className="mt-3 min-h-[40px] px-4 py-1.5 rounded-xl bg-white text-rose-900 text-xs font-bold cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Class Session Selector */}
        <div className="w-full max-w-xs mt-5">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Pilih Mata Pelajaran Saat Ini:
          </label>
          <select
            value={selectedClassSubject}
            onChange={(e) => setSelectedClassSubject(e.target.value)}
            className="w-full min-h-[44px] rounded-2xl bg-white/10 border border-white/20 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2563EB]"
          >
            <option value="Matematika Lanjut · Pak Ahmad Fauzi" className="text-slate-900">
              07:00 - 08:30 · Matematika Lanjut
            </option>
            <option value="Fisika · Pak Hendra Wijaya" className="text-slate-900">
              08:30 - 10:00 · Fisika
            </option>
            <option value="Bahasa Indonesia · Bu Siti Aminah" className="text-slate-900">
              10:15 - 11:45 · Bahasa Indonesia
            </option>
            <option value="Kimia · Bu Ratna Dewi" className="text-slate-900">
              12:30 - 14:00 · Kimia
            </option>
          </select>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="p-4 bg-slate-900 border-t border-white/10">
        <div className="max-w-xs mx-auto">
          <button
            type="button"
            onClick={triggerValidScan}
            disabled={scanState === 'verifying' || scanState === 'success'}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Pindai QR Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
