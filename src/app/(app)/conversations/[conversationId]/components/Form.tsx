'use client';

import useConversation from '@/app/hooks/useConversation';
import axios from 'axios';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { HiPhoto, HiPaperAirplane } from 'react-icons/hi2';
import MessageInput from './MessageInput';
import { CldUploadButton } from 'next-cloudinary';

const Form = () => {
  const { conversationId } = useConversation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue('message', '', { shouldValidate: false });
    axios.post(`/api/chat/messages`, {
      ...data,
      conversationId,
    });
  };

  const handleUpload = (result: any) => {
    axios.post(`/api/chat/messages`, {
      image: result?.info?.secure_url,
      conversationId,
    });
  };

  return (
    <div className="theme-transition relative">
      <div className="py-4 px-4 bg-card dark:bg-card/95 backdrop-blur-sm border-t border-border dark:border-border/50 flex items-center gap-2 lg:gap-4 w-full shadow-card">
        <CldUploadButton
          options={{ maxFiles: 1 }}
          onUpload={handleUpload}
          uploadPreset="jkyytcex"
        >
          <button className="p-2 rounded-full hover:bg-muted transition-colors duration-200">
            <HiPhoto 
              size={30} 
              className="text-primary hover:text-primary/80 transition-colors" 
            />
          </button>
        </CldUploadButton>
        
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-2 lg:gap-4 w-full"
        >
          <MessageInput
            id="message"
            register={register}
            errors={errors}
            required
            placeholder="Type a message..."
          />
          
          <button
            type="submit"
            className="rounded-full p-3 bg-primary hover:bg-primary/90 transition-colors duration-200 shadow-card hover:shadow-card-hover"
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