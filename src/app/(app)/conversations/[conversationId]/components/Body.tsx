// Body.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { FullMessageType } from '@/types';
import useConversation from '@/app/hooks/useConversation';
import MessageBox from './MessageBox';
import axios from 'axios';
import { pusherClient } from '@/lib/pusher';
import { find } from 'lodash';
import { FullConversationType } from '@/types';

interface BodyProps {
  initialMessages: FullMessageType[];
  conversation: FullConversationType;
}

const Body: React.FC<BodyProps> = ({ initialMessages, conversation }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useConversation();

  useEffect(() => {
    const loadConversation = async () => {
      try {
        if (conversation) {
          setIsAnonymous(!!conversation.isGroup && !!conversation.isAnonymous);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    axios.post(`/api/chat/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/chat/conversations/${conversationId}/seen`);

      setMessages((prevMessages) => {
        if (find(prevMessages, { id: message.id })) return prevMessages;
        return [...prevMessages, message];
      });

      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) => {
          if (message.id === newMessage.id) return newMessage;
          return message;
        })
      );
    };

    // Add message deletion handler
    const deleteMessageHandler = (messageId: string) => {
      setMessages((prevMessages) => 
        prevMessages.filter((message) => message.id !== messageId)
      );
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
  }, [conversationId]);

  // Add local message deletion handler
  const handleMessageDelete = async (messageId: string) => {
    try {
      // Optimistically update UI
      setMessages((prevMessages) => 
        prevMessages.filter((message) => message.id !== messageId)
      );
      
      // Make API call
      await axios.delete(`/api/chat/messages/${messageId}`);
      
      // No need for router.refresh() as Pusher will handle the update
    } catch (error) {
      console.error('Error deleting message:', error);
      // Revert the optimistic update if the deletion failed
      const deletedMessage = messages.find((message) => message.id === messageId);
      if (deletedMessage) {
        setMessages((prevMessages) => [...prevMessages, deletedMessage]);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          data={message}
          isAnonymous={isAnonymous}
          onDelete={handleMessageDelete}
        />
      ))}
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export default Body;
