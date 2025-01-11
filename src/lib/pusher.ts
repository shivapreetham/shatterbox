// lib/pusher.ts
import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Type definitions for better TypeScript support
type PusherConnectionState = 'connecting' | 'connected' | 'disconnected' | 'failed' | 'unavailable';

interface PusherStateChange {
  current: PusherConnectionState;
  previous: PusherConnectionState;
}

// Server instance
export const pusherServer = new PusherServer({
  appId: "1921962",
  key: "feb370272fdb536a6de7",
  secret: "4d4eb6d9706204c37bf4",
  cluster: "ap2",
  useTLS: true
});

// Client instance
export const pusherClient = new PusherClient(
  "feb370272fdb536a6de7", // Use the actual key instead of env variable since it's public anyway
  {
    cluster: "ap2",
    authEndpoint: '/api/pusher/auth',
    authTransport: 'ajax', // Changed from transport to authTransport
    auth: {
      headers: {
        'Content-Type': 'application/json', // Changed to application/json for better compatibility
      },
    },
    enabledTransports: ['ws', 'wss'], // Explicitly enable WebSocket transports
  }
);

// Enhanced error handling with specific error types
pusherClient.connection.bind('error', (err: Error) => {
  console.error('Pusher connection error:', {
    message: err.message,
    name: err.name,
    stack: err.stack
  });
  
  // Attempt to reconnect on error
  if (pusherClient.connection.state !== 'connected') {
    setTimeout(() => {
      pusherClient.connect();
    }, 3000);
  }
});

// Enhanced state change logging with type safety
pusherClient.connection.bind('state_change', (states: PusherStateChange) => {
  console.log('Pusher connection state changed:', {
    current: states.current,
    previous: states.previous,
    timestamp: new Date().toISOString()
  });

  // Handle specific state changes
  switch (states.current) {
    case 'connected':
      console.log('Successfully connected to Pusher');
      break;
    case 'connecting':
      console.log('Attempting to connect to Pusher');
      break;
    case 'disconnected':
    case 'failed':
      console.log('Lost connection to Pusher, attempting to reconnect...');
      break;
    case 'unavailable':
      console.log('Pusher is unavailable, check your internet connection');
      break;
  }
});

// Add connection success handler
pusherClient.connection.bind('connected', () => {
  console.log('Successfully connected to Pusher presence channel');
});

// Add subscription error handling
pusherClient.bind('pusher:subscription_error', (status: number) => {
  console.error('Pusher subscription error:', status);
});

// Export a helper function to check connection status
export const isPusherConnected = () => {
  return pusherClient.connection.state === 'connected';
};