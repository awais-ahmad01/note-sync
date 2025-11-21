// "use client";
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Lock, Users, BarChart3, FileText, Settings, LogOut } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { getCurrentUserProfile, supabase } from '../lib/supabaseClient';
// import { useRouter } from 'next/navigation';

// const Sidebar = () => {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [logoutLoading, setLogoutLoading] = useState(false);

//   const menuItems = [
//     { id: 'all-notes', label: 'All Notes', icon: FileText, link: '/notes' },
//     { id: 'private', label: 'Private Notes', icon: Lock, link: '/private-notes' },
//     { id: 'shared-by-me', label: 'Shared By Me', icon: Users, link: '/shared-by-me' },
//     { id: 'shared-with-me', label: 'Shared with Me', icon: Users, link: '/shared-with-me' },
//     { id: 'activity', label: 'Activity Log', icon: BarChart3, link: '/activity-logs' },
//     { id: 'settings', label: 'Settings', icon: Settings, link: '/settings' },
//   ];

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

//   const isActive = (link) => {
//     if (link === '/notes') {
//       return pathname === '/notes' || pathname.startsWith('/notes');
//     }
//     return pathname === link || pathname.startsWith(link);
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
//           className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
//         />
//       );
//     }
    
//     return (
//       <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
//         {getInitials(user?.name || user?.email)}
//       </div>
//     );
//   };

//   return (
//     <aside className="w-64 bg-[#1a1d2e] border-r border-gray-800 flex flex-col h-screen">
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-indigo-400">NoteSync Pro</h1>
//       </div>
      
//       <nav className="flex-1 px-3 overflow-y-auto">
//         {menuItems.map((item) => {
//           const Icon = item.icon;
//           const active = isActive(item.link);
          
//           return (
//             <Link href={item.link} key={item.id}>
//               <button
//                 className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg mb-2 transition-colors ${
//                   active
//                     ? 'bg-indigo-600 text-white'
//                     : 'text-gray-400 hover:bg-[#252837] hover:text-gray-300'
//                 }`}
//               >
//                 <Icon className="w-5 h-5" />
//                 <span className="font-medium">{item.label}</span>
//               </button>
//             </Link>
//           );
//         })}
//       </nav>
      
//       <div className="p-4 border-t border-gray-800">
//         {loading ? (
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
//             <div className="flex-1 min-w-0 space-y-2">
//               <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
//               <div className="h-3 bg-gray-700 rounded animate-pulse"></div>
//             </div>
//           </div>
//         ) : user ? (
//           <div className="space-y-3">
        
//             <div className="flex items-center gap-3">
//               {getAvatarDisplay()}
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-200 truncate">
//                   {user.name || 'User'}
//                 </p>
//                 <p className="text-xs text-gray-400 truncate">
//                   {user.email}
//                 </p>
//               </div>
//             </div>
            
          
//             <button
//               onClick={handleLogout}
//               disabled={logoutLoading}
//               className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <LogOut className="w-4 h-4" />
//               <span className="font-medium">
//                 {logoutLoading ? 'Logging out...' : 'Logout'}
//               </span>
//               {logoutLoading && (
//                 <div className="ml-auto animate-spin rounded-full h-3 w-3 border-b-2 border-red-400"></div>
//               )}
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-3">
           
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
//                 U
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-200 truncate">User</p>
//                 <p className="text-xs text-gray-400 truncate">Not logged in</p>
//               </div>
//             </div>
            
//             {/* Login Button */}
//             <Link href="/auth/login" className="block">
//               <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
//                 <LogOut className="w-4 h-4" />
//                 <span className="font-medium">Login</span>
//               </button>
//             </Link>
//           </div>
//         )}
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;



// "use client";
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Lock, Users, BarChart3, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
// import { useState } from 'react';

// const Sidebar = () => {
//   const pathname = usePathname();
//   const [isCollapsed, setIsCollapsed] = useState(true);

//   const menuItems = [
//     { id: 'all-notes', label: 'All Notes', icon: FileText, link: '/notes' },
//     { id: 'private', label: 'Private Notes', icon: Lock, link: '/private-notes' },
//     { id: 'shared-by-me', label: 'Shared By Me', icon: Users, link: '/shared-by-me' },
//     { id: 'shared-with-me', label: 'Shared with Me', icon: Users, link: '/shared-with-me' },
//     { id: 'activity', label: 'Activity Log', icon: BarChart3, link: '/activity-logs' },
//     { id: 'settings', label: 'Settings', icon: Settings, link: '/settings' },
//   ];

//   const isActive = (link) => {
//     if (link === '/notes') {
//       return pathname === '/notes' || pathname.startsWith('/notes');
//     }
//     return pathname === link || pathname.startsWith(link);
//   };

//   const toggleSidebar = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   return (
//     <aside className={`bg-[#1a1d2e] border-r border-gray-800 flex flex-col h-screen transition-all duration-300 ${
//       isCollapsed ? 'w-16' : 'w-64'
//     }`}>
//       {/* Header with Toggle Button */}
//       <div className="p-4 border-b border-gray-800 flex items-center justify-between">
//         {isCollapsed ? (
//           <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
//             N
//           </div>
//         ) : (
//           <h1 className="text-2xl font-bold text-indigo-400">NoteSync Pro</h1>
//         )}
        
//         <button
//           onClick={toggleSidebar}
//           className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
//         >
//           {isCollapsed ? (
//             <ChevronRight className="w-4 h-4" />
//           ) : (
//             <ChevronLeft className="w-4 h-4" />
//           )}
//         </button>
//       </div>
      
//       {/* Navigation Menu */}
//       <nav className="flex-1 px-3 py-4 overflow-y-auto">
//         {menuItems.map((item) => {
//           const Icon = item.icon;
//           const active = isActive(item.link);
          
//           return (
//             <Link href={item.link} key={item.id}>
//               <button
//                 className={`w-full flex items-center rounded-lg mb-2 transition-colors ${
//                   active
//                     ? 'bg-indigo-600 text-white'
//                     : 'text-gray-400 hover:bg-[#252837] hover:text-gray-300'
//                 } ${
//                   isCollapsed 
//                     ? 'justify-center p-3' 
//                     : 'px-4 py-3 gap-3'
//                 }`}
//                 title={isCollapsed ? item.label : ''}
//               >
//                 <Icon className="w-5 h-5" />
//                 {!isCollapsed && (
//                   <span className="font-medium">{item.label}</span>
//                 )}
//               </button>
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;





"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Users, BarChart3, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const menuItems = [
    { id: 'all-notes', label: 'All Notes', icon: FileText, link: '/notes' },
    { id: 'private', label: 'Private Notes', icon: Lock, link: '/private-notes' },
    { id: 'shared-by-me', label: 'Shared By Me', icon: Users, link: '/shared-by-me' },
    { id: 'shared-with-me', label: 'Shared with Me', icon: Users, link: '/shared-with-me' },
    { id: 'activity', label: 'Activity Log', icon: BarChart3, link: '/activity-logs' },
    { id: 'settings', label: 'Settings', icon: Settings, link: '/settings' },
  ];

  const isActive = (link) => {
    if (link === '/notes') {
      return pathname === '/notes' || pathname.startsWith('/notes');
    }
    return pathname === link || pathname.startsWith(link);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-[#1a1d2e] border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header with Toggle Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        {isCollapsed ? (
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
        ) : (
          <h1 className="text-xl font-bold text-white">NoteSync Pro</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.link);

          return (
            <Link
              key={item.id}
              href={item.link}
              className={`flex items-center gap-3 px-3 py-3 mb-2 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;