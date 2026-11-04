'use client';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useEffect, type RefObject } from 'react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from './types';

interface MessageListProps {
  messages: Message[];
  isResponding: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
  handleSend: (text: string) => void;
  speak: (text: string) => void;
}

export function MessageList({ messages, isResponding, chatEndRef, handleSend, speak }: MessageListProps) {
  // ScrollArea remounts when the popover reopens; land on the latest message.
  // Also re-run when the typing indicator appears so it is never off-screen.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: 'end' });
  }, [chatEndRef, isResponding]);

  return (
    <ScrollArea.Root className="scroll-root" type="hover">
      <ScrollArea.Viewport className="scroll-viewport">
        <div className="message-list">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} handleSend={handleSend} speak={speak} />
          ))}
          {isResponding && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="scrollbar" orientation="vertical">
        <ScrollArea.Thumb className="scroll-thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
