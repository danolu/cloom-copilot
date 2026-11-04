import type { DocumentAttachment } from '../../shared/types/hotel';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  isVoice?: boolean;
  buttons?: Array<{ id: string; title: string }>;
  document?: DocumentAttachment;
}
