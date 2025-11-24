
"use client";
import { useState, useEffect } from 'react';
import { LogOut, Bell } from 'lucide-react';
import { getCurrentUserProfile, supabase } from '../lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useActivityLogs } from '../contexts/activityLogsContext';

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useActivityLogs();

 
  const isActivityLogsPage = pathname?.includes('/activity-logs');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data: profile, error } = await getCurrentUserProfile();
      
      if (error) throw error;
      
      setUser(profile);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      setLogoutLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      router.push('/sign-in');
      router.refresh(); 
      
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setLogoutLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarDisplay = () => {
    if (user?.avatar_url) {
      return (
        <img
          src={user.avatar_url}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-[#B22222]"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 bg-[#B22222] rounded-full flex items-center justify-center text-white font-semibold text-xs">
        {getInitials(user?.name || user?.email)}
      </div>
    );
  };

  return (
    <header className="bg-[#FAFAFA] border-b border-[#E0E0E0] px-6 py-3 flex items-center justify-between flex-shrink-0">
      {/* Empty space on left for balance */}
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E0E0E0] rounded-full animate-pulse"></div>
            <div className="hidden md:block space-y-2">
              <div className="h-4 bg-[#E0E0E0] rounded animate-pulse w-20"></div>
              <div className="h-3 bg-[#E0E0E0] rounded animate-pulse w-16"></div>
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3">
           
            <Link href="/activity-logs">
              <button
                className={`relative text-[#666666] hover:text-[#B22222] hover:bg-[#FFE5E5] rounded-lg transition-colors p-2 ${
                  isActivityLogsPage ? 'bg-[#FFE5E5] text-[#B22222]' : ''
                }`}
                title="Activity Logs"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B22222] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </Link>

      
            <div className="flex items-center gap-3">
              {getAvatarDisplay()}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-[#2E2E2E]">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-[#999999]">
                  {user.email}
                </p>
              </div>
            </div>
            
           
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="text-[#666666] hover:text-[#B22222] hover:bg-[#FFE5E5] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              {logoutLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#B22222]"></div>
                </div>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
           
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E0E0E0] rounded-full flex items-center justify-center text-[#2E2E2E] font-semibold text-xs">
                U
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-[#2E2E2E]">User</p>
                <p className="text-xs text-[#999999]">Not logged in</p>
              </div>
            </div>
            
            
            <Link href="/sign-in" className="block">
              <button
                className="text-[#666666] hover:text-[#B22222] hover:bg-[#FFE5E5] rounded-lg transition-colors p-2"
                title="Login"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;