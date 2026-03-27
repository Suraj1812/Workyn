import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import LoadingScreen from './LoadingScreen.jsx';

const PublicRoute = () => {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <LoadingScreen label="Checking session..." fullscreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
