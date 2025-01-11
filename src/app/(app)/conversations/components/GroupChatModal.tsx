'use client';

import Modal from '@/components/chat/Modal';
import Input from '@/components/chat/input/Input';
import Select from '@/components/chat/input/Select';
import { User } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '@/components/chat/Button';
import { HiUsers } from 'react-icons/hi2';

interface GroupChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
  users: User[];
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({
  isOpen,
  onClose,
  users,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      members: [],
    },
  });

  const members = watch('members');

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post('/api/chat/conversations', { ...data, isGroup: true })
      .then(() => {
        router.refresh();
        onClose();
        toast.success('Group chat created!');
        router.push(`/conversations`);
      })
      .catch((err) => toast.error(err.message || 'Something went wrong!'))
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-card dark:bg-card/95 p-6 rounded-lg shadow-card theme-transition">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center gap-4 border-b border-border/30 pb-6">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <HiUsers size={24} className="text-primary dark:text-primary/90" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Create a group chat
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a chat room with multiple participants
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Group name"
                  id="name"
                  register={register}
                  errors={errors}
                  disabled={isLoading}
                  required
                  className="bg-background dark:bg-card border-border/50 focus:border-primary/50 dark:border-border/30 dark:focus:border-primary/40"
                />
                <Select
                  disabled={isLoading}
                  label="Members"
                  options={users.map((user) => ({
                    label: user.username,
                    value: user.id,
                  }))}
                  onChange={(value) =>
                    setValue('members', value, { shouldValidate: true })
                  }
                  value={members}
                  className="bg-background dark:bg-card border-border/50 focus:border-primary/50 dark:border-border/30 dark:focus:border-primary/40"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-x-3 pt-6 border-t border-border/30">
              <Button
                disabled={isLoading}
                onClick={onClose}
                type="button"
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              >
                Cancel
              </Button>
              <Button 
                disabled={isLoading} 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create Group
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default GroupChatModal;