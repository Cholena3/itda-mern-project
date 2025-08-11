import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  Paper,
  Fade,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Clear as ClearIcon,
  CheckCircle,
  Info,
  Warning,
  Error,
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const { notifications, clearNotifications } = useSocket();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" fontSize="small" />;
      case 'warning':
        return <Warning color="warning" fontSize="small" />;
      case 'error':
        return <Error color="error" fontSize="small" />;
      default:
        return <Info color="info" fontSize="small" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        color="inherit"
        sx={{ position: 'relative' }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
            },
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1,
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 0.8,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <Paper sx={{ width: 380, maxHeight: 500 }}>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="h6" component="div">
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearNotifications}
                sx={{ color: 'inherit' }}
              >
                Clear All
              </Button>
            )}
          </Box>

          <List
            sx={{
              maxHeight: 400,
              overflow: 'auto',
              py: 0,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'background.paper',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'grey.400',
                borderRadius: '3px',
              },
            }}
          >
            {notifications.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <NotificationsIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1">
                  No notifications yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You'll see updates here when there's activity
                </Typography>
              </Box>
            ) : (
              notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Box sx={{ mr: 2 }}>
                      {getNotificationIcon(notification.type)}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          component="div"
                          sx={{
                            fontWeight: notification.read ? 400 : 600,
                          }}
                        >
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </Typography>
                          {notification.data?.projectId && (
                            <Chip
                              label={`Project ${notification.data.projectId}`}
                              size="small"
                              sx={{ ml: 1, height: 18 }}
                              color={getNotificationColor(notification.type) as any}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Popover>
    </>
  );
};

export default NotificationCenter;