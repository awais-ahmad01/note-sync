
import { useState, useEffect } from 'react';
import AvatarUpload from './avatarUpload';
import { updateUserProfile } from '../lib/supabaseClient';

export default function ProfileSettings({ userData, onProfileUpdate }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar_url: null,
  });

  useEffect(() => {
    if (userData) {
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        avatar_url: userData.avatar_url,
      });
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await updateUserProfile({
        name: profile.name,
        avatar_url: profile.avatar_url,
      });

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      onProfileUpdate(); 
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = (avatarUrl) => {
    setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Information</h2>
        <p className="text-gray-400">
          Update your personal information and profile picture.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
 
        <AvatarUpload 
          currentAvatar={profile.avatar_url}
          onAvatarUpdate={handleAvatarUpdate}
        />
  <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={profile.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-[#1f202e] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter your full name"
          />
        </div>

      
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={profile.email}
            readOnly
            className="w-full px-4 py-3 bg-[#1a1b23] border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-gray-500">
            Email address cannot be changed. Contact support if you need to update it.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 cursor-pointer bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#1a1b23] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


