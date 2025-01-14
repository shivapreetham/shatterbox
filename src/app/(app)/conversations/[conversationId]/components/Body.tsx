'use client';

import { useRef, useEffect } from 'react';
import { FullMessageType } from '@/types';
import useConversation from '@/app/hooks/useConversation';
import MessageBox from './MessageBox';
import axios from 'axios';
import { pusherClient } from '@/lib/pusher';
import { find } from 'lodash';
import { FullConversationType } from '@/types';
import { useMessageStore } from '@/app/hooks/useMessageStore';

interface BodyProps {
  initialMessages: FullMessageType[];
  conversation: FullConversationType;
}

const Body: React.FC<BodyProps> = ({ initialMessages, conversation }) => {
  const { 
    messages, 
    pendingMessages, 
    setMessages,
    deleteMessage 
  } = useMessageStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useConversation();

  // Initialize messages in store
  useEffect(() => {
    setMessages(conversationId, initialMessages);
  }, [conversationId, initialMessages, setMessages]);

  // Handle conversation loading and anonymous state
  useEffect(() => {
    const loadConversation = async () => {
      try {
        if (conversation) {
          const isAnonymous = !!conversation.isGroup && !!conversation.isAnonymous;
          // You might want to store isAnonymous in your message store if needed
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    loadConversation();
  }, [conversation]);

  // Mark messages as seen
  useEffect(() => {
    axios.post(`/api/chat/conversations/${conversationId}/seen`);
  }, [conversationId]);

  // Pusher subscription and message handlers
  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/chat/conversations/${conversationId}/seen`);

      setMessages(conversationId, (prevMessages: any) => {
        if (find(prevMessages, { id: message.id })) return prevMessages;
        return [...prevMessages, message];
      });

      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages(conversationId, (prevMessages :any) =>
        prevMessages.map((message: FullMessageType) => {
          if (message.id === newMessage.id) return newMessage;
          return message;
        })
      );
    };

    const deleteMessageHandler = (messageId: string) => {
      deleteMessage(conversationId, messageId);
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);
    pusherClient.bind('message:delete', deleteMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
      pusherClient.unbind('message:delete', deleteMessageHandler);
    };
  }, [conversationId, setMessages, deleteMessage]);

  // Handle message deletion
  const handleMessageDelete = async (messageId: string) => {
    try {
      // Optimistically update UI through the store
      deleteMessage(conversationId, messageId);
      
      // Make API call
      await axios.delete(`/api/chat/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      // You might want to add message restoration logic in your store
      // if the deletion fails
    }
  };

  // Combine confirmed and pending messages
  const allMessages = [
    ...(messages.get(conversationId) || []),
    ...(pendingMessages.get(conversationId) || [])
  ].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col py-4 space-y-2">
        {allMessages.map((message, i) => (
          <MessageBox 
            key={message.id} 
            message={message}
            isLast={i === allMessages.length - 1}
            onDelete={() => handleMessageDelete(message.id)}
          />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default Body;