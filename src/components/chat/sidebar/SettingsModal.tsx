'use client';

import { useState, useMemo } from 'react';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/app/hooks/use-toast';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SettingsModalProps {
  currentUser: User;
  isOpen?: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  isOpen = false,
  onClose,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(currentUser?.image || '');

  // Parse user details from email
  const userDetails = useMemo(() => {
    const email = currentUser?.email || '';
    const match = email.match(/^(\d{4})(ug|pg)([a-z]+)/i);
    
    if (!match) return null;
    
    const [_, batch, program, branchCode] = match;
    
    const branchMap = {
      'cs': 'Computer Science and Engineering',
      'ec': 'Electronics and Communication Engineering',
      'ee': 'Electrical Engineering',
      'ce': 'Civil Engineering',
      'me': 'Mechanical Engineering',
      'mm': 'Metallurgical and Materials Engineering',
      'pi': 'Production and Industrial Engineering',
      'csca': 'Master in Computer Applications',
      'phd': 'PhD'
    };

    const programMap = {
      'ug': 'Undergraduate',
      'pg': 'Postgraduate'
    };
    return {
      batch,
      program: programMap[program.toLowerCase()],
      branch: branchMap[branchCode.toLowerCase()] || branchCode.toUpperCase()
    };
  }, [currentUser?.email]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload an image file"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Image size should be less than 5MB"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Replace if exists
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      setImage(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      if (currentUser?.image && currentUser.image.includes(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
        const oldFileName = currentUser.image.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('profile-images')
            .remove([oldFileName]);
        }
      }

      await axios.post('/api/chat/profile', { image });
      router.refresh();
      toast({
        title: "Success",
        description: "Profile picture updated!"
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="relative w-full max-w-md mx-4 p-6 bg-white dark:bg-gray-900 shadow-xl rounded-xl">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-32 w-32 group">
              <Image
                src={image || '/image.jpg'}
                alt="Profile"
                fill
                className="rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
              />
              <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
                  <Upload className="h-5 w-5 text-white" />
                </div>
              </label>
            </div>
          </div>

          {/* User Details */}
          {userDetails && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Batch</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{userDetails.batch}</div>
              </div>
              <div className="space-y-1 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{userDetails.program}</div>
              </div>
              <div className="col-span-2 space-y-1 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{userDetails.branch}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="dark:bg-gray-800 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || image === currentUser?.image}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsModal;