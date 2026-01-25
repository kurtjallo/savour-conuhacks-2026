import { useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search groceries...',
  compact = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && localValue.trim()) {
      onSubmit(localValue.trim());
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${compact ? '' : 'max-w-xl mx-auto'}`}>
      <div className={`absolute inset-y-0 left-0 flex items-center ${compact ? 'pl-4' : 'pl-5'} pointer-events-none`}>
        <svg
          className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-muted`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full text-charcoal bg-white border border-border rounded-full
                   placeholder:text-muted font-ui
                   focus:outline-none focus:ring-2 focus:ring-charcoal/10 focus:border-charcoal/20
                   transition-all duration-200
                   ${compact ? 'py-2 pl-10 pr-9 text-sm' : 'py-4 pl-14 pr-12'}`}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute inset-y-0 right-0 flex items-center ${compact ? 'pr-4' : 'pr-5'} text-muted hover:text-charcoal transition-colors`}
        >
          <svg
            className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
