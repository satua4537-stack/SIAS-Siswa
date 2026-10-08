import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, RefreshCw, ShieldAlert, Sparkles, X } from 'lucide-react';
import { compressCapturedDocument, CompressedImageResult } from '../../lib/imageCompressor';

interface DirectCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentClass: string;
  onCaptureComplete: (result: CompressedImageResult) => void;
}

export const DirectCameraModal: React.FC<DirectCameraModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentClass,
  onCaptureComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewResult, setPreviewResult] = useState<CompressedImageResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPreviewResult(null);
      setIsCompressing(false);
      return;
    }

    let mediaStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          mediaStream = stream;
          setCameraReady(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setCameraReady(false);
        });
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapturePhoto = async () => {
    setIsCompressing(true);
    setTimeout(async () => {
      const compressed = await compressCapturedDocument(videoRef.current, studentName, studentClass);
      setPreviewResult(compressed);
      setIsCompressing(false);
    }, 550);
  };

  const handleConfirmPhoto = () => {
    if (previewResult) {
      onCaptureComplete(previewResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold">Foto Surat Keterangan Dokter</h2>
          <p className="text-[11px] text-amber-300">
            Kamera Langsung · Kompresi Otomatis &lt; 500 KB
          </p>
        </div>
        <div className="w-11" />
      </div>

      {/* Body / Viewfinder */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
        {!previewResult ? (
          <>
            <div className="relative w-full max-w-xs aspect-[3/4] rounded-3xl overflow-hidden border-2 border-dashed border-[#3B82F6] bg-slate-900 flex flex-col items-center justify-center shadow-2xl">
              {cameraReady ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="p-6 text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/20 text-[#3B82F6] flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-semibold text-white">Posisikan Surat Dokter di Dalam Bingkai</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Pastikan nama siswa, tanggal pemeriksaan, dan tanda tangan dokter terlihat jelas.
                  </p>
                </div>
              )}

              {/* Document Alignment Guide Overlay */}
              <div className="pointer-events-none absolute inset-5 border border-white/40 rounded-2xl flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] font-mono text-blue-200 bg-slate-950/60 px-2 py-1 rounded">
                  <span>KOP KLINIK / RUMAH SAKIT</span>
                  <span>VALIDASI SIAS</span>
                </div>
                <div className="text-[10px] font-mono text-amber-300 bg-slate-950/60 px-2 py-1 rounded self-end">
                  AREA TTD DOKTER
                </div>
              </div>

              {isCompressing && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                  <RefreshCw className="w-9 h-9 text-[#3B82F6] animate-spin mb-3" />
                  <p className="text-xs font-semibold">Mengompresi Gambar (&lt; 500 KB)...</p>
                </div>
              )}
            </div>

            <div className="mt-4 max-w-xs text-center text-xs text-slate-300 flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Foto otomatis dikecilkan agar hemat kuota internet siswa.</span>
            </div>
          </>
        ) : (
          <div className="w-full max-w-xs space-y-3">
            <div className="rounded-3xl overflow-hidden border border-white/20 bg-slate-900 shadow-xl">
              <img
                src={previewResult.dataUrl}
                alt="Preview Surat Dokter"
                referrerPolicy="no-referrer"
                className="w-full h-64 object-contain bg-slate-950"
              />
            </div>

            <div className="rounded-2xl bg-blue-950/60 border border-blue-500/30 p-3.5 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Kompresi Berhasil</span>
                </span>
                <span className="font-mono tabular-nums">-{previewResult.compressionRatioPercent}%</span>
              </div>
              <p className="text-slate-200 tabular-nums">
                Ukuran: <span className="line-through text-slate-400">{previewResult.originalSizeKb} KB</span>{' '}
                &rarr; <strong>{previewResult.compressedSizeKb} KB</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-900 border-t border-white/10">
        {!previewResult ? (
          <button
            type="button"
            onClick={handleCapturePhoto}
            disabled={isCompressing}
            className="w-full max-w-xs mx-auto min-h-[48px] rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Ambil Foto Surat Sekarang</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setPreviewResult(null)}
              className="min-h-[48px] rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer"
            >
              Foto Ulang
            </button>
            <button
              type="button"
              onClick={handleConfirmPhoto}
              className="min-h-[48px] rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gunakan Foto</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
