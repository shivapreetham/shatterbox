// components/ActiveStatus.tsx
'use client';

import { useEffect } from 'react';
import useActiveChannel from '@/app/hooks/useActiveChannel';

const ActiveStatus = () => {
  useActiveChannel();

  useEffect(() => {
    // Set initial online status
    fetch('/api/users/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: true })
    });

    const handleBeforeUnload = async () => {
      const blob = new Blob(
        [JSON.stringify({ isOnline: false })],
        { type: 'application/json' }
      );
      navigator.sendBeacon('/api/users/status', blob);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return null;
};

export default ActiveStatus;
