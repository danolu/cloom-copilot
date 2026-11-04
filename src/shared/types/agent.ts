import type { DocumentAttachment } from './hotel';

export interface AgentResponse {
  text: string | null;
  buttons?: Array<{ id: string; title: string }>;
  document?: DocumentAttachment;
  duplicate?: boolean;
}

export interface Decision {
  tool?: string;
  args?: Record<string, any>;
  reply?: string;
}

export interface ToolSchema {
  name: string;
  description: string;
}
