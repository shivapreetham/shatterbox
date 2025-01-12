'use client';

import { useState, useRef, useEffect } from 'react';
import { FullMessageType } from '@/types';
import useConversation from '@/app/hooks/useConversation';
import MessageBox from './MessageBox';
import axios from 'axios';
import { pusherClient } from '@/lib/pusher';
import { find } from 'lodash';
import { FullConversationType } from '@/types';
import { Loader } from 'lucide-react';
interface BodyProps {
  initialMessages: FullMessageType[];
  conversation: FullConversationType;
}

const Body: React.FC<BodyProps> = ({ initialMessages, conversation }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Add loading state

  const { conversationId } = useConversation();

  // Fetch conversation data safely
  useEffect(() => {
    const loadConversation = async () => {
      try {
        // console.log(conversation)
        if (conversation) {
          setIsAnonymous(!!conversation.isGroup && !!conversation.isAnonymous);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    loadConversation();
  }, [conversationId]);

  
  // Rest of your existing useEffect hooks remain the same
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

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          data={message}
          isAnonymous={isAnonymous}
        />
      ))}

      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export default Body;