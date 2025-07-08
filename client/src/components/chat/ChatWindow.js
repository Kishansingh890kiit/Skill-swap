import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import Toast from '../Toast';

const ChatWindow = () => {
  const { activeChat, sendMessage, joinChat, setTyping, typingUsers } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (activeChat) {
      joinChat(activeChat._id);
    }
  }, [activeChat, joinChat]);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        sendMessage(activeChat._id, message);
        setToastType('success');
        setToast('Message sent!');
        setTimeout(() => setToast(''), 1500);
      } catch (err) {
        setToastType('error');
        setToast('Failed to send message');
        setTimeout(() => setToast(''), 2000);
      }
      setMessage('');
    }
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(activeChat._id);
    typingTimeoutRef.current = setTimeout(() => {
      // Typing status will be cleared by the server after 3 seconds
    }, 3000);
  };

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  if (!activeChat.messages || activeChat.messages.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex items-center space-x-3">
          <img
            src={otherParticipant.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name || 'User')}&background=random&size=64`}
            alt={otherParticipant.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-gray-900">{otherParticipant.name}</h3>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl p-3 ${i % 2 === 0 ? 'bg-blue-100' : 'bg-gray-200'} h-8 w-40`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const otherParticipant = activeChat.participants.find(p => p._id !== user._id);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center space-x-3">
        <img
          src={otherParticipant.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name || 'User')}&background=random&size=64`}
          alt={otherParticipant.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium text-gray-900">{otherParticipant.name}</h3>
          {typingUsers[activeChat._id] === otherParticipant._id && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">typing</span>
              <span className="flex space-x-1">
                <span className="dot bg-blue-400"></span>
                <span className="dot bg-blue-400"></span>
                <span className="dot bg-blue-400"></span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeChat.messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender._id === user._id ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-3 shadow-md transition-all duration-200
                ${msg.sender._id === user._id
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white self-end'
                  : 'bg-white text-blue-900 border border-blue-100 self-start'}
              `}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-75 mt-1 block text-right">
                {format(new Date(msg.timestamp), 'h:mm a')}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2 items-center">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-blue-100 transition"
            onClick={() => setShowEmojiPicker((v) => !v)}
            tabIndex={-1}
            aria-label="Emoji picker"
          >
            <span role="img" aria-label="emoji">😊</span>
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-8 bg-white border rounded shadow-lg p-2 flex flex-wrap gap-1 z-50">
              {["😀","😂","😍","😎","👍","🙏","🎉","🔥","🥳","😇","🤔","😢","😡","❤️","👏"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="text-2xl hover:bg-blue-50 rounded p-1"
                  onClick={() => {
                    setMessage((m) => m + emoji);
                    setShowEmojiPicker(false);
                  }}
                >{emoji}</button>
              ))}
            </div>
          )}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleTyping}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 focus:outline-none disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 