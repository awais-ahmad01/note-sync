
import { useState } from 'react';
import { updatePassword } from '../lib/supabaseClient';

export default function PasswordSettings() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(passwords.newPassword);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setPasswords(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2E2E2E] mb-2">Change Password</h2>
        <p className="text-[#666666]">
          Update your password to keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-[#2E2E2E] mb-2">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            value={passwords.currentPassword}
            onChange={handleChange('currentPassword')}
            className="w-full px-4 py-3 bg-white border border-[#E0E0E0] rounded-lg text-[#2E2E2E] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:border-[#B22222] transition-colors"
            placeholder="Enter current password"
            required
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-[#2E2E2E] mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={passwords.newPassword}
            onChange={handleChange('newPassword')}
            className="w-full px-4 py-3 bg-white border border-[#E0E0E0] rounded-lg text-[#2E2E2E] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:border-[#B22222] transition-colors"
            placeholder="Enter new password"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2E2E2E] mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange('confirmPassword')}
            className="w-full px-4 py-3 bg-white border border-[#E0E0E0] rounded-lg text-[#2E2E2E] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:border-[#B22222] transition-colors"
            placeholder="Confirm new password"
            required
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-[#E8F5E9] text-[#388E3C] border-[#81C784]'
                : 'bg-[#FFEBEE] text-[#D32F2F] border-[#EF9A9A]'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 cursor-pointer bg-[#B22222] text-white rounded-lg shadow-sm hover:bg-[#8B0000] focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}