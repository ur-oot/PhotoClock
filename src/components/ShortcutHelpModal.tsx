import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { key: 'Space', description: 'Change background photo' },
  { key: 'H', description: 'Zen Hide (pure artwork mode)' },
  { key: 'L', description: 'Add or remove favorite photo' },
  { key: 'T', description: 'Start or pause Zen timer' },
  { key: 'F', description: 'Toggle fullscreen' },
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'Esc', description: 'Close dialog / exit Zen Hide' },
];

export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-6 text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-stone-100 rounded-lg text-stone-700">
              <Keyboard className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-stone-900">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Close shortcuts dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-stone-100/60 transition-colors"
            >
              <span className="text-xs text-stone-600 font-medium">{sc.description}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-stone-700 bg-stone-100 border border-stone-300/80 rounded-md shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200/80 text-center">
          <p className="text-[11px] text-stone-400">
            Press <kbd className="font-mono text-stone-600 font-medium">?</kbd> or <kbd className="font-mono text-stone-600 font-medium">Esc</kbd> anytime to toggle this guide.
          </p>
        </div>
      </div>
    </div>
  );
};
