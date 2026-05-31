import type { MatchType } from '../api/types.js';
import { MATCH_TYPE_LABEL } from '../lib/units.js';

interface Props {
  value: MatchType | undefined;
  onChange: (v: MatchType | undefined) => void;
}

const ORDER: MatchType[] = ['11', 'ss', 'tr', 'ru'];

export function MatchTypeFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={`px-3 py-1 rounded-full text-sm border ${
          value === undefined
            ? 'bg-brand text-white border-brand'
            : 'bg-brand-panel border-slate-700 text-slate-300 hover:border-slate-500'
        }`}
      >
        All
      </button>
      {ORDER.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`px-3 py-1 rounded-full text-sm border ${
            value === t
              ? 'bg-brand text-white border-brand'
              : 'bg-brand-panel border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          {MATCH_TYPE_LABEL[t]}
        </button>
      ))}
    </div>
  );
}
