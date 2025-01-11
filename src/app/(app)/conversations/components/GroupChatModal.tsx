import React from 'react';
import Modal from '@/components/chat/Modal';
import Input from '@/components/chat/input/Input';
import Select from '@/components/chat/input/Select';
import { User } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface GroupChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
  users: User[];
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({ isOpen, onClose, users }) => {
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
      isAnonymous: false
    },
  });

  const members = watch('members');
  const isAnonymous = watch('isAnonymous');

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    axios
      .post('/api/chat/conversations', {
        ...data,
        isGroup: true,
        isAnonymous: data.isAnonymous,
        theme: 'system'
      })
      .then(() => {
        router.refresh();
        onClose();
        toast.success('Group chat created!');
        router.push('/conversations');
      })
      .catch(() => toast.error('Failed to create group chat'))
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            {isAnonymous ? "Create Anonymous Group" : "Create Group Chat"}
          </CardTitle>
          <CardDescription>
            {isAnonymous 
              ? "Create a private space where identities remain hidden" 
              : "Start a conversation with multiple people"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <Input
              label={isAnonymous ? "Group Alias" : "Group Name"}
              id="name"
              register={register}
              errors={errors}
              disabled={isLoading}
              required
            />
            
            <Select
              disabled={isLoading}
              label="Add Members"
              options={users.map((user) => ({
                label: user.username,
                value: user.id,
              }))}
              onChange={(value) => setValue('members', value, { 
                shouldValidate: true 
              })}
              value={members}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="isAnonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => 
                  setValue('isAnonymous', checked)
                }
              />
              <Label htmlFor="isAnonymous" className="text-sm">
                Enable Anonymous Mode
              </Label>
            </div>

            {isAnonymous && (
              <div className="rounded-lg bg-secondary/50 p-4 border border-secondary">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-secondary-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-secondary-foreground">
                      Anonymous Mode Features
                    </p>
                    <ul className="text-sm space-y-1 text-secondary-foreground/90">
                      <li>• Messages sent without revealing identities</li>
                      <li>• Hidden profile information</li>
                      <li>• Enhanced privacy for open discussions</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              {isAnonymous ? "Create Anonymous Group" : "Create Group"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
};

export default GroupChatModal;