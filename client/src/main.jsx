import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';

import App from './App.jsx';
import { AIProvider } from './context/AIContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationsProvider } from './context/NotificationsContext.jsx';
import { ThemeModeProvider } from './context/ThemeModeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeModeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationsProvider>
            <AIProvider>
              <App />
            </AIProvider>
          </NotificationsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeModeProvider>
  </BrowserRouter>,
);
