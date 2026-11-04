'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getState, type HotelSnapshot } from '../lib/api';

// Polls the session snapshot so the dashboard reflects copilot actions
// (check-ins, folio charges, room turnovers) without a manual refresh.
export function useHotelSnapshot(pollMs = 3000) {
  const [snapshot, setSnapshot] = useState<HotelSnapshot | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setSnapshot(await getState());
      setLastUpdated(new Date());
    } catch {
      /* server not ready yet; next poll retries */
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(refresh, pollMs);
    return () => clearInterval(timer);
  }, [refresh, pollMs]);

  return { snapshot, refresh, lastUpdated };
}
