/**
 * EngineeringRibbon Component — AIXORD v4.5 Part XIV
 *
 * Compact horizontal layout showing Part XIV compliance summary cards.
 * Displays: SAR, Contracts, Tests, Budget, Readiness, and overall compliance.
 * Click a card to open the engineering detail panel.
 */

import type { EngineeringCompliance } from '../../lib/api';

interface EngineeringRibbonProps {
  compliance: EngineeringCompliance | null;
  isLoading?: boolean;
  onOpenPanel?: (section?: string) => void;
}

interface ComplianceCardProps {
  label: string;
  value: string;
  met: boolean;
  required: boolean;
  onClick?: () => void;
}

function ComplianceCard({ label, value, met, required, onClick }: ComplianceCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors min-w-[90px] ${
        met
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : required
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-gray-700/50 border-gray-600/50 text-gray-400'
      } hover:bg-gray-700/70`}
    >
      <span className="text-xs font-medium truncate max-w-[80px]">{label}</span>
      <span className="text-sm font-bold">{value}</span>
      {required && !met && (
        <span className="text-[10px] text-red-400">required</span>
      )}
    </button>
  );
}

export function EngineeringRibbon({
  compliance,
  isLoading = false,
  onOpenPanel,
}: EngineeringRibbonProps) {
  if (isLoading || !compliance) {
    return (
      <div className="flex items-center justify-center py-4">
        <span className="text-gray-400 text-sm">
          {isLoading ? 'Loading engineering data...' : 'No compliance data available'}
        </span>
      </div>
    );
  }

  const { areas, overall_percentage, required_percentage, summary } = compliance;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Part XIV Engineering:</span>
          <span className={`text-sm font-bold ${
            overall_percentage >= 80 ? 'text-green-400' :
            overall_percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {overall_percentage}% Overall
          </span>
          <span className="text-gray-600 text-xs">|</span>
          <span className={`text-xs ${
            required_percentage >= 80 ? 'text-green-400' :
            required_percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {required_percentage}% Required
          </span>
        </div>
        <span className="text-gray-500 text-xs">{summary}</span>
      </div>

      {/* Compliance cards */}
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
        <ComplianceCard
          label="SAR"
          value={areas.sar?.met ? `${areas.sar.count}` : 'Missing'}
          met={areas.sar?.met ?? false}
          required={areas.sar?.required ?? true}
          onClick={() => onOpenPanel?.('sar')}
        />
        <ComplianceCard
          label="Contracts"
          value={`${areas.interface_contracts?.count ?? 0}`}
          met={areas.interface_contracts?.met ?? false}
          required={areas.interface_contracts?.required ?? true}
          onClick={() => onOpenPanel?.('contracts')}
        />
        <ComplianceCard
          label="Fitness"
          value={`${areas.fitness_functions?.count ?? 0}`}
          met={areas.fitness_functions?.met ?? false}
          required={areas.fitness_functions?.required ?? false}
          onClick={() => onOpenPanel?.('fitness')}
        />
        <ComplianceCard
          label="Tests"
          value={`${areas.integration_tests?.count ?? 0}`}
          met={areas.integration_tests?.met ?? false}
          required={areas.integration_tests?.required ?? true}
          onClick={() => onOpenPanel?.('tests')}
        />
        <ComplianceCard
          label="Budget"
          value={`${areas.iteration_budget?.count ?? 0}`}
          met={areas.iteration_budget?.met ?? false}
          required={areas.iteration_budget?.required ?? false}
          onClick={() => onOpenPanel?.('budget')}
        />
        <ComplianceCard
          label="Readiness"
          value={areas.operational_readiness?.current_level ?? 'None'}
          met={areas.operational_readiness?.met ?? false}
          required={areas.operational_readiness?.required ?? true}
          onClick={() => onOpenPanel?.('readiness')}
        />
        <ComplianceCard
          label="Rollback"
          value={`${areas.rollback_strategies?.count ?? 0}`}
          met={areas.rollback_strategies?.met ?? false}
          required={areas.rollback_strategies?.required ?? true}
          onClick={() => onOpenPanel?.('rollback')}
        />
        <ComplianceCard
          label="Alerts"
          value={`${areas.alert_configurations?.count ?? 0}`}
          met={areas.alert_configurations?.met ?? false}
          required={areas.alert_configurations?.required ?? true}
          onClick={() => onOpenPanel?.('alerts')}
        />
        <ComplianceCard
          label="Knowledge"
          value={`${areas.knowledge_transfers?.count ?? 0}`}
          met={areas.knowledge_transfers?.met ?? false}
          required={areas.knowledge_transfers?.required ?? false}
          onClick={() => onOpenPanel?.('knowledge')}
        />
      </div>
    </div>
  );
}

export default EngineeringRibbon;
