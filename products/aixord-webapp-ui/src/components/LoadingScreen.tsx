/**
 * Branded Loading Screen
 *
 * Displays a spinner with the AIXORD wordmark during lazy-loaded route transitions.
 */

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 gap-4">
      {/* Spinner */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-gray-800" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
      </div>
      {/* Wordmark */}
      <span className="text-violet-400 text-lg font-semibold tracking-wide">AIXORD</span>
    </div>
  );
}

export default LoadingScreen;
