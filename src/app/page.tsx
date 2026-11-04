'use client';

import { useState } from 'react';
import { ChatInput } from '../components/copilot/ChatInput';
import { CopilotHeader } from '../components/copilot/CopilotHeader';
import { JudgeDashboard } from '../components/copilot/JudgeDashboard';
import { LiveCallOverlay } from '../components/copilot/LiveCallOverlay';
import { MessageList } from '../components/copilot/MessageList';
import { RoleSwitcher } from '../components/copilot/RoleSwitcher';
import { ROLE_PRESETS } from '../components/copilot/role-presets';
import { SuggestionChips } from '../components/copilot/SuggestionChips';
import { useCopilotChat } from '../hooks/useCopilotChat';
import { useLiveCall } from '../hooks/useLiveCall';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useVoiceNote } from '../hooks/useVoiceNote';

export default function CloomCopilotApp() {
  const [soundEnabled, setSoundEnabled] = useState(true);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <CopilotHeader
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        startVoiceCall={liveCall.startVoiceCall}
      />
      <RoleSwitcher role={chat.role} onRoleChange={chat.onRoleChange} onReset={chat.resetDemo} />
      <JudgeDashboard />
      <MessageList messages={chat.messages} chatEndRef={chat.chatEndRef} handleSend={chat.handleSend} speak={speak} />
      <SuggestionChips activeRoleData={activeRoleData} handleSend={chat.handleSend} />
      <ChatInput
        inputText={chat.inputText}
        setInputText={chat.setInputText}
        isRecording={voiceNote.isRecording}
        toggleRecording={voiceNote.toggleRecording}
        handleSend={submitInput}
      />
      <LiveCallOverlay {...liveCall} />
    </div>
  );
}
