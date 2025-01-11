'use client';

import { z } from 'zod';
import useConversation from '@/app/hooks/useConversation';
import axios from 'axios';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiPhoto, HiPaperAirplane } from 'react-icons/hi2';
import { useState, useRef } from 'react';
import MessageInput from './MessageInput';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with correct key
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
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  const processAICommand = async (prompt: string) => {
    setIsProcessingAI(true);
    try {
      const response = await axios.post('/api/chat/ai-autofill', {
        topic: prompt.substring(1)
      });
      setValue('message', response.data.message);
    } catch (error) {
      console.error('AI processing failed:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      console.error('Invalid file type');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large');
      return;
    }

    setIsUploadingFile(true);
    try {
      // Create file path
      const fileName = `${conversationId}-${Date.now()}.jpg`;

      // Upload
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Get URL immediately after successful upload
      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);

      // Submit the message with the image URL
      await onSubmit({ message: message || '', imageUrl: publicUrl });
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImageUrl(null);

    } catch (error: any) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      if (data.message.startsWith('@')) {
        await processAICommand(data.message);
        return;
      }

      await axios.post('/api/chat/messages', {
        message: data.message,
        image: data.imageUrl || imageUrl,
        conversationId
      });

      // Reset form
      reset();
      setImageUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer p-2 rounded-full hover:bg-muted transition-colors duration-200 block ${
              isUploadingFile ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <HiPhoto 
              size={30} 
              className="text-primary hover:text-primary/80 transition-colors" 
            />
          </label>
          {errors.file && (
            <span className="text-destructive text-sm absolute -bottom-6 left-0 whitespace-nowrap">
              {errors.file.message?.toString()}
            </span>
          )}
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
            disabled={isProcessingAI || isUploadingFile}
          />
          
          <button
            type="submit"
            disabled={isProcessingAI || isUploadingFile}
            className="rounded-full p-3 bg-primary hover:bg-primary/90 transition-colors duration-200 shadow-card hover:shadow-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiPaperAirplane 
              size={20} 
              className="text-primary-foreground" 
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;