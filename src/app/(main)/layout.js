
"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sideBar";
import Header from "../../components/header";
import NotesSidebar from "../../components/notesSidebar";
import { supabase } from "../../lib/supabaseClient";
import { usePathname } from "next/navigation";

const NoteSyncLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      console.error('Error in getUser:', error);
    }
  };

  const shouldShowNotesSidebar = () => {
    const notePages = [
      '/notes',
      '/private-notes', 
      '/shared-by-me',
      '/shared-with-me'
    ];
    
    return notePages.some(page => 
      pathname === page || 
      pathname.startsWith('/notes/') || 
      (page !== '/notes' && pathname.startsWith(page))
    );
  };

  const showNotesSidebar = shouldShowNotesSidebar();

  return (
    <div className="flex h-screen bg-white overflow-hidden">
    
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      
     
      <div className="flex-1 flex flex-col overflow-hidden">
       
        <Header />
        
      
        <div className="flex-1 flex overflow-hidden">
        
          {showNotesSidebar && (
            <NotesSidebar 
              sidebarCollapsed={sidebarCollapsed}
              currentUser={currentUser}
            />
          )}

      
          <div className={`flex-1 flex flex-col overflow-hidden bg-white ${
            !showNotesSidebar ? 'w-full' : ''
          }`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteSyncLayout;