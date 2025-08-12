import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  AvatarGroup,
  Tooltip,
  Chip,
  Paper,
  Badge,
} from '@mui/material';
import { Person, FiberManualRecord } from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';

interface OnlineUsersIndicatorProps {
  variant?: 'compact' | 'detailed';
  maxAvatars?: number;
}

const OnlineUsersIndicator: React.FC<OnlineUsersIndicatorProps> = ({
  variant = 'compact',
  maxAvatars = 5,
}) => {
  const { onlineUsers, isConnected } = useSocket();
  
  // Always show at least 1 user (the current user) when connected
  const displayCount = isConnected ? Math.max(1, onlineUsers.length) : 0;

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  const getUserColor = (userId: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#FFD93D', '#6C5CE7', '#A8E6CF',
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Badge
          variant="dot"
          color={isConnected ? 'success' : 'error'}
          sx={{
            '& .MuiBadge-dot': {
              animation: isConnected ? 'pulse 2s infinite' : 'none',
            },
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)',
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
              },
            },
          }}
        >
          <Person />
        </Badge>
        <Chip
          label={`${displayCount} online`}
          size="small"
          color={isConnected ? 'success' : 'default'}
          variant="outlined"
          icon={<FiberManualRecord sx={{ fontSize: 10 }} />}
        />
        {onlineUsers.length > 0 && (
          <AvatarGroup max={maxAvatars} spacing="small">
            {onlineUsers.map((userId) => (
              <Tooltip key={userId} title={`User ${userId}`} arrow>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    bgcolor: getUserColor(userId),
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                >
                  {getInitials(userId)}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        )}
      </Box>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Badge
          variant="dot"
          color={isConnected ? 'success' : 'error'}
          sx={{ mr: 2 }}
        >
          <Person />
        </Badge>
        <Typography variant="h6">
          Active Users ({displayCount})
        </Typography>
      </Box>

      {onlineUsers.length === 0 && isConnected ? (
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          You are the only user online
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {onlineUsers.map((userId) => (
            <Chip
              key={userId}
              avatar={
                <Avatar
                  sx={{
                    bgcolor: getUserColor(userId),
                    color: 'white',
                    fontSize: 12,
                  }}
                >
                  {getInitials(userId)}
                </Avatar>
              }
              label={`User ${userId}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '& .MuiChip-avatar': {
                  color: 'white',
                },
              }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <FiberManualRecord
          sx={{
            fontSize: 10,
            color: isConnected ? '#4caf50' : '#f44336',
            mr: 0.5,
          }}
        />
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          {isConnected ? 'Connected to live updates' : 'Connecting...'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default OnlineUsersIndicator;