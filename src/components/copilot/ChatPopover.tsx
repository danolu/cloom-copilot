'use client';

import * as Popover from '@radix-ui/react-popover';
import { useEffect, useState, type RefObject } from 'react';
import { FiMessageSquare, FiX } from 'react-icons/fi';
import { Button, IconButton } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Typography } from '../ui/Typography';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import type { RolePreset } from './role-presets';
import { SuggestionChips } from './SuggestionChips';
import type { Message } from './types';

interface ChatPopoverProps {
  messages: Message[];
  isResponding: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
  handleSend: (text: string) => void;
  speak: (text: string) => void;
  activeRoleData: RolePreset;
  inputText: string;
  setInputText: (text: string) => void;
  isRecording: boolean;
  toggleRecording: () => void;
  onSubmitInput: () => void;
}

// The copilot lives in a Radix Popover anchored to a floating trigger, so
// the property dashboard stays on top and visible while chatting.
export function ChatPopover({
  messages,
  isResponding,
  chatEndRef,
  handleSend,
  speak,
  activeRoleData,
  inputText,
  setInputText,
  isRecording,
  toggleRecording,
  onSubmitInput,
}: ChatPopoverProps) {
  const [open, setOpen] = useState(true);
  const [seenCount, setSeenCount] = useState(messages.length);

  // On small screens the popover would cover the whole dashboard, so start
  // closed there; the floating trigger (with its unread badge) opens it.
  useEffect(() => {
    if (window.innerWidth < 760) setOpen(false);
  }, []);

  useEffect(() => {
    if (open) setSeenCount(messages.length);
  }, [open, messages.length]);

  const unread = open ? 0 : Math.max(0, messages.length - seenCount);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="primary"
          className="chat-trigger"
          aria-label={open ? 'Close copilot chat' : 'Open copilot chat'}
        >
          {open ? <FiX aria-hidden /> : <FiMessageSquare aria-hidden />}
          <span>{open ? 'Close' : 'Copilot'}</span>
          {unread > 0 && <span className="chat-unread">{unread}</span>}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="chat-popover"
          side="top"
          align="end"
          sideOffset={14}
          collisionPadding={12}
          aria-label="Cloom Copilot chat"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById('copilot-chat-input')?.focus();
          }}
          // Keep the chat open while the user works the dashboard behind it
          // (switching tabs, refreshing stats). Without this, Radix's
          // outside-dismiss races the trigger's toggle and reopens the popover.
          onInteractOutside={(event) => event.preventDefault()}
          onFocusOutside={(event) => event.preventDefault()}
        >
          <div className="chat-head">
            <div className="chat-head-icon">
              <FiMessageSquare aria-hidden />
            </div>
            <div>
              <Typography variant="h3" as="div">
                Cloom Copilot
              </Typography>
              <Typography variant="caption" tone="muted" as="div" className="chat-head-sub">
                {activeRoleData.name} - {activeRoleData.title}
              </Typography>
            </div>
            <Tooltip label="Close chat">
              <Popover.Close asChild>
                <IconButton aria-label="Close chat">
                  <FiX aria-hidden />
                </IconButton>
              </Popover.Close>
            </Tooltip>
          </div>

          <MessageList
            messages={messages}
            isResponding={isResponding}
            chatEndRef={chatEndRef}
            handleSend={handleSend}
            speak={speak}
          />
          <SuggestionChips activeRoleData={activeRoleData} handleSend={handleSend} />
          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            handleSend={onSubmitInput}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
