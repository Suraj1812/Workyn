import {
  AccountCircleRounded,
  AnalyticsRounded,
  AssignmentIndRounded,
  AutoAwesomeRounded,
  ChatRounded,
  DarkModeRounded,
  HistoryRounded,
  LightModeRounded,
  LogoutRounded,
  MenuRounded,
  MonitorHeartRounded,
  NotificationsRounded,
  PaidRounded,
  PeopleRounded,
  SettingsRounded,
  SpaceDashboardRounded,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

import AIPanelDrawer from '../components/ai/AIPanelDrawer.jsx';
import NotificationDrawer from '../components/notifications/NotificationDrawer.jsx';
import GlobalSearchBox from '../components/search/GlobalSearchBox.jsx';
import { useAI } from '../context/AIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationsContext.jsx';
import { useThemeMode } from '../context/ThemeModeContext.jsx';

const drawerWidth = 280;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { summary } = useAI();
  const { unreadCount } = useNotifications();
  const { mode, toggleColorMode } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', path: '/dashboard', icon: <SpaceDashboardRounded /> },
      { label: 'Chat', path: '/chat', icon: <ChatRounded /> },
      { label: 'CRM', path: '/crm', icon: <AssignmentIndRounded /> },
      { label: 'Resume Builder', path: '/resume', icon: <AccountCircleRounded /> },
      { label: 'Clinic', path: '/clinic', icon: <MonitorHeartRounded /> },
      { label: 'Analytics', path: '/analytics', icon: <AnalyticsRounded /> },
      { label: 'Activity', path: '/activity', icon: <HistoryRounded /> },
      { label: 'Team', path: '/team', icon: <PeopleRounded /> },
      { label: 'Billing', path: '/billing', icon: <PaidRounded /> },
      { label: 'Settings', path: '/settings', icon: <SettingsRounded /> },
    ],
    [],
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Workyn
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Productivity that feels alive.
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              mb: 1,
              borderRadius: 3,
              '&.active, &.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 4,
            background:
              'linear-gradient(160deg, rgba(11,125,119,0.18) 0%, rgba(250,140,22,0.18) 100%)',
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 0.75 }}>
            Focused all-in-one operations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chat, leads, resumes, and patient workflows move together here.
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{ width: { lg: `calc(100% - ${drawerWidth}px)` }, ml: { lg: `${drawerWidth}px` } }}
      >
        <Toolbar sx={{ minHeight: 78 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuRounded />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Workyn'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Welcome back, {user?.name}
              </Typography>
              <Chip
                size="small"
                color={user?.currentWorkspace?.plan === 'pro' ? 'secondary' : 'default'}
                label={(user?.currentWorkspace?.plan || 'free').toUpperCase()}
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <GlobalSearchBox />
            </Box>
            <IconButton color="inherit" onClick={() => setNotificationsOpen(true)}>
              <Badge badgeContent={unreadCount} color="error" invisible={!unreadCount}>
                <NotificationsRounded />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={() => setAiPanelOpen(true)}>
              <Badge
                badgeContent={summary.pendingSuggestions}
                color="secondary"
                invisible={!summary.pendingSuggestions}
              >
                <AutoAwesomeRounded />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {mode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
            </IconButton>
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <Avatar src={user?.avatarUrl || undefined} sx={{ bgcolor: 'primary.main' }}>
                {user?.name?.[0] || 'W'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.currentWorkspace?.name || user?.email}
                </Typography>
              </Box>
            </Stack>
            <Button color="inherit" startIcon={<LogoutRounded />} onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 2, md: 3 },
          py: { xs: 11, md: 12 },
        }}
      >
        <Outlet />
      </Box>

      <AIPanelDrawer open={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </Box>
  );
};

export default DashboardLayout;
