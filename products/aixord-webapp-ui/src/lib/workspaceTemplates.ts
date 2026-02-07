/**
 * Workspace Folder Templates — AIXORD Governance
 *
 * 4 templates for project scaffold generation.
 * Every template includes the invariant `aixord/` governance directory.
 */

export interface TemplateNode {
  name: string;
  type: 'folder' | 'file';
  content?: string;       // Initial file content (for files only)
  children?: TemplateNode[];
}

export interface FolderTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  structure: TemplateNode[];
}

// Invariant governance directory — present in ALL templates
const aixordGovernanceDir: TemplateNode = {
  name: 'aixord',
  type: 'folder',
  children: [
    {
      name: 'STATE.json',
      type: 'file',
      content: JSON.stringify({
        version: '4.5',
        phase: 'BRAINSTORM',
        gates: {},
        created_at: new Date().toISOString(),
      }, null, 2),
    },
    { name: 'HANDOFF', type: 'folder' },
    { name: 'BLUEPRINT', type: 'folder' },
    { name: 'ARTIFACTS', type: 'folder' },
    { name: 'AUDIT', type: 'folder' },
  ],
};

export const FOLDER_TEMPLATES: FolderTemplate[] = [
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Full-stack web project with source, public assets, tests, and documentation',
    icon: '🌐',
    structure: [
      aixordGovernanceDir,
      { name: 'src', type: 'folder' },
      { name: 'public', type: 'folder' },
      { name: 'tests', type: 'folder' },
      { name: 'docs', type: 'folder' },
      {
        name: 'README.md',
        type: 'file',
        content: '# Project\n\nAIXORD-governed web application.\n',
      },
    ],
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Non-dev project for compliance, legal, or documentation work',
    icon: '📚',
    structure: [
      aixordGovernanceDir,
      { name: 'documents', type: 'folder' },
      { name: 'templates', type: 'folder' },
      { name: 'exports', type: 'folder' },
      {
        name: 'README.md',
        type: 'file',
        content: '# Documentation Project\n\nAIXORD-governed documentation workspace.\n',
      },
    ],
  },
  {
    id: 'general',
    name: 'General',
    description: 'Catch-all structure for any project type',
    icon: '📁',
    structure: [
      aixordGovernanceDir,
      { name: 'workspace', type: 'folder' },
      { name: 'output', type: 'folder' },
      {
        name: 'README.md',
        type: 'file',
        content: '# Project\n\nAIXORD-governed workspace.\n',
      },
    ],
  },
  {
    id: 'user-controlled',
    name: 'User Controlled',
    description: 'Empty workspace — you manage the folder structure yourself',
    icon: '⚡',
    structure: [
      aixordGovernanceDir,
    ],
  },
];

export function getTemplateById(id: string): FolderTemplate | undefined {
  return FOLDER_TEMPLATES.find(t => t.id === id);
}
