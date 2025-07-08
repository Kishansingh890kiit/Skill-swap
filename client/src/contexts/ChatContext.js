import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3002';

const ChatContext = createContext(null);

export const ChatProvider = ({ children, addNotification }) => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io(SOCKET_URL, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
      });

      newSocket.on('new_message', (data) => {
        setChats(prevChats => {
          const chatIndex = prevChats.findIndex(chat => chat._id === data.chatId);
          if (chatIndex === -1) return prevChats;

          const updatedChats = [...prevChats];
          updatedChats[chatIndex].messages.push(data.message);
          return updatedChats;
        });
        // Debug log
        console.log('Received new_message:', data.message);
        // Push notification if not from self
        if (addNotification?.current?.addNotification && data.message.sender._id !== user._id) {
          const senderName = data.message.sender?.name || data.message.sender?.userName || 'Someone';
          addNotification.current.addNotification({
            id: `msg-${data.message._id}`,
            type: 'message',
            text: `New message from ${senderName}`,
            link: '/chat',
            userName: senderName
          });
        }
      });

      newSocket.on('user_typing', ({ chatId, userId }) => {
        setTypingUsers(prev => ({
          ...prev,
          [chatId]: userId
        }));

        // Clear typing status after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [chatId]: null
          }));
        }, 3000);
      });

      setSocket(newSocket);

      // Load chats
      loadChats();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const loadChats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat`);
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const sendMessage = (chatId, content) => {
    if (socket && chatId && content) {
      socket.emit('send_message', { chatId, content });
    }
  };

  const startChat = async (participantId) => {
    try {
      const response = await axios.post(`${API_URL}/api/chat`, { participantId });
      const newChat = response.data;
      setChats(prevChats => {
        // Avoid duplicate chats
        if (prevChats.some(chat => chat._id === newChat._id)) return prevChats;
        return [...prevChats, newChat];
      });
      setActiveChat(newChat);
      return newChat;
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  };

  const joinChat = (chatId) => {
    if (socket && chatId) {
      socket.emit('join_chat', chatId);
    }
  };

  const setTyping = (chatId) => {
    if (socket && chatId) {
      socket.emit('typing', { chatId });
    }
  };

  const value = {
    chats,
    activeChat,
    setActiveChat,
    typingUsers,
    sendMessage,
    startChat,
    loadChats,
    joinChat,
    setTyping
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 