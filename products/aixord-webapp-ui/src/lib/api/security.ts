/**
 * AIXORD Web App API Client - Security & CCS
 */

import { request, type DataClassification, type DataClassificationValue, type AIExposureLevel } from './core';

// ============================================================================
// CCS Types (PATCH-CCS-01)
// ============================================================================

export type CCSPhase = 'INACTIVE' | 'DETECT' | 'CONTAIN' | 'ROTATE' | 'INVALIDATE' | 'VERIFY' | 'ATTEST' | 'UNLOCK';
export type CCSIncidentStatus = 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
export type CCSArtifactType = 'CCS-01' | 'CCS-02' | 'CCS-03' | 'CCS-04' | 'CCS-05';
export type CredentialType = 'API_KEY' | 'ACCESS_TOKEN' | 'SECRET_KEY' | 'PASSWORD' | 'OAUTH_TOKEN' | 'DATABASE_CREDENTIAL' | 'ENCRYPTION_KEY' | 'OTHER';
export type ExposureSource = 'VERSION_CONTROL' | 'LOG_FILE' | 'SCREENSHOT' | 'PUBLIC_CHANNEL' | 'THIRD_PARTY_BREACH' | 'SECURITY_AUDIT' | 'OTHER';

export interface CCSIncident {
  id: string;
  projectId: string;
  incidentNumber: string;
  phase: CCSPhase;
  status: CCSIncidentStatus;
  credentialType: CredentialType;
  credentialName: string;
  exposureSource: ExposureSource;
  exposureDescription: string;
  exposureDetectedAt: string;
  impactAssessment: string;
  affectedSystems: string[];
  containCompletedAt?: string;
  rotateCompletedAt?: string;
  invalidateCompletedAt?: string;
  verifyCompletedAt?: string;
  attestCompletedAt?: string;
  unlockCompletedAt?: string;
  attestedBy?: string;
  attestationStatement?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CCSArtifact {
  id: string;
  incidentId: string;
  artifactType: CCSArtifactType;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface CCSVerificationTest {
  id: string;
  incidentId: string;
  testType: 'OLD_REJECTED' | 'NEW_SUCCESS' | 'DEPENDENT_SYSTEM';
  targetSystem: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
  testedBy: string;
  testedAt: string;
}

export interface CCSGateStatus {
  GA_CCS: 0 | 1;
  ccs_phase: CCSPhase;
  incident_id: string | null;
  active_incidents: number;
  blocking: boolean;
  active_incident?: {
    incident_number: string;
    phase: CCSPhase;
    credential_name: string;
    credential_type: CredentialType;
  };
}

// ============================================================================
// CCS API (PATCH-CCS-01)
// ============================================================================

export const ccsApi = {
  /**
   * Get GA:CCS gate status
   */
  async getStatus(projectId: string, token: string): Promise<CCSGateStatus> {
    return request<CCSGateStatus>(
      `/projects/${projectId}/ccs/status`,
      {},
      token
    );
  },

  /**
   * Create a CCS incident (activates GA:CCS gate)
   */
  async createIncident(
    projectId: string,
    data: {
      credentialType: CredentialType;
      credentialName: string;
      exposureSource: ExposureSource;
      exposureDescription: string;
      impactAssessment: string;
      affectedSystems?: string[];
    },
    token: string
  ): Promise<{
    id: string;
    incidentNumber: string;
    phase: CCSPhase;
    status: CCSIncidentStatus;
    gaCcs: number;
    message: string;
  }> {
    const response = await request<{
      id: string;
      incident_number: string;
      phase: CCSPhase;
      status: CCSIncidentStatus;
      ga_ccs: number;
      message: string;
    }>(
      `/projects/${projectId}/ccs/incidents`,
      {
        method: 'POST',
        body: JSON.stringify({
          credential_type: data.credentialType,
          credential_name: data.credentialName,
          exposure_source: data.exposureSource,
          exposure_description: data.exposureDescription,
          impact_assessment: data.impactAssessment,
          affected_systems: data.affectedSystems,
        }),
      },
      token
    );
    return {
      id: response.id,
      incidentNumber: response.incident_number,
      phase: response.phase,
      status: response.status,
      gaCcs: response.ga_ccs,
      message: response.message,
    };
  },

  /**
   * List CCS incidents
   */
  async listIncidents(
    projectId: string,
    token: string,
    status?: CCSIncidentStatus
  ): Promise<{ incidents: CCSIncident[]; total: number }> {
    const query = status ? `?status=${status}` : '';
    const response = await request<{
      incidents: Array<{
        id: string;
        project_id: string;
        incident_number: string;
        phase: CCSPhase;
        status: CCSIncidentStatus;
        credential_type: CredentialType;
        credential_name: string;
        exposure_source: ExposureSource;
        exposure_description: string;
        exposure_detected_at: string;
        impact_assessment: string;
        affected_systems: string[];
        contain_completed_at?: string;
        rotate_completed_at?: string;
        invalidate_completed_at?: string;
        verify_completed_at?: string;
        attest_completed_at?: string;
        unlock_completed_at?: string;
        attested_by?: string;
        attestation_statement?: string;
        created_by: string;
        created_at: string;
        updated_at: string;
        resolved_at?: string;
      }>;
      total: number;
    }>(
      `/projects/${projectId}/ccs/incidents${query}`,
      {},
      token
    );
    return {
      incidents: response.incidents.map(i => ({
        id: i.id,
        projectId: i.project_id,
        incidentNumber: i.incident_number,
        phase: i.phase,
        status: i.status,
        credentialType: i.credential_type,
        credentialName: i.credential_name,
        exposureSource: i.exposure_source,
        exposureDescription: i.exposure_description,
        exposureDetectedAt: i.exposure_detected_at,
        impactAssessment: i.impact_assessment,
        affectedSystems: i.affected_systems || [],
        containCompletedAt: i.contain_completed_at,
        rotateCompletedAt: i.rotate_completed_at,
        invalidateCompletedAt: i.invalidate_completed_at,
        verifyCompletedAt: i.verify_completed_at,
        attestCompletedAt: i.attest_completed_at,
        unlockCompletedAt: i.unlock_completed_at,
        attestedBy: i.attested_by,
        attestationStatement: i.attestation_statement,
        createdBy: i.created_by,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
        resolvedAt: i.resolved_at,
      })),
      total: response.total,
    };
  },

  /**
   * Get incident details
   */
  async getIncident(
    projectId: string,
    incidentId: string,
    token: string
  ): Promise<CCSIncident & { artifacts: CCSArtifact[]; verificationTests: CCSVerificationTest[] }> {
    const response = await request<{
      id: string;
      project_id: string;
      incident_number: string;
      phase: CCSPhase;
      status: CCSIncidentStatus;
      credential_type: CredentialType;
      credential_name: string;
      exposure_source: ExposureSource;
      exposure_description: string;
      exposure_detected_at: string;
      impact_assessment: string;
      affected_systems: string[];
      contain_completed_at?: string;
      rotate_completed_at?: string;
      invalidate_completed_at?: string;
      verify_completed_at?: string;
      attest_completed_at?: string;
      unlock_completed_at?: string;
      attested_by?: string;
      attestation_statement?: string;
      created_by: string;
      created_at: string;
      updated_at: string;
      resolved_at?: string;
      artifacts: Array<{
        id: string;
        incident_id: string;
        artifact_type: CCSArtifactType;
        title: string;
        content: string;
        created_by: string;
        created_at: string;
      }>;
      verification_tests: Array<{
        id: string;
        incident_id: string;
        test_type: 'OLD_REJECTED' | 'NEW_SUCCESS' | 'DEPENDENT_SYSTEM';
        target_system: string;
        expected_result: string;
        actual_result: string;
        passed: boolean;
        tested_by: string;
        tested_at: string;
      }>;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}`,
      {},
      token
    );
    return {
      id: response.id,
      projectId: response.project_id,
      incidentNumber: response.incident_number,
      phase: response.phase,
      status: response.status,
      credentialType: response.credential_type,
      credentialName: response.credential_name,
      exposureSource: response.exposure_source,
      exposureDescription: response.exposure_description,
      exposureDetectedAt: response.exposure_detected_at,
      impactAssessment: response.impact_assessment,
      affectedSystems: response.affected_systems || [],
      containCompletedAt: response.contain_completed_at,
      rotateCompletedAt: response.rotate_completed_at,
      invalidateCompletedAt: response.invalidate_completed_at,
      verifyCompletedAt: response.verify_completed_at,
      attestCompletedAt: response.attest_completed_at,
      unlockCompletedAt: response.unlock_completed_at,
      attestedBy: response.attested_by,
      attestationStatement: response.attestation_statement,
      createdBy: response.created_by,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
      resolvedAt: response.resolved_at,
      artifacts: response.artifacts.map(a => ({
        id: a.id,
        incidentId: a.incident_id,
        artifactType: a.artifact_type,
        title: a.title,
        content: a.content,
        createdBy: a.created_by,
        createdAt: a.created_at,
      })),
      verificationTests: response.verification_tests.map(t => ({
        id: t.id,
        incidentId: t.incident_id,
        testType: t.test_type,
        targetSystem: t.target_system,
        expectedResult: t.expected_result,
        actualResult: t.actual_result,
        passed: t.passed,
        testedBy: t.tested_by,
        testedAt: t.tested_at,
      })),
    };
  },

  /**
   * Update incident phase
   */
  async updatePhase(
    projectId: string,
    incidentId: string,
    phase: CCSPhase,
    token: string
  ): Promise<{
    id: string;
    phase: CCSPhase;
    previousPhase: CCSPhase;
    transitionCompletedAt: string;
    gaCcs: number;
  }> {
    const response = await request<{
      id: string;
      phase: CCSPhase;
      previous_phase: CCSPhase;
      transition_completed_at: string;
      ga_ccs: number;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/phase`,
      {
        method: 'PUT',
        body: JSON.stringify({ phase }),
      },
      token
    );
    return {
      id: response.id,
      phase: response.phase,
      previousPhase: response.previous_phase,
      transitionCompletedAt: response.transition_completed_at,
      gaCcs: response.ga_ccs,
    };
  },

  /**
   * Add CCS artifact
   */
  async addArtifact(
    projectId: string,
    incidentId: string,
    data: {
      artifactType: CCSArtifactType;
      title: string;
      content: string;
    },
    token: string
  ): Promise<{ id: string; artifactType: CCSArtifactType; title: string; createdAt: string }> {
    const response = await request<{
      id: string;
      artifact_type: CCSArtifactType;
      title: string;
      created_at: string;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/artifacts`,
      {
        method: 'POST',
        body: JSON.stringify({
          artifact_type: data.artifactType,
          title: data.title,
          content: data.content,
        }),
      },
      token
    );
    return {
      id: response.id,
      artifactType: response.artifact_type,
      title: response.title,
      createdAt: response.created_at,
    };
  },

  /**
   * Add verification test
   */
  async addVerificationTest(
    projectId: string,
    incidentId: string,
    data: {
      testType: 'OLD_REJECTED' | 'NEW_SUCCESS' | 'DEPENDENT_SYSTEM';
      targetSystem: string;
      expectedResult: string;
      actualResult: string;
      passed: boolean;
    },
    token: string
  ): Promise<{ id: string; testType: string; passed: boolean; testedAt: string }> {
    const response = await request<{
      id: string;
      test_type: string;
      passed: boolean;
      tested_at: string;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/verify`,
      {
        method: 'POST',
        body: JSON.stringify({
          test_type: data.testType,
          target_system: data.targetSystem,
          expected_result: data.expectedResult,
          actual_result: data.actualResult,
          passed: data.passed,
        }),
      },
      token
    );
    return {
      id: response.id,
      testType: response.test_type,
      passed: response.passed,
      testedAt: response.tested_at,
    };
  },

  /**
   * Submit Director attestation (CCS-04)
   */
  async attest(
    projectId: string,
    incidentId: string,
    attestationStatement: string,
    token: string
  ): Promise<{ id: string; attested: boolean; attestedBy: string; attestedAt: string; message: string }> {
    const response = await request<{
      id: string;
      attested: boolean;
      attested_by: string;
      attested_at: string;
      message: string;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/attest`,
      {
        method: 'POST',
        body: JSON.stringify({ attestation_statement: attestationStatement }),
      },
      token
    );
    return {
      id: response.id,
      attested: response.attested,
      attestedBy: response.attested_by,
      attestedAt: response.attested_at,
      message: response.message,
    };
  },

  /**
   * Unlock GA:CCS gate
   */
  async unlock(
    projectId: string,
    incidentId: string,
    token: string
  ): Promise<{
    id: string;
    phase: CCSPhase;
    status: CCSIncidentStatus;
    gaCcs: number;
    message: string;
    unlockedAt: string;
  }> {
    const response = await request<{
      id: string;
      phase: CCSPhase;
      status: CCSIncidentStatus;
      ga_ccs: number;
      message: string;
      unlocked_at: string;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/unlock`,
      { method: 'POST' },
      token
    );
    return {
      id: response.id,
      phase: response.phase,
      status: response.status,
      gaCcs: response.ga_ccs,
      message: response.message,
      unlockedAt: response.unlocked_at,
    };
  },
};

// ============================================================================
// Security API (SPG-01)
// ============================================================================

/**
 * Security Gate status
 */
export interface SecurityGate {
  passed: boolean;
  passedAt?: string;
  required: boolean;
  description: string;
}

/**
 * Security Gates for a project
 */
export interface SecurityGatesStatus {
  projectId: string;
  gates: {
    'GS:DC': SecurityGate;
    'GS:DP': SecurityGate;
    'GS:AC': SecurityGate;
    'GS:AI': SecurityGate;
    'GS:JR': SecurityGate;
    'GS:RT': SecurityGate;
  };
  executionAllowed: boolean;
  reason: string | null;
}

/**
 * AI Exposure validation result
 */
export interface AIExposureValidation {
  allowed: boolean;
  exposureLevel: AIExposureLevel;
  requiresRedaction: boolean;
  blockedReason: string | null;
  logId: string;
  redactionRules: {
    maskPii: boolean;
    maskPhi: boolean;
    maskMinorData: boolean;
  } | null;
}

export const securityApi = {
  /**
   * Get data classification for a project
   */
  async getClassification(projectId: string, token: string): Promise<DataClassification> {
    const response = await request<{
      project_id: string;
      pii: DataClassificationValue;
      phi: DataClassificationValue;
      financial: DataClassificationValue;
      legal: DataClassificationValue;
      minor_data: DataClassificationValue;
      jurisdiction: string;
      regulations: string[];
      ai_exposure: AIExposureLevel;
      declared: boolean;
      declared_by?: string;
      declared_at?: string;
    }>(`/projects/${projectId}/security/classification`, {}, token);

    return {
      projectId: response.project_id,
      pii: response.pii,
      phi: response.phi,
      financial: response.financial,
      legal: response.legal,
      minorData: response.minor_data,
      jurisdiction: response.jurisdiction,
      regulations: response.regulations,
      aiExposure: response.ai_exposure,
      declared: response.declared,
      declaredBy: response.declared_by,
      declaredAt: response.declared_at,
    };
  },

  /**
   * Set data classification for a project (GS:DC gate - L-SPG1)
   */
  async setClassification(
    projectId: string,
    data: {
      pii?: DataClassificationValue;
      phi?: DataClassificationValue;
      financial?: DataClassificationValue;
      legal?: DataClassificationValue;
      minorData?: DataClassificationValue;
      jurisdiction?: string;
      regulations?: string[];
      aiExposure?: AIExposureLevel;
    },
    token: string
  ): Promise<{
    success: boolean;
    classification: Omit<DataClassification, 'projectId' | 'declared' | 'declaredBy' | 'declaredAt'>;
    gatesPassed: string[];
    warnings: string[];
  }> {
    const response = await request<{
      success: boolean;
      classification: {
        pii: DataClassificationValue;
        phi: DataClassificationValue;
        financial: DataClassificationValue;
        legal: DataClassificationValue;
        minor_data: DataClassificationValue;
        jurisdiction: string;
        regulations: string[];
        ai_exposure: AIExposureLevel;
      };
      gates_passed: string[];
      warnings: string[];
    }>(
      `/projects/${projectId}/security/classification`,
      {
        method: 'PUT',
        body: JSON.stringify({
          pii: data.pii,
          phi: data.phi,
          financial: data.financial,
          legal: data.legal,
          minor_data: data.minorData,
          jurisdiction: data.jurisdiction,
          regulations: data.regulations,
          ai_exposure: data.aiExposure,
        }),
      },
      token
    );

    return {
      success: response.success,
      classification: {
        pii: response.classification.pii,
        phi: response.classification.phi,
        financial: response.classification.financial,
        legal: response.classification.legal,
        minorData: response.classification.minor_data,
        jurisdiction: response.classification.jurisdiction,
        regulations: response.classification.regulations,
        aiExposure: response.classification.ai_exposure,
      },
      gatesPassed: response.gates_passed,
      warnings: response.warnings,
    };
  },

  /**
   * Get security gates status for a project
   */
  async getGates(projectId: string, token: string): Promise<SecurityGatesStatus> {
    const response = await request<{
      project_id: string;
      gates: {
        'GS:DC': SecurityGate;
        'GS:DP': SecurityGate;
        'GS:AC': SecurityGate;
        'GS:AI': SecurityGate;
        'GS:JR': SecurityGate;
        'GS:RT': SecurityGate;
      };
      execution_allowed: boolean;
      reason: string | null;
    }>(`/projects/${projectId}/security/gates`, {}, token);

    return {
      projectId: response.project_id,
      gates: response.gates,
      executionAllowed: response.execution_allowed,
      reason: response.reason,
    };
  },

  // ==========================================================================
  // Resource-Level Classification (HANDOFF-CGC-01 GAP-2)
  // ==========================================================================

  /**
   * Classify a resource (SCOPE, DELIVERABLE, MESSAGE, FILE)
   */
  async classifyResource(
    projectId: string,
    data: {
      resourceType: string;
      resourceId: string;
      classification: string;
      classificationReason?: string;
      aiExposureAllowed?: boolean;
      dataResidency?: string;
      retentionPolicy?: string;
    },
    token: string
  ): Promise<{
    success: boolean;
    resourceType: string;
    resourceId: string;
    classification: string;
    aiExposureAllowed: boolean;
    retentionPolicy: string | null;
    retentionExpiresAt: string | null;
  }> {
    const response = await request<{
      success: boolean;
      resource_type: string;
      resource_id: string;
      classification: string;
      ai_exposure_allowed: boolean;
      retention_policy: string | null;
      retention_expires_at: string | null;
    }>(
      `/projects/${projectId}/security/classify`,
      {
        method: 'POST',
        body: JSON.stringify({
          resource_type: data.resourceType,
          resource_id: data.resourceId,
          classification: data.classification,
          classification_reason: data.classificationReason,
          ai_exposure_allowed: data.aiExposureAllowed,
          data_residency: data.dataResidency,
          retention_policy: data.retentionPolicy,
        }),
      },
      token
    );
    return {
      success: response.success,
      resourceType: response.resource_type,
      resourceId: response.resource_id,
      classification: response.classification,
      aiExposureAllowed: response.ai_exposure_allowed,
      retentionPolicy: response.retention_policy,
      retentionExpiresAt: response.retention_expires_at,
    };
  },

  /**
   * List all resource classifications for a project
   */
  async getResourceClassifications(
    projectId: string,
    token: string,
    filters?: { resourceType?: string; classification?: string }
  ): Promise<Array<{
    id: string;
    resourceType: string;
    resourceId: string;
    classification: string;
    classificationReason: string | null;
    aiExposureAllowed: boolean;
    dataResidency: string | null;
    jurisdictionReviewed: boolean;
    retentionPolicy: string | null;
    retentionExpiresAt: string | null;
    classifiedBy: string;
    classifiedAt: string;
  }>> {
    const params = new URLSearchParams();
    if (filters?.resourceType) params.set('resource_type', filters.resourceType);
    if (filters?.classification) params.set('classification', filters.classification);
    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await request<Array<{
      id: string;
      resource_type: string;
      resource_id: string;
      classification: string;
      classification_reason: string | null;
      ai_exposure_allowed: number;
      data_residency: string | null;
      jurisdiction_reviewed: number;
      retention_policy: string | null;
      retention_expires_at: string | null;
      classified_by: string;
      classified_at: string;
    }>>(
      `/projects/${projectId}/security/classifications${query}`,
      {},
      token
    );

    return response.map(item => ({
      id: item.id,
      resourceType: item.resource_type,
      resourceId: item.resource_id,
      classification: item.classification,
      classificationReason: item.classification_reason,
      aiExposureAllowed: item.ai_exposure_allowed === 1,
      dataResidency: item.data_residency,
      jurisdictionReviewed: item.jurisdiction_reviewed === 1,
      retentionPolicy: item.retention_policy,
      retentionExpiresAt: item.retention_expires_at,
      classifiedBy: item.classified_by,
      classifiedAt: item.classified_at,
    }));
  },

  /**
   * Get secret access audit log
   */
  async getSecretAuditLog(
    projectId: string,
    token: string,
    options?: { limit?: number; secretKey?: string }
  ): Promise<Array<{
    id: number;
    secretKey: string;
    accessedBy: string;
    accessedAt: string;
    accessType: string;
    ipAddress: string | null;
    userAgent: string | null;
  }>> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.secretKey) params.set('secret_key', options.secretKey);
    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await request<Array<{
      id: number;
      secret_key: string;
      accessed_by: string;
      accessed_at: string;
      access_type: string;
      ip_address: string | null;
      user_agent: string | null;
    }>>(
      `/projects/${projectId}/security/secrets/audit${query}`,
      {},
      token
    );

