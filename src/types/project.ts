import { Workflow } from './workflow';
import { FrameworkType } from './framework';

export type ProjectStatus = 'draft' | 'in-progress' | 'completed' | 'archived';

export type CollaboratorRole = 'owner' | 'editor' | 'viewer' | 'commenter';

export interface Collaborator {
  id: string;
  email: string;
  name?: string;
  role: CollaboratorRole;
  invitedAt: Date;
  acceptedAt?: Date;
  lastActiveAt?: Date;
}

export interface ProjectMetadata {
  createdAt: Date;
  modifiedAt: Date;
  totalPromptsGenerated: number;
  frameworksUsed: FrameworkType[];
  totalWorkflows: number;
  completedWorkflows: number;
  estimatedDuration: string;
  actualDuration?: string;
  tags: string[];
  category?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner: {
    id: string;
    email: string;
    name?: string;
  };
  collaborators: Collaborator[];
  workflows: Workflow[];
  metadata: ProjectMetadata;
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    requireApproval: boolean;
    exportFormats: ('pdf' | 'csv' | 'json')[];
  };
  context: {
    businessGoals: string[];
    targetAudience: string;
    constraints: string[];
    resources: string[];
  };
}

export interface ProjectComment {
  id: string;
  projectId: string;
  workflowId?: string;
  stageId?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  content: string;
  createdAt: Date;
  modifiedAt?: Date;
  replies?: ProjectComment[];
  resolved: boolean;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  description: string;
  createdAt: Date;
  createdBy: string;
  changes: {
    type: 'workflow_added' | 'workflow_modified' | 'workflow_deleted' | 'settings_changed';
    description: string;
    entityId?: string;
  }[];
}