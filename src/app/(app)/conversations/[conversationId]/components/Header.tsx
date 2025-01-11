'use client'

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
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

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

const formatLastSeen = (lastSeenDate: Date | string | undefined): string => {
  if (!lastSeenDate) return 'Offline';

  try {
    const lastSeen = typeof lastSeenDate === 'string' ? new Date(lastSeenDate) : lastSeenDate;
    
    if (!(lastSeen instanceof Date) || isNaN(lastSeen.getTime())) {
      return 'Offline';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 30) return 'Active now';
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return lastSeen.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting last seen date:', error);
    return 'Offline';
  }
};

const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const otherUser:any = useOtherUser(conversation);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { members } = useActiveList();
  const { data: session } = useSession();

  const isAnonymous = conversation.isGroup && conversation.isAnonymous;

  const currentUserEmail = session?.user?.email;

  const otherMember = useMemo(() => {
    if (conversation.isGroup) return null;
    
    return members.find(member => 
      member.email === otherUser?.email && 
      member.email !== currentUserEmail
    );
  }, [members, otherUser?.email, currentUserEmail, conversation.isGroup]);

  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      if (isAnonymous) {
        return `${conversation.users.length} anonymous members`;
      }
      return `${conversation.users.length} members`;
    }
    
    if (otherMember) {
      if (otherMember.activeStatus) {
        return 'Active now';
      }
      return formatLastSeen(otherMember.lastSeen);
    }

    return 'Offline';
  }, [conversation, otherMember, isAnonymous]);

  const statusClass = useMemo(() => {
    if (isAnonymous) {
      return 'text-zinc-400';
    }
    if (conversation.isGroup) {
      return 'text-neutral-500 dark:text-neutral-400';
    }
    return otherMember?.activeStatus 
      ? 'text-emerald-500' 
      : 'text-neutral-500 dark:text-neutral-400';
  }, [conversation.isGroup, otherMember?.activeStatus, isAnonymous]);

  return (
    <>
      {!isAnonymous && (
        <ProfileDrawer
          data={conversation}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
      <div className="relative theme-transition">
        <div className={cn(
          "w-full flex border-b-[1px] px-4 py-3 lg:px-6 justify-between items-center shadow-card",
          isAnonymous
            ? "bg-zinc-900/95 backdrop-blur-sm border-zinc-800/50 shadow-zinc-900/20"
            : "bg-card dark:bg-card/95 backdrop-blur-sm border-border dark:border-border/50"
        )}>
          <div className="flex gap-4 items-center">
            <Link
              className={cn(
                "lg:hidden block transition cursor-pointer",
                isAnonymous
                  ? "text-zinc-200 hover:text-zinc-400"
                  : "text-primary hover:text-primary/80"
              )}
              href="/conversations"
            >
              <HiChevronLeft size={32} />
            </Link>

            <div className="relative">
              {isAnonymous ? (
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-2xl">🎭</span>
                </div>
              ) : conversation.isGroup ? (
                <AvatarGroup users={conversation.users} />
              ) : (
                <Avatar user={otherUser} />
              )}
              {otherMember?.activeStatus && !conversation.isGroup && (
                <span 
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" 
                  aria-label="Online status indicator"
                />
              )}
            </div>

            <div className="flex flex-col">
              <div className={cn(
                "font-medium",
                isAnonymous ? "text-zinc-200" : "text-foreground"
              )}>
                {isAnonymous ? "Anonymous Group" : conversation.name || otherUser?.name || otherUser?.email}
              </div>
              <div className={`text-sm font-light ${statusClass}`}>
                {statusText}
              </div>
            </div>
          </div>

          {!isAnonymous && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="Open conversation options"
            >
              <HiEllipsisHorizontal
                className="text-primary hover:text-primary/80 transition"
                size={32}
              />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;