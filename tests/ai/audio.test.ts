import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oggToWav } from '../../src/server/ai/audio';

test('WAV audio passes through unchanged (no ffmpeg needed)', async () => {
  const wav = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([0x24, 0x00, 0x00, 0x00]),
    Buffer.from('WAVEfmt ', 'ascii'),
    Buffer.from([0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00]),
  ]);
  const out = await oggToWav(wav);
  assert.equal(out, wav);
});
