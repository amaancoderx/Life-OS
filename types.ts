
export type ImageSize = '1K' | '2K' | '4K';

export enum IndustryMode {
  ACADEMIC = 'STUDENT',
  ECOMMERCE = 'BUSINESS',
  CREATIVE = 'DESIGN',
  GENERAL = 'LIFE'
}

export interface ReasoningStep {
  thought: string;
  action: string;
}

export interface AgentPlan {
  goalSummary: string;
  reasoningSteps: ReasoningStep[];
  finalStrategy: string;
  potentialRisks: string[];
}

export interface DiagnosticResult {
  systemOverview: string;
  failureLoop: {
    name: string;
    stages: string[];
    triggerPoints: string[];
  };
  minimalChange: string;
  brutalTruth: string;
}

export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  AGENT = 'STRATEGIST',
  VISUALIZER = 'VISUALIZER',
  VOICE_INTERFACE = 'VOICE'
}

export type IngestionType = 'TASK' | 'EVENT' | 'NOTE' | 'ACTION' | 'SALES' | 'INVENTORY' | 'CRM' | 'UNKNOWN';

export interface IngestedItem {
  id: string;
  type: IngestionType;
  content: string;
  timestamp: number;
  mode: IndustryMode;
  metadata?: {
    deadline?: string;
    priority?: 'LOW' | 'MED' | 'HIGH';
    tags?: string[];
  };
}

export interface DailyBrief {
  schedule: string[];
  bigWin: string;
  creativeTip: string;
}
