/**
 * AIXORD Companion Types
 *
 * Aligned with AIXORD v4.3 baseline (17 gates)
 * v4.3 Update: Added FLD, CIT, CON, DC gates per AIXORD governance spec
 */

export type Phase = 'BRAINSTORM' | 'PLAN' | 'EXECUTE' | 'REVIEW';

export type GateID =
  // SETUP GATES (10-step per v4.3)
  | 'LIC'  // License validated
  | 'DIS'  // Disclaimer accepted
  | 'TIR'  // Platform tier detected
  | 'ENV'  // Environment configured
  | 'FLD'  // Project folder/workspace established (NEW v4.3)
  | 'CIT'  // Citation and source requirements defined (NEW v4.3)
  | 'CON'  // Project constraints and boundaries documented (NEW v4.3)
  | 'OBJ'  // Project objective declared
  | 'RA'   // Reality classification (GREENFIELD/BROWNFIELD)
  | 'DC'   // Data sensitivity classification completed (NEW v4.3)
  // WORK GATES (7)
  | 'FX'   // AIXORD Formula created and bound
  | 'PD'   // Project documentation saved
  | 'PR'   // Plan analysis completed
  | 'BP'   // Blueprint approved and saved
  | 'MS'   // Master scope + DAG confirmed
  | 'VA'   // Evidence/screenshots provided
  | 'HO';  // Handoff document saved

export type GatePhase = 'SETUP' | 'WORK';

export type GateStatus = 'passed' | 'blocked' | 'pending';

export interface GateDefinition {
  name: string;
  description: string;
  phase: GatePhase;
}

export interface GateState {
  id: GateID;
  status: GateStatus;
  passedAt?: string;
}

export interface ProjectState {
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionState {
  phase: Phase;
  gates: Record<GateID, GateStatus>;
  notes: string;
  promptTemplates: PromptTemplate[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  phase: Phase;
  category: 'quick' | 'custom';
}

export interface CompanionState {
  project: ProjectState | null;
  session: SessionState;
  lastSyncedAt: string | null;
}

// AIXORD v4.3 Gate Definitions (17 gates: 10 Setup + 7 Work)
export const GATES: Record<GateID, GateDefinition> = {
  // SETUP GATES (10-step per v4.3)
  LIC: { name: 'License', description: 'Director has accepted governance terms', phase: 'SETUP' },
  DIS: { name: 'Disclosure', description: 'AI limitations and risks acknowledged', phase: 'SETUP' },
  TIR: { name: 'Tier', description: 'Subscription tier selected and validated', phase: 'SETUP' },
  ENV: { name: 'Environment', description: 'Working environment configured', phase: 'SETUP' },
  FLD: { name: 'Folder', description: 'Project folder/workspace established', phase: 'SETUP' },
  CIT: { name: 'Citation', description: 'Citation and source requirements defined', phase: 'SETUP' },
  CON: { name: 'Constraints', description: 'Project constraints and boundaries documented', phase: 'SETUP' },
  OBJ: { name: 'Objective', description: 'Project objective clearly defined', phase: 'SETUP' },
  RA: { name: 'Reality Assessment', description: 'Reality classification completed', phase: 'SETUP' },
  DC: { name: 'Data Classification', description: 'Data sensitivity classification completed', phase: 'SETUP' },

  // WORK GATES (7)
  FX: { name: 'Fix', description: 'Issue or requirement identified for resolution', phase: 'WORK' },
  PD: { name: 'Project Document', description: 'Project document artifact created', phase: 'WORK' },
  PR: { name: 'Progress', description: 'Meaningful progress checkpoint reached', phase: 'WORK' },
  BP: { name: 'Blueprint', description: 'Technical blueprint artifact locked', phase: 'WORK' },
  MS: { name: 'Master Scope', description: 'Master scope artifact approved', phase: 'WORK' },
  VA: { name: 'Validation', description: 'Output validated against requirements', phase: 'WORK' },
  HO: { name: 'Handoff', description: 'Handoff artifact created for transition', phase: 'WORK' },
};

// v4.3: 10 Setup Gates + 7 Work Gates = 17 total
export const GATE_ORDER: GateID[] = [
  'LIC', 'DIS', 'TIR', 'ENV', 'FLD', 'CIT', 'CON', 'OBJ', 'RA', 'DC',
  'FX', 'PD', 'PR', 'BP', 'MS', 'VA', 'HO'
];

export const SETUP_GATES: GateID[] = ['LIC', 'DIS', 'TIR', 'ENV', 'FLD', 'CIT', 'CON', 'OBJ', 'RA', 'DC'];
export const WORK_GATES: GateID[] = ['FX', 'PD', 'PR', 'BP', 'MS', 'VA', 'HO'];

// Legacy export for backward compatibility
export const GATE_LABELS: Record<GateID, string> = Object.fromEntries(
  Object.entries(GATES).map(([id, def]) => [id, def.name])
) as Record<GateID, string>;

// v4.3: Phase requirements include new setup gates
export const PHASE_REQUIRED_GATES: Record<Phase, GateID[]> = {
  BRAINSTORM: ['LIC', 'DIS', 'TIR', 'ENV', 'FLD', 'CIT', 'CON', 'OBJ', 'RA', 'DC'],
  PLAN: ['LIC', 'DIS', 'TIR', 'ENV', 'FLD', 'CIT', 'CON', 'OBJ', 'RA', 'DC', 'FX', 'PD', 'PR'],
  EXECUTE: ['LIC', 'DIS', 'TIR', 'ENV', 'FLD', 'CIT', 'CON', 'OBJ', 'RA', 'DC', 'FX', 'PD', 'PR', 'BP', 'MS'],
  REVIEW: ['LIC', 'DIS', 'TIR', 'ENV', 'FLD', 'CIT', 'CON', 'OBJ', 'RA', 'DC', 'FX', 'PD', 'PR', 'BP', 'MS', 'VA', 'HO'],
};

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'brainstorm-start',
    name: 'Start Brainstorm',
    content: 'I want to brainstorm ideas for: [TOPIC]. Help me explore different angles and approaches.',
    phase: 'BRAINSTORM',
    category: 'quick',
  },
  {
    id: 'plan-outline',
    name: 'Create Plan',
    content: 'Based on our brainstorming, create a structured plan with clear milestones for: [PROJECT].',
    phase: 'PLAN',
    category: 'quick',
  },
  {
    id: 'execute-task',
    name: 'Execute Task',
    content: 'Execute the following task from our plan: [TASK]. Follow the approved specifications.',
    phase: 'EXECUTE',
    category: 'quick',
  },
  {
    id: 'review-check',
    name: 'Review Progress',
    content: 'Review our progress on [PROJECT]. Check against the original objectives and identify any gaps.',
    phase: 'REVIEW',
    category: 'quick',
  },
];

export function createDefaultState(): CompanionState {
  const defaultGates: Record<GateID, GateStatus> = {} as Record<GateID, GateStatus>;
  for (const gate of GATE_ORDER) {
    defaultGates[gate] = 'pending';
  }

  return {
    project: null,
    session: {
      phase: 'BRAINSTORM',
      gates: defaultGates,
      notes: '',
      promptTemplates: [...DEFAULT_PROMPT_TEMPLATES],
    },
    lastSyncedAt: null,
  };
}
