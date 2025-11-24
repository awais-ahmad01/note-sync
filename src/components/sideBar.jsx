
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
    <aside className={`bg-[#EBEBEB] border-r border-[#E0E0E0] flex flex-col h-screen transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
     
      <div className="p-4 border-b border-[#E0E0E0] flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-[#2E2E2E]">NoteSync Pro</h1>
        )}
        
        <button
          onClick={toggleSidebar}
          className="text-[#666666] hover:text-[#2E2E2E] transition-colors p-1 rounded-lg hover:bg-[#E0E0E0]"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
      
     
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.link);
          
          return (
            <Link href={item.link} key={item.id}>
              <button
                className={`w-full flex items-center rounded-lg mb-2 transition-colors ${
                  active
                    ? 'bg-[#DCDCDC] text-[#2E2E2E]'
                    : 'text-[#666666] hover:bg-[#E0E0E0] hover:text-[#2E2E2E]'
                } ${
                  isCollapsed 
                    ? 'justify-center p-3' 
                    : 'px-4 py-3 gap-3'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;