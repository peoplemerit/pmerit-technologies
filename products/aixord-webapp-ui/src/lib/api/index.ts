/**
 * AIXORD Web App API Client - Barrel Export
 *
 * Central re-export for backward compatibility
 */

// Core exports
export * from './core';

// Auth
export * from './auth';

// Projects & State
export * from './projects';

// Messaging
export * from './messaging';

// Workflow
export * from './workflow';

// Billing
export * from './billing';

// Engineering & Blueprint
export * from './engineering';

// Security & CCS
export * from './security';

// Evidence & Knowledge
export * from './evidence-knowledge';

// Media, Sessions, Workspace, Continuity, Usage
export * from './media';

// Combined API object for convenience
import { authApi } from './auth';
import { projectsApi, stateApi } from './projects';
import { messagesApi, routerApi } from './messaging';
import { brainstormApi, assignmentsApi, decisionsApi } from './workflow';
import { billingApi } from './billing';
import { engineeringApi, blueprintApi } from './engineering';
import { securityApi, ccsApi } from './security';
import { githubApi, evidenceApi, knowledgeApi } from './evidence-knowledge';
import { imageApi, layersApi, sessionsApi, workspaceApi, continuityApi, usageApi } from './media';

export const api = {
  auth: authApi,
  projects: projectsApi,
  state: stateApi,
  decisions: decisionsApi,
  messages: messagesApi,
  router: routerApi,
  billing: billingApi,
  github: githubApi,
  evidence: evidenceApi,
  knowledge: knowledgeApi,
  ccs: ccsApi,
  security: securityApi,
  usage: usageApi,
  images: imageApi,
  layers: layersApi,
  sessions: sessionsApi,
  engineering: engineeringApi,
  blueprint: blueprintApi,
  workspace: workspaceApi,
  continuity: continuityApi,
  brainstorm: brainstormApi,
  assignments: assignmentsApi,
};

export default api;
