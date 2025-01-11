'use client';

import Avatar from '@/components/chat/Avatar';
import { FullMessageType } from '@/types';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import Image from 'next/image';
import { useState } from 'react';
import ImageModal from './ImageModal';

interface MessageBoxProps {
  isLast: boolean;
  data: FullMessageType;
  isAnonymous?: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({ 
  isLast, 
  data,
  isAnonymous 
}) => {
  // console.log(isAnonymous);
  const session = useSession();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const isOwn = session?.data?.user?.email === data.sender?.email;
  const seenList = (data.seen || [])
    .filter((user: any) => user.email !== session?.data?.user?.email)
    .map((user: any) => user.name)
    .join(', ');

  const container = clsx(
    'flex gap-3 p-4',
    isOwn && 'justify-end'
  );

  const avatar = clsx(
    'transition-opacity',
    isOwn && 'order-2',
    isAnonymous ? 'opacity-100' : 'hover:opacity-75'
  );

  const body = clsx(
    'flex flex-col gap-2',
    isOwn && 'items-end'
  );

  const message = clsx(
    'text-sm w-fit overflow-hidden shadow-card theme-transition',
    isAnonymous 
      ? (isOwn 
          ? 'bg-zinc-800 text-zinc-200' 
          : 'bg-zinc-900 text-zinc-300')
      : (isOwn 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary text-secondary-foreground'),
    data.image ? 'rounded-lg p-0' : 'rounded-2xl py-2 px-4',
    'hover:shadow-card-hover'
  );

  const timeStamp = clsx(
    'text-xs',
    isAnonymous ? 'text-zinc-500' : 'text-muted-foreground'
  );

  const senderName = clsx(
    'text-sm font-medium',
    isAnonymous ? 'text-zinc-500' : 'text-muted-foreground'
  );

  const seenText = clsx(
    'text-xs font-light',
    isAnonymous ? 'text-zinc-600' : 'text-muted-foreground'
  );

  const AnonymousAvatar = () => (
    <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
      <Image
        src="/image.jpg"
        alt="Anonymous"
        width={36}
        height={36}
        className="rounded-full"
      />
    </div>
  );

  return (
    <div className={container}>
      <div className={avatar}>
        {isAnonymous ? (
          <AnonymousAvatar />
        ) : (
          <Avatar user={data.sender} />
        )}
      </div>

      <div className={body}>
        <div className="flex items-center gap-2">
          <div className={senderName}>
            {isAnonymous 
              ? `Anonymous ${isOwn ? '(You)' : 'User'}`
              : (data.sender?.username || data.sender?.email)
            }
          </div>
          <div className={timeStamp}>
            {format(new Date(data.createdAt), 'p')}
          </div>
        </div>

        <div className={message}>
          <ImageModal
            isOpen={isImageModalOpen}
            src={data.image}
            onClose={() => setIsImageModalOpen(false)}
          />
          {data.image ? (
            <Image
              onClick={() => setIsImageModalOpen(true)}
              src={data.image}
              width={288}
              height={288}
              alt="image"
              className="object-cover cursor-pointer rounded-lg hover:scale-105"
            />
          ) : (
            <div className="max-w-sm break-words">{data.body}</div>
          )}
        </div>

        {isLast && isOwn && seenList && !isAnonymous && (
          <div className={seenText}>
            Seen by {seenList}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBox;