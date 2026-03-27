import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import LoadingScreen from './components/LoadingScreen.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ChatPage = lazy(() => import('./modules/chat/ChatPage.jsx'));
const CrmPage = lazy(() => import('./modules/crm/CrmPage.jsx'));
const ResumeBuilderPage = lazy(() => import('./modules/resume/ResumeBuilderPage.jsx'));
const ClinicPage = lazy(() => import('./modules/clinic/ClinicPage.jsx'));
const AnalyticsPage = lazy(() => import('./modules/analytics/AnalyticsPage.jsx'));
const ActivityPage = lazy(() => import('./modules/activity/ActivityPage.jsx'));
const TeamPage = lazy(() => import('./modules/team/TeamPage.jsx'));
const BillingPage = lazy(() => import('./modules/billing/BillingPage.jsx'));
const SettingsPage = lazy(() => import('./modules/settings/SettingsPage.jsx'));

const App = () => {
  return (
    <Suspense fallback={<LoadingScreen label="Loading module..." fullscreen />}>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/crm" element={<CrmPage />} />
            <Route path="/resume" element={<ResumeBuilderPage />} />
            <Route path="/clinic" element={<ClinicPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
