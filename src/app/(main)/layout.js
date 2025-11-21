// // "use client";
// // import React, { useState } from "react";
// // import Sidebar from "../../components/sideBar";
// // import Header from "../../components/header";
// // import { supabase } from "../../lib/supabaseClient";

// // const NoteSyncLayout = ({ children }) => {
// //   const [activeItem, setActiveItem] = useState("all-notes");

// //   const handleNewNote = () => {
// //     console.log("Creating new note...");
// //   };

// //   return (
// //     <div className="flex h-screentext-white">
// //       <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />

// //       <div className="flex-1 flex flex-col">
// //         <Header onNewNote={handleNewNote} />
// //         <div className="bg-[#0f0f23]">{children}</div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default NoteSyncLayout;


// "use client";
// import React from "react";
// import Sidebar from "../../components/sideBar";
// import Header from "../../components/header";

// const NoteSyncLayout = ({ children }) => {
//   return (
//     <div className="flex h-screen bg-[#0f0f23] overflow-hidden">
     
//       <Sidebar />

   
//       <div className="flex-1 flex flex-col overflow-hidden">
       
//         <Header />
        
       
//         <main className="flex-1 overflow-y-auto bg-[#0f0f23]">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default NoteSyncLayout;



// "use client";
// import React, { useState } from "react";
// import Sidebar from "../../components/sideBar";
// import Header from "../../components/header";

// const NoteSyncLayout = ({ children }) => {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   return (
//     <div className="flex h-screen bg-[#0f0f23] overflow-hidden">
//       {/* Sidebar */}
//       <Sidebar onCollapseChange={setSidebarCollapsed} />
      
//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <Header />
        
//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto bg-[#0f0f23]">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default NoteSyncLayout;

// "use client";
// import React, { useState, useEffect } from "react";
// import Sidebar from "../../components/sideBar";
// import Header from "../../components/header";
// import NotesSidebar from "../../components/notesSidebar";
// import { supabase } from "../../lib/supabaseClient";
// import { usePathname } from "next/navigation";

// const NoteSyncLayout = ({ children }) => {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const pathname = usePathname();

//   // Fetch user
//   useEffect(() => {
//     getUser();
//   }, []);

//   const getUser = async () => {
//     try {
//       const { data: { user }, error } = await supabase.auth.getUser();
//       if (error) {
//         console.error('Error getting user:', error);
//         return;
//       }
//       setCurrentUser(user);
//     } catch (error) {
//       console.error('Error in getUser:', error);
//     }
//   };

//   // Determine if we should show the NotesSidebar
//   const shouldShowNotesSidebar = () => {
//     // Show notes sidebar only for note-related pages
//     const notePages = [
//       '/notes',
//       '/private-notes', 
//       '/shared-by-me',
//       '/shared-with-me'
//     ];
    
//     return notePages.some(page => 
//       pathname === page || 
//       pathname.startsWith('/notes/') || 
//       (page !== '/notes' && pathname.startsWith(page))
//     );
//   };

//   const showNotesSidebar = shouldShowNotesSidebar();

//   return (
//     <div className="flex h-screen bg-[#0f0f23] overflow-hidden">
//       {/* Main App Sidebar */}
//       <Sidebar onCollapseChange={setSidebarCollapsed} />
      
//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <Header />
        
//         {/* Main Content */}
//         <div className="flex-1 flex overflow-hidden">
//           {/* Notes Sidebar - Conditionally Rendered */}
//           {showNotesSidebar && (
//             <NotesSidebar 
//               sidebarCollapsed={sidebarCollapsed}
//               currentUser={currentUser}
//             />
//           )}

//           {/* Content Area */}
//           <div className={`flex-1 flex flex-col overflow-hidden bg-[#1a1b23] ${
//             !showNotesSidebar ? 'w-full' : ''
//           }`}>
//             {children}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NoteSyncLayout;



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
      {/* Main App Sidebar - Icon Column */}
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Notes Sidebar - Conditionally Rendered */}
          {showNotesSidebar && (
            <NotesSidebar 
              sidebarCollapsed={sidebarCollapsed}
              currentUser={currentUser}
            />
          )}

          {/* Content Area */}
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