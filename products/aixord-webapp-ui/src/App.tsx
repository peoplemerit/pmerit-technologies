/**
 * AIXORD Web App
 *
 * Main application component with routing.
 * Includes AIXORD v4.3 Disclaimer Gate (GA:DIS).
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserSettingsProvider } from './contexts/UserSettingsContext';
import { DisclaimerProvider } from './contexts/DisclaimerContext';
import { Layout } from './components/Layout';
import { DisclaimerGate } from './components/DisclaimerGate';
import { ProtectedRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen';

// Lazy-loaded pages
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Project = lazy(() => import('./pages/Project').then(m => ({ default: m.Project })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const Pricing = lazy(() => import('./pages/Pricing').then(m => ({ default: m.Pricing })));
const Activity = lazy(() => import('./pages/Activity').then(m => ({ default: m.Activity })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const DocsLayout = lazy(() => import('./pages/docs/DocsLayout').then(m => ({ default: m.DocsLayout })));
const DocsIndex = lazy(() => import('./pages/docs/DocsIndex').then(m => ({ default: m.DocsIndex })));
const QuickStart = lazy(() => import('./pages/docs/QuickStart').then(m => ({ default: m.QuickStart })));
const Features = lazy(() => import('./pages/docs/Features').then(m => ({ default: m.Features })));
const ApiKeys = lazy(() => import('./pages/docs/ApiKeys').then(m => ({ default: m.ApiKeys })));
const Troubleshooting = lazy(() => import('./pages/docs/Troubleshooting').then(m => ({ default: m.Troubleshooting })));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DisclaimerProvider>
          <UserSettingsProvider>
            <BrowserRouter>
              <DisclaimerGate>
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Landing />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/pricing" element={<Pricing />} />
                      {/* Protected routes — per-route error boundaries */}
                      <Route path="/dashboard" element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
                      <Route path="/project/:id" element={<ProtectedRoute><ErrorBoundary><Project /></ErrorBoundary></ProtectedRoute>} />
                      <Route path="/chat" element={<ProtectedRoute><ErrorBoundary><Chat /></ErrorBoundary></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><ErrorBoundary><Settings /></ErrorBoundary></ProtectedRoute>} />
                      <Route path="/activity" element={<ProtectedRoute><ErrorBoundary><Activity /></ErrorBoundary></ProtectedRoute>} />
                      <Route path="/analytics" element={<ProtectedRoute><ErrorBoundary><Analytics /></ErrorBoundary></ProtectedRoute>} />
                      {/* 404 catch-all */}
                      <Route path="*" element={<NotFound />} />
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
                </Suspense>
              </DisclaimerGate>
            </BrowserRouter>
          </UserSettingsProvider>
        </DisclaimerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
