import {
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useNotifications } from '../../context/NotificationsContext.jsx';
import { formatDateTime } from '../../utils/formatters.js';

const NotificationDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { notifications, markAllRead, markNotificationRead, unreadCount } = useNotifications();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Stack sx={{ width: { xs: '100vw', sm: 420 }, p: 3, height: '100%' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <div>
            <Typography variant="h6">Notifications</Typography>
            <Typography color="text.secondary">
              {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
            </Typography>
          </div>
          <Button onClick={markAllRead}>Mark all read</Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <List disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
          {notifications.map((notification) => (
            <ListItemButton
              key={notification.id}
              onClick={async () => {
                if (!notification.isRead) {
                  await markNotificationRead(notification.id);
                }

                if (notification.link) {
                  navigate(notification.link);
                }
                onClose();
              }}
              sx={{
                mb: 1,
                borderRadius: 3,
                bgcolor: notification.isRead ? 'transparent' : 'action.hover',
              }}
            >
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2" display="block">
                      {notification.message}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary">
                      {formatDateTime(notification.createdAt)}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Stack>
    </Drawer>
  );
};

export default NotificationDrawer;
