// "use client";
// import React, { useState, useEffect } from "react";
// import { supabase } from "../lib/supabaseClient";
// import { Plus, FileText, Search, Folder, Users, Lock, Share2, Calendar, User, Trash2 } from "lucide-react";
// import { usePathname, useRouter } from "next/navigation";
// import ShareModal from "./shareModal";

// const NotesSidebar = ({ sidebarCollapsed, currentUser }) => {
//   const [allNotes, setAllNotes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
//   const [selectedNote, setSelectedNote] = useState(null);
//   const pathname = usePathname();
//   const router = useRouter();

//   // Determine current section from pathname
//   const getCurrentSection = () => {
//     if (pathname.includes('/private-notes')) return 'private';
//     if (pathname.includes('/shared-by-me')) return 'shared-by-me';
//     if (pathname.includes('/shared-with-me')) return 'shared-with-me';
//     return 'all';
//   };

//   const currentSection = getCurrentSection();
//   const isNotePage = pathname.includes('/notes/') && !pathname.includes('/notes/new');
//   const noteId = isNotePage ? pathname.split('/notes/')[1] : null;

//   useEffect(() => {
//     if (currentUser) {
//       fetchAllNotes();
//     }
//   }, [currentUser]);

//   const fetchAllNotes = async () => {
//     try {
//       setLoading(true);
      
//       if (!currentUser) {
//         setAllNotes([]);
//         return;
//       }

//       console.log('Fetching notes for user:', currentUser.id);

//       // Fetch user's own notes
//       const { data: ownedNotes, error: ownedError } = await supabase
//         .from('notes')
//         .select('*')
//         .eq('owner_id', currentUser.id)
//         .order('updated_at', { ascending: false });

//       if (ownedError) {
//         console.error('Error fetching owned notes:', ownedError);
//         throw ownedError;
//       }

//       // Fetch shared notes (notes shared WITH the current user)
//       const { data: sharedWithMe, error: sharedError } = await supabase
//         .from('note_shares')
//         .select(`
//           note_id,
//           role,
//           notes:note_id (
//             *,
//             owner:user_profiles!fk_notes_owner_id(email, name)
//           )
//         `)
//         .eq('user_id', currentUser.id);

//       let notesData = [];

//       // Process owned notes - check if they have shares to determine if they're "shared by me"
//       if (ownedNotes) {
//         for (const note of ownedNotes) {
//           // Check if this note has any shares (meaning it's shared by me)
//           const { data: noteShares, error: sharesError } = await supabase
//             .from('note_shares')
//             .select('id')
//             .eq('note_id', note.id);

//           const hasShares = noteShares && noteShares.length > 0;
          
//           notesData.push({
//             ...note,
//             userRole: 'owner',
//             noteType: hasShares ? 'shared-by-me' : 'private',
//             canView: true,
//             canEdit: true,
//             sharedBy: currentUser.name || currentUser.email || 'You',
//             isOwner: true
//           });
//         }
//       }

//       // Process shared notes (notes shared WITH the current user)
//       if (!sharedError && sharedWithMe) {
//         const sharedNotesProcessed = sharedWithMe.map(share => ({
//           ...share.notes,
//           userRole: share.role,
//           noteType: 'shared-with-me',
//           sharedBy: share.notes.owner?.name || share.notes.owner?.email || 'Unknown User',
//           canView: true,
//           canEdit: share.role === 'editor' || share.role === 'owner',
//           isOwner: false
//         }));

//         // Add shared notes, avoiding duplicates with owned notes
//         sharedNotesProcessed.forEach(note => {
//           if (!notesData.find(n => n.id === note.id)) {
//             notesData.push(note);
//           }
//         });
//       }

//       setAllNotes(notesData);

//     } catch (error) {
//       console.error('Error fetching notes:', error);
//       setAllNotes([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter notes based on current section and search query
//   const getFilteredNotes = () => {
//     let filteredBySection = allNotes;

//     switch (currentSection) {
//       case 'private':
//         filteredBySection = allNotes.filter(note => note.noteType === 'private');
//         break;
//       case 'shared-by-me':
//         filteredBySection = allNotes.filter(note => note.noteType === 'shared-by-me');
//         break;
//       case 'shared-with-me':
//         filteredBySection = allNotes.filter(note => note.noteType === 'shared-with-me');
//         break;
//       case 'all':
//       default:
//         filteredBySection = allNotes.filter(note => note.canView);
//         break;
//     }

