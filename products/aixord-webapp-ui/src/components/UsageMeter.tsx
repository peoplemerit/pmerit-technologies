/**
 * Usage Meter Component (H2)
 *
 * Displays usage progress bar with warning colors
 * Per HANDOFF-D4-COMPREHENSIVE-V12
 */

interface UsageMeterProps {
  used: number;
  limit: number;
  label?: string;
}

export function UsageMeter({ used, limit, label = 'Requests' }: UsageMeterProps) {
  const percentage = Math.min(100, (used / limit) * 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-gray-300'}>
          {used} / {limit}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-purple-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
