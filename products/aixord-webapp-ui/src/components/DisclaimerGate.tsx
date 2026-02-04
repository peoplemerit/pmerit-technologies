/**
 * Disclaimer Gate Component (GA:DIS)
 *
 * Wraps protected content and shows disclaimer modal if not accepted.
 * Only triggers for authenticated users on protected routes.
 */

import { useAuth } from '../contexts/AuthContext';
import { useDisclaimer } from '../contexts/DisclaimerContext';
import { DisclaimerModal } from './DisclaimerModal';

interface DisclaimerGateProps {
  children: React.ReactNode;
}

export function DisclaimerGate({ children }: DisclaimerGateProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasAccepted, isLoading: disclaimerLoading, acceptDisclaimer, declineDisclaimer } = useDisclaimer();

  // Don't show gate while loading
  if (authLoading || disclaimerLoading) {
    return <>{children}</>;
  }

  // Only show disclaimer for authenticated users who haven't accepted
  if (isAuthenticated && !hasAccepted) {
    return (
      <>
        {children}
        <DisclaimerModal
          onAccept={acceptDisclaimer}
          onDecline={declineDisclaimer}
        />
      </>
    );
  }

  return <>{children}</>;
}

export default DisclaimerGate;