//     return filteredBySection.filter(note =>
//       note.title?.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   };

//   const handleDeleteNote = async (noteId, e) => {
//     e.stopPropagation();
    
//     if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
//       return;
//     }

//     try {
//       const { error } = await supabase
//         .from('notes')
//         .delete()
//         .eq('id', noteId);

//       if (error) {
//         throw error;
//       }

//       // Refresh the notes list
//       await fetchAllNotes();
//       console.log('Note deleted successfully');
      
//       // If we're currently viewing the deleted note, redirect to notes list
//       if (noteId === noteId) {
//         router.push('/notes');
//       }
//     } catch (error) {
//       console.error('Error deleting note:', error);
//       alert('Failed to delete note. Please try again.');
//     }
//   };

//   const handleShareNote = (note, e) => {
//     e.stopPropagation();
//     setSelectedNote(note);
//     setIsShareModalOpen(true);
//   };

//   const handleCloseShareModal = () => {
//     setIsShareModalOpen(false);
//     setSelectedNote(null);
//   };

//   const filteredNotes = getFilteredNotes();

//   const handleCreateNote = () => {
//     router.push('/notes/new');
//   };

//   const handleNoteSelect = (note) => {
//     if (note.canView) {
//       router.push(`/notes/${note.id}`);
//     }
//   };

//   const getNoteIcon = (note) => {
//     switch (note.noteType) {
//       case 'private':
//         return <Lock className="w-4 h-4" />;
//       case 'shared-by-me':
//         return <Share2 className="w-4 h-4" />;
//       case 'shared-with-me':
//         return <Users className="w-4 h-4" />;
//       default:
//         return <FileText className="w-4 h-4" />;
//     }
//   };

//   const getSectionTitle = () => {
//     switch (currentSection) {
//       case 'private':
//         return 'Private Notes';
//       case 'shared-by-me':
//         return 'Shared By Me';
//       case 'shared-with-me':
//         return 'Shared With Me';
//       default:
//         return 'All Notes';
//     }
//   };

//   const getSectionStats = () => {
//     switch (currentSection) {
//       case 'private':
//         return `${filteredNotes.length} private notes`;
//       case 'shared-by-me':
//         return `${filteredNotes.length} shared notes`;
//       case 'shared-with-me':
//         return `${filteredNotes.length} notes shared with you`;
//       default:
//         return `${filteredNotes.length} total notes`;
//     }
//   };

//   return (
//     <>
//       <div className={`bg-[#1a1b23] border-r border-gray-800 transition-all duration-300 ${
//         sidebarCollapsed ? 'w-0' : 'w-80'
//       } flex flex-col overflow-hidden`}>
//         {/* Sidebar Header */}
//         <div className="p-4 border-b border-gray-800">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-white flex items-center gap-2">
//               <Folder className="w-5 h-5" />
//               {getSectionTitle()}
//             </h2>
//             <button
//               onClick={handleCreateNote}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
//               title="Create new note"
//             >
//               <Plus className="w-4 h-4" />
//             </button>
//           </div>
          
//           {/* Search Bar */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Search notes..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full bg-[#252837] text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//             />
//           </div>

//           {/* Stats */}
//           <div className="mt-3">
//             <p className="text-xs text-gray-400">{getSectionStats()}</p>
//           </div>
//         </div>

//         {/* Notes List */}
//         <div className="flex-1 overflow-y-auto">
//           {loading ? (
//             <NotesLoadingSkeleton />
//           ) : filteredNotes.length > 0 ? (
//             <div className="p-2">
//               {filteredNotes.map((note) => (
//                 <NoteSidebarItem
//                   key={note.id}
//                   note={note}
//                   isSelected={noteId === note.id}
//                   onSelect={handleNoteSelect}
//                   onDelete={handleDeleteNote}
//                   onShare={handleShareNote}
//                   getNoteIcon={getNoteIcon}
//                 />
//               ))}
//             </div>
//           ) : (
//             <EmptyNotesState 
//               searchQuery={searchQuery}
//               currentSection={currentSection}
//               onCreateNote={handleCreateNote}
//               getSectionTitle={getSectionTitle}
//             />
//           )}
//         </div>
//       </div>

