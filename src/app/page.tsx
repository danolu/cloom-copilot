'use client';

import { useState } from 'react';
import { ChatPopover } from '../components/copilot/ChatPopover';
import { CopilotHeader } from '../components/copilot/CopilotHeader';
import { LiveCallOverlay } from '../components/copilot/LiveCallOverlay';
import { RoleSwitcher } from '../components/copilot/RoleSwitcher';
import { ROLE_PRESETS } from '../components/copilot/role-presets';
import { PropertyDashboard } from '../components/dashboard/PropertyDashboard';
import { TooltipProvider } from '../components/ui/Tooltip';
import { useCopilotChat } from '../hooks/useCopilotChat';
import { useLiveCall } from '../hooks/useLiveCall';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useVoiceNote } from '../hooks/useVoiceNote';

export default function CloomCopilotApp() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const { speak } = useTextToSpeech(soundEnabled);
  const chat = useCopilotChat(speak);
  const voiceNote = useVoiceNote({
    role: chat.role,
    handleSend: chat.handleSend,
    addMessage: chat.addMessage,
    addBotResponse: chat.addBotResponse,
  });
  const liveCall = useLiveCall({
    role: chat.role,
    addMessage: chat.addMessage,
    addBotResponse: chat.addBotResponse,
  });

  const activeRoleData = ROLE_PRESETS[chat.role] || ROLE_PRESETS['demo-admin'];

  const submitInput = () => {
    void chat.handleSend(chat.inputText);
    chat.setInputText('');
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="app-shell">
        <CopilotHeader
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          startVoiceCall={liveCall.startVoiceCall}
        />
        <RoleSwitcher role={chat.role} onRoleChange={chat.onRoleChange} onReset={chat.resetDemo} />
        <PropertyDashboard />
        <ChatPopover
          messages={chat.messages}
          isResponding={chat.isResponding || voiceNote.isTranscribing}
          chatEndRef={chat.chatEndRef}
          handleSend={chat.handleSend}
          speak={speak}
          activeRoleData={activeRoleData}
          inputText={chat.inputText}
          setInputText={chat.setInputText}
          isRecording={voiceNote.isRecording}
          toggleRecording={voiceNote.toggleRecording}
          onSubmitInput={submitInput}
        />
        <LiveCallOverlay {...liveCall} />
      </div>
    </TooltipProvider>
  );
}
