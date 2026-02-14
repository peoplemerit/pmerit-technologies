/**
 * EngineeringRibbon Component — AIXORD v4.5 Part XIV (Compact)
 *
 * Compact inline layout showing Part XIV compliance pills.
 * Click a pill to open the engineering detail panel.
 * Compacted for 140px max height detail panel.
 */

import type { EngineeringCompliance } from '../../lib/api';

interface EngineeringRibbonProps {
  compliance?: EngineeringCompliance;
  isLoading?: boolean;
  onOpenPanel?: (section: string) => void;
}

interface CompliancePillProps {
  label: string;
  value: string;
  met: boolean;
  required: boolean;
  onClick?: () => void;
}

function CompliancePill({ label, value, met, required, onClick }: CompliancePillProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors ${
        met
          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
          : required
          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
          : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
      } hover:bg-gray-700/70`}
      title={`${label}: ${value}${required && !met ? ' (required)' : ''}`}
    >
      <span className="font-medium">{label}</span>
      <span className="text-[10px] opacity-75">{value}</span>
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
      <div className="flex items-center py-2">
        <span className="text-gray-400 text-xs">
          {isLoading ? 'Loading...' : 'No compliance data'}
        </span>
      </div>
    );
  }

  const { areas, overall_percentage, required_percentage, summary } = compliance;

  return (
    <div className="space-y-2">
      {/* Row 1: Header + percentages */}
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-xs">Part XIV:</span>
        <span className={`text-xs font-bold ${
          overall_percentage >= 80 ? 'text-green-400' :
          overall_percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {overall_percentage}%
        </span>
        <span className="text-gray-600 text-[10px]">|</span>
        <span className={`text-[10px] ${
          required_percentage >= 80 ? 'text-green-400' :
          required_percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {required_percentage}% req
        </span>
        <span className="text-gray-500 text-[10px] ml-auto truncate max-w-[200px]">{summary}</span>
      </div>

      {/* Row 2: Compliance pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <CompliancePill label="SAR" value={areas.sar?.met ? `${areas.sar.count}` : '—'} met={areas.sar?.met ?? false} required={areas.sar?.required ?? true} onClick={() => onOpenPanel?.('sar')} />
        <CompliancePill label="Contracts" value={`${areas.interface_contracts?.count ?? 0}`} met={areas.interface_contracts?.met ?? false} required={areas.interface_contracts?.required ?? true} onClick={() => onOpenPanel?.('contracts')} />
        <CompliancePill label="Fitness" value={`${areas.fitness_functions?.count ?? 0}`} met={areas.fitness_functions?.met ?? false} required={areas.fitness_functions?.required ?? false} onClick={() => onOpenPanel?.('fitness')} />
        <CompliancePill label="Tests" value={`${areas.integration_tests?.count ?? 0}`} met={areas.integration_tests?.met ?? false} required={areas.integration_tests?.required ?? true} onClick={() => onOpenPanel?.('tests')} />
        <CompliancePill label="Budget" value={`${areas.iteration_budget?.count ?? 0}`} met={areas.iteration_budget?.met ?? false} required={areas.iteration_budget?.required ?? false} onClick={() => onOpenPanel?.('budget')} />
        <CompliancePill label="Ready" value={areas.operational_readiness?.current_level ?? '—'} met={areas.operational_readiness?.met ?? false} required={areas.operational_readiness?.required ?? true} onClick={() => onOpenPanel?.('readiness')} />
        <CompliancePill label="Rollback" value={`${areas.rollback_strategies?.count ?? 0}`} met={areas.rollback_strategies?.met ?? false} required={areas.rollback_strategies?.required ?? true} onClick={() => onOpenPanel?.('rollback')} />
        <CompliancePill label="Alerts" value={`${areas.alert_configurations?.count ?? 0}`} met={areas.alert_configurations?.met ?? false} required={areas.alert_configurations?.required ?? true} onClick={() => onOpenPanel?.('alerts')} />
        <CompliancePill label="Knowledge" value={`${areas.knowledge_transfers?.count ?? 0}`} met={areas.knowledge_transfers?.met ?? false} required={areas.knowledge_transfers?.required ?? false} onClick={() => onOpenPanel?.('knowledge')} />
      </div>
    </div>
  );
}

export default EngineeringRibbon;
