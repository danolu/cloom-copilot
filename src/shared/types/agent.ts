import type { DocumentAttachment } from './hotel';

export interface AgentResponse {
  text: string | null;
  buttons?: Array<{ id: string; title: string }>;
  document?: DocumentAttachment;
  duplicate?: boolean;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface Decision {
  tool?: string;
  args?: Record<string, any>;
  reply?: string;
  // Multi-intent requests: one entry per requested action, in order.
  actions?: Decision[];
}

export interface ToolSchema {
  name: string;
  description: string;
}
