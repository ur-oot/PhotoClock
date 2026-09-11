import React, { useRef } from 'react';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  ariaLabel?: string;
}

interface SegmentedControlProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  ariaLabel: string;
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * WAI-ARIA Radio Group パターンに準拠したアクセシブルなセグメントコントロール。
 * - role="radiogroup" と各項目の role="radio"
 * - aria-checked による選択状態の伝達
 * - 矢印キー（←/→/↑/↓）および Home/End キーによるフォーカス移動・即時切り替え
 * - 選択中項目のみ tabIndex=0 とするキーボードロービングフォーカス
 */
export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
  columns,
  size = 'md',
  className = '',
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cols = columns || (options.length === 2 ? 2 : options.length === 4 ? 4 : 3);
  const gridClass =
    cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3';

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let targetIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = options.length - 1;
    }

    if (targetIndex >= 0) {
      onChange(options[targetIndex].value);
      buttonRefs.current[targetIndex]?.focus();
    }
  };

  const pyClass = size === 'sm' ? 'py-1' : 'py-1.5';

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`w-full grid ${gridClass} bg-stone-100 p-1 rounded-xl border border-stone-200/70 gap-1 ${className}`}
    >
      {options.map((opt, idx) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={opt.ariaLabel || opt.label}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`${pyClass} text-xs font-medium rounded-lg text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 cursor-pointer ${
              isSelected
                ? 'bg-white text-stone-900 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
