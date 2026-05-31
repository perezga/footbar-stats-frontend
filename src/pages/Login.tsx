export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-slate-100">Footbar Stats</h1>
        <p className="text-slate-400 mt-2">
          Connect your Footbar account to view your sessions, trends and personal records.
        </p>
        <a
          href="/auth/login"
          className="inline-block mt-8 bg-brand hover:bg-brand/90 text-white font-medium px-6 py-3 rounded-lg"
        >
          Connect Footbar
        </a>
      </div>
    </div>
  );
}
