import React, { useState } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center justify-center gap-1.5 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-[0.98] transition-all font-bold whitespace-nowrap shrink-0 cursor-pointer shadow-2xs ${
          compact ? 'min-h-[36px] px-3 py-1 text-[11px]' : 'min-h-[40px] px-3.5 py-1.5 text-xs'
        }`}
        title="Install Aplikasi SIAS Siswa"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>{isIOS ? 'Install' : 'Install App'}</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pasang SIAS di HP</h3>
                  <p className="text-xs text-slate-500">Ringan &amp; bisa dibuka tanpa kuota</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 my-4 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <Share2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <p>
                  <strong>1. Buka Menu Browser:</strong> Ketuk tombol <strong>Share</strong> di Safari atau menu titik tiga di Chrome.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <PlusSquare className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <p>
                  <strong>2. Add to Home Screen:</strong> Pilih <strong>&ldquo;Tambahkan ke Layar Utama&rdquo;</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>3. Siap Dipakai:</strong> Jadwal pelajaran &amp; riwayat absen tersimpan otomatis.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full min-h-[44px] rounded-2xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
