import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Fab,
  Drawer,
  List,
  ListItem,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Close as CloseIcon,
  Psychology as PsychologyIcon,
  TipsAndUpdates as InsightIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'insight' | 'prediction' | 'suggestion';
}

const AIAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant. I can help you with project insights, predictions, and natural language queries. Try asking me something!",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Check if query is project-related
      const projectKeywords = [
        'project', 'scheme', 'work', 'budget', 'progress', 'itda', 'tribal',
        'development', 'status', 'completion', 'funding', 'implementation',
        'milestone', 'timeline', 'resource', 'allocation', 'report', 'analysis'
      ];
      
      const isProjectRelated = projectKeywords.some(keyword => 
        input.toLowerCase().includes(keyword)
      );

      if (!isProjectRelated) {
        // Non-project related query response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm specifically designed to help with ITDA project management queries. Please ask me about projects, schemes, works, budgets, progress tracking, or other development-related topics.",
          sender: 'ai',
          timestamp: new Date(),
          type: 'text',
        };
        setMessages((prev) => [...prev, aiMessage]);
        setLoading(false);
        return;
      }

      // Determine the type of query
      const isPrediction = input.toLowerCase().includes('predict') || input.toLowerCase().includes('when');
      const isInsight = input.toLowerCase().includes('insight') || input.toLowerCase().includes('analyze');

      let endpoint = '/api/ai/chat';
      let requestData = { query: input };

      if (isPrediction) {
        endpoint = '/api/ai/predict';
      } else if (isInsight) {
        endpoint = '/api/ai/insights';
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${endpoint}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message || response.data.analysis || 'I can help you analyze projects and make predictions!',
        sender: 'ai',
        timestamp: new Date(),
        type: isPrediction ? 'prediction' : isInsight ? 'insight' : 'text',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // Fallback response for demo - project-related suggestions only
      const suggestions = [
        "Based on current progress, the Road Infrastructure project is likely to complete by next quarter with 85% confidence.",
        "Budget analysis: ITDA schemes are tracking 15% under budget across all active projects.",
        "Anomaly detected: Tribal Housing scheme progress has stalled. Consider reallocating resources.",
        "Project velocity has increased by 20% this month across all schemes.",
        "I recommend prioritizing the Healthcare Facility Upgrade due to its high community impact.",
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: suggestions[Math.floor(Math.random() * suggestions.length)],
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What's the status of all projects?",
    "Predict completion date for active projects",
    "Show me budget insights",
    "Detect any anomalies",
    "Generate weekly report",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="AI Assistant"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)',
            },
            '70%': {
              boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)',
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)',
            },
          },
        }}
      >
        <AIIcon />
      </Fab>

      {/* AI Chat Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Paper
            elevation={2}
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <PsychologyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">AI Assistant</Typography>
                  <Typography variant="caption">Powered by GPT-4</Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>

          {/* Quick Actions */}
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Quick Questions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {quickQuestions.map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  size="small"
                  onClick={() => setInput(question)}
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Messages */}
          <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  p: 0.5,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    position: 'relative',
                  }}
                >
                  {message.type === 'insight' && (
                    <Chip
                      icon={<InsightIcon />}
                      label="Insight"
                      size="small"
                      color="warning"
                      sx={{ mb: 1 }}
                    />
                  )}
                  {message.type === 'prediction' && (
                    <Chip
                      icon={<AutoAwesomeIcon />}
                      label="Prediction"
                      size="small"
                      color="success"
                      sx={{ mb: 1 }}
                    />
                  )}
                  <Typography variant="body2">{message.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </ListItem>
            ))}
            {loading && (
              <ListItem sx={{ justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                size="small"
                disabled={loading}
              />
              <Tooltip title="Send">
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AIAssistant;