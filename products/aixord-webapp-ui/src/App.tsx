/**
 * AIXORD Web App
 *
 * Main application component with routing.
 * Includes AIXORD v4.3 Disclaimer Gate (GA:DIS).
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserSettingsProvider } from './contexts/UserSettingsContext';
import { DisclaimerProvider } from './contexts/DisclaimerContext';
import { Layout } from './components/Layout';
import { DisclaimerGate } from './components/DisclaimerGate';
import ErrorBoundary from './components/ErrorBoundary';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Project } from './pages/Project';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Settings } from './pages/Settings';
import { Chat } from './pages/Chat';
import { Pricing } from './pages/Pricing';
import { Activity } from './pages/Activity';
import { Analytics } from './pages/Analytics';
import { DocsLayout } from './pages/docs/DocsLayout';
import { DocsIndex } from './pages/docs/DocsIndex';
import { QuickStart } from './pages/docs/QuickStart';
import { Features } from './pages/docs/Features';
import { ApiKeys } from './pages/docs/ApiKeys';
import { Troubleshooting } from './pages/docs/Troubleshooting';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DisclaimerProvider>
          <UserSettingsProvider>
            <BrowserRouter>
              <DisclaimerGate>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/project/:id" element={<Project />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/activity" element={<Activity />} />
                    <Route path="/analytics" element={<Analytics />} />
                  </Route>
                  {/* Documentation routes (outside Layout for full-width sidebar) */}
                  <Route path="/docs" element={<DocsLayout />}>
                    <Route index element={<DocsIndex />} />
                    <Route path="quick-start" element={<QuickStart />} />
                    <Route path="features" element={<Features />} />
                    <Route path="api-keys" element={<ApiKeys />} />
                    <Route path="troubleshooting" element={<Troubleshooting />} />
                  </Route>
                </Routes>
              </DisclaimerGate>
            </BrowserRouter>
          </UserSettingsProvider>
        </DisclaimerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