//       {/* Share Modal */}
//       {selectedNote && (
//         <ShareModal
//           isOpen={isShareModalOpen}
//           onClose={handleCloseShareModal}
//           noteTitle={selectedNote.title || "Untitled Note"}
//           noteId={selectedNote.id}
//         />
//       )}
//     </>
//   );
// };

// // Note Sidebar Item Component
// const NoteSidebarItem = ({ note, isSelected, onSelect, onDelete, onShare, getNoteIcon }) => {
//   const [showTooltip, setShowTooltip] = useState(false);
//   const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

//   const handleMouseEnter = (e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     setTooltipPosition({
//       top: rect.top + window.scrollY,
//       left: rect.right + window.scrollX + 8
//     });
//     setShowTooltip(true);
//   };

//   const handleMouseLeave = () => {
//     setShowTooltip(false);
//   };

//   const handleDelete = (e) => {
//     onDelete(note.id, e);
//   };

//   const handleShare = (e) => {
//     onShare(note, e);
//   };

//   return (
//     <>
//       <div
//         onClick={() => onSelect(note)}
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//         className={`p-3 rounded-lg cursor-pointer transition-all mb-1 group relative ${
//           isSelected
//             ? 'bg-indigo-600 text-white shadow-lg'
//             : 'bg-[#252837] text-gray-300 hover:bg-[#2d3142]'
//         } ${!note.canView ? 'opacity-50 cursor-not-allowed' : ''}`}
//       >
//         <div className="flex items-start gap-3">
//           {/* Note Icon */}
//           <div className={`flex-shrink-0 mt-0.5 ${
//             isSelected ? 'text-white' : 'text-gray-400'
//           }`}>
//             {getNoteIcon(note)}
//           </div>
          
//           {/* Note Content */}
//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between gap-2">
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-medium truncate text-sm text-white">
//                   {note.title || "Untitled Note"}
//                 </h3>
                
               
//               </div>
              
//               {/* Action buttons - permanently visible for owner's notes */}
//               {note.isOwner && (
//                 <div className="flex items-center gap-1 flex-shrink-0 ml-2">
//                   <button
//                     onClick={handleShare}
//                     className="text-gray-400 hover:text-indigo-400 p-1 transition-colors"
//                     title="Share note"
//                   >
//                     <Users className="w-3.5 h-3.5" />
//                   </button>
                  
//                   <button
//                     onClick={handleDelete}
//                     className="text-gray-400 hover:text-red-400 p-1 transition-colors"
//                     title="Delete note"
//                   >
//                     <Trash2 className="w-3.5 h-3.5" />
//                   </button>
//                 </div>
//               )}
//             </div>
            
          
//           </div>
//         </div>
//       </div>

//       {/* Hover Tooltip */}
//       {showTooltip && (
//         <div 
//           className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 min-w-48 pointer-events-none"
//           style={{
//             top: `${tooltipPosition.top}px`,
//             left: `${tooltipPosition.left}px`,
//             transform: 'translateY(-50%)'
//           }}
//         >
//           <div className="space-y-2">
           
//             <div className="space-y-1.5">
//               <div className="flex items-center gap-2 text-gray-300">
//                 <Calendar className="w-3 h-3" />
//                 <span>Created: {formatDate(note.created_at)}</span>
//               </div>
//               <div className="flex items-center gap-2 text-gray-300">
//                 <Calendar className="w-3 h-3" />
//                 <span>Modified: {formatDate(note.updated_at)}</span>
//               </div>
              
//               {/* Role Badge in Tooltip */}
//               <div className="flex items-center gap-2 text-gray-300">
//                 <div className={`w-2 h-2 rounded-full ${
//                   note.userRole === 'owner' ? 'bg-purple-400' :
//                   note.userRole === 'editor' ? 'bg-blue-400' :
//                   'bg-gray-400'
//                 }`} />
//                 <span className="capitalize">
//                   {note.userRole === 'owner' ? 'Owner' : 
//                    note.userRole === 'editor' ? 'Can Edit' : 
//                    'Can View'}
//                 </span>
//               </div>

//               {/* Note Type in Tooltip */}
//               <div className="flex items-center gap-2 text-gray-300">
//                 <div className={`w-2 h-2 rounded-full ${
//                   note.noteType === 'private' ? 'bg-blue-400' :
//                   note.noteType === 'shared-by-me' ? 'bg-green-400' :
//                   'bg-purple-400'
//                 }`} />
//                 <span className="capitalize">
//                   {note.noteType === 'shared-by-me' ? 'Shared by you' : 
//                    note.noteType === 'shared-with-me' ? 'Shared with you' : 
//                    'Private note'}
//                 </span>
//               </div>

