import React from 'react';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

const Chat = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        <div className="md:col-span-1 h-full">
          <ChatList />
        </div>
        <div className="md:col-span-2 h-full">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default Chat; 