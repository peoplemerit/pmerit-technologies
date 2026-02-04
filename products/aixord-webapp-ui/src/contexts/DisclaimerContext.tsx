/**
 * Disclaimer Context (GA:DIS)
 *
 * Manages AIXORD disclaimer acceptance state.
 * Stores acceptance per-user in localStorage with timestamp.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

const DISCLAIMER_KEY = 'aixord_disclaimer';
const DISCLAIMER_VERSION = '1.0'; // Increment to require re-acceptance

interface DisclaimerRecord {
  userId: string;
  version: string;
  acceptedAt: string;
}

interface DisclaimerContextType {
  hasAccepted: boolean;
  isLoading: boolean;
  acceptDisclaimer: () => void;
  declineDisclaimer: () => void;
  resetDisclaimer: () => void;
  acceptedAt: string | null;
}

const DisclaimerContext = createContext<DisclaimerContextType | null>(null);

export function DisclaimerProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check acceptance on mount and when user changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setHasAccepted(false);
      setAcceptedAt(null);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(DISCLAIMER_KEY);
      if (stored) {
        const records: DisclaimerRecord[] = JSON.parse(stored);
        const userRecord = records.find(
          (r) => r.userId === user.id && r.version === DISCLAIMER_VERSION
        );
        if (userRecord) {
          setHasAccepted(true);
          setAcceptedAt(userRecord.acceptedAt);
        } else {
          setHasAccepted(false);
          setAcceptedAt(null);
        }
      } else {
        setHasAccepted(false);
        setAcceptedAt(null);
      }
    } catch (error) {
      console.error('[DisclaimerContext] Failed to load acceptance:', error);
      setHasAccepted(false);
      setAcceptedAt(null);
    }

    setIsLoading(false);
  }, [isAuthenticated, user]);

  const acceptDisclaimer = useCallback(() => {
    if (!user) return;

    const now = new Date().toISOString();
    const newRecord: DisclaimerRecord = {
      userId: user.id,
      version: DISCLAIMER_VERSION,
      acceptedAt: now,
    };

    try {
      const stored = localStorage.getItem(DISCLAIMER_KEY);
      let records: DisclaimerRecord[] = stored ? JSON.parse(stored) : [];

      // Remove old records for this user
      records = records.filter((r) => r.userId !== user.id);

      // Add new record
      records.push(newRecord);

      localStorage.setItem(DISCLAIMER_KEY, JSON.stringify(records));
      setHasAccepted(true);
      setAcceptedAt(now);

      console.log('[DisclaimerContext] Disclaimer accepted for user:', user.id);
    } catch (error) {
      console.error('[DisclaimerContext] Failed to save acceptance:', error);
    }
  }, [user]);

  const declineDisclaimer = useCallback(() => {
    // If user declines, log them out
    console.log('[DisclaimerContext] Disclaimer declined, logging out');
    logout();
  }, [logout]);

  const resetDisclaimer = useCallback(() => {
    if (!user) return;

    try {
      const stored = localStorage.getItem(DISCLAIMER_KEY);
      if (stored) {
        let records: DisclaimerRecord[] = JSON.parse(stored);
        records = records.filter((r) => r.userId !== user.id);
        localStorage.setItem(DISCLAIMER_KEY, JSON.stringify(records));
      }
      setHasAccepted(false);
      setAcceptedAt(null);
      console.log('[DisclaimerContext] Disclaimer reset for user:', user.id);
    } catch (error) {
      console.error('[DisclaimerContext] Failed to reset acceptance:', error);
    }
  }, [user]);

  const value: DisclaimerContextType = {
    hasAccepted,
    isLoading,
    acceptDisclaimer,
    declineDisclaimer,
    resetDisclaimer,
    acceptedAt,
  };

  return (
    <DisclaimerContext.Provider value={value}>
      {children}
    </DisclaimerContext.Provider>
  );
}

export function useDisclaimer() {
  const context = useContext(DisclaimerContext);
  if (!context) {
    throw new Error('useDisclaimer must be used within a DisclaimerProvider');
  }
  return context;
}
