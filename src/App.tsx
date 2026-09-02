import { useCallback, useEffect, useRef, useState } from 'react';
import { Globe2, Loader2 } from 'lucide-react';
import GlobeCanvas from '@/components/GlobeCanvas';
import PinModal from '@/components/PinModal';
import PinPopover from '@/components/PinPopover';
import WavyTitle from '@/components/WavyTitle';
import Toast, { type ToastData } from '@/components/Toast';
import SuggestionModal from '@/components/SuggestionModal';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { loadCachedPins, saveCachedPins } from '@/lib/storage';
import { latLngTo3D } from '@/lib/geo';
import type { GlobeComment, PendingCoords, ModalStep } from '@/lib/types';

export default function App() {
  const [pins, setPins] = useState<GlobeComment[]>([]);
  const [selectedPin, setSelectedPin] = useState<GlobeComment | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>('IDLE');
  const [pendingCoords, setPendingCoords] = useState<PendingCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const toastIdRef = useRef(0);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    [],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Load pins on mount ---
  useEffect(() => {
    let cancelled = false;

    async function loadPins() {
      // Always start from cache for instant render
      const cached = loadCachedPins();
      if (cached.length > 0 && !cancelled) {
        setPins(cached);
      }

      if (!hasSupabaseConfig) {
        if (!cancelled) {
          setPins(cached);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('globe_comments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!cancelled && data) {
          const fetched = data as GlobeComment[];
          setPins(fetched);
          saveCachedPins(fetched);
        }
      } catch {
        // Fall back to cached pins — already loaded above
        if (!cancelled) {
          addToast(
            'Could not connect to server. Showing saved pins.',
            'error',
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPins();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  // --- Globe tap → open modal ---
  const handleGlobeTap = useCallback((coords: PendingCoords) => {
    setPendingCoords(coords);
    setSelectedPin(null);
    setModalStep('LOCATION');
  }, []);

  // --- Pin tap → show popover ---
  const handlePinTap = useCallback((pin: GlobeComment) => {
    setSelectedPin(pin);
    setModalStep('IDLE');
    setPendingCoords(null);
  }, []);

  // --- Submit new pin ---
  const handleSubmitPin = useCallback(
    async (
      city: string,
      state: string,
      comment: string,
      lat: number,
      lng: number,
      medicalCenter: string,
      visitDate: string,
      initials: string,
    ) => {
      // Convert geographic coordinates to 3D globe position
      const pos3d = latLngTo3D(lat, lng);

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newPin: GlobeComment = {
        id: tempId,
        created_at: new Date().toISOString(),
        city,
        state,
        comment,
        pos_x: pos3d.x,
        pos_y: pos3d.y,
        pos_z: pos3d.z,
        medical_center: medicalCenter || null,
        visit_date: visitDate || null,
        initials: initials || null,
      };

      // Optimistic update
      setPins((prev) => {
        const updated = [newPin, ...prev];
        saveCachedPins(updated);
        return updated;
      });

      // Close modal
      setModalStep('IDLE');
      setPendingCoords(null);

      // Persist to Supabase
      if (hasSupabaseConfig) {
        try {
          const { data, error } = await supabase
            .from('globe_comments')
            .insert({
              city,
              state,
              comment,
              pos_x: pos3d.x,
              pos_y: pos3d.y,
              pos_z: pos3d.z,
              medical_center: medicalCenter || null,
              visit_date: visitDate || null,
              initials: initials || null,
            })
            .select()
            .single();

          if (error) throw error;

          // Replace temp pin with the real DB record
          if (data) {
            const realPin = data as GlobeComment;
            setPins((prev) => {
              const updated = prev.map((p) =>
                p.id === tempId ? realPin : p,
              );
              saveCachedPins(updated);
              return updated;
            });
          }
          addToast('Pin dropped on the globe!');
        } catch {
          // Pin is saved locally; notify user
          addToast(
            'Saved locally — will sync when back online.',
            'error',
          );
        }
      } else {
        addToast('Pin saved locally.');
      }
    },
    [addToast],
  );

  const handleCancelModal = useCallback(() => {
    setModalStep('IDLE');
    setPendingCoords(null);
  }, []);

  const handleClosePopover = useCallback(() => {
    setSelectedPin(null);
  }, []);

  const controlsEnabled = modalStep === 'IDLE' && !selectedPin && !showSuggestion;

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950 touch-none">
      {/* 3D Globe — z-0 */}
      <GlobeCanvas
        pins={pins}
        onGlobeTap={handleGlobeTap}
        onPinTap={handlePinTap}
        controlsEnabled={controlsEnabled}
      />

      {/* Sky backdrop */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 pointer-events-none" />

      {/* Header overlay — z-10 */}
      <header className="fixed top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="px-5 pt-5 pb-2 flex justify-center">
          <WavyTitle
            lines={['Thank You,', 'Pandemic', 'Healthworkers']}
          />
        </div>
        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-2.5 pointer-events-auto">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-500/15 text-sky-400 backdrop-blur-sm border border-sky-500/20">
              <Globe2 className="w-5 h-5" />
            </div>
            <p className="text-slate-400 text-xs leading-tight">
              {pins.length} pin{pins.length === 1 ? '' : 's'} on the globe
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sky-300 text-xs bg-slate-900/60 backdrop-blur-sm px-3 py-2 rounded-full pointer-events-auto">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading…
            </div>
          )}
        </div>
      </header>

      {/* Hint overlay */}
      {modalStep === 'IDLE' && !selectedPin && !isLoading && !showSuggestion && (
        <div className="fixed bottom-[63px] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-slate-900/70 backdrop-blur-sm text-slate-300 text-xs px-4 py-2 rounded-full border border-slate-700/50 animate-[fadeIn_0.5s_ease-out]">
            Tap the globe to add a healthworker thanks.
          </div>
        </div>
      )}

      {/* Suggestions button */}
      {modalStep === 'IDLE' && !selectedPin && !showSuggestion && (
        <button
          onClick={() => setShowSuggestion(true)}
          className="fixed bottom-6 left-6 z-10 text-xs rounded-lg px-3 py-2 bg-green-500/30 text-blue-900 font-medium border border-green-500/40 hover:bg-green-500/40 transition-colors"
        >
          Suggestions
        </button>
      )}

      {/* Suggestion modal — z-50 */}
      {showSuggestion && (
        <SuggestionModal
          onClose={() => setShowSuggestion(false)}
          onSubmitted={() => {
            setShowSuggestion(false);
            addToast('Suggestion submitted. Thank you!');
          }}
        />
      )}

      {/* Pin popover — z-10 */}
      {selectedPin && <PinPopover pin={selectedPin} onClose={handleClosePopover} />}

      {/* Modal — z-50 */}
      {modalStep !== 'IDLE' && pendingCoords && (
        <PinModal
          pendingCoords={pendingCoords}
          onSubmit={handleSubmitPin}
          onCancel={handleCancelModal}
        />
      )}

      {/* Toasts — z-60 */}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
