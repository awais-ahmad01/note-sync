// "use client";
// import Link from 'next/link';
// import { Plus } from 'lucide-react';

// const Header = () => {
//   return (
//     <header className="bg-[#1a1d2e] border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
//       <div className="flex-1 max-w-xl">
       
//       </div>
      
//       <div className="flex items-center gap-4 ml-6">
//         <Link href='/notes/new'>
//           <button
//             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
//           >
//             <Plus className="w-5 h-5" />
//             New Note
//           </button>
//         </Link>
//       </div>
//     </header>
//   );
// };

// export default Header;



// "use client";
// import { useState, useEffect } from 'react';
// import { LogOut, Plus } from 'lucide-react';
// import { getCurrentUserProfile, supabase } from '../lib/supabaseClient';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// const Header = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [logoutLoading, setLogoutLoading] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const loadUserData = async () => {
//     try {
//       setLoading(true);
//       const { data: profile, error } = await getCurrentUserProfile();
      
//       if (error) throw error;
      
//       setUser(profile);
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       setLogoutLoading(true);
//       const { error } = await supabase.auth.signOut();
      
//       if (error) {
//         throw error;
//       }
      
//       router.push('/sign-in');
//       router.refresh(); 
      
//     } catch (error) {
//       console.error('Error logging out:', error);
//       alert('Failed to log out. Please try again.');
//     } finally {
//       setLogoutLoading(false);
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return 'U';
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const getAvatarDisplay = () => {
//     if (user?.avatar_url) {
//       return (
//         <img
//           src={user.avatar_url}
//           alt="Profile"
//           className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500"
//         />
//       );
//     }
    
//     return (
//       <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
//         {getInitials(user?.name || user?.email)}
//       </div>
//     );
//   };

//   return (
//     <header className="bg-[#1a1d2e] border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
//       {/* Empty space on left for balance */}
//       <div className="flex-1"></div>
      
//       {/* User Section */}
//       <div className="flex items-center gap-4">
//         {loading ? (
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
//             <div className="hidden md:block space-y-2">
//               <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
//               <div className="h-3 bg-gray-700 rounded animate-pulse w-16"></div>
//             </div>
//           </div>
//         ) : user ? (
//           <div className="flex items-center gap-3">
//             {/* User Avatar and Info */}
//             <div className="flex items-center gap-3">
//               {getAvatarDisplay()}
//               <div className="hidden md:block text-right">
//                 <p className="text-sm font-medium text-gray-200">
//                   {user.name || 'User'}
//                 </p>
//                 <p className="text-xs text-gray-400">
//                   {user.email}
//                 </p>
//               </div>
//             </div>
            
//             {/* Logout Button */}
//             <button
//               onClick={handleLogout}
//               disabled={logoutLoading}
//               className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2"
//               title="Logout"
//             >
//               <LogOut className="w-4 h-4" />
//               {logoutLoading && (
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400"></div>
//                 </div>
//               )}
//             </button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-3">
//             {/* User Info for non-logged in */}
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-xs">
//                 U
//               </div>
//               <div className="hidden md:block text-right">
//                 <p className="text-sm font-medium text-gray-200">User</p>
//                 <p className="text-xs text-gray-400">Not logged in</p>
//               </div>
//             </div>
            
//             {/* Login Button */}
//             <Link href="/auth/login" className="block">
//               <button
//                 className="text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors p-2"
//                 title="Login"
//               >
//                 <LogOut className="w-4 h-4" />
//               </button>
//             </Link>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;



// "use client";
// import { useState, useEffect } from 'react';
// import { LogOut } from 'lucide-react';
// import { getCurrentUserProfile, supabase } from '../lib/supabaseClient';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// const Header = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [logoutLoading, setLogoutLoading] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const loadUserData = async () => {
//     try {
//       setLoading(true);
//       const { data: profile, error } = await getCurrentUserProfile();
      
//       if (error) throw error;
      
//       setUser(profile);
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       setLogoutLoading(true);
//       const { error } = await supabase.auth.signOut();
      
//       if (error) {
//         throw error;
//       }
      
//       router.push('/sign-in');
//       router.refresh(); 
      
//     } catch (error) {
//       console.error('Error logging out:', error);
//       alert('Failed to log out. Please try again.');
//     } finally {
//       setLogoutLoading(false);
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return 'U';
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const getAvatarDisplay = () => {
//     if (user?.avatar_url) {
//       return (
//         <img
//           src={user.avatar_url}
//           alt="Profile"
//           className="w-8 h-8 rounded-full object-cover border-2 border-[#B22222]"
//         />
//       );
//     }
    
//     return (
//       <div className="w-8 h-8 bg-[#B22222] rounded-full flex items-center justify-center text-white font-semibold text-xs">
//         {getInitials(user?.name || user?.email)}
//       </div>
//     );
//   };

//   return (
//     <header className="bg-[#FAFAFA] border-b border-[#E0E0E0] px-6 py-3 flex items-center justify-between flex-shrink-0">
//       {/* Empty space on left for balance */}
//       <div className="flex-1"></div>
      
//       {/* User Section */}
//       <div className="flex items-center gap-4">
//         {loading ? (
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-[#E0E0E0] rounded-full animate-pulse"></div>
//             <div className="hidden md:block space-y-2">
//               <div className="h-4 bg-[#E0E0E0] rounded animate-pulse w-20"></div>
//               <div className="h-3 bg-[#E0E0E0] rounded animate-pulse w-16"></div>
//             </div>
//           </div>
//         ) : user ? (
//           <div className="flex items-center gap-3">
//             {/* User Avatar and Info */}
//             <div className="flex items-center gap-3">
//               {getAvatarDisplay()}
//               <div className="hidden md:block text-right">
//                 <p className="text-sm font-medium text-[#2E2E2E]">
//                   {user.name || 'User'}
//                 </p>
//                 <p className="text-xs text-[#999999]">
//                   {user.email}
//                 </p>
//               </div>
//             </div>
            
//             {/* Logout Button */}
//             <button
//               onClick={handleLogout}
//               disabled={logoutLoading}
//               className="text-[#666666] hover:text-[#B22222] hover:bg-[#FFE5E5] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2"
//               title="Logout"
//             >
//               <LogOut className="w-4 h-4" />
//               {logoutLoading && (
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#B22222]"></div>
//                 </div>
//               )}
//             </button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-3">
//             {/* User Info for non-logged in */}
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-[#E0E0E0] rounded-full flex items-center justify-center text-[#2E2E2E] font-semibold text-xs">
//                 U
//               </div>
//               <div className="hidden md:block text-right">
//                 <p className="text-sm font-medium text-[#2E2E2E]">User</p>
//                 <p className="text-xs text-[#999999]">Not logged in</p>
//               </div>
//             </div>
            
//             {/* Login Button */}
//             <Link href="/auth/login" className="block">
//               <button
//                 className="text-[#666666] hover:text-[#B22222] hover:bg-[#FFE5E5] rounded-lg transition-colors p-2"
//                 title="Login"
//               >
//                 <LogOut className="w-4 h-4" />
//               </button>
//             </Link>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;




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

  // Check if we're on activity logs page
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
      
      {/* User Section */}
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
            {/* Activity Logs Notification Bell */}
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

            {/* User Avatar and Info */}
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
            
            {/* Logout Button */}
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
            {/* User Info for non-logged in */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E0E0E0] rounded-full flex items-center justify-center text-[#2E2E2E] font-semibold text-xs">
                U
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-[#2E2E2E]">User</p>
                <p className="text-xs text-[#999999]">Not logged in</p>
              </div>
            </div>
            
            {/* Login Button */}
            <Link href="/auth/login" className="block">
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