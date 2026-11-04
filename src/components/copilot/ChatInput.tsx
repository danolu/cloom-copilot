'use client';

import { FiMic, FiMicOff, FiSend } from 'react-icons/fi';
import { IconButton } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Tooltip } from '../ui/Tooltip';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  isRecording: boolean;
  toggleRecording: () => void;
  handleSend: () => void;
}

export function ChatInput({ inputText, setInputText, isRecording, toggleRecording, handleSend }: ChatInputProps) {
  return (
    <form
      className="chat-input"
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
    >
      <Tooltip label={isRecording ? 'Stop recording voice note' : 'Record voice note'}>
        <IconButton
          size="lg"
          variant={isRecording ? 'danger' : 'secondary'}
          className={isRecording ? 'recording' : undefined}
          onClick={toggleRecording}
          aria-label={isRecording ? 'Stop recording voice note' : 'Record voice note'}
        >
          {isRecording ? <FiMicOff aria-hidden /> : <FiMic aria-hidden />}
        </IconButton>
      </Tooltip>
      <div className="input-wrap">
        <TextField
          id="copilot-chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isRecording ? 'Listening to voice note...' : 'Ask anything, post folio charges, or manage rooms...'
          }
          aria-label="Message the copilot"
          autoComplete="off"
        />
      </div>
      <Tooltip label="Send message">
        <IconButton
          size="lg"
          variant="primary"
          type="submit"
          disabled={!inputText.trim() && !isRecording}
          aria-label="Send message"
        >
          <FiSend aria-hidden />
        </IconButton>
      </Tooltip>
    </form>
  );
}
