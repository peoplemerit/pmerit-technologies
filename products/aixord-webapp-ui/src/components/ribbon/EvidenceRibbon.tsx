/**
 * EvidenceRibbon Component (Ribbon-Style Layout)
 *
 * Contains GitHub connection status, recent evidence images,
 * and link to full evidence panel.
 */

interface EvidenceRibbonProps {
  // GitHub
  isConnected: boolean;
  repoOwner?: string | null;
  repoName?: string | null;
  lastSync?: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;

  // Evidence
  recentEvidence?: Array<{
    id: string;
    url: string;
    filename: string;
    evidenceType: string;
  }>;
  onViewAllEvidence?: () => void;
  onImageClick?: (imageId: string) => void;

  isLoading?: boolean;
}

export function EvidenceRibbon({
  isConnected,
  repoOwner,
  repoName,
  lastSync,
  onConnect,
  onDisconnect,
  recentEvidence = [],
  onViewAllEvidence,
  onImageClick,
  isLoading = false,
}: EvidenceRibbonProps) {
  return (
    <div className="flex items-start gap-8">
      {/* GitHub Connection */}
      <div className="min-w-[280px]">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          GitHub
        </h4>
        {isConnected ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div>
                <div className="text-white text-sm font-medium">
                  {repoOwner}/{repoName}
                </div>
                {lastSync && (
                  <div className="text-gray-500 text-xs">
                    Synced {new Date(lastSync).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            {onDisconnect && (
              <button
                onClick={onDisconnect}
                disabled={isLoading}
                className="px-2 py-1 text-xs border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading || !onConnect}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            Connect GitHub
          </button>
        )}
      </div>

      {/* Recent Evidence */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recent Evidence
          </h4>
          {onViewAllEvidence && recentEvidence.length > 0 && (
            <button
              onClick={onViewAllEvidence}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              View All →
            </button>
          )}
        </div>
        {recentEvidence.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto">
            {recentEvidence.slice(0, 6).map((evidence) => (
              <button
                key={evidence.id}
                onClick={() => onImageClick?.(evidence.id)}
                className="w-16 h-16 rounded-lg bg-gray-700/50 border border-gray-600/50 hover:border-violet-500/50 transition-colors overflow-hidden shrink-0"
                title={evidence.filename}
              >
                <img
                  src={evidence.url}
                  alt={evidence.filename}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs">No evidence uploaded yet</p>
        )}
      </div>
    </div>
  );
}

export default EvidenceRibbon;
