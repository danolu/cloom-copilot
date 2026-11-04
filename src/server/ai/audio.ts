import { spawn } from 'node:child_process';

// Muse Voice Transcribe: voice note audio -> text.
// Meta's /asr/transcribe only accepts WAV (mono 16-bit PCM, 16/24 kHz);
// Convert incoming audio to target WAV format with ffmpeg first.
export function oggToWav(buffer: Buffer): Promise<Buffer> {
  // Already WAV (browser uploads, test fixtures): Meta accepts it as-is, and
  // ffmpeg - often absent on demo machines - is only needed for OGG/Opus notes.
  if (buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WAVE') {
    return Promise.resolve(buffer);
  }
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      'pipe:0',
      '-ac',
      '1',
      '-ar',
      '24000',
      '-c:a',
      'pcm_s16le',
      '-f',
      'wav',
      'pipe:1',
    ]);
    const out: Buffer[] = [];
    ff.stdout.on('data', (d: Buffer) => out.push(d));
    ff.on('error', () => reject(new Error('ffmpeg not found — needed to convert voice notes')));
    ff.on('close', (code) => (code === 0 ? resolve(Buffer.concat(out)) : reject(new Error(`ffmpeg exited ${code}`))));
    ff.stdin.end(buffer);
  });
}
