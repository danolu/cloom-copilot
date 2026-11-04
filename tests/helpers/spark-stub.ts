import type { Decision } from '../../src/shared/types/agent';

// Test double for Muse Spark: returns canned structured decisions in order,
// exactly as decideWithSpark would after parsing the model's JSON.
// It never routes production traffic — production always calls the Meta Model API.
export const sparkStub = (...decisions: Decision[]) => {
  const queue = [...decisions];
  return async (): Promise<Decision> => {
    const next = queue.shift();
    if (!next) throw new Error('sparkStub: no canned decision left for this call');
    return next;
  };
};
