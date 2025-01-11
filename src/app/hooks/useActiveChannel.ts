// hooks/useActiveChannel.ts
import { Channel, Members } from 'pusher-js';
import { useState, useEffect } from 'react';
import { pusherClient } from '@/lib/pusher';
import useActiveList from './useActiveList';
import { useSession } from 'next-auth/react';

const useActiveChannel = () => {
  const { data: session } = useSession();
  const { set, add, remove, updateStatus } = useActiveList();
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;

    let channel = activeChannel;

    if (!channel) {
      channel = pusherClient.subscribe('presence-messenger');
      setActiveChannel(channel);
    }

    channel.bind('pusher:subscription_succeeded', (members: Members) => {
      const initialMembers: any[] = [];
      members.each((member: Record<string, any>) => {
        initialMembers.push({
          id: member.id,
          lastSeen: member.info?.lastSeen || new Date(),
          activeStatus: member.info?.activeStatus || false
        });
      });
      set(initialMembers);
    });

    channel.bind('pusher:member_added', (member: Record<string, any>) => {
      add({
        id: member.id,
        lastSeen: member.info?.lastSeen || new Date(),
        activeStatus: true
      });
    });

    channel.bind('pusher:member_removed', (member: Record<string, any>) => {
      updateStatus(member.id, {
        activeStatus: false,
        lastSeen: new Date()
      });
      remove(member.id);
    });

    // Handle window visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetch('/api/chat/users/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isOnline: true })
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (activeChannel) {
        fetch('/api/chat/users/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isOnline: false })
        }).finally(() => {
          pusherClient.unsubscribe('presence-messenger');
          setActiveChannel(null);
        });
      }
    };
  }, [session?.user?.email, activeChannel, add, remove, set, updateStatus]);
};

export default useActiveChannel;
