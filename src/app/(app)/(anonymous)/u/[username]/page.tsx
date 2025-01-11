'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardContent, Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/app/hooks/use-toast';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import { anonymousMessageSchema as messageSchema } from '@/schemas/anonymousMessageSchema';
import { ModeToggle } from '@/components/home&anonymous/ModeToggle';

const specialChar = '||';
const initialMessageString = " You've got that cool vibe; people notice it! || A little boost in confidence could go a long way! || I love how you bring your ideas to life—keep it up!";

const parseStringMessages = (messageString: string): string[] => messageString.split(specialChar);

export default function SendMessage() {
  const { username } = useParams<{ username: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [messages, setMessages] = useState<string>(initialMessageString);
  const [topic, setTopic] = useState<string>('');

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/anonymous/send-messages', {
        ...data,
        username,
      });
      toast({
        title: response.data.message,
        variant: 'default',
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    if (!topic.trim()) return;
    setIsLoadingSuggestions(true);
    try {
      const response = await axios.post<ApiResponse>('/api/anonymous/suggest-messages', { topic });
      setMessages(response.data.message);
      toast({ title: "Suggestions updated", variant: 'default' });
    } catch (error) {
      toast({ title: "Error fetching suggestions", variant: 'destructive' });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <div className="container mx-auto my-3 p-6 bg-gradient-to-br from-background via-background/95 to-background/90 rounded-lg shadow-sm max-w-4xl">
      <h1 className="text-2xl sm:text-4xl font-bold mb-8 text-center">
        Send Anonymous Messages to <span className="text-primary border-b-2 border-primary/70 hover:border-primary transition-colors">{username}</span>
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none bg-input/50 backdrop-blur-sm font-mono hover:bg-input/70 transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            <Button type="submit" disabled={isLoading || !messageContent} 
                    className="hover:shadow-md transition-all duration-200">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : 'Send It'}
            </Button>
          </div>
        </form>
      </Form>

      <Separator className="my-6 bg-primary/10" />

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <h3 className="text-md font-semibold">Topic for message suggestion:</h3>
          <div className="flex gap-3">
            <Input 
              className="bg-input/50 hover:bg-input/70 transition-colors"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic"
            />
            <Button onClick={fetchSuggestedMessages} 
                    className="hover:shadow-md transition-all duration-200"
                    disabled={!topic.trim() || isLoadingSuggestions}>
              Suggest
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm">Click any message to use it</p>
        
        <Card className="pt-5 bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-colors shadow-lg">
          <CardContent className="flex flex-col space-y-4">
            {isLoadingSuggestions ? (
              <div className="flex justify-center items-center p-20">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground">No messages found.</p>
            ) : (
              parseStringMessages(messages).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2 text-wrap min-h-fit bg-accent/50 hover:bg-accent/70 font-mono transition-colors"
                  onClick={() => form.setValue('content', message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6 bg-primary/10" />

      <div className="text-center space-y-4">
        <div className="text-muted-foreground">Get Your Anonymous Message Board</div>
        <Link href="/sign-up">
          <Button className="hover:shadow-md transition-all duration-200">Create Your Account</Button>
        </Link>
      </div>

      <div className="fixed top-4 right-4">
        <ModeToggle />
      </div>
    </div>
  );
}