    return response.map(item => ({
      id: item.id,
      secretKey: item.secret_key,
      accessedBy: item.accessed_by,
      accessedAt: item.accessed_at,
      accessType: item.access_type,
      ipAddress: item.ip_address,
      userAgent: item.user_agent,
    }));
  },

  /**
   * Validate AI exposure before sending to model
   */
  async validateExposure(
    projectId: string,
    requestId: string,
    token: string
  ): Promise<AIExposureValidation> {
    const response = await request<{
      allowed: boolean;
      exposure_level: AIExposureLevel;
      requires_redaction: boolean;
      blocked_reason: string | null;
      log_id: string;
      redaction_rules: {
        mask_pii: boolean;
        mask_phi: boolean;
        mask_minor_data: boolean;
      } | null;
    }>(
      `/projects/${projectId}/security/validate-exposure`,
      {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId }),
      },
      token
    );

    return {
      allowed: response.allowed,
      exposureLevel: response.exposure_level,
      requiresRedaction: response.requires_redaction,
      blockedReason: response.blocked_reason,
      logId: response.log_id,
      redactionRules: response.redaction_rules ? {
        maskPii: response.redaction_rules.mask_pii,
        maskPhi: response.redaction_rules.mask_phi,
        maskMinorData: response.redaction_rules.mask_minor_data,
      } : null,
    };
  },
};