//               {note.noteType === 'shared-with-me' && (
//                 <div className="flex items-center gap-2 text-gray-300">
//                   <User className="w-3 h-3" />
//                   <span>Shared by: {note.sharedBy}</span>
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {/* Tooltip arrow */}
//           <div 
//             className="absolute top-1/2 -left-2 transform -translate-y-1/2"
//             style={{
//               width: 0,
//               height: 0,
//               borderTop: '6px solid transparent',
//               borderBottom: '6px solid transparent',
//               borderRight: '6px solid #374151'
//             }}
//           />
//         </div>
//       )}
//     </>
//   );
// };

// // Loading Skeleton Component
// const NotesLoadingSkeleton = () => (
//   <div className="p-4 space-y-3">
//     {[...Array(8)].map((_, i) => (
//       <div key={i} className="bg-[#252837] rounded-lg p-3 animate-pulse">
//         <div className="flex items-center gap-3">
//           <div className="w-4 h-4 bg-gray-700 rounded"></div>
//           <div className="h-4 bg-gray-700 rounded flex-1"></div>
//         </div>
//       </div>
//     ))}
//   </div>
// );

// // Empty State Component
// const EmptyNotesState = ({ searchQuery, currentSection, onCreateNote, getSectionTitle }) => (
//   <div className="p-4 text-center">
//     <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
//     <p className="text-gray-400 text-sm mb-4">
//       {searchQuery ? 'No notes found' : `No ${getSectionTitle().toLowerCase()} yet`}
//     </p>
//     {!searchQuery && currentSection === 'all' && (
//       <button
//         onClick={onCreateNote}
//         className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
//       >
//         Create your first note
//       </button>
//     )}
//     {!searchQuery && currentSection === 'shared-by-me' && (
//       <p className="text-gray-500 text-xs">
//         Notes you share with others will appear here
//       </p>
//     )}
//   </div>
// );

// // Date formatting helper function
// const formatDate = (dateString) => {
//   return new Date(dateString).toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric'
//   });
// };



// export default NotesSidebar;




"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Plus, FileText, Search, Folder, Users, Lock, Share2, Calendar, User, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import ShareModal from "./shareModal";

