import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PING_URL = 'https://allrentr-1egs.onrender.com';

export interface PingLog {
  id: string;
  url: string;
  status_code: number | null;
  response_time_ms: number;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

/**
 * Read-only hook that fetches keep-alive ping logs from Supabase.
 * The actual pinging is done server-side by chat-server.js (runs 24/7).
 * This hook just displays the results in the admin dashboard.
 */
export const useKeepAlive = (enabled: boolean = true) => {
  const [logs, setLogs] = useState<PingLog[]>([]);
  const [lastPing, setLastPing] = useState<PingLog | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await (supabase
        .from('keep_alive_logs') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data) {
        setLogs(data);
        if (data.length > 0) {
          setLastPing(data[0]);
        }
      }
    } catch (err) {
      console.warn('keep_alive_logs table may not exist yet:', err);
    }
  }, []);

  // Manual ping from the browser (for the "Ping Now" button)
  const pingNow = useCallback(async () => {
    setIsPinging(true);
    const start = Date.now();
    let statusCode: number | null = null;
    let success = false;
    let errorMessage: string | null = null;

    try {
      const response = await fetch(PING_URL, { method: 'GET', mode: 'no-cors' });
      statusCode = response.type === 'opaque' ? 200 : response.status;
      success = true;
    } catch (err: any) {
      errorMessage = err.message || 'Network error';
      success = false;
    }

    const responseTimeMs = Date.now() - start;

    // Save to Supabase
    try {
      await (supabase.from('keep_alive_logs') as any).insert({
        url: PING_URL,
        status_code: statusCode,
        response_time_ms: responseTimeMs,
        success,
        error_message: errorMessage,
      });
    } catch (err) {
      console.warn('Could not save ping log to DB:', err);
    }

    // Refresh logs to show the new entry
    await fetchLogs();
    setIsPinging(false);
  }, [fetchLogs]);

  useEffect(() => {
    if (!enabled) return;

    // Fetch logs on mount
    fetchLogs();

    // Auto-refresh logs every 60 seconds so admin sees latest server pings
    const interval = setInterval(fetchLogs, 60 * 1000);
    return () => clearInterval(interval);
  }, [enabled, fetchLogs]);

  // Server-side ping runs 24/7 — isRunning reflects whether we have recent logs
  const isRunning = lastPing
    ? (Date.now() - new Date(lastPing.created_at).getTime()) < 10 * 60 * 1000 // last ping within 10 min
    : false;

  return {
    logs,
    isRunning,
    lastPing,
    isPinging,
    pingNow,
    fetchLogs,
  };
};
