
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Users, BarChart3, FileText } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { id: 'all-notes', label: 'All Notes', icon: FileText, link: '/notes' },
      { id: 'private', label: 'Private Notes', icon: Users, link: '/private-notes' },
     { id: 'shared-by-me', label: 'Shared By Me', icon: Users, link: '/shared-by-me' },
    { id: 'shared-with-me', label: 'Shared with Me', icon: Users, link: '/shared-notes' },
    { id: 'activity', label: 'Activity Log', icon: BarChart3, link: '/activity-logs' },
  ];

  
  const isActive = (link) => {
    if (link === '/notes') {
     
      return pathname === '/notes' || pathname.startsWith('/notes');
    }
    return pathname === link || pathname.startsWith(link);
  };

  return (
    <aside className="w-64 bg-[#1a1d2e] border-r border-gray-800 flex flex-col h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-400">NoteSync Pro</h1>
      </div>
      
      <nav className="flex-1 px-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.link);
          
          return (
            <Link href={item.link} key={item.id}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-[#252837] hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">Awais Ahmad</p>
            <p className="text-xs text-gray-400 truncate">awais@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;