
import { useState, useRef, useEffect } from 'react';
import { uploadAvatar } from '../lib/supabaseClient';

export default function AvatarUpload({ currentAvatar, onAvatarUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreviewUrl(currentAvatar);
  }, [currentAvatar]);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

   
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
    
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      
      const avatarUrl = await uploadAvatar(file);
      onAvatarUpdate(avatarUrl);

    
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      alert('Failed to upload image: ' + error.message);
      setPreviewUrl(currentAvatar);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    onAvatarUpdate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center space-x-6">
  
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-[#1f202e] flex items-center justify-center overflow-hidden border-2 border-gray-600">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl text-gray-500">👤</span>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-400 border-t-transparent"></div>
          </div>
        )}
      </div>


      <div className="flex-1 space-y-3">
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 cursor-pointer text-sm bg-[#1f202e] text-gray-300 border border-gray-600 rounded-lg shadow-sm hover:bg-[#252837] hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Uploading...
              </div>
            ) : (
              'Change Avatar'
            )}
          </button>
          
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="px-4 py-2 cursor-pointer text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg shadow-sm hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500">
          JPG, PNG or GIF. Max 5MB.
        </p>
      </div>
    </div>
  );
}