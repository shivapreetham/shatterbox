'use client';

import Avatar from '@/components/chat/Avatar';
import useOtherUser from '@/app/hooks/useOtherUser';
import { Conversation, User } from '@prisma/client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HiChevronLeft } from 'react-icons/hi';
import { HiEllipsisHorizontal } from 'react-icons/hi2';
import ProfileDrawer from './ProfileDrawer';
import AvatarGroup from '@/components/chat/AvatarGroup';
import useActiveList from '@/app/hooks/useActiveList';

type ExtendedUser = Omit<User, "conversationIds" | "seenMessageIds"> & {
  conversationIds: string[];
  seenMessageIds: string[];
};

type FullConversationType = Omit<Conversation, "userIds" | "messagesIds"> & {
  userIds: string[];
  messagesIds: string[];
  users: ExtendedUser[];
};

interface HeaderProps {
  conversation: FullConversationType;
}

const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const otherUser = useOtherUser(conversation);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { members } = useActiveList();
  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} members`;
    }
    return isActive ? 'Active' : 'Offline';
  }, [conversation, isActive]);

  const statusClass = useMemo(() => {
    return isActive ? 'text-emerald-500' : 'text-neutral-500 dark:text-neutral-400';
  }, [isActive]);

  return (
    <>
      <ProfileDrawer
        data={conversation}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <div className="relative theme-transition">
        <div className="bg-card dark:bg-card/95 backdrop-blur-sm w-full flex border-b-[1px] border-border dark:border-border/50 px-4 py-3 lg:px-6 justify-between items-center shadow-card">
          <div className="flex gap-4 items-center">
            <Link
              className="lg:hidden block text-primary hover:text-primary/80 transition cursor-pointer"
              href="/conversations"
            >
              <HiChevronLeft size={32} />
            </Link>

            <div className="relative">
              {conversation.isGroup ? (
                <AvatarGroup users={conversation.users} />
              ) : (
                <Avatar user={otherUser} />
              )}
              {isActive && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
              )}
            </div>

            <div className="flex flex-col">
              <div className="font-medium text-foreground">
                {conversation.name || otherUser?.name || otherUser?.email}
              </div>
              <div className={`text-sm font-light ${statusClass}`}>
                {statusText}
              </div>
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
          >
            <HiEllipsisHorizontal
              className="text-primary hover:text-primary/80 transition"
              size={32}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;