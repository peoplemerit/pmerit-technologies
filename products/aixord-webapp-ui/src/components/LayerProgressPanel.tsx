/**
 * Layer Progress Panel (Path B: Proactive Debugging)
 *
 * Displays the list of execution layers with their status.
 * Shows progress through the layered execution workflow.
 *
 * Layer Lifecycle:
 * PENDING → ACTIVE → EXECUTED → VERIFIED → LOCKED
 *                       ↓
 *                    FAILED
 */

import { useState } from 'react';
import type { ExecutionLayer, LayerStatus } from '../lib/api';

interface LayerProgressPanelProps {
  layers: ExecutionLayer[];
  isLoading?: boolean;
  onLayerClick?: (layer: ExecutionLayer) => void;
  onStartLayer?: (layerId: string) => void;
  onVerifyLayer?: (layerId: string) => void;
  onFailLayer?: (layerId: string) => void;
  onRetryLayer?: (layerId: string) => void;
}

const statusConfig: Record<LayerStatus, { icon: string; color: string; bg: string; label: string }> = {
  PENDING: {
    icon: '○',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    label: 'Pending',
  },
  ACTIVE: {
    icon: '◉',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    label: 'Active',
  },
  EXECUTED: {
    icon: '◎',
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    label: 'Awaiting Verification',
  },
  VERIFIED: {
    icon: '◉',
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    label: 'Verified',
  },
  LOCKED: {
    icon: '✓',
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    label: 'Locked',
  },
  FAILED: {
    icon: '✗',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    label: 'Failed',
  },
};

export function LayerProgressPanel({
  layers,
  isLoading = false,
  onLayerClick,
  onStartLayer,
  onVerifyLayer,
  onFailLayer,
  onRetryLayer,
}: LayerProgressPanelProps) {
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);

  // Calculate progress
  const lockedCount = layers.filter((l) => l.status === 'LOCKED').length;
  const totalCount = layers.length;

  const handleLayerClick = (layer: ExecutionLayer) => {
    setExpandedLayer(expandedLayer === layer.id ? null : layer.id);
    onLayerClick?.(layer);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Execution Layers</h3>
          <div className="w-20 h-4 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-700/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (layers.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Execution Layers</h3>
        </div>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-gray-400 text-sm">No layers defined yet</p>
          <p className="text-gray-500 text-xs mt-1">
            AI will decompose work into layers during Execute phase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Execution Layers</h3>
        <span className="text-sm text-gray-400">
          {lockedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (lockedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Layer list */}
      <div className="space-y-2">
        {layers.map((layer) => {
          const config = statusConfig[layer.status];
          const isExpanded = expandedLayer === layer.id;

          return (
            <div key={layer.id}>
              {/* Layer row */}
              <button
                onClick={() => handleLayerClick(layer)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${config.bg} hover:brightness-110`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${config.color}`}>{config.icon}</span>
                  <div className="text-left">
                    <div className="text-white text-sm font-medium">
                      Layer {layer.layer_number}: {layer.title}
                    </div>
                    {layer.description && (
                      <div className="text-gray-400 text-xs truncate max-w-[180px]">
                        {layer.description}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-2 p-3 bg-gray-900/50 rounded-lg text-sm space-y-3">
                  {/* Status-specific info */}
                  {layer.status === 'LOCKED' && layer.verified_at && (
                    <div className="flex items-center gap-2 text-green-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Verified {new Date(layer.verified_at).toLocaleString()}</span>
                    </div>
                  )}

                  {layer.status === 'FAILED' && layer.failure_reason && (
                    <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
                      <div className="text-red-400 text-xs font-medium mb-1">Failure Reason:</div>
                      <div className="text-gray-300 text-xs">{layer.failure_reason}</div>
                    </div>
                  )}

                  {/* Expected I/O */}
                  {layer.expected_outputs && (
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Expected Outputs:</div>
                      <div className="text-gray-300 text-xs bg-gray-800/50 p-2 rounded">
                        {typeof layer.expected_outputs === 'object'
                          ? Object.entries(layer.expected_outputs).map(([k, v]) => (
                              <div key={k}>• {String(v)}</div>
                            ))
                          : String(layer.expected_outputs)}
                      </div>
                    </div>
                  )}

                  {layer.actual_outputs && (
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Actual Outputs:</div>
                      <div className="text-gray-300 text-xs bg-gray-800/50 p-2 rounded">
                        {typeof layer.actual_outputs === 'object'
                          ? Object.entries(layer.actual_outputs).map(([k, v]) => (
                              <div key={k}>• {String(v)}</div>
                            ))
                          : String(layer.actual_outputs)}
                      </div>
                    </div>
                  )}

                  {/* Actions based on status */}
                  <div className="flex gap-2 pt-2 border-t border-gray-700/50">
                    {layer.status === 'PENDING' && onStartLayer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartLayer(layer.id);
                        }}
                        className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                      >
                        Start Layer
                      </button>
                    )}

                    {layer.status === 'EXECUTED' && (
                      <>
                        {onVerifyLayer && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onVerifyLayer(layer.id);
                            }}
                            className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
                          >
                            Verify & Lock
                          </button>
                        )}
                        {onFailLayer && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFailLayer(layer.id);
                            }}
                            className="px-3 py-1.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs rounded transition-colors"
                          >
                            Report Issue
                          </button>
                        )}
                      </>
                    )}

                    {layer.status === 'FAILED' && onRetryLayer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetryLayer(layer.id);
                        }}
                        className="flex-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded transition-colors"
                      >
                        Retry Layer
                      </button>
                    )}

                    {layer.status === 'LOCKED' && layer.verification_evidence && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Open evidence viewer
                        }}
                        className="flex-1 px-3 py-1.5 border border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs rounded transition-colors"
                      >
                        View Evidence
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LayerProgressPanel;
