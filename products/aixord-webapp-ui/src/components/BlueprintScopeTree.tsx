/**
 * BlueprintScopeTree — Recursive tree view of Scopes → Sub-Scopes → Deliverables
 * Uses CollapsibleSection for nesting. Shows status indicators and delete buttons.
 */

import { useState } from 'react';
import type { BlueprintScope, BlueprintDeliverable } from '../lib/api';

interface BlueprintScopeTreeProps {
  scopes: BlueprintScope[];
  deliverables: BlueprintDeliverable[];
  onDeleteScope?: (scopeId: string) => void;
  onDeleteDeliverable?: (deliverableId: string) => void;
  onSelectScope?: (scope: BlueprintScope) => void;
  onSelectDeliverable?: (deliverable: BlueprintDeliverable) => void;
}

const statusColors: Record<string, string> = {
  DRAFT: 'text-gray-400',
  ACTIVE: 'text-blue-400',
  READY: 'text-cyan-400',
  IN_PROGRESS: 'text-yellow-400',
  COMPLETE: 'text-green-400',
  DONE: 'text-green-400',
  VERIFIED: 'text-emerald-400',
  LOCKED: 'text-purple-400',
  BLOCKED: 'text-red-400',
  CANCELLED: 'text-gray-600',
};

function DoDBadge({ deliverable }: { deliverable: BlueprintDeliverable }) {
  const hasEvidence = !!deliverable.dod_evidence_spec;
  const hasVerification = !!deliverable.dod_verification_method;
  const complete = hasEvidence && hasVerification;

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${complete ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
      DoD {complete ? '✓' : `${(hasEvidence ? 1 : 0) + (hasVerification ? 1 : 0)}/2`}
    </span>
  );
}

function DeliverableItem({
  deliverable,
  onDelete,
  onSelect,
}: {
  deliverable: BlueprintDeliverable;
  onDelete?: (id: string) => void;
  onSelect?: (d: BlueprintDeliverable) => void;
}) {
  const deps = JSON.parse(deliverable.upstream_deps || '[]') as string[];

  return (
    <div
      className="flex items-center justify-between py-1.5 px-3 hover:bg-gray-700/30 rounded cursor-pointer group"
      onClick={() => onSelect?.(deliverable)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-gray-500 text-xs">◆</span>
        <span className="text-sm text-gray-200 truncate">{deliverable.name}</span>
        <span className={`text-[10px] ${statusColors[deliverable.status] || 'text-gray-400'}`}>
          {deliverable.status}
        </span>
        <DoDBadge deliverable={deliverable} />
        {deps.length > 0 && (
          <span className="text-[10px] text-gray-500">↑{deps.length}</span>
        )}
      </div>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(deliverable.id); }}
          className="text-red-400/0 group-hover:text-red-400/70 hover:text-red-400 text-xs px-1"
        >
          ×
        </button>
      )}
    </div>
  );
}

function ScopeNode({
  scope,
  childScopes,
  deliverables,
  allScopes,
  allDeliverables,
  onDeleteScope,
  onDeleteDeliverable,
  onSelectScope,
  onSelectDeliverable,
  depth,
}: {
  scope: BlueprintScope;
  childScopes: BlueprintScope[];
  deliverables: BlueprintDeliverable[];
  allScopes: BlueprintScope[];
  allDeliverables: BlueprintDeliverable[];
  onDeleteScope?: (id: string) => void;
  onDeleteDeliverable?: (id: string) => void;
  onSelectScope?: (s: BlueprintScope) => void;
  onSelectDeliverable?: (d: BlueprintDeliverable) => void;
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const scopeDeliverables = deliverables.filter(d => d.scope_id === scope.id);
  const totalItems = childScopes.length + scopeDeliverables.length;

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-gray-700/50 pl-2' : ''}>
      <div
        className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-700/30 rounded cursor-pointer group"
        onClick={() => onSelectScope?.(scope)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            className="text-gray-400 text-xs w-4"
          >
            {totalItems > 0 ? (isOpen ? '▾' : '▸') : '·'}
          </button>
          <span className={`text-xs px-1 rounded ${scope.tier === 1 ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {scope.tier === 1 ? 'S' : 'SS'}
          </span>
          <span className="text-sm text-gray-200 truncate">{scope.name}</span>
          <span className={`text-[10px] ${statusColors[scope.status] || 'text-gray-400'}`}>
            {scope.status}
          </span>
          {scope.assumption_status === 'UNKNOWN' && (
            <span className="text-[10px] px-1 rounded bg-red-500/20 text-red-400">⚠ UNKNOWN</span>
          )}
          <span className="text-[10px] text-gray-500">({scopeDeliverables.length})</span>
        </div>
        {onDeleteScope && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteScope(scope.id); }}
            className="text-red-400/0 group-hover:text-red-400/70 hover:text-red-400 text-xs px-1"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div className="ml-2">
          {/* Child scopes */}
          {childScopes.map(child => (
            <ScopeNode
              key={child.id}
              scope={child}
              childScopes={allScopes.filter(s => s.parent_scope_id === child.id)}
              deliverables={allDeliverables}
              allScopes={allScopes}
              allDeliverables={allDeliverables}
              onDeleteScope={onDeleteScope}
              onDeleteDeliverable={onDeleteDeliverable}
              onSelectScope={onSelectScope}
              onSelectDeliverable={onSelectDeliverable}
              depth={depth + 1}
            />
          ))}
          {/* Deliverables */}
          {scopeDeliverables.map(d => (
            <DeliverableItem
              key={d.id}
              deliverable={d}
              onDelete={onDeleteDeliverable}
              onSelect={onSelectDeliverable}
            />
          ))}
          {totalItems === 0 && (
            <div className="text-xs text-gray-500 py-1 px-6 italic">No deliverables</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BlueprintScopeTree({
  scopes,
  deliverables,
  onDeleteScope,
  onDeleteDeliverable,
  onSelectScope,
  onSelectDeliverable,
}: BlueprintScopeTreeProps) {
  const rootScopes = scopes.filter(s => s.tier === 1 && !s.parent_scope_id);

  if (rootScopes.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <div className="text-2xl mb-2">📋</div>
        <div className="text-sm">No scopes yet. Add a scope to start building your blueprint.</div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rootScopes.map(scope => (
        <ScopeNode
          key={scope.id}
          scope={scope}
          childScopes={scopes.filter(s => s.parent_scope_id === scope.id)}
          deliverables={deliverables}
          allScopes={scopes}
          allDeliverables={deliverables}
          onDeleteScope={onDeleteScope}
          onDeleteDeliverable={onDeleteDeliverable}
          onSelectScope={onSelectScope}
          onSelectDeliverable={onSelectDeliverable}
          depth={0}
        />
      ))}
    </div>
  );
}
