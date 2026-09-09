import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  ariaLabel,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none p-0.5 cursor-pointer flex items-center shrink-0 ${
      checked ? 'bg-stone-900' : 'bg-stone-300'
    }`}
  >
    <span
      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);
