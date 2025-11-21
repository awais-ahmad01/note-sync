// import { Suspense } from "react";
// import NotesLoading from '../../../components/skeletons/notesLoading';
// import SharedWithMeNotesContent from "../../../components/sharedWithMe";

// const SharedWithMeNotes = () => {
//   return (
//     <main className="flex-1 overflow-y-auto min-h-screen bg-[#1a1b23]">
//       <div className="max-w-7xl mx-auto p-8">
//         <Suspense fallback={<NotesLoading count={6} />}>
//           <SharedWithMeNotesContent />
//         </Suspense>
//       </div>
//     </main>
//   );
// };

// export default SharedWithMeNotes;





import { Suspense } from "react";
import NotesLoading from '../../../components/skeletons/notesLoading';
import { Users, Bell } from 'lucide-react';

const SharedWithMeNotes = () => {
  return (
    <main className="flex-1 overflow-y-auto h-full bg-[#1a1b23]">
      <div className="h-full flex items-center justify-center">
        <Suspense fallback={<NotesLoading count={6} />}>
          <SharedWithMeWelcome />
        </Suspense>
      </div>
    </main>
  );
};

const SharedWithMeWelcome = () => {
  return (
    <div className="text-center max-w-md mx-auto p-8">
      <div className="bg-[#252837] rounded-2xl p-8 border border-gray-700">
        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Notes Shared With You</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          These are notes that others have shared with you. Your access level 
          (view or edit) is shown for each note in the sidebar.
        </p>
        <div className="space-y-3 text-xs text-gray-500 text-left">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4" />
            <p>Real-time updates when new notes are shared</p>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4" />
            <p>See who shared each note with you</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedWithMeNotes;