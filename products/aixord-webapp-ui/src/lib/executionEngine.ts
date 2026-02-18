/**
 * D4-CHAT Execution Engine
 *
 * Parses AI responses during EXECUTE phase and writes files to the user's
 * linked workspace folder using the File System Access API.
 *
 * Handles:
 * - Code fence parsing with file path headers (```language:path/to/file.ext)
 * - Structured block parsing (SUBMISSION, PROGRESS UPDATE, ESCALATION)
 * - File creation/update in workspace
 * - Backend API updates for assignments
 */

import { fileSystemStorage, createFile, createDirectory } from './fileSystem';
import { api } from './api';

// ============================================================================
// Types
// ============================================================================

export interface FileSpec {
  path: string;
  language: string;
  content: string;
  action: 'create' | 'update';
}

export interface ProgressUpdate {
  assignmentId: string;
  percent: number;
  completed: string;
  next: string;
}

export interface Submission {
  assignmentId: string;
  summary: string;
  evidence: string;
}

export interface Escalation {
  assignmentId: string;
  decisionNeeded: string;
  options: string;
  recommendation: string;
  rationale: string;
}

export interface ParsedResponse {
  fileSpecs: FileSpec[];
  progressUpdates: ProgressUpdate[];
  submissions: Submission[];
  escalations: Escalation[];
}

export interface ExecutionResult {
  filesCreated: string[];
  filesUpdated: string[];
  progressUpdates: number;
  submissions: number;
  escalations: number;
  errors: string[];
}

// ============================================================================
// Execution Engine Class
// ============================================================================

export class ExecutionEngine {
  /**
   * Parse AI response for structured blocks and code fences
   */
  static parseResponse(content: string): ParsedResponse {
    const result: ParsedResponse = {
      fileSpecs: [],
      progressUpdates: [],
      submissions: [],
      escalations: [],
    };

    // Parse code fences with file path headers: ```language:path/to/file.ext
    const codeFenceRegex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
    let match;

    while ((match = codeFenceRegex.exec(content)) !== null) {
      const [, language, path, code] = match;
      result.fileSpecs.push({
        path: path.trim(),
        language: language.trim(),
        content: code.trim(),
        action: 'create', // Default to create; update logic can be added later
      });
    }

    // Parse SUBMISSION blocks
    const submissionRegex = /=== SUBMISSION ===\s*\n([\s\S]*?)\n=== END SUBMISSION ===/g;
    while ((match = submissionRegex.exec(content)) !== null) {
      const blockContent = match[1];
      const assignmentIdMatch = blockContent.match(/assignment_id:\s*(.+)/);
      const summaryMatch = blockContent.match(/summary:\s*(.+)/);
      const evidenceMatch = blockContent.match(/evidence:\s*(.+)/);

      if (assignmentIdMatch && summaryMatch) {
        result.submissions.push({
          assignmentId: assignmentIdMatch[1].trim(),
          summary: summaryMatch[1].trim(),
          evidence: evidenceMatch ? evidenceMatch[1].trim() : '',
        });
      }
    }

    // Parse PROGRESS UPDATE blocks
    const progressRegex = /=== PROGRESS UPDATE ===\s*\n([\s\S]*?)\n=== END PROGRESS UPDATE ===/g;
    while ((match = progressRegex.exec(content)) !== null) {
      const blockContent = match[1];
      const assignmentIdMatch = blockContent.match(/assignment_id:\s*(.+)/);
      const percentMatch = blockContent.match(/percent:\s*(\d+)/);
      const completedMatch = blockContent.match(/completed:\s*(.+)/);
      const nextMatch = blockContent.match(/next:\s*(.+)/);

      if (assignmentIdMatch && percentMatch && completedMatch && nextMatch) {
        result.progressUpdates.push({
          assignmentId: assignmentIdMatch[1].trim(),
          percent: parseInt(percentMatch[1], 10),
          completed: completedMatch[1].trim(),
          next: nextMatch[1].trim(),
        });
      }
    }

    // Parse ESCALATION blocks
    const escalationRegex = /=== ESCALATION ===\s*\n([\s\S]*?)\n=== END ESCALATION ===/g;
    while ((match = escalationRegex.exec(content)) !== null) {
      const blockContent = match[1];
      const assignmentIdMatch = blockContent.match(/assignment_id:\s*(.+)/);
      const decisionNeededMatch = blockContent.match(/decision_needed:\s*(.+)/);
      const optionsMatch = blockContent.match(/options:\s*(.+)/);
      const recommendationMatch = blockContent.match(/recommendation:\s*(.+)/);
      const rationaleMatch = blockContent.match(/rationale:\s*(.+)/);

      if (assignmentIdMatch && decisionNeededMatch) {
        result.escalations.push({
          assignmentId: assignmentIdMatch[1].trim(),
          decisionNeeded: decisionNeededMatch[1].trim(),
          options: optionsMatch ? optionsMatch[1].trim() : '',
          recommendation: recommendationMatch ? recommendationMatch[1].trim() : '',
          rationale: rationaleMatch ? rationaleMatch[1].trim() : '',
        });
      }
    }

    return result;
  }

