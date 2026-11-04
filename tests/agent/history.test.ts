import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { createAgent, HISTORY_LIMIT } from '../../src/server/agent/agent';
import type { ChatTurn, Decision, ToolSchema } from '../../src/shared/types/agent';

const admin = 'demo-admin';
const manager = 'demo-manager';

test('decider receives prior turns so "do the same for 205" resolves', async () => {
  const seenHistories: ChatTurn[][] = [];
  const decide = async (text: string, _schemas: ToolSchema[], history: ChatTurn[]): Promise<Decision> => {
    seenHistories.push([...history]);
    if (text.includes('same for 205')) {
      const prior = history.map((h) => h.content).join(' ');
      if (prior.includes('204')) return { tool: 'update_room_status', args: { room: '205', status: 'clean' } };
      return { reply: 'For which room?' };
    }
    return { tool: 'update_room_status', args: { room: '204', status: 'clean' } };
  };
  const hotel = createHotel();
  const agent = createAgent(hotel, { decide });

  await agent.handle(admin, 'mark room 204 clean', null);
  await agent.handle(admin, 'confirm', null);
  const ask = await agent.handle(admin, 'do the same for 205', null);
  assert.match(ask.text!, /205/);
  await agent.handle(admin, 'confirm', null);

  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'clean');
  assert.equal(hotel.state.rooms.find((r) => r.number === '205')!.status, 'clean');
  // The follow-up decision was made with the first request in its history.
  assert.ok(seenHistories[1].some((h) => h.role === 'user' && h.content.includes('204')));
});

test('history window is capped at HISTORY_LIMIT messages', async () => {
  const lengths: number[] = [];
  const decide = async (_text: string, _schemas: ToolSchema[], history: ChatTurn[]): Promise<Decision> => {
    lengths.push(history.length);
    return { tool: 'get_dashboard', args: {} };
  };
  const agent = createAgent(createHotel(), { decide });
  for (let i = 0; i < 10; i++) await agent.handle(admin, `dashboard request ${i}`, null);

  assert.ok(Math.max(...lengths) <= HISTORY_LIMIT);
  assert.equal(lengths[lengths.length - 1], HISTORY_LIMIT);
  const turns = agent.history.get(admin)!;
  assert.equal(turns.length, HISTORY_LIMIT);
  assert.match(turns[turns.length - 2].content, /dashboard request 9/);
});

test('history is kept per staff member, not shared across users', async () => {
  const seenHistories: ChatTurn[][] = [];
  const decide = async (_text: string, _schemas: ToolSchema[], history: ChatTurn[]): Promise<Decision> => {
    seenHistories.push([...history]);
    return { tool: 'get_dashboard', args: {} };
  };
  const agent = createAgent(createHotel(), { decide });
  await agent.handle(admin, 'dashboard please', null);
  await agent.handle(manager, 'dashboard please', null);

  assert.equal(seenHistories[0].length, 0);
  assert.equal(seenHistories[1].length, 0);
  assert.equal(agent.history.get(admin)!.length, 2);
  assert.equal(agent.history.get(manager)!.length, 2);
});

test('demo reset clears conversation history (via resetSession)', async () => {
  const { getSession, resetSession } = await import('../../src/server/instance');
  const s = getSession('history-reset-check');
  s.agent.history.set('demo-admin', [{ role: 'user', content: 'mark room 204 clean' }]);
  resetSession('history-reset-check');
  assert.equal(s.agent.history.size, 0);
});
