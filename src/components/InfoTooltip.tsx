import { useState, useRef, useEffect } from 'react';

interface Props {
  text: string;
}

/**
 * A reusable info icon that shows a professional tooltip when clicked.
 * It handles its own visibility and closes when clicking outside.
 */
export function InfoTooltip({ text }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`transition-colors focus:outline-none ${isOpen ? 'text-brand' : 'text-slate-500 hover:text-slate-300'}`}
        aria-label="Información adicional"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl text-xs text-slate-200 leading-relaxed animate-in fade-in zoom-in duration-200 origin-bottom"
          onClick={(e) => e.stopPropagation()}
        >
          {text}
          {/* Triangle / Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-700" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-slate-900 mt-[-1px]" />
        </div>
      )}
    </div>
  );
}
