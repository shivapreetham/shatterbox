import { create } from 'zustand';
import { FullMessageType } from '@/types';

interface MessageStore {
  messages: Map<string, FullMessageType[]>;
  pendingMessages: Map<string, FullMessageType[]>;
  addMessage: (conversationId: string, message: FullMessageType) => void;
  addPendingMessage: (conversationId: string, message: FullMessageType) => void;
  confirmMessage: (conversationId: string, tempId: string, confirmedMessage: FullMessageType) => void;
  failMessage: (conversationId: string, tempId: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  setMessages: (conversationId: string, messages: FullMessageType[]) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: new Map(),
  pendingMessages: new Map(),

  setMessages: (conversationId, messages) => 
    set((state) => {
      const newMessages = new Map(state.messages);
      newMessages.set(conversationId, messages);
      return { messages: newMessages };
    }),

  addMessage: (conversationId, message) =>
    set((state) => {
      const conversationMessages = state.messages.get(conversationId) || [];
      const newMessages = new Map(state.messages);
      newMessages.set(conversationId, [...conversationMessages, message]);
      return { messages: newMessages };
    }),

  addPendingMessage: (conversationId, message) =>
    set((state) => {
      const pendingMessages = state.pendingMessages.get(conversationId) || [];
      const newPendingMessages = new Map(state.pendingMessages);
      newPendingMessages.set(conversationId, [...pendingMessages, message]);
      return { pendingMessages: newPendingMessages };
    }),

  confirmMessage: (conversationId, tempId, confirmedMessage) =>
    set((state) => {
      // Remove from pending
      const pendingMessages = state.pendingMessages.get(conversationId) || [];
      const newPendingMessages = new Map(state.pendingMessages);
      newPendingMessages.set(
        conversationId,
        pendingMessages.filter((msg) => msg.id !== tempId)
      );

      // Add to confirmed messages
      const conversationMessages = state.messages.get(conversationId) || [];
      const newMessages = new Map(state.messages);
      newMessages.set(conversationId, [...conversationMessages, confirmedMessage]);

      return {
        messages: newMessages,
        pendingMessages: newPendingMessages,
      };
    }),

  failMessage: (conversationId, tempId) =>
    set((state) => {
      const pendingMessages = state.pendingMessages.get(conversationId) || [];
      const newPendingMessages = new Map(state.pendingMessages);
      const failedMessage = pendingMessages.find((msg) => msg.id === tempId);
      
      if (failedMessage) {
        failedMessage.status = 'failed';
        newPendingMessages.set(conversationId, [...pendingMessages]);
      }

      return { pendingMessages: newPendingMessages };
    }),

  deleteMessage: (conversationId, messageId) =>
    set((state) => {
      const conversationMessages = state.messages.get(conversationId) || [];
      const newMessages = new Map(state.messages);
      newMessages.set(
        conversationId,
        conversationMessages.filter((msg) => msg.id !== messageId)
      );
      return { messages: newMessages };
    }),
}));