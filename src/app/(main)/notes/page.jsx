
// import { Suspense } from 'react';
// import AllNotes from '../../../components/allNotes';
// import NotesLoading from '../../../components/skeletons/notesLoading';

// export default function NotesPage() {
//   return (
//     <main className="flex-1 overflow-y-auto min-h-screen bg-[#1a1b23]">
//       <div className="max-w-7xl mx-auto p-8">
//         <Suspense fallback={
//           <div>
         
//             <div className="mb-8">
//               <div className="h-8 bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
//               <div className="h-4 bg-gray-700 rounded w-96 animate-pulse"></div>
//             </div>
           
//             <NotesLoading count={6} />
//           </div>
//         }>
//           <AllNotes />
//         </Suspense>
//       </div>
//     </main>
//   );
// }

import { Suspense } from 'react';
import NotesLoading from '../../../components/skeletons/notesLoading';
import { FileText, Plus, Search } from 'lucide-react';

export default function NotesPage() {
  return (
    <main className="flex-1 overflow-y-auto h-full bg-[#1a1b23]">
      <div className="h-full flex items-center justify-center">
        <Suspense fallback={
          <div className="w-full max-w-2xl p-8">
            <NotesLoading count={6} />
          </div>
        }>
          <AllNotesWelcome />
        </Suspense>
      </div>
    </main>
  );
}

const AllNotesWelcome = () => {
  return (
    <div className="text-center max-w-md mx-auto p-8">
      <div className="bg-[#252837] rounded-2xl p-8 border border-gray-700">
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">All Your Notes</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Browse all your notes in the sidebar - private notes, notes you've shared, 
          and notes shared with you. Select any note to view or edit it.
        </p>
        <div className="space-y-3 text-xs text-gray-500 text-left">
          <div className="flex items-center gap-3">
            <Plus className="w-4 h-4" />
            <p>Create new notes with the + button</p>
          </div>
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4" />
            <p>Search across all your notes instantly</p>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4" />
            <p>Different icons show note types and permissions</p>
          </div>
        </div>
      </div>
    </div>
  );
};