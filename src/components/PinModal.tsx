import { useState, useEffect } from 'react';
import { MapPin, X, ArrowRight, ArrowLeft, Send, Loader2, Building2, Calendar, User } from 'lucide-react';
import { US_STATES } from '@/lib/states';
import { FALLBACK_CITIES_WITH_COORDS, type CityWithCoords } from '@/lib/cities';
import { supabase } from '@/lib/supabase';
import type { PendingCoords } from '@/lib/types';

interface PinModalProps {
  pendingCoords: PendingCoords;
  onSubmit: (
    city: string,
    state: string,
    comment: string,
    lat: number,
    lng: number,
    medicalCenter: string,
    visitDate: string,
    initials: string,
  ) => void;
  onCancel: () => void;
}

const MAX_COMMENT = 200;

type Step = 'LOCATION' | 'MESSAGE' | 'DETAILS';

const STEP_LABELS: Record<Step, string> = {
  LOCATION: 'New Pin · Location',
  MESSAGE: 'New Pin · Add your Thanks',
  DETAILS: 'New Pin · Details',
};

export default function PinModal({
  pendingCoords,
  onSubmit,
  onCancel,
}: PinModalProps) {
  const [step, setStep] = useState<Step>('LOCATION');
  const [city, setCity] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [comment, setComment] = useState('');
  const [medicalCenter, setMedicalCenter] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [initials, setInitials] = useState('');
  const [cities, setCities] = useState<CityWithCoords[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Fetch cities (with lat/lng) for the selected state
  useEffect(() => {
    if (!stateValue) {
      setCities([]);
      return;
    }

    setCity('');
    setCitiesLoading(true);

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('us_cities')
          .select('city, lat, lng')
          .eq('state_code', stateValue)
          .order('city', { ascending: true });

        if (error) throw error;

        if (!cancelled && data && data.length > 0) {
          setCities(data.map((row) => ({ name: row.city, lat: row.lat, lng: row.lng })));
        } else if (!cancelled) {
          setCities(FALLBACK_CITIES_WITH_COORDS[stateValue] ?? []);
        }
      } catch {
        if (!cancelled) {
          setCities(FALLBACK_CITIES_WITH_COORDS[stateValue] ?? []);
        }
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stateValue]);

  const commentValid = comment.trim().length > 0;
  const cityValid = city !== '';
  const stateValid = stateValue !== '';
  const locationValid = cityValid && stateValid;

  const handleNext = () => {
    if (step === 'LOCATION' && locationValid) setStep('MESSAGE');
    else if (step === 'MESSAGE' && commentValid) setStep('DETAILS');
  };

  const handleBack = () => {
    if (step === 'MESSAGE') setStep('LOCATION');
    else if (step === 'DETAILS') setStep('MESSAGE');
  };

  const handleSubmit = () => {
    if (locationValid) {
      const selected = cities.find((c) => c.name === city);
      if (selected) {
        onSubmit(
          city,
          stateValue,
          comment.trim(),
          selected.lat,
          selected.lng,
          medicalCenter.trim(),
          visitDate,
          initials.trim().toUpperCase(),
        );
      }
    }
  };

  const selectedStateLabel =
    US_STATES.find((s) => s.value === stateValue)?.label ?? stateValue;

  const stepIndex: Record<Step, number> = { LOCATION: 0, MESSAGE: 1, DETAILS: 2 };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      style={{ paddingTop: '30px' }}
      onClick={onCancel}
    >
      <div
        className="relative w-full sm:max-w-md bg-slate-900/95 border border-slate-700 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease-out] mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 text-sky-300">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-wide uppercase">
              {STEP_LABELS[step]}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-5 pb-4">
          {(['LOCATION', 'MESSAGE', 'DETAILS'] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                stepIndex[step] >= stepIndex[s] ? 'bg-sky-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Step 1: City & State */}
        {step === 'LOCATION' && (
          <div className="px-5 pb-5 space-y-4">
            <p className="text-slate-300 text-sm">
              Where is this pin? Tell us the city and state.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  State
                </label>
                <select
                  value={stateValue}
                  onChange={(e) => setStateValue(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 text-sm border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select a state…</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  City
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!stateValid || citiesLoading}
                    className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 text-sm border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {citiesLoading
                        ? 'Loading cities…'
                        : !stateValid
                          ? 'Select a state first'
                          : 'Select a city…'}
                    </option>
                    {cities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {citiesLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!locationValid}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Thank-you message */}
        {step === 'MESSAGE' && (
          <div className="px-5 pb-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-sky-500/15 text-sky-300 px-3 py-1.5 rounded-full text-xs font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {city.trim()}, {selectedStateLabel}
            </div>
            <p className="text-slate-300 text-sm">
              Leave a message of gratitude for pandemic healthworkers.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                Add your Thanks
              </label>
              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value.slice(0, MAX_COMMENT))
                }
                placeholder="Leave a message for this spot on the globe…"
                maxLength={MAX_COMMENT}
                rows={5}
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 text-sm border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 outline-none transition-all placeholder:text-slate-500 resize-none"
                autoFocus
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-xs ${
                    comment.length >= MAX_COMMENT - 20
                      ? 'text-amber-400'
                      : 'text-slate-500'
                  }`}
                >
                  {comment.length}/{MAX_COMMENT}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleBack}
                className="py-3 px-4 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!commentValid}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Optional details */}
        {step === 'DETAILS' && (
          <div className="px-5 pb-5 space-y-4">
            {/* Recap */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-sky-500/15 text-sky-300 px-3 py-1.5 rounded-full text-xs font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {city.trim()}, {selectedStateLabel}
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Your message</p>
                <p className="text-slate-200 text-sm leading-relaxed line-clamp-3">{comment.trim()}</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  Medical Center
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={medicalCenter}
                    onChange={(e) => setMedicalCenter(e.target.value.slice(0, 100))}
                    placeholder="e.g. St. Jude Children's Research Hospital"
                    maxLength={100}
                    className="w-full bg-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  Initials
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.slice(0, 5).toUpperCase())}
                    placeholder="e.g. JD"
                    maxLength={5}
                    className="w-full bg-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleBack}
                className="py-3 px-4 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Drop Pin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