  /**
   * Write a single file to the workspace
   */
  static async writeFileToWorkspace(
    projectId: string,
    filePath: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get workspace handle from storage
      const linkedFolder = await fileSystemStorage.getHandle(projectId);
      if (!linkedFolder) {
        return {
          success: false,
          error: 'No workspace folder linked for this project',
        };
      }

      // Parse path into directory and filename
      const pathParts = filePath.split(/[\\/]/);
      const filename = pathParts.pop();
      if (!filename) {
        return {
          success: false,
          error: `Invalid file path: ${filePath}`,
        };
      }

      // Navigate/create directory path
      let currentHandle = linkedFolder.handle;
      for (const part of pathParts) {
        if (part && part !== '.') {
          currentHandle = await createDirectory(currentHandle, part);
        }
      }

      // Create/update file
      await createFile(currentHandle, filename, content);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Main entry point: process AI response and execute actions
   */
  static async processResponse(
    content: string,
    projectId: string,
    token: string
  ): Promise<ExecutionResult> {
    const result: ExecutionResult = {
      filesCreated: [],
      filesUpdated: [],
      progressUpdates: 0,
      submissions: 0,
      escalations: 0,
      errors: [],
    };

    // Parse response
    const parsed = this.parseResponse(content);

    // Write files to workspace
    for (const fileSpec of parsed.fileSpecs) {
      const writeResult = await this.writeFileToWorkspace(
        projectId,
        fileSpec.path,
        fileSpec.content
      );

      if (writeResult.success) {
        if (fileSpec.action === 'create') {
          result.filesCreated.push(fileSpec.path);
        } else {
          result.filesUpdated.push(fileSpec.path);
        }
      } else {
        result.errors.push(
          `Failed to write ${fileSpec.path}: ${writeResult.error}`
        );
      }
    }

    // Send progress updates to backend
    for (const progressUpdate of parsed.progressUpdates) {
      try {
        await api.assignments.progress(
          projectId,
          progressUpdate.assignmentId,
          {
            progress_percent: progressUpdate.percent,
            progress_notes: progressUpdate.completed,
            remaining_items: [progressUpdate.next],
          },
          token
        );
        result.progressUpdates++;
      } catch (error) {
        result.errors.push(
          `Failed to update progress for ${progressUpdate.assignmentId}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    // Send submissions to backend
    for (const submission of parsed.submissions) {
      try {
        await api.assignments.submit(
          projectId,
          submission.assignmentId,
          {
            submission_summary: submission.summary,
            submission_evidence: submission.evidence
              ? submission.evidence.split(',').map((e) => e.trim())
              : undefined,
          },
          token
        );
        result.submissions++;
      } catch (error) {
        result.errors.push(
          `Failed to submit ${submission.assignmentId}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    // Track escalations (no backend API call needed, just count them)
    result.escalations = parsed.escalations.length;

    return result;
  }

  /**
   * CRIT-01/CRIT-02 Fix: Write scaffold skeleton BEFORE component files.
   * Fetches the scaffold template from backend and writes infrastructure
   * files (package.json, index.html, etc.) if not already present.
   */
  static async writeScaffoldIfNeeded(
    projectId: string,
    token: string
  ): Promise<{ written: string[]; errors: string[] }> {
    const written: string[] = [];
    const errors: string[] = [];

    try {
      // Check if workspace has a package.json already (skip if scaffold already written)
      const linkedFolder = await fileSystemStorage.getHandle(projectId);
      if (!linkedFolder) return { written, errors };

      try {
        await linkedFolder.handle.getFileHandle('package.json');
        // package.json exists — scaffold already written
        return { written, errors };
      } catch {
        // package.json doesn't exist — proceed with scaffold
      }

      // Fetch scaffold template from backend
      const response = await fetch(
        `${api.getBaseUrl()}/api/v1/projects/${projectId}/scaffold`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        // No scaffold available — not an error, just skip
        return { written, errors };
      }

      const scaffold = await response.json();
      if (!scaffold?.nodes || !Array.isArray(scaffold.nodes)) {
        return { written, errors };
      }

      // Write scaffold nodes
      for (const node of scaffold.nodes) {
        try {
          if (node.type === 'directory') {
            // Create directory recursively
            const parts = node.path.split('/');
            let current = linkedFolder.handle;
            for (const part of parts) {
              if (part) {
                current = await createDirectory(current, part);
              }
            }
          } else if (node.type === 'file' && node.content) {
            // Parse path into directory + filename
            const pathParts = node.path.split('/');
            const filename = pathParts.pop()!;
            let currentHandle = linkedFolder.handle;
            for (const part of pathParts) {
              if (part) {
                currentHandle = await createDirectory(currentHandle, part);
              }
            }
            await createFile(currentHandle, filename, node.content);
            written.push(node.path);
          }
        } catch (err) {
          errors.push(`Scaffold write failed for ${node.path}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      errors.push(`Scaffold fetch failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return { written, errors };
  }

  /**
   * HIGH-03 Fix: Report written files to backend for artifact tracking.
   * Sends metadata (path, hash, size) to the workspace/artifacts endpoint.
   */
  static async reportArtifacts(
    projectId: string,
    files: Array<{ path: string; content: string }>,
    token: string
  ): Promise<void> {
    if (files.length === 0) return;

    try {
      const artifacts = files.map(f => ({
        path: f.path,
        size_bytes: new Blob([f.content]).size,
        file_type: f.path.split('.').pop() || 'unknown',
      }));

      await fetch(
        `${api.getBaseUrl()}/api/v1/projects/${projectId}/workspace/artifacts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ artifacts }),
        }
      );
    } catch {
      // Non-blocking — artifact tracking is best-effort
    }
  }

  /**
   * Process ONLY file deliverables from AI response.
   * Use this in Project.tsx where TDL structured blocks are already
   * handled inline — avoids double-processing submissions/progress/escalations.
   *
   * CRIT-01/CRIT-02 enhancement: Writes scaffold skeleton first if needed.
   */
  static async processFilesOnly(
    content: string,
    projectId: string,
    token?: string
  ): Promise<{ filesCreated: string[]; filesUpdated: string[]; errors: string[]; scaffoldWritten?: string[] }> {
    const result = {
      filesCreated: [] as string[],
      filesUpdated: [] as string[],
      errors: [] as string[],
      scaffoldWritten: [] as string[],
    };

    // Parse code fences with file path headers: ```language:path/to/file.ext
    const codeFenceRegex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
    let match;
    const fileSpecs: FileSpec[] = [];

    while ((match = codeFenceRegex.exec(content)) !== null) {
      const [, language, path, code] = match;
      fileSpecs.push({
        path: path.trim(),
        language: language.trim(),
        content: code.trim(),
        action: 'create',
      });
    }

    if (fileSpecs.length === 0) return result;

    // CRIT-01/CRIT-02: Write scaffold skeleton BEFORE component files
    if (token) {
      const scaffold = await this.writeScaffoldIfNeeded(projectId, token);
      result.scaffoldWritten = scaffold.written;
      if (scaffold.errors.length > 0) {
        result.errors.push(...scaffold.errors);
      }
    }

    // Write component files to workspace
    const writtenFiles: Array<{ path: string; content: string }> = [];
    for (const fileSpec of fileSpecs) {
      const writeResult = await this.writeFileToWorkspace(
        projectId,
        fileSpec.path,
        fileSpec.content
      );

      if (writeResult.success) {
        result.filesCreated.push(fileSpec.path);
        writtenFiles.push({ path: fileSpec.path, content: fileSpec.content });
      } else {
        result.errors.push(
          `Failed to write ${fileSpec.path}: ${writeResult.error}`
        );
      }
    }

    // HIGH-03: Report artifacts to backend for tracking
    if (token && writtenFiles.length > 0) {
      await this.reportArtifacts(projectId, writtenFiles, token);
    }

    return result;
  }
}
