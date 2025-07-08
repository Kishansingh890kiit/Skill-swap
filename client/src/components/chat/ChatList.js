import React, { useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ChatList = () => {
  const { chats, activeChat, setActiveChat, loadChats } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user._id);
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMsg = chat.messages[chat.messages.length - 1];
    return `${lastMsg.sender._id === user._id ? 'You: ' : ''}${lastMsg.content}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        {chats.map(chat => {
          const otherParticipant = getOtherParticipant(chat);
          return (
            <div
              key={chat._id}
              className={`p-4 border-b cursor-pointer hover:bg-blue-50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ${
                activeChat?._id === chat._id ? 'bg-blue-100' : ''
              }`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={otherParticipant.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name || 'User')}&background=random&size=96`}
                  alt={otherParticipant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {otherParticipant.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(chat.lastMessage), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {getLastMessage(chat)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {chats.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList; 