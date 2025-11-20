// "use client";
// import React, { useState } from "react";
// import Sidebar from "../../components/sideBar";
// import Header from "../../components/header";
// import { supabase } from "../../lib/supabaseClient";

// const NoteSyncLayout = ({ children }) => {
//   const [activeItem, setActiveItem] = useState("all-notes");

//   const handleNewNote = () => {
//     console.log("Creating new note...");
//   };

//   return (
//     <div className="flex h-screentext-white">
//       <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />

//       <div className="flex-1 flex flex-col">
//         <Header onNewNote={handleNewNote} />
//         <div className="bg-[#0f0f23]">{children}</div>
//       </div>
//     </div>
//   );
// };

// export default NoteSyncLayout;


"use client";
import React from "react";
import Sidebar from "../../components/sideBar";
import Header from "../../components/header";

const NoteSyncLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#0f0f23] overflow-hidden">
     
      <Sidebar />

   
      <div className="flex-1 flex flex-col overflow-hidden">
       
        <Header />
        
       
        <main className="flex-1 overflow-y-auto bg-[#0f0f23]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default NoteSyncLayout;