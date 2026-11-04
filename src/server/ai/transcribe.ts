import { metaApiBase, metaApiKey, metaConfigured } from './meta-client';
import { oggToWav } from './audio';

export async function transcribeVoice(oggBuffer: Buffer): Promise<string | null> {
  if (!metaConfigured()) return null; // caller falls back to asking for text
  const wav = await oggToWav(oggBuffer);
  const form = new FormData();
  const settings = {
    mode: 'ENDPOINTING',
    model: process.env.META_TRANSCRIBE_MODEL || 'muse-voice-transcribe-1.0',
    audioEncoding: 'WAV',
  };
  form.append('request', new Blob([JSON.stringify(settings)], { type: 'application/json' }));
  form.append('audio', new Blob([new Uint8Array(wav)], { type: 'audio/wav' }), 'voice.wav');
  const res = await fetch(`${metaApiBase()}/asr/transcribe?sessionId=wa-${Date.now()}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${metaApiKey()}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Transcription ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { transcript?: string };
  return json.transcript ?? null;
}
