import { Navigate, Route, Routes } from 'react-router-dom';

import LoadingScreen from './components/LoadingScreen.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ChatPage from './modules/chat/ChatPage.jsx';
import ClinicPage from './modules/clinic/ClinicPage.jsx';
import CrmPage from './modules/crm/CrmPage.jsx';
import ResumeBuilderPage from './modules/resume/ResumeBuilderPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const App = () => {
  const { bootstrapping } = useAuth();

  if (bootstrapping) {
    return <LoadingScreen label="Loading Workyn..." fullscreen />;
  }

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/crm" element={<CrmPage />} />
          <Route path="/resume" element={<ResumeBuilderPage />} />
          <Route path="/clinic" element={<ClinicPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
