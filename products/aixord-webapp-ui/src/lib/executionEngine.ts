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
   * Process ONLY file deliverables from AI response.
   * Use this in Project.tsx where TDL structured blocks are already
   * handled inline — avoids double-processing submissions/progress/escalations.
   */
  static async processFilesOnly(
    content: string,
    projectId: string
  ): Promise<{ filesCreated: string[]; filesUpdated: string[]; errors: string[] }> {
    const result = {
      filesCreated: [] as string[],
      filesUpdated: [] as string[],
      errors: [] as string[],
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

    // Write files to workspace
    for (const fileSpec of fileSpecs) {
      const writeResult = await this.writeFileToWorkspace(
        projectId,
        fileSpec.path,
        fileSpec.content
      );

      if (writeResult.success) {
        result.filesCreated.push(fileSpec.path);
      } else {
        result.errors.push(
          `Failed to write ${fileSpec.path}: ${writeResult.error}`
        );
      }
    }

    return result;
  }
}
