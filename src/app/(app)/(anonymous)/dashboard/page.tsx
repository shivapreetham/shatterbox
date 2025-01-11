'use client';
import { MessageCard } from '@/components/home&anonymous/AnonymousMessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/app/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Link, Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptAnonymousMessageSchema } from '@/schemas/acceptAnonymousMessageSchema';
import prisma from '@/lib/prismadb'; // Ensure prisma is imported
import { AnonymousMessage } from '@prisma/client';


function UserDashboard() {
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message.id !== messageId));
  };

  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(AcceptAnonymousMessageSchema),
    defaultValues: {
      acceptMessages: false
    }
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/anonymous/accept-messages');
      if (response.data.success && response.data.isAcceptingAnonymousMessages !== undefined) {
        setValue('acceptMessages', response.data.isAcceptingAnonymousMessages);
      } else {
        setValue('acceptMessages', false); // Default to false if undefined
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
      });
      setValue('acceptMessages', false); // Set to false on error
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>('/api/anonymous/get-messages');
        if (!response.data.success) {
          setMessages([]);
          if (refresh) {
            toast({
              title: 'No Messages',
              description: response.data.message,
            });
          }
          return;
        }
        setMessages(response.data.anonymousMessages || []);
        if (refresh) {
          toast({
            title: 'Success',
            description: 'Messages refreshed successfully',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description: axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'destructive',
        });
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );
  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/anonymous/accept-messages', {
        acceptAnonymousMessages: !acceptMessages,
      });
      
      if (response.data.success) {
        setValue('acceptMessages', !acceptMessages);
        toast({
          title: 'Success',
          description: response.data.message,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  if (!session || !session.user) {
    return <Link href="/sign-in">please Login</Link>;
  }

  const { username } = session.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="my-4 mx-4 md:mx-8 lg:mx-auto p-6 bg-gradient-to-br from-background via-secondary/5 to-background rounded-lg w-full max-w-6xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        <span className="text-primary hover:text-primary/90 transition-colors">{username}'s</span> Dashboard
      </h1>

      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2">Your Unique Link</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="w-full p-2 rounded-lg bg-secondary/10 border border-primary/10 focus:border-primary/20 transition-colors"
          />
          <Button 
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              toast({
                title: 'URL Copied!',
                description: 'Profile URL has been copied to clipboard.',
              });
            }}
            className="hover:shadow-md transition-all duration-200"
          >
            Copy
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
          className="data-[state=checked]:bg-primary"
        />
        <span>
          Accept Private Anonymous Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>

      <Separator className="mb-4 bg-primary/10" />

      <Button
        variant="outline"
        onClick={() => fetchMessages(true)}
        className="mb-4 hover:bg-secondary/10 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message: any) => (
            <MessageCard
              key={message.id}
              message={message}
              onMessageDelete={(id) => setMessages(messages.filter(m => m.id !== id))}
            />
          ))
        ) : (
          <p className="text-muted-foreground">No messages to display.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;