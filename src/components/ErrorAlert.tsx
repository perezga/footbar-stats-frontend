interface Props {
  error: unknown;
  onRetry?: () => void;
}

/** Shared error line for failed queries/mutations, with an optional retry. */
export function ErrorAlert({ error, onRetry }: Props) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex items-center gap-3 text-sm text-red-400">
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-2 py-0.5 rounded-md border border-red-900 hover:border-red-500"
        >
          Retry
        </button>
      )}
    </div>
  );
}
