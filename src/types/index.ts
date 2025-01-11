import { IUser } from '@/models/User';
import { IMessage } from '@/models/chat/ChatMessage';
import { IConversation } from '@/models/chat/ChatConversation';

export type FullMessageType = IMessage & {
  sender: IUser;
  seen: IUser[];
};

export type FullConversationType = IConversation & {
  users: IUser[];
  messages: FullMessageType[];
};
