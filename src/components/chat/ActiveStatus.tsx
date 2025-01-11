// components/ActiveStatus.tsx
'use client';

import { useEffect } from 'react';
import useActiveChannel from '@/app/hooks/useActiveChannel';

const ActiveStatus = () => {
  useActiveChannel();

  useEffect(() => {
    const handleBeforeUnload = () => {
      fetch('/api/chat/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: false }),
        keepalive: true
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return null;
};

export default ActiveStatus;