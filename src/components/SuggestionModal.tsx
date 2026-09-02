import { useState } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';

interface SuggestionModalProps {
  onClose: () => void;
  onSubmitted: () => void;
}

const MAX_TEXT = 500;

export default function SuggestionModal({ onClose, onSubmitted }: SuggestionModalProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const isValid = text.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(false);

    try {
      if (hasSupabaseConfig) {
        const { error: insertError } = await supabase
          .from('suggestions')
          .insert({ text: text.trim() });
        if (insertError) throw insertError;
      }
      onSubmitted();
    } catch {
      setError(true);
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      style={{ paddingTop: '30px' }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-md bg-slate-900/95 border border-slate-700 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-300" />

        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 text-green-300">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-wide uppercase">
              Suggestion
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <p className="text-slate-300 text-sm">
            Share your thoughts, ideas, or feedback about the app.
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
              Your Suggestion
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
              placeholder="Type your suggestion here…"
              maxLength={MAX_TEXT}
              rows={5}
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 text-sm border border-slate-700 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 outline-none transition-all placeholder:text-slate-500 resize-none"
              autoFocus
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  text.length >= MAX_TEXT - 50 ? 'text-amber-400' : 'text-slate-500'
                }`}
              >
                {text.length}/{MAX_TEXT}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs">
              Something went wrong. Please try again.
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
