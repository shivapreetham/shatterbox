'use client';

import { useState, useMemo } from 'react';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { CldUploadButton } from 'next-cloudinary';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  const handleUpload = (result: any) => {
    setImage(result?.info?.secure_url);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/profile', { image });
      router.refresh();
      toast.success('Profile picture updated!');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null; // Do not render if the modal is closed
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
                src={image || '/placeholder.jpg'}
                alt="Profile"
                fill
                className="rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CldUploadButton
                  options={{ maxFiles: 1 }}
                  onUpload={handleUpload}
                  uploadPreset="your-preset"
                >
                  <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
                    <span className="text-white text-sm">Change</span>
                  </div>
                </CldUploadButton>
              </div>
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
