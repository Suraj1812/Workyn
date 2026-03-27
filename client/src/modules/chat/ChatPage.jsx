import { AttachFileRounded, SendRounded } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import EmptyState from '../../components/EmptyState.jsx';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import Seo from '../../components/Seo.jsx';
import AIModuleSuggestions from '../../components/ai/AIModuleSuggestions.jsx';
import { useAI } from '../../context/AIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import aiService from '../../services/aiService.js';
import { connectSocket } from '../../services/socket.js';
import chatService from '../../services/chatService.js';
import uploadService from '../../services/uploadService.js';
import userService from '../../services/userService.js';
import { formatDateTime, getApiError } from '../../utils/formatters.js';

const extractUserId = (user) => (typeof user === 'string' ? user : user?.id || user?._id);

const ChatPage = () => {
  const [contacts, setContacts] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [typing, setTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [error, setError] = useState('');
  const selectedContactRef = useRef(null);
  const typingTimerRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const { refreshAi } = useAI();
  const { user } = useAuth();

  const sortedContacts = useMemo(
    () =>
      contacts.map((contact) => ({
        ...contact,
        isOnline: onlineUserIds.includes(contact._id),
      })),
    [contacts, onlineUserIds],
  );

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await userService.getUsers();
        setContacts(response.users);
        setOnlineUserIds(response.onlineUserIds || []);
        if (response.users.length) {
          setSelectedContact((current) => current || response.users[0]);
        }
      } catch (fetchError) {
        setError(getApiError(fetchError, 'Unable to load contacts.'));
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact?._id) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);
      try {
        const response = await chatService.getMessages(selectedContact._id);
        setMessages(response.messages || []);
      } catch (fetchError) {
        setError(getApiError(fetchError, 'Unable to load messages.'));
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedContact?._id]);

  useEffect(() => {
    const fetchQuickReplies = async () => {
      if (!selectedContact?._id) {
        setQuickReplies([]);
        return;
      }

      try {
        const response = await aiService.getChatQuickReplies(selectedContact._id);
        setQuickReplies(response.quickReplies || []);
      } catch (_error) {
        setQuickReplies([]);
      }
    };

    fetchQuickReplies();
  }, [selectedContact?._id, messages.length]);

  useEffect(() => {
    const socket = connectSocket();

    const handleIncomingMessage = (incomingMessage) => {
      const activeContactId = selectedContactRef.current?._id;
      const senderId = extractUserId(incomingMessage.senderId);
      const receiverId = extractUserId(incomingMessage.receiverId);

      if (activeContactId && [senderId, receiverId].includes(activeContactId)) {
        setMessages((previousMessages) => {
          if (previousMessages.some((message) => message._id === incomingMessage._id)) {
            return previousMessages;
          }
          return [...previousMessages, incomingMessage];
        });
      }
    };

    const handleTypingStart = ({ from }) => {
      if (from === selectedContactRef.current?._id) {
        setTyping(true);
      }
    };

    const handleTypingStop = ({ from }) => {
      if (from === selectedContactRef.current?._id) {
        setTyping(false);
      }
    };

    const handleUsersOnline = (userIds) => {
      setOnlineUserIds(userIds || []);
    };

    socket.on('receive_message', handleIncomingMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('users:online', handleUsersOnline);

    return () => {
      socket.off('receive_message', handleIncomingMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('users:online', handleUsersOnline);
      clearTimeout(typingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const stopTyping = () => {
    clearTimeout(typingTimerRef.current);
    if (selectedContact?._id) {
      connectSocket().emit('typing_stop', { to: selectedContact._id });
    }
  };

  const handleDraftChange = (event) => {
    const nextValue = event.target.value;
    setDraft(nextValue);

    if (!selectedContact?._id) {
      return;
    }

    const socket = connectSocket();
    socket.emit('typing_start', { to: selectedContact._id });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing_stop', { to: selectedContact._id });
    }, 1200);
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if ((!draft.trim() && !pendingFile) || !selectedContact?._id) {
      return;
    }

    setSending(true);
    setError('');
    stopTyping();

    try {
      let attachmentPayload = null;
      if (pendingFile) {
        setUploadingFile(true);
        const uploadResponse = await uploadService.uploadFile({
          file: pendingFile,
          module: 'chat',
        });
        attachmentPayload = uploadResponse.file;
      }

      const payload = {
        receiverId: selectedContact._id,
        message: draft.trim(),
        messageType: attachmentPayload ? 'file' : 'text',
        attachment: attachmentPayload
          ? {
              id: attachmentPayload.id,
              fileName: attachmentPayload.fileName,
              url: attachmentPayload.url,
              mimeType: attachmentPayload.mimeType,
              sizeBytes: attachmentPayload.sizeBytes,
            }
          : undefined,
      };

      const socket = connectSocket();

      let savedMessage;
      if (socket.connected) {
        savedMessage = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Message delivery timed out.'));
          }, 4000);

          socket.emit('send_message', payload, (response) => {
            clearTimeout(timeoutId);

            if (!response?.ok) {
              reject(new Error(response?.error || 'Unable to send message.'));
              return;
            }

            resolve(response.message);
          });
        });
      } else {
        const response = await chatService.sendMessage(payload);
        savedMessage = response.message;
      }

      setMessages((previousMessages) => [...previousMessages, savedMessage]);
      setDraft('');
      setPendingFile(null);
      await refreshAi({ silent: true });
    } catch (sendError) {
      setError(getApiError(sendError, 'Unable to send message.'));
    } finally {
      setUploadingFile(false);
      setSending(false);
    }
  };

  if (loadingContacts) {
    return (
      <>
        <Seo
          title="Team Chat"
          description="Collaborate in realtime with Workyn chat, file sharing, quick replies, and AI-assisted messaging."
          path="/chat"
          robots="noindex, nofollow, noarchive"
        />
        <LoadingScreen label="Loading chat..." />
      </>
    );
  }

  return (
    <Box>
      <Seo
        title="Team Chat"
        description="Collaborate in realtime with Workyn chat, file sharing, quick replies, and AI-assisted messaging."
        path="/chat"
        robots="noindex, nofollow, noarchive"
      />
      <PageHeader
        eyebrow="Realtime chat"
        title="Keep conversations moving"
        subtitle="Talk to teammates and collaborators with live delivery and typing feedback."
      />

      <AIModuleSuggestions
        module="chat"
        title="Chat AI suggestions"
        subtitle="Repeated-message detection and reusable reply templates"
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {!contacts.length ? (
        <EmptyState
          title="No contacts yet"
          description="Register another user account to start a real-time conversation inside Workyn."
        />
      ) : (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ minHeight: 620 }}>
          <SectionCard
            title="Contacts"
            subtitle="Active users in your workspace"
            sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}
          >
            <List disablePadding>
              {sortedContacts.map((contact) => (
                <ListItemButton
                  key={contact._id}
                  selected={selectedContact?._id === contact._id}
                  onClick={() => {
                    setSelectedContact(contact);
                    setTyping(false);
                  }}
                  sx={{ borderRadius: 3, mb: 1 }}
                >
                  <Badge
                    color="success"
                    overlap="circular"
                    variant={contact.isOnline ? 'dot' : 'standard'}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar sx={{ mr: 1.5, bgcolor: 'primary.main' }}>{contact.name?.[0]}</Avatar>
                  </Badge>
                  <ListItemText
                    primary={contact.name}
                    secondary={contact.isOnline ? 'Online now' : contact.email}
                  />
                </ListItemButton>
              ))}
            </List>
          </SectionCard>

          <SectionCard
            title={selectedContact?.name || 'Conversation'}
            subtitle={selectedContact?.email}
            sx={{ flex: 1 }}
          >
            {loadingMessages ? (
              <LoadingScreen label="Loading conversation..." />
            ) : (
              <Stack sx={{ height: '100%' }}>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 420,
                    maxHeight: 460,
                    overflowY: 'auto',
                    pr: 1,
                  }}
                >
                  {messages.map((message) => {
                    const isOwnMessage = extractUserId(message.senderId) !== selectedContact?._id;

                    return (
                      <Stack
                        key={message._id}
                        alignItems={isOwnMessage ? 'flex-end' : 'flex-start'}
                        sx={{ mb: 2 }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            maxWidth: '80%',
                            borderRadius: 3,
                            bgcolor: isOwnMessage ? 'primary.main' : 'action.hover',
                            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                          }}
                        >
                          <Typography variant="body1">{message.message}</Typography>
                          {message.attachment?.url ? (
                            <Button
                              component="a"
                              href={message.attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              size="small"
                              sx={{ mt: 1, color: 'inherit', px: 0 }}
                            >
                              {message.attachment.fileName || 'Open attachment'}
                            </Button>
                          ) : null}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                          {formatDateTime(message.timestamp || message.createdAt)}
                        </Typography>
                      </Stack>
                    );
                  })}
                  {typing ? (
                    <Typography variant="body2" color="text.secondary">
                      {selectedContact?.name} is typing...
                    </Typography>
                  ) : null}
                  <div ref={bottomRef} />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box component="form" onSubmit={handleSend}>
                  {quickReplies.length ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                      {quickReplies.map((reply, index) => (
                        <Chip
                          key={`${reply.text}-${index}`}
                          label={reply.label || reply.text}
                          color={reply.source === 'template' ? 'primary' : 'default'}
                          onClick={() => setDraft(reply.text)}
                        />
                      ))}
                    </Stack>
                  ) : null}
                  {pendingFile ? (
                    <Chip
                      label={pendingFile.name}
                      onDelete={() => setPendingFile(null)}
                      sx={{ mb: 1.5 }}
                    />
                  ) : null}
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    onChange={(event) => setPendingFile(event.target.files?.[0] || null)}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField
                      fullWidth
                      placeholder="Write a message..."
                      value={draft}
                      onChange={handleDraftChange}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AttachFileRounded />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={user?.currentWorkspace?.plan !== 'pro' || uploadingFile}
                    >
                      {uploadingFile ? 'Uploading...' : 'Attach'}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<SendRounded />}
                      disabled={sending || (!draft.trim() && !pendingFile)}
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            )}
          </SectionCard>
        </Stack>
      )}
    </Box>
  );
};

export default ChatPage;
