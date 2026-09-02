import { MapPin, X, Clock, Building2, Calendar, User } from 'lucide-react';
import type { GlobeComment } from '@/lib/types';
import { timeAgo } from '@/lib/time';

interface PinPopoverProps {
  pin: GlobeComment;
  onClose: () => void;
}

export default function PinPopover({ pin, onClose }: PinPopoverProps) {
  const stateLabel = pin.state;

  return (
    <div
      className="fixed inset-0 z-10 animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
    <div
      id="pin-popover"
      className="fixed z-10 bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 animate-[slideUp_0.25s_ease-out]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-sky-400 to-cyan-300" />

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-500/15 text-sky-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">
                  {pin.city}
                </h3>
                <p className="text-slate-400 text-xs">{stateLabel}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-200 text-sm leading-relaxed break-words">
            {pin.comment}
          </p>

          {/* Optional fields */}
          {(pin.medical_center || pin.visit_date || pin.initials) && (
            <div className="space-y-1.5 pt-1 border-t border-slate-700/50">
              {pin.medical_center && (
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{pin.medical_center}</span>
                </div>
              )}
              {pin.visit_date && (
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>
                    {new Date(pin.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {pin.initials && (
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{pin.initials}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo(pin.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
