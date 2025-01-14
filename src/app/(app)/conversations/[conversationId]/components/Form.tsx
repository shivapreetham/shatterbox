'use client'

import React, { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import useConversation from '@/app/hooks/useConversation';
import { useMessageStore } from '@/app/hooks/useMessageStore';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiPhoto, HiPaperAirplane } from 'react-icons/hi2';
import MessageInput from './MessageInput';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const messageSchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .refine((val) => {
      if (val.startsWith('@')) {
        return val.length <= 80;
      }
      return val.length <= 1000;
    }, {
      message: "Message exceeds maximum length"
    })
    .refine((val) => {
      if (val.startsWith('@')) {
        return val.split(' ').length <= 20;
      }
      return true;
    }, {
      message: "AI prompt cannot exceed 20 words"
    })
});

const Form = () => {
  const { conversationId } = useConversation();
  const session = useSession();
  const { addPendingMessage, confirmMessage, failMessage } = useMessageStore();
  
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const isSubmitting = useRef(false);
  const currentUploadController = useRef<AbortController | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm<FieldValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: ''
    }
  });

  const message = watch('message');

  // Cleanup function for ongoing requests
  useEffect(() => {
    return () => {
      if (currentUploadController.current) {
        currentUploadController.current.abort();
      }
    };
  }, []);

  const createOptimisticMessage = (messageText: string, imageUrl?: string) => {
    const tempId = uuidv4();
    return {
      id: tempId,
      body: messageText,
      image: imageUrl,
      conversationId,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      sender: session.data?.user || {},
      seen: []
    };
  };

  const processAICommand = async (prompt: string) => {
    setIsProcessingAI(true);
    const controller = new AbortController();
    currentUploadController.current = controller;

    try {
      const response = await axios.post('/api/chat/ai-autofill', {
        topic: prompt.substring(1)
      }, {
        signal: controller.signal
      });
      setValue('message', response.data.message);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      toast.error('AI processing failed. Please try again.');
      console.error('AI processing failed:', error);
    } finally {
      setIsProcessingAI(false);
      currentUploadController.current = null;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please use JPG, PNG or WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setIsUploadingFile(true);
    const controller = new AbortController();
    currentUploadController.current = controller;

    try {
      const fileName = `${conversationId}-${Date.now()}.jpg`;
      const optimisticMessage = createOptimisticMessage(message || '', URL.createObjectURL(file));
      addPendingMessage(conversationId, optimisticMessage);

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file, {
          abortSignal: controller.signal
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      // Send message with uploaded image
      const response = await axios.post('/api/chat/messages', {
        message: message || '',
        image: publicUrl,
        conversationId
      }, {
        signal: controller.signal
      });

      confirmMessage(conversationId, optimisticMessage.id, response.data);
      reset();
      
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Upload failed:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImageUrl(null);
      setIsUploadingFile(false);
      currentUploadController.current = null;
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsSendingMessage(true);

    const controller = new AbortController();
    currentUploadController.current = controller;

    try {
      if (data.message.startsWith('@')) {
        await processAICommand(data.message);
        return;
      }

      // Create and add optimistic message
      const optimisticMessage = createOptimisticMessage(data.message, data.imageUrl || imageUrl);
      addPendingMessage(conversationId, optimisticMessage);

      // Actual server request
      const response = await axios.post('/api/chat/messages', {
        message: data.message,
        image: data.imageUrl || imageUrl,
        conversationId
      }, {
        signal: controller.signal
      });

      // Confirm message on success
      confirmMessage(conversationId, optimisticMessage.id, response.data);
      reset();
      setImageUrl(null);

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Error sending message:', error);
      failMessage(conversationId, optimisticMessage.id);
      toast.error('Failed to send message. Please try again.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsSendingMessage(false);
      isSubmitting.current = false;
      currentUploadController.current = null;
    }
  };

  return (
    <div className="theme-transition relative">
      <div className="py-4 px-4 bg-card dark:bg-card/95 backdrop-blur-sm border-t border-border dark:border-border/50 flex items-center gap-2 lg:gap-4 w-full shadow-card">
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="hidden"
            id="file-upload"
            disabled={isUploadingFile || isSendingMessage}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer p-2 rounded-full hover:bg-muted transition-colors duration-200 block ${
              (isUploadingFile || isSendingMessage) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploadingFile ? (
              <div className="w-[30px] h-[30px] rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <HiPhoto 
                size={30} 
                className="text-primary hover:text-primary/80 transition-colors" 
              />
            )}
          </label>
        </div>
        
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-2 lg:gap-4 w-full"
        >
          <MessageInput
            id="message"
            register={register}
            errors={errors}
            required
            placeholder={message?.startsWith('@') ? "Enter AI prompt (max 20 words)" : "Type a message..."}
            disabled={isProcessingAI || isUploadingFile || isSendingMessage}
          />
          
          <button
            type="submit"
            disabled={isProcessingAI || isUploadingFile || isSendingMessage}
            className="rounded-full p-3 bg-primary hover:bg-primary/90 transition-colors duration-200 shadow-card hover:shadow-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingMessage ? (
              <div className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              <HiPaperAirplane 
                size={20} 
                className="text-primary-foreground" 
              />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;