const NotesSidebar = ({ sidebarCollapsed, currentUser }) => {
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  const getCurrentSection = () => {
    if (pathname.includes('/private-notes')) return 'private';
    if (pathname.includes('/shared-by-me')) return 'shared-by-me';
    if (pathname.includes('/shared-with-me')) return 'shared-with-me';
    return 'all';
  };

  const currentSection = getCurrentSection();
  const isNotePage = pathname.includes('/notes/') && !pathname.includes('/notes/new');
  const noteId = isNotePage ? pathname.split('/notes/')[1] : null;

  useEffect(() => {
    if (currentUser) {
      fetchAllNotes();
    }
  }, [currentUser]);

  const fetchAllNotes = async () => {
    try {
      setLoading(true);
      
      if (!currentUser) {
        setAllNotes([]);
        return;
      }

      const { data: ownedNotes, error: ownedError } = await supabase
        .from('notes')
        .select('*')
        .eq('owner_id', currentUser.id)
        .order('updated_at', { ascending: false });

      if (ownedError) {
        console.error('Error fetching owned notes:', ownedError);
        throw ownedError;
      }

      const { data: sharedWithMe, error: sharedError } = await supabase
        .from('note_shares')
        .select(`
          note_id,
          role,
          notes:note_id (
            *,
            owner:user_profiles!fk_notes_owner_id(email, name)
          )
        `)
        .eq('user_id', currentUser.id);

      let notesData = [];

      if (ownedNotes) {
        for (const note of ownedNotes) {
          const { data: noteShares, error: sharesError } = await supabase
            .from('note_shares')
            .select('id')
            .eq('note_id', note.id);

          const hasShares = noteShares && noteShares.length > 0;
          
          notesData.push({
            ...note,
            userRole: 'owner',
            noteType: hasShares ? 'shared-by-me' : 'private',
            canView: true,
            canEdit: true,
            sharedBy: currentUser.name || currentUser.email || 'You',
            isOwner: true
          });
        }
      }

      if (!sharedError && sharedWithMe) {
        const sharedNotesProcessed = sharedWithMe.map(share => ({
          ...share.notes,
          userRole: share.role,
          noteType: 'shared-with-me',
          sharedBy: share.notes.owner?.name || share.notes.owner?.email || 'Unknown User',
          canView: true,
          canEdit: share.role === 'editor' || share.role === 'owner',
          isOwner: false
        }));

        sharedNotesProcessed.forEach(note => {
          if (!notesData.find(n => n.id === note.id)) {
            notesData.push(note);
          }
        });
      }

      setAllNotes(notesData);

    } catch (error) {
      console.error('Error fetching notes:', error);
      setAllNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNotes = () => {
    let filteredBySection = allNotes;

    switch (currentSection) {
      case 'private':
        filteredBySection = allNotes.filter(note => note.noteType === 'private');
        break;
      case 'shared-by-me':
        filteredBySection = allNotes.filter(note => note.noteType === 'shared-by-me');
        break;
      case 'shared-with-me':
        filteredBySection = allNotes.filter(note => note.noteType === 'shared-with-me');
        break;
      case 'all':
      default:
        filteredBySection = allNotes.filter(note => note.canView);
        break;
    }

    return filteredBySection.filter(note =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        throw error;
      }

      await fetchAllNotes();
      
      if (noteId === noteId) {
        router.push('/notes');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleShareNote = (note, e) => {
    e.stopPropagation();
    setSelectedNote(note);
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setSelectedNote(null);
  };

  const filteredNotes = getFilteredNotes();

  const handleCreateNote = () => {
    router.push('/notes/new');
  };

  const handleNoteSelect = (note) => {
    if (note.canView) {
      router.push(`/notes/${note.id}`);
    }
  };

  const getNoteIcon = (note) => {
    switch (note.noteType) {
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'shared-by-me':
        return <Share2 className="w-4 h-4" />;
      case 'shared-with-me':
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'private':
        return 'Private Notes';
      case 'shared-by-me':
        return 'Shared By Me';
      case 'shared-with-me':
        return 'Shared With Me';
      default:
        return 'All Notes';
    }
  };

  const getSectionStats = () => {
    switch (currentSection) {
      case 'private':
        return `${filteredNotes.length} private notes`;
      case 'shared-by-me':
        return `${filteredNotes.length} shared notes`;
      case 'shared-with-me':
        return `${filteredNotes.length} notes shared with you`;
      default:
        return `${filteredNotes.length} total notes`;
    }
  };

  return (
    <>
      <div className={`bg-[#F5F5F5] border-r border-[#E0E0E0] transition-all duration-300 ${
        sidebarCollapsed ? 'w-0' : 'w-80'
      } flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E0E0E0]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-[#2E2E2E] flex items-center gap-2">
              <Folder className="w-4 h-4" />
              {getSectionTitle()}
            </h2>
            <button
              onClick={handleCreateNote}
              className="bg-[#B22222] hover:bg-[#8B0000] text-white p-2 rounded transition-colors"
              title="Create new note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#999999] w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-[#2E2E2E] pl-10 pr-4 py-2 rounded border border-[#E0E0E0] focus:outline-none focus:ring-1 focus:ring-[#B22222] focus:border-[#B22222] text-sm"
            />
          </div>

          {/* Stats */}
          <div className="mt-3">
            <p className="text-xs text-[#999999]">{getSectionStats()}</p>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <NotesLoadingSkeleton />
          ) : filteredNotes.length > 0 ? (
            <div className="p-2">
              {filteredNotes.map((note) => (
                <NoteSidebarItem
                  key={note.id}
                  note={note}
                  isSelected={noteId === note.id}
                  onSelect={handleNoteSelect}
                  onDelete={handleDeleteNote}
                  onShare={handleShareNote}
                  getNoteIcon={getNoteIcon}
                />
              ))}
            </div>
          ) : (
            <EmptyNotesState 
              searchQuery={searchQuery}
              currentSection={currentSection}
              onCreateNote={handleCreateNote}
              getSectionTitle={getSectionTitle}
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      {selectedNote && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={handleCloseShareModal}
          noteTitle={selectedNote.title || "Untitled Note"}
          noteId={selectedNote.id}
        />
      )}
    </>
  );
};

const NoteSidebarItem = ({ note, isSelected, onSelect, onDelete, onShare, getNoteIcon }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.top + window.scrollY,
      left: rect.right + window.scrollX + 8
    });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleDelete = (e) => {
    onDelete(note.id, e);
  };

  const handleShare = (e) => {
    onShare(note, e);
  };

  return (
    <>
      <div
        onClick={() => onSelect(note)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`p-3 rounded cursor-pointer transition-all mb-1 group relative ${
          isSelected
            ? 'bg-[#E8E8E8] text-[#2E2E2E]'
            : 'bg-white text-[#2E2E2E] hover:bg-[#FAFAFA]'
        } ${!note.canView ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 mt-0.5 ${
            isSelected ? 'text-[#2E2E2E]' : 'text-[#666666]'
          }`}>
            {getNoteIcon(note)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-normal truncate text-sm text-[#2E2E2E]">
                  {note.title || "Untitled Note"}
                </h3>
              </div>
              
              {note.isOwner && (
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={handleShare}
                    className="text-[#666666] hover:text-[#2E2E2E] p-1 transition-colors"
                    title="Share note"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="text-[#666666] hover:text-[#B22222] p-1 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Updated Tooltip with Light Theme */}
      {showTooltip && (
        <div 
          className="fixed z-50 bg-white text-[#2E2E2E] text-xs rounded-lg p-3 shadow-xl border border-[#E0E0E0] min-w-48 pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#666666]">
                <Calendar className="w-3 h-3" />
                <span>Created: {formatDate(note.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-[#666666]">
                <Calendar className="w-3 h-3" />
                <span>Modified: {formatDate(note.updated_at)}</span>
              </div>
              
              {/* Role Badge in Tooltip */}
              <div className="flex items-center gap-2 text-[#666666]">
                <div className={`w-2 h-2 rounded-full ${
                  note.userRole === 'owner' ? 'bg-[#B22222]' :
                  note.userRole === 'editor' ? 'bg-[#4A90E2]' :
                  'bg-[#999999]'
                }`} />
                <span className="capitalize">
                  {note.userRole === 'owner' ? 'Owner' : 
                   note.userRole === 'editor' ? 'Can Edit' : 
                   'Can View'}
                </span>
              </div>

              {/* Note Type in Tooltip */}
              <div className="flex items-center gap-2 text-[#666666]">
                <div className={`w-2 h-2 rounded-full ${
                  note.noteType === 'private' ? 'bg-[#4A90E2]' :
                  note.noteType === 'shared-by-me' ? 'bg-[#50C878]' :
                  'bg-[#B22222]'
                }`} />
                <span className="capitalize">
                  {note.noteType === 'shared-by-me' ? 'Shared by you' : 
                   note.noteType === 'shared-with-me' ? 'Shared with you' : 
                   'Private note'}
                </span>
              </div>

              {note.noteType === 'shared-with-me' && (
                <div className="flex items-center gap-2 text-[#666666]">
                  <User className="w-3 h-3" />
                  <span>Shared by: {note.sharedBy}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tooltip arrow */}
          <div 
            className="absolute top-1/2 -left-2 transform -translate-y-1/2"
            style={{
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '6px solid #E0E0E0'
            }}
          />
        </div>
      )}
    </>
  );
};

const NotesLoadingSkeleton = () => (
  <div className="p-4 space-y-3">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-white rounded p-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#E0E0E0] rounded"></div>
          <div className="h-4 bg-[#E0E0E0] rounded flex-1"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyNotesState = ({ searchQuery, currentSection, onCreateNote, getSectionTitle }) => (
  <div className="p-4 text-center">
    <FileText className="w-12 h-12 text-[#999999] mx-auto mb-3" />
    <p className="text-[#666666] text-sm mb-4">
      {searchQuery ? 'No notes found' : `No ${getSectionTitle().toLowerCase()} yet`}
    </p>
    {!searchQuery && currentSection === 'all' && (
      <button
        onClick={onCreateNote}
        className="bg-[#B22222] hover:bg-[#8B0000] text-white px-4 py-2 rounded text-sm transition-colors"
      >
        Create your first note
      </button>
    )}
    {!searchQuery && currentSection === 'shared-by-me' && (
      <p className="text-[#999999] text-xs">
        Notes you share with others will appear here
      </p>
    )}
  </div>
);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default NotesSidebar;